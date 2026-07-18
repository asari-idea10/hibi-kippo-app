# 全占技インベントリ

更新日: 2026-07-18
状態: `documentation_only` / `first_pass_inventory`

## 1. 目的

この台帳は、hibi-kippo-appが使用・表示・計算している占技、暦情報、人物判定、candidate・ranking・warning policyを、入力、暦境界、根拠、計算、中間値、application policyまで追跡するための一次棚卸しである。

`existing_implementation`は占術上の根拠ではない。現在挙動のimplementation binding、根拠との比較対象、回帰テスト対象としてのみ記録する。

## 2. 一次棚卸し件数

一次棚卸しは194 trace unitsである。

| category | units | scope |
| --- | ---: | --- |
| `astronomical_calendar` | 16 | 干支、旧暦、六曜、節気、雑節、祝日等 |
| `calendar_boundary` | 9 | 立春、節入り、日界、時刻支、土用境界、JST等 |
| `nine_star_calculation` | 15 | 本命星、月命星、年・月・日・時盤、中宮、飛泊 |
| `directional_taboo` | 12 | 五黄殺、暗剣殺、歳破・月破・日破、命殺系 |
| `auspicious_deity` | 22 | 天道、天徳、歳徳神、太歳神、方位神等 |
| `calendar_auspicious_day` | 81 | 十二直12、二十八宿28、実装選日20、候補21 |
| `person_compatibility` | 7 | 本人、家族星、同行者、相性関係 |
| `candidate_policy` | 8 | purpose、candidateCondition、actionScale、除外 |
| `ranking_policy` | 6 | 候補rank、score、暦注加減点、実用性 |
| `sanmeigaku_other` | 18 | 陰占、蔵干、十大主星、十二大従星、人体星図等 |
| **合計** | **194** | 一次棚卸し。正式registryへの登録完了件数ではない |

件数は、個別に根拠・境界・出力・作用を追跡すべき単位で数えている。十二直や二十八宿は各項目を1 unitとする一方、同一占技に複数のコード経路がある場合は、正式登録時に占技を重複作成せず`implementationBindings`へ束ねる。

例:

- 天道の単一方位経路と三合天道経路は、同一と推測して統合せず、関係未確定の別conceptまたは別rule bindingとして保持する。
- 月盤中宮、月盤九星配置、月盤UI、月盤回帰fixtureは、月盤という占技の別implementation bindingである。
- 天一天上の方位神説明と選日表示は、同一conceptへの複数application bindingとして関係を明示する。

## 3. 登録単位

| field | purpose |
| --- | --- |
| `techniqueId` | 永続的な機械ID |
| `label` / `aliases` | 日本語名、表記ゆれ、コード名 |
| `domain` | 占技分類 |
| `conceptId` | 同名別概念を区別するID |
| `implementationBindings` | ファイル、関数、master列、API、UI、test |
| `sourceClaimIds` | 原典・資料上のclaim |
| `projectClaimIds` | PO採用仕様、application policy |
| `boundaryRuleIds` | 使用する暦境界 |
| `ruleIds` | 計算式、対応表、変換 |
| `applicationPolicyIds` | candidate、rank、warning、UIへの作用 |
| `verification` | source、calculation、implementation等の独立status |
| `prohibitedInferences` | AI・実装者が行ってはいけない補完 |

## 4. 分類別インベントリ

### 4.1 astronomical_calendar / calendar_boundary

主なtrace units:

- グレゴリオ暦日、曜日、JST日付
- 年柱、月柱、日柱、六十干支cycle
- 二十四節気、節入り、直前節入り、節入りからの日数
- 旧暦年月日、閏月、月大小、六曜
- 国民の祝日、日本の元号
- 土用、間日、土用入り・明け
- 節分、彼岸、八十八夜、二百十日、二百二十日、入梅、半夏生
- 立春年界、節入り月界、日界、時刻支境界、timezone

主要binding:

- `src/lib/calendar-master-rows.ts`
- `src/lib/calendar-day.ts`
- `src/lib/solar-terms.ts`
- `src/lib/lunar-calendar.ts`
- `src/lib/doyo.ts`
- `src/lib/zassetsu.ts`
- `src/lib/national-holidays.ts`
- `src/lib/japanese-era.ts`

### 4.2 nine_star_calculation / directional_taboo

主なtrace units:

- 本命星、月命星
- 年盤・月盤・日盤・時盤の中宮星と九星配置
- 洛書配置、飛泊、陰遁・陽遁
- 五黄殺、暗剣殺、歳破、月破、日破
- 本命殺、本命的殺、月命殺、月命的殺
- 土用殺、小児殺

主要binding:

- `src/lib/calendar-db-view.ts`
- `src/lib/hour-board.ts`
- `src/lib/child-satsu.ts`
- `src/lib/direction-mountains.ts`
- `src/lib/monthly-plate-regression.test.ts`
- `src/lib/getsumei-regression.test.ts`

月盤Level 1候補は、年支3グループ、中宮36対応、九星配置324/324、九星一意性36/36、五黄殺、暗剣殺36/36、月破36/36である。これは回帰保護の根拠であり、細字markerを含む324区画全体のproduction master昇格を意味しない。

### 4.3 direction / auspicious_deity

主なtrace units:

- 8方位、24山、角度境界、対宮、支の冲
- 歳徳神、太歳神、歳破神、大将軍、太陰神、歳刑神、歳殺神、黄幡神、豹尾神、金神
- 天道、天徳、月徳、天徳合、月徳合、月空、生気、定位対冲、三合
- 天一神、天一天上、月金神、日金神、日遊神、大将軍遊行
- 現在地・目的地の方位角と24山判定はplannedであり、現行productionには存在しない

主要binding:

- `src/lib/direction-deities.ts`
- `src/lib/good-fortune-directions.ts`
- `src/lib/good-fortune-direction-policy.ts`
- `src/lib/direction-mountains.ts`
- `src/lib/direction-meaning-master.ts`
- `src/lib/feng-shui-virtue-master.ts`

### 4.4 calendar_auspicious_day

- 十二直12項目
- 二十八宿28項目
- 実装選日20項目
- 未実装候補21項目

主要binding:

- `src/lib/calendar-notes.ts`
- `src/lib/calendar-note-rules.ts`
- `src/lib/selected-day-candidates.ts`
- `src/lib/selected-day-adoption.ts`
- `src/lib/calendar-note-occurrences.ts`

選日名、発生規則、吉凶説明、weight、candidate接続は別claim・別policyとして扱う。名称確認だけで発生規則やrank作用を確認済みにしない。

### 4.5 person_compatibility / candidate_policy / ranking_policy

主なtrace units:

- 本人、家族星、同行者
- `strict` / `standard` / `loose`
- 九星相性、相生、比和、相克
- `purpose`、`candidateCondition`、`actionScale`
- 三盤・四盤の一致、方位block、warning
- 候補rank、暦注加減点、土日祝の実用加点

主要binding:

- `src/app/purpose-calendar/page.tsx`
- `src/lib/personal-star-compatibility-master.ts`
- `src/lib/direction-palace-blend-master.ts`
- `src/lib/best-day-score.ts`
- `src/lib/action-purpose-master.ts`

古典規則とアプリ独自policyが混在しているため、application policyはsource ruleから分離する。

### 4.6 sanmeigaku_other

主なtrace units:

- 年柱・月柱・日柱、将来の時柱
- 蔵干・司令、陰占
- 十大主星、十二大従星、energy、人体星図
- 納音、空亡、天中殺候補
- 位相法、三業干支、異常干支
- 大運・年運・月運・日運
- 四季法・生き方分類

主要binding:

- `src/lib/sanmeigaku-profile.ts`
- `src/lib/sanmeigaku-yosen-master.ts`
- `src/lib/zokan-master.ts`
- `src/lib/sanmeigaku-master-inventory.ts`
- `src/lib/kanshi-master.ts`
- `src/lib/nacchin-master.ts`
- `src/lib/kuubou-master.ts`

時柱、出生地補正、真太陽時、大運は未実装・source review requiredであり、既存三柱から推測生成しない。

## 5. 統合禁止のconcept mismatch

1. 方位神の生気 vs palace blendの生気
2. 一般月空 vs 固定プロフィール文字列
3. 原資料三合marker vs 現行三合4局・三合天道
4. 月徳日 vs 月徳方位
5. 天徳合・月徳合の命理神殺 vs 月盤方位神
6. 十二直の破 vs 歳破・月破・日破
7. 天道単一方位 vs 三合天道
8. 定位対冲 vs 暗剣殺・十二支冲・対宮map

C寅の月徳合は、古典期待値「月徳合=辛=西」と、POが確認した萬年暦盤面の`月合`表示なしが一致しない。`conflict`として保持し、productionへ西を補完しない。

## 6. 次の登録順序

1. source・claim・verification statusの語彙
2. technique IDと分類規則
3. boundary schema
4. calculation step / trace schema
5. 月盤Level 1を完全サンプルとして登録
6. 本命星・月命星・年盤・月盤・日盤
7. 方位角・8方位・24山
8. 方位神・暦神
9. 暦注・選日
10. 同行者・candidate・ranking・warning
11. 算命学core
12. UI/API接続判断

月盤専用schemaは作らない。月盤Level 1を、全占技共通schemaの最初の完全サンプルとして使用する。
