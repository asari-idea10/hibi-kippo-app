# 1900〜2050年 暦注発生マスター生成入力方針 v1

## 目的

`calendar_note_occurrences` を30日サンプルから、1900〜2050年の年別JSONへ拡張する。

この段階では「すべてを一気に計算で再現する」ことを目的にしない。暦注ごとに入力ソースと検証方法を分け、確実に広げられるものから本体化する。

## 生成対象

出力先:

```text
src/data/calendar-notes/by-year/1900.json
...
src/data/calendar-notes/by-year/2050.json
```

出力形式:

```ts
type CalendarNoteOccurrenceYearMaster = {
  schemaVersion: "calendar_note_occurrences.v0";
  year: string;
  range: {
    start: string | null;
    end: string | null;
    count: number;
  };
  sourceStatus: "sample" | "calculated" | "hybrid" | "verified";
  verificationStatus:
    | "legacy_spreadsheet"
    | "rule_checked"
    | "manual_almanac_checked"
    | "needs_review";
  note: string;
  days: CalendarNoteOccurrenceDay[];
};
```

## 入力ソース分類

| 分類 | 入力 | 使い道 |
|---|---|---|
| S1: 既存スプシ抽出 | `★フォーチューンマイレージマスタ > 年月日` | 既存の暦注結果を移行する |
| S2: 天文・太陽暦マスター | `solar-terms-1900-2050.verified.json` | 土用、節分、彼岸、八十八夜など |
| S3: 旧暦マスター | `lunar-calendar/by-year/*.json` | 六曜、旧暦行事、旧暦由来の雑節 |
| S4: 干支・通し番号 | `calendar-master` または独自干支計算 | 甲子、庚申、己巳、八専、十方暮など |
| S5: 定義マスター | `calendar-notes.ts` | 意味、吉凶、点数、AI説明 |
| S6: 手元万年暦 | 書籍画像・手動照合 | 差分検証、流派差確認 |

## 暦注別の入力方針

### まずスプシ抽出を正本にするもの

既存マスターに結果が入っており、30日サンプルで発生マスター化済みのもの。

| code | 名称 | 初期入力 | 1900〜2050方針 |
|---|---|---|---|
| `junichoku` | 十二直 | 外部検証正本/スプシ/計算 | こよみのページ・暦注.com・万年暦確認値を最優先。次にスプシ値、空欄は月支・日支から計算補完 |
| `nijuhachishuku` | 二十八宿 | 外部検証正本/スプシ/計算 | こよみのページ・暦注.com・万年暦確認値を最優先。次にスプシ値、空欄は28日周期で計算補完 |
| `ichiryumanbaibi` | 一粒万倍日 | 外部検証正本/スプシ | 2021-02-03をこよみのページで確認。未確認日はスプシ抽出を先行。ルール式は後続 |
| `fujoju` | 不成就日 | スプシ | 旧暦ベースのため、旧暦マスター接続後に計算検算 |
| `sanrinbou` | 三隣亡 | スプシ | スプシ抽出を先行。節月/支ルールで後続検算 |
| `hassen` | 八専 | スプシ | 干支番号から計算可能。まずスプシ、後で計算検算 |
| `jippo_gure` | 十方暮 | スプシ | 干支番号から計算可能。まずスプシ、後で計算検算 |
| `tenichi_tenjo` | 天一天上 | スプシ | 干支番号から計算可能。まずスプシ、後で計算検算 |
| `roujitsu` | 老日 | スプシ | ルール差があり得るためスプシ抽出優先 |
| `kasshi` | 甲子 | スプシ/干支 | 干支が甲子の日で計算可能 |
| `koushin` | 庚申 | スプシ/干支 | 干支が庚申の日で計算可能 |
| `shinnyu` | 神吉日 | スプシ | 採用ルール確認後に計算検算 |
| `tsuchinoto_mi` | 己巳 | スプシ/干支 | 干支が己巳の日で計算可能 |
| `tensha_bi` | 天赦日 | スプシ | 節月・日干支ルールで後続検算 |
| `otsuchi_start` | 大土始まり | 外部参照 | 1976-03-19で接続。大土/小土期間ルールは後続検算 |
| `daimyo_nichi` | 大明日 | 外部参照/スプシsummary | 1976-03-19で接続。正式ルールは後続検算 |
| `tenon_nichi` | 天恩日 | 外部参照/スプシsummary | 2021-02-03で接続。正式ルールは後続検算 |
| `jikabi` | 地火日 | 外部参照 | 1976-03-19で接続。正式ルールは後続検算 |
| `taika_nichi` | 大禍日 | 外部参照 | 1976-03-19で接続。正式ルールは後続検算 |

### 計算マスターから生成するもの

既にアプリ内に信頼できる入力があるため、スプシ抽出だけに依存しない。

| code | 名称 | 入力 | 方針 |
|---|---|---|---|
| `doyo` | 土用 | 二十四節気 | 四立前18日v0で生成し、万年暦で検証 |
| `doyo_manichi` | 土用間日 | 土用期間 + 日支 | 土用期間中の日支で判定 |
| `doyo_satsu` | 土用殺 | 土用季節 | 季節別方位を付与 |
| `setsubun` | 節分 | 立春前日 | 二十四節気から生成 |
| `higan` | 彼岸 | 春分/秋分 | 春分・秋分を中心に生成 |
| `hachijuhachiya` | 八十八夜 | 立春起算 | 立春から88日目 |
| `nyubai` | 入梅 | 太陽黄経/暦要項 | 方針検討。国立天文台相当の定義を優先 |
| `hangesho` | 半夏生 | 太陽黄経 | 二十四節気系の計算に寄せる |
| `nihyakutoka` | 二百十日 | 立春起算 | 立春から210日目 |
| `nihyakuhatsuka` | 二百二十日 | 立春起算 | 立春から220日目 |

### 保留・要検証

| 名称 | 理由 |
|---|---|
| 母倉日 | スプシ summary に存在。正式コード化はルール確認後 |
| 月徳日 | スプシ summary に存在。正式コード化はルール確認後 |
| 大土・小土 | 1976-03-19 の外部参照で大土始まりを確認。正式コード化はルール確認後 |
| 大明日 | スプシ summary・外部参照に存在。正式コード化はルール確認後 |
| 地火日 | 1976-03-19 の外部参照で確認。正式コード化はルール確認後 |
| 大禍日 | 1976-03-19 の外部参照で確認。正式コード化はルール確認後 |
| 天恩日 | 2021-02-03 の外部参照で確認。正式ルールは後続検算 |
| 重日 | スプシ summary に存在。正式コード化はルール確認後 |
| 五墓 | スプシ summary に存在。正式コード化はルール確認後 |
| 復日 | スプシ summary に存在。正式コード化はルール確認後 |
| 滅門日 | スプシ summary に存在。正式コード化はルール確認後 |

## 実装順

### Step 1: スプシ抽出ルート

既存の `calendar-master-rows` 形式を1900〜2050年へ広げ、暦注列から `calendar_note_occurrences` を生成する。

目的:

- まず既存マスターの知識資産を失わない
- 計算式が未確定の暦注も広げられる
- 差分検証の土台を作る

### Step 2: 計算検算ルート

干支番号、二十四節気、旧暦から計算できる暦注を別ルートで生成し、スプシ抽出結果と比較する。

比較結果:

```ts
diffs: [
  "ichiryumanbaibi: spreadsheet=true / calculated=false"
]
```

差分が出た場合は、消さずに保持する。

### Step 3: verified昇格

次の条件を満たした暦注から `verified` 扱いにする。

1. スプシ結果と計算結果が一致
2. 手元万年暦のサンプリング検証で一致
3. 流派差がある場合、採用方式IDを明記

## 生成スクリプト方針

最終的なコマンド案:

```bash
npm run data:calendar-notes:generate-range -- \
  --calendar-master src/data/calendar-master-rows.1900-2050.json \
  --solar-terms src/data/solar-terms-1900-2050.verified.json \
  --lunar-dir src/data/lunar-calendar/by-year \
  --output-dir src/data/calendar-notes/by-year \
  --start-year 1900 \
  --end-year 2050
```

初期実装では `--calendar-master` を必須にする。

将来的には、スプシ依存を減らし、計算可能な暦注から順に `--calendar-master` なしでも生成できるようにする。

## 注意点

- 暦注の意味文は日次JSONへ入れない
- 日次JSONにはコードと検証状態だけを入れる
- 流派差がある暦注は `method` または `verificationStatus` で区別する
- 未来年の祝日とは分離する
- 1900〜2050生成後も、最初は `verified` ではなく `hybrid` として扱う
- 二十八宿の `氏` は正式名 `氐` へ正規化する
- 十二直の日次カレンダー値は、確認済み値を優先し、空欄日は日付単位の節月支で補完する
- 節入り当日の十二直は、日付単位切替と時刻単位切替の差分を保持する
- 出生時刻を扱う命式計算では、日次カレンダー値とは別に節入り時刻で年/月を切り替える

## 次の実装候補

1. `calendar-note-generation-input-policy.v0.json` を作る
2. `data:calendar-notes:generate-range` のスクリプト雛形を作る
3. まず30日サンプルで `generate-range` が既存出力と同じJSONを作れるか確認する
