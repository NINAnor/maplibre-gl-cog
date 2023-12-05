import { Pool, ReadRasterResult } from 'geotiff';
import { encode } from 'fast-png';
import { COG } from './cog';
import { toUrlAndBBox } from './utils';

// copied from MapLibre /util/ajax.ts
type RequestParameters = {
  url: string;
  headers?: any;
  method?: 'GET' | 'POST' | 'PUT';
  body?: string;
  type?: 'string' | 'json' | 'arrayBuffer' | 'image';
  credentials?: 'same-origin' | 'include';
  collectResourceTiming?: boolean;
};

type ResponseCallback = (
  error?: Error | null,
  data?: any | null,
  cacheControl?: string | null,
  expires?: string | null,
) => void;

export class COGProtocolV3 {
  private pool = new Pool();
  private tiles = new Map<string, COG>();

  tile = (params: RequestParameters, callback: ResponseCallback) => {
    let url = params.url;
    url = url.replace(/^cog:\/\//, '');

    if (params.type === 'json') {
      // if the tile is a json load the GEOTiff header
      // this serves only to setup the layer
      let instance = this.tiles.get(url);
      if (!instance) {
        instance = new COG(url);
        this.tiles.set(url, instance);
      }
      instance
        .load()
        .then((cog: COG) => {
          // add a new tile of type image to the map
          const tilejson = {
            tiles: ['cog://' + cog.url + '/{z}/{x}/{y}/'],
            minzoom: 0,
            maxzoom: 24,
            bounds: cog.bbox,
          };
          callback(null, tilejson, null, null);
        })
        .catch((e: Error) => {
          callback(e, null, null, null);
        });

      return { cancel: () => {} };
    } else {
      // if it is an image, perform the actual fetch of the image portion
      let [httpUrl, bbox] = toUrlAndBBox(url);
      let instance = this.tiles.get(httpUrl);

      if (!instance) {
        throw Error('COG instance was not found');
      }

      if (!instance.tiff) {
        throw Error('COG instance was not loaded');
      }

      const controller = new AbortController();
      const signal = controller.signal;
      let cancel = () => {
        controller.abort();
      };

      instance.tiff
        .readRasters({
          bbox,
          // bands: []
          width: instance.width,
          height: instance.height,
          interleave: true,
          fillValue: NaN,
          pool: this.pool,
          signal,
        })
        .then((data: ReadRasterResult) => {
          const png = encode({
            //@ts-ignore
            data: new Uint8ClampedArray(data, data.width, data.height),
            width: data.width,
            height: data.height,
            channels: 4,
          });
          callback(null, png, null, null);
        })
        .catch((e: Error) => {
          if (e.name !== 'AbortError') {
            callback(e, null, null, null);
          }
        });

      return { cancel };
    }
    return { cancel: () => {} };
  };
}
