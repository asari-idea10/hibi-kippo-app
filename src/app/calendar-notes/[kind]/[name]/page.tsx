import { notFound } from "next/navigation";

import { SiteSectionNav } from "@/components/site-section-nav";
import {
  calendarNoteDefinitions,
  getCalendarNoteEntry,
  type CalendarNoteDefinition,
  type CalendarNoteMasterEntry,
} from "@/lib/calendar-notes";
import { getKanshiMasterEntries } from "@/lib/kanshi-master";
import {
  getKyuseiBasicSymbol,
  getKyuseiProfileSymbol,
} from "@/lib/kyusei-symbol-master";
import { getKuubouMasterEntry } from "@/lib/kuubou-master";
import { getNacchinMasterEntry } from "@/lib/nacchin-master";
import { getRokuyoEntry, type RokuyoMasterEntry } from "@/lib/rokuyo-master";
import { getSelectedDayAdoptionRows } from "@/lib/selected-day-adoption";
import { getDirectionDeityDictionaryEntry } from "@/lib/direction-deity-dictionary";
import { getSanmeigakuTermMasterEntry } from "@/lib/sanmeigaku-term-master";

type CalendarNoteTermPageProps = {
  params: Promise<{
    kind: string;
    name: string;
  }>;
};

type CalendarNoteTerm =
  | {
      kind: "junichoku" | "nijuhachishuku";
      kindLabel: string;
      name: string;
      reading: string;
      fortune: CalendarNoteMasterEntry["fortune"];
      summary: string;
      recommended: string[];
      caution: string[];
      sourceStatus: CalendarNoteMasterEntry["sourceStatus"];
      verificationStatus: CalendarNoteMasterEntry["verificationStatus"];
      note: string;
    }
  | {
      kind: "rokuyo";
      kindLabel: string;
      name: string;
      reading: string;
      fortune: RokuyoMasterEntry["fortune"];
      summary: string;
      recommended: string[];
      caution: string[];
      sourceStatus: RokuyoMasterEntry["sourceStatus"];
      verificationStatus: RokuyoMasterEntry["verificationStatus"];
      note: string;
    }
  | {
      kind: "kyusei";
      kindLabel: string;
      name: string;
      reading: string;
      fortune: "neutral";
      summary: string;
      recommended: string[];
      caution: string[];
      sourceStatus: string;
      verificationStatus: string;
      note: string;
    }
  | {
      kind: "nacchin" | "kuubou";
      kindLabel: string;
      name: string;
      reading: string;
      fortune: "neutral";
      summary: string;
      recommended: string[];
      caution: string[];
      sourceStatus: string;
      verificationStatus: string;
      note: string;
    }
  | {
      kind: "selected-days";
      kindLabel: string;
      name: string;
      reading: string;
      fortune: CalendarNoteDefinition["fortune"] | "unknown";
      summary: string;
      recommended: string[];
      caution: string[];
      sourceStatus: string;
      verificationStatus: string;
      note: string;
    }
  | {
      kind: "direction-deities";
      kindLabel: string;
      name: string;
      reading: string;
      fortune: "good" | "bad" | "mixed" | "neutral";
      summary: string;
      recommended: string[];
      caution: string[];
      sourceStatus: string;
      verificationStatus: string;
      note: string;
    }
  | {
      kind: "sanmeigaku";
      kindLabel: string;
      name: string;
      reading: string;
      fortune: "neutral";
      summary: string;
      recommended: string[];
      caution: string[];
      sourceStatus: string;
      verificationStatus: string;
      note: string;
    };

const calendarNoteKindLabels: Record<string, string> = {
  junichoku: "十二直",
  nijuhachishuku: "二十八宿",
  rokuyo: "六曜",
  kyusei: "九星",
  nacchin: "納音",
  kuubou: "空亡",
  "selected-days": "選日・暦注",
  "direction-deities": "方位神",
  sanmeigaku: "算命学",
};

const kyuseiNameToNumber = new Map(
  Array.from({ length: 9 }, (_, index) => {
    const starNumber = String(index + 1);
    const entry = getKyuseiBasicSymbol(starNumber);

    return [entry?.starName ?? starNumber, starNumber] as const;
  }),
);

function normalizeCalendarNoteTermName(value: string) {
  return decodeURIComponent(value)
    .replace(/^※/, "")
    .replace(/始まり$/, "")
    .replace(/終わり$/, "")
    .trim();
}

function getSelectedDayDefinition(name: string) {
  const normalized = normalizeCalendarNoteTermName(name);
  const definitions = Object.values(calendarNoteDefinitions);

  return (
    definitions.find((definition) => definition.name === normalized) ??
    definitions.find(
      (definition) =>
        normalized.includes(definition.name) ||
        definition.name.includes(normalized),
    ) ??
    null
  );
}

function getSelectedDayCandidate(name: string) {
  const normalized = normalizeCalendarNoteTermName(name);
  const rows = getSelectedDayAdoptionRows();

  return (
    rows.find((row) => row.name === normalized) ??
    rows.find(
      (row) =>
        normalized.includes(row.name) ||
        row.name.includes(normalized),
    ) ??
    null
  );
}

function getCalendarNoteTerm(kind: string, name: string): CalendarNoteTerm | null {
  const normalizedKind = decodeURIComponent(kind);
  const normalizedName = normalizeCalendarNoteTermName(name);

  if (normalizedKind === "sanmeigaku") {
    if (normalizedName === "陽占 人体星図") {
      return {
        kind: normalizedKind,
        kindLabel: calendarNoteKindLabels[normalizedKind],
        name: "陽占 人体星図",
        reading: "ようせん じんたいせいず",
        fortune: "neutral",
        summary:
          "日干を基準に十大主星と十二大従星を人体図へ配置し、社会面・内面・人生段階を読むための陽占表示です。",
        recommended: [
          "陰占の年柱・月柱・日柱から、どの干や支を使って星を出したか確認する。",
          "頭・左手・中心・右手・腹の十大主星で、対外面、家庭面、本質、社会面、目下面の読み口を分ける。",
          "初年運・中年運・老年運の十二大従星とエネルギー値を、人生段階の補助情報として見る。",
        ],
        caution: [
          "人体星図だけで断定せず、陰占、蔵干司令、十二大従星、位相法などと合わせて読む。",
          "流派差が出るため、蔵干の採用ルールと外部照合結果を分けて検証する。",
        ],
        sourceStatus:
          "参照マスタ: 算命計算 B538:V550 / 十大主星 A552:E562, A565:E615, A618:B654",
        verificationStatus: "sanmeigaku_yosen_v0_reference",
        note:
          "スプレッドシートの該当範囲を参照マスタとして、/sanmeigaku の陽占 人体星図 v0 に接続しています。",
      };
    }

    const sanmeigakuTerm = getSanmeigakuTermMasterEntry(normalizedName);

    if (!sanmeigakuTerm) {
      return null;
    }

    return {
      kind: normalizedKind,
      kindLabel: calendarNoteKindLabels[normalizedKind],
      name: sanmeigakuTerm.name,
      reading: sanmeigakuTerm.category,
      fortune: "neutral",
      summary: "この星の説明文は準備中です。",
      recommended: [
        "説明マスターの接続後に、正式な解説を表示します。",
      ],
      caution: [
        "星の意味本文は未確定です。推測による説明文は追加していません。",
      ],
      sourceStatus: sanmeigakuTerm.sourceStatus,
      verificationStatus: sanmeigakuTerm.verificationStatus,
      note: `${sanmeigakuTerm.category} / スプレッドシート上の説明マスター範囲確定後に本文を接続します。`,
    };
  }

  if (normalizedKind === "junichoku" || normalizedKind === "nijuhachishuku") {
    const entry = getCalendarNoteEntry(normalizedKind, normalizedName);

    if (!entry) {
      return null;
    }

    return {
      kind: normalizedKind,
      kindLabel: calendarNoteKindLabels[normalizedKind],
      name: entry.name,
      reading: entry.reading,
      fortune: entry.fortune,
      summary: entry.summary,
      recommended: entry.recommended,
      caution: entry.caution,
      sourceStatus: entry.sourceStatus,
      verificationStatus: entry.verificationStatus,
      note: "十二直・二十八宿マスターから表示しています。",
    };
  }

  if (normalizedKind === "rokuyo") {
    const entry = getRokuyoEntry(normalizedName);

    if (!entry) {
      return null;
    }

    return {
      kind: normalizedKind,
      kindLabel: calendarNoteKindLabels[normalizedKind],
      name: entry.name,
      reading: entry.reading,
      fortune: entry.fortune,
      summary: entry.summary,
      recommended: entry.recommended,
      caution: entry.caution,
      sourceStatus: entry.sourceStatus,
      verificationStatus: entry.verificationStatus,
      note: "旧暦・六曜マスターから表示しています。",
    };
  }

  if (normalizedKind === "kyusei") {
    const starNumber =
      kyuseiNameToNumber.get(normalizedName) ??
      normalizedName.match(/^[1-9]$/)?.[0] ??
      null;
    const basic = starNumber ? getKyuseiBasicSymbol(starNumber) : null;
    const profile = starNumber ? getKyuseiProfileSymbol(starNumber) : null;

    if (!basic || !profile) {
      return null;
    }

    return {
      kind: normalizedKind,
      kindLabel: calendarNoteKindLabels[normalizedKind],
      name: basic.starName,
      reading: `${basic.bagua} / ${basic.nature}`,
      fortune: "neutral",
      summary: profile.fortune,
      recommended: [
        `方位: ${basic.direction}`,
        `季節: ${basic.season} / 月: ${basic.month} / 時間: ${basic.hours}`,
        `象意: ${profile.meaning}`,
      ],
      caution: [profile.about],
      sourceStatus: "kyusei-symbol-master",
      verificationStatus: "pending_symbol_text_review",
      note: `九星象意マスター / starNumber: ${basic.starNumber}`,
    };
  }

  if (normalizedKind === "nacchin") {
    const nacchin = getNacchinMasterEntry(normalizedName);
    const entries = getKanshiMasterEntries().filter(
      (entry) => entry.nacchin === normalizedName || entry.nacchin === nacchin?.name,
    );

    if (entries.length === 0) {
      return null;
    }

    return {
      kind: normalizedKind,
      kindLabel: calendarNoteKindLabels[normalizedKind],
      name: nacchin?.name ?? normalizedName,
      reading: nacchin ? nacchin.reading : "六十干支の納音",
      fortune: "neutral",
      summary:
        nacchin?.image ??
        `${normalizedName}に属する干支は ${entries
          .map((entry) => `${entry.id} ${entry.kanshi}`)
          .join("、")} です。`,
      recommended: [
        ...(nacchin
          ? [
              `基本性格: ${nacchin.personality}`,
              `対人関係: ${nacchin.relationship}`,
              `恋愛関係: ${nacchin.love}`,
              `日々吉方での使い方: ${nacchin.usage}`,
            ]
          : []),
        `該当干支: ${entries
          .map((entry) => `${entry.id} ${entry.kanshi}`)
          .join("、")}`,
        ...entries.map(
          (entry) => `${entry.id} ${entry.kanshi}: ${entry.meaning} ${entry.note}`,
        ),
      ],
      caution: [
        ...(nacchin ? [nacchin.caution] : []),
        "納音は干支の性質を読む補助レイヤーです。日取りや方位の吉凶そのものとは分けて扱います。",
      ],
      sourceStatus: nacchin?.sourceStatus ?? "kanshi-master",
      verificationStatus:
        nacchin?.verificationStatus ?? "pending_nacchin_text_review",
      note: nacchin
        ? "納音シートの本文マスターと、六十干支・納音・空亡マスターを突き合わせて表示しています。"
        : "六十干支・納音・空亡マスターから逆引き表示しています。",
    };
  }

  if (normalizedKind === "kuubou") {
    const entries = getKanshiMasterEntries().filter(
      (entry) => entry.kuubou === normalizedName,
    );
    const kuubou = getKuubouMasterEntry(normalizedName);

    if (entries.length === 0) {
      return null;
    }

    return {
      kind: normalizedKind,
      kindLabel: calendarNoteKindLabels[normalizedKind],
      name: normalizedName,
      reading: kuubou
        ? `算命学では${kuubou.alternateName}`
        : "六十干支の空亡",
      fortune: "neutral",
      summary:
        kuubou?.summary ??
        `${normalizedName}空亡に属する干支は ${entries
          .map((entry) => `${entry.id} ${entry.kanshi}`)
          .join("、")} です。`,
      recommended: [
        ...(kuubou
          ? [
              `恵まれている: ${kuubou.blessed}`,
              `求めるもの: ${kuubou.seeks}`,
              `特徴: ${kuubou.feature}`,
            ]
          : []),
        `該当干支: ${entries
          .map((entry) => `${entry.id} ${entry.kanshi}`)
          .join("、")}`,
        ...entries.map(
          (entry) =>
            `${entry.id} ${entry.kanshi}: 納音 ${entry.nacchin} / ${entry.meaning}`,
        ),
      ],
      caution: [
        ...(kuubou ? [`欠けている: ${kuubou.missing}`] : []),
        "空亡は欠けやすい場所・時期を見る補助レイヤーです。命式、日付、方位神盤との重なりを今後精査します。",
      ],
      sourceStatus: kuubou?.sourceStatus ?? "kanshi-master",
      verificationStatus:
        kuubou?.verificationStatus ?? "pending_kuubou_text_review",
      note: "算命計算シートの空亡表と、六十干支・納音・空亡マスターを突き合わせて表示しています。",
    };
  }

  if (normalizedKind === "selected-days") {
    const definition = getSelectedDayDefinition(normalizedName);

    if (definition) {
      return {
        kind: normalizedKind,
        kindLabel: calendarNoteKindLabels[normalizedKind],
        name: definition.name,
        reading: "-",
        fortune: definition.fortune,
        summary: definition.displayText,
        recommended: [definition.aiExplanation],
        caution: [definition.cautionText],
        sourceStatus: definition.sourceStatus,
        verificationStatus: definition.verificationStatus,
        note: `実装済み選日マスター / code: ${definition.code}`,
      };
    }

    const candidate = getSelectedDayCandidate(normalizedName);

    if (!candidate) {
      return null;
    }

    return {
      kind: normalizedKind,
      kindLabel: calendarNoteKindLabels[normalizedKind],
      name: candidate.name,
      reading: "-",
      fortune: candidate.fortune,
      summary: candidate.note,
      recommended: [candidate.nextAction],
      caution: [],
      sourceStatus: candidate.statusLabel,
      verificationStatus: "pending_manual_almanac_check",
      note: `${candidate.categoryLabel} / ${candidate.source}`,
    };
  }

  if (normalizedKind === "direction-deities") {
    const entry = getDirectionDeityDictionaryEntry(normalizedName);

    if (!entry) {
      return null;
    }

    return {
      kind: normalizedKind,
      kindLabel: calendarNoteKindLabels[normalizedKind],
      name: entry.name,
      reading: entry.reading,
      fortune:
        entry.category === "吉神"
          ? "good"
          : entry.category === "凶神"
            ? "bad"
            : entry.category === "吉凶"
              ? "mixed"
              : "neutral",
      summary: entry.summary,
      recommended: entry.recommended,
      caution: entry.caution,
      sourceStatus: entry.sourceStatus,
      verificationStatus: entry.verificationStatus,
      note: entry.note,
    };
  }

  return null;
}

function getFortuneLabel(fortune: CalendarNoteTerm["fortune"]) {
  if (fortune === "good") {
    return "吉";
  }

  if (fortune === "bad") {
    return "凶";
  }

  if (fortune === "mixed") {
    return "注意混合";
  }

  if (fortune === "neutral") {
    return "平";
  }

  return "未分類";
}

export async function generateMetadata({ params }: CalendarNoteTermPageProps) {
  const { kind, name } = await params;
  const term = getCalendarNoteTerm(kind, name);

  return {
    title: term
      ? `${term.name} - ${term.kindLabel} | 日々吉方`
      : "暦注説明 | 日々吉方",
  };
}

export default async function CalendarNoteTermPage({
  params,
}: CalendarNoteTermPageProps) {
  const { kind, name } = await params;
  const term = getCalendarNoteTerm(kind, name);

  if (!term) {
    notFound();
  }

  return (
    <main className="shell calendarNoteTermShell">
      <section className="hero calendarNoteTermHero">
        <p className="eyebrow">Calendar Note Dictionary</p>
        <h1>{term.name}</h1>
        <p>
          {term.kindLabel}
          {term.reading !== "-" ? ` / ${term.reading}` : ""} の意味と、
          日々吉方での採用状態を確認します。
        </p>
        <SiteSectionNav active="calendar-notes" />
      </section>

      <section className="panel calendarNoteTermPanel">
        <div className="calendarNoteTermHeader">
          <span>{term.kindLabel}</span>
          <strong className={`calendarNoteTermFortune calendarNoteTermFortune-${term.fortune}`}>
            {getFortuneLabel(term.fortune)}
          </strong>
        </div>
        <h2>{term.summary}</h2>

        <div className="calendarNoteTermGrid">
          <div>
            <h3>向きやすい行動</h3>
            {term.recommended.length > 0 ? (
              <ul>
                {term.recommended.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : (
              <p>詳細行動は今後のマスター整備で追加します。</p>
            )}
          </div>
          <div>
            <h3>注意すること</h3>
            {term.caution.length > 0 ? (
              <ul>
                {term.caution.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : (
              <p>特記事項なし。ほかの暦注・方位条件と合わせて確認します。</p>
            )}
          </div>
        </div>

        <dl className="calendarNoteTermMeta">
          <div>
            <dt>マスター種別</dt>
            <dd>{term.kindLabel}</dd>
          </div>
          <div>
            <dt>採用状態</dt>
            <dd>{term.sourceStatus}</dd>
          </div>
          <div>
            <dt>検証状態</dt>
            <dd>{term.verificationStatus}</dd>
          </div>
          <div>
            <dt>メモ</dt>
            <dd>{term.note}</dd>
          </div>
        </dl>
      </section>
    </main>
  );
}
