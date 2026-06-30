import { writeFile } from "node:fs/promises";

const [, , ...args] = process.argv;

function readOption(name) {
  const index = args.indexOf(name);
  if (index === -1) {
    return null;
  }

  return args[index + 1] ?? null;
}

const startYear = Number(readOption("--start-year") ?? "1900");
const endYear = Number(readOption("--end-year") ?? "2050");
const outputPath = readOption("--output") ?? "/tmp/solar-term-source-audit.json";

function buildNaojHtmlUrl(year) {
  const rekiyouYear = String(year - 2000).padStart(2, "0");
  return `https://eco.mtk.nao.ac.jp/koyomi/yoko/${year}/rekiyou${rekiyouYear}2.html`;
}

function buildNaojPdfUrl(year) {
  return `https://eco.mtk.nao.ac.jp/koyomi/yoko/pdf/yoko${year}.pdf`;
}

function classifyYear(year) {
  if (year >= 2028) {
    return {
      status: "future_unpublished",
      preferredMethod: "astronomical_calculation",
      note: "国立天文台の年別暦要項が未公開の可能性が高い年。Swiss Ephemeris等で計算し、将来公開後に照合する。",
    };
  }

  if (year >= 2019 && year <= 2027) {
    return {
      status: "html_candidate",
      preferredMethod: "naoj_html",
      note: "近年のHTML版暦要項から二十四節気時刻を機械抽出できる可能性が高い。",
    };
  }

  if (year >= 1955 && year <= 2018) {
    return {
      status: "pdf_archive",
      preferredMethod: "naoj_pdf_or_astronomical_calculation",
      note: "国立天文台アーカイブにPDFがある年。PDF抽出または天文計算で作成し、抜き打ちでPDF照合する。",
    };
  }

  if (year >= 1900 && year <= 1954) {
    return {
      status: "library_scan_archive",
      preferredMethod: "astronomical_calculation_with_manual_sampling",
      note: "国立天文台図書室の画像アーカイブ領域。OCR全自動化は重いので、天文計算を主軸に万年暦/画像を抜き打ち照合する。",
    };
  }

  return {
    status: "out_of_scope",
    preferredMethod: "manual_review",
    note: "今回の1900〜2050対象外。",
  };
}

async function checkUrl(url) {
  try {
    const response = await fetch(url, { method: "HEAD" });
    return {
      ok: response.ok,
      status: response.status,
    };
  } catch (error) {
    return {
      ok: false,
      status: null,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

const years = Array.from(
  { length: endYear - startYear + 1 },
  (_, index) => startYear + index,
);

const rows = [];

for (const year of years) {
  const classification = classifyYear(year);
  const htmlUrl = buildNaojHtmlUrl(year);
  const pdfUrl = buildNaojPdfUrl(year);
  const html = classification.status === "html_candidate"
    ? await checkUrl(htmlUrl)
    : { ok: false, status: null };
  const pdf = year >= 1955 && year <= 2027
    ? await checkUrl(pdfUrl)
    : { ok: false, status: null };

  rows.push({
    year,
    ...classification,
    sources: {
      naojHtml: {
        url: htmlUrl,
        ...html,
      },
      naojPdf: {
        url: pdfUrl,
        ...pdf,
      },
    },
  });
}

const byStatus = rows.reduce((accumulator, row) => {
  accumulator[row.status] = (accumulator[row.status] ?? 0) + 1;
  return accumulator;
}, {});

const byPreferredMethod = rows.reduce((accumulator, row) => {
  accumulator[row.preferredMethod] =
    (accumulator[row.preferredMethod] ?? 0) + 1;
  return accumulator;
}, {});

const result = {
  range: {
    startYear,
    endYear,
    years: rows.length,
  },
  byStatus,
  byPreferredMethod,
  rows,
};

await writeFile(outputPath, `${JSON.stringify(result, null, 2)}\n`);
console.log(
  `Audited ${rows.length} years: ${startYear}-${endYear} -> ${outputPath}`,
);
console.log(JSON.stringify({ byStatus, byPreferredMethod }, null, 2));
