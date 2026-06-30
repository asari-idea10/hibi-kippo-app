const baseUrl = process.env.HIBI_KIPPO_BASE_URL ?? "http://127.0.0.1:3000";

const dates = [
  "2026-06-03",
  "2026-06-04",
  "2026-06-06",
  "2026-06-10",
  "2026-06-13",
  "2026-06-19",
  "2026-06-21",
  "2026-06-26",
  "2026-07-02",
  "2026-07-07",
  "2026-07-15",
];

const primaryStar = "6";
const companionStars = ["1", "3"];
const purpose = "yuki_tori";
const scenarios = [
  { id: "self", label: "本人のみ", stars: [primaryStar], mode: "standard" },
  {
    id: "strict",
    label: "厳格（全員に吉）",
    stars: [primaryStar, ...companionStars],
    mode: "strict",
  },
  {
    id: "standard",
    label: "標準（本人は吉・同行者は凶回避）",
    stars: [primaryStar, ...companionStars],
    mode: "standard",
  },
  {
    id: "loose",
    label: "ゆるめ（同行者は強い凶だけ除外）",
    stars: [primaryStar, ...companionStars],
    mode: "loose",
  },
];

const directionOrder = [
  "北",
  "北東",
  "東",
  "南東",
  "南",
  "南西",
  "西",
  "北西",
];

const boardKeysByLabel = {
  年: "year",
  月: "month",
  日: "day",
  年盤: "year",
  月盤: "month",
  日盤: "day",
};

const requiredBoards = ["month", "day"];
const strictRequiredBoards = ["year", "month", "day"];

const oppositeDirections = {
  北: "南",
  北東: "南西",
  東: "西",
  南東: "北西",
  南: "北",
  南西: "北東",
  西: "東",
  北西: "南東",
};

const favorableLabels = new Set(["最大吉方候補", "吉方候補", "比和"]);

const compatibilityLabels = {
  1: { 1: "中立", 2: "相剋注意", 3: "吉方候補", 4: "吉方候補", 5: "相剋注意", 6: "最大吉方候補", 7: "最大吉方候補", 8: "相剋注意", 9: "相剋注意" },
  2: { 1: "相剋注意", 2: "中立", 3: "相剋注意", 4: "相剋注意", 5: "比和", 6: "吉方候補", 7: "吉方候補", 8: "比和", 9: "最大吉方候補" },
  3: { 1: "最大吉方候補", 2: "相剋注意", 3: "中立", 4: "比和", 5: "相剋注意", 6: "相剋注意", 7: "相剋注意", 8: "相剋注意", 9: "吉方候補" },
  4: { 1: "最大吉方候補", 2: "相剋注意", 3: "比和", 4: "中立", 5: "相剋注意", 6: "相剋注意", 7: "相剋注意", 8: "相剋注意", 9: "吉方候補" },
  5: { 1: "相剋注意", 2: "比和", 3: "相剋注意", 4: "相剋注意", 5: "中立", 6: "吉方候補", 7: "吉方候補", 8: "比和", 9: "最大吉方候補" },
  6: { 1: "吉方候補", 2: "最大吉方候補", 3: "相剋注意", 4: "相剋注意", 5: "最大吉方候補", 6: "中立", 7: "比和", 8: "最大吉方候補", 9: "相剋注意" },
  7: { 1: "吉方候補", 2: "最大吉方候補", 3: "相剋注意", 4: "相剋注意", 5: "最大吉方候補", 6: "比和", 7: "中立", 8: "最大吉方候補", 9: "相剋注意" },
  8: { 1: "相剋注意", 2: "比和", 3: "相剋注意", 4: "相剋注意", 5: "比和", 6: "吉方候補", 7: "吉方候補", 8: "中立", 9: "最大吉方候補" },
  9: { 1: "相剋注意", 2: "吉方候補", 3: "最大吉方候補", 4: "最大吉方候補", 5: "吉方候補", 6: "相剋注意", 7: "相剋注意", 8: "吉方候補", 9: "中立" },
};

const standardBlockingKeywords = [
  "暗剣殺",
  "五黄殺",
  "破",
  "本命殺",
  "的殺",
  "土用殺",
  "凶方位優先",
];

const looseBlockingKeywords = [
  "暗剣殺",
  "五黄殺",
  "破",
  "土用殺",
  "凶方位優先",
];

async function fetchJson(path) {
  const url = `${baseUrl}${path}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}: ${url}`);
  }

  return response.json();
}

function groupPurposeTags(row) {
  const grouped = new Map();

  row.purposeTags.forEach((tag) => {
    const [boardLabel, direction] = tag.split(" ");
    const board = boardKeysByLabel[boardLabel];

    if (!board || !direction) {
      return;
    }

    const entry = grouped.get(direction) ?? new Set();
    entry.add(board);
    grouped.set(direction, entry);
  });

  return grouped;
}

function hasRequiredBoards(boards, required) {
  return required.every((board) => boards.has(board));
}

function hasBlocking(row, direction, boards, keywords) {
  const values = row.directionBoardValues?.[direction];

  if (!values) {
    return true;
  }

  return boards.some((board) =>
    keywords.some((keyword) => values[board]?.includes(keyword)),
  );
}

function getFamilyTags(rowsByStar, mode, stars, required = requiredBoards) {
  const primaryRow = rowsByStar.get(primaryStar);
  const primaryTags = primaryRow ? groupPurposeTags(primaryRow) : new Map();

  return directionOrder.flatMap((direction) => {
    const primaryBoards = primaryTags.get(direction);

    if (!primaryBoards || !hasRequiredBoards(primaryBoards, required)) {
      return [];
    }

    if (mode === "strict") {
      const allMemberBoards = stars.map((star) => {
        const row = rowsByStar.get(star);
        const boards = row ? groupPurposeTags(row).get(direction) : null;

        return boards && hasRequiredBoards(boards, required) ? boards : null;
      });

      if (allMemberBoards.some((boards) => !boards)) {
        return [];
      }

      return [{ direction, boards: required, source: "all-members-good" }];
    }

    const companionRows = stars.slice(1).map((star) => rowsByStar.get(star));
    const keywords =
      mode === "loose" ? looseBlockingKeywords : standardBlockingKeywords;
    const blocked = companionRows.some((row) =>
      row ? hasBlocking(row, direction, required, keywords) : true,
    );

    if (blocked) {
      return [];
    }

    return [{ direction, boards: required, source: "primary-good-companion-safe" }];
  });
}

function getHourGoodItems(hourBoard, stars, mode) {
  if (stars.length === 0) {
    return [];
  }

  const primary = stars[0];
  const personalBlocks = stars.map((star) => {
    const honmeiDirection =
      directionOrder.find(
        (direction) => String(hourBoard.directions[direction]?.star ?? "") === star,
      ) ?? null;

    return {
      star,
      honmeiDirection,
      tekiDirection: honmeiDirection ? oppositeDirections[honmeiDirection] : null,
    };
  });

  return directionOrder.flatMap((direction) => {
    const state = hourBoard.directions[direction];

    if (!state || state.warningLabel) {
      return [];
    }

    const blockTargets =
      mode === "loose"
        ? personalBlocks.filter((member) => member.star === primary)
        : personalBlocks;
    const blocked = blockTargets.some(
      (member) =>
        member.honmeiDirection === direction ||
        member.tekiDirection === direction,
    );

    if (blocked) {
      return [];
    }

    const compatibilityTargets =
      mode === "strict"
        ? personalBlocks
        : personalBlocks.filter((member) => member.star === primary);
    const labels = compatibilityTargets.map(
      (member) => compatibilityLabels[member.star]?.[String(state.star)] ?? null,
    );

    if (
      labels.length === 0 ||
      labels.some((label) => !label || !favorableLabels.has(label))
    ) {
      return [];
    }

    return [{ direction, star: state.star, labels }];
  });
}

function summarizeFourBoard(hourBoards, familyTags, stars, mode) {
  const targetDirections = new Set(
    familyTags
      .filter((tag) => hasRequiredBoards(new Set(tag.boards), strictRequiredBoards))
      .map((tag) => tag.direction),
  );

  if (targetDirections.size === 0) {
    return [];
  }

  return hourBoards.flatMap((hourBoard) =>
    getHourGoodItems(hourBoard, stars, mode)
      .filter((item) => targetDirections.has(item.direction))
      .map((item) => ({
        branch: hourBoard.branch,
        time: hourBoard.timeRange.label,
        direction: item.direction,
        star: item.star,
      })),
  );
}

async function getRowsByStar(date) {
  const rowsByStar = new Map();

  for (const star of Array.from(new Set([primaryStar, ...companionStars]))) {
    const data = await fetchJson(
      `/api/calendar-db?start=${date}&end=${date}&view=kyusei&honmeiStar=${star}&purpose=${purpose}&limit=1`,
    );
    rowsByStar.set(star, data.rows[0]);
  }

  return rowsByStar;
}

function formatList(list, empty = "-") {
  return list.length > 0 ? list.join(" / ") : empty;
}

async function main() {
  console.log(`時盤候補検証: ${new Date().toISOString()}`);
  console.log(`API: ${baseUrl}`);
  console.log(`本人: ${primaryStar} / 同行者: ${companionStars.join(", ")} / 目的: ${purpose}`);
  console.log("");

  for (const date of dates) {
    const rowsByStar = await getRowsByStar(date);
    const hourData = await fetchJson(`/api/hour-board?date=${date}`);
    const primaryRow = rowsByStar.get(primaryStar);
    const dayLabel = primaryRow?.values?.西暦 ?? date;
    const dayKyusei = `${hourData.dayKyusei} / ${hourData.ton}`;

    console.log(`## ${dayLabel}`);
    console.log(`日九星: ${dayKyusei}`);

    for (const scenario of scenarios) {
      const { mode, stars } = scenario;
      const familyTags = getFamilyTags(rowsByStar, mode, stars, requiredBoards);
      const strictFamilyTags = getFamilyTags(
        rowsByStar,
        mode,
        stars,
        strictRequiredBoards,
      );
      const hourCounts = hourData.hourBoards.map((hourBoard) => ({
        branch: hourBoard.branch,
        time: hourBoard.timeRange.label,
        items: getHourGoodItems(hourBoard, stars, mode),
      }));
      const fourBoard = summarizeFourBoard(
        hourData.hourBoards,
        strictFamilyTags,
        stars,
        mode,
      );

      const tagSummary = familyTags.map((tag) => tag.direction);
      const strictTagSummary = strictFamilyTags.map((tag) => tag.direction);
      const totalHourGood = hourCounts.reduce(
        (sum, entry) => sum + entry.items.length,
        0,
      );
      const bestHours = hourCounts
        .filter((entry) => entry.items.length > 0)
        .slice(0, 4)
        .map(
          (entry) =>
            `${entry.branch} ${entry.time}: ${entry.items
              .map((item) => `${item.direction}[${item.star}]`)
              .join(", ")}`,
        );

      console.log(`- ${scenario.label}`);
      console.log(`  月日候補: ${formatList(tagSummary)}`);
      console.log(`  年月日候補: ${formatList(strictTagSummary)}`);
      console.log(`  時盤吉方の総数: ${totalHourGood}`);
      console.log(`  時盤例: ${formatList(bestHours)}`);
      console.log(
        `  四盤一致: ${formatList(
          fourBoard.map(
            (item) => `${item.branch} ${item.time} ${item.direction}[${item.star}]`,
          ),
        )}`,
      );
    }

    console.log("");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
