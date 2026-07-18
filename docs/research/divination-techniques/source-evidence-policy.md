# 出典・claim・証拠レベルpolicy

更新日: 2026-07-18
状態: `accepted_policy` / `documentation_only`
Decision: D-0020

## 1. 基本原則

「コードがそうなっている」「masterに値がある」だけでは占術上の根拠にしない。原典・資料上の事実、PO採用仕様、現行実装、application policyを別claimとして保存する。

## 2. source type

```ts
type EvidenceReferenceType =
  | "classical_primary"
  | "historical_calendar"
  | "modern_reference"
  | "dictionary"
  | "official_dataset"
  | "project_research_ledger"
  | "po_confirmed"
  | "existing_implementation"
  | "project_policy";

type RuleSourceType = Exclude<
  EvidenceReferenceType,
  "existing_implementation"
>;
```

`existing_implementation`は証拠参照の分類として識別可能にするが、`RuleSourceType`から明示的に除外する。用途はimplementation binding、比較、回帰に限定し、source verification済みの占術claimとして扱わない。

## 3. sourceとclaimの分離

```ts
type RuleSourceReference = {
  sourceId: string;
  sourceType: RuleSourceType;
  title: string;
  authorOrEditor?: string;
  edition?: string;
  volume?: string;
  section?: string;
  page?: string;
  urlOrLocation?: string;
  rightsCategory:
    | "classical_source"
    | "page_image"
    | "modern_transcription"
    | "dictionary"
    | "web_explanation"
    | "official_data"
    | "project_record";
};

type SourceClaim = {
  claimId: string;
  sourceClaimVersion: string;
  sourceId: string;
  claimType: "source_fact" | "interpretation" | "calculation_rule";
  minimalQuote?: string;
  modernSummary: string;
  adoptedInterpretation?: string;
  sourceVerificationStatus:
    | "confirmed"
    | "partially_confirmed"
    | "conflict"
    | "unresolved";
  verifiedAt?: string;
  verifiedBy?: string;
};

type ProjectClaim = {
  claimId: string;
  projectClaimVersion: string;
  claimType: "po_specification" | "application_policy";
  summary: string;
  projectAdoptionStatus:
    | "adopted"
    | "provisional"
    | "research_only"
    | "rejected";
  relatedSourceClaimIds: readonly string[];
};
```

PO採用仕様が存在しても、関連source claimの`sourceVerificationStatus`を自動で`confirmed`にしない。

## 4. 保存する出典情報

- 書誌情報
- 著者・編者
- 版
- 巻・節・頁
- URLまたは保管場所
- 必要最小限の引用
- 現代語要約
- 採用した解釈
- 検証日・検証者
- source verification status
- 資料間conflict

現代資料やウェブ本文を長文転載しない。原典、版面画像、現代翻刻、辞典、ウェブ解説を同じ権利状態として扱わない。引用はclaimを識別する必要最小限にし、詳細はsource locationへ参照させる。

Wikipedia等は用語の発見や概観には利用できるが、単独でproduction計算規則の正本にしない。

## 5. verification status

| axis | values | meaning |
| --- | --- | --- |
| source verification | `confirmed`, `partially_confirmed`, `conflict`, `unresolved` | 原典・資料上の確認状態 |
| calculation verification | `verified`, `sample_verified`, `unverified`, `not_applicable` | rule・table・fixtureの検証状態 |
| implementation match | `match`, `mismatch`, `concept_mismatch`, `cannot_compare`, `not_compared` | 現行実装との比較 |
| project adoption | `adopted`, `provisional`, `research_only`, `rejected` | PO採用状態 |
| production connection | `connected`, `partially_connected`, `not_connected` | production接続 |
| UI enablement | `enabled`, `detail_only`, `disabled` | UI表示 |
| ranking connection | `connected`, `provisional_existing_policy`, `not_connected` | rankへの作用 |

これらを「正式採用」一語へ統合しない。

## 6. 萬年暦raw marker

raw markerを削除せず、展開したsemantic IDと分離する。

| raw marker | PO採用展開 | semanticExpansionStatus | sourceDefinitionStatus |
| --- | --- | --- | --- |
| `天月` | 天道 + 天徳 + 月徳 | `po_confirmed_interpretation` | `source_unconfirmed` |
| `天` | 天道 + 天徳 | `po_confirmed_interpretation` | `source_unconfirmed` |
| `月` | 月徳 | `po_confirmed_interpretation` | `source_unconfirmed` |
| `天合` | 天徳合 | `po_confirmed_interpretation` | `source_unconfirmed` |
| `月合` | 月徳合 | `po_confirmed_interpretation` | `source_unconfirmed` |

```ts
type RawMarkerRecord = {
  rawMarker: string;
  sourceId: string;
  sourcePosition: string;
  semanticTechniqueIds: readonly string[];
  semanticExpansionStatus: "po_confirmed_interpretation";
  sourceDefinitionStatus: "source_unconfirmed" | "source_confirmed";
};
```

禁止:

- `天月`を独立吉神として登録する
- `天月`へ独自効果を与える
- `天月`を一括加点する
- 構成吉神の効果を自動合算する
- raw markerをsemantic IDで上書きする
- source本文定義未確認を確認済みへ昇格する

## 7. conflict policy

資料間不一致は`ConflictRecord`として保持し、後から採用した値で過去claimを上書きしない。

```ts
type ConflictRecord = {
  conflictId: string;
  techniqueId: string;
  claimIds: readonly string[];
  summary: string;
  status: "open" | "resolved" | "accepted_difference";
  prohibitedResolution: readonly string[];
  resolutionClaimId?: string;
};
```

C寅月徳合は`open`である。

- PO現物確認: C寅盤面に`月合`表示なし
- 古典期待値: 月徳合=辛=西
- どちらが誤りか未確定
- productionへ西を補完しない
- 月徳合は研究保持

## 8. prohibited inference

- 同名の別概念から値や作用を補完しない
- 現行コードから原資料値を逆算しない
- 8方位値から24山を推測しない
- 一部fixtureから全周期を生成しない
- source未確認の名称対応を確定しない
- 吉神を凶殺相殺やrank加点へ自動接続しない
- 未実装値をUI表示都合で生成しない
- conflictを多数決や実装一致だけで解消しない

## 9. project research ledger

研究台帳はsource候補・比較fixture候補であり、production masterと同一ではない。

```text
研究台帳の一次転記完了
≠ source verification完了
≠ production master昇格
≠ ranking接続承認
```

月盤台帳の296区画は`user_transcribed`のまま保持する。大字九星324/324一致は、細字marker全件のsource confirmationを意味しない。
