import { defineEventHandler, getQuery, createError } from "h3";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import tz from "dayjs/plugin/timezone";
import prisma from "~~/lib/prisma";

dayjs.extend(utc);
dayjs.extend(tz);
dayjs.tz.setDefault("Europe/Brussels");

type Cdr = {
  begin_time: string;
  duration?: number;
  rate?: { direction?: "inbound" | "outbound"; rate?: number | string };
  cost?: number | string;
  category?: string;
  additional_info?: {
    NumberType?: string;
    billing_category?: string;
  };
  cdr_attr?: { ["X-sipuser"]?: string };
  description?: string;
};

// ---------- money helpers ----------
const MICRO = 1_000_000n;
const toMicro = (v?: number | string) => {
  if (v === undefined || v === null) return 0n;
  const s = typeof v === "number" ? v.toString() : v;
  const [a, b = ""] = s.split(".");
  const frac = (b + "000000").slice(0, 6);
  return BigInt(a) * MICRO + BigInt(frac);
};
const microToStr = (x: bigint) => {
  const neg = x < 0n;
  const v = neg ? -x : x;
  const i = v / MICRO;
  const f = (v % MICRO).toString().padStart(6, "0");
  return `${neg ? "-" : ""}${i}.${f}`;
};
const applyPct = (base: bigint, pct: number) => {
  const SCALE = 10_000n;
  const factor = SCALE + BigInt(Math.round(pct * 100));
  return (base * factor) / SCALE;
};

// ---------- call type ----------
function callTypeOf(
  c: Cdr
): "natio_mob" | "natio_fix" | "inter_mob" | "inter_fix" {
  const cat = (c.category || "").toLowerCase();
  const bill = (c.additional_info?.billing_category || "").toLowerCase();
  const num = (c.additional_info?.NumberType || "").toUpperCase();

  const isNat = cat === "national" || bill.startsWith("national");
  const isInt =
    cat === "international" ||
    bill.startsWith("europe") ||
    bill.startsWith("international") ||
    bill.startsWith("expensive");
  const isMob = num === "MOBILE";
  const isFix = num === "FIXED_LINE";

  if (isNat && isMob) return "natio_mob";
  else if (isNat && isFix) return "natio_fix";
  else if (isInt && isMob) return "inter_mob";
  else if (isInt && isFix) return "inter_fix";
  else if (isNat) return "natio_fix";
  else return "inter_fix";
}

function normalizeCategory(cat?: string) {
  const c = (cat || "").toLowerCase();
  if (c === "expensive") return "international";
  if (c === "international") return "international";
  if (c === "national") return "national";
  return "national";
}

function normalizeNumberType(nt?: string) {
  const t = (nt || "UNKNOWN").toUpperCase();
  if (t === "MOBILE") return "MOBILE";
  return "FIXED_LINE";
}

//select pct to apply to the final cost
function pickPctForCdr(
  cdr: Cdr,
  pct: {
    natio_mob: number;
    natio_fix: number;
    inter_mob: number;
    inter_fix: number;
  }
): number {
  const cat = normalizeCategory(cdr.category); // "national" | "international"
  const num = normalizeNumberType(cdr.additional_info?.NumberType); // "MOBILE" | "FIXED_LINE"

  if (cat === "international")
    return num === "MOBILE" ? pct.inter_mob : pct.inter_fix;
  // national
  return num === "MOBILE" ? pct.natio_mob : pct.natio_fix;
}

// ---------- agg ----------
type Agg = {
  customerId: number;
  customerName: string;
  callCount: number;
  totalDurationSec: number;
  totalBase: bigint;
  totalBilled: bigint;
  base_natio_mob: bigint;
  bill_natio_mob: bigint;
  base_natio_fix: bigint;
  bill_natio_fix: bigint;
  base_inter_mob: bigint;
  bill_inter_mob: bigint;
  base_inter_fix: bigint;
  bill_inter_fix: bigint;
  count_natio_mob: number;
  count_natio_fix: number;
  count_inter_mob: number;
  count_inter_fix: number;
  time_natio_mob: number;
  time_natio_fix: number;
  time_inter_mob: number;
  time_inter_fix: number;
};
const newAgg = (id: number, name: string): Agg => ({
  customerId: id,
  customerName: name,
  callCount: 0,
  totalDurationSec: 0,
  totalBase: 0n,
  totalBilled: 0n,
  base_natio_mob: 0n,
  bill_natio_mob: 0n,
  base_natio_fix: 0n,
  bill_natio_fix: 0n,
  base_inter_mob: 0n,
  bill_inter_mob: 0n,
  base_inter_fix: 0n,
  bill_inter_fix: 0n,
  count_natio_mob: 0,
  count_natio_fix: 0,
  count_inter_mob: 0,
  count_inter_fix: 0,
  time_natio_mob: 0,
  time_natio_fix: 0,
  time_inter_mob: 0,
  time_inter_fix: 0,
});

// ---------- SIP map ----------
async function loadSipMap(onlyCustomerIds?: Set<number>) {
  const sipLines = await prisma.sipLine.findMany({
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          natioMobPourcent: true,
          natioFixPourcent: true,
          interMobPourcent: true,
          interFixPourcent: true,
        },
      },
    },
  });
  const map = new Map<
    string,
    {
      customerId: number;
      customerName: string;
      pct: {
        natio_mob: number;
        natio_fix: number;
        inter_mob: number;
        inter_fix: number;
      };
    }
  >();
  for (const s of sipLines) {
    if (onlyCustomerIds && !onlyCustomerIds.has(s.customerId)) continue;
    map.set(s.descriptionName, {
      customerId: s.customerId,
      customerName: s.customer.name,
      pct: {
        natio_mob: s.customer.natioMobPourcent,
        natio_fix: s.customer.natioFixPourcent,
        inter_mob: s.customer.interMobPourcent,
        inter_fix: s.customer.interFixPourcent,
      },
    });
  }
  return map;
}

// ---------- Sewan API ----------
async function sewanLogin() {
  const url = process.env.SEWAN_LOGIN_URL || "https://sbcng.sewan.be/api/login";
  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: process.env.SEWAN_USER,
      password: process.env.SEWAN_PASSWORD,
    }),
  });

  if (!resp.ok) throw new Error(`Login Sewan failed (${resp.status})`);
  const js = await resp.json();
  if (!js?.token) throw new Error("No token from Sewan");
  return js.token as string;
}

async function sewanRequestExport(
  token: string,
  startDate: string,
  stopDate: string,
  exportFormat = "json"
) {
  const url = process.env.SEWAN_CDR_URL || "https://sbcng.sewan.be/api/cdr/";
  const resp = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      start_date: startDate,
      stop_date: stopDate,
      export_format: exportFormat,
    }),
  });

  if (!resp.ok) throw new Error(`CDR generation failed (${resp.status})`);
  const js = await resp.json();
  if (!js?.file_reference) throw new Error("No file_reference from Sewan");
  return js.file_reference as string;
}

async function sewanPollForFile(
  token: string,
  fileRef: string,
  { timeoutMs = 10 * 60 * 1000 } = {}
) {
  const listUrl =
    process.env.SEWAN_CDR_URL || "https://sbcng.sewan.be/api/cdr/";
  const headers = { Authorization: `Token ${token}` };
  const start = Date.now();
  let attempt = 0;

  while (Date.now() - start < timeoutMs) {
    attempt++;
    const resp = await fetch(listUrl, { headers });
    if (!resp.ok) throw new Error(`CDR list failed (${resp.status})`);
    const list = await resp.json();
    const match = Array.isArray(list)
      ? list.find((x: any) => x.file_reference === fileRef)
      : null;

    if (match?.file_status === 2 && match?.download_link) {
      const base = process.env.SEWAN_BASE_URL || "https://sbcng.sewan.be";
      return `${base}${match.download_link}` as string;
    }
    await new Promise((r) => setTimeout(r, Math.min(1000 * attempt, 10000)));
  }
  throw new Error("Timeout waiting for Sewan file ready");
}

export default defineEventHandler(async (event) => {
  const { customers } = getQuery(event) as { customers?: string };
  const allowedIds = customers
    ? new Set(
        customers
          .split(",")
          .map((s) => parseInt(s.trim(), 10))
          .filter((n) => !Number.isNaN(n))
      )
    : undefined;

  // mois courant
  const monthStart = dayjs().tz().subtract(1, "month").startOf("month");
  const monthEnd = monthStart.add(1, "month");
  const startDate = monthStart.format("YYYY-MM-01");
  const stopDate = monthEnd.format("YYYY-MM-01");
  const monthKey = monthStart.toDate();

  // const startDate = "2025-08-01";
  // const stopDate = "2025-09-1";

  // map SIP
  const sipMap = await loadSipMap(allowedIds);
  if (sipMap.size === 0)
    throw createError({
      statusCode: 400,
      statusMessage: "No SIP/customer mapping found",
    });

  // login + export + poll
  const token = await sewanLogin();
  const fileRef = await sewanRequestExport(token, startDate, stopDate, "json");
  const downloadUrl = await sewanPollForFile(token, fileRef);
  if (!downloadUrl)
    throw createError({
      statusCode: 502,
      statusMessage: "Failed to generate CDR link",
    });

  // download JSON & stream parse
  const resp = await fetch(downloadUrl, {
    headers: { Authorization: `Token ${token}` },
  });
  if (!resp.ok || !resp.body)
    throw createError({
      statusCode: 502,
      statusMessage: `Download CDR failed (${resp.status})`,
    });

  const aggByCustomer = new Map<number, Agg>();
  let total = 0,
    outbound = 0,
    kept = 0;

  const jsonCdr = await resp.json();

  for await (const cdr of jsonCdr as unknown as AsyncIterable<Cdr>) {
    total++;
    if (cdr?.rate?.direction !== "outbound") continue; // payant only
    outbound++;

    const sipUser = cdr?.description;
    if (!sipUser) continue;
    const link = sipMap.get(sipUser);
    if (!link) continue;

    // const t = dayjs(cdr.begin_time);
    // if (!t.isValid() || t.isBefore(monthStart) || !t.isBefore(monthEnd))
    //   continue;

    const ratePerMin = Number(cdr.rate?.rate ?? 0);
    const durationSec = cdr.duration ?? 0;
    if (durationSec === 0 || ratePerMin === 0) continue;

    const minutes = Math.ceil(durationSec / 60);

    const baseOperator = toMicro(cdr.cost);
    const baseFromRate =
      BigInt(Math.round(ratePerMin * 1_000_000)) * BigInt(minutes);

    const pct = pickPctForCdr(cdr, link.pct);
    const billed = applyPct(baseFromRate, pct);

    let row = aggByCustomer.get(link.customerId);
    if (!row) {
      row = newAgg(link.customerId, link.customerName);
      aggByCustomer.set(link.customerId, row);
    }

    row.callCount++;
    row.totalDurationSec += durationSec;
    row.totalBase += baseOperator; // ce que te facture l'opérateur
    row.totalBilled += billed; // ce que tu factures au client

    const type = callTypeOf(cdr);
    if (type === "natio_mob") {
      row.base_natio_mob += baseOperator;
      row.bill_natio_mob += billed;
      row.count_natio_mob++;
      row.time_natio_mob += durationSec;
    } else if (type === "natio_fix") {
      row.base_natio_fix += baseOperator;
      row.bill_natio_fix += billed;
      row.count_natio_fix++;
      row.time_natio_fix += durationSec;
    } else if (type === "inter_mob") {
      row.base_inter_mob += baseOperator;
      row.bill_inter_mob += billed;
      row.count_inter_mob++;
      row.time_inter_mob += durationSec;
    } else {
      // inter_fix
      row.base_inter_fix += baseOperator;
      row.bill_inter_fix += billed;
      row.count_inter_fix++;
      row.time_inter_fix += durationSec;
    }
  }

  // upsert APRÈS la boucle (bien plus rapide)
  await prisma.$transaction(async (tx) => {
    for (const r of aggByCustomer.values()) {
      await tx.monthlyCdrSummary.upsert({
        where: {
          customerId_month: { customerId: r.customerId, month: monthKey },
        },
        create: {
          customerId: r.customerId,
          month: monthKey,
          callCount: r.callCount,
          totalDurationSec: r.totalDurationSec,
          totalBaseCost: microToStr(r.totalBase),
          totalBilledCost: microToStr(r.totalBilled),
          base_natio_mob: microToStr(r.base_natio_mob),
          base_natio_fix: microToStr(r.base_natio_fix),
          base_inter_mob: microToStr(r.base_inter_mob),
          base_inter_fix: microToStr(r.base_inter_fix),
          bill_natio_mob: microToStr(r.bill_natio_mob),
          bill_natio_fix: microToStr(r.bill_natio_fix),
          bill_inter_mob: microToStr(r.bill_inter_mob),
          bill_inter_fix: microToStr(r.bill_inter_fix),
          count_natio_mob: r.count_natio_mob,
          count_natio_fix: r.count_natio_fix,
          count_inter_mob: r.count_inter_mob,
          count_inter_fix: r.count_inter_fix,
          time_natio_mob: r.time_natio_mob,
          time_natio_fix: r.time_natio_fix,
          time_inter_mob: r.time_inter_mob,
          time_inter_fix: r.time_inter_fix,
        },
        update: {
          callCount: r.callCount,
          totalDurationSec: r.totalDurationSec,
          totalBaseCost: microToStr(r.totalBase),
          totalBilledCost: microToStr(r.totalBilled),
          base_natio_mob: microToStr(r.base_natio_mob),
          base_natio_fix: microToStr(r.base_natio_fix),
          base_inter_mob: microToStr(r.base_inter_mob),
          base_inter_fix: microToStr(r.base_inter_fix),
          bill_natio_mob: microToStr(r.bill_natio_mob),
          bill_natio_fix: microToStr(r.bill_natio_fix),
          bill_inter_mob: microToStr(r.bill_inter_mob),
          bill_inter_fix: microToStr(r.bill_inter_fix),
          count_natio_mob: r.count_natio_mob,
          count_natio_fix: r.count_natio_fix,
          count_inter_mob: r.count_inter_mob,
          count_inter_fix: r.count_inter_fix,
          time_natio_mob: r.time_natio_mob,
          time_natio_fix: r.time_natio_fix,
          time_inter_mob: r.time_inter_mob,
          time_inter_fix: r.time_inter_fix,
        },
      });
    }
  });

  console.log("finish");
  return {
    month: monthStart.format("YYYY-MM"),
    startDate,
    stopDate,
    totalCdr: total,
    outboundCdr: outbound,
    keptInCurrentMonth: kept,
    customersAggregated: aggByCustomer.size,
    filteredCustomers: allowedIds ? Array.from(allowedIds) : "all",
    fileRef,
  };
});
