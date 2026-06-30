# Calendar Master Data

このディレクトリは、`★フォーチューンマイレージマスタ > 年月日` から取り込んだ行データを置く場所です。

## 現在の読み込み元

- `calendar-master-rows.sample.json`
  - 2026-05-16 から 2026-06-14 までの30日分サンプル
  - アプリはこのJSONを読み込み、`src/lib/calendar-day.ts` で暦JSONへ変換します
- `calendar-master/by-year/*.json`
  - `★フォーチューンマイレージマスタ > 年月日` の1900-01-01〜2050-12-31、55,152日分を年別に分割した本体用データ
  - API本体は `src/lib/calendar-master-rows.ts` 経由で必要な年だけサーバー側で読み込みます
  - 一括JSON `calendar-master-rows.1900-2050.json` は約93MBになるため、Git管理せず再生成可能な成果物として扱います
- `solar-terms-2026.json`
  - 国立天文台の2026年二十四節気24件
  - 時刻JST、日時JST、時刻精度、秒精度補完欄、太陽黄経、気学上の節入り判定を保持します
  - 立春は年境界、12節は月境界として判定できるようにします
  - `/api/solar-terms?year=2026` から参照します
- `solar-terms-1900-2050.verified.json`
  - 1900〜2050年の二十四節気3,624件
  - 開発時に天文計算で生成し、国立天文台/万年暦/チェックポイントで検算した本体用静的マスターです
  - アプリ本体はこのJSONを読み、計算ライブラリには依存しません
- `national-holidays-1955-2027.verified.json`
  - 内閣府CSVを正本にした国民の祝日・休日マスター
  - 1955〜2027年の1,067件を保持します
  - `/api/national-holidays?year=2026` から参照します
- `lunar-calendar-2026.sample.json`
  - 旧暦・六曜の30日サンプル
  - 2026-05-16〜2026-06-14を保持します
  - 正式な旧暦マスター化前の接続確認用です
  - `/api/lunar-calendar?year=2026&source=sample` から参照します
- `lunar-months-2026.sample.json`
  - 旧暦月マスターのサンプル
  - 30日サンプルに登場する旧暦3月・旧暦4月を保持します
  - 朔日、次朔、月大小、中気、閏月を検算する正式マスターの入口です
- `calendar-notes/calendar-note-occurrences.sample.json`
  - 日別暦注発生マスターv0
  - 2026-05-16〜2026-06-14の30日分について、十二直、二十八宿、主要選日コード、土用欄を保持します
  - 意味文、吉凶、点数は `src/lib/calendar-notes.ts` の定義マスターから参照します
- `calendar-notes/by-year/*.json`
  - 日別暦注発生マスターを年別に分割した本体接続用データ
  - 1900〜2050年へ拡張しても、必要な年だけサーバー側で読み込みます
- `calendar-notes/generation-input-policy.v0.json`
  - 1900〜2050年の日別暦注発生マスターを生成するための入力方針
  - スプシ抽出、二十四節気、旧暦、干支計算、万年暦検証の役割を分けます
- `lunar-calendar-1900-2050.generated.json`
  - Swiss Ephemerisで朔と中気を計算して生成した1900〜2050年の日次旧暦マスター
  - 55,152日分を保持します
  - 現時点では `calculated` 扱いで、本体接続前の検証データです
- `lunar-months-1900-2050.generated.json`
  - 旧暦月マスター1,869件
  - 朔日、次朔、月大小、中気、閏月の検証基盤です
- `lunar-calendar/by-year/*.json`
  - 1900〜2050年の日次旧暦マスターを年別に分割した本体接続用データ
  - 50MB級の一括JSONを直接importせず、必要な年だけサーバー側で読み込みます
  - `calendar-day` の `lunarCalendar` はこの年別JSONを優先し、見つからない場合だけ30日サンプルへフォールバックします
  - `/api/lunar-calendar?date=YYYY-MM-DD` または `/api/lunar-calendar?year=YYYY` から参照します
- `lunar-months/by-year/*.json`
  - 旧暦月マスターを年別に分割した本体接続用データ
- `solar-boundary-checkpoints.json`
  - 万年暦、国立天文台、将来の天文計算結果を突き合わせるための検証点です
  - 例: 2025年立春 2025-02-03 23:10、2026年立春、2026年芒種
- `kanshi-master.json`
  - 六十干支・納音・空亡・魁罡/準魁罡・異常干支の命式用マスターです
  - `src/lib/kanshi-master.ts` から型安全に参照します
  - 年柱・月柱・日柱・時柱から、納音、空亡、特殊星を引くための基礎データです

## 取り込み方針

1. スプレッドシートから必要範囲をCSVまたはJSONで取り出す
2. 列名をこのJSONのキー名へそろえる
3. `calendar-master-rows.sample.json` と同じ配列形式にする
4. 全期間データは `calendar-master/by-year/{year}.json` へ分割する
5. `calendar-day.ts` の変換ロジックで、表示用・API用の鑑定JSONへ変換する

本体APIは1900〜2050年の全期間に対応します。ただし `start` / `end` 未指定時は、巨大レスポンスを避けるため2026-05-16〜2026-06-14の30日分を初期範囲として返します。

曜日、曜日番号、土日判定はスプレッドシート列から取り込まず、`date` から
`calendarBase` として安定計算します。

## 暦計算の役割分担

日々吉方では、太陽ベースの暦と月ベースの暦を混ぜずに扱います。

| 系統 | 基準 | 主な項目 | 使う場所 | 使わない場所 |
|---|---|---|---|---|
| 二十四節気・節入り | 太陽黄経 | 節入り時刻、直近節入り、節入りからの日数 | 年柱/月柱、月令、蔵干、土用、九星月盤 | 旧暦日付、六曜 |
| 旧暦・六曜 | 朔と中気 | 旧暦月日、朔日、次朔、月大小、閏月、六曜 | 旧暦表示、六曜、旧暦由来の年中行事 | 節入り日数、月柱、蔵干 |

節入り日数は四柱推命・算命学・蔵干計算で重要ですが、旧暦日付を直接生成する材料ではありません。
旧暦は朔日と中気から生成します。

## 蔵干マスター v0

蔵干は流派差が大きいため、当面は以下の分離で扱います。

- `asari_spreadsheet`: `★フォーチューンマイレージマスタ > 蔵干` シートと
  `年月日 Z〜AH` の結果
- `month_law_three_phase_v0`: 一般的な月律分野表を参考にした照合用マスター
- `single_main_v0`: 各支の本気だけを見る簡易照合用マスター

現時点の仮採用方式は `asari_spreadsheet_v0` です。ただし confidence は
`tentative` とし、鑑定JSONや開発者画面では採用方式を必ず明記します。
後からスプシ方式を修正しても、方式IDを差し替えることで比較・移行できる設計にします。

蔵干比較API:

```bash
/api/calendar-day?date=2026-06-06
/api/calendar-note-occurrences?start=2026-05-16&end=2026-06-14
/api/zokan-comparisons?start=2026-05-16&end=2026-06-14
```

`calendar-day` は単日鑑定JSONに `zokanAnalysis` を含めます。
`zokan-comparisons` は複数日の方式差分を返します。

## 土用 v0

土用は、二十四節気マスターの四立を基準に仮計算します。

- 立春前18日間: 冬土用 / 間日: 寅・卯・巳 / 土用殺: 北東
- 立夏前18日間: 春土用 / 間日: 巳・午・酉 / 土用殺: 南東
- 立秋前18日間: 夏土用 / 間日: 卯・辰・申 / 土用殺: 南西
- 立冬前18日間: 秋土用 / 間日: 未・酉・亥 / 土用殺: 北西

現時点では `18_days_before_season_start_v0` として扱い、間日と土用殺方位は
暦注ルールとして保持します。本採用前に手元万年暦で追加検証します。

土用検証API:

```bash
/api/doyo-checks?start=2026-05-16&end=2026-06-14&year=2026
```

v0では、節入り日数を使う蔵干判定はまず月支だけに限定します。スプレッドシートは
年支・月支・日支すべてに節入り日数をlookupしていますが、年支・日支に同じルールを
適用してよいかは保留し、開発者画面で差分を確認します。

参考ソース:

- 四柱推命旺「蔵干分野表」
- きつねの四柱推命「蔵干について」
- 大久保占い研究室「四柱推命・命式自動計算ツール」

国民の祝日・休日CSVを更新する場合は、以下を実行します。

```bash
npm run data:national-holidays
```

取得済みCSVを使う場合は、以下です。

```bash
npm run data:national-holidays -- --input /tmp/syukujitsu.csv --output src/data/national-holidays-1955-2027.verified.json
```

CSVからJSONへ変換する場合は、アプリのルートで以下を実行します。

```bash
npm run data:calendar -- src/data/calendar-master-rows.sample.csv src/data/calendar-master-rows.sample.json
```

日別暦注発生マスターの30日サンプルを再生成する場合は、以下を実行します。

```bash
npm run data:calendar-notes -- src/data/calendar-master-rows.sample.json src/data/calendar-notes/calendar-note-occurrences.sample.json
npm run data:calendar-notes:split -- --input src/data/calendar-notes/calendar-note-occurrences.sample.json --output-dir src/data/calendar-notes/by-year
```

1900〜2050年へ拡張する入力方針は以下にまとめます。

```text
docs/calendar-note-generation-input-policy.md
src/data/calendar-notes/generation-input-policy.v0.json
```

範囲指定に対応した生成スクリプト雛形は以下です。

```bash
npm run data:calendar-notes:generate-range -- \
  --calendar-master src/data/calendar-master-rows.sample.json \
  --output /tmp/calendar-note-occurrences.generate-range.json \
  --start-date 2026-05-16 \
  --end-date 2026-06-14

npm run data:calendar-notes:generate-range -- \
  --calendar-master src/data/calendar-master-rows.sample.json \
  --output-dir /tmp/calendar-notes-by-year-generate-range \
  --start-year 2026 \
  --end-year 2026 \
  --split-by-year
```

国立天文台から二十四節気JSONを生成する場合は、以下を実行します。

```bash
npm run data:solar-terms -- --year 2026 --output src/data/solar-terms-2026.json
```

複数年をまとめて生成する場合は、以下を実行します。

```bash
npm run data:solar-terms -- --start-year 2024 --end-year 2027 --output /tmp/solar-terms-2024-2027.generated.json
```

既存データと生成データを比較する場合は、以下を実行します。

```bash
npm run data:solar-terms -- --year 2026 --output /tmp/solar-terms-2026.generated.json
npm run data:compare-json -- src/data/solar-terms-2026.json /tmp/solar-terms-2026.generated.json
```

境界チェックポイントと二十四節気マスターを照合する場合は、以下を実行します。

```bash
npm run data:verify-boundaries -- --solar-terms src/data/solar-terms-2026.json
```

複数年生成データで厳密に照合する場合は、以下を実行します。

```bash
npm run data:solar-terms -- --start-year 2024 --end-year 2027 --output /tmp/solar-terms-2024-2027.generated.json
npm run data:verify-boundaries -- --solar-terms /tmp/solar-terms-2024-2027.generated.json --strict
```

1900〜2050年の取得元カバレッジを監査する場合は、以下を実行します。

```bash
npm run data:audit-solar-sources -- --start-year 1900 --end-year 2050 --output /tmp/solar-term-source-audit-1900-2050.json
```

1900〜2050年の旧暦マスターを生成する場合は、検証用の `sweph` を本体外の一時ディレクトリに用意してから実行します。

```bash
npm run data:lunar-calendar:sweph -- \
  --start-year 1900 \
  --end-year 2050 \
  --days-output src/data/lunar-calendar-1900-2050.generated.json \
  --months-output src/data/lunar-months-1900-2050.generated.json \
  --sweph-module /tmp/hibi-kippo-sweph/node_modules/sweph
```

生成後の検証は以下です。

```bash
npm run data:lunar-calendar:verify
```

本体接続用に年別JSONへ分割する場合は以下です。

```bash
npm run data:lunar-calendar:split
```

現在の検証結果:

| 項目 | 結果 |
|---|---:|
| 生成日数 | 55,152日 |
| 旧暦月数 | 1,869月 |
| 範囲 | 1900-01-01〜2050-12-31 |
| 30日サンプル照合 | 差分0 |

この生成データはまだ `verified` ではなく `calculated` です。公開用の正本へ昇格する前に、手元万年暦・第三者旧暦表・重要年のサンプリングで追加検算します。

本体への接続方針:

- 一括JSONを画面や通常APIで静的importしない
- `/api/lunar-calendar-generated?date=YYYY-MM-DD` で1日単位に取得する
- `/api/lunar-calendar-generated?year=YYYY` で年単位に取得する
- `/api/lunar-calendar-generated?year=2026&compareSample=1` で生成旧暦と
  サンプル旧暦を比較する
- `src/lib/lunar-calendar-generated.ts` はサーバー側で年別JSONだけを読み、年単位でメモリキャッシュする
- 将来Supabaseへ移す場合も、この年別JSONをDB投入元として使える

旧暦データの採用ルール:

1. Swiss Ephemerisなどで `calculated` データを生成する
2. 開発者画面で「生成旧暦」と「サンプル旧暦」を比較する
3. 旧暦表示・六曜など採用判定に使う差分と、月大小など参考差分を分ける
4. 手元万年暦、第三者旧暦表、重要年サンプリングで追加検算する
5. 差分が説明可能になったものだけを `verified` マスターへ昇格する

この段階では、生成データをいきなり本採用しない。まず開発者画面で比較し、
差分の性質を分類してから採用判断する。

現在の分類結果:

| 区分 | 年数 | 方針 |
|---|---:|---|
| HTML候補 | 9年 | 国立天文台HTMLから機械抽出 |
| PDFアーカイブ | 64年 | 天文計算を主軸にし、PDFで抜き打ち照合 |
| 図書室画像アーカイブ | 55年 | 天文計算を主軸にし、画像/万年暦でサンプリング照合 |
| 未来未公開 | 23年 | 天文計算で生成し、将来公開後に照合 |

## 注意

- AZ-BN相当の暦注系データは現時点では `legacyRaw` として保持します。
- 十二直・二十八宿は `src/lib/calendar-notes.ts` で v0 マスターへ昇格済みです。
  意味文・吉凶・向くこと/注意は暫定で、手元万年暦と専門資料で追加検証します。
- 正式な暦注は、今後 `暦注名 / 判定 / 意味 / 吉凶 / 表示文 / AI解析用説明 / 注意表現` の別マスターから参照します。
- 二十四節気などの外部検算は、国立天文台を優先ソースとして差分記録する方針です。
- 二十四節気の公式時刻は年月日マスターへ直書きせず、独立した `solar_terms` マスターから合流します。
- 国立天文台ページはShift_JISのため、取得スクリプト側でUTF-8へ変換してJSON化します。
- 未来年は国立天文台の年別ページが未公開の場合があります。未公開年は404になるため、公開済み範囲で取得します。
- 節入りは日付単位ではなく、太陽黄経が指定角度を越える瞬間です。命式計算では出生時刻と境界時刻を比較します。
- `datetimeJstPrecision = minute` の場合、境界時刻付近の出生判定には秒単位補完が必要です。
- Swiss Ephemerisなどの天文計算は、本体に直結する前に検証スクリプトで差分を確認します。
- 旧暦は1900〜2050年の生成データを本体接続済みですが、朔日、閏月、月大小の検算を継続します。
- 六曜は旧暦月日から算出し、1900〜2050年の年別JSONで本体に接続します。
- 旧暦正式マスターは日次用 `LunarCalendarDayMasterEntry` と月検証用
  `LunarMonthMasterEntry` に分けます。
- 旧暦正式化では、六曜より先に `newMoonDate`、`isLeapMonth`、
  `monthSize`、`containsChuki` を検算します。
- `/api/lunar-calendar?year=2026` は、生成済み日次旧暦マスターを返します。
- `/api/lunar-calendar?year=2026&source=sample` は、30日サンプル、月マスター、検証結果をまとめて返します。

## Swiss Ephemeris検証

本体アプリへSwiss Ephemerisを組み込む前に、検証用スクリプトで太陽黄経15度刻みの通過時刻を計算します。

方針:

- Swiss Ephemeris / `sweph` は本体アプリに組み込まない。
- 開発時の生成・検証用途に限定する。
- 本体アプリは、検算済みの静的JSONマスターだけを読む。
- 公開前に、生成済みデータとライセンスの扱いを再確認する。

```bash
npm run data:solar-boundaries:sweph -- \
  --start-year 2025 \
  --end-year 2026 \
  --output /tmp/solar-boundaries-sweph-2025-2026.json \
  --sweph-module /tmp/hibi-kippo-sweph/node_modules/sweph
```

検証済みの結果:

| 境界 | Swiss計算の秒単位 | 分丸め | 検算 |
|---|---:|---:|---|
| 2025年立春 | 2025-02-03 23:10:28 JST | 23:10 | 手元万年暦と一致 |
| 2026年立春 | 2026-02-04 05:02:08 JST | 05:02 | 国立天文台/万年暦と一致 |
| 2026年芒種 | 2026-06-06 00:48:22 JST | 00:48 | 国立天文台/万年暦と一致 |

注意:

- 現在の検証は `SEFLG_MOSEPH` によるMoshier計算です。
- 高精度エフェメリスファイルを導入した場合は `--ephe-path` を指定し、`SEFLG_SWIEPH` で再検算します。
- `sweph` はAGPL/LGPLデュアルライセンス系のため、本体組み込み前にライセンス確認が必要です。

本体用マスターへ変換する場合は、生成ライブラリの詳細メタ情報を落として `verified_master` として保存します。

```bash
npm run data:solar-boundaries:strip -- \
  /tmp/solar-boundaries-sweph-2025-2026.json \
  /tmp/solar-boundaries-verified-2025-2026.json
```

1900〜2050年の本体用マスターを再生成する場合は、以下です。

```bash
npm run data:solar-boundaries:sweph -- \
  --start-year 1900 \
  --end-year 2050 \
  --output /tmp/solar-boundaries-sweph-1900-2050.json \
  --sweph-module /tmp/hibi-kippo-sweph/node_modules/sweph

npm run data:solar-boundaries:strip -- \
  /tmp/solar-boundaries-sweph-1900-2050.json \
  src/data/solar-terms-1900-2050.verified.json
```

本体反映済み:

- `src/lib/solar-terms.ts` は `solar-terms-1900-2050.verified.json` を読み込みます
- `/api/solar-terms?year=1900` から `/api/solar-terms?year=2050` まで参照できます
- 各年24件、合計3,624件です

### 入梅・半夏生の太陽黄経生成

入梅と半夏生は二十四節気ではないため、雑節側で太陽黄経80度/100度の通過時刻として扱います。
本体アプリにはSwiss Ephemerisを組み込まず、開発時の生成・検証用途に限定します。

```bash
npm run data:zassetsu-solar-longitudes:sweph -- \
  --start-year 1900 \
  --end-year 2050 \
  --output src/data/zassetsu-solar-longitudes-1900-2050.verified.json \
  --sweph-module /tmp/hibi-kippo-sweph/node_modules/sweph
```

本体反映方針:

- `src/lib/zassetsu.ts` は `zassetsu-solar-longitudes-1900-2050.verified.json` に該当年の入梅・半夏生があれば直接計算値を優先します
- 生成値がない年は、従来どおり前後の二十四節気からの補間v0を表示します
- 生成値はまず `ephemeris_candidate_v0` とし、keisan.siteまたは手元万年暦で照合後に段階採用します
- 正本サンプルは `src/data/zassetsu-solar-longitude-reference-samples.v0.json` に保持します
- 2026年の入梅・半夏生は国立天文台「二十四節気・雑節」の日付・時刻と一致したため `verified_external_reference` として表示します
- 1950〜2050年の入梅・半夏生は、高精度計算サイト「雑節」の日付正本202件と差分0件で一致したため `verified_external_date_reference` / `date_verified` として表示します
- 高精度計算サイトは日付のみのため、時刻までの検証は国立天文台公開範囲または手元万年暦のサンプルで追加します
- 国立天文台の公開範囲2009〜2027年は時刻つき正本38件を追加済みです。37件は時刻まで一致し、2018年入梅のみ1分差のため差分保留にしています

keisan.siteの日付正本サンプルを取得する場合は、以下を実行します。

```bash
npm run data:zassetsu:fetch-keisan -- \
  --start-year 1950 \
  --end-year 2050 \
  --output /tmp/zassetsu-keisan-1950-2050.json
```

国立天文台の時刻つき正本サンプルを取得・マージする場合は、以下を実行します。

```bash
npm run data:zassetsu:fetch-naoj -- \
  --start-year 2009 \
  --end-year 2027 \
  --output /tmp/zassetsu-naoj-2009-2027.json

npm run data:zassetsu:merge-references -- \
  --base src/data/zassetsu-solar-longitude-reference-samples.v0.json \
  --incoming /tmp/zassetsu-naoj-2009-2027.json \
  --output src/data/zassetsu-solar-longitude-reference-samples.v0.json
```
