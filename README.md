# Maplibre-gl-cog

This library aims to provide maplibre support for Cloud Optimized GEOTiff

**NOTES**: The library requires that the GEOTiff has 4 bands (RGBA) and the values of each band is the range 0-255

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
