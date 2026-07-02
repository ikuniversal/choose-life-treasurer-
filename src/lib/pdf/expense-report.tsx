import { readFileSync } from "node:fs";
import path from "node:path";
import {
  Document,
  Font,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer,
} from "@react-pdf/renderer";
import type { ExportRow } from "@/lib/data/export";

// Embed DejaVu Sans (full Cyrillic coverage) as a data URI read once at module
// load. The default Helvetica has NO Cyrillic glyphs, so RU vendor/description/
// name UGC would render blank — this is the hard requirement of the slice. The
// .ttf files are traced into this route's serverless bundle via next.config
// outputFileTracingIncludes; we read them by path (not module resolution, which
// the bundler can't statically follow).
const FONT_DIR = path.join(
  process.cwd(),
  "node_modules",
  "dejavu-fonts-ttf",
  "ttf",
);
function fontDataUri(file: string): string {
  const buf = readFileSync(path.join(FONT_DIR, file));
  return `data:font/ttf;base64,${buf.toString("base64")}`;
}
Font.register({
  family: "DejaVu Sans",
  fonts: [
    { src: fontDataUri("DejaVuSans.ttf") },
    { src: fontDataUri("DejaVuSans-Bold.ttf"), fontWeight: "bold" },
  ],
});

export interface ReportMeta {
  title: string;
  scopeLabel: string; // "Scope"
  scopeValue: string; // group name (UGC) or "All groups"
  rangeLabel: string; // "Date range"
  rangeValue: string; // "from — to" / "All dates"
  generatedLabel: string; // "Generated"
  generatedValue: string; // timestamp
}

export interface ReportTotals {
  byCurrency: { currency: string; total: number }[];
  usdTotal: number;
}

export interface ReportLabels {
  colDate: string;
  colSubmitter: string;
  colDescription: string;
  colCategory: string;
  colAmount: string;
  colUsd: string;
  colStatus: string;
  late: string;
  totals: string;
  usdTotal: string;
  empty: string;
  page: string; // "Page"
}

const s = StyleSheet.create({
  page: {
    fontFamily: "DejaVu Sans",
    fontSize: 8,
    paddingTop: 32,
    paddingBottom: 40,
    paddingHorizontal: 28,
    color: "#33291f",
  },
  title: { fontSize: 15, fontWeight: "bold", color: "#29251d" },
  metaBlock: { marginTop: 8, marginBottom: 14 },
  metaRow: { flexDirection: "row", marginTop: 2 },
  metaLabel: { width: 70, color: "#8f877a" },
  metaValue: { flex: 1 },
  thead: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#29251d",
    paddingBottom: 4,
    fontWeight: "bold",
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#e8e1d3",
    paddingVertical: 3,
  },
  cDate: { width: "12%" },
  cSubmitter: { width: "16%" },
  cDesc: { width: "26%", paddingRight: 4 },
  cCat: { width: "12%" },
  cAmount: { width: "14%", textAlign: "right" },
  cUsd: { width: "10%", textAlign: "right" },
  cStatus: { width: "10%", textAlign: "right" },
  late: { color: "#8a6a33", fontWeight: "bold" },
  empty: { marginTop: 16, color: "#8f877a" },
  totals: {
    marginTop: 14,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#29251d",
  },
  totalsHead: { fontWeight: "bold", marginBottom: 3 },
  totalRow: { flexDirection: "row", justifyContent: "flex-end", marginTop: 1 },
  totalKey: { color: "#8f877a", marginRight: 10 },
  totalVal: { fontFamily: "DejaVu Sans", minWidth: 90, textAlign: "right" },
  usdTotal: { fontWeight: "bold" },
  footer: {
    position: "absolute",
    bottom: 18,
    left: 28,
    right: 28,
    textAlign: "center",
    color: "#b6ac9c",
    fontSize: 7,
  },
});

function ExpenseReport({
  rows,
  meta,
  totals,
  labels,
}: {
  rows: ExportRow[];
  meta: ReportMeta;
  totals: ReportTotals;
  labels: ReportLabels;
}) {
  return (
    <Document title={meta.title}>
      <Page size="A4" style={s.page}>
        <Text style={s.title}>{meta.title}</Text>
        <View style={s.metaBlock}>
          <View style={s.metaRow}>
            <Text style={s.metaLabel}>{meta.scopeLabel}</Text>
            {/* scope value can be a UGC group name — never translated */}
            <Text style={s.metaValue}>{meta.scopeValue}</Text>
          </View>
          <View style={s.metaRow}>
            <Text style={s.metaLabel}>{meta.rangeLabel}</Text>
            <Text style={s.metaValue}>{meta.rangeValue}</Text>
          </View>
          <View style={s.metaRow}>
            <Text style={s.metaLabel}>{meta.generatedLabel}</Text>
            <Text style={s.metaValue}>{meta.generatedValue}</Text>
          </View>
        </View>

        {rows.length === 0 ? (
          <Text style={s.empty}>{labels.empty}</Text>
        ) : (
          <>
            <View style={s.thead} fixed>
              <Text style={s.cDate}>{labels.colDate}</Text>
              <Text style={s.cSubmitter}>{labels.colSubmitter}</Text>
              <Text style={s.cDesc}>{labels.colDescription}</Text>
              <Text style={s.cCat}>{labels.colCategory}</Text>
              <Text style={s.cAmount}>{labels.colAmount}</Text>
              <Text style={s.cUsd}>{labels.colUsd}</Text>
              <Text style={s.cStatus}>{labels.colStatus}</Text>
            </View>

            {rows.map((r, i) => (
              <View key={i} style={s.row} wrap={false}>
                <Text style={s.cDate}>{r.date}</Text>
                {/* submitter / description are UGC — never translated */}
                <Text style={s.cSubmitter}>{r.submitter || "—"}</Text>
                <Text style={s.cDesc}>{r.description}</Text>
                <Text style={s.cCat}>{r.category || "—"}</Text>
                <Text style={s.cAmount}>
                  {r.amount ? `${r.amount} ${r.currency}` : "—"}
                </Text>
                <Text style={s.cUsd}>{r.usdEquivalent || "—"}</Text>
                <Text style={s.cStatus}>
                  {r.status}
                  {r.isLate === "true" ? (
                    <Text style={s.late}> · {labels.late}</Text>
                  ) : null}
                </Text>
              </View>
            ))}

            <View style={s.totals}>
              <Text style={s.totalsHead}>{labels.totals}</Text>
              {totals.byCurrency.map((c) => (
                <View key={c.currency} style={s.totalRow}>
                  <Text style={s.totalKey}>{c.currency}</Text>
                  <Text style={s.totalVal}>{c.total.toFixed(2)}</Text>
                </View>
              ))}
              <View style={s.totalRow}>
                <Text style={[s.totalKey, s.usdTotal]}>{labels.usdTotal}</Text>
                <Text style={[s.totalVal, s.usdTotal]}>
                  {totals.usdTotal.toFixed(2)}
                </Text>
              </View>
            </View>
          </>
        )}

        <Text
          style={s.footer}
          fixed
          render={({ pageNumber, totalPages }) =>
            `${labels.page} ${pageNumber} / ${totalPages}`
          }
        />
      </Page>
    </Document>
  );
}

export function renderExpenseReportPdf(
  rows: ExportRow[],
  meta: ReportMeta,
  totals: ReportTotals,
  labels: ReportLabels,
): Promise<Buffer> {
  return renderToBuffer(
    <ExpenseReport rows={rows} meta={meta} totals={totals} labels={labels} />,
  );
}
