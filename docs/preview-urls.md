# Preview URLs

Last updated: 2026-07-11

Use this file as the regression URL index for Vercel Preview and Production checks.

For Preview review, replace only the host `https://hibi-kippo-app.vercel.app` with the active Vercel Preview host and keep the path/query unchanged unless the test case says otherwise.

These URLs are review entry points. They do not define new expected fortune results or change URL behavior.

Vercel Preview URLs are expected to be publicly viewable for ChatGPT, Gemini, and other external AI review. Codex should provide the full Preview URL for each checked route.

Before sharing a Preview URL:

- Confirm the URL loads in a private/incognito browser window without Vercel login.
- Or run `curl -I "<full-preview-url>"` and confirm `HTTP 200`.
- Confirm the response does not redirect to `https://vercel.com/sso-api...`.

If an external AI fetch tool fails temporarily but the Preview URL returns `HTTP 200` through `curl -I` and loads in an incognito browser, treat it as a public Preview URL and continue with URL-based review rather than screenshots.

## Common Checks

For each URL:

- Page loads without an application error.
- Query parameters remain present after load.
- The visible route and selected controls match the URL as much as current code supports.
- Navigation and existing links do not drop important query context unexpectedly.
- Mobile layout is not visibly broken.
- No private files, environment values, credentials, tokens, build output, or source code are exposed.

## Regression URLs

### 1. purpose-calendar baseline

Purpose:

- Baseline for the main `/purpose-calendar` review flow.
- Covers the current standard yuki_tori review scenario.

Production baseline URL:

```text
https://hibi-kippo-app.vercel.app/purpose-calendar?purpose=yuki_tori&candidateCondition=has_candidate&birthDate=1976-03-19&birthGender=male&companionJudgementMode=standard&familyStars=self&year=2026&month=7&compassOrientation=north-top&keyword=&actionScale=near
```

Preview:

- Replace only `https://hibi-kippo-app.vercel.app` with the active Preview host.

Check:

- `/purpose-calendar` renders the monthly calendar.
- Birth date, gender, family star, action scale, and companion judgement controls remain coherent.
- The page does not lose the provided query parameters.

Related parameters:

- `purpose`, `candidateCondition`, `birthDate`, `birthGender`, `companionJudgementMode`, `familyStars`, `year`, `month`, `compassOrientation`, `keyword`, `actionScale`

Do not break:

- Existing yuki_tori saved URLs.
- `/purpose-calendar` query compatibility.

### 2. purpose=travel

Purpose:

- Compatibility check for existing `purpose=travel` URLs.

Production baseline URL:

```text
https://hibi-kippo-app.vercel.app/purpose-calendar?purpose=travel&candidateCondition=has_candidate&birthDate=1976-03-19&birthGender=male&companionJudgementMode=standard&familyStars=self&year=2026&month=7&compassOrientation=north-top&keyword=&actionScale=near
```

Preview:

- Replace only the host with the active Preview host.

Check:

- Page loads with `purpose=travel`.
- Explicit `purpose=travel` is not overwritten by omitted-purpose migration work.

Related parameters:

- `purpose=travel`

Do not break:

- Backwards compatibility for saved `purpose=travel` URLs.

### 3. purpose=yuki_tori

Purpose:

- Current intended yuki_tori review baseline.

Production baseline URL:

```text
https://hibi-kippo-app.vercel.app/purpose-calendar?purpose=yuki_tori&candidateCondition=has_candidate&birthDate=1976-03-19&birthGender=male&companionJudgementMode=standard&familyStars=self&year=2026&month=7&compassOrientation=north-top&keyword=&actionScale=near
```

Preview:

- Replace only the host with the active Preview host.

Check:

- yuki_tori remains usable.
- Candidate summaries and calendar cells remain readable.

Related parameters:

- `purpose=yuki_tori`

Do not break:

- Explicit yuki_tori URLs.

### 4. candidateCondition=has_candidate

Purpose:

- Check candidate-condition query preservation.

Production baseline URL:

```text
https://hibi-kippo-app.vercel.app/purpose-calendar?purpose=yuki_tori&candidateCondition=has_candidate&birthDate=1976-03-19&birthGender=male&companionJudgementMode=standard&familyStars=self&year=2026&month=7&compassOrientation=north-top&keyword=&actionScale=near
```

Preview:

- Replace only the host with the active Preview host.

Check:

- URL keeps `candidateCondition=has_candidate`.
- Existing behavior remains compatible while `candidateCondition` independence is still `implementation_pending`.

Related parameters:

- `candidateCondition=has_candidate`, `actionScale=near`

Do not break:

- Current compatibility between `candidateCondition` and `actionScale`.

### 5. actionScale=near

Purpose:

- Check near/local action scale.

Production baseline URL:

```text
https://hibi-kippo-app.vercel.app/purpose-calendar?purpose=yuki_tori&candidateCondition=has_candidate&birthDate=1976-03-19&birthGender=male&companionJudgementMode=standard&familyStars=self&year=2026&month=7&compassOrientation=north-top&keyword=&actionScale=near
```

Preview:

- Replace only the host with the active Preview host.

Check:

- Near action scale remains selected or represented according to current UI.

Related parameters:

- `actionScale=near`

Do not break:

- The default near/local review flow.

### 6. actionScale=day_trip

Purpose:

- Check day-trip action scale.

Production baseline URL:

```text
https://hibi-kippo-app.vercel.app/purpose-calendar?purpose=yuki_tori&candidateCondition=has_candidate&birthDate=1976-03-19&birthGender=male&companionJudgementMode=standard&familyStars=self&year=2026&month=7&compassOrientation=north-top&keyword=&actionScale=day_trip
```

Preview:

- Replace only the host with the active Preview host.

Check:

- Day-trip option does not crash or reset unrelated parameters.

Related parameters:

- `actionScale=day_trip`

Do not break:

- Action scale switching and saved URLs.

### 7. actionScale=overnight

Purpose:

- Check overnight action scale.

Production baseline URL:

```text
https://hibi-kippo-app.vercel.app/purpose-calendar?purpose=yuki_tori&candidateCondition=practical&birthDate=1976-03-19&birthGender=male&companionJudgementMode=standard&familyStars=self&year=2026&month=7&compassOrientation=north-top&keyword=&actionScale=overnight
```

Preview:

- Replace only the host with the active Preview host.

Check:

- Overnight option remains usable.
- Current relationship between `actionScale=overnight` and practical candidate condition is not accidentally broken.

Related parameters:

- `actionScale=overnight`, `candidateCondition=practical`

Do not break:

- Existing action-scale-derived candidate behavior before the planned migration.

### 8. actionScale=base

Purpose:

- Check long-term/base action scale.

Production baseline URL:

```text
https://hibi-kippo-app.vercel.app/purpose-calendar?purpose=yuki_tori&candidateCondition=long_term&birthDate=1976-03-19&birthGender=male&companionJudgementMode=standard&familyStars=self&year=2026&month=7&compassOrientation=north-top&keyword=&actionScale=base
```

Preview:

- Replace only the host with the active Preview host.

Check:

- Base/long-term mode remains reachable and readable.

Related parameters:

- `actionScale=base`, `candidateCondition=long_term`

Do not break:

- Long-term/base saved URLs.

### 9. actionScale=hour_precision

Purpose:

- Check special time / hour precision action scale.

Production baseline URL:

```text
https://hibi-kippo-app.vercel.app/purpose-calendar?purpose=yuki_tori&candidateCondition=strong&birthDate=1976-03-19&birthGender=male&companionJudgementMode=standard&familyStars=self&year=2026&month=7&compassOrientation=north-top&keyword=&actionScale=hour_precision
```

Preview:

- Replace only the host with the active Preview host.

Check:

- Hour-precision flow remains reachable.
- Hour-board related UI does not break when visible.

Related parameters:

- `actionScale=hour_precision`, `candidateCondition=strong`

Do not break:

- Special-time review URLs.

### 10. companionJudgementMode=strict

Purpose:

- Check strict companion mode.

Production baseline URL:

```text
https://hibi-kippo-app.vercel.app/purpose-calendar?purpose=yuki_tori&candidateCondition=has_candidate&birthDate=1976-03-19&birthGender=male&companionJudgementMode=strict&familyStars=self&year=2026&month=7&compassOrientation=north-top&keyword=&actionScale=near
```

Preview:

- Replace only the host with the active Preview host.

Check:

- Strict mode is preserved in the URL and UI.

Related parameters:

- `companionJudgementMode=strict`

Do not break:

- Existing strict-mode saved URLs.
- Provisional companion-mode behavior without explicit source confirmation.

### 11. companionJudgementMode=standard

Purpose:

- Check standard companion mode.

Production baseline URL:

```text
https://hibi-kippo-app.vercel.app/purpose-calendar?purpose=yuki_tori&candidateCondition=has_candidate&birthDate=1976-03-19&birthGender=male&companionJudgementMode=standard&familyStars=self&year=2026&month=7&compassOrientation=north-top&keyword=&actionScale=near
```

Preview:

- Replace only the host with the active Preview host.

Check:

- Standard mode remains the normal review path.

Related parameters:

- `companionJudgementMode=standard`

Do not break:

- Standard/default companion checking.

### 12. companionJudgementMode=loose

Purpose:

- Check loose companion mode.

Production baseline URL:

```text
https://hibi-kippo-app.vercel.app/purpose-calendar?purpose=yuki_tori&candidateCondition=has_candidate&birthDate=1976-03-19&birthGender=male&companionJudgementMode=loose&familyStars=self&year=2026&month=7&compassOrientation=north-top&keyword=&actionScale=near
```

Preview:

- Replace only the host with the active Preview host.

Check:

- Loose mode is preserved and does not reset unrelated query parameters.

Related parameters:

- `companionJudgementMode=loose`

Do not break:

- Existing loose-mode saved URLs.
- Provisional companion-mode behavior without explicit source confirmation.

### 13. familyStars=self

Purpose:

- Check self-only family/companion selection.

Production baseline URL:

```text
https://hibi-kippo-app.vercel.app/purpose-calendar?purpose=yuki_tori&candidateCondition=has_candidate&birthDate=1976-03-19&birthGender=male&companionJudgementMode=standard&familyStars=self&year=2026&month=7&compassOrientation=north-top&keyword=&actionScale=near
```

Preview:

- Replace only the host with the active Preview host.

Check:

- `self` works when `birthDate` is present.

Related parameters:

- `familyStars=self`, `birthDate`

Do not break:

- Self-derived personal context.

### 14. familyStars direct stars

Purpose:

- Check direct star selection without relying only on `self`.

Production baseline URL:

```text
https://hibi-kippo-app.vercel.app/purpose-calendar?purpose=yuki_tori&candidateCondition=has_candidate&birthDate=1976-03-19&birthGender=male&companionJudgementMode=standard&familyStars=star-1,star-6&year=2026&month=7&compassOrientation=north-top&keyword=&actionScale=near
```

Preview:

- Replace only the host with the active Preview host.

Check:

- Direct stars such as `star-1` and `star-6` are accepted.
- Companion check UI remains readable.

Related parameters:

- `familyStars=star-1,star-6`

Do not break:

- Direct companion star selection.

### 15. selectedDate present

Purpose:

- Check selected-date top board behavior inside the visible month.

Production baseline URL:

```text
https://hibi-kippo-app.vercel.app/purpose-calendar?purpose=yuki_tori&candidateCondition=has_candidate&birthDate=1976-03-19&birthGender=male&companionJudgementMode=standard&familyStars=self&year=2026&month=10&compassOrientation=north-top&keyword=&actionScale=near&selectedDate=2026-10-02
```

Preview:

- Replace only the host with the active Preview host.

Check:

- Visible month is 2026-10.
- Selected display date is 2026-10-02 according to current code behavior.
- Year/month/day boards update for the selected date without changing URL semantics.

Related parameters:

- `selectedDate`, `year`, `month`

Do not break:

- Saved URLs with selected dates.
- Selected-date behavior around month view.

### 16. Different birthDate

Purpose:

- Check that another birth date does not break personal context rendering.

Production baseline URL:

```text
https://hibi-kippo-app.vercel.app/purpose-calendar?purpose=yuki_tori&candidateCondition=has_candidate&birthDate=1984-02-04&birthGender=female&companionJudgementMode=standard&familyStars=self&year=2026&month=7&compassOrientation=north-top&keyword=&actionScale=near
```

Preview:

- Replace only the host with the active Preview host.

Check:

- Alternate `birthDate` and `birthGender=female` load without error.
- Do not assert final fortune meaning unless expected values are source-confirmed.

Related parameters:

- `birthDate`, `birthGender`, `familyStars=self`

Do not break:

- Birth-date based personal context.

TODO:

- Add source-confirmed expected values for this sample before using it as a calculation assertion.

### 17. compassOrientation=north-top

Purpose:

- Check north-top board orientation.

Production baseline URL:

```text
https://hibi-kippo-app.vercel.app/purpose-calendar?purpose=yuki_tori&candidateCondition=has_candidate&birthDate=1976-03-19&birthGender=male&companionJudgementMode=standard&familyStars=self&year=2026&month=7&compassOrientation=north-top&keyword=&actionScale=near
```

Preview:

- Replace only the host with the active Preview host.

Check:

- North-top orientation remains selected or represented.

Related parameters:

- `compassOrientation=north-top`

Do not break:

- Default board orientation.

### 18. compassOrientation=south-top

Purpose:

- Check south-top board orientation.

Production baseline URL:

```text
https://hibi-kippo-app.vercel.app/purpose-calendar?purpose=yuki_tori&candidateCondition=has_candidate&birthDate=1976-03-19&birthGender=male&companionJudgementMode=standard&familyStars=self&year=2026&month=7&compassOrientation=south-top&keyword=&actionScale=near
```

Preview:

- Replace only the host with the active Preview host.

Check:

- South-top orientation remains reachable.
- Board labels remain readable.

Related parameters:

- `compassOrientation=south-top`

Do not break:

- Orientation query compatibility.

### 19. sanmeigaku birthDate

Purpose:

- Check 算命学 page with a birth date.

Production baseline URL:

```text
https://hibi-kippo-app.vercel.app/sanmeigaku?birthDate=1976-03-19
```

Preview:

- Replace only the host with the active Preview host.

Check:

- `/sanmeigaku` loads.
- Birth date value is reflected.
- 陰占 / 陽占 sections do not error.

Related parameters:

- `birthDate`

Do not break:

- Existing 算命学 saved URLs.

### 20. calendar-db representative

Purpose:

- Check calendar DB route availability.

Production baseline URL:

```text
https://hibi-kippo-app.vercel.app/calendar-db
```

Preview:

- Replace only the host with the active Preview host.

Check:

- `/calendar-db` loads.
- Search/filter UI does not error.

Related parameters:

- TODO: complete representative query parameters after `/calendar-db` parameter table is finalized in `docs/url-parameters.md`.

Do not break:

- Calendar DB inspection route.

### 21. calendar-notes representative

Purpose:

- Check term index and representative term page route.

Production baseline URLs:

```text
https://hibi-kippo-app.vercel.app/calendar-notes
https://hibi-kippo-app.vercel.app/calendar-notes/kyusei/%E4%B8%80%E7%99%BD%E6%B0%B4%E6%98%9F
```

Preview:

- Replace only the host with the active Preview host.

Check:

- `/calendar-notes` index loads.
- Representative term detail page loads.

Related parameters:

- Route segments: `kind`, `name`

Do not break:

- Term index and detail links from calendar pages.

TODO:

- Add representative URLs for selected-days, rokuyo, junichoku, nijuhachishuku, direction-deities, nacchin, and kuubou if those areas are changed.

### 22. adoption-status

Purpose:

- Check adoption and verification status route.

Production baseline URL:

```text
https://hibi-kippo-app.vercel.app/adoption-status
```

Preview:

- Replace only the host with the active Preview host.

Check:

- `/adoption-status` loads.
- Status anchors and verification references remain accessible.

Related parameters:

- None currently required for baseline.

Do not break:

- Verification/status review route.

### 23. direction-palace-blends

Purpose:

- Check 方位ブレンド master route.

Production baseline URL:

```text
https://hibi-kippo-app.vercel.app/direction-palace-blends
```

Preview:

- Replace only the host with the active Preview host.

Check:

- `/direction-palace-blends` loads.
- Master content remains readable.

Related parameters:

- None currently required for baseline.

Do not break:

- 方位ブレンド reference route.

## TODO URL Additions

- Source-confirmed boundary samples for 節入り, 立春, 土用, and year/month/day board switching.
- `/calendar-db` representative query URL after its parameter table is completed.
- Additional `/calendar-notes` detail URLs for each term category affected by a change.
- Empty-state `/sanmeigaku` URL if the empty birth-date flow changes.

## Review Notes

- Do not treat these URLs as official calculation expected values unless the relevant docs mark the expected result as source-confirmed.
- For fortune/calendar logic changes, pair at least one ordinary date URL with one source-confirmed boundary date URL.
- Record active Preview URLs and results in `docs/ai-handoff.md`.
