# 改訂版 平成萬年暦 追加マスター研究台帳

Last updated: 2026-07-15

Status: `documentation_only`, `implementation_pending`, `source_review_required`

## 1. Purpose

この文書は、ユーザー保有の『改訂版 平成萬年暦』から追加で確認された資料群を、今後の既存コード照合、新規マスター設計、表示仕様検討に利用するための正式な研究台帳である。

本台帳では、次の2種類を明確に分離する。

1. 既存コード・既存masterと照合すべき項目
2. 現在コードに存在しない可能性がある新規候補

この作業は docs-only であり、アプリの計算、既存master、データ、型、テスト、UI、URL、表示、候補判定を変更しない。Step 5A ではコード上の存在有無を確定せず、Step 5B の read-only 検索で確認する。

## 2. Source Handling

原資料の扱い:

- 資料名: 『改訂版 平成萬年暦』
- 所有者: ユーザー
- 研究記録の由来: 「ユーザー提供画像をChatGPTが読解・整理した研究記録」
- Codex による画像原本の確認: 未実施
- Git 管理: 画像・PDFを追加しない
- 完全一致保証: 行わない

本台帳は、Codex が画像を確認、精読、OCRした記録ではない。各表の存在、転記候補、構造候補を区別し、ページ・見出し・旧字体・古い病名・判読困難語・セル値・補足記号が未確認の場合はTODOとして残す。

確認済みページ候補:

| 資料群 | Page | Status |
| --- | ---: | --- |
| 小児殺（小月建） | 19 | `source_confirmed_candidate` |
| 干支相生・相剋表 | 23 | `source_confirmed_candidate` |
| その他の追加資料群 | TODO | `source_review_required` |

## 3. Product Decision: Shichu Suimei and Sanmeigaku Coexistence

プロダクト方針として、四柱推命と算命学は排他的に扱わない。

両者は十干・十二支・陰陽五行を共有する体系として、名称・表現・解釈の違いを明示しながら併用・併記する。ただし、個別項目の完全一致を推測で断定せず、判定構造、成立条件、参照する柱、意味、表示用途を資料ごとに照合する。

対応状態:

| Label | Meaning |
| --- | --- |
| `equivalent` | 判定構造と成立条件を照合し、同等と確認できた。 |
| `partially_equivalent` | 共有部分はあるが、名称、条件、用途、解釈の一部が異なる。 |
| `shared_foundation` | 十干・十二支・陰陽五行などの共通基盤として扱える。 |
| `shichu_only` | 四柱推命側だけで採用する候補。 |
| `sanmeigaku_only` | 算命学側だけで採用する候補。 |
| `source_review_required` | 対応関係または採用可否を追加資料で照合する必要がある。 |

この段階では、追加資料群の四柱推命・算命学対応を一律に `equivalent` としない。

## 4. Status Labels

| Label | Meaning |
| --- | --- |
| `source_confirmed_candidate` | ChatGPTが整理した研究記録上で、表、項目、または候補値の存在が確認された。現行コードや原画像との再照合は未完了。 |
| `manual_transcription_review_required` | 表のセル、旧字体、記号、注記、語句を人手で再確認する必要がある。 |
| `code_comparison_required` | 既存コード・既存master・既存テストとの read-only 照合が必要。 |
| `provisional` | 設計または採用候補だが、正式決定ではない。 |
| `source_review_required` | 成立条件、意味、対象柱、境界、優先順位などを追加資料で確認する必要がある。 |
| `wellness_reference_candidate` | 医療用途ではない体調観察・セルフケア参考表示の候補。 |
| `not_adopted` | アプリ仕様・判定・表示として採用しない。 |
| `high_priority_candidate` | 将来の照合、マスター設計、回帰テスト候補として優先度が高い。 |
| `shared_foundation` | 複数体系が共有する基礎構造の候補。 |
| `implementation_pending` | 実装していない。別タスクの判断と検証が必要。 |
| `documentation_only` | 本工程では文書だけを更新する。 |

`source_confirmed_candidate` は、Codexによる原画像確認や原資料との完全一致保証を意味しない。

## 5. Traditional Body Correspondence

### 研究対象

- 十干と五行
- 十干と内臓器官
- 十干と身体部位
- 十干と伝統的な疾病・症状語
- 十二支と五行
- 十二支と内臓器官
- 十二支と身体部位
- 十二支と身体機能

### 位置づけと状態

| Area | Status |
| --- | --- |
| 表の存在 | `source_confirmed_candidate` |
| 基本構造 | `manual_transcription_review_required` |
| 古い病名・旧字体・判読語 | `source_review_required` |
| アプリ利用 | `wellness_reference_candidate` |
| 医療診断・発症予測 | `not_adopted` |

伝統的身体対応の研究資料として保持する。将来利用する場合も、体調観察・セルフケアの参考表示候補に限定し、発病、癌、感染症、死亡、寿命等を断定しない。

## 6. Shounisatsu

資料: 小児殺（小月建）、19ページ候補。

入力候補:

- 年支グループ
  - 子・寅・辰・午・申・戌
  - 丑・卯・巳・未・酉・亥
- 月建

出力候補:

- 小児殺となる宮
- 方位

関連領域:

- 九星気学
- 月盤
- 方位神
- 同行者判定
- 子どもを伴う移動

| Area | Status |
| --- | --- |
| 表 | `source_confirmed_candidate` |
| 節入り基準 | `code_comparison_required` |
| 同行者判定への採用 | `provisional` |
| 病気・事故の断定 | `not_adopted` |

TODO: 小児の年齢範囲、本人だけか同行者にも適用するか、注意表示か候補ランク低下か、中宮の扱い、吉方位と重なる場合の優先順位を確認する。

## 7. Noble Spirits by Birth Month Branch

入力は生月の支。出力候補は天徳貴人、月徳貴人、天徳合、月徳合、日時華蓋。

観察候補:

- 天干と地支が同じ列に混在する。
- 日時華蓋は三合局の墓支との関連候補がある。
- 天徳貴人と天徳合には干合構造の候補がある。
- 成立条件と照合する柱は未確定。

| Area | Status |
| --- | --- |
| 表 | `source_confirmed_candidate` |
| 成立条件 | `source_review_required` |
| 算命学との対応 | `source_review_required` |

## 8. Noble Spirits by Day Stem

入力は生日十干、すなわち日干。

出力候補:

- 太極貴人
- 天乙貴人
- 福星貴人
- 天厨貴人
- 天官貴人
- 天福貴人
- 文星貴人
- 節度貴人

各出力は地支の配列で、複数候補支を持つ項目がある。太極貴人・天乙貴人には日干グループごとの規則性候補があるが、現時点では規則化せず、転記・再確認後の表を正本候補とする。

| Area | Status |
| --- | --- |
| 表 | `source_confirmed_candidate` |
| 照合対象の柱 | `source_review_required` |
| 四柱推命・算命学併記 | `provisional` |

## 9. Special Spirits and Special Kanshi

確認できた項目候補:

- 禄馬同郷
- 金神
- 曲脚
- 平頭
- 日刃
- 懸針
- 退神
- 進神
- 淫欲殺
- 魁罡

年月日時、生日、生時などの見出しが混在し、神殺名ごとに基準柱が異なる可能性がある。単純な干支リストへ正規化せず、成立対象柱を別フィールドで保持できる設計候補とする。

| Area | Status |
| --- | --- |
| 表の存在 | `source_confirmed_candidate` |
| 各セル | `manual_transcription_review_required` |
| 成立対象柱 | `source_review_required` |
| 既存の魁罡・準魁罡・異常干支との対応 | `code_comparison_required` |

## 10. Special and Unfavorable Days

確認できた項目候補:

- 陰差陽錯殺
- 日貴
- 日徳
- 妨害日殺
- 十大悪敗之日
- 大敗日・悪日系

| Area | Status |
| --- | --- |
| 表の存在 | `source_confirmed_candidate` |
| 完全転記 | `manual_transcription_review_required` |
| 判定対象柱 | `source_review_required` |
| 既存暦注・選日masterとの対応 | `code_comparison_required` |

名称だけから吉凶、強度、除外条件、候補ランクへの影響を推測しない。

## 11. Blade and Fortune Spirits

入力は生日十干、すなわち日干。主要項目は羊刃、飛刃、暗禄、金輿禄で、名称未確定の複数支欄もある。

観察候補:

- 羊刃と飛刃には対冲構造候補がある。
- 各結果は地支。
- 左端欄の正式名称は未確定。

| Area | Status |
| --- | --- |
| 主要4項目 | `source_confirmed_candidate` |
| 左端欄 | `source_review_required` |
| 算命学との対応 | `source_review_required` |

## 12. Seasonal Selected Days

季節別の4選日セット候補:

| Season | Month branches candidate | 天赦日 | 天転殺 | 地転殺 | 四廃日 |
| --- | --- | --- | --- | --- | --- |
| 春 | 寅・卯・辰月 | 戊寅 | 乙卯 | 辛卯 | 庚申 |
| 夏 | 巳・午・未月 | 甲午 | 丙午 | 戊午 | 壬子 |
| 秋 | 申・酉・戌月 | 戊申 | 辛酉 | 癸酉 | 甲寅 |
| 冬 | 亥・子・丑月 | 甲子 | 壬子 | 丙子 | 丙午 |

天赦日だけを単独採用せず、天転殺・地転殺・四廃日を含む4選日セットとして照合する。季節区分と節入り基準も同時に確認する。

| Area | Status |
| --- | --- |
| 季節別干支 | `source_confirmed_candidate` |
| 既存選日master | `code_comparison_required` |
| 意味・強度・優先順位 | `source_review_required` |

## 13. Nine-Star Hour Plate

入力候補:

- 陽遁 / 陰遁
- 日支グループ
  - 子・卯・午・酉の日
  - 丑・辰・未・戌の日
  - 寅・巳・申・亥の日
- 十二支刻

| 十二支刻 | Civil-time candidate |
| --- | --- |
| 子刻 | 23時〜1時 |
| 丑刻 | 1時〜3時 |
| 寅刻 | 3時〜5時 |
| 卯刻 | 5時〜7時 |
| 辰刻 | 7時〜9時 |
| 巳刻 | 9時〜11時 |
| 午刻 | 11時〜13時 |
| 未刻 | 13時〜15時 |
| 申刻 | 15時〜17時 |
| 酉刻 | 17時〜19時 |
| 戌刻 | 19時〜21時 |
| 亥刻 | 21時〜23時 |

出力候補は刻盤の基準九星または中宮星候補。

| Area | Status |
| --- | --- |
| 表 | `source_confirmed_candidate` |
| 刻盤実装 | `high_priority_candidate` |
| 切替規則 | `source_review_required` |

TODO: 陽遁・陰遁切替、子刻の日界、真太陽時、地域補正、表の出力星が中宮星かを確認する。`docs/sanmeigaku-input-and-time-pillar-research.md` の時柱研究と語句を共有しても、九星刻盤と算命学時柱の計算規則は同一視しない。

## 14. Sexagenary Internal Five-Element Relations

資料: 干支相生・相剋表、23ページ。

対象:

- 六十干支
- 六旬
- 各旬の空亡
- 天干と地支の五行関係

関係区分と正規化候補:

| Source category | Normalized candidate |
| --- | --- |
| 上生 | `branch_generates_stem` |
| 下生 | `stem_generates_branch` |
| 上剋 | `branch_controls_stem` |
| 下剋 | `stem_controls_branch` |
| 比和 | `same_element` |

| Area | Status |
| --- | --- |
| 六旬・空亡 | `source_confirmed_candidate` |
| 関係5分類 | `source_confirmed_candidate` |
| 六十干支各セル | `manual_transcription_review_required` |
| 四柱推命・算命学対応 | `shared_foundation` |
| 実装優先度 | `high_priority_candidate` |

六十干支内部関係master、旬・空亡との接続、共通基盤の候補とする。○・●および補足注記の意味は未確定であり、転記時に意味を付与しない。

## 15. Nine-Star Monthly Plates

対象年支グループ:

- 子・卯・午・酉年
- 丑・辰・未・戌年
- 寅・巳・申・亥年

年九星グループ:

- 一白・四緑・七赤
- 三碧・六白・九紫
- 二黒・五黄・八白

対象は3年グループ × 12月建、合計36月盤。

各盤の内容候補:

- 中宮九星
- 各宮の九星配置
- 天道
- 天徳
- 天徳合
- 月徳
- 月徳合
- 生気
- 三合
- 月破
- 暗剣殺
- 月空
- 定位対冲

| Area | Status |
| --- | --- |
| 36月盤中宮 | `source_confirmed_candidate` |
| 各宮配置 | `manual_transcription_review_required` |
| 方位神・吉凶マーカー | `manual_transcription_review_required` |
| 既存月盤・方位神master | `code_comparison_required` |
| 実装優先度 | `high_priority_candidate` |

`docs/direction-deities-roadmap.md` の方位神レイヤー方針に従い、マーカーを既存吉方判定の強い除外条件として自動採用しない。

## 16. Getsumei Star Table

入力:

- 本命星
- 生まれ月支、すなわち節月

本命星グループ:

- 一白・四緑・七赤
- 三碧・六白・九紫
- 二黒・五黄・八白

出力は月命星。表は3グループ × 12月支 = 36対応で、本命星9種類へ展開すると108入力となる。

| Area | Status |
| --- | --- |
| 36対応 | `source_confirmed_candidate` |
| 既存月命星計算 | `code_comparison_required` |
| 36件回帰テスト | `high_priority_candidate` |
| 節入り境界テスト | `high_priority_candidate` |
| 立春前後テスト | `high_priority_candidate` |

西暦月初ではなく節入り基準の可能性がある。立春付近では本命星年と月支が同時に変化する可能性を含め、同行者判定や吉方位判定まで利用先を追跡する。

## 17. Existing Code Comparison Targets

この章はStep 5B read-only調査の対象を固定する。Step 5Aでは一致・不一致・未存在を断定しない。

### P0

- 月命星36対応
- 本命星9種類への108入力展開
- 節入りによる月支判定
- 立春前後の本命星・月命星境界
- 九星月盤36中宮
- 月盤各宮配置
- 月破
- 暗剣殺
- 天道
- 天徳
- 月徳
- 月徳合
- 天徳合
- 三合
- 月空
- 定位対冲
- 天赦日
- 天転殺
- 地転殺
- 四廃日

### P1

- 魁罡
- 準魁罡
- 異常干支
- 空亡
- 六旬
- 六十干支
- 干支内部の相生・相剋
- 羊刃
- 飛刃
- 暗禄
- 金輿禄

### P2

- 小児殺
- 貴人神殺
- 特殊神殺
- 特殊日
- 身体・疾病対応

照合では、定義の有無だけでなく、入力、出力、正本位置、参照箇所、境界規則、表示利用、候補判定利用、テスト範囲を分けて記録する。

## 18. New Master Candidates

次は、既存コードにない可能性が高い候補として残す。ただし、Step 5B の read-only 検索が完了するまで「現在コードにない」と断定しない。

- 九星刻盤
- 刻盤の陽遁・陰遁
- 十二支刻
- 小児殺
- 貴人神殺
- 羊刃
- 飛刃
- 暗禄
- 金輿禄
- 禄馬同郷
- 金神
- 曲脚
- 平頭
- 日刃
- 懸針
- 退神
- 進神
- 淫欲殺
- 陰差陽錯殺
- 日貴
- 日徳
- 妨害日殺
- 十大悪敗之日
- 十干十二支の身体対応
- 六十干支内部関係の詳細表示

将来のマスター設計では、名称だけの配列にせず、入力基準、対象柱、出力種別、複数候補、適用体系、出典ページ、転記状態、コード照合状態、表示安全性を分離する。

## 19. Safety and Display Restrictions

### 直接採用しないもの

- 病気の診断
- 発症予測
- 癌、感染症、死亡、寿命の断定
- 子どもの事故や病気の断定
- 神殺単独による人格・人生の断定
- 古典的差別表現
- 現代医療の代替

これらは `not_adopted` とし、候補スコア、警告、通知、説明文を自動生成しない。

### 安全な表示候補

- 伝統的身体対応
- 体調観察候補
- 古典的補助指標
- 四柱推命・算命学の名称併記
- 参考表示
- 「医療診断ではない」旨の注記

安全な表示候補も実装決定ではない。表示文、対象年齢、強度、順位、免責注記は別途プロダクトレビューを行う。

## 20. Transcription TODO

- 小児殺19ページ、干支相生・相剋表23ページのページ表記を再確認する。
- その他10資料群の正確なページ番号を確認する。
- 十干・十二支の身体対応表をセル単位で再確認する。
- 古い病名、旧字体、判読困難語を原資料と照合し、現代語へ勝手に置換しない。
- 貴人神殺の天干・地支混在セルと複数候補を再確認する。
- 特殊神殺・特殊干支表の各セル、見出し、対象柱を再確認する。
- 特殊日・悪日系表を完全転記し、対象柱と意味を分ける。
- 羊刃等の左端欄の正式名称を確認する。
- 九星刻盤の全セル、陽遁・陰遁切替、出力の意味を確認する。
- 干支相生・相剋表の六十干支全セル、○・●、補足注記を確認する。
- 九星月盤36盤の各宮配置と全マーカーを再確認する。
- 月命星36対応をセル単位で再確認する。
- 画像・PDF・長い原文引用はGitへ追加しない。

## 21. Future Test Candidates

Step 5B の read-only 照合とソース再確認後、次のテスト候補を設計する。

| Priority | Candidate | Minimum coverage |
| --- | --- | --- |
| P0 | 月命星表 | 36対応と本命星9種類への108入力展開 |
| P0 | 月命星境界 | 12節入りの直前・直後、立春前後 |
| P0 | 九星月盤 | 36中宮、各宮配置、主要マーカー |
| P0 | 季節別4選日 | 4季節 × 天赦日・天転殺・地転殺・四廃日 |
| P0 | 節入り連携 | 季節、月建、月盤、月命星の境界整合 |
| P1 | 六十干支内部関係 | 60干支、6旬、空亡、関係5分類 |
| P1 | 羊刃等 | 10日干 × 各項目、複数候補支 |
| P1 | 特殊干支 | 成立対象柱を含む静的期待値 |
| P2 | 小児殺 | 2年支グループ × 12月建、中宮候補 |
| P2 | 貴人神殺 | 12生月支または10日干 × 各項目 |
| P2 | 安全表示 | 禁止断定語、医療注記、参考表示の回帰確認 |

既存343件の回帰テストは本工程で変更しない。期待値を資料確認なしで生成せず、既存ロジック自身から期待値を作らない。
