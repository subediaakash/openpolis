# Spec: The /demo City

Status: **Implemented** (2026-11-01).

`http://localhost:5173/demo` opens a planned, fully grown city right away. `/demo?seed=N` gives another one, and the same seed always gives the same city. `N` in the demo rolls a new seed. **New city** returns to the New Game screen.

## How it's built (`src/sim/demo.ts`, pure sim, tested in `tests/demo.test.ts`; D-106)

1. **Map:** River Valley, 128×128, with the given seed.
2. **Block grid:** 10×10 blocks of 5×5 round the map centre (streets every 6 tiles). Blocks with fewer than 8 buildable tiles (mostly river) stay wild and get no streets of their own.
3. **Roads:** tree-lined avenues on the frame, the two central axes (promenade paving) and the ring round downtown; streets elsewhere (setts downtown). Each line is planned as whole runs so river crossings become straight bridges. Between two blocks of houses, every other north–south street is a green lane of parks instead.
4. **Districts (no randomness):** density follows the river.
   - Waterfront blocks (touching water): towers and offices, with every shore tile a park (the promenade).
   - Within 7 tiles of water and round the core: apartments. Inland: houses, with a lattice of park blocks.
   - Civic core: town hall in a green square with a central park and a garden; campus (hospital, university). Sky Tower and Theme Park inland; Sail Hotel, Observation Wheel and Riverside Market on the waterfront blocks nearest the centre. Three park quarters.
   - Services by pattern: a services block every third block (bus station, school, recycling, police, clinic, fire, shops); local centres on a knight's-move lattice (police, school, clinic, fire and two rows of shops); a bus station in any block not already within reach of a station. A building whose planned tile is river slides to free land in its block.
   - Industry and gas power in the south-east corner behind a belt of offices.
5. **Growth:** 640 days of normal growth at 3 growth steps a day. Every 5 days, any road island short of power or water gets a gas plant or tower: in a utility-block slot if one is free on that island, otherwise beside the buildings that need it.
6. **Build-out:** every lot growth hasn't reached is built out to its zone. Free 2×2 squares mostly become top-level buildings; the rest become the zone's 1×1 buildings. Utilities are topped up until everyone is supplied, then 40 more days are simulated so people move in.

Result for seed 42: about 21,000–23,000 residents, 96% happy, AQI about 40, all powered and watered. `bun scripts/demo-report.ts --seed N` prints population, happiness and what holds it back.
