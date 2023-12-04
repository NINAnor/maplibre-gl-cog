import { fromUrl, GeoTIFF } from 'geotiff';
import { getBboxInWebMercator } from './utils';

export class COG {
  public url: string;
  public tiff: GeoTIFF | null;
  public width = 0;
  public height = 0;
  public bbox: number[] | null = null;

  constructor(url: string) {
    this.url = url;
    this.tiff = null;
  }

  load = async () => {
    let response = await fromUrl(this.url);
    this.tiff = response;
    let image = await this.tiff.getImage();
    this.height = image.getTileHeight();
    this.width = image.getTileWidth();
    this.bbox = await getBboxInWebMercator(image);
    if (image.getSamplesPerPixel() !== 4) {
      throw Error(`Only 4 bands (RGBA) GEOTiffs are supported`);
    }
    return this;
  };
}
