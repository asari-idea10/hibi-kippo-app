export type AdoptionTone = "ok" | "warn" | "muted";

export type AdoptionStatusInfo = {
  status: string;
  label: string;
  sourceName: string;
  sourceType:
    | "spreadsheet"
    | "manual_almanac"
    | "external_reference"
    | "calculation_site"
    | "official"
    | "generated"
    | "fallback";
  reliability: string;
  tone: AdoptionTone;
  note: string;
  nextAction: string;
};

export type AdoptionSourceCatalogEntry = {
  id: string;
  name: string;
  role: string;
  url: string | null;
  priority: string;
  note: string;
};

const statusMap: Record<string, AdoptionStatusInfo> = {
  verified: {
    status: "verified",
    label: "公式・検証済み",
    sourceName: "公式データまたは検証済みマスター",
    sourceType: "official",
    reliability: "本採用",
    tone: "ok",
    note: "本体表示に使える正本扱い。",
    nextAction: "定期的な更新確認のみ行う。",
  },
  verified_external_reference: {
    status: "verified_external_reference",
    label: "外部正本一致",
    sourceName: "国立天文台 / keisan.site / 万年暦",
    sourceType: "official",
    reliability: "検証済み",
    tone: "ok",
    note: "外部正本サンプルと日付・時刻が一致した値。",
    nextAction: "対象年を増やして検証範囲を広げる。",
  },
  verified_external_date_reference: {
    status: "verified_external_date_reference",
    label: "外部正本日付一致",
    sourceName: "keisan.site / 万年暦",
    sourceType: "calculation_site",
    reliability: "日付検証済み",
    tone: "ok",
    note: "外部正本サンプルと日付が一致した値。時刻は別途検証対象。",
    nextAction: "国立天文台または万年暦で時刻まで照合する。",
  },
  date_verified: {
    status: "date_verified",
    label: "日付検証済み",
    sourceName: "keisan.site / 万年暦",
    sourceType: "calculation_site",
    reliability: "日付検証済み",
    tone: "ok",
    note: "外部正本サンプルと日付が一致した値。時刻は別途検証対象。",
    nextAction: "時刻付き正本サンプルを追加する。",
  },
  verified_master: {
    status: "verified_master",
    label: "検証済みマスター",
    sourceName: "二十四節気マスター",
    sourceType: "official",
    reliability: "本採用",
    tone: "ok",
    note: "Swiss Ephemeris生成値を万年暦・暦要項で検算したマスター。",
    nextAction: "2100年拡張時に同じ検証を行う。",
  },
  full_range_v0: {
    status: "full_range_v0",
    label: "全期間スプシ取込 v0",
    sourceName: "フォーチューンマイレージマスタ",
    sourceType: "spreadsheet",
    reliability: "仮本採用",
    tone: "ok",
    note: "1900〜2050年を取り込み済み。ユーザー作成スプシを暦DBの基礎として採用。",
    nextAction: "外部正本との抜き打ち検証を継続する。",
  },
  rule_generated_from_sheet_v0: {
    status: "rule_generated_from_sheet_v0",
    label: "スプシ規則生成 v0",
    sourceName: "風水計算シート",
    sourceType: "spreadsheet",
    reliability: "v0検証中",
    tone: "warn",
    note: "スプレッドシートの表を固定データではなく、同じ規則で生成する仮採用マスター。",
    nextAction: "スプシ出力と抜き打ち照合し、個人条件列との接続方針を固める。",
  },
  legacy_spreadsheet: {
    status: "legacy_spreadsheet",
    label: "スプシ由来",
    sourceName: "フォーチューンマイレージマスタ",
    sourceType: "spreadsheet",
    reliability: "要検証",
    tone: "warn",
    note: "スプレッドシートで構築した既存ロジック・手入力値。",
    nextAction: "こよみのページ、万年暦、計算サイトで差分確認する。",
  },
  external_reference_checked: {
    status: "external_reference_checked",
    label: "外部正本確認済み",
    sourceName: "こよみのページ / 万年暦",
    sourceType: "external_reference",
    reliability: "本採用候補",
    tone: "ok",
    note: "外部正本サンプルと照合済み。暦注の日次表示では優先採用する。",
    nextAction: "差分が出た日だけ計算式側を調整する。",
  },
  external_reference: {
    status: "external_reference",
    label: "外部正本",
    sourceName: "こよみのページ",
    sourceType: "external_reference",
    reliability: "本採用候補",
    tone: "ok",
    note: "こよみのページCSV由来の正本サンプル。",
    nextAction: "アプリ側表示との差分を確認する。",
  },
  golden_reference: {
    status: "golden_reference",
    label: "検証正本",
    sourceName: "こよみのページ",
    sourceType: "external_reference",
    reliability: "本採用候補",
    tone: "ok",
    note: "外部正本として取り込んだ日次サンプル。",
    nextAction: "同一日付ではこの値を優先する。",
  },
  sample: {
    status: "sample",
    label: "サンプル",
    sourceName: "検証用サンプル",
    sourceType: "fallback",
    reliability: "検証用",
    tone: "muted",
    note: "小範囲検証用。正式な全期間マスターではない。",
    nextAction: "全期間マスターへ接続する。",
  },
  hybrid_v0: {
    status: "hybrid_v0",
    label: "ハイブリッド v0",
    sourceName: "スプシ + 計算 + 外部正本",
    sourceType: "generated",
    reliability: "仮本採用",
    tone: "ok",
    note: "外部正本がある日は正本優先、ない日は計算・スプシで補完。",
    nextAction: "差分レポートで未解決日を潰す。",
  },
  rule_checked_v0: {
    status: "rule_checked_v0",
    label: "ルール検証 v0",
    sourceName: "計算候補",
    sourceType: "generated",
    reliability: "仮採用",
    tone: "warn",
    note: "計算ルールで発生判定済み。流派差や境界条件は追加検証する。",
    nextAction: "外部正本サンプルとの一致率を確認する。",
  },
  calculated_v0: {
    status: "calculated_v0",
    label: "計算 v0",
    sourceName: "日々吉方エンジン",
    sourceType: "generated",
    reliability: "仮採用",
    tone: "warn",
    note: "ロジックで算出した値。検証済みではない。",
    nextAction: "万年暦または計算サイトでサンプリング検証する。",
  },
  koyomi_reference_priority_v0: {
    status: "koyomi_reference_priority_v0",
    label: "こよみ優先 v0",
    sourceName: "こよみのページ 土用と間日",
    sourceType: "external_reference",
    reliability: "本採用候補",
    tone: "ok",
    note:
      "土用入りを太陽黄経297/27/117/207度の通過日として扱う、こよみのページ準拠の方針。1900〜2050年は静的マスター化済み。",
    nextAction:
      "手元の万年暦で、土用入り・土用明け・間日を年代別にサンプリング検証する。",
  },
  external_culture_reference_v0: {
    status: "external_culture_reference_v0",
    label: "外部文化参照 v0",
    sourceName: "雑学ネタ帳",
    sourceType: "external_reference",
    reliability: "表示候補",
    tone: "ok",
    note:
      "今日は何の日の文化・雑学レイヤー。占術正本ではなく、日次コンテンツの補助情報として扱う。",
    nextAction: "日付ごとの採用範囲と表示数を決め、必要なら月別に拡張する。",
  },
  calculated: {
    status: "calculated",
    label: "計算済み",
    sourceName: "生成マスター",
    sourceType: "generated",
    reliability: "仮採用",
    tone: "warn",
    note: "計算で生成済み。外部正本とのサンプリング検証を継続する。",
    nextAction: "万年暦や外部正本で年代別に照合する。",
  },
  rule_v0: {
    status: "rule_v0",
    label: "ルール v0",
    sourceName: "日々吉方エンジン",
    sourceType: "generated",
    reliability: "検証待ち",
    tone: "warn",
    note: "参照資料をもとにルール化した初期版。",
    nextAction: "万年暦・外部資料でサンプリング検証する。",
  },
  policy_v0: {
    status: "policy_v0",
    label: "判定方針 v0",
    sourceName: "日々吉方方針",
    sourceType: "generated",
    reliability: "方針仮採用",
    tone: "warn",
    note: "複数要素が重なったときの優先順位を定義した初期版。",
    nextAction: "実例検証と流派差整理を続ける。",
  },
  method_selectable_v0: {
    status: "method_selectable_v0",
    label: "方式選択 v0",
    sourceName: "複数方式比較",
    sourceType: "generated",
    reliability: "検証待ち",
    tone: "warn",
    note: "複数の計算方式を比較し、採用方式を後から切り替えられる状態。",
    nextAction: "採用方式を決めるための差分検証を進める。",
  },
  v0_mixed: {
    status: "v0_mixed",
    label: "v0混合",
    sourceName: "計算 + 外部検証候補",
    sourceType: "generated",
    reliability: "検証待ち",
    tone: "warn",
    note: "計算済み項目と補間/検証待ち項目が混在している。",
    nextAction: "項目ごとにverifiedへ昇格する。",
  },
  zassetsu_v0_8: {
    status: "zassetsu_v0_8",
    label: "雑節 v0.8",
    sourceName: "二十四節気 / Swiss Ephemeris生成 / keisan.site / 国立天文台 / 万年暦 / AJNET",
    sourceType: "generated",
    reliability: "本体表示可・一部検証継続",
    tone: "ok",
    note:
      "主要な雑節は接続済み。万年暦チェック候補はAJNET日記の暦で目視一致確認済み。入梅・半夏生は直接計算へ移行し、1950〜2050年は日付検証済み。",
    nextAction:
      "時刻差分と、追加年代の万年暦サンプリングを確認する。",
  },
  research_v0: {
    status: "research_v0",
    label: "研究 v0",
    sourceName: "未確定の研究項目",
    sourceType: "fallback",
    reliability: "研究段階",
    tone: "muted",
    note: "本体採用前に参照体系と検証方針を決める必要がある。",
    nextAction: "採用可否を検討する。",
  },
  planned_later: {
    status: "planned_later",
    label: "後回し",
    sourceName: "将来候補",
    sourceType: "fallback",
    reliability: "未着手",
    tone: "muted",
    note: "初期MVPには入れず、コストや複雑さを見て後で検討する。",
    nextAction: "本体が安定してから再検討する。",
  },
  interpolated_v0: {
    status: "interpolated_v0",
    label: "補間 v0",
    sourceName: "日々吉方エンジン",
    sourceType: "generated",
    reliability: "検証待ち",
    tone: "warn",
    note: "前後の境界時刻から補間した値。正式な天文計算値ではない。",
    nextAction: "Swiss Ephemeris、keisan.site、万年暦で正式値へ置き換える。",
  },
  ephemeris_candidate_v0: {
    status: "ephemeris_candidate_v0",
    label: "天文計算候補",
    sourceName: "Swiss Ephemeris生成値",
    sourceType: "generated",
    reliability: "外部照合待ち",
    tone: "warn",
    note: "太陽黄経の通過時刻を直接計算した値。外部正本との照合後に正式採用する。",
    nextAction: "keisan.siteまたは手元万年暦で日付・時刻を照合する。",
  },
  needs_exact_ephemeris_check: {
    status: "needs_exact_ephemeris_check",
    label: "天文計算待ち",
    sourceName: "Swiss Ephemeris / keisan.site",
    sourceType: "calculation_site",
    reliability: "検証待ち",
    tone: "warn",
    note: "太陽黄経など、時刻精度が必要な項目。",
    nextAction: "通過時刻を直接計算して照合する。",
  },
  needs_external_source_check: {
    status: "needs_external_source_check",
    label: "外部照合待ち",
    sourceName: "keisan.site / 手元万年暦",
    sourceType: "calculation_site",
    reliability: "検証待ち",
    tone: "warn",
    note: "計算値はあるが、採用前に外部正本との突き合わせが必要。",
    nextAction: "同一年の入梅・半夏生を外部サイトまたは万年暦で確認する。",
  },
  needs_manual_almanac_check: {
    status: "needs_manual_almanac_check",
    label: "万年暦確認待ち",
    sourceName: "手元万年暦",
    sourceType: "manual_almanac",
    reliability: "検証待ち",
    tone: "warn",
    note: "手元の万年暦で目視確認する対象。",
    nextAction: "ピックアップ年で日付・時刻を照合する。",
  },
  fallback_legacy: {
    status: "fallback_legacy",
    label: "旧形式フォールバック",
    sourceName: "旧スプシ出力",
    sourceType: "fallback",
    reliability: "要注意",
    tone: "warn",
    note: "正式マスターが未接続のときだけ使う退避値。",
    nextAction: "正式マスターへ置き換える。",
  },
  not_applicable: {
    status: "not_applicable",
    label: "該当なし",
    sourceName: "-",
    sourceType: "fallback",
    reliability: "対象外",
    tone: "muted",
    note: "その日・その項目には該当しない。",
    nextAction: "対応不要。",
  },
  not_connected: {
    status: "not_connected",
    label: "未接続",
    sourceName: "-",
    sourceType: "fallback",
    reliability: "未整備",
    tone: "warn",
    note: "まだ本体データに接続していない。",
    nextAction: "マスターまたは計算処理を接続する。",
  },
};

export function getAdoptionStatusInfo(status: string): AdoptionStatusInfo {
  return (
    statusMap[status] ?? {
      status,
      label: status,
      sourceName: "未分類",
      sourceType: "fallback",
      reliability: "未分類",
      tone: "muted",
      note: "採用ステータス辞書に未登録。",
      nextAction: "必要なら辞書へ追加する。",
    }
  );
}

export function getAdoptionSourceCatalog(): AdoptionSourceCatalogEntry[] {
  return [
    {
      id: "asarisan_spreadsheet",
      name: "フォーチューンマイレージマスタ",
      role: "基礎DB・既存計算ロジック",
      url: null,
      priority: "一次ソース",
      note:
        "ユーザーが構築した年月日・九星・暦注・算命学系の巨大マスター。まずここを取り込み、外部正本で検証する。",
    },
    {
      id: "manual_almanac",
      name: "手元の万年暦",
      role: "目視検証・時刻確認",
      url: null,
      priority: "検証正本",
      note:
        "明治期を含む古い年や節入り時刻、雑節などのサンプリング検証に使う。",
    },
    {
      id: "naoj",
      name: "国立天文台 暦計算室",
      role: "二十四節気・雑節時刻の公的検証",
      url: "https://eco.mtk.nao.ac.jp/koyomi/",
      priority: "公的検証元",
      note:
        "節入り時刻、二十四節気、入梅・半夏生など天文系暦日の時刻照合に使う。",
    },
    {
      id: "koyomi_page",
      name: "こよみのページ",
      role: "日次暦注・元号変換の外部正本候補",
      url: "https://koyomi8.com/sub/rekicyuu.html",
      priority: "検証正本",
      note:
        "十二直・二十八宿・二十七宿・主要選日のCSV正本として取り込み済み。元号年・西暦年変換の照合にも使う。",
    },
    {
      id: "koyomi_page_doyo",
      name: "こよみのページ 土用と間日",
      role: "土用・間日・丑の日の外部正本候補",
      url: "https://koyomi8.com/sub/doyou.html",
      priority: "検証正本",
      note:
        "土用入りを太陽黄経297/27/117/207度で扱う計算方針。スプシより優先する。",
    },
    {
      id: "koyomi_page_gengou",
      name: "こよみのページ 元号年・西暦年変換",
      role: "元号変換の照合候補",
      url: "https://koyomi8.com/sub/tool/gengoucalc.html",
      priority: "検証候補",
      note:
        "西暦年と元号年の対応、改元年の複数候補表示の検証に使う。",
    },
    {
      id: "rekichu_dot_com",
      name: "暦注.com",
      role: "十二直・二十八宿・暦注下段の目視照合候補",
      url: "https://rekichu.com/",
      priority: "検証候補",
      note:
        "日別に十二直・二十八宿・二十七宿・七十二候・暦注下段・選日・月齢などを確認できる参照サイト。手元万年暦で確認しづらい項目の目視チェックに使う。",
    },
    {
      id: "keisan_site",
      name: "高精度計算サイト",
      role: "雑節・天文系の検証候補",
      url: "https://keisan.site/",
      priority: "検証候補",
      note:
        "入梅・半夏生など、太陽黄経が絡む雑節の照合候補。必要に応じて個別ページを参照する。",
    },
    {
      id: "ajnet_diary",
      name: "AJNET 日記の暦",
      role: "万年暦チェック候補の目視照合",
      url: "https://www.ajnet.ne.jp/diary_f/",
      priority: "検証候補",
      note:
        "日付指定で暦情報を確認できる参照サイト。万年暦チェック候補の目視確認で一致済み。",
    },
    {
      id: "zatsuneta_today",
      name: "雑学ネタ帳 今日は何の日",
      role: "記念日・出来事の文化コンテンツ候補",
      url: "https://zatsuneta.com/category/anniversary.html",
      priority: "文化参照",
      note:
        "毎日アクセスする理由を作る補助情報。占術正本とは分けて、文化・雑学レイヤーとして扱う。",
    },
    {
      id: "san_gen_nine_un",
      name: "三元九運体系",
      role: "マクロ時代運の参照体系",
      url: null,
      priority: "研究・検証候補",
      note:
        "180年周期・20年単位で時代背景を読むための参照体系。個人命式と重ねる前のマクロ文脈として扱う。",
    },
  ];
}
