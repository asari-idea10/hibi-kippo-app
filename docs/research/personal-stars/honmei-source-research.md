# 本命星 source research ledger

調査日: 2026-07-18

作業区分: `documentation_only`

Decision基盤: D-0020

状態: `source_ledger` / production未接続

## 1. 目的と境界

本命星について、歴史的専門資料の記述、PO/project方針、現行daily master bindingを分離して保存する。本台帳は`SourceClaim`の調査記録であり、`RuleDefinition`、production master、API、UI、本命殺・本命的殺、candidate、ranking、warningを実装・変更しない。

確認資料は近代日本の気学専門資料であり、古代古典または全流派共通規則とは扱わない。

## 2. 主要資料

| field | value |
| --- | --- |
| source ID | `source.sonoda.kaisei-hoi-meikan.1934.ed4` |
| title | 『改正方位明鑑』 |
| author / editor | 園田真次郎 編 |
| edition | 第4版 |
| publisher | 大正館 |
| publication year | 1934（昭和9） |
| extent | 100p ; 19cm |
| NDL bibliographic ID | `000000637950` |
| NDL persistent ID | `info:ndljp/pid/1102174` |
| DOI | `10.11501/1102174` |
| location | https://dl.ndl.go.jp/pid/1102174 |
| source type | `historical_calendar` / historical specialist source |
| rights | NDL表示 `pdm`、インターネット公開 |

確認範囲:

- 「三、本命星を知る法」付近（本文p.7相当）: 出生時に中宮する年・月・日・時の星を出生者の本命として扱う説明。
- 本文p.8相当: 陰暦・陽暦ではなく立春時刻前後で年月の分界を定める説明。
- 「九星早繰り法」付近（本文p.48相当）: 年星循環を求める手順。

必要最小限の原文:

> 「立春時刻の前後によって年月の分界を定むる」

現代語要約:

- 出生時に対応する年星を人物の本命として固定する。
- 年月の境界は暦上の日付名だけでなく、立春の実際の時刻前後で区切る。
- 年家九星は循環表・早繰り手順により決定される。

## 3. SourceClaim

### 3.1 出生年星と本命

```yaml
claimId: source-claim.sonoda-1934.honmei-birth-center.v1
sourceClaimVersion: v1
claimType: source_fact
claim: 出生時に中宮する年星を人物の本命として扱う
sourceVerificationStatus: confirmed_for_sonoda_lineage
projectAdoptionStatus: provisional
productionConnectionStatus: not_connected
```

このclaimは園田系統の資料について確認済みである。すべての流派に共通する絶対規則とは記録しない。

### 3.2 立春時刻による年界

```yaml
claimId: source-claim.sonoda-1934.risshun-timestamp-boundary.v1
sourceClaimVersion: v1
claimType: source_fact
claim: 立春の正確な時刻前後で出生年の採用区分を分ける
sourceVerificationStatus: confirmed_for_sonoda_lineage
projectAdoptionStatus: provisional
productionConnectionStatus: not_connected
boundary: exact_risshun_timestamp
```

### 3.3 年家九星cycle

```yaml
claimId: source-claim.jingukan-1935.annual-nine-star-cycle.v1
sourceClaimVersion: v1
claimType: calculation_rule
claim: 年家九星を循環で決定する
sourceVerificationStatus: confirmed
projectAdoptionStatus: pending
productionConnectionStatus: not_connected
```

関連資料は高島易断所本部神宮館編纂『九星暦術一代運気活断口伝書』（1935年）の「年家九星起例」付近。年循環は確認できたが、現在一般化される西暦数字和の簡略式を同資料本文で確認したことにはしない。

### 3.4 節気時刻dataset

```yaml
claimId: source-claim.naoj.solar-term-instants.v1
sourceClaimVersion: v1
claimType: source_fact
claim: 二十四節気は太陽黄経が所定値となる瞬間として時刻を持つ
sourceVerificationStatus: confirmed
projectAdoptionStatus: adopted
adoptionScope: timestamp_reference_only
productionConnectionStatus: not_connected
```

国立天文台暦計算室の暦要項・二十四節気解説を時刻datasetとして参照する。国立天文台は本命星規則のsourceではなく、境界eventの時刻情報源である。

## 4. ProjectClaim候補

```yaml
claimId: project-claim.honmei-boundary-at-risshun.v1
projectClaimVersion: v1
claimType: po_specification
summary: 本命星の精密計算では立春の正確なJST時刻で採用年を切り替える
projectAdoptionStatus: provisional
relatedSourceClaimIds:
  - source-claim.sonoda-1934.risshun-timestamp-boundary.v1
  - source-claim.naoj.solar-term-instants.v1
productionConnectionStatus: not_connected
```

source確認済みであっても、project adoptionおよびproduction connectionを自動で昇格させない。

## 5. 本命星の概念関係

| concepts | value relation | concept relation | merge |
| --- | --- | --- | --- |
| `yearKyusei` vs annual plate center star | `same_value` | `same_concept` | rule/value共有可 |
| `yearKyusei` vs honmei star | `same_value` | `distinct_role` | Technique統合不可 |
| annual plate center star vs honmei star | `same_value` | `distinct_role` | Technique統合不可 |

年盤中宮星は期間に属する盤の値、本命星は出生年星を人物属性として固定した値である。値を共有しても、時間盤と人物占技の役割を統合しない。

## 6. 境界比較例

source rule resultとcurrent daily master resultを別laneで記録する。時刻はJST。

| case | exact boundary | source rule result | current daily master result | status |
| --- | --- | --- | --- | --- |
| 2024立春直前 | `2024-02-04T17:27:08`直前 | 旧年星4 | 2月4日終日を新年星3 | `implementation_gap` |
| 2024立春以後 | 同時刻以後 | 新年星3 | 新年星3 | `match_after_boundary` |
| 2025立春直前 | `2025-02-03T23:10:28`直前 | 旧年星3 | 2月3日終日を新年星2 | `implementation_gap` |
| 2025立春以後 | 同時刻以後 | 新年星2 | 新年星2 | `match_after_boundary` |
| 2026立春直前 | `2026-02-04T05:02:08`直前 | 旧年星2 | 2月4日終日を新年星1 | `implementation_gap` |
| 2026立春以後 | 同時刻以後 | 新年星1 | 新年星1 | `match_after_boundary` |
| 1900立春直前 | `1900-02-04T14:51:29`直前 | 旧年星2 | 2月4日終日を旧年星2 | `match_before_boundary` |
| 1900立春以後 | 同時刻以後 | 新年星1 | 2月5日から新年星1 | `implementation_gap` |
| PO生年月日 | `1976-03-19` | 立春後の年星6 | daily master年星6 | `match` |
| 年始・立春前 | `2026-01-01` | 2025年扱いの年星2 | daily master年星2 | `match` |

1900年だけ翌日切替となる理由は`unresolved`であり、丸め、timezone、転記誤りと推測しない。

## 7. current implementation binding

```text
birthDate
→ daily master row
→ yearKyusei
→ honmeiStar
→ personal context
```

```yaml
implementationResolution: date
currentBehavior: daily_master_value_used_for_entire_day
exactTimestampSupport: false
birthTimeUsed: false
timezoneUsed: false
locationUsed: false
implementationStatus: implementation_observed
```

daily master、existing implementation、現行regression testはSourceClaimではない。用途はimplementation binding、source/project ruleとの比較、回帰保護に限定する。

## 8. birthTime・timezone・対応範囲

境界日に`birthTime`がない場合:

```yaml
precisionStatus: date_only
exactBoundaryResult: unresolved
fallbackStar: none
currentImplementationResult: available_in_separate_lane
```

0時、正午、23時、多数側、current daily master値をexact resultとして補完しない。

```yaml
timezoneResolution: assumed_jst
supportedRange: 1900-2050
outsideRangeStatus: unsupported
outsideRangeReason: outside_verified_master_range
```

overseas birth、DST、longitude correction、true solar time、equation of timeは未対応であり、推測計算しない。

## 9. 未解決事項

- 園田系統とは独立した専門資料による立春時刻境界の確認。
- 年家九星の歴史的cycleと西暦簡略計算式の同値証明。
- 1900年daily master翌日切替の理由。
- 1900年以前・2050年以後へ拡張する際のepoch、暦法、timezone policy。
- 流派差と例外規則の整理。

これらは本source ledgerの作成を妨げないが、全流派共通claim、production接続、range拡張の根拠には使用しない。
