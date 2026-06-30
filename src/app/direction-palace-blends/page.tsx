import Link from "next/link";

import {
  directionPalaceMaster,
  getPalaceStarBlend,
  kyuseiStarElementMaster,
  palaceBlendRules,
  type DirectionPalaceKey,
} from "@/lib/direction-palace-blend-master";
import {
  getKyuseiBasicSymbol,
  getKyuseiClassicalSymbol,
  getKyuseiProfileSymbol,
  kyuseiBasicSymbolFields,
  kyuseiClassicalSymbolFields,
  kyuseiProfileSymbolFields,
} from "@/lib/kyusei-symbol-master";

const directionOrder: DirectionPalaceKey[] = [
  "北",
  "北東",
  "東",
  "南東",
  "南",
  "南西",
  "西",
  "北西",
];

const starOrder = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

const toneLabels = {
  good: "使いやすい",
  mixed: "整え向き",
  bad: "注意",
} as const;

type DirectionPalaceBlendsPageProps = {
  searchParams?: Promise<{
    direction?: string;
    star?: string;
  }>;
};

export default async function DirectionPalaceBlendsPage({
  searchParams,
}: DirectionPalaceBlendsPageProps) {
  const params = (await searchParams) ?? {};
  const selectedDirection = directionOrder.includes(
    params.direction as DirectionPalaceKey,
  )
    ? (params.direction as DirectionPalaceKey)
    : null;
  const selectedStar = starOrder.includes(params.star ?? "")
    ? (params.star as string)
    : null;
  const selectedBlend =
    selectedDirection && selectedStar
      ? getPalaceStarBlend(selectedDirection, selectedStar)
      : null;
  const selectedBasicSymbol = selectedStar
    ? getKyuseiBasicSymbol(selectedStar)
    : null;
  const selectedClassicalSymbol = selectedStar
    ? getKyuseiClassicalSymbol(selectedStar)
    : null;
  const selectedProfileSymbol = selectedStar
    ? getKyuseiProfileSymbol(selectedStar)
    : null;

  return (
    <main className="shell directionBlendShell">
      <section className="hero directionBlendHero">
        <p className="eyebrow">Direction Palace Blend Master</p>
        <h1>方位の気質と回座星のブレンド</h1>
        <p>
          八方位の宮が持つ土台の気質と、そこへ回ってくる九星の五行を掛け合わせて、
          行動に翻訳するためのマスターです。方位の気質を読みながら、
          方位の気質を読み、今その方位で何を整えるかを見ます。
        </p>
        <div className="viewSwitch" aria-label="ページ移動">
          <Link href="/">ユーザー向け</Link>
          <Link href="/?view=dev">開発者向け</Link>
          <Link href="/calendar-db">暦DB参照</Link>
          <Link href="/purpose-calendar">九星方位カレンダー</Link>
          <Link className="active" href="/direction-palace-blends">
            方位ブレンド
          </Link>
        </div>
      </section>

      {selectedBlend ? (
        <section className="panel directionBlendSelectedPanel">
          <p className="eyebrow">Selected Symbol</p>
          <div className="directionBlendSelectedHeader">
            <div>
              <h2>
                {selectedBlend.direction} × {selectedBlend.star.starName}
              </h2>
              <p>
                {selectedBlend.palace.bagua}宮 / {selectedBlend.palace.element}
                の土台に、{selectedBlend.star.element}の
                {selectedBlend.star.starName} が回座します。
              </p>
            </div>
            <span
              className={`directionBlendSelectedGrade directionBlendTone-${selectedBlend.calendarTone}`}
            >
              {selectedBlend.grade} / {selectedBlend.type}
            </span>
          </div>
          <div className="directionBlendSelectedGrid">
            <article>
              <span>方位の土台</span>
              <strong>{selectedBlend.palace.theme}</strong>
              <p>{selectedBlend.palace.gentleAdvice}</p>
              <div>
                {selectedBlend.palace.keywords.map((tag) => (
                  <b key={`palace-${tag}`}>{tag}</b>
                ))}
              </div>
            </article>
            <article>
              <span>回座星の象意</span>
              <strong>
                {selectedBlend.star.starName} / {selectedBlend.star.element}
              </strong>
              <p>{selectedBlend.microCopy}</p>
              <div>
                {selectedBlend.star.keywords.map((tag) => (
                  <b key={`star-${tag}`}>{tag}</b>
                ))}
              </div>
            </article>
            {selectedBasicSymbol ? (
              <article className="directionBlendSymbolArticle">
                <span>基本象意 A〜M</span>
                <strong>
                  {selectedBasicSymbol.starNumber} {selectedBasicSymbol.starName}
                </strong>
                <dl className="directionBlendSymbolList">
                  {kyuseiBasicSymbolFields.map((field) => (
                    <div key={field.key}>
                      <dt>{field.label}</dt>
                      <dd>{selectedBasicSymbol[field.key]}</dd>
                    </div>
                  ))}
                </dl>
              </article>
            ) : null}
            {selectedClassicalSymbol ? (
              <article className="directionBlendSymbolArticle directionBlendSymbolArticle-wide">
                <span>原典象意 O〜Y</span>
                <strong>天象・人象・場所・食物・病気・職業までを網羅</strong>
                <dl className="directionBlendSymbolList directionBlendSymbolList-dense">
                  {kyuseiClassicalSymbolFields.map((field) => (
                    <div key={field.key}>
                      <dt>{field.label}</dt>
                      <dd>{selectedClassicalSymbol[field.key]}</dd>
                    </div>
                  ))}
                </dl>
              </article>
            ) : null}
            {selectedProfileSymbol ? (
              <article className="directionBlendSymbolArticle directionBlendSymbolArticle-wide">
                <span>星の解説 AG〜AM</span>
                <strong>定位・意味・基本運勢・男女別の性格</strong>
                <dl className="directionBlendSymbolList directionBlendSymbolList-profile">
                  {kyuseiProfileSymbolFields.map((field) => (
                    <div key={field.key}>
                      <dt>{field.label}</dt>
                      <dd>{selectedProfileSymbol[field.key]}</dd>
                    </div>
                  ))}
                </dl>
              </article>
            ) : null}
            <article>
              <span>作用の読み</span>
              <strong>{selectedBlend.elementalRelationLabel}</strong>
              <p>{selectedBlend.benefitText}</p>
              <small>{selectedBlend.cautionText}</small>
            </article>
            <article>
              <span>行動タグ</span>
              <strong>{selectedBlend.uiBadge}</strong>
              <div>
                {selectedBlend.actionTags.map((tag) => (
                  <b key={`action-${tag}`}>{tag}</b>
                ))}
              </div>
            </article>
            <article>
              <span>ご利益タグ</span>
              <strong>{selectedBlend.displayGrade}</strong>
              <div>
                {selectedBlend.benefitTags.map((tag) => (
                  <b key={`benefit-${tag}`}>{tag}</b>
                ))}
              </div>
            </article>
            <article>
              <span>守り・注意タグ</span>
              <strong>{toneLabels[selectedBlend.calendarTone]}</strong>
              <div>
                {selectedBlend.protectiveTags.map((tag) => (
                  <b key={`protective-${tag}`}>{tag}</b>
                ))}
                {selectedBlend.effectTags.map((tag) => (
                  <b key={`effect-${tag}`}>{tag}</b>
                ))}
              </div>
            </article>
          </div>
        </section>
      ) : null}

      <section className="panel directionBlendRulePanel">
        <p className="eyebrow">Blend Rules</p>
        <h2>五行関係の判定ルール</h2>
        <div className="directionBlendRuleGrid">
          {Object.values(palaceBlendRules).map((rule) => (
            <article
              className={`directionBlendRuleCard directionBlendTone-${rule.calendarTone}`}
              key={rule.type}
            >
              <span>{rule.type}</span>
              <strong>
                {rule.grade} / {rule.logic}
              </strong>
              <p>{rule.summary}</p>
              <small>{rule.relation}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <p className="eyebrow">Eight Directions</p>
        <h2>八方位の土台</h2>
        <div className="directionPalaceGrid">
          {directionOrder.map((direction) => {
            const palace = directionPalaceMaster[direction];

            return (
              <article className="directionPalaceCard" key={direction}>
                <div>
                  <span>{palace.bagua}宮</span>
                  <strong>{palace.direction}</strong>
                </div>
                <p>
                  {palace.palaceStarName} / {palace.element}
                </p>
                <h3>{palace.theme}</h3>
                <ul>
                  {palace.suitableActions.slice(0, 4).map((action) => (
                    <li key={action}>{action}</li>
                  ))}
                </ul>
                <small>{palace.gentleAdvice}</small>
              </article>
            );
          })}
        </div>
      </section>

      <section className="panel">
        <div className="directionBlendMatrixHeader">
          <div>
            <p className="eyebrow">Matrix</p>
            <h2>八方位 × 九星ブレンド表</h2>
          </div>
          <p>
            セルは「回座星 / 判定 / 行動翻訳」です。凶方位・本命殺・土用殺などは別ロジックで優先し、
            この表は九星方位カレンダーの候補を読解するための意味マスターとして使います。
          </p>
        </div>
        <div className="directionBlendMatrixWrap">
          <table className="directionBlendMatrix">
            <thead>
              <tr>
                <th>方位</th>
                {starOrder.map((starNumber) => {
                  const star = kyuseiStarElementMaster[starNumber];

                  return (
                    <th key={starNumber}>
                      <span>{star.starName}</span>
                      <small>
                        {star.element} / {star.starNumber}
                      </small>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {directionOrder.map((direction) => {
                const palace = directionPalaceMaster[direction];

                return (
                  <tr key={direction}>
                    <th>
                      <strong>
                        {direction} / {palace.bagua}
                      </strong>
                      <small>
                        {palace.element}・{palace.palaceStarName}
                      </small>
                    </th>
                    {starOrder.map((starNumber) => {
                      const blend = getPalaceStarBlend(direction, starNumber);

                      if (!blend) {
                        return <td key={starNumber}>-</td>;
                      }

                      return (
                        <td
                          className={`directionBlendCell directionBlendTone-${blend.calendarTone}`}
                          key={starNumber}
                        >
                          <span>{blend.grade}</span>
                          <strong>{blend.type}</strong>
                          <em>{blend.elementalRelationLabel}</em>
                          <small>{toneLabels[blend.calendarTone]}</small>
                          {blend.benefitTags.length > 0 ? (
                            <div className="directionBlendBenefitTags">
                              {blend.benefitTags.slice(0, 3).map((tag) => (
                                <b
                                  key={`${direction}-${starNumber}-benefit-${tag}`}
                                >
                                  {tag}
                                </b>
                              ))}
                            </div>
                          ) : null}
                          {blend.protectiveTags.length > 0 ? (
                            <div className="directionBlendProtectiveTags">
                              {blend.protectiveTags.slice(0, 3).map((tag) => (
                                <b
                                  key={`${direction}-${starNumber}-protective-${tag}`}
                                >
                                  {tag}
                                </b>
                              ))}
                            </div>
                          ) : null}
                          <div className="directionBlendActionTags">
                            {blend.actionTags.slice(0, 4).map((tag) => (
                              <b key={`${direction}-${starNumber}-${tag}`}>
                                {tag}
                              </b>
                            ))}
                          </div>
                          <p>{blend.benefitText}</p>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
