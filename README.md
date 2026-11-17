# Manhattan

**[▶ Launch the model](https://shanem73.github.io/Manhattan/)**

A georeferenced, see-through 3D model of the Midtown Manhattan skyline, from 30th Street to Central Park and from the Hudson to the East River. It runs in the browser with three.js; nothing to install.

## What is in it

- **42 landmark sites at true height on the real street grid**: Empire State, Chrysler, One Vanderbilt, Grand Central, Rockefeller Center, Seagram, Citigroup Center, Hearst Tower, the UN, Hudson Yards, Billionaires' Row and more, each with its designers, materials and a short history.
- **Look inside.** Cut any landmark open or X-ray it to see floor slabs, cores, moving elevators, columns and named spaces. *X-ray city* and *Slice city* do the same for the whole model at once.
- **Time.** A time-of-day slider for sunset and night lighting, and a year slider from 1890 to 2026 that grows the skyline and brings back four demolished buildings, including the 1910 Pennsylvania Station.
- **Landscape.** Both rivers, the Hudson piers, Central Park, Roosevelt Island, the Queensboro Bridge and a distant downtown skyline, among several thousand generated context buildings.
- **Georeferenced.** Every landmark has a WGS84 position; the cursor reads out latitude and longitude.
- **English or Chinese.** The page opens in English; the 中文 button in the top bar switches the whole interface and every building's history to Chinese, and remembers the choice.

## Georeferenced data

The [`data/`](data/) folder holds exports for use in a map or 3D engine. See [`data/README.md`](data/README.md) for conventions and a MapLibre snippet.

| File | Contents |
|---|---|
| [`data/midtown_landmarks.geojson`](data/midtown_landmarks.geojson) | One polygon per building part with `base_height` and `height` (metres), WGS84 |
| [`data/midtown_vanished_buildings.geojson`](data/midtown_vanished_buildings.geojson) | The four demolished buildings |
| [`data/midtown_landmarks.glb`](data/midtown_landmarks.glb) | All standing landmarks, textured; +X east, +Y up, −Z true north; origin at Fifth Avenue and 34th Street |
| [`data/glb/`](data/glb/) | One model per building, with anchor coordinates in `manifest.json` |

## What is real and what is not

- **Real:** heights, completion dates, designers, street positions and the facts in each history.
- **Approximate:** footprints, setback levels and crowns. Positions come from the street grid, not survey data; against published coordinates for 15 buildings they are off by about 30 m on average and 58 m at worst.
- **Schematic:** all interiors. Floor levels follow the real floor count and height; core, column and elevator layouts are illustrative, not surveyed floor plans.
- **Generated:** the context buildings are stand-ins, not real addresses, and are not exported. Facade materials are painted procedurally, not photographs.

## Run locally

The page uses ES modules, so serve the folder rather than opening the file:

```
python3 -m http.server 8000
```

Then open <http://localhost:8000/>.

| File | Role |
|---|---|
| `index.html` | Page and interface |
| `app.js` | Scene, landscape, interiors, see-through modes, export |
| `buildings.js` | Landmark definitions and histories |
| `zh.js` | Chinese interface text and building histories |
| `tex.js` | Procedural facade materials |
| `core.js` | Street grid, WGS84 transform, geometry helpers |

## Sources

CTBUH Skyscraper Center, Wikipedia building articles and its list of tallest buildings in New York City, NYC Landmarks Preservation Commission reports, KPF and Skyscraper Museum publications.
