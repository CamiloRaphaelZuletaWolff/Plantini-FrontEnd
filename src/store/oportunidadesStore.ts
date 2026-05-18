import { create } from 'zustand';
import { Oportunidad, OportunidadesFiltros } from '../types';

interface OportunidadesState {
  oportunidades: Oportunidad[];
  filtros: OportunidadesFiltros;
  loading: boolean;
  error: string | null;
  
  setOportunidades: (oportunidades: Oportunidad[]) => void;
  setFiltros: (filtros: Partial<OportunidadesFiltros>) => void;
  clearFiltros: () => void;
  getOportunidadById: (id: string) => Oportunidad | undefined;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const initialFiltros: OportunidadesFiltros = {
  campus: [],
  categoria: [],
  modalidad: null,
  disponibilidad: [],
  habilidades: [],
  busqueda: '',
  status: ['open', 'waitlist'],
};

export const useOportunidadesStore = create<OportunidadesState>((set, get) => ({
  oportunidades: [],
  filtros: initialFiltros,
  loading: false,
  error: null,

  setOportunidades: (oportunidades) => set({ oportunidades, loading: false }),

  setFiltros: (newFiltros) =>
    set((state) => ({
      filtros: { ...state.filtros, ...newFiltros },
    })),

  clearFiltros: () => set({ filtros: initialFiltros }),

  getOportunidadById: (id) => {
    const state = get();
    return state.oportunidades.find((opp) => opp.id === id);
  },

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error, loading: false }),
}));
