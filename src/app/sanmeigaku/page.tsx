import Link from "next/link";

import { SiteSectionNav } from "@/components/site-section-nav";
import {
  getSanmeigakuCellContext,
  getSanmeigakuProfile,
} from "@/lib/sanmeigaku-profile";
import {
  getSanmeigakuMasterInventoryItems,
  getSanmeigakuMasterInventorySummary,
  sanmeigakuMasterSpreadsheet,
} from "@/lib/sanmeigaku-master-inventory";
import {
  getZokanVerificationSamples,
  getZokanVerificationSummary,
  zokanVerificationSources,
} from "@/lib/sanmeigaku-zokan-verification";
import type {
  YosenJuudaiPosition,
  YosenJuunidaiPosition,
} from "@/lib/sanmeigaku-yosen-master";
import { classicalPdfZokanMaster } from "@/lib/zokan-master";

type SanmeigakuPageProps = {
  searchParams?: Promise<{
    birthDate?: string;
  }>;
};

const yosenChartReferenceUrl =
  "https://docs.google.com/spreadsheets/d/128NYUsqnlhEuzYsBPQl6zhtG8Mhl8HrWJco0O88jUbU/edit?gid=1833310362#gid=1833310362";
const pillarOrder = ["year", "month", "day", "time"] as const;

export const metadata = {
  title: "算命学 命式 v0 | 日々吉方",
  description:
    "共通暦DBをもとに、算命学の陰占を年柱・月柱・日柱から確認する開発中ページです。",
};

export default async function SanmeigakuPage({
  searchParams,
}: SanmeigakuPageProps) {
  const params = await searchParams;
  const birthDate = params?.birthDate?.trim() ?? "";
  const profile = birthDate ? getSanmeigakuProfile(birthDate) : null;
  const masterInventoryItems = getSanmeigakuMasterInventoryItems();
  const masterInventorySummary = getSanmeigakuMasterInventorySummary();
  const zokanVerificationSamples = getZokanVerificationSamples();
  const zokanVerificationSummary = getZokanVerificationSummary();

  return (
    <main className="shell">
      <section className="hero">
        <p className="eyebrow">Sanmeigaku Chart</p>
        <h1>算命学 命式</h1>
        <p>
          共通暦DBで検証してきた年柱・月柱・日柱を、算命学の陰占として再編集します。
          まずは陰占を土台にし、陽占の星出しと意味マスターは次の段階で接続します。
        </p>
        <SiteSectionNav active="sanmeigaku" />
      </section>

      <section className="panel sanmeiInputPanel">
        <form action="/sanmeigaku" className="dateSearch" method="get">
          <label htmlFor="birthDate">生年月日</label>
          <input
            defaultValue={birthDate}
            id="birthDate"
            name="birthDate"
            type="date"
          />
          <button type="submit">命式を見る</button>
        </form>
        <p className="note">
          v0では出生時刻を使わず、年柱・月柱・日柱を表示します。時柱は真太陽時・出生地補正の工程で後続接続します。
        </p>
      </section>

      {!birthDate ? (
        <section className="panel">
          <h2>生年月日を入力してください</h2>
          <p>
            生年月日を指定すると、年柱・月柱・日柱をもとに陰占と陽占を表示します。
          </p>
        </section>
      ) : !profile ? (
        <section className="panel">
          <h2>命式を表示できません</h2>
          <p>
            {birthDate} は現在の共通暦DBの範囲外です。暦DBに収録済みの日付を指定してください。
          </p>
          <Link className="apiLink" href="/calendar-db">
            暦DBで収録範囲を確認する
          </Link>
        </section>
      ) : (
        <>
          <section className="inzenPreviewPanel sanmeiInzenPanel">
            <div className="inzenPreviewHeader">
              <div>
                <p className="eyebrow">Insen</p>
                <h2>陰占</h2>
                <p>
                  年柱・月柱・日柱を中心に、天干、地支、蔵干、九星を並べます。
                  ここを算命学ページの最初の読み口にします。
                </p>
              </div>
              <div className="inzenPreviewMeta">
                <span>生年月日</span>
                <strong>{profile.birthDate}</strong>
                <p>
                  {profile.birthDay.pillars.year} /{" "}
                  {profile.birthDay.pillars.month} /{" "}
                  {profile.birthDay.pillars.day}
                </p>
              </div>
            </div>

            <div className="inzenChartWrap">
              <table className="inzenChartTable">
                <thead>
                  <tr>
                    <th>陰占</th>
                    {profile.columns.map((column) => (
                      <th key={column.key} title={`${column.period}\n${column.theme}`}>
                        <span>{column.label}</span>
                        <small>{column.period}</small>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {profile.rows.map((row) => (
                    <tr key={row.label}>
                      <th>{row.label}</th>
                      {profile.columns.map((column) => {
                        const value = profile.values[column.key][row.valueKey];
                        const context = getSanmeigakuCellContext(
                          column.key,
                          row.rowKey,
                        );

                        return (
                          <td
                            className={row.isStory ? "storyCell" : undefined}
                            key={`${row.label}-${column.key}`}
                          >
                            <strong>{value || "-"}</strong>
                            <span className="inzenCellTooltip">
                              意味: {context.meaning}
                              <br />
                              課題: {context.challenge}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="panel sanmeiPillarPanel">
            <div className="sectionHeadingRow">
              <div>
                <p className="eyebrow">Pillars</p>
                <h2>陰占の柱</h2>
              </div>
              <p>{profile.sourceStatus}</p>
            </div>
            <div className="sanmeiPillarGrid">
              {pillarOrder.map((key) => {
                const pillar = profile.pillars[key];

                return (
                  <article className="sanmeiPillarCard" key={pillar.key}>
                    <span>{pillar.theme}</span>
                    <h3>{pillar.label}</h3>
                    <strong>{pillar.pillar}</strong>
                    <dl>
                      <div>
                        <dt>天干</dt>
                        <dd>{pillar.stem}</dd>
                      </div>
                      <div>
                        <dt>地支</dt>
                        <dd>{pillar.branch}</dd>
                      </div>
                      <div>
                        <dt>納音</dt>
                        <dd>{pillar.nacchin}</dd>
                      </div>
                      <div>
                        <dt>空亡</dt>
                        <dd>{pillar.kuubou}</dd>
                      </div>
                      <div>
                        <dt>蔵干</dt>
                        <dd>
                          主 {pillar.hiddenStems.main} / 中{" "}
                          {pillar.hiddenStems.middle || "-"} / 余{" "}
                          {pillar.hiddenStems.extra || "-"}
                        </dd>
                      </div>
                      <div>
                        <dt>司令</dt>
                        <dd>
                          {pillar.hiddenStems.activeLabel}{" "}
                          {pillar.hiddenStems.activeStem}
                        </dd>
                      </div>
                    </dl>
                    <p>{pillar.meaning}</p>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="panel sanmeiYosenPanel">
            <div className="sectionHeadingRow">
              <div>
                <p className="eyebrow">Yosen Chart</p>
                <h2>
                  <Link
                    className="sectionHeadingLink"
                    href={yosenChartReferenceUrl}
                    rel="noreferrer"
                    target="_blank"
                    title="参照: 算命計算 B538:V550 / 十大主星 A552:E562, A565:E615, A618:B654"
                  >
                    陽占 人体星図
                  </Link>
                </h2>
              </div>
              <p>{profile.yosenChart.source}</p>
            </div>
            <p className="note">
              日干「{profile.yosenChart.dayStem}」を基準に、年干・月干・蔵干司令・地支を当てて、
              十大主星と十二大従星を配置します。まずは算命学で一般的な人体星図の形をv0として表示します。
            </p>
            <div className="sanmeiYosenChart">
              <div className="sanmeiYosenCell sanmeiYosenCellMeta">
                <span>総エネルギー</span>
                <strong>{profile.yosenChart.energyTotal}</strong>
                <em>{profile.yosenChart.strengthLabel}</em>
              </div>
              <YosenJuudaiCell position={profile.yosenChart.juudai.head} />
              <YosenJuunidaiCell position={profile.yosenChart.juunidai.early} />
              <YosenJuudaiCell position={profile.yosenChart.juudai.leftHand} />
              <YosenJuudaiCell
                isCenter
                position={profile.yosenChart.juudai.center}
              />
              <YosenJuudaiCell position={profile.yosenChart.juudai.rightHand} />
              <YosenJuunidaiCell position={profile.yosenChart.juunidai.late} />
              <YosenJuudaiCell position={profile.yosenChart.juudai.belly} />
              <YosenJuunidaiCell position={profile.yosenChart.juunidai.middle} />
            </div>
          </section>

          <section className="panel sanmeiZokanMasterPanel">
            <div className="sectionHeadingRow">
              <div>
                <p className="eyebrow">Zokan Master</p>
                <h2>蔵干マスター</h2>
              </div>
              <p>PDF十二支月令 v0 / adopted_confirmed</p>
            </div>
            <p className="note">
              年支・月支・日支は、この十二支ごとの余気・中気・本気の範囲に、
              節入りからの日数を当てて司令蔵干を読みます。
            </p>
            <div className="tableWrap">
              <table className="referenceCompareTable sanmeiZokanMasterTable">
                <thead>
                  <tr>
                    <th>支</th>
                    <th>余気</th>
                    <th>中気</th>
                    <th>本気</th>
                    <th>日数範囲</th>
                  </tr>
                </thead>
                <tbody>
                  {classicalPdfZokanMaster.map((entry) => (
                    <tr key={entry.branch}>
                      <td>
                        <strong>{entry.branch}</strong>
                      </td>
                      <td>{entry.extra}</td>
                      <td>{entry.middle ?? "-"}</td>
                      <td>{entry.main}</td>
                      <td>
                        {entry.ranges.map((range) => (
                          <span className="stackedValue" key={range.type}>
                            {range.label} {range.stem}: {range.startDay}日目
                            {range.endDay ? `〜${range.endDay}日目` : "以降"}
                          </span>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section
            className="panel sanmeiZokanVerificationPanel"
            id="zokan-verification"
          >
            <div className="sectionHeadingRow">
              <div>
                <p className="eyebrow">Zokan Verification</p>
                <h2>蔵干流派別検証ステータス</h2>
              </div>
              <p>1976/3/19 を初回固定サンプルとして登録</p>
            </div>
            <p className="note">
              蔵干は流派差が出るため、現行採用ルールと外部サイトの結果を混ぜずに比較します。
              まずは「どの方式で、どの司令蔵干を使い、陽占がどう変わるか」を目視できる台帳にします。
            </p>
            <div className="sourceGrid sanmeiZokanVerificationSummary">
              <div>
                <span>固定サンプル</span>
                <strong>{zokanVerificationSummary.sampleCount}件</strong>
                <p>節入り日数・蔵干・陽占をまとめて比較</p>
              </div>
              <div>
                <span>比較枠</span>
                <strong>{zokanVerificationSummary.comparisonCount}件</strong>
                <p>現行標準、算命のアプリ、suimei流派別</p>
              </div>
              <div>
                <span>一部確認</span>
                <strong>{zokanVerificationSummary.partiallyMatched}件</strong>
                <p>外部表示との主要一致を目視確認</p>
              </div>
              <div>
                <span>外部照合待ち</span>
                <strong>{zokanVerificationSummary.externalPending}件</strong>
                <p>suimei.comで流派別に手入力確認</p>
              </div>
            </div>

            <div className="sanmeiZokanSourceList">
              {zokanVerificationSources.map((source) => (
                <article key={source.name}>
                  <strong>{source.name}</strong>
                  <p>{source.role}</p>
                  {source.url ? (
                    <Link href={source.url} target="_blank">
                      参照元を開く
                    </Link>
                  ) : null}
                </article>
              ))}
            </div>

            {zokanVerificationSamples.map((sample) => (
              <div className="sanmeiZokanSampleBlock" key={sample.id}>
                <div className="sectionHeadingRow">
                  <div>
                    <h3>{sample.label}</h3>
                    <p>{sample.purpose}</p>
                  </div>
                  <p>
                    {sample.expectedPillars.year} /{" "}
                    {sample.expectedPillars.month} /{" "}
                    {sample.expectedPillars.day}
                  </p>
                </div>
                <div className="sanmeiZokanCurrentGrid">
                  <div>
                    <span>節入り日数</span>
                    <strong>{sample.currentApp.daysFromSetsuiri}日目</strong>
                  </div>
                  <div>
                    <span>年支蔵干</span>
                    <strong>{sample.currentApp.yearZokan.join(" / ")}</strong>
                    <small>司令 {sample.currentApp.activeStems.year}</small>
                  </div>
                  <div>
                    <span>月支蔵干</span>
                    <strong>{sample.currentApp.monthZokan.join(" / ")}</strong>
                    <small>司令 {sample.currentApp.activeStems.month}</small>
                  </div>
                  <div>
                    <span>日支蔵干</span>
                    <strong>{sample.currentApp.dayZokan.join(" / ")}</strong>
                    <small>司令 {sample.currentApp.activeStems.day}</small>
                  </div>
                </div>
                <div className="tableWrap">
                  <table className="referenceCompareTable sanmeiZokanVerificationTable">
                    <thead>
                      <tr>
                        <th>方式</th>
                        <th>状態</th>
                        <th>蔵干方針</th>
                        <th>司令蔵干</th>
                        <th>陽占一致</th>
                        <th>メモ・次作業</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sample.references.map((reference) => (
                        <tr key={`${sample.id}-${reference.methodId}`}>
                          <td>
                            <strong>{reference.methodName}</strong>
                            <small className="stackedValue">
                              {reference.sourceUrl ? (
                                <Link href={reference.sourceUrl} target="_blank">
                                  {reference.sourceName}
                                </Link>
                              ) : (
                                reference.sourceName
                              )}
                            </small>
                          </td>
                          <td>
                            <span
                              className={
                                reference.status === "adopted_current" ||
                                reference.status === "partially_matched"
                                  ? "matchBadge"
                                  : reference.status === "external_pending"
                                    ? "verifyBadge"
                                    : "pointNeutral"
                              }
                            >
                              {reference.statusLabel}
                            </span>
                            <small className="stackedValue">
                              {reference.status}
                            </small>
                          </td>
                          <td>{reference.zokanPolicy}</td>
                          <td>
                            年 {reference.yearActiveStem ?? "-"} / 月{" "}
                            {reference.monthActiveStem ?? "-"} / 日{" "}
                            {reference.dayActiveStem ?? "-"}
                          </td>
                          <td>{reference.yosenMatch ?? "未確認"}</td>
                          <td>
                            {reference.note}
                            <small className="stackedValue">
                              次: {reference.nextAction}
                            </small>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </section>

          <section className="panel sanmeiMasterInventoryPanel">
            <div className="sectionHeadingRow">
              <div>
                <p className="eyebrow">Master Inventory</p>
                <h2>算命学マスター棚卸し</h2>
              </div>
              <p>
                <Link href={sanmeigakuMasterSpreadsheet.url} target="_blank">
                  {sanmeigakuMasterSpreadsheet.title}
                </Link>
              </p>
            </div>
            <p className="note">
              陽占の実装前に、スプレッドシート内の出力マスターを用途ごとに分解します。
              ここでは「どの範囲を、どの計算・表示へ接続するか」を固定し、
              後続の検算と本文整備の迷子を防ぎます。
            </p>
            <div className="sourceGrid sanmeiMasterSummaryGrid">
              <div>
                <span>総項目</span>
                <strong>{masterInventorySummary.total}件</strong>
                <p>陰占、陽占、特殊判定、運勢展開を含む</p>
              </div>
              <div>
                <span>採用済み</span>
                <strong>{masterInventorySummary.adopted}件</strong>
                <p>現行ページまたは共通暦DBへ接続済み</p>
              </div>
              <div>
                <span>抽出中</span>
                <strong>{masterInventorySummary.extracting}件</strong>
                <p>スプシからTypeScriptマスター化する対象</p>
              </div>
              <div>
                <span>設計中</span>
                <strong>{masterInventorySummary.designing}件</strong>
                <p>出し方と検証単位を先に固める領域</p>
              </div>
              <div>
                <span>後続</span>
                <strong>{masterInventorySummary.pending}件</strong>
                <p>主要な陽占計算が固まったあとに接続</p>
              </div>
            </div>
            <div className="tableWrap">
              <table className="referenceCompareTable sanmeiMasterInventoryTable">
                <thead>
                  <tr>
                    <th>領域</th>
                    <th>マスター</th>
                    <th>状態</th>
                    <th>参照範囲</th>
                    <th>接続先・次アクション</th>
                  </tr>
                </thead>
                <tbody>
                  {masterInventoryItems.map((item) => (
                    <tr key={item.id}>
                      <td>
                        {item.category}
                        <small className="stackedValue">
                          優先度 {item.priority}
                        </small>
                      </td>
                      <td>
                        <strong>{item.name}</strong>
                        <small className="stackedValue">{item.role}</small>
                      </td>
                      <td>
                        <span
                          className={
                            item.status === "adopted"
                              ? "matchBadge"
                              : item.status === "extracting"
                                ? "verifyBadge"
                                : "pointNeutral"
                          }
                        >
                          {item.statusLabel}
                        </span>
                        <small className="stackedValue">{item.status}</small>
                      </td>
                      <td>
                        {item.sourceSheet}
                        <small className="stackedValue">{item.sourceRange}</small>
                        {item.outputRange ? (
                          <small className="stackedValue">
                            出力: {item.outputRange}
                          </small>
                        ) : null}
                      </td>
                      <td>
                        {item.connectionTarget}
                        <small className="stackedValue">
                          次: {item.nextAction}
                        </small>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="panel sanmeiNextPanel">
            <p className="eyebrow">Yosen Master</p>
            <h2>陽占マスター接続予定</h2>
            <p>
              次の工程では、陰占から算出した干支・蔵干をもとに、人体星図、十大主星、
              十二大従星などの陽占マスターを接続します。ここは本文を急がず、
              まず「どの星がどの根拠で出たか」を検証できる形で進めます。
            </p>
            <div className="sourceGrid">
              <div>
                <span>優先1</span>
                <strong>人体星図</strong>
                <p>中心星・東西南北の星を検証表示する</p>
              </div>
              <div>
                <span>優先2</span>
                <strong>十大主星</strong>
                <p>意味マスターと辞典ルートを作る</p>
              </div>
              <div>
                <span>優先3</span>
                <strong>十二大従星</strong>
                <p>エネルギー値と人生段階を接続する</p>
              </div>
              <div>
                <span>保留</span>
                <strong>時柱</strong>
                <p>出生時刻・出生地・真太陽時補正のあとに接続</p>
              </div>
            </div>
          </section>
        </>
      )}
    </main>
  );
}

function YosenJuudaiCell({
  isCenter = false,
  position,
}: {
  isCenter?: boolean;
  position: YosenJuudaiPosition;
}) {
  return (
    <article
      className={`sanmeiYosenCell sanmeiYosenCellJuudai${
        isCenter ? " sanmeiYosenCellCenter" : ""
      }`}
    >
      <span>{position.label}</span>
      <strong>{position.star}</strong>
      <em>{position.theme}</em>
      <small>
        {position.sourceLabel}: {position.dayStem}
        {position.targetStem}
      </small>
    </article>
  );
}

function YosenJuunidaiCell({
  position,
}: {
  position: YosenJuunidaiPosition;
}) {
  return (
    <article className="sanmeiYosenCell sanmeiYosenCellJuunidai">
      <span>{position.label}</span>
      <strong>{position.star}</strong>
      <em>
        {position.theme} / {position.energy ?? "-"}
      </em>
      <small>
        {position.sourceLabel}: {position.dayStem}
        {position.targetBranch}
      </small>
    </article>
  );
}
