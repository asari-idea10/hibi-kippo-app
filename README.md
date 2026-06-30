# 日々吉方エンジン

星回りを知り、方位を選び、気を整える。

九星気学、算命学、暦注、旧暦、方位判断を統合するためのNext.jsアプリです。

## Project Notes

- 暦データ方針: `src/data/README.md`
- 暦注マスター本格化ロードマップ: `docs/calendar-notes-roadmap.md`
- スプシ全期間抽出JSON仕様: `docs/calendar-master-full-range-input-spec.md`
- 全期間JSON作成フロー: `docs/calendar-master-full-range-build-flow.md`
- Gemini共有ガイド: `docs/gemini-sharing-guide.md`
- 現在の開発画面: `http://127.0.0.1:3000/?date=2026-06-06&view=dev`

## Current Data Scope

- 二十四節気・節入り: 1900〜2050年
- 旧暦・六曜生成データ: 1900〜2050年
- 国民の祝日: 1955〜2027年
- 年月日マスター: 1900-01-01〜2050-12-31 / 55,152日分
- 年月日初期表示: 2026-05-16〜2026-06-14
- 十二直・二十八宿・主要選日: 1900〜2050年の日別発生マスターv0

将来的には、暦注・雑節・選日を年別JSONへ分割し、1900〜2100年、必要に応じて2150年まで拡張します。

## Getting Started

### Calendar Master Range Build

30日サンプルで、CSVから暦マスターJSONを再生成する:

```bash
npm run data:calendar-master:build-range -- \
  --input src/data/calendar-master-rows.sample.csv \
  --output /tmp/calendar-master-rows.sample.built.json \
  --start-date 2026-05-16 \
  --end-date 2026-06-14
```

1900〜2050年の全期間JSONを作る場合:

```bash
npm run data:calendar-master:build-range -- \
  --input src/data/import/calendar-master-rows.1900-2050.source.csv \
  --column-map src/data/calendar-master-column-map.v1.json \
  --no-header \
  --output src/data/calendar-master-rows.1900-2050.json \
  --start-date 1900-01-01 \
  --end-date 2050-12-31
```

作成後の検証:

```bash
npm run data:calendar-master:validate -- \
  --input src/data/calendar-master-rows.1900-2050.json \
  --start-date 1900-01-01 \
  --end-date 2050-12-31
```

全期間JSONはサイズが大きいため、API本体では年別JSONへ分割して読みます。

```bash
npm run data:calendar-master:split-json
```

生成先:

```text
src/data/calendar-master/by-year/{year}.json
```

APIは `date` / `start` / `end` を指定すると1900〜2050年の範囲を参照します。未指定の場合は、画面とAPIの初期レスポンスが重くならないよう、2026-05-16〜2026-06-14の30日分を返します。

旧暦・六曜も年別JSONを優先して本体へ接続します。

```text
/api/lunar-calendar?date=1900-01-01
/api/lunar-calendar?year=2050
```

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
