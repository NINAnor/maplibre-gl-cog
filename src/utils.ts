import { GeoTIFFImage } from 'geotiff';

/**
 * transform x/y/z to webmercator-bbox
 * @param x
 * @param y
 * @param z
 * @returns {number[]} [minx, miny, maxx, maxy]
 */
function merc(x: number, y: number, z: number): number[] {
  // Source: https://qiita.com/MALORGIS/items/1a9114dd090e5b891bf7
  const GEO_R = 6378137;
  const orgX = -1 * ((2 * GEO_R * Math.PI) / 2);
  const orgY = (2 * GEO_R * Math.PI) / 2;
  const unit = (2 * GEO_R * Math.PI) / Math.pow(2, z);
  const minx = orgX + x * unit;
  const maxx = orgX + (x + 1) * unit;
  const miny = orgY - (y + 1) * unit;
  const maxy = orgY - y * unit;
  return [minx, miny, maxx, maxy];
}

// source: https://gist.github.com/craigsc/fdb867f8971ff5b4ae42de4e0d7c229e
const meters2Degrees = function (x: number, y: number): number[] {
  let lon = (x * 180) / 20037508.34;
  let lat = (Math.atan(Math.exp((y * Math.PI) / 20037508.34)) * 360) / Math.PI - 90;
  return [lon, lat];
};

// source: https://gist.github.com/craigsc/fdb867f8971ff5b4ae42de4e0d7c229e
const bboxMeters2Degrees = function (bbox: number[]): number[] {
  let swLatLng = meters2Degrees(bbox[0], bbox[1]);
  let neLatLng = meters2Degrees(bbox[2], bbox[3]);
  return [swLatLng[0], swLatLng[1], neLatLng[0], neLatLng[1]];
};

// source: https://gist.github.com/craigsc/fdb867f8971ff5b4ae42de4e0d7c229e
export const getBboxInWebMercator = async function (firstTile: GeoTIFFImage): Promise<number[]> {
  const bbox = firstTile.getBoundingBox();
  return bboxMeters2Degrees(bbox);
};

export function toUrlAndBBox(url: string): [string, number[]] {
  const re = new RegExp(/(.+)\/(\d+)\/(\d+)\/(\d+)/);
  const result = url.match(re);

  if (!result) {
    throw Error(`unable to get url from ${url}`);
  }

  let bbox = merc(Number(result[3]), Number(result[4]), Number(result[2]));

  return [result[1], bbox];
}
