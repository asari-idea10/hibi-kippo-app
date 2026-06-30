import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

const [, , ...args] = process.argv;

function readOption(name, fallback = null) {
  const index = args.indexOf(name);
  return index === -1 ? fallback : args[index + 1] ?? fallback;
}

const spreadsheetId = readOption(
  "--spreadsheet-id",
  "1J9PfYOdEcHQXvLN8b_8Mz2V3a0LvF3kx_5Ql_hFb4zw",
);
const gid = readOption("--gid", "1523876450");
const planPath = readOption(
  "--plan",
  "src/data/import/calendar-master-extraction-plan.1900-2050.json",
);
const htmlOutputPath = readOption(
  "--html-output",
  "src/data/import/calendar-master-export-links.1900-2050.html",
);
const jsonOutputPath = readOption(
  "--json-output",
  "src/data/import/calendar-master-export-links.1900-2050.json",
);

const plan = JSON.parse(await import("node:fs/promises").then((fs) => fs.readFile(planPath, "utf8")));

function exportUrlForRange(range) {
  const params = new URLSearchParams({
    format: "csv",
    gid,
    range,
  });

  return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?${params.toString()}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

const links = plan.chunks.map((chunk) => ({
  ...chunk,
  url: exportUrlForRange(chunk.range),
  targetPath: `src/data/import/chunks/${chunk.suggestedFile}`,
}));

const manifest = {
  schemaVersion: "calendar_master_export_links.v1",
  spreadsheetId,
  gid,
  source: plan.source,
  range: plan.range,
  generatedAt: new Date().toISOString(),
  links,
};

const rowsHtml = links
  .map(
    (link) => `
      <tr>
        <td>${escapeHtml(link.id)}</td>
        <td>${escapeHtml(link.startDate)} - ${escapeHtml(link.endDate)}</td>
        <td>${escapeHtml(link.range)}</td>
        <td>${escapeHtml(link.rowCount)}</td>
        <td><code>${escapeHtml(link.suggestedFile)}</code></td>
        <td><a href="${escapeHtml(link.url)}" target="_blank" rel="noreferrer">CSVを開く</a></td>
      </tr>`,
  )
  .join("\n");

const html = `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>年月日 年別CSV抽出リンク 1900-2050</title>
    <style>
      body {
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Hiragino Sans", sans-serif;
        line-height: 1.6;
        margin: 32px;
        color: #1f2933;
        background: #faf9f6;
      }
      h1 {
        font-size: 24px;
        margin: 0 0 8px;
      }
      h2 {
        font-size: 18px;
        margin-top: 28px;
      }
      code {
        background: #f0eee8;
        border-radius: 4px;
        padding: 2px 5px;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        background: #fff;
        border: 1px solid #ddd8cc;
      }
      th,
      td {
        border-bottom: 1px solid #eee9df;
        padding: 8px 10px;
        text-align: left;
        vertical-align: top;
        font-size: 13px;
      }
      th {
        position: sticky;
        top: 0;
        background: #efe8d8;
      }
      a {
        color: #075985;
      }
      .summary {
        background: #fff;
        border: 1px solid #ddd8cc;
        padding: 14px 16px;
        margin: 16px 0;
      }
    </style>
  </head>
  <body>
    <h1>年月日 年別CSV抽出リンク 1900-2050</h1>
    <div class="summary">
      <div>対象: <strong>${escapeHtml(plan.source.workbook)} / ${escapeHtml(plan.source.sheet)}</strong></div>
      <div>期間: <strong>${escapeHtml(plan.range.startDate)} - ${escapeHtml(plan.range.endDate)}</strong></div>
      <div>年別chunk数: <strong>${escapeHtml(links.length)}</strong></div>
      <div>想定行数: <strong>${escapeHtml(plan.range.expectedRows)}</strong></div>
    </div>

    <h2>手順</h2>
    <ol>
      <li>Googleにログイン済みのブラウザで、各年の <strong>CSVを開く</strong> をクリックする。</li>
      <li>CSVが表示またはダウンロードされたら、表のファイル名へリネームする。</li>
      <li><code>src/data/import/chunks</code> に置く。</li>
      <li>数年ぶん置いたら <code>npm run data:calendar-master:check-chunks</code> で不足を確認する。</li>
      <li>全件揃ったら <code>npm run data:calendar-master:build-full</code> で <code>calendar-master-rows.1900-2050.json</code> を生成する。</li>
    </ol>

    <h2>リンク一覧</h2>
    <table>
      <thead>
        <tr>
          <th>年</th>
          <th>日付範囲</th>
          <th>スプシ範囲</th>
          <th>行数</th>
          <th>保存ファイル名</th>
          <th>リンク</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>
  </body>
</html>
`;

await mkdir(dirname(htmlOutputPath), { recursive: true });
await mkdir(dirname(jsonOutputPath), { recursive: true });
await writeFile(jsonOutputPath, `${JSON.stringify(manifest, null, 2)}\n`);
await writeFile(htmlOutputPath, html);

console.log(
  JSON.stringify(
    {
      ok: true,
      htmlOutputPath,
      jsonOutputPath,
      links: links.length,
      start: plan.range.startDate,
      end: plan.range.endDate,
    },
    null,
    2,
  ),
);
