# 月命星 source research ledger

調査日: 2026-07-18

作業区分: `source_ledger` / D-0021 `provenance_registry`

Decision基盤: D-0020 / D-0021

状態: `source_ledger` / production未接続

## 1. 目的と境界

月家九星の36対応、12節による月替わり、現代の月命星への人物属性化を別claimとして保存する。本台帳はsource調査記録を正本とし、D-0021で制限付きprovenance registryへ接続した。月盤中宮星と月命星を同一TechniqueDefinitionへ統合せず、production、傾斜、candidate、ranking、warning、UIは変更しない。

確認資料は近代日本の気学専門資料であり、古代古典または全流派共通規則とは扱わない。

## 2. 主要資料

| field | value |
| --- | --- |
| source ID | `source.jingukan.kyusei-rekijutsu.1935` |
| title | 『九星暦術一代運気活断口伝書』 |
| author / editor | 高島易断所本部神宮館 編纂 |
| publisher | 高島易断所本部神宮館 |
| publication year | 1935（昭和10） |
| extent | 212p ; 23cm |
| NDL bibliographic ID | `000000637923` |
| NDL persistent ID | `info:ndljp/pid/1102165` |
| DOI | `10.11501/1102165` |
| location | https://dl.ndl.go.jp/pid/1102165 |
| source type | `historical_calendar` / historical specialist source |
| rights | NDL表示 `pdm`、インターネット公開 |

確認範囲:

- 「年家九星起例」付近（本文p.14相当）: 年家九星cycle。
- 「月家九星起例」付近（本文p.15〜16相当）: 3年支群、12月系列、月家九星の36対応。
- 本文p.16相当: 朔日ではなく二十四節気の節替りで月家九星を切り替える説明。
- 本文p.17相当: 月の干支表と月区分。

必要最小限の原文識別語:

> 「月家九星起例」「節替り」

現代語要約:

- 年支を3群に分け、各群に12月の月家九星系列を割り当てる。
- 月家九星は旧暦月の朔日ではなく、立春・啓蟄等の12節で交替する。
- 本文は`月家九星`を説明するが、現代の`月命星`というTechnique名称と人物属性化の体系的定義までは確認できない。

## 3. 36対応

月順は寅・卯・辰・巳・午・未・申・酉・戌・亥・子・丑。

| year branch group | 寅 | 卯 | 辰 | 巳 | 午 | 未 | 申 | 酉 | 戌 | 亥 | 子 | 丑 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 子・卯・午・酉 | 8 | 7 | 6 | 5 | 4 | 3 | 2 | 1 | 9 | 8 | 7 | 6 |
| 丑・辰・未・戌 | 5 | 4 | 3 | 2 | 1 | 9 | 8 | 7 | 6 | 5 | 4 | 3 |
| 寅・巳・申・亥 | 2 | 1 | 9 | 8 | 7 | 6 | 5 | 4 | 3 | 2 | 1 | 9 |

```yaml
yearGroupByTwelveBranches: confirmed
monthlyNineStarTable36: confirmed
currentFixtureMatch: confirmed
inputExpansion9HonmeiBy12Months: verified_as_108_to_36_value_mapping
modernGetsumeiConceptBinding: partially_confirmed
```

9本命星×12月支の108入力が36値へ集約されることは、現行fixtureとのimplementation verificationである。原資料が「本命星groupから現代の月命星を求める」と説明した証拠には置き換えない。

## 4. SourceClaim

### 4.1 36対応

```yaml
claimId: source-claim.jingukan-1935.monthly-nine-star-36.v1
sourceClaimVersion: v1
claimType: calculation_rule
claim: 3年支群ごとに12月の月家九星系列を割り当てる
sourceVerificationStatus: confirmed
projectAdoptionStatus: provisional
productionConnectionStatus: not_connected
```

### 4.2 12節による月替わり

```yaml
claimId: source-claim.jingukan-1935.monthly-setsu-boundary.v1
sourceClaimVersion: v1
claimType: source_fact
claim: 月家九星は朔日ではなく12節の節替りで交替する
usesTwelveSetsuNotChuki: confirmed
switchesAtLunarMonthStart: rejected
exactTimestampForAllTwelveSetsu: partially_confirmed
projectAdoptionStatus: provisional
productionConnectionStatus: not_connected
```

資料は節替りを明記するが、全12節について秒・分精度の正確な瞬間を境界とすることを独立して明記した専門資料は未確認である。

### 4.3 現代の月命星用語・人物属性化

```yaml
claimId: source-claim.tomihisa-institutional.getsumei-personal-role.v1
sourceClaimVersion: v1
sourceType: institutional_specialist_source
materialType: institutional_specialist_article
institution: 一般財団法人 東洋運勢学会
lineageRelevance: trusted_for_project
claimType: source_fact
claim: 出生月の月家九星を現代の月命星として人物属性化する
sourceVerificationStatus: partially_confirmed
projectAdoptionStatus: adopted
productionConnectionStatus: not_connected
```

東洋運勢学会の記事本文から、月命星を出生月の人物属性として扱い、本命星との組合せを傾斜判断へ用いる関係を確認した。専門書本文の確認前なので`confirmed`には上げない。旧候補`source-claim.modern-getsumei-terminology.v1`は本台帳の探索履歴として残るが、実装registryでは記事本文claimへ置き換え、同学会の未記載見解を補完しない。

### 4.4 節気時刻dataset

`source-claim.naoj.solar-term-instants.v1`を参照する。国立天文台は節気eventの時刻情報源であり、月命星の占術規則のsourceではない。

### 4.5 ProjectClaim候補

```yaml
claimId: project-claim.getsumei-boundary-at-setsuiri.v1
projectClaimVersion: v1
claimType: po_specification
summary: 月命星の精密計算では12節の正確なJST時刻で採用月を切り替える
projectAdoptionStatus: provisional
relatedSourceClaimIds:
  - source-claim.jingukan-1935.monthly-setsu-boundary.v1
  - source-claim.naoj.solar-term-instants.v1
productionConnectionStatus: not_connected
```

全12節のexact timestampが`partially_confirmed`である間は、source確認済みまたはproduction採用済みへ昇格させない。

## 5. 月盤との概念関係

| concepts | value relation | concept relation | shared rule / lookup | Technique merge |
| --- | --- | --- | --- | --- |
| `monthKyusei` vs monthly plate center star | `same_value` | `same_concept` | allowed | month-period側で可 |
| `monthKyusei` vs getsumei star | `same_value` | `distinct_role` | allowed | not allowed |
| monthly plate center star vs getsumei star | `same_value` | `derived_personal_attribute` / `distinct_role` | allowed | not allowed |

```text
月盤中宮星
  = 対象期間に属する月盤の中心星

月命星
  = 出生月の月家九星を人物属性として固定した星
```

採用方向:

- 月家九星の計算Rule・36 lookupは共有可能。
- 人物属性化は`getsumei role binding`として別Ruleにする。
- 月命星と月盤を一つのTechniqueDefinitionへ統合しない。

推奨Rule ID（今回はコード登録しない）:

- `rule.personal.getsumei-from-year-group-and-setsu-month.v1`
- `rule.personal.getsumei-role-binding.v1`

## 6. 月境界評価

```yaml
usesTwelveSetsuNotChuki: confirmed
switchesAtLunarMonthStart: rejected
exactTimestampForAllTwelveSetsu: partially_confirmed
modernGetsumeiConceptBinding: partially_confirmed
projectAdoptionStatus: provisional
productionConnectionStatus: not_connected
```

2026年小暑の比較例:

| JST | source/project provisional lane | current daily master lane | status |
| --- | --- | --- | --- |
| `2026-07-07T10:56:56+09:00` | 午月・月家九星4 | 未月・`monthKyusei` 3 | `implementation_gap` |
| `2026-07-07T10:56:57+09:00` | 未月・月家九星3 | 未月・`monthKyusei` 3 | `value_match` |
| `2026-07-07T10:56:58+09:00` | 未月・月家九星3 | 未月・`monthKyusei` 3 | `value_match` |

exact timestamp laneはproject provisionalであり、現代月命星のsource-confirmed出力とはまだ呼ばない。

## 7. current implementation binding

```text
birthDate
→ daily master row
→ yearKyusei
→ duplicateMonth
→ monthKyusei
→ getsumeiStar argument
→ getKeishaProfile
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

daily master、existing implementation、36/108 regression、55,152日invariantはSourceClaimではない。sourceとの比較およびcurrent behaviorの回帰保護に限定する。

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

## 9. 追加調査キュー

### P0

1. 全12節について、月家九星が各節の正確な時刻に切り替わることを明記した独立専門資料。
2. 現代の`月命星`概念と人物属性化をさらに裏付ける専門書本文。東洋運勢学会記事による`partially_confirmed`を独立資料で補強する。

### P1

3. 園田1934年資料とは独立した本命星・立春時刻境界資料。
4. 西暦簡略計算式と歴史資料の九星cycleの同値証明。
5. 本命星・月命星・月家九星に関する流派差の整理。

## 10. 未解決事項

- 全12節のexact timestamp切替。
- `月家九星`から現代の`月命星`への概念接続の専門書本文による独立補強。記事本文により`partially_confirmed`だが、完全確認済みではない。
- 出生時刻不明時についての資料上の正式処理。
- 節入り翌日切替6件の理由。
- 1900〜2050年外の暦法・timezone・epoch policy。

確認済み36対応をこれらの解決待ちで未確認へ戻さない。一方、36対応の一致から未解決claimを推測補完しない。

## 11. D-0021 制限付きprovenance登録

東洋運勢学会の記事本文を`institutional_specialist_source`として登録し、富久純光系統へのPO評価は別の`LineageContext`に分離した。source typeは分類情報であり数値weightではなく、資料間conflictを自動解決しない。

```yaml
implementationReadiness:
  getsumei36Lookup: READY
  getsumeiTechniqueDefinition: READY_WITH_LIMITATIONS
  exactTimestampProductionConnection: HOLD
  naturalTimeCorrection: HOLD
  keishaProductionChange: HOLD
  chuguKeishaLineageChoice: HOLD
  getsumeiSatsuAndTekisatsu: HOLD
```

登録した関係:

```yaml
monthlyPlateCenterStarToGetsumeiStar:
  valueRelation: same_value
  conceptRelation: derived_personal_attribute
  roleRelation: distinct_role
  sharedLookup: allowed
  sharedRule: allowed
  techniqueMerge: prohibited
```

`boundary.getsumei-setsuiri-timestamp.v1`の`exactTimestampSupport: true`はschema・traceが秒精度を表現できる意味に限定する。全12節のsource確認は`partially_confirmed`、project採用は`provisional`、productionは`not_connected`のままである。`assumed_jst`と自然時補正は`conflict.personal-stars.time-basis.v1`で併存させ、どちらかを資料weightで自動採用しない。

実装registryは36 lookupと人物role bindingまでを含む。傾斜計算Rule、月命殺・月命的殺、candidate、ranking、warning、UI、API、URLへは接続しない。
