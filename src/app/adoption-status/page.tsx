import Link from "next/link";

import { SiteSectionNav } from "@/components/site-section-nav";
import {
  getAdoptionSourceCatalog,
  getAdoptionStatusInfo,
} from "@/lib/adoption-status";
import {
  getCommonCalendarCompletionItems,
  getCommonCalendarCompletionSummary,
} from "@/lib/common-calendar-completion";
import {
  getCalendarRegressionSamples,
  getCalendarRegressionSampleSummary,
} from "@/lib/calendar-regression-samples";
import {
  getSelectedDayAdoptionSummary,
  getSelectedDayCandidateRows,
  getSelectedDayImplementedRows,
} from "@/lib/selected-day-adoption";
import {
  getZokanVerificationSamples,
  getZokanVerificationSummary,
} from "@/lib/sanmeigaku-zokan-verification";
import {
  termDictionaryImplementationStatuses,
  termDictionarySeoStatuses,
  termDictionaryTextQualityStages,
  termDictionaryTextStatuses,
  termDictionaryVerificationStatuses,
  getTermDictionaryStatusRows,
  getTermDictionaryStatusSummary,
} from "@/lib/term-dictionary-status";
import {
  getVerificationRegistryItems,
  getVerificationRegistrySummary,
} from "@/lib/verification-registry";

export const metadata = {
  title: "採用ステータス整理 | 日々吉方",
};

export default function AdoptionStatusPage() {
  const commonCalendarCompletionSummary = getCommonCalendarCompletionSummary();
  const commonCalendarCompletionItems = getCommonCalendarCompletionItems();
  const calendarRegressionSamples = getCalendarRegressionSamples();
  const calendarRegressionSampleSummary = getCalendarRegressionSampleSummary();
  const termDictionaryStatusRows = getTermDictionaryStatusRows();
  const termDictionaryStatusSummary = getTermDictionaryStatusSummary();
  const selectedDayAdoptionSummary = getSelectedDayAdoptionSummary();
  const selectedDayImplementedRows = getSelectedDayImplementedRows();
  const selectedDayCandidateRows = getSelectedDayCandidateRows();
  const adoptionSourceCatalog = getAdoptionSourceCatalog();
  const verificationRegistryItems = getVerificationRegistryItems();
  const verificationRegistrySummary = getVerificationRegistrySummary();
  const zokanVerificationSamples = getZokanVerificationSamples();
  const zokanVerificationSummary = getZokanVerificationSummary();

  return (
    <main className="shell">
      <section className="hero">
        <p className="eyebrow">Adoption Status</p>
        <h1>採用ステータス整理</h1>
        <p>
          共通暦、用語辞典、選日、方位神などのマスターを、実装段階・検証状態・本文品質で棚卸しします。
          機能追加の前に、どこが正式採用で、どこが仮実装かを確認するための開発者向け台帳です。
        </p>
        <SiteSectionNav active="adoption-status" />
      </section>

      <section className="referencePanel">
        <span>共通暦データの完成度</span>
        <strong>実装済み / v0検証中 / 未実装 / 後回し</strong>
        <p>
          いま入っている要素を大きく棚卸しします。共通暦、個人命式入口、上級候補を含め、
          次に何を固めるべきかを見るための全体表です。
        </p>
        <p>
          <strong>
            検証・provenance完了は、自動的なproduction接続を意味しません。
          </strong>
          本ページでは、根拠整備、計算検証、production接続、UI表示を別の進捗軸として管理します。
        </p>
        <div className="sourceGrid">
          <div>
            <span>総項目</span>
            <strong>{commonCalendarCompletionSummary.total}件</strong>
            <p>共通暦・個人命式入口・上級候補を含む</p>
          </div>
          <div>
            <span>実装済み</span>
            <strong>{commonCalendarCompletionSummary.implemented}件</strong>
            <p>定義範囲完了または本体・APIに接続済み</p>
          </div>
          <div>
            <span>v0検証中</span>
            <strong>{commonCalendarCompletionSummary.v0Verifying}件</strong>
            <p>計算・流派差・外部検証を継続</p>
          </div>
          <div>
            <span>未実装</span>
            <strong>{commonCalendarCompletionSummary.notImplemented}件</strong>
            <p>個人命式フェーズ以降</p>
          </div>
          <div>
            <span>後回し</span>
            <strong>{commonCalendarCompletionSummary.later}件</strong>
            <p>上級・高コスト候補</p>
          </div>
        </div>
        <div className="tableWrap completionStatusWrap">
          <table className="referenceCompareTable completionStatusTable">
            <thead>
              <tr>
                <th>項目</th>
                <th>完成度</th>
                <th>採用状態</th>
                <th>範囲</th>
                <th>ソース</th>
              </tr>
            </thead>
            <tbody>
              {commonCalendarCompletionItems.map((item) => {
                const info = getAdoptionStatusInfo(item.adoptionStatus);

                return (
                  <tr key={item.id}>
                    <td>
                      {item.name}
                      <small className="stackedValue">
                        {item.categoryLabel} / {item.note}
                      </small>
                      {item.progressDetails?.map((detail) => (
                        <small
                          className="stackedValue"
                          key={`${item.id}-${detail}`}
                        >
                          {detail}
                        </small>
                      ))}
                    </td>
                    <td>
                      <span
                        className={
                          item.status === "implemented"
                            ? "matchBadge"
                            : item.status === "v0_verifying"
                              ? "verifyBadge"
                              : "pointNeutral"
                        }
                      >
                        {item.statusLabel}
                      </span>
                      <small className="stackedValue">{item.status}</small>
                    </td>
                    <td>
                      {info.label}
                      <small className="stackedValue">
                        {item.adoptionStatus} / {info.reliability}
                      </small>
                    </td>
                    <td>{item.scope}</td>
                    <td>
                      {item.source}
                      <small className="stackedValue">{info.sourceName}</small>
                      <small className="stackedValue">次: {item.nextAction}</small>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="referencePanel" id="calendar-regression-samples">
        <span>検証用サンプル日セット</span>
        <strong>節入り・土用・吉日・方位神の固定回帰サンプル</strong>
        <p>
          ロジック修正のたびに壊れていないかを見る代表日です。
          CLIでは <code>npm run verify:calendar-regression</code> を使い、
          ローカルAPIから暦注・日盤・方位神・時盤を確認します。
        </p>
        <div className="sourceGrid selectedDaySummaryGrid">
          <div>
            <span>サンプル数</span>
            <strong>{calendarRegressionSampleSummary.total}件</strong>
            <p>2026年7月の代表日を中心に固定</p>
          </div>
          <div>
            <span>更新日</span>
            <strong>{calendarRegressionSampleSummary.updatedAt}</strong>
            <p>{calendarRegressionSampleSummary.schemaVersion}</p>
          </div>
          <div>
            <span>重点タグ</span>
            <strong>
              {calendarRegressionSampleSummary.importantTags
                .slice(0, 3)
                .map((entry) => entry.tag)
                .join(" / ")}
            </strong>
            <p>節入り、土用、天道、強い吉日などを点検</p>
          </div>
        </div>
        <div className="tableWrap">
          <table className="referenceCompareTable calendarRegressionTable">
            <thead>
              <tr>
                <th>日付</th>
                <th>検証テーマ</th>
                <th>タグ</th>
                <th>期待する主な要素</th>
                <th>確認方法</th>
              </tr>
            </thead>
            <tbody>
              {calendarRegressionSamples.map((sample) => {
                const expectedItems = [
                  sample.expect.rokuyo ? `六曜 ${sample.expect.rokuyo}` : null,
                  sample.expect.solarTerm ? `節気 ${sample.expect.solarTerm}` : null,
                  sample.expect.isSetsuiri ? "節入り" : null,
                  sample.expect.doyo ? "土用" : null,
                  sample.expect.dayKyusei
                    ? `日盤 ${sample.expect.dayKyusei}`
                    : null,
                  ...(sample.expect.selectedDayNamesInclude ?? []).slice(0, 4),
                  ...(sample.expect.goodFortuneNamesInclude ?? []).map(
                    (name) => `吉神 ${name}`,
                  ),
                ].filter((item): item is string => Boolean(item));

                return (
                  <tr key={sample.id}>
                    <td>
                      <Link href={`/purpose-calendar?year=${sample.date.slice(0, 4)}&month=${Number(sample.date.slice(5, 7))}`}>
                        {sample.date}
                      </Link>
                      <small className="stackedValue">{sample.id}</small>
                    </td>
                    <td>
                      {sample.label}
                      <small className="stackedValue">{sample.purpose}</small>
                    </td>
                    <td>
                      <span className="calendarRegressionTags">
                        {sample.tags.map((tag) => (
                          <small key={tag}>{tag}</small>
                        ))}
                      </span>
                    </td>
                    <td>{expectedItems.join(" / ")}</td>
                    <td>
                      <code>npm run verify:calendar-regression</code>
                      <small className="stackedValue">
                        calendar-day / good-fortune / hour-board / direction-deities
                      </small>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="referencePanel" id="zokan-verification-status">
        <span>蔵干流派別検証ステータス</span>
        <strong>算命学の蔵干ルールを流派別に比較する台帳</strong>
        <p>
          蔵干は流派差が大きいため、現行の「日々吉方標準」と外部サイトの出力を分けて管理します。
          詳細は <Link href="/sanmeigaku#zokan-verification">算命学ページの検証表</Link>
          で確認します。
        </p>
        <div className="sourceGrid selectedDaySummaryGrid">
          <div>
            <span>固定サンプル</span>
            <strong>{zokanVerificationSummary.sampleCount}件</strong>
            <p>1976/3/19から開始</p>
          </div>
          <div>
            <span>比較枠</span>
            <strong>{zokanVerificationSummary.comparisonCount}件</strong>
            <p>現行標準・算命のアプリ・suimei流派別</p>
          </div>
          <div>
            <span>現行採用</span>
            <strong>{zokanVerificationSummary.adoptedCurrent}件</strong>
            <p>アプリが現在使う蔵干ルール</p>
          </div>
          <div>
            <span>外部照合待ち</span>
            <strong>{zokanVerificationSummary.externalPending}件</strong>
            <p>suimei.comで手入力確認する項目</p>
          </div>
        </div>
        <div className="tableWrap">
          <table className="referenceCompareTable">
            <thead>
              <tr>
                <th>サンプル</th>
                <th>干支</th>
                <th>現行司令</th>
                <th>陽占</th>
                <th>次の検証</th>
              </tr>
            </thead>
            <tbody>
              {zokanVerificationSamples.map((sample) => (
                <tr key={sample.id}>
                  <td>
                    <Link href="/sanmeigaku#zokan-verification">
                      {sample.label}
                    </Link>
                    <small className="stackedValue">{sample.birthDate}</small>
                  </td>
                  <td>
                    年 {sample.expectedPillars.year} / 月{" "}
                    {sample.expectedPillars.month} / 日{" "}
                    {sample.expectedPillars.day}
                  </td>
                  <td>
                    年 {sample.currentApp.activeStems.year} / 月{" "}
                    {sample.currentApp.activeStems.month} / 日{" "}
                    {sample.currentApp.activeStems.day}
                  </td>
                  <td>
                    頭 {sample.currentApp.yosen.head} / 中心{" "}
                    {sample.currentApp.yosen.center}
                    <small className="stackedValue">
                      左 {sample.currentApp.yosen.leftHand} / 右{" "}
                      {sample.currentApp.yosen.rightHand} / 腹{" "}
                      {sample.currentApp.yosen.belly}
                    </small>
                  </td>
                  <td>
                    {sample.references.find(
                      (reference) => reference.status === "external_pending",
                    )?.nextAction ?? "外部照合値を追加する"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="referencePanel" id="verification-registry">
        <span>検証レジストリ</span>
        <strong>占術ロジックと参照ソースの対応表</strong>
        <p>
          占術ごとに、アプリ内の確認画面・API・参照サイト/資料・次の検証作業をまとめます。
          手元の万年暦だけで限界がある項目は、外部サイトやPDF、スプレッドシートを照合ソースとして併記します。
        </p>
        <div className="sourceGrid selectedDaySummaryGrid">
          <div>
            <span>検証対象</span>
            <strong>{verificationRegistrySummary.total}件</strong>
            <p>共通暦、九星、方位神、算命学など</p>
          </div>
          <div>
            <span>高優先</span>
            <strong>{verificationRegistrySummary.highPriority}件</strong>
            <p>ロジックの信頼性に直結する項目</p>
          </div>
          <div>
            <span>外部照合待ち</span>
            <strong>{verificationRegistrySummary.externalPending}件</strong>
            <p>サイト・万年暦・資料で確認する対象</p>
          </div>
          <div>
            <span>参照ソース</span>
            <strong>{verificationRegistrySummary.sourceCount}件</strong>
            <p>サイト、PDF、スプシ、手元資料を含む</p>
          </div>
        </div>
        <div className="tableWrap">
          <table className="referenceCompareTable verificationRegistryTable">
            <thead>
              <tr>
                <th>項目</th>
                <th>状態</th>
                <th>範囲</th>
                <th>内部確認</th>
                <th>参照サイト・資料</th>
                <th>サンプル方針</th>
                <th>次の作業</th>
              </tr>
            </thead>
            <tbody>
              {verificationRegistryItems.map((item) => (
                <tr key={item.id}>
                  <td>
                    {item.target}
                    <small className="stackedValue">
                      {item.category} / {item.id}
                    </small>
                  </td>
                  <td>
                    <span
                      className={
                        item.status === "検証済み"
                          ? "matchBadge"
                          : item.status === "設計中"
                            ? "pointNeutral"
                            : "verifyBadge"
                      }
                    >
                      {item.status}
                    </span>
                    <small className="stackedValue">優先度 {item.priority}</small>
                  </td>
                  <td>{item.scope}</td>
                  <td>
                    {item.internalRoute ? (
                      <Link href={item.internalRoute}>{item.internalRoute}</Link>
                    ) : (
                      "-"
                    )}
                    {item.internalApis.map((api) => (
                      <code className="stackedValue" key={api}>
                        {api}
                      </code>
                    ))}
                  </td>
                  <td>
                    <div className="verificationSourceList">
                      {item.sources.map((source) => (
                        <span key={`${item.id}-${source.label}`}>
                          {source.url ? (
                            <a href={source.url}>{source.label}</a>
                          ) : (
                            source.label
                          )}
                          <small>
                            {source.role} / {source.sourceType}
                          </small>
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>{item.samplePolicy}</td>
                  <td>{item.nextAction}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="referencePanel" id="term-dictionary-status">
        <span>用語辞典ステータス表</span>
        <strong>マスター採用・検証・本文整備の棚卸し</strong>
        <p>
          納音、空亡、方位神、天道、二十八宿、雑節など、増えてきた暦・方位マスターを
          「正式採用か仮実装か」「検証済みか」「本文が整っているか」で管理します。
          SEO記事化の前にこの表で採用状態を確認します。
        </p>
        <div className="sourceGrid selectedDaySummaryGrid">
          <div>
            <span>対象カテゴリ</span>
            <strong>{termDictionaryStatusSummary.total}件</strong>
            <p>六曜、十二直、二十八宿、選日、九星、納音、空亡、方位神など</p>
          </div>
          <div>
            <span>仮実装</span>
            <strong>{termDictionaryStatusSummary.provisional}件</strong>
            <p>表示はできるが、根拠・本文をさらに磨く対象</p>
          </div>
          <div>
            <span>要検証</span>
            <strong>{termDictionaryStatusSummary.needsVerification}件</strong>
            <p>シート・原典・実例との照合が必要</p>
          </div>
          <div>
            <span>本文未整備</span>
            <strong>{termDictionaryStatusSummary.textMissing}件</strong>
            <p>辞典・ブログ化の本文を増補する対象</p>
          </div>
          <div>
            <span>読める本文</span>
            <strong>{termDictionaryStatusSummary.readableText}件</strong>
            <p>辞典として読める段階まで育っている対象</p>
          </div>
          <div>
            <span>記事化優先</span>
            <strong>{termDictionaryStatusSummary.highEditorialPriority}件</strong>
            <p>検索・読み物展開の優先度が高い対象</p>
          </div>
        </div>
        <div className="termSeoStatusStrip" aria-label="実装段階">
          {termDictionaryImplementationStatuses.map((status) => (
            <span key={status}>
              {status}
              <strong>
                {termDictionaryStatusSummary.implementationByStatus[status]}件
              </strong>
            </span>
          ))}
        </div>
        <div className="termSeoStatusStrip" aria-label="検証状態">
          {termDictionaryVerificationStatuses.map((status) => (
            <span key={status}>
              {status}
              <strong>
                {termDictionaryStatusSummary.verificationByStatus[status]}件
              </strong>
            </span>
          ))}
        </div>
        <div className="termSeoStatusStrip" aria-label="本文状態">
          {termDictionaryTextStatuses.map((status) => (
            <span key={status}>
              {status}
              <strong>{termDictionaryStatusSummary.textByStatus[status]}件</strong>
            </span>
          ))}
        </div>
        <div className="termSeoStatusStrip" aria-label="本文品質段階">
          {termDictionaryTextQualityStages.map((stage) => (
            <span key={stage}>
              {stage}
              <strong>
                {termDictionaryStatusSummary.textQualityByStage[stage]}件
              </strong>
            </span>
          ))}
        </div>
        <div className="termSeoStatusStrip" aria-label="SEO記事化ステータス">
          {termDictionarySeoStatuses.map((status) => (
            <span key={status}>
              {status}
              <strong>{termDictionaryStatusSummary.seoByStatus[status]}件</strong>
            </span>
          ))}
        </div>
        <div className="tableWrap">
          <table className="referenceCompareTable selectedDayAdoptionTable">
            <thead>
              <tr>
                <th>カテゴリ</th>
                <th>辞典ルート</th>
                <th>接続状態</th>
                <th>実装段階</th>
                <th>検証状態</th>
                <th>本文状態</th>
                <th>本文品質</th>
                <th>マスター状態</th>
                <th>記事優先</th>
                <th>SEO記事</th>
                <th>記事の種</th>
                <th>次の対応</th>
              </tr>
            </thead>
            <tbody>
              {termDictionaryStatusRows.map((row) => (
                <tr id={`term-status-${row.id}`} key={row.id}>
                  <td>
                    {row.category}
                    <small className="stackedValue">{row.source}</small>
                  </td>
                  <td>
                    {row.routeExample ? (
                      <Link href={row.routeExample}>{row.routeLabel}</Link>
                    ) : (
                      row.routeLabel
                    )}
                  </td>
                  <td>{row.calendarLinkStatus}</td>
                  <td>
                    <span
                      className={
                        row.implementationStatus === "正式採用"
                          ? "matchBadge"
                          : row.implementationStatus === "未接続"
                            ? "pointNeutral"
                            : "verifyBadge"
                      }
                    >
                      {row.implementationStatus}
                    </span>
                  </td>
                  <td>
                    <span
                      className={
                        row.verificationStatus === "検証済み" ||
                        row.verificationStatus === "サンプル確認済み"
                          ? "matchBadge"
                          : "verifyBadge"
                      }
                    >
                      {row.verificationStatus}
                    </span>
                  </td>
                  <td>
                    <span
                      className={
                        row.textStatus === "本文あり"
                          ? "matchBadge"
                          : row.textStatus === "逆引き中心"
                            ? "pointNeutral"
                            : "verifyBadge"
                      }
                    >
                      {row.textStatus}
                    </span>
                  </td>
                  <td>
                    <span
                      className={
                        row.textQualityStage === "読める本文" ||
                        row.textQualityStage === "記事下書き" ||
                        row.textQualityStage === "公開品質"
                          ? "matchBadge"
                          : row.textQualityStage === "逆引き"
                            ? "pointNeutral"
                            : "verifyBadge"
                      }
                    >
                      {row.textQualityStage}
                    </span>
                  </td>
                  <td>{row.masterStatus}</td>
                  <td>
                    <span
                      className={
                        row.editorialPriority === "高"
                          ? "verifyBadge"
                          : row.editorialPriority === "中"
                            ? "pointNeutral"
                            : "matchBadge"
                      }
                    >
                      {row.editorialPriority}
                    </span>
                  </td>
                  <td>
                    <span className="pointNeutral">{row.seoArticleStatus}</span>
                  </td>
                  <td>{row.articleSeed}</td>
                  <td>{row.nextAction}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="referencePanel">
        <span>主要選日 採用管理</span>
        <strong>正式リストと未実装候補</strong>
        <p>
          現在の主要選日は正式リストとして管理し、未実装候補は追加順・検証元・次アクションを分けて追跡します。
        </p>
        <div className="sourceGrid selectedDaySummaryGrid">
          <div>
            <span>総項目</span>
            <strong>{selectedDayAdoptionSummary.total}件</strong>
            <p>正式リストと候補の合計</p>
          </div>
          <div>
            <span>正式リスト</span>
            <strong>{selectedDayAdoptionSummary.implemented}件</strong>
            <p>calendar-note-definitions に接続済み</p>
          </div>
          <div>
            <span>未実装候補</span>
            <strong>{selectedDayAdoptionSummary.candidates}件</strong>
            <p>追加・検証待ち</p>
          </div>
          <div>
            <span>分類</span>
            <strong>{selectedDayAdoptionSummary.categories}系統</strong>
            <p>大吉日、神事、金運、土地、注意など</p>
          </div>
          <div>
            <span>SEO記事</span>
            <strong>{selectedDayAdoptionSummary.seoNotStarted}件</strong>
            <p>すべて未着手。用語辞典から記事化候補へ育てる</p>
          </div>
        </div>

        <h3 className="subsectionTitle">現在入っている正式リスト</h3>
        <div className="tableWrap">
          <table className="referenceCompareTable selectedDayAdoptionTable">
            <thead>
              <tr>
                <th>選日</th>
                <th>分類</th>
                <th>吉凶</th>
                <th>重み</th>
                <th>SEO記事</th>
                <th>表示文</th>
              </tr>
            </thead>
            <tbody>
              {selectedDayImplementedRows.map((row) => (
                <tr key={row.code}>
                  <td>
                    {row.name}
                    <small className="stackedValue">{row.code}</small>
                  </td>
                  <td>{row.categoryLabel}</td>
                  <td>{row.fortune}</td>
                  <td>{row.weight ?? "-"}</td>
                  <td>{row.seoArticleStatus}</td>
                  <td>{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3 className="subsectionTitle">未実装だが採用候補</h3>
        <div className="tableWrap">
          <table className="referenceCompareTable selectedDayAdoptionTable">
            <thead>
              <tr>
                <th>候補</th>
                <th>分類</th>
                <th>SEO記事</th>
                <th>参照元</th>
                <th>次アクション</th>
                <th>メモ</th>
              </tr>
            </thead>
            <tbody>
              {selectedDayCandidateRows.map((row) => (
                <tr key={row.code}>
                  <td>
                    {row.name}
                    <small className="stackedValue">{row.code}</small>
                  </td>
                  <td>{row.categoryLabel}</td>
                  <td>{row.seoArticleStatus}</td>
                  <td>{row.source}</td>
                  <td>{row.nextAction}</td>
                  <td>{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="referencePanel">
        <span>参照ソース一覧</span>
        <strong>このプロジェクトで使う主な検証元</strong>
        <table className="referenceCompareTable">
          <thead>
            <tr>
              <th>ソース</th>
              <th>役割</th>
              <th>優先度</th>
              <th>メモ</th>
            </tr>
          </thead>
          <tbody>
            {adoptionSourceCatalog.map((source) => (
              <tr key={source.id}>
                <td>
                  {source.url ? <a href={source.url}>{source.name}</a> : source.name}
                </td>
                <td>{source.role}</td>
                <td>{source.priority}</td>
                <td>{source.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
