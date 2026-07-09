# Preview URLs

Last updated: 2026-07-09

Use this file as the regression URL index for Vercel Preview and Production checks.

For Preview review, replace `https://hibi-kippo-app.vercel.app` with the active Vercel Preview host and keep the path/query unchanged unless the test case says otherwise.

## Production Baseline

### purpose-calendar / yuki_tori / has_candidate / 1976-03-19

```text
https://hibi-kippo-app.vercel.app/purpose-calendar?purpose=yuki_tori&candidateCondition=has_candidate&birthDate=1976-03-19&birthGender=male&companionJudgementMode=standard&familyStars=self&year=2026&month=7&compassOrientation=north-top&keyword=&actionScale=near
```

Purpose:

- Baseline for `/purpose-calendar`.
- Covers `purpose=yuki_tori`, `candidateCondition=has_candidate`, `birthDate`, `birthGender`, `companionJudgementMode=standard`, `familyStars=self`, `actionScale=near`, and visible month.

## Regression URL Slots

| Area | Status | URL / notes |
| --- | --- | --- |
| `purpose=travel` | TODO | Add a compatibility baseline for existing travel URLs. |
| `purpose=yuki_tori` | Seeded | Use the Production baseline above. |
| `candidateCondition=has_candidate` | Seeded | Use the Production baseline above. |
| `actionScale=near` | Seeded | Use the Production baseline above. |
| `companionJudgementMode=strict` | TODO | Add a URL that differs only by `companionJudgementMode=strict`. |
| `companionJudgementMode=standard` | Seeded | Use the Production baseline above. |
| `companionJudgementMode=loose` | TODO | Add a URL that differs only by `companionJudgementMode=loose`. |
| `selectedDate` present | TODO | Add a URL with `selectedDate=YYYY-MM-DD`, preferably a known boundary or candidate date. |
| Different `birthDate` | TODO | Add at least one alternate birth-date sample after expected profile values are confirmed. |
| Different `familyStars` | TODO | Add a URL with direct stars such as `familyStars=self,star-1`. |
| `/sanmeigaku` | TODO | Add baseline URL for empty birth date and one URL with `birthDate=1976-03-19`. |
| `/calendar-db` | TODO | Add baseline search URL after parameter table is completed. |
| `/calendar-notes` | TODO | Add index URL and representative detail URL. |

## Review Notes

- Do not treat TODO URLs as official regression expectations until they are filled and reviewed.
- For fortune/calendar logic changes, pair at least one ordinary date URL with one boundary date URL.
- Record active Preview URLs and results in `docs/ai-handoff.md`.
