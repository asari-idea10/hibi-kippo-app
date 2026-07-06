import Link from "next/link";

import { SiteSectionNav } from "@/components/site-section-nav";
import { calendarNoteMaster } from "@/lib/calendar-notes";
import { getKanshiMasterEntries } from "@/lib/kanshi-master";
import { getKuubouMasterEntries } from "@/lib/kuubou-master";
import { getKyuseiBasicSymbol } from "@/lib/kyusei-symbol-master";
import { getNacchinMasterEntry } from "@/lib/nacchin-master";
import { rokuyoMaster } from "@/lib/rokuyo-master";
import { getSelectedDayAdoptionRows } from "@/lib/selected-day-adoption";
import { getDirectionDeityDictionaryEntries } from "@/lib/direction-deity-dictionary";
import {
  termDictionarySeoStatuses,
  getTermDictionaryStatusRows,
  getTermDictionaryStatusSummary,
} from "@/lib/term-dictionary-status";

type DictionaryTermLink = {
  label: string;
  href?: string;
  meta?: string;
  status?: string;
};

type DictionaryCategory = {
  id: string;
  label: string;
  description: string;
  terms: DictionaryTermLink[];
};

function getCalendarNoteHref(kind: string, name: string) {
  return `/calendar-notes/${kind}/${encodeURIComponent(name)}`;
}

function uniqueValues(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function createDictionaryCategories(): DictionaryCategory[] {
  const kanshiEntries = getKanshiMasterEntries();
  const selectedDayRows = getSelectedDayAdoptionRows();
  const directionDeityEntries = getDirectionDeityDictionaryEntries();

  return [
    {
      id: "rokuyo",
      label: "六曜",
      description: "旧暦から導く日取りの空気。日常の予定感を軽く見る入口です。",
      terms: Object.values(rokuyoMaster).map((entry) => ({
        label: entry.name,
        href: getCalendarNoteHref("rokuyo", entry.name),
        meta: entry.reading,
        status: entry.fortune,
      })),
    },
    {
      id: "junichoku",
      label: "十二直",
      description: "建・除・満など、日ごとの行動適性を読む暦注です。",
      terms: Object.values(calendarNoteMaster.junichoku).map((entry) => ({
        label: entry.name,
        href: getCalendarNoteHref("junichoku", entry.name),
        meta: entry.reading,
        status: entry.fortune,
      })),
    },
    {
      id: "nijuhachishuku",
      label: "二十八宿",
      description: "宿ごとの得意・不得意を見て、日取りの質感を補強します。",
      terms: Object.values(calendarNoteMaster.nijuhachishuku).map((entry) => ({
        label: entry.name,
        href: getCalendarNoteHref("nijuhachishuku", entry.name),
        meta: entry.reading,
        status: entry.fortune,
      })),
    },
    {
      id: "selected-days",
      label: "選日・暦注",
      description:
        "天赦日、一粒万倍日、三隣亡など。吉凶判定ではなく、行動の意味づけとして使います。",
      terms: selectedDayRows.map((row) => ({
        label: row.name,
        href: getCalendarNoteHref("selected-days", row.name),
        meta: row.categoryLabel,
        status: row.seoArticleStatus,
      })),
    },
    {
      id: "kyusei",
      label: "九星",
      description: "一白水星から九紫火星まで。方位盤と象意の基本になる星です。",
      terms: Array.from({ length: 9 }, (_, index) => {
        const entry = getKyuseiBasicSymbol(String(index + 1));

        return {
          label: entry?.starName ?? `${index + 1}番`,
          href: entry ? getCalendarNoteHref("kyusei", entry.starName) : undefined,
          meta: entry ? `${entry.bagua} / ${entry.nature}` : undefined,
          status: "未着手",
        };
      }),
    },
    {
      id: "nacchin",
      label: "納音",
      description:
        "六十干支に添えられる音・質感。日柱や年柱のニュアンスを読む補助レイヤーです。",
      terms: uniqueValues(kanshiEntries.map((entry) => entry.nacchin)).map(
        (name) => {
          const nacchin = getNacchinMasterEntry(name);

          return {
            label: name,
            href: getCalendarNoteHref("nacchin", name),
            meta: nacchin?.reading ?? "六十干支",
            status: nacchin ? "本文接続済み" : "未着手",
          };
        },
      ),
    },
    {
      id: "kuubou",
      label: "空亡",
      description:
        "算命学では天中殺。欠けやすい場所・求めるものを読む補助レイヤーです。",
      terms: getKuubouMasterEntries().map((entry) => ({
        label: entry.name,
        href: getCalendarNoteHref("kuubou", entry.name),
        meta: entry.alternateName,
        status: "未着手",
      })),
    },
    {
      id: "direction-deities",
      label: "方位神",
      description:
        "年神・月天道・日神など、方位に重なる神の配置。方位神盤から参照する専門辞典です。",
      terms: directionDeityEntries.map((entry) => ({
        label: entry.name,
        href: getCalendarNoteHref("direction-deities", entry.name),
        meta: entry.category,
        status: entry.sourceStatus,
      })),
    },
    {
      id: "twenty-four-mountains",
      label: "24山",
      description:
        "八方位をさらに十干十二支へ分ける専門レイヤー。方位神盤の土台です。",
      terms: [
        "子",
        "癸",
        "丑",
        "艮",
        "寅",
        "甲",
        "卯",
        "乙",
        "辰",
        "巽",
        "巳",
        "丙",
        "午",
        "丁",
        "未",
        "坤",
        "申",
        "庚",
        "酉",
        "辛",
        "戌",
        "乾",
        "亥",
        "壬",
      ].map((label) => ({ label, meta: "24山", status: "未接続" })),
    },
    {
      id: "zassetsu",
      label: "雑節",
      description:
        "土用、彼岸、節分など、季節の変わり目を読む暦の層です。",
      terms: [
        { label: "土用入り", href: getCalendarNoteHref("selected-days", "土用入り"), meta: "雑節", status: "未着手" },
        { label: "節分", href: getCalendarNoteHref("selected-days", "節分"), meta: "雑節", status: "未着手" },
        { label: "彼岸", href: getCalendarNoteHref("selected-days", "彼岸"), meta: "雑節", status: "未着手" },
        { label: "入梅", href: getCalendarNoteHref("selected-days", "入梅"), meta: "雑節", status: "未着手" },
        { label: "半夏生", href: getCalendarNoteHref("selected-days", "半夏生"), meta: "雑節", status: "未着手" },
      ],
    },
  ];
}

function getStatusLabel(status?: string) {
  if (!status) return null;
  if (status === "good") return "吉";
  if (status === "bad") return "注意";
  if (status === "mixed") return "混合";
  if (status === "neutral") return "平";
  return status;
}

export const metadata = {
  title: "暦と方位の用語辞典 | 日々吉方",
};

export default function CalendarNotesIndexPage() {
  const categories = createDictionaryCategories();
  const statusRows = getTermDictionaryStatusRows();
  const summary = getTermDictionaryStatusSummary();

  return (
    <main className="shell calendarNoteTermShell calendarNotesIndexShell">
      <section className="hero calendarNoteTermHero calendarNotesIndexHero">
        <p className="eyebrow">Calendar Note Dictionary</p>
        <h1>暦と方位の用語辞典</h1>
        <p>
          九星方位カレンダーに出てくる六曜、十二直、二十八宿、選日、九星、納音、空亡などを、
          カテゴリ別に確認するための索引です。用語の理解とマスター検証を兼ねています。
        </p>
        <SiteSectionNav active="calendar-notes" />
      </section>

      <section className="panel calendarNotesIndexOverview">
        <div>
          <span>カテゴリ</span>
          <strong>{summary.total}件</strong>
        </div>
        <div>
          <span>辞典リンク接続</span>
          <strong>{summary.connected}件</strong>
        </div>
        <div>
          <span>盤上表示</span>
          <strong>{summary.visible}件</strong>
        </div>
        <div>
          <span>SEO記事</span>
          <strong>{summary.seoNotStarted}件 未着手</strong>
        </div>
      </section>

      <section className="panel calendarNotesSeoPanel">
        <span>SEO記事化ステータス</span>
        <div className="termSeoStatusStrip" aria-label="SEO記事化ステータス">
          {termDictionarySeoStatuses.map((status) => (
            <span key={status}>
              {status}
              <strong>{summary.seoByStatus[status]}件</strong>
            </span>
          ))}
        </div>
      </section>

      <section className="calendarNotesCategoryGrid" aria-label="用語カテゴリ">
        {categories.map((category) => {
          const statusRow = statusRows.find((row) => row.id === category.id);

          return (
            <article className="panel calendarNotesCategoryCard" key={category.id}>
              <div className="calendarNotesCategoryHeader">
                <span>{category.label}</span>
                <small>{statusRow?.seoArticleStatus ?? "未着手"}</small>
              </div>
              <p>{category.description}</p>
              {statusRow ? (
                <dl>
                  <div>
                    <dt>接続</dt>
                    <dd>{statusRow.calendarLinkStatus}</dd>
                  </div>
                  <div>
                    <dt>次</dt>
                    <dd>{statusRow.nextAction}</dd>
                  </div>
                </dl>
              ) : null}
              <div className="calendarNotesTermList">
                {category.terms.map((term) => {
                  const status = getStatusLabel(term.status);

                  return term.href ? (
                    <Link href={term.href} key={`${category.id}-${term.label}`}>
                      <strong>{term.label}</strong>
                      {term.meta ? <small>{term.meta}</small> : null}
                      {status ? <em>{status}</em> : null}
                    </Link>
                  ) : (
                    <span key={`${category.id}-${term.label}`}>
                      <strong>{term.label}</strong>
                      {term.meta ? <small>{term.meta}</small> : null}
                      {status ? <em>{status}</em> : null}
                    </span>
                  );
                })}
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}
