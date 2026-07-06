import type { DirectionCompassOrientation } from "@/components/direction-compass";
import { getDirectionDeityShortLabel } from "@/lib/direction-deity-labels";
import type { DirectionDeityEntry } from "@/lib/direction-deities";
import {
  directionMountains,
  type DirectionMountain,
} from "@/lib/direction-mountains";

type DirectionMountainRingProps = {
  entries: DirectionDeityEntry[];
  centerLabel: string;
  title: string;
  orientation?: DirectionCompassOrientation;
  focusMountains?: DirectionMountainRingFocus[];
  natalMountains?: DirectionMountainRingNatal[];
  tendoTriangles?: DirectionMountainRingTendoTriangle[];
  voidMountains?: DirectionMountainRingVoid[];
};

export type DirectionMountainRingFocus = {
  label: string;
  mountain: DirectionMountain | null;
  tone: "stem" | "branch";
};

export type DirectionMountainRingVoid = {
  label: string;
  mountain: DirectionMountain;
  title: string;
};

export type DirectionMountainRingNatal = {
  label: string;
  mountain: DirectionMountain | null;
  pillar: "year" | "month" | "day";
  title: string;
};

export type DirectionMountainRingTendoTriangle = {
  activeMountain: DirectionMountain | null;
  effectLabel: string;
  label: string;
  mountains: DirectionMountain[];
  tone: "water" | "metal" | "fire" | "wood";
  title: string;
};

function getPoint(degree: number, radius: number) {
  const radian = (degree * Math.PI) / 180;

  return {
    x: 50 + Math.sin(radian) * radius,
    y: 50 - Math.cos(radian) * radius,
  };
}

function getVisualDegree(
  degree: number,
  orientation: DirectionCompassOrientation,
) {
  return orientation === "south-top" ? (degree + 180) % 360 : degree;
}

function getEntryTone(entries: DirectionDeityEntry[]) {
  if (entries.some((entry) => entry.category === "凶神")) {
    return "block";
  }

  if (entries.some((entry) => entry.category === "注意")) {
    return "caution";
  }

  if (entries.some((entry) => entry.category === "吉神")) {
    return "good";
  }

  if (entries.some((entry) => entry.category === "吉凶")) {
    return "mixed";
  }

  return "neutral";
}

function getEntryTitle(mountain: DirectionMountain, entries: DirectionDeityEntry[]) {
  if (entries.length === 0) {
    return mountain;
  }

  return [
    mountain,
    ...entries.map((entry) => `${entry.name}（${entry.category} / ${entry.basis}）`),
  ].join(" / ");
}

function getDirectionDeityDictionaryHref(name: string) {
  return `/calendar-notes/direction-deities/${encodeURIComponent(name)}`;
}

function getDirectionDeityStatusHref(name: string) {
  return name === "天道"
    ? "/adoption-status#term-status-tendo"
    : "/adoption-status#term-status-direction-deities";
}

export function DirectionMountainRing({
  entries,
  centerLabel,
  title,
  orientation = "north-top",
  focusMountains = [],
  natalMountains = [],
  tendoTriangles = [],
  voidMountains = [],
}: DirectionMountainRingProps) {
  const entriesByMountain = new Map<DirectionMountain, DirectionDeityEntry[]>();
  const centerEntries = entries.filter((entry) => entry.mountains.length === 0);
  const focusByMountain = new Map<DirectionMountain, DirectionMountainRingFocus[]>();
  const natalByMountain = new Map<DirectionMountain, DirectionMountainRingNatal[]>();
  const tendoByMountain = new Map<DirectionMountain, DirectionMountainRingTendoTriangle[]>();
  const voidByMountain = new Map<DirectionMountain, DirectionMountainRingVoid[]>();
  const centerFocus = focusMountains.filter((focus) => !focus.mountain);
  const centerNatal = natalMountains.filter((natal) => !natal.mountain);
  const uniqueEntries = Array.from(
    new Map(entries.map((entry) => [entry.name, entry])).values(),
  );

  for (const entry of entries) {
    for (const mountain of entry.mountains) {
      const next = entriesByMountain.get(mountain) ?? [];
      next.push(entry);
      entriesByMountain.set(mountain, next);
    }
  }

  for (const focus of focusMountains) {
    if (!focus.mountain) {
      continue;
    }

    const next = focusByMountain.get(focus.mountain) ?? [];
    next.push(focus);
    focusByMountain.set(focus.mountain, next);
  }

  for (const natal of natalMountains) {
    if (!natal.mountain) {
      continue;
    }

    const next = natalByMountain.get(natal.mountain) ?? [];
    next.push(natal);
    natalByMountain.set(natal.mountain, next);
  }

  for (const triangle of tendoTriangles) {
    for (const mountain of triangle.mountains) {
      const next = tendoByMountain.get(mountain) ?? [];
      next.push(triangle);
      tendoByMountain.set(mountain, next);
    }
  }

  for (const voidEntry of voidMountains) {
    const next = voidByMountain.get(voidEntry.mountain) ?? [];
    next.push(voidEntry);
    voidByMountain.set(voidEntry.mountain, next);
  }

  return (
    <div
      className={`directionMountainRing directionMountainRing-${orientation}`}
      title={title}
    >
      <svg
        aria-label={title}
        className="directionMountainRingSvg"
        role="img"
        viewBox="-12 -12 124 124"
      >
        <circle className="directionMountainRingOuter" cx="50" cy="50" r="45" />
        <circle className="directionMountainRingMiddle" cx="50" cy="50" r="35" />
        <circle className="directionMountainRingInner" cx="50" cy="50" r="21" />
        {tendoTriangles.map((triangle) => {
          const points = triangle.mountains
            .map((mountainName) =>
              directionMountains.find(
                (mountain) => mountain.mountain === mountainName,
              ),
            )
            .filter(
              (
                mountain,
              ): mountain is (typeof directionMountains)[number] =>
                Boolean(mountain),
            )
            .map((mountain) =>
              getPoint(getVisualDegree(mountain.centerDegree, orientation), 38.8),
            );

          if (points.length < 3) {
            return null;
          }

          return (
            <polygon
              className={`directionMountainRingTendoTriangle directionMountainRingTendoTriangle-${triangle.tone}`}
              key={`${triangle.label}-${triangle.mountains.join("-")}`}
              points={points.map((point) => `${point.x},${point.y}`).join(" ")}
            >
              <title>{triangle.title}</title>
            </polygon>
          );
        })}
        {directionMountains.map((mountain) => {
          const visualDegree = getVisualDegree(mountain.centerDegree, orientation);
          const tickOuter = getPoint(visualDegree, 45);
          const tickInner = getPoint(visualDegree, 36.5);
          const labelPoint = getPoint(visualDegree, 41);
          const deityPoint = getPoint(visualDegree, 29.8);
          const focusPoint = getPoint(visualDegree, 49.5);
          const natalPoint = getPoint(visualDegree, 57.2);
          const mountainEntries = entriesByMountain.get(mountain.mountain) ?? [];
          const focusEntries = focusByMountain.get(mountain.mountain) ?? [];
          const natalEntries = natalByMountain.get(mountain.mountain) ?? [];
          const tendoEntries = tendoByMountain.get(mountain.mountain) ?? [];
          const voidEntries = voidByMountain.get(mountain.mountain) ?? [];
          const tone = getEntryTone(mountainEntries);
          const visibleDeityEntries = mountainEntries.slice(0, 2);
          const hasMoreDeities =
            mountainEntries.length > visibleDeityEntries.length;

          return (
            <g
              className={`directionMountainRingMountain directionMountainRingMountain-${tone}`}
              key={mountain.mountain}
            >
              <title>{getEntryTitle(mountain.mountain, mountainEntries)}</title>
              <line
                className="directionMountainRingTick"
                x1={tickInner.x}
                x2={tickOuter.x}
                y1={tickInner.y}
                y2={tickOuter.y}
              />
              {tendoEntries.length > 0 ? (
                <g
                  className={`directionMountainRingTendo ${
                    tendoEntries.some(
                      (triangle) => triangle.activeMountain === mountain.mountain,
                    )
                      ? "directionMountainRingTendo-active"
                      : ""
                  } directionMountainRingTendo-${tendoEntries[0]?.tone ?? "wood"}`}
                >
                  <title>
                    {tendoEntries.map((entry) => entry.title).join(" / ")}
                  </title>
                  <circle cx={labelPoint.x} cy={labelPoint.y} r="5.15" />
                </g>
              ) : null}
              <text
                className={`directionMountainRingMountainText directionMountainRingMountainText-${mountain.kind}`}
                x={labelPoint.x}
                y={labelPoint.y}
              >
                {mountain.mountain}
              </text>
              {voidEntries.length > 0 ? (
                <g className="directionMountainRingVoid">
                  <title>
                    {voidEntries.map((voidEntry) => voidEntry.title).join(" / ")}
                  </title>
                  <circle cx={labelPoint.x} cy={labelPoint.y} r="4.4" />
                </g>
              ) : null}
              {visibleDeityEntries.map((deityEntry, index) => (
                <a
                  href={getDirectionDeityDictionaryHref(deityEntry.name)}
                  key={`${mountain.mountain}-${deityEntry.code}`}
                  rel="noreferrer"
                  target="_blank"
                >
                  <title>{`${deityEntry.name}の説明を開く`}</title>
                  <text
                    className="directionMountainRingDeityText directionMountainRingDeityText-link"
                    x={deityPoint.x}
                    y={
                      deityPoint.y +
                      (index - (visibleDeityEntries.length - 1) / 2) * 4.25
                    }
                  >
                    {getDirectionDeityShortLabel(deityEntry)}
                  </text>
                </a>
              ))}
              {hasMoreDeities ? (
                <text
                  className="directionMountainRingDeityText directionMountainRingDeityText-more"
                  x={deityPoint.x}
                  y={deityPoint.y + (visibleDeityEntries.length + 0.25) * 3.4}
                >
                  …
                </text>
              ) : null}
              {focusEntries.map((focus, index) => (
                <g
                  className={`directionMountainRingFocus directionMountainRingFocus-${focus.tone}`}
                  key={`${mountain.mountain}-${focus.label}-${focus.tone}`}
                  transform={`translate(${index * 5 - (focusEntries.length - 1) * 2.5} 0)`}
                >
                  <circle
                    className="directionMountainRingMarkerHalo directionMountainRingMarkerHalo-focus"
                    cx={focusPoint.x}
                    cy={focusPoint.y}
                    r="5.9"
                  />
                  <circle cx={focusPoint.x} cy={focusPoint.y} r="4.4" />
                  <text x={focusPoint.x} y={focusPoint.y}>
                    {focus.label}
                  </text>
                </g>
              ))}
              {natalEntries.map((natal, index) => (
                <g
                  className={`directionMountainRingNatal directionMountainRingNatal-${natal.pillar}`}
                  key={`${mountain.mountain}-${natal.label}-${natal.pillar}`}
                  transform={`translate(${index * 5.6 - (natalEntries.length - 1) * 2.8} 0)`}
                >
                  <title>{natal.title}</title>
                  <circle
                    className="directionMountainRingMarkerHalo directionMountainRingMarkerHalo-natal"
                    cx={natalPoint.x}
                    cy={natalPoint.y}
                    r="4.9"
                  />
                  <circle cx={natalPoint.x} cy={natalPoint.y} r="3.55" />
                  <text x={natalPoint.x} y={natalPoint.y}>
                    {natal.label}
                  </text>
                </g>
              ))}
            </g>
          );
        })}
        <text className="directionMountainRingCenterLabel" x="50" y="48">
          {centerLabel}
        </text>
        <text className="directionMountainRingCenterValue" x="50" y="57">
          {centerEntries.length > 0
            ? centerEntries.map(getDirectionDeityShortLabel).join("")
            : "神盤"}
        </text>
        {centerFocus.length > 0 ? (
          <text className="directionMountainRingCenterFocus" x="50" y="66">
            {centerFocus.map((focus) => focus.label).join("・")}
          </text>
        ) : null}
        {centerNatal.length > 0 ? (
          <text className="directionMountainRingCenterNatal" x="50" y="73">
            {centerNatal.map((natal) => natal.label).join("・")}
          </text>
        ) : null}
      </svg>
      {uniqueEntries.length > 0 ? (
        <div className="directionMountainRingEvidence" aria-label={`${title}の根拠確認`}>
          <span>根拠確認</span>
          {uniqueEntries.map((entry) => (
            <a
              href={getDirectionDeityDictionaryHref(entry.name)}
              key={entry.name}
              rel="noreferrer"
              target="_blank"
              title={`${entry.name} / ${entry.category} / ${entry.basis}`}
            >
              {entry.name}
            </a>
          ))}
          <a
            className="directionMountainRingStatusLink"
            href={getDirectionDeityStatusHref(
              uniqueEntries.some((entry) => entry.name === "天道")
                ? "天道"
                : uniqueEntries[0]?.name ?? "",
            )}
            rel="noreferrer"
            target="_blank"
          >
            採用状態
          </a>
        </div>
      ) : null}
    </div>
  );
}
