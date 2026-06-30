export type DirectionCompassOrientation = "north-top" | "south-top";

export type DirectionCompassDirection =
  | "北"
  | "北東"
  | "東"
  | "南東"
  | "南"
  | "南西"
  | "西"
  | "北西";

export type DirectionCompassState = {
  direction: DirectionCompassDirection;
  starNumber?: string | null;
  warning?: boolean;
  warningLabel?: string | null;
  warningCodes?: string[];
  candidate?: boolean;
  strong?: boolean;
  overlapLevel?: 0 | 1 | 2 | 3;
  tendo?: boolean;
};

type DirectionCompassProps = {
  states: DirectionCompassState[];
  orientation?: DirectionCompassOrientation;
  centerLabel?: string;
  centerValue?: string | null;
  title?: string;
  getPointHref?: (state: DirectionCompassState) => string | null;
  openLinksInNewTab?: boolean;
};

const directionOrder: DirectionCompassDirection[] = [
  "北",
  "北東",
  "東",
  "南東",
  "南",
  "南西",
  "西",
  "北西",
];

const basePositions: Record<DirectionCompassDirection, { x: number; y: number }> =
  {
    北: { x: 50, y: 13 },
    北東: { x: 76, y: 24 },
    東: { x: 87, y: 50 },
    南東: { x: 76, y: 76 },
    南: { x: 50, y: 87 },
    南西: { x: 24, y: 76 },
    西: { x: 13, y: 50 },
    北西: { x: 24, y: 24 },
  };

function getPosition(
  direction: DirectionCompassDirection,
  orientation: DirectionCompassOrientation,
) {
  const position = basePositions[direction];

  if (orientation === "south-top") {
    return {
      x: 100 - position.x,
      y: 100 - position.y,
    };
  }

  return position;
}

function getStateTone(state: DirectionCompassState | undefined) {
  if (!state) {
    return "neutral";
  }

  if (state.warning) {
    return "warning";
  }

  if (state.strong) {
    return "strong";
  }

  if (state.candidate) {
    return "candidate";
  }

  if (state.tendo) {
    return "tendo";
  }

  return "neutral";
}

function getDirectionTitle(state: DirectionCompassState | undefined) {
  if (!state) {
    return "";
  }

  const details = [
    state.direction,
    state.starNumber ? state.starNumber : null,
    state.warning ? (state.warningLabel ?? "移動注意") : null,
    state.overlapLevel === 3
      ? "年・月・日一致"
      : state.overlapLevel === 2
        ? "月・日一致"
        : state.strong
          ? "強い候補"
          : null,
    state.candidate ? "吉方候補" : null,
    state.tendo ? "天道" : null,
  ].filter(Boolean);

  return details.join(" / ");
}

export function DirectionCompass({
  states,
  orientation = "north-top",
  centerLabel = "日盤",
  centerValue = null,
  title = "方位盤",
  getPointHref,
  openLinksInNewTab = false,
}: DirectionCompassProps) {
  const stateByDirection = new Map(
    states.map((state) => [state.direction, state]),
  );

  return (
    <div
      className={`directionCompass directionCompass-${orientation}`}
      aria-label={`${title}（${orientation === "north-top" ? "北上" : "南上"}）`}
      title={title}
    >
      <svg
        className="directionCompassSvg"
        role="img"
        viewBox="0 0 100 100"
      >
        <polygon
          className="directionCompassFrame"
          points="50,5 82,18 95,50 82,82 50,95 18,82 5,50 18,18"
        />
        {directionOrder.map((direction) => {
          const position = getPosition(direction, orientation);
          return (
            <line
              className="directionCompassRay"
              key={`ray-${direction}`}
              x1="50"
              y1="50"
              x2={position.x}
              y2={position.y}
            />
          );
        })}
        <circle className="directionCompassCenter" cx="50" cy="50" r="13" />
        <text
          className="directionCompassCenterText"
          x="50"
          y={centerValue ? "48.4" : "53"}
        >
          {centerLabel}
        </text>
        {centerValue ? (
          <text className="directionCompassCenterValue" x="50" y="58">
            {centerValue}
          </text>
        ) : null}
        {directionOrder.map((direction) => {
          const state = stateByDirection.get(direction);
          const position = getPosition(direction, orientation);
          const tone = getStateTone(state);
          const href = state && getPointHref ? getPointHref(state) : null;

          const point = (
            <g
              className={`directionCompassPoint directionCompassPoint-${tone}`}
            >
              <title>{getDirectionTitle(state) || direction}</title>
              <circle cx={position.x} cy={position.y} r="12.2" />
              {state?.overlapLevel && state.overlapLevel >= 2 ? (
                <circle
                  className="directionCompassStrongRing"
                  cx={position.x}
                  cy={position.y}
                  r="9.6"
                />
              ) : null}
              {state?.overlapLevel === 3 ? (
                <circle
                  className="directionCompassStrongRing directionCompassStrongRing-inner"
                  cx={position.x}
                  cy={position.y}
                  r="7.2"
                />
              ) : null}
              <text
                className="directionCompassDirectionText"
                x={position.x}
                y={position.y - (state?.starNumber ? 7 : -1)}
              >
                {direction}
              </text>
              {state?.starNumber ? (
                <text
                  className="directionCompassStarText"
                  x={position.x}
                  y={position.y + 2.8}
                >
                  {state.starNumber}
                </text>
              ) : null}
              {state?.warningCodes?.length ? (
                <text
                  className="directionCompassWarningText"
                  x={position.x}
                  y={position.y + 11.4}
                >
                  {state.warningCodes.join("")}
                </text>
              ) : null}
            </g>
          );

          if (!href || !state?.starNumber) {
            return <g key={direction}>{point}</g>;
          }

          return (
            <a
              aria-label={`${getDirectionTitle(state) || direction} の象意を見る`}
              className="directionCompassPointLink"
              href={href}
              key={direction}
              rel={openLinksInNewTab ? "noreferrer" : undefined}
              target={openLinksInNewTab ? "_blank" : undefined}
            >
              {point}
            </a>
          );
        })}
      </svg>
    </div>
  );
}
