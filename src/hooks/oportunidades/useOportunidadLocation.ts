import { useMemo } from 'react';

import { Oportunidad } from '../../types';

interface UseOportunidadLocationReturn {
  hasLocation: boolean;
  latitude?: number;
  longitude?: number;
  direccion?: string;
  displayText: string;
}

export function useOportunidadLocation(
  oportunidad: Oportunidad | null
): UseOportunidadLocationReturn {
  return useMemo(() => {
    if (!oportunidad) {
      return {
        hasLocation: false,
        displayText: 'Ubicación no disponible',
      };
    }

    const hasLocation = Boolean(
      oportunidad.ubicacion?.lat && oportunidad.ubicacion?.lng
    );

    const displayText = oportunidad.ubicacion?.direccion
      || `${oportunidad.ciudad}, ${oportunidad.campus}`;

    return {
      hasLocation,
      latitude: oportunidad.ubicacion?.lat,
      longitude: oportunidad.ubicacion?.lng,
      direccion: oportunidad.ubicacion?.direccion,
      displayText,
    };
  }, [oportunidad]);
}
