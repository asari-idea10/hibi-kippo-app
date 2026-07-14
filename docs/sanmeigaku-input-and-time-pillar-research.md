# Sanmeigaku Input and Time Pillar Research

Last updated: 2026-07-14

This document is a design and research ledger for future `/sanmeigaku` input expansion. It does not define new fortune-telling rules and does not describe implemented URL or calculation behavior unless explicitly marked as current.

## Current State

### Read From Current Code

- `/sanmeigaku` currently accepts only `birthDate`.
- `birthDate` is read from the query string and passed to `getSanmeigakuProfile(birthDate)`.
- Existing `birthDate`-only URLs must remain valid.
- The page displays year, month, and day pillars from the shared calendar DB.
- The time pillar exists in the profile shape as a placeholder with `pending_time_pillar`.
- Birth time, birth time unknown, Sanmeigaku-specific gender, birth place, timezone, true solar time correction, time-pillar calculation, and daiun calculation are not implemented.
- `/purpose-calendar` has an existing `birthGender=male|female` query and UI, but its current fallback normalizes unspecified values to `male`.
- Step 1-2 common-master research from user-provided 『改訂版 平成萬年暦』 material is documented in `docs/mannenreki-common-master-research.md`. It is a comparison ledger, not an implemented Sanmeigaku rule source.

### Guardrails

- Do not infer time-pillar, true-solar-time, daiun, or gender rules from general knowledge.
- Do not infer Sanmeigaku rules directly from Shichu Suimei-style tables in `docs/mannenreki-common-master-research.md`.
- Do not automatically apply the `/purpose-calendar` `male` fallback to Sanmeigaku daiun design.
- Keep calculation, dashboard, and animation layers separate.
- Animation must consume calculation results; it must not own calculation rules.

## Input Model V0

This is a future design model only. Do not add it to source code until URL and calculation behavior are separately approved.

```ts
type SanmeigakuBirthGender = "male" | "female" | "unspecified";

type SanmeigakuProfileInputV0 = {
  birthDate: string;
  birthTime?: string;
  birthTimeUnknown: boolean;
  birthGender: SanmeigakuBirthGender;
  birthPlace?: {
    label?: string;
    timezone?: string;
    latitude?: number;
    longitude?: number;
  };
};
```

### Design Direction

- `birthDate` keeps the existing meaning and existing URL compatibility.
- `birthDate`-only URLs continue to render the current year, month, and day pillar result.
- `birthTime` is optional.
- `birthTimeUnknown=true` means the time pillar must not be treated as confirmed.
- For Sanmeigaku, unspecified gender must not be silently normalized to `male`.
- Birth place is reserved for a later location-correction phase.
- Timezone, longitude correction, and true-solar-time correction must not be silently used in calculation before source review.

## URL Candidates

These are candidates, not implemented URL specifications.

| Candidate parameter | Status | Notes |
| --- | --- | --- |
| `birthDate` | implemented | Existing `YYYY-MM-DD` parameter. Do not change its meaning. |
| `birthTime` | candidate | Candidate format: `HH:mm`. Needs source and UX review before calculation use. |
| `birthTimeUnknown` | candidate | Value format is undecided. Could be omitted, `on`, or `true`; decide before implementation. |
| `birthGender` | candidate for `/sanmeigaku` | Values may be `male`, `female`, `unspecified`. Decide whether `unspecified` is explicit or omission. |
| `birthPlace` | later candidate | Avoid URL exposure until place search/storage design exists. |
| `timezone` | later candidate | Avoid silent default use before timezone policy is confirmed. |

Compatibility rules:

- Do not break `/sanmeigaku?birthDate=YYYY-MM-DD`.
- Missing future parameters must preserve current output.
- URL behavior must be documented in `docs/url-parameters.md` before implementation.
- Source-dependent calculation behavior must be confirmed before parameters affect pillars, daiun, or dashboard outputs.

## Layer Separation

### 1. Input Layer

- Birth date.
- Future birth time.
- Future birth time unknown flag.
- Future Sanmeigaku gender value.
- Future birth place and timezone fields.

### 2. Calculation Layer

- Existing year, month, and day pillars.
- Future true-solar-time correction.
- Future time pillar.
- Existing inzen and yosen chart calculation.
- Future daiun, yearly fortune, monthly fortune, and daily fortune.

### 3. Dashboard View-Model Layer

- Chart summary.
- Inzen and yosen result blocks.
- Energy and strength labels.
- Future daiun / nenun timeline blocks.
- Warning, unknown, and source status messages.

### 4. Animation Presentation Layer

- Spiral paths.
- Star / stem / branch tokens.
- Landing into the yosen chart.
- `full`, `short`, and `none` modes.
- `prefers-reduced-motion` behavior.

Design principle: the animation presentation layer must receive already-computed tokens and destinations. It must not calculate pillars, stars, daiun, or source status.

## Time Pillar and True Solar Time Research Ledger

All items in this section are `source_review_required`.

| Topic | Current state | Needed sources | Candidate adoption | Alternate methods | Verification sample | Final decision |
| --- | --- | --- | --- | --- | --- | --- |
| Time-pillar calculation method | Placeholder only | Specialist Sanmeigaku sources and calculation examples | TBD | Multiple school differences possible | Standard timed births | TODO |
| Time-branch ranges | Not implemented | Source explaining 12 two-hour branches | TBD | Civil time vs corrected time | 12 branch boundary samples | TODO |
| 子刻 handling | Not implemented | Source explaining late-night date boundary | TBD | 23:00 day boundary vs 0:00 day boundary | 22:59 / 23:00 / 23:01 | TODO |
| 23:00 vs 0:00 day boundary | Not implemented | Source comparison and examples | TBD | Use current civil date until reviewed | 23:59 / 0:00 / 0:01 | TODO |
| True solar time adoption | Not implemented | Sanmeigaku or classical calculation source | TBD | Civil time only, local mean time only, true solar time | Same birth with/without correction | TODO |
| Standard time to local time correction | Not implemented | Astronomy/time correction references | TBD | Timezone-only correction | Longitude edge cases | TODO |
| Equation of time | Not implemented | Astronomical source and formula | TBD | Omit until advanced phase | Seasonal samples | TODO |
| Birth longitude | Not implemented | Place/longitude source | TBD | Manual longitude entry, city lookup | Multiple Japan longitudes | TODO |
| Solar-term boundary for year/month pillar | Daily DB exists; timed boundary not connected | Solar-term time source and fortune rule source | TBD | Date-only calendar value | Setsuiri just before/after | TODO |
| Japan daylight saving time | Not implemented | Historical DST source and rule | TBD | Manual review for affected years | 1948-1951 Japan samples | TODO |
| Overseas birth | Not implemented | Timezone and place policy sources | TBD | Japan-only v0 | Overseas city samples | TODO |
| Unknown birth time | Placeholder behavior exists | Product/source policy | TBD | Hide time pillar, estimate, or show unknown state | Unknown-time samples | TODO |

## Daiun Research Ledger

All items in this section are `source_review_required`.

| Topic | Current state | Needed sources | Candidate adoption | Alternate methods | Verification sample | Final decision |
| --- | --- | --- | --- | --- | --- | --- |
| Forward / reverse direction | Not implemented | Sanmeigaku daiun rule source | TBD | School differences possible | Male/female examples | TODO |
| Relation to gender | Not implemented | Daiun source confirming gender use | TBD | Gender + stem yin/yang, other variants | Matched pair samples | TODO |
| Relation to stem yin/yang | Not implemented | Source defining which stem is used | TBD | Year stem, day stem, other basis | Contrasting yin/yang samples | TODO |
| Daiun start age | Not implemented | Formula source and examples | TBD | Different conversion ratios | Known expected examples | TODO |
| Days to solar term | Not implemented | Rule for previous/next solar term | TBD | Previous term, next term, nearest term | Setsuiri boundary cases | TODO |
| Date-to-year conversion | Not implemented | Source for days-to-years conversion | TBD | 3 days = 1 year or other formulas | Several month offsets | TODO |
| Rounding | Not implemented | Source for fractional handling | TBD | Floor, round, ceil, month precision | Fractional samples | TODO |
| Counted age vs full age | Not implemented | Source and product policy | TBD | Both display modes | Age display samples | TODO |
| Daiun stem/branch progression | Not implemented | Source and expected sequence | TBD | Forward/reverse from month pillar variants | 10-period examples | TODO |
| First period display | Not implemented | UI/source policy | TBD | Age range, start date, both | Initial-period examples | TODO |
| School differences | Not documented | Multiple source comparison | TBD | One adopted rule plus comparison notes | Cross-source samples | TODO |

## Regression Sample Design

This is a future test data shape only.

```ts
type SanmeigakuTimePillarRegressionSample = {
  id: string;
  birthDate: string;
  birthTime: string | null;
  birthTimeUnknown: boolean;
  birthPlace: string | null;
  timezone: string | null;
  longitude: number | null;
  sourceLabels: string[];
  expectedCorrectedDateTime?: string;
  expectedFortuneDate?: string;
  expectedTimeBranch?: string;
  expectedTimePillar?: string;
  expectedYearPillar?: string;
  expectedMonthPillar?: string;
  expectedDayPillar?: string;
  status: "confirmed" | "provisional" | "source_review_required";
  notes: string;
};
```

Minimum sample count: 20. Ideal sample count: 40-60.

Sample categories:

- Normal birth times.
- `22:59`, `23:00`, and `23:01`.
- `23:59`, `0:00`, and `0:01`.
- Just before and after solar-term entry.
- Japan daylight-saving-time years.
- Overseas births.
- Unknown birth time.
- Existing fixed samples such as `1976-03-19` and `2008-12-28`.

## Animation Technology Comparison

This section is conceptual only.

| Option | Useful for | Risks |
| --- | --- | --- |
| CSS | Small transitions, reveal states, chip movement | Weak for complex spiral paths and many tokens. |
| SVG | Orbit lines, symbolic paths, readable vector tokens | Can become hard to manage when heavily animated. |
| Canvas | Spiral calculation theater, many particles/tokens | Needs separate semantic DOM for accessibility. |
| WebGL / Three.js | Rich 3D or immersive scenes | Higher mobile performance cost and implementation complexity. |

Future implementation should begin with a small CSS/SVG prototype, then compare Canvas if spiral motion becomes central to the product experience. WebGL should wait until the dashboard model is stable.

## Phase Plan

| Phase | Scope | Implementation status |
| --- | --- | --- |
| 0 | Source research for time pillar, true solar time, daiun, and gender rules | Not started |
| 1 | Docs-only input model and research ledger | This document |
| 2 | Form UI for birth time, unknown time, and Sanmeigaku gender without calculation use | Not started |
| 3 | True-solar-time correction spec and regression samples | Not started |
| 4 | Time-pillar calculation with confirmed expected values | Not started |
| 5 | Daiun calculation with confirmed expected values | Not started |
| 6 | Fate dashboard view-model and UI | Not started |
| 7 | Calculation animation presentation layer | Not started |
