import { TacticalUnit } from '../types/tactical';

/**
 * Calcula la distancia ortodrómica en metros entre dos puntos geográficos (WGS-84).
 * Equivalente a ST_Distance(posicion::geography, ST_SetSRID(ST_MakePoint(lon, lat), 4326)::geography).
 */
export function calcularDistanciaMetros(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Radio de la Tierra en metros
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Función espejo de la función SQL PostGIS `unidad_mas_cercana(lat, lon, tipo_filtro)`.
 * Encuentra la unidad táctica con menor distancia euclidiana/geográfica a un incidente.
 */
export function encontrarUnidadMasCercana(
  lat: number,
  lon: number,
  unidades: TacticalUnit[],
  tipoFiltro?: 'AMBULANCIA' | 'RESCATISTA' | 'K9'
): { unidad: TacticalUnit; distanciaMetros: number } | null {
  const candidatas = unidades.filter(u => {
    if (u.indicativo === 'Ónix-0') return false; // La base central no se despacha como móvil
    if (tipoFiltro && u.tipo !== tipoFiltro) return false;
    return true;
  });

  if (candidatas.length === 0) return null;

  let mejorUnidad = candidatas[0];
  let menorDistancia = calcularDistanciaMetros(lat, lon, mejorUnidad.latitud, mejorUnidad.longitud);

  for (let i = 1; i < candidatas.length; i++) {
    const d = calcularDistanciaMetros(lat, lon, candidatas[i].latitud, candidatas[i].longitud);
    if (d < menorDistancia) {
      menorDistancia = d;
      mejorUnidad = candidatas[i];
    }
  }

  return {
    unidad: mejorUnidad,
    distanciaMetros: menorDistancia
  };
}

/**
 * Algoritmo Ray-Casting para determinar si una coordenada está dentro de un polígono de geocerca.
 */
export function estaDentroDeGeocerca(lat: number, lon: number, poligono: [number, number][]): boolean {
  let dentro = false;
  for (let i = 0, j = poligono.length - 1; i < poligono.length; j = i++) {
    const xi = poligono[i][0];
    const yi = poligono[i][1];
    const xj = poligono[j][0];
    const yj = poligono[j][1];

    const intersecta = yi > lon !== yj > lon && lat < ((xj - xi) * (lon - yi)) / (yj - yi) + xi;
    if (intersecta) dentro = !dentro;
  }
  return dentro;
}
