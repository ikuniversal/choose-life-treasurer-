import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // @react-pdf/renderer (PDF export, roadmap #6) is resolved at runtime rather than
  // bundled — avoids webpack choking on its wasm layout engine.
  serverExternalPackages: ["@react-pdf/renderer"],
  // The embedded Cyrillic font is a data file, not an import, so trace it into the
  // /console/export/pdf serverless function explicitly (else RU UGC would fall back
  // to a glyphless default).
  outputFileTracingIncludes: {
    "/console/export/pdf": [
      "./node_modules/dejavu-fonts-ttf/ttf/DejaVuSans.ttf",
      "./node_modules/dejavu-fonts-ttf/ttf/DejaVuSans-Bold.ttf",
    ],
  },
};

export default withNextIntl(nextConfig);
