import { defineEventHandler } from "h3";
import generateHandler from "./generate.post";
import legacyMonthlyHandler from "./legacy-monthly.post";
import { requireAuth } from "~~/server/utils/auth";

/**
 * Combined endpoint that:
 * 1. Reads CDR data and generates monthly summaries
 * 2. Generates PDF invoices from the summaries
 */
export default defineEventHandler(async (event) => {
  requireAuth(event);

  try {
    console.log("🚀 Starting CDR generation and PDF creation...");

    // Step 1: Read CDR and generate summaries
    console.log("📊 Step 1/2: Reading CDR data and generating summaries...");
    const cdrResult = await generateHandler(event);

    console.log("✅ CDR generation completed:", {
      month: cdrResult.month,
      totalCdr: cdrResult.totalCdr,
      outboundCdr: cdrResult.outboundCdr,
      customersAggregated: cdrResult.customersAggregated,
    });

    // Step 2: Generate PDF invoices
    console.log("📄 Step 2/2: Generating PDF invoices...");
    const pdfResult = await legacyMonthlyHandler(event);

    console.log("✅ PDF generation completed:", {
      month: pdfResult.month,
      generatedCount: pdfResult.generated?.length || 0,
    });

    // Return combined results
    return {
      success: true,
      cdr: {
        month: cdrResult.month,
        startDate: cdrResult.startDate,
        stopDate: cdrResult.stopDate,
        totalCdr: cdrResult.totalCdr,
        outboundCdr: cdrResult.outboundCdr,
        keptInCurrentMonth: cdrResult.keptInCurrentMonth,
        customersAggregated: cdrResult.customersAggregated,
      },
      pdf: {
        month: pdfResult.month,
        outDir: pdfResult.outDir,
        generated: pdfResult.generated,
        generatedCount: pdfResult.generated?.length || 0,
      },
      message: `Successfully processed ${cdrResult.totalCdr} CDR records and generated ${pdfResult.generated?.length || 0} PDF invoices`,
    };
  } catch (error: any) {
    console.error("❌ Error during CDR/PDF generation:", error);

    throw createError({
      statusCode: error?.statusCode || 500,
      statusMessage: error?.statusMessage || "Failed to generate CDR and PDF",
      message: error?.message || "An unexpected error occurred",
    });
  }
});
