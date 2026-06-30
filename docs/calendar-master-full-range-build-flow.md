# calendar-master-rows.1900-2050.json 作成フロー v1

## 目的

`★フォーチューンマイレージマスタ > 年月日` から全期間データを抽出し、アプリ側で扱う正規JSONへ変換する。

出力先:

```text
src/data/calendar-master-rows.1900-2050.json
```

## 入力元

スプレッドシート:

```text
★フォーチューンマイレージマスタ
年月日
```

初期対象期間:

```text
1900-01-01 〜 2050-12-31
```

必要行数:

```text
55,152行
```

推定スプシ範囲:

```text
年月日!A2:BN55153
```

根拠:

```text
2026-05-16 = row 46158
1900-01-01 = row 2
2050-12-31 = row 55153
```

## 入力ファイル

スプシから抽出したCSVまたはJSONを使う。

推奨する分割ファイル置き場:

```text
src/data/import/chunks/
```

年別に置く場合:

```text
src/data/import/chunks/calendar-master-rows.1900-1900.source.csv
src/data/import/chunks/calendar-master-rows.1901-1901.source.csv
```

10年単位で置く場合:

```text
src/data/import/chunks/calendar-master-rows.1900-1909.source.csv
src/data/import/chunks/calendar-master-rows.1910-1919.source.csv
```

スプシから `A:BN` をそのまま出す場合はヘッダーなし66列になる。この場合は列マップを使う。

```text
src/data/calendar-master-column-map.v1.json
```

実データの `date` はスプシ列Eから取得する。`row` はスプシ実列には含めず、`1900-01-01 = row 2` を起点に自動算出する。`year` はスプシ実列Bが空欄の場合、`date` または `ymLabel` から自動算出する。

CSVだけでなく、Google Sheets API/コネクタから取れる `{ "values": [[...]] }` 形式のJSONもそのまま分割ファイルにできる。

## 作成コマンド

単一CSVから作る場合:

```bash
npm run data:calendar-master:build-range -- \
  --input src/data/import/calendar-master-rows.1900-2050.source.csv \
  --column-map src/data/calendar-master-column-map.v1.json \
  --no-header \
  --output src/data/calendar-master-rows.1900-2050.json \
  --start-date 1900-01-01 \
  --end-date 2050-12-31
```

分割CSVから作る場合:

```bash
npm run data:calendar-master:build-range -- \
  --input-dir src/data/import/chunks \
  --column-map src/data/calendar-master-column-map.v1.json \
  --no-header \
  --output src/data/calendar-master-rows.1900-2050.json \
  --start-date 1900-01-01 \
  --end-date 2050-12-31
```

同じ処理の短縮コマンド:

```bash
npm run data:calendar-master:build-full
```

出力せずに、欠損日・重複日・行数だけ確認する場合:

```bash
npm run data:calendar-master:check-full
```

## 検証コマンド

```bash
npm run data:calendar-master:validate -- \
  --input src/data/calendar-master-rows.1900-2050.json \
  --start-date 1900-01-01 \
  --end-date 2050-12-31
```

## 30日サンプルでの試運転

```bash
npm run data:calendar-master:build-range -- \
  --input src/data/calendar-master-rows.sample.csv \
  --output /tmp/calendar-master-rows.sample.built.json \
  --start-date 2026-05-16 \
  --end-date 2026-06-14
```

スプシ `A:BN` 相当のヘッダーなしCSVを試す場合:

```bash
npm run data:calendar-master:build-range -- \
  --input /tmp/calendar-master-rows.sample.raw-a-bn.csv \
  --column-map src/data/calendar-master-column-map.v1.json \
  --no-header \
  --output /tmp/calendar-master-rows.sample.from-raw-built.json \
  --start-date 2026-05-16 \
  --end-date 2026-06-14
```

```bash
npm run data:calendar-master:validate -- \
  --input /tmp/calendar-master-rows.sample.built.json \
  --start-date 2026-05-16 \
  --end-date 2026-06-14
```

## 抽出計画を生成する

年単位でスプシ範囲を分割する場合:

```bash
npm run data:calendar-master:extraction-plan -- \
  --start-year 1900 \
  --end-year 2050 \
  --years-per-chunk 1 \
  --output src/data/import/calendar-master-extraction-plan.1900-2050.json
```

生成済みの初期計画:

```text
src/data/import/calendar-master-extraction-plan.1900-2050.json
```

例:

| 年 | 範囲 | 行数 |
|---|---|---:|
| 1900 | `年月日!A2:BN366` | 365 |
| 2050 | `年月日!A54789:BN55153` | 365 |
| 全体 | `年月日!A2:BN55153` | 55,152 |

## 年別CSVを確実に落とす手順

まず、抽出計画からCSVダウンロードリンク一覧を生成する。

```bash
npm run data:calendar-master:export-links
```

生成されるファイル:

```text
src/data/import/calendar-master-export-links.1900-2050.html
src/data/import/calendar-master-export-links.1900-2050.json
```

HTMLをブラウザで開き、各年の `CSVを開く` をクリックする。

保存先:

```text
src/data/import/chunks/
```

保存ファイル名は、HTML表の `保存ファイル名` に合わせる。

例:

```text
src/data/import/chunks/calendar-master-rows.1900-1900.source.csv
src/data/import/chunks/calendar-master-rows.1901-1901.source.csv
```

数年分置いたら、不足・余分なファイルを確認する。

```bash
npm run data:calendar-master:check-chunks
```

全151年分が揃うまでは `missingFiles` が出る。全件揃ったら `ok: true` になる。

### Downloadsから安全に取り込む

CSVをブラウザでダウンロードした直後は、ファイル名が `export.csv` や `年月日.csv` などになりやすい。

その場合は、年を指定して `Downloads` の最新CSVを検査し、正しい名前で `chunks` へコピーする。

```bash
npm run data:calendar-master:stage-download -- --year 1900
```

明示的にファイルを指定する場合:

```bash
npm run data:calendar-master:stage-download -- \
  --year 1900 \
  --source /Users/asaritoshiyuki/Downloads/export.csv
```

このスクリプトは以下を確認する。

- 行数が抽出計画と一致するか
- 先頭日付がその年の `01-01` か
- 末尾日付がその年の `12-31` か

一致した場合だけ、次のような正式ファイル名で保存する。

```text
src/data/import/chunks/calendar-master-rows.1900-1900.source.csv
```

その後、出力なしの事前検査を行う。

```bash
npm run data:calendar-master:check-full
```

最後に本生成する。

```bash
npm run data:calendar-master:build-full
```

この流れなら、1年抜け・ファイル名間違い・行数不一致を段階的に検出できる。

## 実際に通った一括回収ルート

年別CSVリンクを151回開く方法も用意したが、実運用ではGoogle Sheetsの通常UIから `年月日` シート全体をCSVダウンロードする方法が通った。

Google Sheets側の操作:

```text
ファイル > ダウンロード > カンマ区切り形式（.csv）
```

取得した全CSVは次に置く。

```text
src/data/import/calendar-master-rows.1900-2050.source.csv
```

その後、年別chunkへ分割する。

```bash
npm run data:calendar-master:split-source -- \
  --input src/data/import/calendar-master-rows.1900-2050.source.csv \
  --output-dir src/data/import/chunks
```

実績:

```text
151 chunks
55,152 rows
1900-01-01 - 2050-12-31
```

全期間JSONは約93MBになるため、Git管理からは外し、必要時に再生成する。

## 年別JSON分割

本体APIでは、93MB級の一括JSONを直接読み込まず、年別JSONを必要な年だけ読む。

```bash
npm run data:calendar-master:split-json
```

入力:

```text
src/data/calendar-master-rows.1900-2050.json
```

出力:

```text
src/data/calendar-master/by-year/1900.json
src/data/calendar-master/by-year/1901.json
...
src/data/calendar-master/by-year/2050.json
```

実績:

```text
151 files
55,152 rows
1900-01-01 - 2050-12-31
```

このディレクトリは生成物としてGit管理しない。必要時に、全CSVから一括JSONを再生成し、その後に年別JSONへ分割する。

## API接続方針

APIは `src/lib/calendar-master-rows.ts` 経由で年別JSONを読む。

- `/api/calendar-day?date=1900-01-01` のような単日指定は、該当年JSONだけを読む
- `/api/calendar-days?start=2050-12-29&end=2050-12-31` のような範囲指定は、必要な年だけを読む
- `/api/best-days?start=1900-01-01&end=1900-01-03` も同じ暦マスターを参照する
- `start` / `end` 未指定時は、巨大レスポンスを避けるため2026-05-16〜2026-06-14の30日分を返す

画面上の「取り込み済み日付リンク」も全55,152件を並べず、選択日周辺だけを表示する。

## build-range の役割

- CSVまたはJSONを読み込む
- `--input-dir` の場合は、フォルダ内の `.csv` / `.json` をファイル名順で結合する
- スプシ `A:BN` のヘッダーなしCSVを列マップで読み込む
- `year` / `month` / `day` から `date` を生成する
- `start-date`〜`end-date` だけを抽出する
- 日付昇順に並べる
- スキーマ定義のキー順へ整形する
- boolean系フラグを `"1"` / `"0"` に正規化する
- 期間開始、期間終了、行数、重複日を確認する

## validate の役割

- 必須キーが揃っているか確認する
- 欠損日がないか確認する
- 重複日がないか確認する
- `row` が数値か確認する
- boolean系フラグが許容値か確認する

## 次工程

1. 30日サンプルで `build-range` と `validate` を通す: 完了
2. スプシから全期間CSVを抽出する: 完了
3. `calendar-master-rows.1900-2050.json` を生成する: 完了
4. 年別JSONへ分割し、APIを全期間対応にする: 完了
5. `data:calendar-notes:generate-range` で暦注発生マスターを1900〜2050年へ広げる: 完了
6. 万年暦サンプル年で照合する: 継続
