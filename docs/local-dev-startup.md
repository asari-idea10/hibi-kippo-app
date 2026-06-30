# 日々吉方アプリ 手動起動メモ

## 目的

ローカルの確認サイトが切れたときに、手動で Next.js 開発サーバーを立ち上げるためのメモ。

## 起動手順

ターミナルで以下を実行する。

```bash
cd /Users/asaritoshiyuki/Documents/Codex/2026-05-15/glide-codex-plus-5-5/hibi-kippo-app
npm run dev
```

起動できると、通常は次のURLで確認できる。

```text
http://localhost:3000/
```

開発者画面で特定日を確認する例。

```text
http://localhost:3000/?date=2021-02-03&view=dev
http://localhost:3000/?date=1976-03-19&view=dev
http://localhost:3000/?date=1900-01-01&view=dev
```

ユーザー向け画面で確認する例。

```text
http://localhost:3000/?date=2021-02-03&view=user
```

## 終了方法

サーバーを起動しているターミナルで `control + C` を押す。

## ポート3000が使われている場合

Next.js が自動で別ポートを提案することがある。その場合は表示されたURLを使う。

例:

```text
http://localhost:3001/
```

明示的に別ポートで起動したい場合。

```bash
npm run dev -- -p 3001
```

## 代表的な確認API

暦データを直接確認する。

```text
http://localhost:3000/api/calendar-day?date=2021-02-03
```

複数日を確認する。

```text
http://localhost:3000/api/calendar-days?start=2021-02-01&end=2021-02-10
```

暦注発生マスターを確認する。

```text
http://localhost:3000/api/calendar-note-occurrences?start=2021-02-01&end=2021-02-10
```

## 作業前の簡易チェック

必要に応じて以下を実行する。

```bash
npm run lint
npm run build
```

`npm run build` が通れば、型や本番ビルドの大きな崩れはない。

