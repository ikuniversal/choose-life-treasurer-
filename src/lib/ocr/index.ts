// OCR boundary — typed interface + Azure AI Document Intelligence implementation.
//
// Provider is Azure AI Document Intelligence (prebuilt-receipt model), chosen for
// confirmed Russian printed + handwritten support (PROJECT_STATE §3/§9).
// STANDING RULE: the Azure integration is NEVER imported outside this module — all
// callers depend only on `extractReceipt` and these types.
//
// This module is SERVER-ONLY. The subscription key + endpoint come from server env
// (AZURE_DOCUMENT_INTELLIGENCE_KEY / _ENDPOINT); they are never sent to the client
// and never logged. On ANY failure (missing env, timeout, non-2xx, malformed body,
// analysis "failed") we return null so callers fall through to manual entry exactly
// as before — no new error state is surfaced to the member.

export type Currency = "USD" | "EUR" | "MDL" | "RUB" | "PLN" | "KES" | "MXN";

const ALLOWED_CURRENCIES: readonly Currency[] = [
  "USD",
  "EUR",
  "MDL",
  "RUB",
  "PLN",
  "KES",
  "MXN",
];

export interface ReceiptExtraction {
  /** Grand total, major units (e.g. 12.34). Null when not confidently detected. */
  amount: number | null;
  /** ISO 4217 code when confidently detected + supported, else null. */
  currency: Currency | null;
  /** Purchase date, ISO 8601 (YYYY-MM-DD), else null. */
  date: string | null;
  /** Merchant/vendor name as printed — NEVER translated. Null when absent. */
  vendor: string | null;
  /** Suggested spend category, else null. (Azure receipt model doesn't map to ours.) */
  category: string | null;
  /** Model confidence for the extraction as a whole, 0..1. */
  confidence: number;
}

export interface OcrProvider {
  extractReceipt(image: Buffer): Promise<ReceiptExtraction | null>;
}

// Only prefill a field when Azure is at least this confident — never overwrite the
// form with a low-confidence guess (leave it blank for the member to fill).
const FIELD_CONFIDENCE_MIN = 0.5;
const API_VERSION = "2024-11-30";
const SUBMIT_TIMEOUT_MS = 15000;
const POLL_TIMEOUT_MS = 10000;
const POLL_INTERVAL_MS = 1200;
const POLL_BUDGET_MS = 18000;

// Minimal shape of the bits of the Azure response we read (the body is otherwise
// untyped JSON). Everything is optional — missing/renamed fields degrade to null.
interface AzureField {
  confidence?: number;
  valueString?: string;
  valueDate?: string;
  valueNumber?: number;
  valueCurrency?: { amount?: number; currencyCode?: string };
}
interface AzureAnalyze {
  status?: string;
  analyzeResult?: {
    documents?: Array<{ confidence?: number; fields?: Record<string, AzureField> }>;
  };
}

function finiteNumber(x: unknown): number | null {
  return typeof x === "number" && Number.isFinite(x) ? x : null;
}

// A field only counts if Azure reports confidence at/above the threshold.
function confident(f: AzureField | undefined): AzureField | null {
  return f && typeof f.confidence === "number" && f.confidence >= FIELD_CONFIDENCE_MIN
    ? f
    : null;
}

/**
 * Extract structured fields from a receipt image via Azure Document Intelligence.
 * Returns null on any failure → callers fall through to manual entry.
 */
export async function extractReceipt(
  image: Buffer,
): Promise<ReceiptExtraction | null> {
  const endpoint = process.env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT;
  const key = process.env.AZURE_DOCUMENT_INTELLIGENCE_KEY;
  if (!endpoint || !key) return null;

  try {
    const base = endpoint.replace(/\/+$/, "");
    const analyzeUrl = `${base}/documentintelligence/documentModels/prebuilt-receipt:analyze?api-version=${API_VERSION}`;

    // 1. Submit the image bytes — returns 202 + Operation-Location (async LRO).
    const submit = await fetch(analyzeUrl, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": key,
        "Content-Type": "application/octet-stream",
      },
      body: new Uint8Array(image),
      signal: AbortSignal.timeout(SUBMIT_TIMEOUT_MS),
    });
    if (!submit.ok) return null;
    const operationLocation = submit.headers.get("operation-location");
    if (!operationLocation) return null;

    // 2. Poll the operation until it succeeds/fails or the budget runs out.
    const deadline = Date.now() + POLL_BUDGET_MS;
    let result: AzureAnalyze | null = null;
    while (Date.now() < deadline) {
      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
      const poll = await fetch(operationLocation, {
        headers: { "Ocp-Apim-Subscription-Key": key },
        signal: AbortSignal.timeout(POLL_TIMEOUT_MS),
      });
      if (!poll.ok) return null;
      const body = (await poll.json()) as AzureAnalyze;
      if (body.status === "succeeded") {
        result = body;
        break;
      }
      if (body.status === "failed") return null;
      // "notStarted" / "running" → keep polling
    }
    if (!result) return null; // timed out → manual fallback

    // 3. Map the confidently-parsed fields; leave the rest null.
    const doc = result.analyzeResult?.documents?.[0];
    const fields = doc?.fields ?? {};

    const vendor = confident(fields.MerchantName)?.valueString?.trim() || null;

    const dateField = confident(fields.TransactionDate);
    const date =
      typeof dateField?.valueDate === "string" ? dateField.valueDate : null;

    const totalField = confident(fields.Total);
    let amount: number | null = null;
    let currency: Currency | null = null;
    if (totalField) {
      amount =
        finiteNumber(totalField.valueCurrency?.amount) ??
        finiteNumber(totalField.valueNumber);
      if (amount !== null && amount <= 0) amount = null;
      const code = totalField.valueCurrency?.currencyCode;
      if (
        typeof code === "string" &&
        (ALLOWED_CURRENCIES as readonly string[]).includes(code)
      ) {
        currency = code as Currency;
      }
    }

    return {
      amount,
      currency,
      date,
      vendor,
      category: null,
      confidence: finiteNumber(doc?.confidence) ?? 0,
    };
  } catch {
    // timeout / network / abort / malformed JSON → manual fallback, no error shown.
    return null;
  }
}
