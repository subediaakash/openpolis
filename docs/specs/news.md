# Spec: Citizen Stories and the City Newspaper

Status: **Implemented** (2026-11-21, D-102). User direction: make the game more engaging, and
make the "living city" pitch (D-079) something a player can feel today, before AI agents land.

## Why

The city already *does* a lot: it climbs stages, meets goals, catches fire, jams at rush hour,
opens hospitals. But it reports all of that as one-line toasts that fade. Nothing gives the
city a voice or a memory, and its people are numbers ("21 / 24 residents"). A newspaper turns
what happened into a story worth reading; named residents give each home a face.

## The Courier

- A **newspaper button** next to the alerts bell (wide and phone top bars) opens **The
  {City} Courier**: a masthead with the city name and today's date, the **lead story**, then
  earlier stories, newest first. A dot on the button means unread stories; opening the paper
  marks them read.
- Each story has a **section** (Milestone, Trouble, City life, Week in review), a headline,
  a short body, sometimes a **quote from a named resident**, and a **Show** link when it is
  about a place.
- Stories come from what the city really did (below). The paper keeps the latest 40. It is
  written while you play and is **not saved**: a reopened city starts with a "welcome back"
  front page drawn from its current state (no save-format change for presentation).
- The paper never toasts: toasts already cover the urgent things. It is the calm, longer read.

### What makes the news

| Story | When | Section |
|---|---|---|
| A new city is founded / welcome back | the paper opens | City life |
| A new stage ("Openpolis is now a Town") | stage reached | Milestone |
| Population milestones (500, 1k, 2.5k, 5k, 10k, 20k, 30k, 50k, 100k) | crossed upward | Milestone |
| A goal completed | goal ready | Milestone |
| Research finished; homes become Comfortable / Prosperous | as they happen | Milestone |
| A landmark or major service opens (hospital, university, station, Sky Tower …) | placed | City life |
| A fire breaks out / is put out / burns a building down | incident events | Trouble |
| Brownout | the hour it happens (at most one story a day) | Trouble |
| Gridlock (jammed road tiles 40% above last week and at least 20) | daily check, at most weekly | Trouble |
| Smog (city AQI 150 or more) | daily check, at most monthly | Trouble |
| Monthly budget | month end | City life |
| Week in review: residents gained or lost, mood, top complaint as a resident's quote | every 7 days | Week in review |

Headlines vary (a few templates per story, picked by a seeded roll), so the paper doesn't
read like a log.

## Named residents

- A home's info panel lists **who lives here**: up to three residents, each with a **name**,
  **age**, **what they do** (works in a shop, an office or industry, studies, is retired, or
  is looking for work), the home's **commute**, and a **line in their own words** (pleased
  when the home is happy, else the home's complaint).
- Everything is derived, never stored: names and ages come from a seeded hash of the city
  seed, building id and resident slot, so the same home always has the same people; what they
  do follows the city's jobs and unemployment. Names are made from original syllables (no
  real-person name lists).
- The paper quotes these same residents, so a name in a story can be found on the map.

## Code

```
game/news/people.ts    residentsOf(): names, ages, roles and mood lines (pure, seeded)
game/news/newsroom.ts  Newsroom: facts in, stories out (pure, testable); templates and throttles
app/hud/NewsButton.tsx the button, unread dot and the newspaper popover
```

`Game` reports facts to its `Newsroom` at the points it already handles them (milestones,
goals, incidents, placement, brownouts, the day) and emits `news`; the HUD mirrors it in
`newsAtom`. The sim is untouched.
