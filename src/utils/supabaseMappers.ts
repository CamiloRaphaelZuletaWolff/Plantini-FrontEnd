import { Oportunidad, User, Postulacion } from '../types';

// ---------------------------------------------------------------------------
// Row types — mirror the Supabase table columns (snake_case)
// ---------------------------------------------------------------------------
export interface OportunidadRow {
  id: string;
  titulo: string;
  title_lower: string;
  descripcion: string;
  organizacion: string;
  organizacion_id: string;
  cover?: string;
  cover_path?: string;
  campus: string;
  ciudad: string;
  categoria: string;
  modalidad: string;
  horas_semana: number;
  deadline: string;
  cupos: number;
  cupos_disponibles: number;
  ubicacion?: { lat: number; lng: number; direccion: string } | null;
  habilidades: string[];
  status: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface UserRow {
  id: string;
  nombre: string;
  email: string;
  role: string;
  campus: string;
  telefono?: string;
  intereses: string[];
  avatar?: string;
  avatar_path?: string;
  background_image?: string;
  background_image_path?: string;
  bio?: string;
  carrera?: string;
  semestre?: number;
  favoritos: string[];
  push_tokens: string[];
  notifications_enabled: boolean;
  last_token_update?: string;
  monthly_goal: number;
  created_at: string;
  updated_at?: string;
}

export interface PostulacionRow {
  id: string;
  estudiante_id: string;
  estudiante_nombre: string;
  estudiante_email?: string;
  estudiante_avatar?: string;
  oportunidad_id: string;
  oportunidad_titulo: string;
  motivacion: string;
  disponibilidad: string;
  telefono?: string;
  estado: string;
  confirmado: boolean;
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Mappers
// ---------------------------------------------------------------------------
export function mapOportunidad(row: OportunidadRow): Oportunidad {
  return {
    id: row.id,
    titulo: row.titulo,
    titleLower: row.title_lower,
    descripcion: row.descripcion,
    organizacion: row.organizacion,
    organizacionId: row.organizacion_id,
    cover: row.cover,
    coverPath: row.cover_path,
    campus: row.campus,
    ciudad: row.ciudad,
    categoria: row.categoria as Oportunidad['categoria'],
    modalidad: row.modalidad as Oportunidad['modalidad'],
    horasSemana: row.horas_semana,
    deadline: row.deadline,
    cupos: row.cupos,
    cuposDisponibles: row.cupos_disponibles,
    ubicacion: row.ubicacion ?? undefined,
    habilidades: row.habilidades ?? [],
    status: row.status as Oportunidad['status'],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdBy: row.created_by ?? '',
  };
}

export function mapUser(row: UserRow): User {
  return {
    id: row.id,
    nombre: row.nombre,
    email: row.email,
    role: row.role as User['role'],
    campus: row.campus,
    telefono: row.telefono,
    intereses: row.intereses ?? [],
    avatar: row.avatar,
    avatarPath: row.avatar_path,
    backgroundImage: row.background_image,
    backgroundImagePath: row.background_image_path,
    bio: row.bio,
    carrera: row.carrera,
    semestre: row.semestre,
    favoritos: row.favoritos ?? [],
    monthlyGoal: row.monthly_goal ?? 5,
    createdAt: row.created_at,
  };
}

export function mapPostulacion(row: PostulacionRow): Postulacion {
  return {
    id: row.id,
    estudianteId: row.estudiante_id,
    estudianteNombre: row.estudiante_nombre,
    estudianteEmail: row.estudiante_email,
    estudianteAvatar: row.estudiante_avatar,
    oportunidadId: row.oportunidad_id,
    oportunidadTitulo: row.oportunidad_titulo,
    motivacion: row.motivacion,
    disponibilidad: row.disponibilidad as Postulacion['disponibilidad'],
    telefono: row.telefono,
    estado: row.estado as Postulacion['estado'],
    confirmado: row.confirmado,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
