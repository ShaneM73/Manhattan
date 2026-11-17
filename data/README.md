# Midtown Manhattan landmarks: georeferenced export

Exported from the interactive model. 42 landmark sites (46 including four demolished buildings).

## Files

| File | What it is |
|---|---|
| `midtown_landmarks.geojson` | One Point per landmark (attributes, history-free) plus one Polygon per building part with `base_height` and `height` in metres. WGS84 lon/lat (EPSG:4326). |
| `midtown_vanished_buildings.geojson` | Same structure for the four demolished buildings, with `year_demolished`. |
| `midtown_landmarks.glb` | All standing landmarks in one textured glTF 2.0 binary. |
| `glb/<id>.glb` + `glb/manifest.json` | One model per building, with its anchor longitude and latitude in the manifest. |

## Coordinate conventions

- **GeoJSON**: longitude, latitude. Heights are metres above local ground; ground elevation is not included (Midtown is roughly 10 to 25 m above sea level), so clamp to terrain.
- **GLB**: metres. **+X = true east, +Y = up, -Z = true north.** No extensions required; texture scaling is baked into the UVs.
  - `midtown_landmarks.glb` origin: Fifth Avenue at 34th Street, **40.74845 N, 73.98455 W**, ground level.
  - `glb/<id>.glb` origin: the `lon`/`lat` listed for that id in `manifest.json`.
- The street grid is modelled 29 degrees clockwise from true north; that rotation is already applied in the GLB files.

## Accuracy

Positions are derived from the street grid, not from survey data. Against published coordinates for 15 of the buildings they are off by about 30 m on average and 58 m at worst. Heights and completion dates are public record. Footprints, setback levels and crowns are approximations, and spires or ornaments built from non-prism shapes are in the GLB but not in the GeoJSON.

The context buildings in the interactive model are procedurally generated stand-ins and are deliberately **not** exported. On a real basemap, use the map's own building layer for context.

## MapLibre GL JS / Mapbox GL JS

```js
map.addSource('midtown', { type: 'geojson', data: 'midtown_landmarks.geojson' });
map.addLayer({
  id: 'midtown-3d', type: 'fill-extrusion', source: 'midtown',
  filter: ['==', ['get', 'kind'], 'part'],
  paint: {
    'fill-extrusion-color': '#d8c9a8',
    'fill-extrusion-base': ['get', 'base_height'],
    'fill-extrusion-height': ['get', 'height']
  }
});
```

Tapered parts (`"tapered": true`) are exported with their lower outline, so they extrude as straight prisms. Use the GLB where the taper matters.

## deck.gl, CesiumJS, three.js

Place a GLB at its anchor and leave rotation at zero if the engine's local frame is east-north-up with Y up for glTF (deck.gl `ScenegraphLayer` with `_lighting: 'pbr'`, Cesium `Model` with `Transforms.eastNorthUpToFixedFrame`). If a model appears turned by 90 or 180 degrees, the engine uses a different forward axis for glTF; apply that fixed yaw once for all files.

## QGIS / ArcGIS

Load the GeoJSON, filter `kind = 'part'`, and in the 3D view set extrusion to `height - base_height` with altitude offset `base_height`.
