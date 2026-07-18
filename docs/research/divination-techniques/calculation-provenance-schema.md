# 計算根拠・Calculation Trace共通schema

更新日: 2026-07-18
状態: `accepted_design` / `documentation_only`
Decision: D-0020

## 1. 設計原則

静的な占技定義と、個別入力に対する実行時`CalculationTrace`を分離する。

```text
静的registry
  concept / source claim / rule / boundary / implementation / application policy
                         ↓ versioned references
実行時trace
  normalized input / applied boundary / intermediate / derived value / output
```

通常利用では説明に必要なtraceをオンデマンド生成する。調査・監査モードでは完全traceを生成可能にするが、完全traceの恒久保存は原則行わない。

## 2. 静的registry

単一の巨大な型へ埋め込まず、永続IDで参照する。

```ts
type DivinationTechniqueDefinition = {
  techniqueId: string;
  techniqueVersion: string;
  label: string;
  reading?: string;
  aliases: readonly string[];
  domain:
    | "nine_star"
    | "direction"
    | "calendar"
    | "auspicious_day"
    | "deity"
    | "compatibility"
    | "candidate"
    | "ranking"
    | "sanmeigaku"
    | "other";
  conceptId: string;
  sourceClaimIds: readonly string[];
  projectClaimIds: readonly string[];
  ruleIds: readonly string[];
  boundaryRuleIds: readonly string[];
  implementationBindingIds: readonly string[];
  applicationPolicyIds: readonly string[];
  prohibitedInferenceIds: readonly string[];
};
```

### 2.1 RuleDefinition

```ts
type RuleDefinition = {
  ruleId: string;
  ruleVersion: string;
  techniqueId: string;
  status:
    | "formula_confirmed"
    | "table_confirmed"
    | "master_dependent"
    | "partially_confirmed"
    | "unresolved";
  inputFieldIds: readonly string[];
  boundaryRuleIds: readonly string[];
  sourceClaimIds: readonly string[];
  derivationSteps: readonly CalculationStepDefinition[];
  lookupTableIds: readonly string[];
  outputFieldIds: readonly string[];
};
```

### 2.2 CalculationStepDefinition

```ts
type CalculationStepDefinition = {
  stepId: string;
  label: string;
  inputFieldIds: readonly string[];
  operation:
    | "lookup"
    | "formula"
    | "date_boundary"
    | "coordinate_conversion"
    | "normalization"
    | "aggregation"
    | "policy_decision";
  ruleReferenceIds: readonly string[];
  outputFieldIds: readonly string[];
  note?: string;
};
```

`policy_decision`は古典計算ではなくapplication policyとして識別できなければならない。

### 2.3 BoundaryRuleDefinition

```ts
type BoundaryRuleDefinition = {
  boundaryRuleId: string;
  boundaryVersion: string;
  label: string;
  boundaryType:
    | "risshun_year"
    | "setsuiri_month"
    | "day_change"
    | "hour_branch"
    | "doyo"
    | "timezone"
    | "solar_longitude"
    | "direction_sector"
    | "other";
  timezonePolicy: string | null;
  inputFieldIds: readonly string[];
  sourceClaimIds: readonly string[];
  ruleSummary: string;
  unresolvedIssues: readonly string[];
};
```

### 2.4 ImplementationBinding

```ts
type ImplementationBinding = {
  bindingId: string;
  techniqueId: string;
  sourceFiles: readonly string[];
  functions: readonly string[];
  masterColumns: readonly string[];
  apiRoutes: readonly string[];
  uiRoutes: readonly string[];
  tests: readonly string[];
  currentBehaviorSummary: string;
  implementationMatch:
    | "match"
    | "mismatch"
    | "concept_mismatch"
    | "cannot_compare"
    | "not_compared";
};
```

`existing_implementation`はこのbindingと比較記録に限定し、source claimへ自動変換しない。

### 2.5 ApplicationPolicyDefinition

```ts
type ApplicationPolicyDefinition = {
  applicationPolicyId: string;
  applicationPolicyVersion: string;
  techniqueIds: readonly string[];
  policyType:
    | "candidate_filter"
    | "ranking"
    | "warning"
    | "companion_aggregation"
    | "ui_presentation"
    | "other";
  applicationPolicyStatus:
    | "adopted"
    | "provisional_existing_policy"
    | "research_only"
    | "rejected";
  inputFieldIds: readonly string[];
  ruleSummary: string;
  sourceClaimIds: readonly string[];
  projectClaimIds: readonly string[];
};
```

占術値の算出と、候補から除外する・点数を加減する・warningを表示する処理を同一ruleにしない。

## 3. statusの独立性

```ts
type VerificationAxes = {
  sourceVerificationStatus:
    | "confirmed"
    | "partially_confirmed"
    | "conflict"
    | "unresolved";
  calculationVerificationStatus:
    | "verified"
    | "sample_verified"
    | "unverified"
    | "not_applicable";
  implementationMatchStatus:
    | "match"
    | "mismatch"
    | "concept_mismatch"
    | "cannot_compare"
    | "not_compared";
  projectAdoptionStatus:
    | "adopted"
    | "provisional"
    | "research_only"
    | "rejected";
  productionConnectionStatus:
    | "connected"
    | "partially_connected"
    | "not_connected";
  uiEnablementStatus:
    | "enabled"
    | "detail_only"
    | "disabled";
  rankingConnectionStatus:
    | "connected"
    | "provisional_existing_policy"
    | "not_connected";
};
```

「正式採用」という単一statusは使用しない。source未確認でもproduction接続済みという現状を、そのまま表現できる必要がある。

## 4. versioning

| version | scope |
| --- | --- |
| `techniqueVersion` | concept定義・alias・関係 |
| `ruleVersion` | 計算式・対応表・導出step |
| `sourceClaimVersion` | sourceから採用したclaim |
| `projectClaimVersion` | PO仕様・project claim |
| `applicationPolicyVersion` | candidate・rank・warning等のアプリ方針 |
| `traceVersion` | CalculationTraceの構造 |

過去結果を再現する場合、現在のruleで上書き再計算しない。結果が使用した各versionをtraceに保持する。廃止versionは削除せず、参照可能なarchive statusへ移す。

## 5. CalculationTrace

```ts
type CalculationTrace = {
  traceVersion: string;
  traceMode: "explanation" | "audit";
  generatedAt: string;
  techniqueId: string;
  techniqueVersion: string;
  ruleVersion: string;
  sourceClaimVersions: readonly string[];
  projectClaimVersions: readonly string[];
  applicationPolicyVersions: readonly string[];
  normalizedInputs: readonly TraceValue[];
  boundaryApplications: readonly BoundaryApplication[];
  steps: readonly CalculationStepTrace[];
  result: readonly TraceValue[];
  applicationEffects: readonly ApplicationEffectTrace[];
  conflicts: readonly TraceConflictReference[];
  unresolvedReferences: readonly string[];
};
```

`CalculationStepTrace`は入力、操作、参照rule、出力、中間値をstepごとに保持する。結果だけを保存してはならない。

### 5.1 trace mode

| mode | content |
| --- | --- |
| `explanation` | 通常UIで必要な主な入力、境界、主要step、結論、注意 |
| `audit` | 全入力型、全境界適用、中間値、lookup key、version、source、conflict |

## 6. privacy

- registryには入力の型、用途、必須性だけを記録し、生年月日、氏名、同行者情報、位置情報の実値を登録しない。
- 完全traceは原則として恒久保存しない。
- audit traceを一時保存する場合は、目的、保持期間、アクセス範囲、削除方法を別途承認する。
- ログへ生年月日、緯度経度、検索語、同行者構成を無条件に出力しない。
- 再現fixtureは実在個人情報ではなく、明示的な静的test fixtureとして管理する。

## 7. UI根拠表示の二層

今回UIは変更しない。将来の表示契約だけを設計する。

### 通常表示

- 結論
- 主な理由
- 注意点
- 使用占技
- 簡潔な計算根拠

### 詳細・研究モード

- 入力項目と正規化
- 暦境界
- 中間値
- 対応表・lookup key
- `ruleVersion`
- 出典とclaim
- conflict・unresolved
- PO採用方針・application policy

通常表示のためにconflictを隠して解消済み扱いにしてはならない。

## 8. 月盤Level 1サンプル

最初の完全サンプルは月盤Level 1とする。

```text
対象日
→ 節入り月境界
→ 月支
→ 年支3グループ
→ 月盤中宮星
→ 九星配置
→ 方位別九星
→ 五黄殺・暗剣殺・月破
```

細字marker、C寅月徳合、三合marker、`天月`の効果を混入しない。月盤で検証したschemaを、本命星、日盤、方位、選日、算命学へ順次適用する。

## 9. 将来テスト分類

- source rule test
- lookup table test
- boundary test
- derivation test
- master consistency test
- regression fixture
- cross-layer test
- application-policy test
- URL compatibility test
- conflict preservation test
- unresolved state non-connection test
