# Maplibre-gl-cog

**ARCHIVED**: use (titiler)[https://developmentseed.org/titiler/] instead


This library aims to provide maplibre support for Cloud Optimized GEOTiff

**NOTES**: The library requires that the GEOTiff has 4 bands (RGBA) and the values of each band is the range 0-255

## Dependencies
- GEOTiff.js
- fast-png

## Maplibre support
The library provides support up to maplibre 3.x.

### How to use it
In the map style prepend `cog://` to the url of the resource, for example: `cog://http://my-server.com/path/to/cloud-optimized-geotiff.tif`.
**NOTE**: also relative paths are supported (`cog://cloud-optimized-geotiff.tif`) 

Vanilla JS
```html
<link rel='stylesheet' href='https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.css' />
<script src='https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.js'></script>
<script src='maplibre-gl-cog.js'></script>
<script>
    const protocol = new maplibreglCOG.ProtocolV3();
    maplibregl.addProtocol('cog', protocol.tile);

    const map = new maplibregl.Map({
        container: 'map',
        style: 'style.json'
    });
</script>
```

ES6
```js
import { ProtocolV3 } from 'maplibre-gl-cog';
const protocol = new maplibreCOG.ProtocolV3();
maplibregl.addProtocol('cog', protocol.tile);
```

### How to generate a valid geotiff
Here is an example script that turns a grayscale single band GEOTiff into a RGBA compatible COG

```bash
export MASK=$(mktemp .cog.XXXXXXX.tif -p .)
export NORMALIZED=$(mktemp .cog.XXXXXXX.tif -p .)
export RGBA=$(mktemp .cog.XXXXXXX.tif -p .)

gdal_translate -scale 0 1 255 255 $1 $MASK   # turns any value into 255 to create a mask
gdal_translate -scale 0 1 0 255 $1 $NORMALIZED   # rescale the values to 0-255
gdal_merge.py -separate -o $RGBA -of GTiff $NORMALIZED $NORMALIZED $NORMALIZED $MASK  # creates 3 bands + mask
gdal_translate $RGBA $2 -of COG -co TARGET_SRS=EPSG:3857 -co ADD_ALPHA=NO -co COMPRESS=LZW -co LEVEL=9   # generate the COG
rm $MASK $NORMALIZED $RGBA;
```
