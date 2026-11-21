# Spec: Citizen Stories and the City Newspaper

Status: **Implemented** (2026-11-21, D-111). Roadmap H3.

The city's numbers become people: every home has named residents, real events become one-line stories, and once a month the city's own newspaper sums up what changed.

## Residents (`src/sim/stories/people.ts`)

- Each home shows up to three residents (fewer if fewer live there, none when it is empty). They come from a hash of the city seed, the home and a slot, so the same home always has the same people. Nothing is tracked one by one or saved.
- A resident has a name (from original, varied name lists), an age and a job. The first is a working adult; others may be students (under 22) or retired (67 and over).
- A job names a real workplace within 18 tiles of the home, chosen by jobs (a 400-job office tower employs more neighbours than a corner shop). The role fits the place (police officer at the Police Station, nurse at the Clinic, office roles in towers) and the household's lifestyle (Basic homes hold entry-level roles, Prosperous ones senior roles).
- Shown in a home's info panel under **Who lives here**.

## Stories (`src/sim/stories/stories.ts`, `StorySystem`)

Each day, after the other systems, the story system compares every home with the day before:

| Kind | When |
|---|---|
| moved-in | an empty home gets residents |
| moved-up | a household's lifestyle rises |
| robbed | a home is newly burgled (incidents) |
| sick | someone falls newly ill (incidents) |
| left | a home is abandoned |
| opened | a park, service or transport building opens; told by the nearest resident |
| life | a quiet day: one everyday moment from a home, about a need it is well off for or badly lacks |

- At most two stories a day, the most interesting kinds first. Wording varies with the day, so stories don't repeat word for word. An everyday story is never about the same need two days running.
- The feed keeps the 30 newest. **Around town** in Citizens say shows the latest four, each with Show me.
- Stories read the city but never change it or use its random streams. Nothing is saved: a loaded city starts a fresh feed. Cost on /demo: about 0.06 ms a day.

## The newspaper

On the last day of each month the system writes an edition, named after the city ("The Demo City Herald"):

- **Headline**, the month's biggest change, in order: a new stage; a notable building opened (cost $3,000 or more); population up 5% or more, or down 3% or more; happiness up or down 3 points or more; otherwise a busy or quiet month.
- **Lead**: population with the month's change, happiness and the share of the workforce out of work.
- **This month**: up to four of the month's event stories (everyday moments when there were none).
- **Letters**: a resident of the home losing the most happiness quotes that need's complaint ("The commute is terrible."), with Show me.

A toast says the paper is out, and the newspaper button in the top bar shows a dot until it is opened. On phones held upright the paper opens across the screen under the top bar.
