import { useState } from 'react';
import { supabase } from '../../../config/supabase';
import { useAuthStore } from '../../store/useAuthStore';
import { CategoriaType, ModalidadType } from '../../types';

export interface CreateOportunidadInput {
  titulo: string;
  descripcion: string;
  organizacion: string;
  organizacionId?: string;
  campus: string;
  ciudad: string;
  categoria: CategoriaType;
  modalidad: ModalidadType;
  horasSemana: number;
  cupos: number;
  habilidades: string[];
  deadline: Date;
  cover?: string;
  coverPath?: string;
}

/**
 * Inserts a new oportunidad row. The Postgres RLS policy
 * `Organizers can create oportunidades` enforces that only admin/organizer
 * roles succeed — anyone else gets a 42501 error, surfaced to the caller.
 */
export const useCreateOportunidad = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (
    input: CreateOportunidadInput,
  ): Promise<{ success: boolean; id?: string; error?: string }> => {
    if (!user?.id) {
      const msg = 'Debes iniciar sesión';
      setError(msg);
      return { success: false, error: msg };
    }

    setLoading(true);
    setError(null);
    try {
      const row = {
        titulo: input.titulo,
        title_lower: input.titulo.toLowerCase(),
        descripcion: input.descripcion,
        organizacion: input.organizacion,
        organizacion_id: input.organizacionId || '',
        campus: input.campus,
        ciudad: input.ciudad,
        categoria: input.categoria,
        modalidad: input.modalidad,
        horas_semana: input.horasSemana,
        cupos: input.cupos,
        cupos_disponibles: input.cupos,
        habilidades: input.habilidades,
        deadline: input.deadline.toISOString(),
        status: 'open',
        created_by: user.id,
        cover: input.cover ?? null,
        cover_path: input.coverPath ?? null,
      };

      const { data, error: insertError } = await supabase
        .from('oportunidades')
        .insert(row)
        .select('id')
        .single();

      if (insertError) throw insertError;
      return { success: true, id: data?.id };
    } catch (err: any) {
      if (__DEV__) console.error('Error creating oportunidad:', err);
      const message = err?.message || 'No se pudo crear la oportunidad';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, error };
};
