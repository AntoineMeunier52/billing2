import prisma from "~~/lib/prisma";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import tz from "dayjs/plugin/timezone";
import {
  writeLegacyInvoicePDF,
  type LegacyBillingBlock,
} from "@@/server/utils/pdf-invoice-legacy";
import type { Decimal } from "@prisma/client/runtime/library";

dayjs.extend(utc);
dayjs.extend(tz);
dayjs.tz.setDefault("Europe/Brussels");

interface SewanDdi {
  id?: string;
  did?: string;
  profile?: string;
  customer?: string;
  description?: string; // on compare avec Customer.ddiName.descriptionName
  fallback_number?: string;
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

async function getDdis(token: string): Promise<SewanDdi[]> {
  const url = process.env.SEWAN_DDI_URL || "https://sbcng.sewan.be/api/dids/";
  const resp = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!resp.ok) throw new Error(`DDI list failed (${resp.status})`);
  const js = await resp.json();
  return Array.isArray(js) ? (js as SewanDdi[]) : [];
}

// gère Decimal | string | null -> number(2 décimales)
function dec2(v?: string | null | Decimal): number {
  if (!v) return 0;
  const n =
    typeof v === "object" && v !== null && "toNumber" in v
      ? (v as any).toNumber()
      : Number(v);
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100) / 100;
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
  const monthStart = dayjs().tz().startOf("month");
  const monthEnd = monthStart.add(1, "month").subtract(1, "day"); // dernier jour inclus
  const monthKey = monthStart.toDate();

  // formats de date pour PDF/chemin
  const yearMonth = monthStart.format("YYYY-MM");
  const fromDash = monthStart.format("DD-MM-YYYY");
  const toDash = monthEnd.format("DD-MM-YYYY");
  const fromSlash = monthStart.format("DD/MM/YYYY");
  const toSlash = monthEnd.format("DD/MM/YYYY");

  // clients + subs + DDI names
  const customersList = await prisma.customer.findMany({
    where: allowedIds ? { id: { in: Array.from(allowedIds) } } : undefined,
    include: {
      subscriptions: true,
      ddiName: true,
      sipLine: true,
    },
  });
  if (!customersList.length)
    throw createError({
      statusCode: 404,
      statusMessage: "No customers found",
    });

  // agrégats mensuels
  const summaries = await prisma.monthlyCdrSummary.findMany({
    where: {
      month: monthKey,
      customerId: { in: customersList.map((c) => c.id) },
    },
  });
  const summaryByCustomer = new Map(summaries.map((s) => [s.customerId, s]));

  // DDI opérateur (une seule requête)
  const token = await sewanLogin();
  const allDdis = await getDdis(token);

  const outDirBase = process.env.PATH_TO_PDF || "./.invoices";
  const logoPath = process.env.INVOICE_LOGO_PATH;

  const generated: Array<{
    customerId: number;
    name: string;
    pdfPath: string;
  }> = [];

  for (const c of customersList) {
    const sum = summaryByCustomer.get(c.id);

    // comptage DDI pour ce client (via descriptionName)
    const wanted = new Set(c.ddiName.map((d) => d.descriptionName));
    const ddiCount = allDdis.reduce(
      (acc, d) => (d.description && wanted.has(d.description) ? acc + 1 : acc),
      0
    );

    // prix DDI depuis la DB (fallback env / 1.00)
    const ddiPrice =
      typeof c.ddiPrice === "number" && Number.isFinite(c.ddiPrice)
        ? c.ddiPrice
        : Number(process.env.DDI_PRICE_DEFAULT ?? 1.0);

    // bloc consommation (legacy)
    const B: LegacyBillingBlock = {
      national: {
        FIXED_LINE: {
          number_of_calls: sum?.count_natio_fix ?? 0,
          total_times: sum?.time_natio_fix ?? 0,
          costs: dec2(sum?.bill_natio_fix),
        },
        MOBILE: {
          number_of_calls: sum?.count_natio_mob ?? 0,
          total_times: sum?.time_natio_mob ?? 0,
          costs: dec2(sum?.bill_natio_mob),
        },
      },
      international: {
        FIXED_LINE: {
          number_of_calls: sum?.count_inter_fix ?? 0,
          total_times: sum?.time_inter_fix ?? 0,
          costs: dec2(sum?.bill_inter_fix),
        },
        MOBILE: {
          number_of_calls: sum?.count_inter_mob ?? 0,
          total_times: sum?.time_inter_mob ?? 0,
          costs: dec2(sum?.bill_inter_mob),
        },
      },
    };

    const totalConsumption =
      B.national.FIXED_LINE.costs +
      B.national.MOBILE.costs +
      B.international.FIXED_LINE.costs +
      B.international.MOBILE.costs;

    // abonnements
    const subs = c.subscriptions.map((s) => ({
      name: s.definition,
      price: s.price ?? 0,
    }));

    // adresse
    const addressLines = [
      c.address ?? "",
      `${c.postalCode ?? ""} ${c.city ?? ""}${
        c.province ? `, ${c.province}` : ""
      }`.trim(),
    ]
      .filter(Boolean)
      .join("\n");

    // génération PDF (ton writer tel quel)
    const pdfPath = await writeLegacyInvoicePDF({
      customer: { name: c.name, address: addressLines },
      month: { yearMonth, fromDash, toDash, fromSlash, toSlash },
      subscription: subs,
      ddi: { count: ddiCount, price: ddiPrice },
      // ton writer attend encore ce champ : on met 0 (non-utilisé)
      ddiPricingRule: 0,
      billing: B,
      totalConsumption,
      logoPath,
      outDirBase,
    });

    generated.push({ customerId: c.id, name: c.name, pdfPath });
  }

  return {
    month: yearMonth,
    outDir: `${(outDirBase || "").replace(/\/$/, "")}/${yearMonth}`,
    generated,
  };
});
