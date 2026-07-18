# 全占技implementation gap監査

更新日: 2026-07-18
状態: `documentation_only` / `first_pass_audit`
Decision: D-0020

## 1. 監査境界

現行コードの存在を占術上の正しさとして承認しない。production挙動、docs上の仕様、source確認、PO採用方針の差を記録する。

## 2. 比較的追跡しやすい領域

| item | calculation | source/evidence | remaining gap |
| --- | --- | --- | --- |
| 二十四節気・節入り | 黄経通過master参照 | engine・時刻・検証情報あり | 外部正本との継続照合 |
| 旧暦・六曜 | generated master | 手動照合statusあり | generator version追跡の統一 |
| 月盤Level 1 | 3 group、中宮、9宮配置 | 36/36、324/324回帰保護 | 細字markerと時刻境界は別 |
| 五黄殺・暗剣殺・月破 | 月盤fixture比較 | 36/36一致 | 原規則claimの登録 |
| 雑節の一部 | 黄経・日数計算 | reference sampleあり | 日付丸め・時刻差 |
| 十大主星 | 天干pair lookup | 100/100回帰保護 | 古典・流派source claim |
| 十二大従星 | 日干×支energy lookup | 120/120回帰保護 | 古典・流派source claim |

## 3. master依存でruleが追跡できない領域

- 共通暦DBの年柱・月柱・日柱
- 年・月・日九星の中宮値
- 年・月・日の五黄殺、暗剣殺、破
- legacy暦注、二十七宿
- 出生行の年九星を本命星として使用する処理
- 一部方位神対応表
- 九星象意・方位象意・actionScale象意
- 算命学の説明文、energy強弱区分

これらはmaster列または静的tableを読めるが、source claim、boundary rule、table versionが一続きになっていない。

## 4. 現行実装とdocsの差

| item | docs / PO direction | existing implementation | audit status |
| --- | --- | --- | --- |
| omitted `purpose` | 将来`yuki_tori` | `travel` | `implementation_pending` |
| `candidateCondition` | `actionScale`から独立 | actionScaleから自動決定 | `mismatch` |
| candidate rank | 占術rankと実用rankを分離予定 | 一つのscoreへ合算 | `provisional_existing_policy` |
| companion mode | provisional / source review required | production接続済み | source未確認のproduction policy |
| 方位神 adoption | source・実装状態を分離すべき | 「正式採用」と`partial_rule_v0`が混在 | status設計不足 |
| 算命学inventory | 一部抽出中表記 | 十大主星・十二大従星が実装・test済み | docs freshness gap |
| 本命星 | 正式仕様未確認 | 出生行の年九星を採用 | `source_review_required` |
| 天赦日単独候補 | 正式仕様未確認 | 方位候補なしでも候補化 | `source_review_required` |

今回これらのproduction挙動は変更しない。

## 5. 現行score

```text
applicationPolicyStatus: provisional_existing_policy
productionConnection: connected
sourceVerification: unresolved
projectAdoption: provisional
```

主なbinding:

- `src/app/purpose-calendar/page.tsx`
  - 三盤一致等のrank base score
  - 暦注、盤重なり、土日祝の加減点
  - 天赦日の別格候補
- `src/lib/best-day-score.ts`
  - 基礎点
  - 五黄殺、暗剣殺、破の減点
  - 暦注weight

制限:

- productionで現在使用中
- 古典根拠とは限らない
- 正式採点仕様ではない
- 今回削除・変更しない
- 将来、占術rankと実用rankを分離する
- scoreの存在だけでsource ruleを確定しない

## 6. concept mismatch

| source concept | existing concept | status |
| --- | --- | --- |
| 方位神の生気 | palace blend生気 | `concept_mismatch` |
| 一般月空 | 固定プロフィール文字列 | `concept_mismatch` |
| 原資料三合marker | 現行三合4局・三合天道 | `concept_mismatch` |
| 月徳日 | 月徳方位 | `concept_mismatch` |
| 天徳合・月徳合の命理神殺 | 月盤方位神 | `concept_mismatch` |
| 十二直の破 | 歳破・月破・日破 | `concept_mismatch` |
| 天道単一方位 | 三合天道 | 関係未確定・統合禁止 |
| 定位対冲 | 暗剣殺・十二支冲・対宮map | `concept_mismatch` |

## 7. 未解決conflict

### C寅月徳合

- POが原資料現物を確認し、C寅盤内に`月合`表示なし。
- 古典期待値は「月徳合=辛=西」。
- 転記漏れではなく資料間不一致。
- 古典側・萬年暦側のどちらが誤りか未確定。
- productionへ月徳合=西を補完しない。
- `sourceVerification: conflict`、`projectAdoption: research_only`を維持する。

## 8. 境界gap

| boundary | current state | gap |
| --- | --- | --- |
| 立春年界 | master値を利用 | 本命星・年盤の時刻単位rule追跡不足 |
| 節入り月界 | master・setsuiri context | 月命星・月盤の時刻単位切替未固定 |
| 日界 | date単位中心 | 0:00、23:00、子初の採用差未整理 |
| 時刻支 | 時盤は23:00から子 | 日柱切替との関係未確定 |
| timezone | 主にJST | 海外出生、DST、現地時刻未設計 |
| 真太陽時 | 未実装 | 経度補正、均時差、出生地未設計 |
| 土用 | 日単位表示と時刻master | 入り・明け時刻の丸め規則不足 |
| 選日月区分 | 一部Gregorian month lookup | 暦月・節月のsource確認が必要 |
| 24山境界 | 中心±7.5度 | 境界包含と採用source不足 |
| 地理方位 | 未実装 | 測地線、方位角、距離、地点入力未設計 |

`compassOrientation`は表示回転であり、地理方位計算ではない。`actionScale`の距離表現も現在は説明・policyで、出発地と目的地から距離を計算していない。

## 9. application connection監査

各占技について次を独立記録する。

- productionで値を生成しているか
- UIへ表示しているか
- candidate filterへ接続しているか
- rankingへ接続しているか
- warningへ接続しているか
- companion判定へ接続しているか
- URL/API契約へ現れるか

原典ruleが確認されても、これらへ自動接続しない。反対にproduction接続済みでも、source確認済みとはしない。

## 10. 実装優先順位

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

## 11. 必要な将来test

| type | purpose |
| --- | --- |
| source rule test | source claimとrule表現の一致 |
| lookup table test | table完全性・重複・欠落 |
| boundary test | 立春、節入り、日界、土用等の前後 |
| derivation test | 中間値を含む段階別検証 |
| master consistency test | master内不変条件 |
| regression fixture | 現行挙動の意図しない変化検知 |
| cross-layer test | source→rule→implementation→application |
| application-policy test | candidate、rank、warningの独立検証 |
| URL compatibility test | 保存済みURLの互換 |
| conflict preservation test | 未解決値が補完・上書きされないこと |

## 12. 今回の非変更範囲

- production logic
- production master / generated data
- tests
- API / URL / query
- UI
- candidate / ranking / warning
- Google Sheet
- Vercel設定

Vercel Previewは不要である。理由は`docs-only architecture and research audit`で、production・UI変更がないため。
