# こよみページ正本サンプル追加手順

## 目的

こよみのページの `暦注計算` を検証正本として使い、日々吉方側の主要選日計算候補と照合する。

対象ページ:

```text
https://koyomi8.com/sub/rekicyuu.html
```

## 現時点の方針

こよみページは画面表示とCSVダウンロードに対応している。

日々吉方では、正本サンプルを年別JSONへ取り込む。

```text
src/data/calendar-notes/koyomi-reference-samples/by-year/{year}.json
```

そのうえで、候補計算との一致・差分をスクリプトで確認する。

```bash
npm run data:selected-days:compare
```

こよみページからCSVをダウンロードできた場合は、手入力ではなく次のスクリプトで取り込む。

```bash
npm run data:koyomi:import-csv -- --year 2021 --input /path/to/Rekicyuu_2021.csv --month 2
```

同じ日付がすでにある場合は、原則としてCSV側を正本として置き換える。既存を残したい場合だけ `--append-only` を付ける。

こよみページのクライアント側JavaScriptを取得済みの場合は、ローカルでCSVを生成してから取り込むこともできる。

```bash
npm run data:koyomi:generate-csv -- --year 2021 --month 2 --js-dir /private/tmp/koyomi8-js --output data-workbench/calendar-notes/fixtures/koyomi-reference-2021-02.csv
npm run data:koyomi:import-csv -- --year 2021 --input data-workbench/calendar-notes/fixtures/koyomi-reference-2021-02.csv --month 2 --output-dir src/data/calendar-notes/koyomi-reference-samples/by-year
```

正本サンプルを暦注発生マスターへ反映し、照合レポートを出す。

```bash
npm run data:calendar-notes:generate-range -- --calendar-master src/data/calendar-master-rows.1900-2050.json --output-dir src/data/calendar-note-occurrences/by-year --start-year 2021 --end-year 2021 --split-by-year --references src/data/calendar-notes/koyomi-reference-samples/by-year
npm run data:koyomi:compare -- --month 2021-02
```

1年分をまとめて同期する場合は、次を使う。

```bash
npm run data:koyomi:sync-year -- --year 2021
```

このコマンドは、12か月分のCSV生成、正本サンプル取り込み、暦注発生マスター再生成、月別比較レポート作成までをまとめて実行する。

## 追加する情報

1日分につき、最低限これを入れる。

```json
{
  "date": "2021-02-03",
  "weekday": "水",
  "dayPillar": "壬午",
  "junichoku": "定",
  "nijuhachishuku": "参",
  "nanajushichishuku": "房",
  "summary": "立春/一粒万倍日/不成就日 ※大明日/天恩日/神吉日",
  "selectedDayCodes": [
    "ichiryumanbaibi",
    "fujoju",
    "daimyo_nichi",
    "tenon_nichi",
    "shinnyu"
  ],
  "lunar": {
    "month": 12,
    "day": 22,
    "rokuyo": "先負"
  },
  "kyusei": "一白",
  "sourceMemo": "こよみページ画面またはCSVから転記"
}
```

## selectedDayCodes の対応

| こよみページ表記 | code |
|---|---|
| 一粒万倍日 | `ichiryumanbaibi` |
| 三隣亡 | `sanrinbou` |
| 不成就日 | `fujoju` |
| 八専 | `hassen` |
| 十方暮 | `jippo_gure` |
| 天一天上 | `tenichi_tenjo` |
| 大土始まり | `otsuchi_start` |
| 大明日 | `daimyo_nichi` |
| 天恩日 | `tenon_nichi` |
| 神吉日 | `shinnyu` |
| 地火日 | `jikabi` |
| 大禍日 | `taika_nichi` |
| 甲子 | `kasshi` |
| 庚申 | `koushin` |
| 己巳 | `tsuchinoto_mi` |
| 天赦日 | `tensha_bi` |

未定義の暦注が出た場合は、まず `summary` と `unmappedNames` にそのまま残し、code化は次の実装で行う。

## 照合の読み方

`npm run data:selected-days:compare` の出力で見る項目。

```text
matched: 候補計算と正本サンプルが一致
mismatched: 候補計算と正本サンプルに差分あり
candidateOnly: 日々吉方側だけが該当と判定
referenceOnly: こよみページ正本だけが該当と判定
```

現時点では、一粒万倍日・三隣亡・不成就日の3項目だけを候補計算の対象にしている。

## 次の進め方

1. こよみページで 2021年2月 を表示する
2. CSVをダウンロードする
3. `npm run data:koyomi:import-csv -- --year 2021 --input /path/to/Rekicyuu_2021.csv --month 2` を実行する
4. `koyomi-reference-samples/by-year/{year}.json` に正本サンプルが追加・置換されたことを確認する
5. `npm run data:selected-days:compare` を実行する
6. 差分が出た日を優先して、計算式・節入り境界・旧暦の扱いを確認する

## CSV取り込みの考え方

こよみページCSVの列は次の形式を想定する。

```text
日付(曜),干支,12直/28宿/27宿,その他（※以下は「下段」）,旧暦,六曜/九星
```

取り込みスクリプトは、CSVの `その他（※以下は「下段」）` を `summary` としてそのまま保持し、日々吉方側で定義済みの暦注だけ `selectedDayCodes` に変換する。未定義の暦注名は `unmappedNames` に残す。

これにより、まだ計算式が未完成の暦注でも、こよみページの正本表示は失わずに蓄積できる。

## 2021年2月の検証結果

2021年2月は、こよみページCSV由来の正本サンプルを28日分取り込んだ。

```text
正本サンプル: 28日分
十二直: 一致
二十八宿: 一致
主要選日summary: 一致
主要選日code: 一致
二十七宿: 一致。正本CSV由来の正式フィールドとしてAPI・開発者画面に表示する。
```

## 2021年通年の検証結果

2021年は、こよみページCSV由来の正本サンプルを365日分取り込んだ。

```text
正本サンプル: 365日分
対象期間: 2021-01-01 〜 2021-12-31
月別比較: 12か月すべて一致
十二直・二十八宿・二十七宿・主要選日summary/code: 一致
```

## 2020〜2022年の年またぎ検証結果

2020〜2022年の連続3年を正本サンプル化し、年またぎのズレを確認した。

```text
2020年: 366日分 / 12か月すべて一致
2021年: 365日分 / 12か月すべて一致
2022年: 365日分 / 12か月すべて一致
合計: 1096日分 / 36か月すべて一致
```

## 1900・1950・2000・2050年の端点検証結果

1900〜2050年の全期間へ広げる前に、範囲端と中間点を抜き出して検証した。

```text
1900年: 365日分 / 12か月すべて一致
1950年: 365日分 / 12か月すべて一致
2000年: 366日分 / 12か月すべて一致
2050年: 365日分 / 12か月すべて一致
合計: 1461日分 / 48か月すべて一致
```

この結果により、こよみページCSVを検証正本として、十二直・二十八宿・二十七宿・主要選日summary/codeを1900〜2050年へ広げる見通しは立った。

## 正本サンプルの年別分割

150年分を単一の `koyomi-reference-samples.v0.json` に入れ続けると重くなるため、正本サンプルも年別分割する。

既存の単一JSONを年別へ移す場合は、次を実行する。

```bash
npm run data:koyomi:split-by-year
```

年別分割後の標準配置は以下。

```text
src/data/calendar-notes/koyomi-reference-samples/by-year/1900.json
src/data/calendar-notes/koyomi-reference-samples/by-year/1950.json
src/data/calendar-notes/koyomi-reference-samples/by-year/2000.json
src/data/calendar-notes/koyomi-reference-samples/by-year/2050.json
```

比較・暦注発生マスター生成・開発者画面は、この年別JSONを優先して参照する。旧単一JSONは移行元・バックアップとして残す。

## 1900〜2050年の全期間同期結果

`npm run data:koyomi:sync-range -- --start-year 1900 --end-year 2050` で、1900〜2050年の151年分を一括同期した。

```text
対象年数: 151年
対象日数: 55,152日
正本サンプル: 55,152件
暦注発生マスター: 55,152件
失敗: 0件
```

同期後の監査でも、正本サンプルと暦注発生マスターはどちらも151年・55,152件で一致した。各年の件数も平年365件、うるう年366件で過不足なし。

端点確認として、以下も再照合した。

```text
1900-01: 31/31 一致
2050-12: 31/31 一致
```

`npm run lint` と `npm run build` は通過した。全期間同期直後は、年別正本・月別CSV・検証レポートが増えたことで、Next.jsのビルド時に `src/data` 配下の動的参照が広すぎるという警告が出た。その後、アプリ本体が読むデータと検証用成果物を分離し、動的参照パスも絞ったため、この警告は解消した。

## 本体データと検証成果物の分離

アプリ本体が読むデータは `src/data` に残す。

```text
src/data/calendar-master/by-year/
src/data/calendar-note-occurrences/by-year/
src/data/calendar-notes/koyomi-reference-samples/by-year/
src/data/lunar-calendar/by-year/
src/data/lunar-months/by-year/
```

一方、月別CSVや照合レポートは本体から直接参照しないため、`data-workbench` へ移す。

```text
data-workbench/calendar-notes/fixtures/
data-workbench/calendar-notes/verification-reports/
```

この分離により、`src/data` 配下のファイル数を抑え、Next.jsのビルド対象に検証用成果物が混ざらないようにする。`data-workbench` は再生成可能な作業成果物としてGit管理外にする。

分離後の確認結果。

```text
src/data ファイル数: 933件
data-workbench: 約69MB
2050-12 照合: 31/31 一致
2021-02 主要選日候補レポート: 28/28 一致
npm run lint: OK
npm run build: OK
```
