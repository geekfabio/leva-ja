import type { Coordinates } from "@/types/domain";

/** Projecção Web Mercator dos mapas de tiles (a mesma do painel e do OpenStreetMap). */
export type Point = { x: number; y: number };
type Size = { width: number; height: number };

export const TILE_SIZE = 256;
const MAX_LATITUDE = 85.05112878;

export const LUANDA_VIEW = { center: { latitude: -8.88, longitude: 13.26 } as Coordinates, zoom: 11 };

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const worldSize = (zoom: number) => TILE_SIZE * 2 ** zoom;

export function project({ latitude, longitude }: Coordinates, zoom: number): Point {
  const size = worldSize(zoom);
  const lat = (clamp(latitude, -MAX_LATITUDE, MAX_LATITUDE) * Math.PI) / 180;
  return { x: ((longitude + 180) / 360) * size, y: ((1 - Math.log(Math.tan(lat) + 1 / Math.cos(lat)) / Math.PI) / 2) * size };
}

export function unproject({ x, y }: Point, zoom: number): Coordinates {
  const size = worldSize(zoom);
  const n = Math.PI - (2 * Math.PI * y) / size;
  return { latitude: (180 / Math.PI) * Math.atan(Math.sinh(n)), longitude: (x / size) * 360 - 180 };
}

export function metersPerPixel(latitude: number, zoom: number) {
  return (156_543.033_92 * Math.cos((latitude * Math.PI) / 180)) / 2 ** zoom;
}

export function toScreen(point: Coordinates, center: Coordinates, zoom: number, size: Size): Point {
  const world = project(point, zoom);
  const middle = project(center, zoom);
  return { x: world.x - middle.x + size.width / 2, y: world.y - middle.y + size.height / 2 };
}

export function fromScreen(point: Point, center: Coordinates, zoom: number, size: Size): Coordinates {
  const middle = project(center, zoom);
  return unproject({ x: middle.x + point.x - size.width / 2, y: middle.y + point.y - size.height / 2 }, zoom);
}

/** Centro e zoom que mostram todos os pontos, com margem. */
export function fitView(points: Coordinates[], size: Size, { padding = 56, minZoom = 5, maxZoom = 16 } = {}) {
  if (!points.length) return null;
  const lats = points.map((p) => p.latitude);
  const lngs = points.map((p) => p.longitude);
  const south = Math.min(...lats);
  const north = Math.max(...lats);
  const west = Math.min(...lngs);
  const east = Math.max(...lngs);
  const center = { latitude: (north + south) / 2, longitude: (east + west) / 2 };
  const width = Math.max(1, size.width - padding * 2);
  const height = Math.max(1, size.height - padding * 2);
  for (let zoom = maxZoom; zoom >= minZoom; zoom -= 1) {
    const a = project({ latitude: north, longitude: west }, zoom);
    const b = project({ latitude: south, longitude: east }, zoom);
    if (Math.abs(b.x - a.x) <= width && Math.abs(b.y - a.y) <= height) return { center, zoom };
  }
  return { center, zoom: minZoom };
}

export type TileRef = { key: string; x: number; y: number; z: number; left: number; top: number };

export function visibleTiles(center: Coordinates, zoom: number, size: Size): TileRef[] {
  const middle = project(center, zoom);
  const originX = middle.x - size.width / 2;
  const originY = middle.y - size.height / 2;
  const count = 2 ** zoom;
  const tiles: TileRef[] = [];
  const startX = Math.floor(originX / TILE_SIZE);
  const endX = Math.floor((originX + size.width) / TILE_SIZE);
  const startY = Math.max(0, Math.floor(originY / TILE_SIZE));
  const endY = Math.min(count - 1, Math.floor((originY + size.height) / TILE_SIZE));
  for (let ty = startY; ty <= endY; ty += 1) {
    for (let tx = startX; tx <= endX; tx += 1) {
      const wrapped = ((tx % count) + count) % count;
      tiles.push({ key: `${zoom}/${tx}/${ty}`, x: wrapped, y: ty, z: zoom, left: tx * TILE_SIZE - originX, top: ty * TILE_SIZE - originY });
    }
  }
  return tiles;
}

export const tileUrl = (template: string, tile: TileRef) => template.replace("{z}", String(tile.z)).replace("{x}", String(tile.x)).replace("{y}", String(tile.y));
