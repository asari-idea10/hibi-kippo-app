# 撮影萬年暦 source manifest

Last updated: 2026-07-18

Status: `documentation_only`, `external_image_inventory`, `production_unchanged`

## 1. Purpose and authority

この文書は、POが撮影した『改訂版 平成・萬年暦』画像の所在、同一性、内容区分、研究・実装への接続状態を追跡するMarkdown正本である。画像内容を再転記して占術規則を確定する台帳ではなく、画像を今後の研究で迷子にしないためのsource manifestである。

- 29ファイル、27 unique SHA-256、23 source recordを登録する。
- Source IDは原則としてimage asset単位で管理する。ただし、同一ページを構成する複数撮影画像について既存のpage-level source IDが先行している場合は、1 page sourceと複数image assetを一対多で関連付ける。
- 27 unique assetsと23 source recordsの差4件は、p.24の5 unique assetsを既存page source `HMA-P24-IMG-20260715`の1件へ束ねた結果である。残る22 assetsは各1 source IDを持ち、source ID未付番画像はない。
- 画像はリポジトリ外に置いたままにし、移動・削除・改名・加工・Git追加をしない。
- 同じSHA-256の別パスはsourceを増やさずaliasとして記録する。
- 異なるcropや別アングルは別image assetだが、同一ページ・同一資料単位なら1 source recordへ束ねられる。
- 既存source ID `HMA-P24-IMG-20260715`は変更しない。
- 研究ledgerの転記済み状態と、撮影sourceからproductionへ直接接続した状態を区別する。
- 本manifestの作成は、画像の再検証、正式master昇格、production接続、UI表示を意味しない。

### Book metadata shared by all records

| Field | Value |
| --- | --- |
| bookTitle | 『改訂版 平成・萬年暦』 |
| bookTitleStatus | confirmed from cover image |
| publisher / issuing body | 天象学会 |
| printed range | 明治30年〜平成75年 |
| edition | unknown |
| editionStatus | unknown; do not infer |
| owner / provider | PO |
| image storage | local external paths; not Git-managed |

## 2. Inventory summary

| Metric | Count | Note |
| --- | ---: | --- |
| Physical image files | 29 | AmazonPhotos 24 + Desktop direct 5 |
| Unique SHA-256 image assets | 27 | duplicate content excluded |
| Duplicate SHA groups | 2 | both are p.24 copies |
| Alias paths | 2 | Desktop primary ↔ AmazonPhotos alias |
| Source records | 23 | p.24 groups five unique assets under the existing source ID |
| Existing source IDs | 1 | `HMA-P24-IMG-20260715` |
| Newly assigned source IDs | 22 | manifest address only; not production adoption |
| Page-identified image assets | 14 | printed page visible or same-page crop group confirmed |
| Page unknown image assets | 12 | no page inferred |
| Page not applicable | 1 | cover |
| Theme-identified image assets | 27 | broad source theme only |
| Theme enum `unknown` | 0 | p.23 is `stem_branch_generating_overcoming_relations` |

### Unique asset and source-record reconciliation

| Asset group | Unique assets | Source records | Difference | Reason |
| --- | ---: | ---: | ---: | --- |
| p.24 monthly plate | 5 | 1 | 4 | Existing page-level source `HMA-P24-IMG-20260715` owns assets `hma-p24-01` through `hma-p24-05` |
| All other photographed material | 22 | 22 | 0 | One source ID per unique asset, including cover and `PUNK` page records |
| Total | 27 | 23 | 4 | No unassigned unique asset |

Duplicate aliases are excluded from the 27 unique assets and therefore do not explain this difference.

## 3. Field rules and enums

Each source record carries: `sourceId`, `sourceIdStatus`, `bookTitle`, `edition`, `pageNumber`, `pageRange`, `imageAssetIds`, `theme`, `subThemes`, `readabilityStatus`, `transcriptionStatus`, `normalizationStatus`, `verificationStatus`, `registryConnectionStatus`, `productionConnectionStatus`, `uiVisibilityStatus`, `relatedDocs`, `relatedRegistryIds`, `relatedDecisionIds`, `knownConflicts`, `nextAction`, and `notes`.

Each image asset carries: `imageAssetId`, `sourceId`, `imagePrimaryPath`, `imageAliasPaths`, `fileName`, `extension`, `fileSize`, `width`, `height`, `capturedAt`, `createdAt`, `modifiedAt`, and `sha256`.

### Status enums

- `sourceIdStatus`: `existing`, `newly_assigned`, `pending_page_identification`, `duplicate_alias`
- `readabilityStatus`: `readable`, `partially_readable`, `not_readable`, `not_reviewed`
- `transcriptionStatus`: `not_started`, `partially_transcribed`, `transcribed`, `double_checked`
- `normalizationStatus`: `not_started`, `ledger_only`, `structured`, `registry_ready`
- `verificationStatus`: `not_reviewed`, `po_confirmed`, `single_checked`, `double_checked`, `source_review_required`, `conflict_open`
- `registryConnectionStatus`: `not_connected`, `referenced`, `registered`
- `productionConnectionStatus`: `not_connected`, `partially_connected`, `connected_by_existing_logic`, `connected_from_this_source`, `intentionally_held`
- `uiVisibilityStatus`: `not_visible`, `partially_visible`, `visible_by_existing_logic`, `visible_from_this_source`

`connected_by_existing_logic` / `visible_by_existing_logic`は、同テーマの機能が存在するが撮影sourceから直接生成されていない状態である。`connected_from_this_source` / `visible_from_this_source`へ自動昇格させない。

### Source ID rule

- Page known: `HMA-P{page}-IMG-{captureDate}[-suffix]`
- Page unknown: `HMA-PUNK-IMG-{captureDate}-{suffix}`
- Same page, multiple nonduplicate images: suffix `A`, `B`, ...
- Existing p.24 record: `HMA-P24-IMG-20260715` remains unchanged.
- `IMG_5559.jpg`等、撮影日をファイル名・metadataから確定できない追加cropは、既存p.24 sourceのimage assetとして保持し、新しいcapture-date source IDを推測しない。

### Theme enum used by this manifest

`cover`, `ten_stem_fortune`, `twelve_fortune_stages`, `stem_combinations`, `branch_combinations`, `trines`, `punishments`, `clashes`, `breaks`, `harms`, `body_disease_correspondence`, `child_satsu`, `nobleman_and_shinsatsu`, `calendar_note_lower`, `special_days`, `monthly_plate`, `getsumei_lookup`, `stem_branch_generating_overcoming_relations`, `unknown`.

`stem_branch_generating_overcoming_relations`は、干支相生・相剋関係表のsource themeである。既存の命式計算や五行判定へ自動接続する分類ではない。

## 4. Source record identification

| sourceId | sourceIdStatus | pageNumber / pageRange | page evidence | theme | subThemes | imageAssetIds |
| --- | --- | --- | --- | --- | --- | --- |
| `HMA-P14-IMG-20260714-A` | newly_assigned | 14 | same-table group; asset D shows `-14-` | ten_stem_fortune | ten stems, twelve stages | `hma-p14-a-01` |
| `HMA-P14-IMG-20260714-B` | newly_assigned | 14 | same-table group; asset D shows `-14-` | ten_stem_fortune | ten stems, twelve stages | `hma-p14-b-01` |
| `HMA-P14-IMG-20260714-C` | newly_assigned | 14 | same-table group; asset D shows `-14-` | ten_stem_fortune | ten stems, twelve stages | `hma-p14-c-01` |
| `HMA-P14-IMG-20260714-D` | newly_assigned | 14 | printed page visible | ten_stem_fortune | ten stems, twelve stages | `hma-p14-d-01` |
| `HMA-PUNK-IMG-20260714-A` | newly_assigned | N/A / cover | cover; page not applicable | cover | title, publisher, printed range | `hma-punk-20260714-a-01` |
| `HMA-PUNK-IMG-20260714-B` | pending_page_identification | unknown | no printed page visible | twelve_fortune_stages | twelve stages lookup | `hma-punk-20260714-b-01` |
| `HMA-PUNK-IMG-20260714-C` | pending_page_identification | unknown | no printed page visible | stem_combinations | branch_combinations, trines | `hma-punk-20260714-c-01` |
| `HMA-PUNK-IMG-20260714-D` | pending_page_identification | unknown | no printed page visible | branch_combinations | trines, punishments, clashes, breaks, harms | `hma-punk-20260714-d-01` |
| `HMA-PUNK-IMG-20260714-E` | pending_page_identification | unknown | no printed page visible | branch_combinations | trines, punishments, clashes, breaks, harms | `hma-punk-20260714-e-01` |
| `HMA-PUNK-IMG-20260714-F` | pending_page_identification | unknown | no printed page visible | branch_combinations | stems, branches, nine stars, solar terms, branch relations | `hma-punk-20260714-f-01` |
| `HMA-PUNK-IMG-20260714-G` | pending_page_identification | unknown | no printed page visible | body_disease_correspondence | twelve branches, traditional disease terms | `hma-punk-20260714-g-01` |
| `HMA-PUNK-IMG-20260715-A` | pending_page_identification | unknown | no printed page visible | body_disease_correspondence | five elements, organs, body parts/functions | `hma-punk-20260715-a-01` |
| `HMA-P19-IMG-20260715` | newly_assigned | 19 | printed page visible | child_satsu | 小児殺（小月建） | `hma-p19-01` |
| `HMA-PUNK-IMG-20260715-B` | pending_page_identification | unknown | no printed page visible | nobleman_and_shinsatsu | 生月支, 天徳貴人, 月徳貴人, 天徳合, 月徳合 | `hma-punk-20260715-b-01` |
| `HMA-P20-IMG-20260715` | newly_assigned | 20 | printed page visible | nobleman_and_shinsatsu | 生日十干, multiple noble spirits | `hma-p20-01` |
| `HMA-PUNK-IMG-20260715-C` | pending_page_identification | unknown | no printed page visible | nobleman_and_shinsatsu | special spirits and special kanshi | `hma-punk-20260715-c-01` |
| `HMA-P21-IMG-20260715` | newly_assigned | 21 | printed page visible | special_days | 陰差陽錯, 日貴, 日徳, 妨害殺, 十大悪 | `hma-p21-01` |
| `HMA-PUNK-IMG-20260715-D` | pending_page_identification | unknown | no printed page visible | calendar_note_lower | 四癈日, 地轉殺, 天轉殺, 天赦日 | `hma-punk-20260715-d-01` |
| `HMA-PUNK-IMG-20260715-E` | pending_page_identification | unknown | no printed page visible | nobleman_and_shinsatsu | 羊刃, 飛刃, 暗禄, 金輿禄 | `hma-punk-20260715-e-01` |
| `HMA-PUNK-IMG-20260715-F` | pending_page_identification | unknown | no printed page visible | calendar_note_lower | 方位に関係ある吉凶日 | `hma-punk-20260715-f-01` |
| `HMA-P23-IMG-20260715` | newly_assigned | 23 | printed page visible | stem_branch_generating_overcoming_relations | 干支相生・相剋関係表 | `hma-p23-01` |
| `HMA-P24-IMG-20260715` | existing | 24 | printed page visible and same-page crops | monthly_plate | 36月盤, fine markers, side legend | `hma-p24-01`…`hma-p24-05` |
| `HMA-P25-IMG-20260715` | newly_assigned | 25 | printed page visible | getsumei_lookup | 月命早見表, 3 groups × 12 months | `hma-p25-01` |

## 5. Source lifecycle and connections

Common abbreviations in this table:

- `common-ledger`: `docs/mannenreki-common-master-research.md`
- `additional-ledger`: `docs/mannenreki-additional-masters-research.md`
- `monthly-audit`: `docs/monthly-plate-promotion-audit.md`
- `personal-audit`: `docs/research/personal-stars/honmei-getsumei-audit.md`

| sourceId | readability | transcription | normalization | verification | registry | production | UI | relatedDocs / registry / Decisions | knownConflicts | nextAction |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `HMA-P14-IMG-20260714-A` | partially_readable | partially_transcribed | ledger_only | source_review_required | referenced | connected_by_existing_logic | not_visible | common-ledger; D-0009 | photographed table not directly bound to existing calculation core | identify crop coverage and compare cells without changing core |
| `HMA-P14-IMG-20260714-B` | partially_readable | partially_transcribed | ledger_only | source_review_required | referenced | connected_by_existing_logic | not_visible | common-ledger; D-0009 | same as p.14-A | same as p.14-A |
| `HMA-P14-IMG-20260714-C` | partially_readable | partially_transcribed | ledger_only | source_review_required | referenced | connected_by_existing_logic | not_visible | common-ledger; D-0009 | same as p.14-A | same as p.14-A |
| `HMA-P14-IMG-20260714-D` | readable | partially_transcribed | ledger_only | source_review_required | referenced | connected_by_existing_logic | not_visible | common-ledger; D-0009 | same as p.14-A | verify complete table cells and source binding |
| `HMA-PUNK-IMG-20260714-A` | readable | not_started | not_started | single_checked | referenced | not_connected | not_visible | this manifest | edition remains unknown | identify edition from a supported bibliographic source |
| `HMA-PUNK-IMG-20260714-B` | readable | partially_transcribed | ledger_only | source_review_required | referenced | connected_by_existing_logic | not_visible | common-ledger; D-0009 | photographed table is not the calculation source | identify page and verify cells |
| `HMA-PUNK-IMG-20260714-C` | readable | partially_transcribed | ledger_only | source_review_required | referenced | connected_by_existing_logic | not_visible | common-ledger; D-0009 | relation use differs by technique | identify page; preserve technique-specific meanings |
| `HMA-PUNK-IMG-20260714-D` | readable | partially_transcribed | ledger_only | source_review_required | referenced | connected_by_existing_logic | not_visible | common-ledger; D-0009 | branch relations must not be merged across use cases | identify page and verify table cells |
| `HMA-PUNK-IMG-20260714-E` | readable | partially_transcribed | ledger_only | source_review_required | referenced | connected_by_existing_logic | not_visible | common-ledger; D-0009 | same as relation source D | identify page and crop coverage |
| `HMA-PUNK-IMG-20260714-F` | readable | partially_transcribed | ledger_only | source_review_required | referenced | connected_by_existing_logic | not_visible | common-ledger; additional-ledger | overview mixes several concepts | identify page and split future claims by concept |
| `HMA-PUNK-IMG-20260714-G` | readable | partially_transcribed | ledger_only | source_review_required | referenced | intentionally_held | not_visible | additional-ledger; D-0011 | medical diagnosis and prediction prohibited | identify page; double-check only for nonmedical research use |
| `HMA-PUNK-IMG-20260715-A` | readable | partially_transcribed | ledger_only | source_review_required | referenced | intentionally_held | not_visible | additional-ledger; D-0011 | medical diagnosis and prediction prohibited | identify page and verify traditional correspondence cells |
| `HMA-P19-IMG-20260715` | readable | partially_transcribed | ledger_only | source_review_required | referenced | connected_by_existing_logic | visible_by_existing_logic | additional-ledger; `child_satsu`; D-0011 | photographed source not directly bound to v0 implementation | verify source table against existing v0 without changing it |
| `HMA-PUNK-IMG-20260715-B` | readable | partially_transcribed | ledger_only | source_review_required | referenced | not_connected | not_visible | additional-ledger; D-0014 | monthly direction deities and natal shinsatsu are separate | identify page, target pillar, and mixed stem/branch cells |
| `HMA-P20-IMG-20260715` | readable | partially_transcribed | ledger_only | source_review_required | referenced | not_connected | not_visible | additional-ledger; D-0011 | target pillars and multiple candidates unresolved | verify all cells and target columns |
| `HMA-PUNK-IMG-20260715-C` | readable | partially_transcribed | ledger_only | source_review_required | referenced | partially_connected | partially_visible | additional-ledger; D-0011 | only some same-name concepts exist in production | identify page; do not bind by name alone |
| `HMA-P21-IMG-20260715` | readable | partially_transcribed | ledger_only | source_review_required | referenced | partially_connected | partially_visible | additional-ledger; D-0011 | selection-day and natal-spirit roles may differ | verify cells, rule targets, and existing name overlaps |
| `HMA-PUNK-IMG-20260715-D` | readable | partially_transcribed | ledger_only | source_review_required | referenced | connected_by_existing_logic | partially_visible | additional-ledger; calendar notes status | photographed source is not direct binding | identify page and compare existing selected-day rows |
| `HMA-PUNK-IMG-20260715-E` | readable | partially_transcribed | ledger_only | source_review_required | referenced | partially_connected | partially_visible | additional-ledger; D-0011 | same-name features may have different target pillars | identify page and verify all output branches |
| `HMA-PUNK-IMG-20260715-F` | readable | partially_transcribed | ledger_only | source_review_required | referenced | not_connected | not_visible | additional-ledger | application conditions are unresolved | identify page and transcribe headings before policy work |
| `HMA-P23-IMG-20260715` | readable | partially_transcribed | ledger_only | source_review_required | referenced | connected_by_existing_logic | not_visible | additional-ledger; common-ledger; D-0009 | photographed source has no direct binding | add a dedicated theme enum only if a future schema decision requires it |
| `HMA-P24-IMG-20260715` | partially_readable | double_checked | registry_ready | conflict_open | registered | connected_by_existing_logic | visible_by_existing_logic | additional-ledger; monthly-audit; `source-claim.hma-p24.monthly-plates.v1`; `lookup.monthly.centers-36.v1`; `lookup.monthly.palace-stars-36x9.v1`; D-0016–D-0020 | C寅月徳合; source 三合 concept mismatch; orientation 5/9; 296 fine markers; 24山 | Level 2: confirm orientation/24山, double-check 296 fine markers, preserve conflicts |
| `HMA-P25-IMG-20260715` | readable | transcribed | structured | source_review_required | referenced | connected_by_existing_logic | not_visible | additional-ledger; personal-audit; `lookup.personal.getsumei-36.v1`; D-0021 | this HMA image is not the registered specialist source claim | verify the photographed table independently; keep production import absent |

## 6. Image asset manifest

Path roots used below are literal absolute prefixes:

- `AP` = `/Users/asaritoshiyuki/Desktop/AmazonPhotos/`
- `DT` = `/Users/asaritoshiyuki/Desktop/`

`createdAt` / `modifiedAt` are filesystem observations, not asserted camera capture times. `capturedAt` is taken only from a timestamp filename; `IMG_*.jpg` remains `unknown`.

| imageAssetId | sourceId | primaryPath | aliasPaths | bytes | dimensions | capturedAt | createdAt / modifiedAt | sha256 |
| --- | --- | --- | --- | ---: | --- | --- | --- | --- |
| `hma-p14-a-01` | `HMA-P14-IMG-20260714-A` | `AP/2026-07-14_20-34-25_360.jpeg` | — | 2796804 | 4032×3024 JPEG | 2026-07-14T20:34:25+09:00 | 2026-07-15T08:58:46+09:00 / same | `1ebd2981cfd3667b6662ea2a874e475fa07a9362aad3148999ddb016f61a0a2c` |
| `hma-p14-b-01` | `HMA-P14-IMG-20260714-B` | `AP/2026-07-14_20-34-31_588.jpeg` | — | 2988640 | 4032×3024 JPEG | 2026-07-14T20:34:31+09:00 | 2026-07-15T08:58:48+09:00 / same | `9560c47a570f0519bd8bba0312bc4c043a78d02f78ffab6926491477b400325f` |
| `hma-p14-c-01` | `HMA-P14-IMG-20260714-C` | `AP/2026-07-14_20-34-57_692.jpeg` | — | 2233984 | 4032×3024 JPEG | 2026-07-14T20:34:57+09:00 | 2026-07-15T08:58:18+09:00 / same | `dc1c48f2702bbd6907cd09d558b504351386d084489d3b4a55243358854a8b9c` |
| `hma-p14-d-01` | `HMA-P14-IMG-20260714-D` | `AP/2026-07-14_20-35-02_386.jpeg` | — | 2301496 | 4032×3024 JPEG | 2026-07-14T20:35:02+09:00 | 2026-07-15T08:58:10+09:00 / same | `6a78f2e067532f61fdd4bf747811564b97730dd1afd684d4f9fa4d3ae6088699` |
| `hma-punk-20260714-a-01` | `HMA-PUNK-IMG-20260714-A` | `AP/2026-07-14_20-35-58_466.jpeg` | — | 4716928 | 5712×4284 JPEG | 2026-07-14T20:35:58+09:00 | 2026-07-15T08:57:54+09:00 / same | `a88d40533f808097266d4c18e8404a1712beb3938a9344b63586e5033918ee3a` |
| `hma-punk-20260714-b-01` | `HMA-PUNK-IMG-20260714-B` | `AP/2026-07-14_20-40-31_859.jpeg` | — | 4034762 | 5712×4284 JPEG | 2026-07-14T20:40:31+09:00 | 2026-07-15T08:57:48+09:00 / same | `6364d251ff9fa44d917da29f561e0df70d4fa4ff47e8a495ba8c5bba1de82323` |
| `hma-punk-20260714-c-01` | `HMA-PUNK-IMG-20260714-C` | `AP/2026-07-14_20-45-37_836.jpeg` | — | 2444969 | 4032×3024 JPEG | 2026-07-14T20:45:37+09:00 | 2026-07-15T08:57:44+09:00 / same | `f55f9120dda9b714275453f89fabbe7bfa65349d210a27feb4e2392745fd734e` |
| `hma-punk-20260714-d-01` | `HMA-PUNK-IMG-20260714-D` | `AP/2026-07-14_21-00-35_871.jpeg` | — | 2778776 | 4032×3024 JPEG | 2026-07-14T21:00:35+09:00 | 2026-07-15T08:57:46+09:00 / same | `faf3c0e316b8cd06c88da47c0f6b2e7d2f3031f7f228a466e781dd80dc3c2c9f` |
| `hma-punk-20260714-e-01` | `HMA-PUNK-IMG-20260714-E` | `AP/2026-07-14_21-00-51_438.jpeg` | — | 2426218 | 4032×3024 JPEG | 2026-07-14T21:00:51+09:00 | 2026-07-15T08:57:00+09:00 / same | `2dcd6a4ae96107cf7992c65cf0f6f8fbc6fe1af0730dc6bcd0ee041b94c3cea7` |
| `hma-punk-20260714-f-01` | `HMA-PUNK-IMG-20260714-F` | `AP/2026-07-14_21-02-50_771.jpeg` | — | 2189778 | 4032×3024 JPEG | 2026-07-14T21:02:50+09:00 | 2026-07-15T08:56:54+09:00 / same | `f633be9b84d9d6b2b43e90849fa09d035dcdefc0e4427c810cb4aa970a4a6754` |
| `hma-punk-20260714-g-01` | `HMA-PUNK-IMG-20260714-G` | `AP/2026-07-14_21-07-47_942.jpeg` | — | 1759078 | 1740×3867 JPEG | 2026-07-14T21:07:47+09:00 | 2026-07-15T08:58:38+09:00 / same | `6f283f6e470cbc7f3571aa25306600e6e545bea7e3ba006a4cbcdd1943010b23` |
| `hma-punk-20260715-a-01` | `HMA-PUNK-IMG-20260715-A` | `AP/2026-07-15_05-57-48_551.jpeg` | — | 1264537 | 1233×3956 JPEG | 2026-07-15T05:57:48+09:00 | 2026-07-15T08:56:58+09:00 / same | `92ad8745e69470dbad6ff4b763fb01e7c9cad38413eaa1c8700709fd484983fa` |
| `hma-p19-01` | `HMA-P19-IMG-20260715` | `AP/2026-07-15_06-04-05_266.jpeg` | — | 2816853 | 4032×3024 JPEG | 2026-07-15T06:04:05+09:00 | 2026-07-15T08:58:50+09:00 / same | `f3aaf652ed5d11df482180f0768a8f1010c8f9ccd6dab9c7e0c126c461cb7444` |
| `hma-punk-20260715-b-01` | `HMA-PUNK-IMG-20260715-B` | `AP/2026-07-15_20-09-13_560.jpeg` | — | 1261632 | 1293×4032 JPEG | 2026-07-15T20:09:13+09:00 | 2026-07-16T03:21:18+09:00 / same | `b44f1676ecf963d16c5e6020c632f56304ff7c62dedc2312faf314007de332f6` |
| `hma-p20-01` | `HMA-P20-IMG-20260715` | `AP/2026-07-15_20-09-30_749.jpeg` | — | 1873134 | 1548×3938 JPEG | 2026-07-15T20:09:30+09:00 | 2026-07-16T03:21:20+09:00 / same | `975e40986fc4148baad0e394954fc563006bdd015769e8180d4b4afb9bec015c` |
| `hma-punk-20260715-c-01` | `HMA-PUNK-IMG-20260715-C` | `AP/2026-07-15_20-10-23_997.jpeg` | — | 2110185 | 4032×3024 JPEG | 2026-07-15T20:10:23+09:00 | 2026-07-16T03:21:20+09:00 / same | `9402316eb8851e06a755304c4e7b045eabd2a20983df03daccb5a09aebcdd5b5` |
| `hma-p21-01` | `HMA-P21-IMG-20260715` | `AP/2026-07-15_20-10-28_964.jpeg` | — | 2286389 | 4032×3024 JPEG | 2026-07-15T20:10:28+09:00 | 2026-07-16T03:21:16+09:00 / same | `d01b4da05099d33a356ffa9dc10885be9d3aca7a440dedc3c20daa0d8b050226` |
| `hma-punk-20260715-d-01` | `HMA-PUNK-IMG-20260715-D` | `AP/2026-07-15_20-10-40_697.jpeg` | — | 1938764 | 4032×3024 JPEG | 2026-07-15T20:10:40+09:00 | 2026-07-16T03:21:06+09:00 / same | `63715e261b36398843760f8075c3b04bcc886615965ada2b7c91cd083f79f856` |
| `hma-punk-20260715-e-01` | `HMA-PUNK-IMG-20260715-E` | `AP/2026-07-15_20-10-47_362.jpeg` | — | 2164570 | 4032×3024 JPEG | 2026-07-15T20:10:47+09:00 | 2026-07-16T03:21:00+09:00 / same | `2d07426c4a9c453f60b25c0da68c4ff5faffac5050372bbc6e231a9ad1db1a8d` |
| `hma-punk-20260715-f-01` | `HMA-PUNK-IMG-20260715-F` | `AP/2026-07-15_20-11-02_308.jpeg` | — | 2516606 | 4032×3024 JPEG | 2026-07-15T20:11:02+09:00 | 2026-07-16T03:20:54+09:00 / same | `73dafad071375f28ec047908d1979e57cdf8aabeea4cd29e179b9531037a51b7` |
| `hma-p23-01` | `HMA-P23-IMG-20260715` | `AP/2026-07-15_20-11-10_996.jpeg` | — | 3086693 | 2891×3024 JPEG | 2026-07-15T20:11:10+09:00 | 2026-07-16T03:21:06+09:00 / same | `f9ab49d4035ee880e87ca3fc1b16fd3a9cbbb0e8ec831e9ad159cfe908b2c1e5` |
| `hma-p24-01` | `HMA-P24-IMG-20260715` | `DT/2026-07-15_20-12-03_483.jpeg` | `AP/2026-07-15_20-12-03_483.jpeg` | 3149633 | 4032×3024 JPEG | 2026-07-15T20:12:03+09:00 | Desktop: 2026-07-17T21:23:31+09:00 / 21:23:32; AP: 2026-07-16T03:20:50+09:00 / same | `0f08abdb2889b2c1872b731f221d03a08475cdec5d6f551de2841cecf49a2314` |
| `hma-p24-02` | `HMA-P24-IMG-20260715` | `DT/2026-07-15_20-12-09_296.jpeg` | `AP/2026-07-15_20-12-09_296.jpeg` | 2615378 | 4032×3024 JPEG | 2026-07-15T20:12:09+09:00 | Desktop: 2026-07-17T21:23:37+09:00 / same; AP: 2026-07-16T03:20:44+09:00 / same | `b9df50a7c2351dbeeba962aaf0368bcf81f76cacfa8583d771bc30222ddb51c5` |
| `hma-p24-03` | `HMA-P24-IMG-20260715` | `DT/IMG_5559.jpg` | — | 931476 | 1940×1512 JPEG | unknown | 2026-07-17T23:43:10+09:00 / same | `3b484f293e13167eef51d4fdb53c5f93d02b4c5539c4ad9e73a1b6ac5c9159cd` |
| `hma-p24-04` | `HMA-P24-IMG-20260715` | `DT/IMG_5561.jpg` | — | 792219 | 1697×1512 JPEG | unknown | 2026-07-17T23:43:10+09:00 / same | `90d7daa1f8fab8ecf8b3e47c3dee20515bf46405db82ec9c3688681545cfa0da` |
| `hma-p24-05` | `HMA-P24-IMG-20260715` | `DT/IMG_5562.jpg` | — | 220707 | 310×2016 JPEG | unknown | 2026-07-17T23:43:10+09:00 / same | `d6d02555f85a2fa3f55dd135351ccbc4bb783224186bd29b427f46ffbdca5580` |
| `hma-p25-01` | `HMA-P25-IMG-20260715` | `AP/2026-07-15_20-12-14_432.jpeg` | — | 2467090 | 4032×3024 JPEG | 2026-07-15T20:12:14+09:00 | 2026-07-16T03:20:40+09:00 / same | `8e62955cb4a197c19fc055d31b221d5b15a66f5c0acd47e661af276b7d23c6da` |

## 7. Theme-level use matrix

| Theme | Photographed source state | Research / structure | Registry | Production / UI | Source-specific next action |
| --- | --- | --- | --- | --- | --- |
| Monthly plate p.24 | five unique assets; existing source ID; two aliases | Level 1 double-checked and registry-ready; 296 fine markers remain research evidence | monthly Level 1 registered | existing calculation is displayed; not generated from these images | use for Level 2 orientation, 24山, fine-marker verification while preserving conflicts |
| Getsumei lookup p.25 | one readable image; new manifest ID | 36 table transcribed; independent specialist-source verification exists | personal getsumei lookup registered from other claims; this image is referenced only | existing date binding exists; getsumei UI not exposed from this source | independently verify p.25 cells and keep source claims separate |
| Child satsu p.19 | one readable image | additional ledger candidate | dedicated provenance not registered | v0 and UI exist by existing logic | compare source table to v0; do not silently replace logic |
| Calendar-note lower / special days | multiple readable images | partial ledger | not registered as photographed-source claims | some selected-day output exists by existing logic | identify pages and perform item-by-item binding review |
| Nobleman / shinsatsu | multiple readable images | partial ledger, target pillars unresolved | not connected | some same-name features may exist; no direct source UI | identify pages and verify headers/cells before normalization |
| Stem / branch relation tables | multiple readable images | common ledger | research references only | separate existing Sanmeigaku and calendar paths | preserve technique-specific meanings; no name-based merge |
| Body / disease correspondence | two readable images | research ledger | not connected | intentionally held; not visible | identify pages and keep nonmedical limits |
| Ten-stem / twelve-stage tables | p.14 crop group plus one unknown-page table | common ledger | research references only | calculation core exists independently | bind only after cell-level verification; do not reopen protected core |

## 8. Photographed but not directly used

The following photographed themes have no `connected_from_this_source` production path:

- p.14 ten-stem fortune / twelve-stage crop group.
- unknown-page twelve-stage table.
- stem combination and branch relation tables.
- body / disease correspondence tables.
- nobleman and shinsatsu tables.
- special-day and calendar-note-lower tables.
- p.23 stem/branch generating-controlling table.
- p.25 Getsumei lookup image itself; the registered personal-star evidence uses separate specialist-source claims.

Some of these themes have values or same-name features in existing production. That is recorded as `connected_by_existing_logic` or `partially_connected`, never as proof that the photographed source has been adopted.

## 9. Monthly Level 2 usable source set

Only `HMA-P24-IMG-20260715` is directly addressable for the next monthly Level 2 research step. Its five unique assets provide:

- two registered p.24 overview/group images,
- two close views of monthly-plate groups,
- one side-legend crop.

They may be used to continue:

1. source orientation and 24山 evidence search,
2. independent double-check of the 296 fine-marker cells,
3. C寅月徳合 source discrepancy research,
4. source `三合` marker concept research,
5. future Level 2 fixture design after source gates pass.

They must not be used to infer unreadable values from current code, fill C寅月徳合 as West, merge source `三合` into the current three-direction path, or promote all fine markers because the image is manifest-addressable.

## 10. Validation record

Validation for this docs-only manifest is performed without adding a permanent script:

- count physical files under the two declared locations,
- hash every file with SHA-256,
- group identical hashes and verify aliases,
- inspect dimensions,
- verify all source IDs and image asset IDs are unique,
- verify every unique SHA appears once as an image asset,
- verify `HMA-P24-IMG-20260715` and its two previously registered SHA values remain unchanged,
- verify page-unknown records carry no inferred numeric page,
- verify every related doc path exists,
- verify status values use the enums in section 3,
- verify no production, UI, image, data, generated file, or existing provenance registry changes are included.

## 11. Next work

1. Use this manifest to select the first source-confirmed monthly Level 2 UI candidate.
2. Before implementation, resolve the exact source asset, source position, evidence status, transformation, and conflict constraints for that candidate.
3. Continue page identification for the 12 unknown-page images without changing their `PUNK` IDs prematurely; add a superseding alias/mapping policy only through an explicit later update.
4. Do not re-open completed monthly Level 1 values.
