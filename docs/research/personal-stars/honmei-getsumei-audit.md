# 本命星・月命星 provenance 実装前監査

調査日: 2026-07-18
作業区分: `documentation_only`
Decision基盤: D-0020
production変更: なし

Source ledger更新: 2026-07-18

- `docs/research/personal-stars/honmei-source-research.md`
- `docs/research/personal-stars/getsumei-source-research.md`

## 1. 目的と監査境界

本命星・月命星をD-0020共通provenance schemaへ将来登録するため、現行production binding、境界精度、source確認状態、POの暫定採用方針、production接続範囲を分離して記録する。

今回登録するのは調査台帳であり、`TechniqueDefinition`、fixture、runtime trace、API、UI、candidate、ranking、warningを実装しない。daily masterまたは現行コードの存在を占術上のsource evidenceへ昇格させない。

## 2. 現行本命星binding

```text
birthDate
→ searchCalendarDb
→ getPersonalContext
→ getCalendarDays
→ daily masterの出生日行
→ birthDay.kyusei.year
→ honmeiStar
→ CalendarDbPersonalContext
```

### 2.1 実装観測

- `src/lib/calendar-db-view.ts`のprivate `getPersonalContext`が出生日行を取得する。
- `birthDay.kyusei.year`は`src/lib/calendar-day.ts`がdaily master列`yearKyusei`をそのまま公開した値である。
- 本命星専用のproduction算出関数はない。
- 生年月日から年九星を数式算出せず、import済みdaily master値を読む。
- calendar master build scriptは入力行を正規化・検証するが、`yearKyusei`の占術式を実装しない。
- 現在の入力は`YYYY-MM-DD`の`birthDate`だけで、出生時刻、timezone、出生地、経度、真太陽時、均時差を使わない。
- 性別は本命星の値に影響しない。`birthGender`は後段の傾斜profile選択へ渡される。
- supported rangeはverified daily masterが存在する1900-01-01〜2050-12-31。範囲外は推測計算せず`unsupported / outside_verified_master_range`とする。
- queryの`honmeiStar`を直接指定した場合は出生計算を通らない。家族・同行者用の仮採用コンテキストで、出生日時に基づくverificationを持たない。

### 2.2 implementation status

```yaml
currentImplementation:
  calculationType: imported_daily_master_binding
  inputResolution: date
  masterColumn: yearKyusei
  exactTimestampSupport: false
  timezoneInputSupport: false
  birthLocationSupport: false
  implementationStatus: implementation_observed
```

## 3. 現行月命星相当binding

```text
birthDate
→ daily masterの出生日行
→ yearKyusei
→ duplicateMonth
→ monthKyusei
→ buildPersonalProfile
→ getKeishaProfile(honmeiStar, getsumeiStar, birthGender)
```

### 3.1 実装観測

- 月命星専用のproduction算出関数はない。
- `buildPersonalProfile`はdaily masterの`monthKyusei`を`getsumeiStar`引数として`getKeishaProfile`へ渡す。
- 独立研究期待値と既存daily masterは、3本命星group×12月支の36/36、本命星9×12月支の108/108で一致する。
- 1900〜2050年の55,152日について、`yearKyusei`、`duplicateMonth`、`monthKyusei`は1〜9・12月支の定義範囲に収まり、108入力の出力は一意である。
- これらは強いimplementation verificationだが、`monthKyusei`と占技上の月命星が同一概念であることのsource evidenceではない。
- `monthKyusei`は月盤中宮にも使われる。同じ数値列を共有していても、月盤中宮星と月命星を一つのTechniqueへ統合しない。

### 3.2 現在の利用状態

```yaml
getsumeiEquivalentBinding:
  directDisplayAsGetsumei: false
  keishaProfileConnection: connected
  getsumeisatsuConnection: not_implemented
  getsumeitekisatsuConnection: not_implemented
  companionConnection: not_connected
  candidateConnection: not_connected
  rankingConnection: not_connected
  urlParameter: none
```

## 4. 境界のdual-lane方針

### 4.1 本命星

精密計算の目標は、立春の正確なJST時刻で採用年を切り替える方向とする。園田真次郎編『改正方位明鑑』第4版（1934年）については、立春時刻前後で年月の分界を定める規則を確認した。ただし全流派共通とはせず、project adoptionおよびproduction接続は未確定である。

```yaml
honmeiBoundaryTarget:
  targetBoundary: exact_risshun_timestamp_jst
  projectAdoptionStatus: provisional
  sourceVerificationStatus: confirmed_for_sonoda_lineage
  productionConnectionStatus: not_connected
```

### 4.2 月命星

精密計算の目標は、12節の正確なJST時刻で採用月支を切り替える方向とする。高島易断所本部神宮館編纂『九星暦術一代運気活断口伝書』（1935年）で、月家九星が朔日ではなく12節の節替りで交替することは確認した。全12節のexact timestampと現代の月命星概念への接続は引き続き確認が必要である。月盤の節入りeventを参照できるが、月盤ProjectClaimと月命星ProjectClaimを同一claimにしない。

```yaml
getsumeiBoundaryTarget:
  targetBoundary: exact_setsuiri_timestamp_jst
  projectAdoptionStatus: provisional
  usesTwelveSetsuNotChuki: confirmed
  switchesAtLunarMonthStart: rejected
  exactTimestampForAllTwelveSetsu: partially_confirmed
  modernGetsumeiConceptBinding: partially_confirmed
  productionConnectionStatus: not_connected
```

### 4.3 current implementation lane

```yaml
currentImplementationBoundary:
  input: birthDate
  implementationResolution: date
  currentBehavior: daily_master_value_used_for_entire_day
  implementationStatus: implementation_observed
  exactTimestampSupport: false
```

source rule、PO/project方針、current implementationを一つのstatusやclaimへ統合しない。

## 5. birthTime・timezone・地域補正

### 5.1 birthTimeなし

立春・節入り境界日に出生時刻がない場合、0時、正午、23時その他の時刻を補完しない。

```yaml
boundaryDateWithoutBirthTime:
  precisionStatus: date_only
  exactBoundaryResult: unresolved
  currentImplementationResult: available
```

将来UIでは境界日だけ出生時刻入力を促す設計を候補にできるが、今回UIへ接続しない。

### 5.2 timezone

現行対象範囲でtimezone入力がない場合はJSTとして扱うPO provisional方針を採用する。ただし出生地から確定したtimezoneではなく、current implementationがtimezone変換を実行しているという意味でもない。

```yaml
timezoneResolution: assumed_jst
```

### 5.3 初期未対応範囲

- overseas birth
- DST
- birth longitude correction
- true solar time
- equation of time
- location-derived timezone

未対応項目から値を推測せず、`unsupported`または`unresolved`を返せる設計を前提とする。

## 6. 境界観測

### 6.1 立春年界

公式立春151件とdaily masterの`duplicateYear`・`yearKyusei`切替を比較した。

| observation | count |
| --- | ---: |
| official dateと同日切替 | 150 |
| official dateの翌日切替 | 1 |
| missing | 0 |

翌日切替は`1900-02-04T14:51:29+09:00`の立春に対し、daily masterが1900-02-05から新年支・新年九星となる1件である。理由は`unresolved`とし、丸め、timezone補正、source誤りを推測しない。

代表観測:

| year | exact risshun JST | daily master behavior |
| --- | --- | --- |
| 1900 | `1900-02-04T14:51:29+09:00` | 2月4日は旧値、2月5日から新値 |
| 2024 | `2024-02-04T17:27:08+09:00` | 2月4日終日を新値として使用 |
| 2025 | `2025-02-03T23:10:28+09:00` | 2月3日終日を新値として使用 |
| 2026 | `2026-02-04T05:02:08+09:00` | 2月4日終日を新値として使用 |

同日切替150件ではexact時刻より前、1900年1件ではexact時刻以後から翌日0時まで、source ruleとcurrent implementationの差が生じ得る。source ruleは園田系統について確認済みだが、project adoptionは`provisional`、productionは`not_connected`であり、差を理由にdaily masterを変更しない。

### 6.2 節入り月界

| observation | count |
| --- | ---: |
| official dateと同日切替 | 1,806 |
| official dateの翌日切替 | 6 |
| missing | 0 |
| total | 1,812 |

翌日切替6件の理由は月盤Level 1と同じ`unresolved` recordを参照する。current implementationがtimestamp精度を持つとは記録しない。

- 1900-01-06 小寒
- 1900-02-04 立春
- 1902-09-08 白露
- 1919-08-08 立秋
- 1939-06-06 芒種
- 1964-09-07 白露

2026-07-07小暑の例:

```text
official exact boundary: 2026-07-07T10:56:57+09:00
10:56:56 exact-boundary candidate: 午月 / monthKyusei-equivalent 4
10:56:56 current implementation: 未月 / monthKyusei 3
10:56:57以後のcandidate: 未月 / monthKyusei-equivalent 3
```

`monthKyusei-equivalent`は概念同一性確認前の比較名であり、正式な`getsumeiStar`出力ではない。

## 7. Technique分割案

```text
birth-datetime-normalization
birth-year-period-resolution
birth-month-period-resolution
honmei-star-resolution
getsumei-star-resolution
personal-star-profile-workflow
```

依存案:

```text
birth-datetime-normalization
├─ birth-year-period-resolution
│  └─ honmei-star-resolution
└─ birth-month-period-resolution
   └─ getsumei-star-resolution
      └─ personal-star-profile-workflow
```

`getsumei-star-resolution`は本命星groupを入力に使うため`honmei-star-resolution`にも依存する。`personal-star-profile-workflow`は各Techniqueを束ねるだけで、独立した吉凶効果、加点、candidate、ranking、warning、同行者判定を持たない。

`birth-timezone-resolution`と`birth-location-time-correction`は将来候補に留め、未対応の空Techniqueとして登録しない。

## 8. BoundaryRule候補

- `boundary.jst-normalization.v1`
- `boundary.personal-input-date-resolution.v1`
- `boundary.honmei-risshun-timestamp.v1`
- `boundary.getsumei-setsuiri-timestamp.v1`
- `boundary.personal-daily-master-resolution.v1`

月盤と同じsolar-term timestamp sourceを参照しても、月盤、月命星、本命星のproject adoptionとapplication ruleを分離する。

## 9. Rule・lookup候補

Rule ID:

- `rule.personal.birth-datetime-normalization.v1`
- `rule.personal.year-nine-star-cycle.v1`
- `rule.personal.honmei-from-adopted-year-star.v1`
- `rule.personal.getsumei-from-year-group-and-setsu-month.v1`
- `rule.personal.getsumei-role-binding.v1`

Lookup ID:

- `lookup.personal.annual-nine-star-cycle.v1`
- `lookup.personal.getsumei-year-groups.v1`
- `lookup.personal.getsumei-36.v1`

月盤中宮星と月命星は36値を共有できるが、人物属性化を別Rule・別Techniqueとして保持する。今回は候補IDの台帳化だけで、正式lookupまたはprovenance codeへ登録しない。

## 10. SourceClaim台帳

| claim ID | source verification | scope |
| --- | --- | --- |
| `source-claim.sonoda-1934.honmei-birth-center.v1` | `confirmed_for_sonoda_lineage` | 出生年星を人物の本命として扱う |
| `source-claim.sonoda-1934.risshun-timestamp-boundary.v1` | `confirmed_for_sonoda_lineage` | 立春時刻前後による年界 |
| `source-claim.jingukan-1935.annual-nine-star-cycle.v1` | `confirmed` | 年家九星cycle |
| `source-claim.jingukan-1935.monthly-nine-star-36.v1` | `confirmed` | 3年支群×12月の月家九星36対応 |
| `source-claim.jingukan-1935.monthly-setsu-boundary.v1` | 12節採用`confirmed`、全12節exact timestamp`partially_confirmed` | 朔日ではなく節替り |
| `source-claim.naoj.solar-term-instants.v1` | `confirmed` | 節気eventの公式時刻dataset |
| `source-claim.tomihisa-institutional.getsumei-personal-role.v1` | `partially_confirmed` | 東洋運勢学会記事本文による月家九星から人物属性へのrole binding |
| `source-claim.tomihisa-institutional.getsumei-keisha-table.v1` | `partially_confirmed` | 本命星・月命星の108入力相当表。傾斜Rule実装の根拠には未接続 |
| `source-claim.tomihisa-2000.keisha-book-scope.v1` | `partially_confirmed` | 書誌・目次scopeのみ。本文未確認 |

daily master、`yearKyusei`、`monthKyusei`、`searchCalendarDb`、existing implementationは`SourceClaim`にせず、`ImplementationBinding`または`ImplementationObservation`へ登録する。

## 11. ProjectClaim候補

- `project-claim.honmei-boundary-at-risshun.v1`
- `project-claim.getsumei-boundary-at-setsuiri.v1`
- `project-claim.personal-star-scope.v1`

本命星・月命星の境界と`assumed_jst`は`provisional`であり、`production adopted`または`production connected`へ昇格させない。月命星role bindingはprovenance構造として`adopted`だが、production connectionは`not_connected`である。

## 12. concept mismatch・統合禁止

| concepts | status / restriction |
| --- | --- |
| `yearKyusei` vs 年盤中宮星 | `same_value_same_concept` |
| `yearKyusei` vs 本命星 | `same_value_distinct_role`。人物Techniqueへ固定する役割を分離 |
| `monthKyusei` vs 月盤中宮 | `same_value_same_concept` |
| `monthKyusei` vs 月命星 | `same_value_distinct_role`。現代月命星bindingはsource review required |
| 出生日daily row vs 出生日時 | date-resolutionとtimestamp-resolutionを分離 |
| 本命星名 vs 年盤上の九星 | 同じ九星IDでも人物占技と盤上配置を分離 |
| 算命学の年/月九星binding | 同じdaily masterを使う別system binding |
| 四柱推命・算命学の節入りrule | 同じ境界eventでもsystem adoptionを自動統合しない |

## 13. production接続監査

### 13.1 本命星

接続済みのcurrent behavior:

- `/purpose-calendar`の本人personal contextと本命星表示。
- `familyStars=self`および`star-1`〜`star-9`の同行者選択。
- query / APIの`honmeiStar`直接指定。
- `companionJudgementMode`の`strict` / `standard` / `loose`。
- 年盤・月盤・日盤の本命殺・本命的殺（current表示名は`的殺`）。
- 個人九星相性、候補除外、同行者凶回避。
- 時盤における本命方位・的殺方位のblock。
- `/api/calendar-db`、`/calendar-db`とCalendar DB personal response。

今回のprovenance候補をこれらへ新規接続せず、current behaviorのbindingとして記録するだけに留める。

### 13.2 月命星相当値

接続済み:

- `buildPersonalProfile`
- `getKeishaProfile`
- 傾斜、傾斜星、傾斜の良い面・注意面

直接接続なし:

- 月命星としてのUI表示
- 月命殺・月命的殺
- 同行者判定
- candidate
- ranking
- warning
- URL parameter

## 14. CalculationTrace候補

### 14.1 非境界日

```text
2002-03-15
→ literal birthDate
→ daily master row
→ yearKyusei 7
→ duplicateMonth 卯
→ monthKyusei 7
→ getKeishaProfile(7, 7, birthGender)
```

### 14.2 立春境界

```text
2025-02-03T23:10:27+09:00
→ Sonoda source-rule lane: 旧年九星3
→ provisional project lane: 旧年九星3候補
→ current implementation lane: 新年九星2
→ difference: open / production not connected

2025-02-03T23:10:28+09:00
→ Sonoda source-rule lane: 新年九星2
→ provisional project lane: 新年九星2候補
→ current implementation lane: 新年九星2
```

### 14.3 節入り境界

```text
2026-07-07T10:56:56+09:00
→ provisional exact-boundary lane: 午月 / monthKyusei-equivalent 4
→ current implementation lane: 未月 / monthKyusei 3
→ difference: open / getsumei concept source review required

2026-07-07T10:56:57+09:00
→ provisional exact-boundary lane: 未月 / monthKyusei-equivalent 3
→ current implementation lane: 未月 / monthKyusei 3
```

静的registryには個人の出生日時実値を保存せず、例示traceは非永続のtest/research fixtureとして扱う。

## 15. 将来のテスト設計

- 本命星year cycleのsource-confirmed静的fixture。
- 月命星36対応、108入力、55,152日invariant。
- 立春直前・exact時刻・直後を複数年で確認。
- 2024、2025、2026と翌日切替の1900年。
- 12節の直前・exact時刻・直後。
- 翌日切替6件を`unresolved`のまま保持。
- `birthTime`あり・なしと、時刻なし境界日の`exactBoundaryResult: unresolved`。
- `assumed_jst`とtimezone未指定。
- overseas、DST、真太陽時等がunsupportedであること。
- 1900-01-01、2050-12-31、範囲外入力。
- SourceClaim / ProjectClaim / ImplementationBindingの分離。
- `monthKyusei`と月命星、月盤中宮の非統合。
- 月命星がcandidate、ranking、同行者へ接続されないこと。
- PII実値の静的registry非保存とrule version再現。
- `/purpose-calendar`、`/api/calendar-db`の既存URL/query回帰。

## 16. 未解決事項と次工程

1. P0: 全12節のexact timestamp切替を明記した独立専門資料を確認する。
2. P0: 東洋運勢学会記事で`partially_confirmed`となった月命星人物属性化を、専門書本文で独立補強する。
3. P1: 園田1934年とは独立した本命星立春時刻資料を確認する。
4. P1: 西暦簡略計算式と歴史資料の九星cycleの同値を確認する。
5. `birthTime`なし境界日の将来UI・API表現を決める。
6. JST以外、海外出生、DST、経度補正、真太陽時を扱う別工程の入力modelを設計する。
7. 制限付きregistryの次は、HOLD中のexact timestamp production接続、自然時補正、傾斜計算、月命殺・月命的殺を別工程で判断する。

今回のprovisional方針だけを理由に、existing production result、daily master、candidate、ranking、warning、本命殺・的殺、同行者判定を変更しない。

## 17. D-0021 制限付きprovenance実装

D-0020の共通schemaに、本命星・月命星をproduction非接続の完全サンプルとして追加した。

登録範囲:

- 5 `TechniqueDefinition`: 出生日時正規化、出生年期間決定、出生月期間決定、本命星決定、月命星決定。
- 1 effect-free `personal-star-profile-workflow`。Techniqueとして重複登録せず、candidate・ranking・warningへ接続しない。
- 本命星用年家九星cycle、月命星用3群×12節月の36 lookup、108入力展開検証。
- source rule / project provisional / current daily masterの3 lane trace。
- `institutional_specialist_source`、`LineageContext`、一般化した時刻基準`ConflictRecord`。
- 立春151件、節入り1,812件、daily master 55,152日のimplementation observation。

境界状態:

```yaml
honmeiExactBoundary:
  sourceVerificationStatus: confirmed_for_named_lineage
  projectAdoptionStatus: provisional
  productionConnectionStatus: not_connected
getsumeiExactBoundary:
  sourceVerificationStatus: partially_confirmed
  projectAdoptionStatus: provisional
  productionConnectionStatus: not_connected
  exactTimestampSupportMeaning: schema_and_trace_only
currentImplementation:
  effectiveResolution: date
  exactTimestampSupport: false
  status: implementation_observed
```

月命星は月盤中宮値とlookup・計算Ruleを共有できるが、人物属性への`getsumei role binding`を持つ別Techniqueである。富久純光系統は`po_confirmed_lineage_context`として保存し、未確認本文や学会の未記載見解をSourceClaimへ変換しない。source typeから数値scoreを生成せず、conflictを自動解決しない。

HOLD:

- exact timestampのproduction接続。
- local natural time、経度、DST、真太陽時、均時差。
- 傾斜計算Ruleと中宮傾斜の流派選択。
- 月命殺・月命的殺、本命殺・本命的殺。
- candidate、ranking、warning、同行者、UI、API、URL。
