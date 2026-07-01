// OCR boundary — typed interface + stub.
//
// Provider is Azure AI Document Intelligence (prebuilt Receipt model), chosen
// for confirmed Russian printed + handwritten support (PROJECT_STATE §3/§9).
// STANDING RULE: the Azure SDK is NEVER imported outside this module — all
// callers depend only on `extractReceipt` and these types. The real SDK wiring
// is a follow-up PR, once Supabase env vars exist; today this returns a mock.

export type Currency = "USD" | "EUR" | "MDL" | "RUB" | "PLN" | "KES" | "MXN";

export interface ReceiptExtraction {
  /** Grand total, major units (e.g. 12.34). Null when not detected. */
  amount: number | null;
  /** ISO 4217 code when detected, else null. */
  currency: Currency | null;
  /** Purchase date, ISO 8601 (YYYY-MM-DD), else null. */
  date: string | null;
  /** Merchant/vendor name as printed — NEVER translated. Null when absent. */
  vendor: string | null;
  /** Suggested spend category, else null. */
  category: string | null;
  /** Model confidence for the extraction as a whole, 0..1. */
  confidence: number;
}

export interface OcrProvider {
  extractReceipt(image: Buffer): Promise<ReceiptExtraction>;
}

/**
 * Extract structured fields from a receipt image.
 *
 * STUB: returns deterministic mock data so the capture → review flow can be
 * built and tested before the Azure integration lands. Swap the body for the
 * Azure Document Intelligence call; the signature and return shape are stable.
 */
export async function extractReceipt(
  image: Buffer,
): Promise<ReceiptExtraction> {
  void image; // real impl sends bytes to Azure DI; stub ignores them.

  return {
    amount: 12.34,
    currency: "EUR",
    date: "2026-07-01",
    vendor: "Demo Vendor",
    category: "Supplies",
    confidence: 0.5,
  };
}
