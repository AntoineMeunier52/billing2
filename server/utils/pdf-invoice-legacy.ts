import PDFDocument from "pdfkit";
import fs from "node:fs";
import path from "node:path";

export type LegacyBillingBlock = {
  national: {
    FIXED_LINE: { number_of_calls: number; total_times: number; costs: number };
    MOBILE: { number_of_calls: number; total_times: number; costs: number };
  };
  international: {
    FIXED_LINE: { number_of_calls: number; total_times: number; costs: number };
    MOBILE: { number_of_calls: number; total_times: number; costs: number };
  };
};

export type LegacyInvoiceInput = {
  customer: {
    name: string;
    address: string;
  };
  month: {
    yearMonth: string;
    fromDash: string; // e.g. "01-08-2025"
    toDash: string; // e.g. "31-08-2025"
    fromSlash: string; // e.g. "01/08/2025"
    toSlash: string; // e.g. "31/08/2025"
  };
  subscription: Array<{ name: string; price: number }>;
  ddi: {
    count: number;
    price: number;
  };
  ddiPricingRule: number;
  billing: LegacyBillingBlock;
  totalConsumption: number;
  logoPath?: string; // optionnel
  outDirBase: string;
};

function euro(n: number) {
  return `${n.toFixed(2)}€`;
}

export async function writeLegacyInvoicePDF(data: LegacyInvoiceInput) {
  const base = data.outDirBase.replace(/\/$/, "");
  const outDir = path.join(base, data.month.yearMonth);
  await fs.promises.mkdir(outDir, { recursive: true });

  const filename = `${data.customer.name.replace(/[^\w-]+/g, "_")}_${
    data.month.yearMonth
  }.pdf`;
  const outPath = path.join(outDir, filename);
  const doc = new PDFDocument({
    size: "A4",
    info: {
      Title: "Billing",
      Author: "Axians",
      Subject: "Billing of the month",
    },
  });
  const stream = fs.createWriteStream(outPath);
  doc.pipe(stream);

  // helpers write pdf
  const WriteText = (text: string, color: string, y: number, x: number) => {
    doc.fontSize(10).fillColor(color).text(text, x, y, { lineBreak: false });
  };
  const WriteAddress = (text: string, color: string, y: number, x: number) => {
    doc.fontSize(10).fillColor(color).text(text, x, y);
  };
  const WriteTitleH1 = (text: string, color: string, y: number, x: number) => {
    doc.fontSize(20).fillColor(color).text(text, x, y, { lineBreak: false });
  };
  const WriteTitleH2 = (text: string, color: string, y: number, x: number) => {
    doc.fontSize(15).fillColor(color).text(text, x, y, { lineBreak: false });
  };
  const WriteTitleH3 = (text: string, color: string, y: number, x: number) => {
    doc.fontSize(12).fillColor(color).text(text, x, y, { lineBreak: false });
  };
  const drawLine = (
    color: string,
    y: number,
    x: number,
    h: number,
    w: number
  ) => {
    doc.rect(x, y, w, h).fillAndStroke(color);
  };

  if (data.logoPath && fs.existsSync(data.logoPath)) {
    doc.image(data.logoPath, 25, 20, { width: 150 });
  }

  // Title and Dates
  WriteTitleH1("Invoice:", "black", 20, 430);
  WriteTitleH3(`FROM: ${data.month.fromDash}`, "black", 45, 430);
  WriteTitleH3(`TO: ${data.month.toDash}`, "black", 60, 430);

  // Adresses
  WriteAddress("Axians SA\nKruiskouter 1\n1730 Asse\nBELGIUM", "black", 80, 30);
  WriteAddress(data.customer.address, "black", 68, 430);

  //subscriptions
  let y = 140;
  WriteTitleH2("Subscription:", "black", y, 30);
  drawLine("black", y + 18, 30, 0.5, 535);
  y += 22;
  WriteText("Item", "#000", y, 35);
  WriteText("Amount", "#000", y, 525);
  WriteText("Period", "#000", y, 380);
  drawLine("black", y + 12, 30, 0.5, 535);
  y += 18;

  for (const s of data.subscription) {
    doc.text(s.name, 30, y);
    doc.text(`from ${data.month.fromSlash} to ${data.month.toSlash}`, 380, y);
    doc.text(s.price.toFixed(2), 530, y);
    y += 13;
  }

  //DDI
  let ddiLineAmount = 0;
  if (data.ddi.count) {
    doc.text(`${data.ddi.count} DDIs`, 30, y);
    doc.text(`from ${data.month.fromSlash} to ${data.month.toSlash}`, 380, y);

    ddiLineAmount = data.ddi.count * data.ddi.price;
    doc.text(ddiLineAmount.toFixed(2), 530, y);
    y += 13;
  }

  // Total subscription
  drawLine("#000", y + 4, 30, 0.5, 535);
  WriteText("Total amount:", "#000", y + 8, 30);
  const totalSub =
    data.subscription.reduce((a, s) => a + s.price, 0) + ddiLineAmount;
  WriteText(`${totalSub.toFixed(2)}€`, "#000", y + 8, 530);

  //consumption
  y += 40;
  WriteTitleH2("Bill consumption:", "#000", y, 30);
  drawLine("#000", y + 18, 30, 0.5, 535);
  y += 22;
  WriteText("Number", "#000", y, 300);
  WriteText("Time (minute)", "#000", y, 400);
  WriteText("Amount", "#000", y, 530);
  drawLine("#000", y + 12, 30, 0.5, 535);
  y += 18;

  const B = data.billing;
  const lines = [
    ["National calls (fixe)", B.national.FIXED_LINE],
    ["National calls (mobile)", B.national.MOBILE],
    ["International calls (fixe)", B.international.FIXED_LINE],
    ["International calls (mobile)", B.international.MOBILE],
  ] as const;

  for (const [label, blk] of lines) {
    doc.text(label, 30, y);
    doc.text(`${blk.number_of_calls} calls`, 300, y);
    doc.text(`${blk.total_times}`, 400, y);
    WriteText(`${blk.costs.toFixed(2)}`, "#000", y, 530);
    y += 13;
  }

  drawLine("#000", y, 30, 0.5, 535);
  WriteText("Total amount:", "#000", y + 4, 30);
  WriteText(`${data.totalConsumption.toFixed(2)}€`, "#000", y + 4, 530);

  const totalAmount = totalSub + data.totalConsumption;
  y += 28;
  WriteTitleH2("Total Amount (excluding VAT)", "#000", y, 30);
  WriteTitleH2(`${totalAmount.toFixed(2)}€`, "#000", y, 500);
  drawLine("#000", y + 18, 30, 0.5, 530);

  y += 26;
  WriteTitleH3("VAT", "#000", y, 30);
  WriteTitleH3(`+ ${(totalAmount * 0.21).toFixed(2)}€`, "#000", y, 500);
  drawLine("#000", y + 16, 500, 0.5, 50);

  y += 24;
  WriteTitleH3("VAT of 21%", "#000", y, 30);
  const totalWithVat = totalAmount * 1.21;
  WriteTitleH3(`${totalWithVat.toFixed(2)}€`, "#000", y, 500);

  doc.end();
  await new Promise<void>((res, rej) => {
    stream.on("finish", () => res());
    stream.on("error", rej);
  });

  return outPath;
}
