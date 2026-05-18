import { useMemo } from 'react';

import { Oportunidad } from '../../types';
import { calculateDistance, formatDistance } from '../../utils/locationUtils';

interface LocationCoords {
  latitude: number;
  longitude: number;
}

interface OportunidadConDistancia extends Oportunidad {
  distancia?: number;
  distanciaFormateada?: string;
}

interface UseOportunidadesConDistanciaReturn {
  oportunidades: OportunidadConDistancia[];
  loading: boolean;
}

export function useOportunidadesConDistancia(
  oportunidades: Oportunidad[],
  userLocation: LocationCoords | null,
  maxRadio?: number
): UseOportunidadesConDistanciaReturn {
  const oportunidadesConDistancia = useMemo(() => {
    // Si no hay ubicación del usuario, retornar oportunidades sin modificar
    if (!userLocation) {
      return oportunidades.map((op) => ({
        ...op,
        distancia: undefined,
        distanciaFormateada: undefined,
      }));
    }

    // Filtrar solo oportunidades con ubicación definida
    const oportunidadesConUbicacion = oportunidades
      .filter((op) => op.ubicacion?.lat && op.ubicacion?.lng)
      .map((op) => {
        // Calcular distancia
        const distanciaKm = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          op.ubicacion!.lat,
          op.ubicacion!.lng
        );

        return {
          ...op,
          distancia: distanciaKm,
          distanciaFormateada: formatDistance(distanciaKm),
        };
      });

    // Filtrar por radio máximo si se proporciona
    let oportunidadesFiltradas = oportunidadesConUbicacion;
    if (maxRadio !== undefined) {
      oportunidadesFiltradas = oportunidadesConUbicacion.filter(
        (op) => op.distancia !== undefined && op.distancia <= maxRadio
      );
    }

    // Ordenar por distancia (más cercana primero)
    const oportunidadesOrdenadas = oportunidadesFiltradas.sort((a, b) => {
      if (a.distancia === undefined) return 1;
      if (b.distancia === undefined) return -1;
      return a.distancia - b.distancia;
    });

    // Agregar oportunidades sin ubicación al final
    const oportunidadesSinUbicacion = oportunidades
      .filter((op) => !op.ubicacion?.lat || !op.ubicacion?.lng)
      .map((op) => ({
        ...op,
        distancia: undefined,
        distanciaFormateada: undefined,
      }));

    return [...oportunidadesOrdenadas, ...oportunidadesSinUbicacion];
  }, [oportunidades, userLocation, maxRadio]);

  return {
    oportunidades: oportunidadesConDistancia,
    loading: false,
  };
}
