# Spec: City Goals

Status: **Implemented** (2026-11-21, D-100). User direction: make the game more engaging; give
the player something to aim for at every stage, with rewards that feel earned.

## Why

Stages (docs/specs/evolution.md) say what the city *must* do to grow. Nothing says what a good
mayor *could* do next, so after the tour the player has no short-term aim. Goals are small,
optional targets for each stage. They teach systems the player hasn't touched yet (a town hall,
transit, clean air) and pay out cash and, for some, a landmark before its stage.

## Rules

- Each stage has **four goals**. A stage's goals appear once the city reaches the stage and stay
  until claimed, so a goal skipped at Village can still be done at City.
- Goals are **optional**: stage gates never look at them.
- A goal is **open**, then **ready** (its condition is met), then **claimed** (the player took
  the reward). Ready goals wait for the player; rewards are never lost.
- **Instant goals** complete as soon as the condition holds, after an edit or on a new day
  (placing the third park ticks "A green start" at once).
- **Held goals** need the condition on N days in a row ("80% happy for 30 days"). The count
  rises at the end of each day the condition holds and drops to 0 on a day it doesn't.
- **Rewards:** every goal pays cash; four also unlock a landmark early in cities that lock
  buildings by stage. An earned landmark stays unlocked.
- **Which cities:** new player cities and saved cities. Not `/demo` (a showcase) or tests,
  which build `City` directly with goals off. The harness (`bun run sim:run`) turns them on so
  the bench measures their cost; it never claims, so its runs are unchanged.
- **Saves from before goals:** goals turn on. On the first check, every instant goal the city
  already meets is marked claimed **without** a reward, so an old metropolis isn't flooded with
  claims for things it did long ago. Held goals start counting from that day.

## The goals

| Stage | Goal | Condition | Reward |
|---|---|---|---|
| Hamlet | First residents | 50 residents | $1,000 |
| | Lights on | power and water reach 90% of homes (at least 5 homes) | $1,500 |
| | Seat of government | a working Town Hall | $1,000 |
| | A green start | 3 parks | $500 + **Central Park** early |
| Village | Growing village | 500 residents | $3,000 |
| | Everyone at work | 90% of the workforce employed, 10 days | $2,500 |
| | Happy villagers | 75% happiness, 10 days | $3,000 |
| | Market day | a working Riverside Market | $2,000 |
| Town | Bustling town | 5,000 residents | $8,000 |
| | Moving up | 500 Comfortable residents | $5,000 + **Observation Wheel** early |
| | All aboard | 300 commuters a day by bus or train | $6,000 |
| | Content town | 80% happiness, 30 days | $6,000 + **Theme Park** early |
| City | Big city | 20,000 residents | $15,000 |
| | Prosperity | 1,000 Prosperous residents | $12,000 |
| | Clean air | city AQI 50 or less, 30 days | $10,000 + **Sky Tower** early |
| | Quick commute | average commute 20 min or less with 3,000+ commuters, 15 days | $10,000 |
| Metropolis | Metropolis | 50,000 residents | $40,000 |
| | Brain city | 3 research projects finished | $25,000 |
| | Transit city | 3,000 commuters a day by bus or train | $25,000 |
| | Skyline | a working Sky Tower | $20,000 |

Targets were set against /demo (23,000 people: average commute about 22 min, AQI about 61).
Cash amounts are scaled to building prices (a park $100, a Town Hall $5,000, the Sky Tower
$90,000), so they matter once starting funds are back to a real budget (`BALANCE.startingFunds`
is a testing value today).

## Code

```
sim/goals/catalog.ts   GOALS: id, stage, title, hint, metric, days?, reward (data only)
sim/goals/measure.ts   CityReadings (one pass over the city) and measure(metric) → have, met, detail
sim/goals/state.ts     GoalState on City: on, claimed, ready, streaks; claimGoal(); save helpers
sim/goals/system.ts    GoalSystem: checks instant goals after edits, all goals each day; takeReady()
sim/unlocks.ts         lockOf(city, id): the one place that decides stage, research and goal locks
```

- Metrics are a discriminated union (`residents`, `utilities`, `built`, `employment`,
  `happiness`, `lifestyle`, `riders`, `commute`, `aqi`, `research`), so adding a goal is a data
  change and every metric is measured in one `switch`.
- `GoalSystem` runs last after edits (it reads what the other systems just updated) and at the
  end of each day. Readings are built only when a goal is open: one loop over the buildings.
- `lockOf` replaces `stages.isUnlocked` and the picker's own copy of the rule: the game sends
  each placeable building's lock in `ProgressInfo.locks`, so the picker, the "unlocks at" toast
  and `applyPlace` can't disagree.
- Save: `city.goals = { claimed, ready, streaks }` (ids not in the catalog are dropped). Absent
  in older saves, which triggers the quiet backfill above.

## UI

- **Goals panel** under "Citizens say" (a shared left rail): a header with the count of ready
  goals, then one row per open goal: a progress ring, title, hint, detail ("320 / 500
  residents", "Day 12 of 30"), a meter and the reward. Ready rows lead with a **Claim** button.
  Open or folded is remembered per device; folded by default on small screens, like Citizens.
- **Claiming:** coin sound, the funds count up, a milestone toast ("+$1,500" and the landmark,
  if any), and the row folds away.
- **A goal becomes ready:** a milestone toast ("Goal complete: Lights on. Claim $1,500 in
  Goals") and the header badge pulses until claimed.
- **New stage:** the stage toast adds "New goals to try." The stage menu's checklist is
  unchanged (gates are not goals).
- **Building picker:** a landmark earned early shows as unlocked; a locked landmark that a goal
  can earn says so ("Unlocks at City, or finish Moving up").
