# 改訂版 平成萬年暦 共通マスター研究

Last updated: 2026-07-14

## 1. Purpose

This document is a research ledger for future comparison between the existing `hibi-kippo-app` code/data masters and user-provided material from 『改訂版 平成萬年暦』.

Scope:

- 十干
- 十二支
- 九星
- 月建
- 二十四節気
- 通変星
- 十二運
- 干合
- 自化干合
- 支合
- 三合
- 冲 / 沖
- 害
- 破
- 刑
- 自刑
- 関係図解

This is a docs-only handoff for the next research/code-comparison step. It does not change app behavior, calculation logic, data masters, TypeScript types, UI, URLs, or Sanmeigaku results.

## 2. Source Handling

Primary source handling:

- Source title: 『改訂版 平成萬年暦』
- Publisher mark: 天象学会
- Page numbers: partially unconfirmed
- Acquisition path: user-owned material photographed and read/interpreted by ChatGPT in a separate conversation
- Current state: `manual_transcription_pending_source_page_confirmation`

Important wording boundary:

- This repository does not contain the source images or PDFs.
- This document records "ユーザー提供資料をChatGPTが読解し整理した研究記録".
- Do not state that Codex directly inspected, OCRed, or read the original source images/PDF.
- Do not add the source images, PDF files, or long copyrighted text excerpts to Git.

Auxiliary historical source:

- Source title: 『四柱推命學大奧極秘傅 三巻』
- Author mark: 神聖館 阿部熹作
- Use: historical reference when reviewing 干合, 自化干合, 干合後の十二運変化, and 三合の生・旺・墓 structure.
- Boundary: this is not a Sanmeigaku canonical source.
- Do not reuse deterministic fortune, illness, lifespan, or other sensitive judgement text from the classical source in user-facing copy.

## 3. Separation Between Shichu Suimei and Sanmeigaku

This research packet is mostly derived from Shichu Suimei-style tables and relationship charts. It may still help Sanmeigaku work because both systems share yin-yang, five-element, stem, and branch structures.

Do not treat:

```text
四柱推命の表 = 算命学の正式仕様
```

Sanmeigaku adoption requires later comparison with:

- existing Sanmeigaku masters in this repository,
- source-connected spreadsheet ranges already used by the app,
- Sanmeigaku-specific books/materials,
- current app behavior and regression samples.

## 4. Status Labels

| Label | Meaning |
| --- | --- |
| `source_confirmed_candidate` | Candidate transcribed from user-provided material as interpreted by ChatGPT. It has not yet been compared against the current code/data masters. |
| `provisional` | Plausible mapping or structure, but not formally adopted. |
| `source_review_required` | Needs additional Sanmeigaku/source review or product/spec decision before implementation. |
| `historical_source_supported` | Structure is also supported by the auxiliary historical Shichu source. |
| `shichu_reference_only` | Keep only as Shichu Suimei reference knowledge; do not directly adopt into Sanmeigaku. |
| `implementation_pending` | Direction exists, but no code/data/UI implementation has been made. |

## 5. Step 1: Base Cycles

### 十干

Status: `source_confirmed_candidate`

Order:

甲・乙・丙・丁・戊・己・庚・辛・壬・癸

Future comparison:

- Compare with existing stem order in code/data masters.
- Confirm display labels, sorting keys, and any hidden numeric IDs.

### 十二支

Status: `source_confirmed_candidate`

Order:

子・丑・寅・卯・辰・巳・午・未・申・酉・戌・亥

Future comparison:

- Compare with existing branch order in code/data masters.
- Confirm whether branch order is reused by month, day, hour, relationship charts, and visualizations.

### 九星

Status: `source_confirmed_candidate`

Short order:

一白・二黒・三碧・四緑・五黄・六白・七赤・八白・九紫

Formal-name candidates:

| Short label | Formal-name candidate |
| --- | --- |
| 一白 | 一白水星 |
| 二黒 | 二黒土星 |
| 三碧 | 三碧木星 |
| 四緑 | 四緑木星 |
| 五黄 | 五黄土星 |
| 六白 | 六白金星 |
| 七赤 | 七赤金星 |
| 八白 | 八白土星 |
| 九紫 | 九紫火星 |

Future comparison:

- Keep short labels and formal names separable.
- Compare with existing 九星 display names and IDs.
- Do not change 九星 logic from this research note alone.

### 月建・節・中気

月建 and solar-term correspondence status: `source_confirmed_candidate`

Actual month-pillar boundary behavior status: `source_review_required`

| 月建 | 節 | 中気 |
| --- | --- | --- |
| 寅 | 立春 | 雨水 |
| 卯 | 啓蟄 | 春分 |
| 辰 | 清明 | 穀雨 |
| 巳 | 立夏 | 小満 |
| 午 | 芒種 | 夏至 |
| 未 | 小暑 | 大暑 |
| 申 | 立秋 | 処暑 |
| 酉 | 白露 | 秋分 |
| 戌 | 寒露 | 霜降 |
| 亥 | 立冬 | 小雪 |
| 子 | 大雪 | 冬至 |
| 丑 | 小寒 | 大寒 |

Important notes:

- This does not mean month changes happen at the modern calendar month start.
- 月建 switching is a candidate for using 節入り日時.
- Actual month-pillar boundaries need comparison with existing code, calendar DB, and Sanmeigaku-specific sources.
- Store 節 and 中気 as separate candidate fields if a future master is built.

## 6. Step 2: Tsuhensei Mapping

Status:

- 通変星 table: `source_confirmed_candidate`
- 十大主星対応: `provisional`
- Sanmeigaku formal adoption: `source_review_required`

Input model:

- 日干
- target stem or branch

Output candidates:

- 比肩
- 敗財
- 食神
- 傷官
- 偏財
- 正財
- 偏官
- 正官
- 偏印
- 印綬

十大主星 mapping candidates:

| 通変星 | 十大主星 candidate | Status |
| --- | --- | --- |
| 比肩 | 貫索星 | `provisional` |
| 敗財 / 劫財 | 石門星 | `provisional` |
| 食神 | 鳳閣星 | `provisional` |
| 傷官 | 調舒星 | `provisional` |
| 偏財 | 禄存星 | `provisional` |
| 正財 | 司禄星 | `provisional` |
| 偏官 | 車騎星 | `provisional` |
| 正官 | 牽牛星 | `provisional` |
| 偏印 | 龍高星 | `provisional` |
| 印綬 / 正印 | 玉堂星 | `provisional` |

Important:

- Do not unconditionally equate Shichu Suimei 通変星 and Sanmeigaku 十大主星.
- Treat the mapping as a candidate based on shared yin-yang/five-element relationship structure.
- Compare with `src/lib` Sanmeigaku derivation and source-connected spreadsheet explanation masters before adoption.

## 7. Step 2: Twelve Stage Mapping

Status:

- 十二運 table: `source_confirmed_candidate`
- 十二大従星対応: `provisional`
- Full comparison with existing Sanmeigaku masters: `pending`

Input model:

- 基準十干
- target 十二支

十二運 output candidates:

- 長生
- 沐浴
- 冠帯
- 建禄
- 帝旺
- 衰
- 病
- 死
- 墓
- 絶
- 胎
- 養

十二大従星 mapping candidates:

| 十二運 | 十二大従星 candidate | Status |
| --- | --- | --- |
| 胎 | 天報星 | `provisional` |
| 養 | 天印星 | `provisional` |
| 長生 | 天貴星 | `provisional` |
| 沐浴 | 天恍星 | `provisional` |
| 冠帯 | 天南星 | `provisional` |
| 建禄 | 天禄星 | `provisional` |
| 帝旺 | 天将星 | `provisional` |
| 衰 | 天堂星 | `provisional` |
| 病 | 天胡星 | `provisional` |
| 死 | 天極星 | `provisional` |
| 墓 | 天庫星 | `provisional` |
| 絶 | 天馳星 | `provisional` |

Existing-app connection candidates:

| App concept | Candidate formula | Status |
| --- | --- | --- |
| 初年運 | 日干 × 年支 | `provisional` |
| 中年運 | 日干 × 月支 | `provisional` |
| 老年運 | 日干 × 日支 | `provisional` |
| Future time-pillar use | 日干 × 時支 | `source_review_required` |

Future comparison:

- Compare all twelve-stage outputs against existing Sanmeigaku star derivation.
- Confirm whether the app's current 初年運・中年運・老年運 calculations already match this candidate structure.
- Do not change current calculation logic until all cases are verified.

## 8. Step 2: Stem Combinations

### 干合5組

Status:

- Five stem pairs: `source_confirmed_candidate`
- Transformed element candidates: `source_confirmed_candidate`
- Combination/transformation conditions: `source_review_required`

| Pair | Transformed element candidate | Name candidate |
| --- | --- | --- |
| 甲己 | 土 | 中正の合 |
| 乙庚 | 金 | 仁義の合 |
| 丙辛 | 水 | 威制の合 |
| 丁壬 | 木 | 淫慝の合 |
| 戊癸 | 火 | 無情の合 |

Implementation design candidate:

- Detecting 干合,
- deciding whether 合化 is established,
- and applying the transformed element

should be separate decisions.

### 自化干合

Status:

- Concept existence: `historical_source_supported`
- Which hidden stem to use: `source_review_required`
- Sanmeigaku adoption: `source_review_required`

Examples recorded from user-provided material and auxiliary historical source:

- 壬午
- 丁亥
- 戊子
- 癸巳
- 辛巳
- 甲午

Concept candidate:

同一柱の天干と、その地支内部の干との干合.

Future comparison:

- Compare with hidden-stem master(s) and existing 蔵干 behavior.
- Confirm whether principal, middle, residual, or time-dependent hidden stems are used.
- Do not implement until source and product intent are confirmed.

### 干合後の十二運再判定

Status:

- Concept in Shichu historical material: `shichu_reference_only`
- App adoption: `source_review_required`
- Sanmeigaku transfer: unconfirmed

Recorded concept:

干合 → 化が成立 → 化した五行を基準に十二運を再判定.

Boundary:

- Keep as Shichu reference only until Sanmeigaku-specific source review is complete.

## 9. Step 2: Branch Relations

### 支合

Status: `source_confirmed_candidate`

Pairs:

- 子丑
- 寅亥
- 卯戌
- 辰酉
- 巳申
- 午未

### 三合

Status:

- Three-branch structure: `source_confirmed_candidate`
- 生・旺・墓 structure: `historical_source_supported`
- 半合 / 半会 conditions: `source_review_required`

| 三合 | 局 |
| --- | --- |
| 申子辰 | 水局 |
| 亥卯未 | 木局 |
| 寅午戌 | 火局 |
| 巳酉丑 | 金局 |

生・旺・墓 structure candidates:

| 局 | 生 | 旺 | 墓 |
| --- | --- | --- | --- |
| 水局 | 申 | 子 | 辰 |
| 木局 | 亥 | 卯 | 未 |
| 火局 | 寅 | 午 | 戌 |
| 金局 | 巳 | 酉 | 丑 |

### 冲 / 沖

Status: `source_confirmed_candidate`

Pairs:

- 子午
- 丑未
- 寅申
- 卯酉
- 辰戌
- 巳亥

Notation candidate:

- 冲
- 沖

Choose display notation only after comparing existing app wording and source conventions.

### 害

Status: `source_confirmed_candidate`

Pairs:

- 子未
- 丑午
- 寅巳
- 卯辰
- 申亥
- 酉戌

### 破

Status: `source_confirmed_candidate`

Pairs:

- 子酉
- 丑辰
- 寅亥
- 卯午
- 巳申
- 未戌

Important:

- 寅亥 is both 支合 and 破.
- 巳申 is both 支合 and 破.
- Future data structures must allow multiple branch relations for the same pair.

### 刑・自刑

Status:

- Branch composition: `provisional`
- 恩刑 / 無恩之刑 wording: `source_review_required`
- Directionality: `source_review_required`
- Whether all three branches are required: `source_review_required`
- Two-branch partial cases: `source_review_required`
- Required count for 自刑: `source_review_required`
- Fortune meaning / judgement text: `source_review_required`

Recorded candidates:

| Type | Branches |
| --- | --- |
| 無礼刑 | 子卯 |
| 勢刑 | 寅巳申 |
| 恩刑 | 丑戌未 |
| 自刑 | 辰、午、酉、亥 |

Boundary:

- Record relationship structure only.
- Do not add deterministic fortune meanings or user-facing judgement text from this note.

## 10. Visual Reference

Status:

- Diagram source existence: `source_confirmed_candidate`
- UI template ideas: `provisional`
- Applying fortune judgement to color/motion: undecided

The user-provided material included a circular branch-relation diagram page. This should be treated as `visual_reference`, not calculation specification.

Diagram targets:

- 三合局
- 刑
- 支合
- 破
- 冲 / 沖
- 害

Display candidates:

| Relation | Visual idea | Status |
| --- | --- | --- |
| 支合 | paired curves | `provisional` |
| 三合 | triangle or star-like shape | `provisional` |
| 冲 / 沖 | opposing line through center | `provisional` |
| 害 | offset diagonal line | `provisional` |
| 破 | inward collapsing curve | `provisional` |
| 刑 | polygon / crossing lines | `provisional` |
| 自刑 | overlapping mark on the same point | `provisional` |

Use cases:

- future fate dashboard,
- terminology dictionary,
- animation reference,
- relationship explanation UI.

Do not let the animation layer own calculation rules.

## 11. Confirmed Candidates

`source_confirmed_candidate` items:

- 十干 order
- 十二支 order
- 九星 short order
- 九星 formal-name candidates
- 月建・節・中気 correspondence
- 通変星 table existence / category set
- 十二運 table existence / category set
- 干合 five pairs
- 干合 transformed element candidates
- 支合 pairs
- 三合 branch groups
- 冲 / 沖 pairs
- 害 pairs
- 破 pairs
- branch-relation diagram page existence

These are candidates from user-provided material as interpreted by ChatGPT. They still require code/data comparison before implementation.

## 12. Provisional Items

`provisional` items:

- 通変星 → 十大主星 mapping candidates
- 十二運 → 十二大従星 mapping candidates
- 初年運 / 中年運 / 老年運 candidate formulas
- 支関係 diagram display ideas
- 刑 branch composition
- UI/animation template ideas from the circular diagram

These may be useful design/comparison leads, but they are not adopted app rules.

## 13. Source Review Required

`source_review_required` items:

- Actual month-pillar boundary and 節入り日時 handling
- Sanmeigaku adoption of 通変星 → 十大主星 mapping
- Sanmeigaku adoption of 十二運 → 十二大従星 mapping
- Full comparison with existing Sanmeigaku masters
- 合化成立条件
- Whether/how to apply transformed elements
- 自化干合 hidden-stem basis
- Sanmeigaku adoption of 自化干合
- 干合後の十二運再判定 adoption
- 半合 / 半会 conditions
- 冲 / 沖 notation choice
- 刑 wording, directionality, partial cases, and required branch counts
- 自刑 required count and meaning
- Any fortune judgement text for branch relations
- Whether visual colors/motion should reflect fortune meanings

## 14. Historical Source Supported

`historical_source_supported` items:

- 自化干合 concept existence
- 三合 生・旺・墓 structure

Use these as historical comparison evidence only. They do not override Sanmeigaku-specific source requirements.

## 15. Shichu Reference Only

`shichu_reference_only` items:

- 干合後、化した五行を基準に十二運を再判定する concept

Keep this as Shichu Suimei reference knowledge unless a future Sanmeigaku-specific source confirms adoption.

## 16. Future Code Comparison Checklist

Step 3 should compare this research ledger with current repository behavior.

Recommended checks:

- Find current 十干 and 十二支 order definitions.
- Find current 九星 labels, formal names, IDs, and display conventions.
- Compare 月建 and solar-term handling with calendar DB fields and existing board/month switching.
- Compare current Sanmeigaku 十大主星 derivation against the 通変星 relationship candidates.
- Compare current 十二大従星 derivation against the 十二運 relationship candidates.
- Compare current 初年運・中年運・老年運 formulas against 日干 × 年/月/日支 candidates.
- Inventory existing 蔵干 masters before reviewing 自化干合.
- Check whether current data structures can represent multiple branch relations for one pair.
- Decide whether branch-relation data belongs in source data, generated master data, or a read-only dictionary.
- Keep calculation layer, dashboard view-model, and animation layer separate.
- Add regression samples only after expected values are source-confirmed.

Do not begin implementation from this checklist without a separate source-review and implementation task.

## 17. Fortune Dashboard Connection

Long-term product direction:

- fixed natal chart
- 陰占
- 陽占
- 十大主星
- 十二大従星
- 干合
- 支合
- 三合
- 冲 / 沖
- 害
- 破
- 刑
- 大運
- 年運
- 月運
- 日運
- 時柱
- 運命の現在地

Future animation concept:

```text
生年月日時
→ 干支・星の演算
→ 螺旋状に回転
→ 星が人体星図へ着地
→ 運命ダッシュボードが完成
```

Layering rule:

- Calculation logic produces confirmed results.
- Dashboard view-model arranges the calculated result for display.
- Animation presentation consumes the view-model.
- Animation does not calculate pillars, stars, relations, or source status.

## 18. Source Page / Colophon TODO

TODO:

- Confirm exact page numbers for each table/page in 『改訂版 平成萬年暦』.
- Confirm colophon details beyond the current publisher mark.
- Confirm whether the same page includes both table data and explanatory text.
- Confirm whether branch-relation diagram notation uses 冲 or 沖.
- Confirm whether 刑 wording is 恩刑 or 無恩之刑 in the relevant source page.
- Add a compact page-reference table after source page confirmation.

Do not add photos, scans, PDFs, or long source text to Git while completing these TODOs.
