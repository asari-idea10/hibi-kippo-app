export type CommonCalendarCompletionStatus =
  | "implemented"
  | "v0_verifying"
  | "not_implemented"
  | "later";

export type CommonCalendarCompletionItem = {
  id: string;
  category:
    | "base_calendar"
    | "calendar_notes"
    | "culture"
    | "direction"
    | "macro"
    | "personal_next"
    | "source_registry"
    | "ai_prompt"
    | "advanced_later";
  name: string;
  status: CommonCalendarCompletionStatus;
  adoptionStatus: string;
  scope: string;
  source: string;
  nextAction: string;
  note: string;
  progressDetails?: readonly string[];
};

const items: CommonCalendarCompletionItem[] = [
  {
    id: "calendar_master",
    category: "base_calendar",
    name: "年月日マスター",
    status: "implemented",
    adoptionStatus: "full_range_v0",
    scope: "1900〜2050年 / 年月日干支・九星・方位殺など",
    source: "フォーチューンマイレージマスタ",
    nextAction: "外部正本との抜き打ち検証を継続する",
    note: "共通暦DBの土台。年別JSON分割済み。",
  },
  {
    id: "weekday",
    category: "base_calendar",
    name: "曜日",
    status: "implemented",
    adoptionStatus: "verified",
    scope: "全収録日",
    source: "Date UTC計算",
    nextAction: "追加対応なし",
    note: "暦表示と検証画面の基本項目。",
  },
  {
    id: "japanese_era",
    category: "base_calendar",
    name: "元号年・西暦年変換",
    status: "implemented",
    adoptionStatus: "verified",
    scope: "近現代 / 明治・大正・昭和・平成・令和",
    source: "近現代元号開始日 + 目視境界チェック",
    nextAction: "追加対応なし。将来、古い元号まで広げる場合だけ別途検討する",
    note: "開発者画面の検証補助。改元年は複数元号候補を表示し、日付では改元日を境界に判定する。改元境界は目視確認済みのため本採用。",
  },
  {
    id: "national_holiday",
    category: "base_calendar",
    name: "国民の祝日",
    status: "implemented",
    adoptionStatus: "verified",
    scope: "内閣府CSV公開範囲",
    source: "内閣府 国民の祝日CSV",
    nextAction: "公式CSV更新時に差し替える",
    note: "未来年は公式公開範囲のみ正本扱い。",
  },
  {
    id: "solar_terms",
    category: "base_calendar",
    name: "二十四節気・節入り時刻",
    status: "implemented",
    adoptionStatus: "verified_master",
    scope: "1900〜2050年",
    source: "Swiss Ephemeris生成 + 万年暦/国立天文台系チェック",
    nextAction: "2100年拡張時に同じ検証を行う",
    note: "節入り日数、月切替、土用、蔵干計算の起点。",
  },
  {
    id: "lunar_rokuyo",
    category: "base_calendar",
    name: "旧暦・六曜",
    status: "implemented",
    adoptionStatus: "verified",
    scope: "1900〜2050年",
    source: "生成旧暦マスター + 手元万年暦照合",
    nextAction: "追加対応なし。2100年拡張時に同じ検証を行う",
    note: "日次表示・暦注・年中行事の基礎。万年暦との目視照合済みのため本採用。",
  },
  {
    id: "kanshi_nacchin_master",
    category: "base_calendar",
    name: "六十干支・納音・空亡・特殊星",
    status: "implemented",
    adoptionStatus: "verified",
    scope: "六十干支 / 年月日柱から参照",
    source: "kanshi_master.json / 手元マスター",
    nextAction: "個人命式フェーズで年柱・月柱・日柱・時柱へ正式接続する",
    note:
      "納音、空亡、魁罡、準魁罡、異常干支を参照する基礎マスター。共通暦では年月日の納音名称、検証画面では日柱の詳細を表示する。",
  },
  {
    id: "moon_age",
    category: "base_calendar",
    name: "月齢",
    status: "not_implemented",
    adoptionStatus: "not_connected",
    scope: "日次の月齢表示 / 朔望月ベース",
    source: "旧暦・朔データ + 天文計算候補",
    nextAction: "表示精度、丸め方、参照元を決める",
    note:
      "旧暦・六曜と相性がよい追加表示。暦サマリーに月齢を出せると、日々の暦としての完成度が上がる。",
  },
  {
    id: "mannenreki_source_manifest",
    category: "source_registry",
    name: "撮影萬年暦 source manifest",
    status: "not_implemented",
    adoptionStatus: "not_connected",
    scope:
      "撮影画像のファイル名・頁・テーマ・SHA-256・source ID・転記先・実装接続先",
    source: "PO撮影画像 / HMA-P24-IMG-20260715",
    nextAction:
      "撮影済み画像のファイル名、頁、テーマ、SHA-256、source ID、転記先、実装接続先を結ぶmanifestを作成する。",
    note:
      "撮影画像はリポジトリ外に存在し、p.24のみ正式source ID付与済み。manifest作成は画像をGitへ追加することを意味しない。",
    progressDetails: [
      "photographed: available_outside_repository",
      "p.24 source ID: HMA-P24-IMG-20260715",
      "full-page manifest: not_implemented",
      "image Git addition: prohibited",
    ],
  },
  {
    id: "junichoku",
    category: "calendar_notes",
    name: "十二直",
    status: "implemented",
    adoptionStatus: "verified",
    scope: "1900〜2050年",
    source: "こよみのページ / 暦注.com / スプシ / 補完計算",
    nextAction: "節入り境界など差分が出た日だけ記録を継続する",
    note: "外部正本と補完ロジックの運用方針を確認済み。日次表示の正式採用項目。",
  },
  {
    id: "nijuhachishuku",
    category: "calendar_notes",
    name: "二十八宿",
    status: "implemented",
    adoptionStatus: "verified",
    scope: "1900〜2050年",
    source: "こよみのページ / 暦注.com / スプシ / 補完計算 / 50件検証CSV",
    nextAction: "氏/氐など表記ゆれ正規化を維持する",
    note: "50件検証で周期ロジックを確認済み。参考CSV側のアンカーずれを切り分け、日次表示の正式採用項目とする。",
  },
  {
    id: "nanajushichishuku",
    category: "calendar_notes",
    name: "二十七宿",
    status: "implemented",
    adoptionStatus: "verified",
    scope: "1900〜2050年",
    source: "こよみのページCSV / 暦注.com",
    nextAction: "旧暦連動の説明を維持し、差分が出た日だけ個別記録する",
    note: "こよみのページCSV由来の正式フィールド。日次表示の正式採用項目。",
  },
  {
    id: "selected_days",
    category: "calendar_notes",
    name: "主要選日",
    status: "implemented",
    adoptionStatus: "hybrid_v0",
    scope: "1900〜2050年",
    source: "こよみのページ / スプシ / 定義マスター / 採用管理リスト",
    nextAction: "未実装候補を、参照元確認後に定義マスターへ順次昇格する",
    note: "正式リストと未実装候補を採用管理表で分離。大明日、神吉日、不成就日、八専、十方暮などを接続済み。",
  },
  {
    id: "rekichu_gedan_tensha_and_satsu",
    category: "calendar_notes",
    name: "暦注下段: 天赦日・天轉殺・地轉殺・四癈日",
    status: "v0_verifying",
    adoptionStatus: "rule_v0",
    scope: "春2〜4月 / 夏5〜7月 / 秋8〜10月 / 冬11〜1月の季節別日干支",
    source: "手元の万年暦 + 国立国会図書館 日本の暦 + 外部資料",
    nextAction: "手元万年暦の表を暦注下段マスターv0として検証し、既存の天赦日と重複統合する",
    note:
      "天赦日は吉、天轉殺・地轉殺・四癈日は凶寄りの下段項目として扱う候補。該当日は主要選日へ統合する。",
  },
  {
    id: "zassetsu",
    category: "calendar_notes",
    name: "雑節",
    status: "implemented",
    adoptionStatus: "zassetsu_v0_8",
    scope: "1900〜2050年 / 主要雑節 + 入梅・半夏生の太陽黄経直接計算",
    source: "二十四節気 / Swiss Ephemeris生成 / keisan.site / 国立天文台 / 万年暦 / AJNET",
    nextAction:
      "残る時刻差分と年代別サンプリングを継続する",
    note:
      "節分・彼岸・八十八夜・二百十日・二百二十日は接続済み。万年暦チェック候補はAJNET日記の暦で目視一致確認済み。入梅・半夏生は1950〜2050年の日付検証済み、2009〜2027年は時刻検証中。",
  },
  {
    id: "doyo",
    category: "calendar_notes",
    name: "土用・間日・土用殺",
    status: "implemented",
    adoptionStatus: "koyomi_reference_priority_v0",
    scope: "1900〜2050年 / 太陽黄経297・27・117・207度起点",
    source: "こよみのページ公開JS計算由来の静的マスター",
    nextAction: "手元の万年暦で土用入り・土用明け・間日を年代別サンプリング検証する",
    note:
      "土用殺方位と間日まで表示済み。補間v0は151年で4件の1日差が出たため、1900〜2050年はこよみのページ準拠の静的マスターを優先する。",
  },
  {
    id: "today_anniversaries",
    category: "culture",
    name: "今日は何の日",
    status: "v0_verifying",
    adoptionStatus: "external_culture_reference_v0",
    scope: "日付固定の記念日・出来事 / v0は5月26日サンプル",
    source: "雑学ネタ帳",
    nextAction: "表示数、採用範囲、月別拡張方法を決める",
    note:
      "占術正本ではなく、毎日アクセスする理由を作る文化・雑学レイヤーとして扱う。",
  },
  {
    id: "direction_warnings",
    category: "direction",
    name: "方位殺",
    status: "implemented",
    adoptionStatus: "full_range_v0",
    scope: "年盤/月盤/日盤の暗剣殺・五黄殺・破",
    source: "フォーチューンマイレージマスタ",
    nextAction: "外部正本や手元万年暦で抜き打ち検証を続ける",
    note: "吉神競合判定の土台。",
  },
  {
    id: "monthly_plate_level1",
    category: "direction",
    name: "月盤Level 1",
    status: "implemented",
    adoptionStatus: "provenance_complete_not_connected",
    scope:
      "3年支group / 36中宮 / 九星配置324宮 / 五黄殺・暗剣殺・月破36盤 / provenance・fixture・trace",
    source:
      "HMA-P24-IMG-20260715 / 月盤研究台帳 / D-0020 / PO原資料確認",
    nextAction:
      "Level 1はclosure済みとして維持し、Level 2の細字方位神とexact timestamp production対応を別工程で進める。",
    note:
      "定義したLevel 1範囲は完了。provenance registryはproduction UI・候補判定へ意図的に接続していない。",
    progressDetails: [
      "design: completed",
      "provenance registry: completed",
      "regression fixture: completed",
      "calculation trace: completed",
      "production connection: intentionally_not_connected",
      "source orientation: registered_partially_confirmed",
      "Level 2 marker research: ongoing",
      "exact timestamp production: not_implemented",
      "verification: 36 centers / 324 palace stars / 36 Gohosatsu / 36 Ankensatsu / 36 month breakers",
      "registry: 8 TechniqueDefinitions / effect-free workflow / dual-lane trace / 1,812 boundary observations / 24 provenance tests",
    ],
  },
  {
    id: "monthly_plate_level2",
    category: "direction",
    name: "月盤Level 2・細字方位神",
    status: "v0_verifying",
    adoptionStatus: "research_ongoing",
    scope:
      "天道・天徳・月徳・天徳合・月徳合・月空・生気・定位対冲・三合・raw marker・296細字区画・24山細位置",
    source: "改訂版 平成・萬年暦 p.24 / 月盤研究台帳",
    nextAction:
      "確認済みPilotを増やし、撮影萬年暦manifestから月盤Level 2の照合範囲を段階的に拡張する。",
    note:
      "寅月Pilotの天合・冲を原典確認用として月盤カードへ表示済み。全月で基本盤の照合状態と追加markerの確認状態を表示する。Level 1の未完了理由ではない継続研究として、C寅月徳合、原資料三合markerとの概念差、orientation 5/9、296細字区画の証拠レベルを保持する。",
    progressDetails: [
      "status: research_ongoing",
      "production connection: not_connected",
      "C寅月徳合: unresolved source discrepancy",
      "原資料三合marker vs 現行三合4局・三合天道: concept_mismatch",
      "source orientation independent verification: 5/9",
      "296 fine-marker cells: transcribed, promotion pending",
      "24-mountain fine positions: unreadable",
      "UI: all months show source-review coverage; Tiger pilots show 天合・冲 evidence details",
    ],
  },
  {
    id: "yakumoin_benchmark",
    category: "direction",
    name: "八雲院ベンチマーク",
    status: "v0_verifying",
    adoptionStatus: "research_v0",
    scope: "九星方位・個人プロフィール・会員導線・日次方位表示",
    source: "八雲院 / 目視比較 / 日々吉方方針",
    nextAction:
      "コピーではなく、表示項目・精度検証・ユーザー導線の採用候補を分解して管理する",
    note:
      "九星気学一本の完成度が高い外部サービス。日々吉方では暦DB、行動提案、AIプロンプト提供まで広げるため、機能採用の比較基準として扱う。",
  },
  {
    id: "good_fortune_directions",
    category: "direction",
    name: "年神・表示済み方位神",
    status: "v0_verifying",
    adoptionStatus: "rule_v0",
    scope:
      "歳徳神・太歳神・歳破神・八将神・金神・現行天道・現行三合局 / purpose-calendar表示済み",
    source: "外部資料をもとにルール化",
    nextAction:
      "表示済み年神・天道・三合局の原資料照合を継続し、月盤Level 2の細字方位神とは別項目で管理する。",
    note:
      "24山リングとpurpose-calendarへ表示済み。月徳方位・月空方位神・生気方位神・原資料三合markerはこの項目へ統合しない。",
  },
  {
    id: "good_fortune_policy",
    category: "direction",
    name: "吉神×凶殺 競合判定",
    status: "v0_verifying",
    adoptionStatus: "policy_v0",
    scope: "吉神・方位殺・土用殺の重なり",
    source: "日々吉方方針",
    nextAction: "天道の例外扱いを流派別に整理する",
    note: "凶殺優先、天道は別枠表示として実装済み。",
  },
  {
    id: "child_satsu",
    category: "direction",
    name: "小児殺",
    status: "v0_verifying",
    adoptionStatus: "rule_v0",
    scope: "年支グループ + 月盤九星",
    source: "外部資料をもとにルール化",
    nextAction: "年支・月盤ごとの方位を万年暦で検証する",
    note: "12歳以下を主対象。18歳以下説は注記。",
  },
  {
    id: "san_gen_nine_un",
    category: "macro",
    name: "三元九運",
    status: "v0_verifying",
    adoptionStatus: "rule_v0",
    scope: "180年周期 / 20年単位",
    source: "風水・玄空系の三元九運体系",
    nextAction: "各運の解釈キーワードを独自方針に合わせて調整する",
    note: "共通暦ではなく、鑑定JSONのマクロ時代運として使用。",
  },
  {
    id: "hour_board",
    category: "advanced_later",
    name: "時盤・刻の九星と干支",
    status: "v0_verifying",
    adoptionStatus: "rule_generated_from_sheet_v0",
    scope:
      "2時間区切り / 子刻〜亥刻 / 時盤九星 / 五黄殺・暗剣殺・破 / 日付詳細表示",
    source: "風水計算 > 時盤 A:V",
    nextAction:
      "時盤表示は接続済み。時刻指定検索、出発時刻の自動提案、個人条件を含む四盤候補の精度検証を継続する。",
    note:
      "共通時盤はpurpose-calendarに表示済み。production表示済みと、正式採用・精密提案は別状態として管理する。個人条件列 W:BH は後段扱い。",
  },
  {
    id: "western_astrology_events",
    category: "advanced_later",
    name: "水星逆行・日食・月食",
    status: "later",
    adoptionStatus: "planned_later",
    scope: "水星逆行期間 / 日食・月食日 / 天文イベント",
    source: "Swiss Ephemeris生成候補",
    nextAction: "本体組み込みではなく生成・検証用スクリプトから静的マスター化する方針を検討する",
    note:
      "東洋占術の本筋とは分けつつ、万物共通の宇宙カレンダーとして優しい注意喚起や日々の文言に使える候補。",
  },
  {
    id: "shichijuniko",
    category: "culture",
    name: "七十二候",
    status: "not_implemented",
    adoptionStatus: "planned_v0",
    scope: "約5日ごとの季節表現 / 72候",
    source: "国立天文台・暦便覧・外部正本候補",
    nextAction: "二十四節気マスターとの接続方法、日付境界、表示文の表記方針を決める",
    note:
      "毎日の挨拶、季節の格調、占い色を薄めた入口として有効。暦サマリーや今日は何の日と相性がよい。",
  },
  {
    id: "zokan",
    category: "personal_next",
    name: "蔵干",
    status: "v0_verifying",
    adoptionStatus: "method_selectable_v0",
    scope: "月支 + 節入り日数 / スプシ方式比較",
    source: "スプシ方式 + 月律分野v0",
    nextAction: "採用方式を確定し、命式JSONへ接続する",
    note: "共通暦から個人命式へ入る直前の重要項目。",
  },
  {
    id: "personal_birth_chart",
    category: "personal_next",
    name: "個人命式",
    status: "not_implemented",
    adoptionStatus: "not_connected",
    scope: "生年月日・出生時刻・出生地",
    source: "共通暦 + 真太陽時補正",
    nextAction: "命式JSON仕様を固める",
    note: "年柱・月柱・日柱・時柱、本命星、月命星、空亡、納音など。",
  },
  {
    id: "personal_directions",
    category: "personal_next",
    name: "個人別方位",
    status: "v0_verifying",
    adoptionStatus: "personal_direction_visible_v0",
    scope: "本命殺・的殺・最大吉方候補・吉方候補・比和・相剋注意 / 年盤・月盤・日盤",
    source:
      "個人命式 + 風水計算シート B1:I10 / C12:M24 / A29:F37 + 方位参考シート",
    nextAction:
      "既存表示を維持したまま、月命殺・月命的殺の正式規則、同行者mode、候補rankへの影響を別工程で確認する。",
    note:
      "最大吉方候補・吉方候補・比和・相剋注意、本命殺・本命的殺、本人・同行者判定はpurpose-calendarに表示済み。未接続なのは月命系個人殺と新provenance registryからのproduction binding。",
  },
  {
    id: "personal_star_provenance",
    category: "personal_next",
    name: "本命星・月命星 provenance",
    status: "v0_verifying",
    adoptionStatus: "provenance_limited_not_connected",
    scope:
      "本命星READY / 月命星READY_WITH_LIMITATIONS / role binding / source・project・lineage分離 / boundary trace",
    source: "D-0021 / personal-stars provenance registry / specialist source ledgers",
    nextAction:
      "exact timestamp、自然時補正、海外出生、月命系個人殺、傾斜production変更はHOLDのまま、source reviewを継続する。",
    note:
      "24/24検証済みの静的provenance。READY_WITH_LIMITATIONSはproduction-readyを意味せず、candidate・ranking・warning・UIへ接続していない。",
    progressDetails: [
      "honmei: READY",
      "getsumei: READY_WITH_LIMITATIONS",
      "provenance tests: 24/24",
      "production connection: not_connected",
      "candidate connection: not_connected",
      "ranking connection: not_connected",
      "warning connection: not_connected",
      "monthly plate center vs getsumei: same value / distinct role",
      "birthTime unknown: no fallback",
      "JST vs natural time: conflict retained",
      "HOLD: exact timestamp production / natural time / overseas birth / DST / longitude / true solar time / equation of time / getsumei-satsu / getsumei-tekisatsu / keisha production change",
    ],
  },
  {
    id: "keisha_profile",
    category: "personal_next",
    name: "傾斜・傾斜方位神",
    status: "v0_verifying",
    adoptionStatus: "rule_generated_from_sheet_v0",
    scope: "本命星×月命星×性別 / 傾斜星・良い面・注意面・方位神",
    source: "風水計算シート A1175:E1267 / 八雲院表示項目",
    nextAction:
      "傾斜方位神の全件マスター化と、個人プロフィールカードの説明文を精査する",
    note:
      "八雲院のユーザー情報で確認した不足項目。傾斜星は接続済み、傾斜方位神はサンプル・ルール整理中。",
  },
  {
    id: "direction_palace_blend_reference",
    category: "direction",
    name: "方位×回座星 象意マスター",
    status: "v0_verifying",
    adoptionStatus: "research_v0",
    scope: "八方位×九星 / 象意・方徳・凶作用・行動タグ",
    source: "風水マスタ A:M / O:Y / AG:AM + 日々吉方編集方針",
    nextAction:
      "原典寄りの象意と、現代の行動翻訳を分けて整備する",
    note:
      "カレンダー上では短く、数字クリック先の方位ブレンドページでは省略せず参照できるようにする。評価ではなく方徳・作用の説明として扱う。",
  },
  {
    id: "ai_action_prompt_service",
    category: "ai_prompt",
    name: "AI向け占い・行動プロンプト",
    status: "not_implemented",
    adoptionStatus: "not_connected",
    scope: "Gemini / GPTs / Deep Research / ユーザー持ち込みAI向け",
    source: "共通暦DB + 方位マスター + 個人命式 + 行動目的マスター",
    nextAction:
      "日付・目的・方位・個人星を入力にしたプロンプトJSON仕様を作る",
    note:
      "ユーザー自身がAIを使う前提で、日々吉方の暦データと戦略をプロンプトとして渡すサービス柱。鑑定文を固定出力するだけでなく、利用者のAIに渡せる構造化コンテキストを提供する。",
  },
  {
    id: "ai_prompt_template_library",
    category: "ai_prompt",
    name: "用途別プロンプトテンプレート集",
    status: "not_implemented",
    adoptionStatus: "research_v0",
    scope: "旅行・契約・開業・結婚・日常の整え・神社参拝",
    source: "目的マスター + 暦注・雑節 + 九星方位カレンダー",
    nextAction:
      "まずは5分類の目的別に、AIへ渡す質問文・禁止事項・出力形式を定義する",
    note:
      "『いつ/どこへ/何をしに行くか』をユーザーのAIに相談できるようにする。暦注はフィルターではなく意味づけ、方位は行動候補として渡す。",
  },
  {
    id: "birth_checklist",
    category: "personal_next",
    name: "生年月日×傾向チェックUX",
    status: "not_implemented",
    adoptionStatus: "not_connected",
    scope: "命式タイプ別ラジオボタン・チェックリスト・現状ギャップ診断",
    source: "命式JSON + 質問マスター + 回答スコア",
    nextAction: "命式要素ごとの質問カテゴリ、回答選択肢、補正文言の対応表を作る",
    note:
      "生年月日の鑑定結果を一方的に出すのではなく、本人の実感を回答で受け取り、本来の性質と現在地のズレを見せるユーザー体験。",
  },
  {
    id: "celebrity_birth_match",
    category: "personal_next",
    name: "著名人命式マッチング",
    status: "not_implemented",
    adoptionStatus: "research_v0",
    scope: "Wikipedia等の公開生年月日 / 干支・九星・納音・空亡などの一致/近似検索",
    source: "ユーザー作成スプシは実験参考。正式DBは別途構築する",
    nextAction:
      "一致判定に使う命式要素、近似スコア、公開情報の出典管理ルールを決める",
    note:
      "芸能人・有名人・著名人と星の形が近い人を検証・出力する機能。既存スプシはGLIDE用実験データとして参照のみ行い、本採用DBにはしない。",
  },
  {
    id: "qimen",
    category: "advanced_later",
    name: "奇門遁甲",
    status: "later",
    adoptionStatus: "research_v0",
    scope: "十干・八門・九星・八神・時盤",
    source: "未選定",
    nextAction: "採用流派と参照元を決める",
    note: "有料版・上級戦術候補。無料UIにはすぐ混ぜない。",
  },
  {
    id: "maps_tracking",
    category: "advanced_later",
    name: "Google Maps連携",
    status: "later",
    adoptionStatus: "planned_later",
    scope: "距離・滞在時間・開運行動ログ",
    source: "Google Maps Platform候補",
    nextAction: "コストとプライバシー方針を整理してから検討する",
    note: "初期MVPでは入れない。",
  },
  {
    id: "calendar_range_2100",
    category: "advanced_later",
    name: "共通暦データ 2100年拡張",
    status: "later",
    adoptionStatus: "planned_later",
    scope: "1900〜2050年から2100年まで拡張",
    source: "現行生成スクリプト + 外部正本サンプリング",
    nextAction: "共通暦データの完成後に、2051〜2100年の生成・検証計画を作る",
    note:
      "現段階では1900〜2050年を優先。完成後に西暦2100年まで引っ張るロードマップ項目として保持する。",
  },
];

const statusLabels: Record<CommonCalendarCompletionStatus, string> = {
  implemented: "実装済み",
  v0_verifying: "v0検証中",
  not_implemented: "未実装",
  later: "後回し",
};

const categoryLabels: Record<CommonCalendarCompletionItem["category"], string> = {
  base_calendar: "基礎暦",
  calendar_notes: "暦注・雑節",
  culture: "文化・雑学",
  direction: "方位",
  macro: "マクロ時代運",
  personal_next: "個人命式フェーズ",
  source_registry: "出典・資料台帳",
  ai_prompt: "AIプロンプト提供",
  advanced_later: "上級/後回し",
};

export function getCommonCalendarCompletionItems() {
  return items.map((item) => ({
    ...item,
    statusLabel: statusLabels[item.status],
    categoryLabel: categoryLabels[item.category],
  }));
}

export function getCommonCalendarCompletionSummary() {
  return {
    total: items.length,
    implemented: items.filter((item) => item.status === "implemented").length,
    v0Verifying: items.filter((item) => item.status === "v0_verifying").length,
    notImplemented: items.filter((item) => item.status === "not_implemented")
      .length,
    later: items.filter((item) => item.status === "later").length,
  };
}
