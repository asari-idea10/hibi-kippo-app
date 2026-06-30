# 外部検証用デプロイ手順

近藤さんのような非開発者に画面検証してもらうための、GitHub + Vercel 前提の運用メモです。

## 推奨フロー

1. GitHub に private repository を作る
2. この `hibi-kippo-app` を GitHub へ push する
3. Vercel で GitHub repository を Import する
4. Root Directory は repository 直下のままにする
5. Framework Preset は Next.js
6. Build Command は `npm run build`
7. Install Command は `npm install`
8. 検証用URLを近藤さんへ共有する

## 簡易パスワード保護

Vercel の Environment Variables に以下を設定すると、サイト全体に Basic 認証がかかります。

- `BASIC_AUTH_USER`
- `BASIC_AUTH_PASSWORD`

未設定の場合、認証は無効です。ローカル開発や通常の Codex 作業には影響しません。

## 近藤さん向け検証メモ例

- URL:
- ID:
- PW:
- 見てほしい画面: `/purpose-calendar`
- 確認してほしいこと:
  - 生年月日を入れたときに意味が伝わるか
  - 目的の選択が迷わないか
  - 方位盤とカレンダーが見やすいか
  - スマホで読めるか
  - どこで言葉が難しく感じるか

## Codex 作業への影響

Codex はこれまで通りローカルのファイルを編集します。

通常の流れは以下です。

1. Codex がローカルで修正
2. `npm run lint` / `npm run build`
3. Git commit
4. GitHub へ push
5. Vercel が自動デプロイ

このため、外部検証URLを作っても開発効率は大きく落ちません。
