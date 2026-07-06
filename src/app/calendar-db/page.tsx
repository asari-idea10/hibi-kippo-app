import { CalendarDbSearchForm } from "@/app/calendar-db/calendar-db-search-form";
import { SiteSectionNav } from "@/components/site-section-nav";
import { actionPurposeOptions } from "@/lib/action-purpose-master";
import {
  calendarDbCandidateOptions,
  calendarDbDirectionColumns,
  calendarDbDayTypeOptions,
  calendarDbGoodDirectionMatchOptions,
  calendarDbKyuseiMatchOptions,
  calendarDbViewOptions,
  searchCalendarDb,
} from "@/lib/calendar-db-view";
import { getDirectionHeaderMeaning } from "@/lib/direction-meaning-master";
import {
  directionDeityAdoptionMaster,
  type DirectionDeityAdoptionStatus,
} from "@/lib/direction-deities";

type CalendarDbPageProps = {
  searchParams?: Promise<{
    year?: string;
    start?: string;
    end?: string;
    birthDate?: string;
    keyword?: string;
    limit?: string;
    view?: string;
    dayType?: string;
    kyuseiMatch?: string;
    purpose?: string;
    candidate?: string;
    goodDirectionMatch?: string;
  }>;
};

const limitOptions = [50, 100, 300, 365, 500, 1000];

function getDirectionCellTone(value: string) {
  if (
    value.includes("凶方位優先") ||
    value.includes("五黄殺") ||
    value.includes("暗剣殺") ||
    value.includes("本命殺") ||
    value.includes("的殺") ||
    value.includes("土用殺") ||
    value.includes("破")
  ) {
    return "directionToneBlock";
  }

  if (value.includes("最大吉方候補")) {
    return "directionToneBest";
  }

  if (value.includes("吉方候補")) {
    return "directionToneGood";
  }

  if (value.includes("比和")) {
    return "directionToneHarmony";
  }

  if (value.includes("相剋注意")) {
    return "directionToneCaution";
  }

  return "";
}

function isDirectionPurposeCandidate(value: string) {
  const hasFavorable =
    value.includes("最大吉方候補") ||
    value.includes("吉方候補") ||
    value.includes("比和");
  const hasBlocking =
    value.includes("凶方位優先") ||
    value.includes("五黄殺") ||
    value.includes("暗剣殺") ||
    value.includes("本命殺") ||
    value.includes("的殺") ||
    value.includes("土用殺") ||
    value.includes("破");

  return hasFavorable && !hasBlocking;
}

function getDirectionDeityCycleLabel(cycle: string) {
  if (cycle === "year") {
    return "年";
  }

  if (cycle === "month") {
    return "月";
  }

  if (cycle === "day") {
    return "日";
  }

  return cycle;
}

function getDirectionDeityTone(category: string) {
  if (category === "吉神") {
    return "directionToneGood";
  }

  if (category === "凶神") {
    return "directionToneBlock";
  }

  if (category === "吉凶") {
    return "directionToneCaution";
  }

  return "";
}

function getDirectionDeityAdoptionTone(status: DirectionDeityAdoptionStatus) {
  if (status === "正式採用") {
    return "directionToneGood";
  }

  if (status === "検証中") {
    return "directionToneCaution";
  }

  return "";
}

export default async function CalendarDbPage({
  searchParams,
}: CalendarDbPageProps) {
  const params = (await searchParams) ?? {};
  const result = searchCalendarDb(params);
  return (
    <main className="shell calendarDbShell">
      <section className="hero calendarDbHero">
        <p className="eyebrow">Calendar Database Viewer</p>
        <h1>共通暦データベース参照</h1>
        <p>
          1900〜2050年の共通暦から、万年暦照合サマリーの列を横断して確認します。
          年・日付範囲・キーワードで絞り、目視検証に使うための開発者向けページです。
        </p>
        <SiteSectionNav active="calendar-db" />
      </section>

      <section className="panel">
        <CalendarDbSearchForm
          query={result.query}
          limitOptions={limitOptions}
          viewOptions={calendarDbViewOptions}
          dayTypeOptions={calendarDbDayTypeOptions}
          kyuseiMatchOptions={calendarDbKyuseiMatchOptions}
          purposeOptions={actionPurposeOptions}
          candidateOptions={calendarDbCandidateOptions}
          goodDirectionMatchOptions={calendarDbGoodDirectionMatchOptions}
        />

        <div className="calendarDbSummaryGrid">
          <div>
            <span>対象期間</span>
            <strong>
              {result.query.start} 〜 {result.query.end}
            </strong>
          </div>
          <div>
            <span>検索前</span>
            <strong>{result.totalBeforeFilter.toLocaleString()}日</strong>
          </div>
          <div>
            <span>一致件数</span>
            <strong>{result.totalMatched.toLocaleString()}件</strong>
          </div>
          <div>
            <span>表示</span>
            <strong>{result.totalReturned.toLocaleString()}件</strong>
          </div>
          <div>
            <span>ビュー</span>
            <strong>
              {
                calendarDbViewOptions.find(
                  (option) => option.id === result.query.view,
                )?.label
              }
            </strong>
          </div>
          <div>
            <span>日付種別</span>
            <strong>
              {calendarDbDayTypeOptions.find(
                (option) => option.id === result.query.dayType,
              )?.label}
            </strong>
          </div>
          <div>
            <span>九星一致</span>
            <strong>
              {calendarDbKyuseiMatchOptions.find(
                (option) => option.id === result.query.kyuseiMatch,
              )?.label}
            </strong>
          </div>
          <div>
            <span>目的</span>
            <strong>{result.purpose.label}</strong>
          </div>
          <div>
            <span>候補</span>
            <strong>
              {calendarDbCandidateOptions.find(
                (option) => option.id === result.query.candidate,
              )?.label}
            </strong>
          </div>
          <div>
            <span>吉方一致</span>
            <strong>
              {calendarDbGoodDirectionMatchOptions.find(
                (option) => option.id === result.query.goodDirectionMatch,
              )?.label}
            </strong>
          </div>
          <div>
            <span>本命星</span>
            <strong>
              {result.personal
                ? `${result.personal.birthDate} / ${result.personal.honmeiStarDisplay}`
                : "-"}
            </strong>
          </div>
        </div>
      </section>

      {result.query.view === "direction_deities" ? (
        <section className="panel">
          <div className="calendarDbTableHeader">
            <div>
              <p className="eyebrow">Direction Deity Master</p>
              <h2>方位神マスター採用ステータス</h2>
            </div>
            <p>
              方位神は年を主軸に、月・日は検証済みのものだけ補助表示します。
              正式採用・検証中・将来対応を分け、通常画面に出す範囲を管理します。
            </p>
          </div>
          <div className="calendarDbTableWrap">
            <table className="referenceCompareTable calendarDbTable calendarDbTableCompact">
              <thead>
                <tr>
                  <th>採用</th>
                  <th>方位神/機能</th>
                  <th>周期</th>
                  <th>分類</th>
                  <th>表示層</th>
                  <th>実装</th>
                  <th>現在の範囲</th>
                  <th>次に確認すること</th>
                  <th>メモ</th>
                </tr>
              </thead>
              <tbody>
                {directionDeityAdoptionMaster.map((entry) => (
                  <tr key={`${entry.name}-${entry.cycle}`}>
                    <td
                      className={getDirectionDeityAdoptionTone(
                        entry.adoptionStatus,
                      )}
                    >
                      <strong>{entry.adoptionStatus}</strong>
                    </td>
                    <td>
                      <strong>{entry.name}</strong>
                    </td>
                    <td>
                      {entry.cycle === "multi"
                        ? "複合"
                        : getDirectionDeityCycleLabel(entry.cycle)}
                    </td>
                    <td className={getDirectionDeityTone(entry.category)}>
                      {entry.category}
                    </td>
                    <td>{entry.displayLayer}</td>
                    <td>{entry.implementationStatus}</td>
                    <td>{entry.currentScope}</td>
                    <td>{entry.nextCheck}</td>
                    <td>{entry.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <section className="panel">
        <div className="calendarDbTableHeader">
          <div>
            <p className="eyebrow">Almanac Rows</p>
            <h2>万年暦照合サマリー列</h2>
          </div>
          <p>
            列数が多いため横スクロールで確認します。日付を押すと、その日の開発者用検証画面へ移動します。
          </p>
        </div>
        <div className="calendarDbTableWrap">
          {result.query.view === "direction_deities" ? (
            <table className="referenceCompareTable calendarDbTable calendarDbTableCompact">
              <thead>
                <tr>
                  <th>西暦</th>
                  <th>周期</th>
                  <th>方位神</th>
                  <th>分類</th>
                  <th>24山</th>
                  <th>8方位</th>
                  <th>根拠</th>
                  <th>意味</th>
                  <th>行動翻訳</th>
                  <th>注意</th>
                  <th>検証</th>
                </tr>
              </thead>
              <tbody>
                {result.rows.flatMap((row) =>
                  row.directionDeityRows.map((entry, index) => (
                    <tr
                      className={`calendarDbRow-${row.dayType} ${
                        index === 0 ? "directionMatrixGroupStart" : ""
                      }`}
                      key={`${row.date}-${entry.code}`}
                    >
                      {index === 0 ? (
                        <td
                          className="directionMatrixGroupedCell directionMatrixDateCell"
                          rowSpan={row.directionDeityRows.length}
                        >
                          <a
                            className="calendarDbDateLink"
                            href={`/?date=${row.date}&view=dev`}
                          >
                            {row.values["西暦"]}
                          </a>
                          <span className="calendarDbSmallMeta">
                            {row.values["年/月/日干支"]}
                          </span>
                        </td>
                      ) : null}
                      <td>{getDirectionDeityCycleLabel(entry.cycle)}</td>
                      <td>
                        <strong>{entry.name}</strong>
                      </td>
                      <td className={getDirectionDeityTone(entry.category)}>
                        {entry.category}
                      </td>
                      <td>
                        {entry.mountains.length > 0
                          ? entry.mountains.join("・")
                          : "中宮/天上"}
                      </td>
                      <td>
                        {entry.direction8.length > 0
                          ? entry.direction8.join("・")
                          : "方位なし"}
                      </td>
                      <td>{entry.basis}</td>
                      <td>{entry.meaning}</td>
                      <td>{entry.actionAdvice}</td>
                      <td>{entry.caution ?? "-"}</td>
                      <td>
                        <span>{entry.ruleStatus}</span>
                        <br />
                        <small>{entry.verificationStatus}</small>
                      </td>
                    </tr>
                  )),
                )}
              </tbody>
            </table>
          ) : result.query.view === "kyusei" ? (
            <table className="referenceCompareTable calendarDbTable calendarDbDirectionMatrixTable">
              <thead>
                <tr>
                  <th>西暦</th>
                  <th>盤</th>
                  <th>干支</th>
                  <th>九星</th>
                  {calendarDbDirectionColumns.map((direction) => {
                    const headerMeaning = getDirectionHeaderMeaning(direction);

                    return (
                      <th
                        className="directionMatrixDirectionHeader"
                        key={direction}
                      >
                        {headerMeaning ? (
                          <span className="directionMatrixHeaderStack">
                            <strong>{headerMeaning.main}</strong>
                            <span>{headerMeaning.sub}</span>
                            <small>{headerMeaning.shortMeaning}</small>
                          </span>
                        ) : (
                          direction
                        )}
                      </th>
                    );
                  })}
                  <th>土用</th>
                  <th>旧暦</th>
                  <th>節入り</th>
                </tr>
              </thead>
              <tbody>
                {result.rows.flatMap((row) =>
                  row.kyuseiBoardRows.map((boardRow, index) => (
                    <tr
                      key={`${row.date}-${boardRow.board}`}
                      className={`calendarDbRow-${row.dayType} ${
                        index === 0 ? "directionMatrixGroupStart" : ""
                      } ${
                        result.purpose.emphasizedBoards.includes(boardRow.board)
                          ? "directionMatrixPurposeEmphasis"
                          : ""
                      }`}
                    >
                      {index === 0 ? (
                        <td
                          className="directionMatrixGroupedCell directionMatrixDateCell"
                          rowSpan={3}
                        >
                          <a
                            className="calendarDbDateLink"
                            href={`/?date=${row.date}&view=dev`}
                          >
                            {row.values["西暦"]}
                          </a>
                        </td>
                      ) : null}
                      <td className="directionMatrixBoardCell">
                        {boardRow.label}
                      </td>
                      <td>{boardRow.pillar}</td>
                      <td className="directionMatrixKyuseiCell">
                        {boardRow.kyusei}
                      </td>
                      {calendarDbDirectionColumns.map((direction) => (
                        (() => {
                          const value =
                            row.directionBoardValues[direction][boardRow.board];
                          const isPurposeTarget =
                            result.purpose.emphasizedBoards.includes(
                              boardRow.board,
                            ) && isDirectionPurposeCandidate(value);

                          return (
                            <td
                              className={`directionMatrixDirectionCell ${getDirectionCellTone(
                                value,
                              )} ${
                                isPurposeTarget
                                  ? "directionPurposeCandidate"
                                  : ""
                              }`}
                              key={direction}
                            >
                              {value}
                              {isPurposeTarget ? (
                                <span className="directionPurposeTag">
                                  {result.purpose.label}
                                </span>
                              ) : null}
                            </td>
                          );
                        })()
                      ))}
                      {index === 0 ? (
                        <td className="directionMatrixGroupedCell" rowSpan={3}>
                          {row.values["土用"]}
                        </td>
                      ) : null}
                      {index === 0 ? (
                        <td className="directionMatrixGroupedCell" rowSpan={3}>
                          {row.values["旧暦"]}
                        </td>
                      ) : null}
                      {index === 0 ? (
                        <td className="directionMatrixGroupedCell" rowSpan={3}>
                          {row.values["節入り時刻"]}
                        </td>
                      ) : null}
                    </tr>
                  )),
                )}
              </tbody>
            </table>
          ) : (
            <table
              className={`referenceCompareTable calendarDbTable ${
                result.query.view === "all" ? "" : "calendarDbTableCompact"
              }`}
            >
              <thead>
                <tr>
                  {result.columns.map((column) => (
                    <th key={column}>{column}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row) => (
                  <tr
                    key={row.date}
                    className={`calendarDbRow-${row.dayType}`}
                  >
                    {result.columns.map((column) => (
                      <td key={column}>
                        {column === "西暦" ? (
                          <a
                            className="calendarDbDateLink"
                            href={`/?date=${row.date}&view=dev`}
                          >
                            {row.values[column]}
                          </a>
                        ) : (
                          row.values[column]
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </main>
  );
}
