"use client";

import { useState } from "react";

type CalendarDbSearchFormProps = {
  query: {
    year: string;
    start: string;
    end: string;
    birthDate: string;
    keyword: string;
    limit: number;
    view: string;
    dayType: string;
    kyuseiMatch: string;
    purpose: string;
    candidate: string;
    goodDirectionMatch: string;
  };
  limitOptions: number[];
  viewOptions: Array<{
    id: string;
    label: string;
  }>;
  dayTypeOptions: Array<{
    id: string;
    label: string;
  }>;
  kyuseiMatchOptions: Array<{
    id: string;
    label: string;
  }>;
  purposeOptions: Array<{
    id: string;
    label: string;
  }>;
  candidateOptions: Array<{
    id: string;
    label: string;
  }>;
  goodDirectionMatchOptions: Array<{
    id: string;
    label: string;
  }>;
};

const startYear = 1900;
const endYear = 2050;

const baseYearOptions = Array.from(
  { length: endYear - startYear + 1 },
  (_, index) => startYear + index,
);

function getCurrentYearJst() {
  return Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Tokyo",
      year: "numeric",
    }).format(new Date()),
  );
}

function getCurrentDatePartsJst() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  );

  return {
    year: Number(values.year),
    month: Number(values.month),
  };
}

function formatDate(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(
    2,
    "0",
  )}`;
}

function getMonthRange(offset: number) {
  const current = getCurrentDatePartsJst();
  const firstDay = new Date(Date.UTC(current.year, current.month - 1 + offset, 1));
  const year = firstDay.getUTCFullYear();
  const month = firstDay.getUTCMonth() + 1;
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();

  return {
    year: String(year),
    start: formatDate(year, month, 1),
    end: formatDate(year, month, lastDay),
  };
}

export function CalendarDbSearchForm({
  query,
  limitOptions,
  viewOptions,
  dayTypeOptions,
  kyuseiMatchOptions,
  purposeOptions,
  candidateOptions,
  goodDirectionMatchOptions,
}: CalendarDbSearchFormProps) {
  const [year, setYear] = useState(query.year);
  const [start, setStart] = useState(query.start);
  const [end, setEnd] = useState(query.end);
  const currentYear = getCurrentYearJst();
  const yearOptions = baseYearOptions.includes(currentYear)
    ? [
        currentYear,
        ...baseYearOptions.filter((option) => option !== currentYear),
      ]
    : baseYearOptions;

  return (
    <form className="calendarDbSearchForm" action="/calendar-db" method="get">
      <div className="calendarDbQuickRanges" aria-label="期間クイック指定">
        <button
          type="button"
          onClick={() => {
            const range = getMonthRange(0);
            setYear(range.year);
            setStart(range.start);
            setEnd(range.end);
          }}
        >
          今月
        </button>
        <button
          type="button"
          onClick={() => {
            const range = getMonthRange(1);
            setYear(range.year);
            setStart(range.start);
            setEnd(range.end);
          }}
        >
          来月
        </button>
        <button
          type="button"
          onClick={() => {
            const nextYear = String(currentYear);
            setYear(nextYear);
            setStart(`${nextYear}-01-01`);
            setEnd(`${nextYear}-12-31`);
          }}
        >
          今年
        </button>
      </div>
      <label>
        年
        <select
          name="year"
          value={year}
          onChange={(event) => {
            const nextYear = event.target.value;
            setYear(nextYear);
            setStart(`${nextYear}-01-01`);
            setEnd(`${nextYear}-12-31`);
          }}
        >
          {yearOptions.map((option) => (
            <option key={option} value={option}>
              {option === currentYear ? `${option}（今年）` : option}
            </option>
          ))}
        </select>
      </label>
      <label>
        開始日
        <input
          name="start"
          type="date"
          value={start}
          min={`${startYear}-01-01`}
          max={`${endYear}-12-31`}
          onChange={(event) => setStart(event.target.value)}
        />
      </label>
      <label>
        終了日
        <input
          name="end"
          type="date"
          value={end}
          min={`${startYear}-01-01`}
          max={`${endYear}-12-31`}
          onChange={(event) => setEnd(event.target.value)}
        />
      </label>
      <label>
        表示ビュー
        <select name="view" defaultValue={query.view}>
          {viewOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label>
        日付種別
        <select name="dayType" defaultValue={query.dayType}>
          {dayTypeOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label>
        九星一致
        <select name="kyuseiMatch" defaultValue={query.kyuseiMatch}>
          {kyuseiMatchOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label className="calendarDbBirthDateField">
        生年月日
        <input
          name="birthDate"
          type="date"
          defaultValue={query.birthDate}
          min={`${startYear}-01-01`}
          max={`${endYear}-12-31`}
        />
      </label>
      <label className="calendarDbPurposeField">
        目的
        <select name="purpose" defaultValue={query.purpose}>
          {purposeOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label className="calendarDbCandidateField">
        候補
        <select name="candidate" defaultValue={query.candidate}>
          {candidateOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label className="calendarDbGoodDirectionMatchField">
        吉方一致
        <select
          name="goodDirectionMatch"
          defaultValue={query.goodDirectionMatch}
        >
          {goodDirectionMatchOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label>
        キーワード
        <input
          name="keyword"
          defaultValue={query.keyword}
          placeholder="氐宿 / 土用 / 一粒万倍日"
        />
      </label>
      <label>
        表示件数
        <select name="limit" defaultValue={query.limit}>
          {limitOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
      <button type="submit">検索</button>
    </form>
  );
}
