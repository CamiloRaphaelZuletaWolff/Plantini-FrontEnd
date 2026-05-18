export type CategoriaType = 'social' | 'ambiental' | 'educativo' | 'cultural' | 'salud';
export type ModalidadType = 'presencial' | 'remoto' | 'hibrido';
export type OportunidadStatusType = 'open' | 'waitlist' | 'closed' | 'finished';
export type PostulacionEstadoType = 'submitted' | 'under_review' | 'accepted' | 'rejected' | 'waitlisted';
export type UserRoleType = 'student' | 'organizer' | 'admin';
export type DisponibilidadType = 'fin_de_semana' | 'entre_semana' | 'flexible';



export interface Ubicacion {
  lat: number;
  lng: number;
  direccion: string;
}



export interface Oportunidad {
  id: string;
  titulo: string;
  titleLower: string;
  descripcion: string;
  organizacion: string;
  organizacionId: string;
  cover?: string;
  coverPath?: string;
  campus: string;
  ciudad: string;
  categoria: CategoriaType;
  modalidad: ModalidadType;
  horasSemana: number;
  deadline: string;
  cupos: number;
  cuposDisponibles: number;
  ubicacion?: Ubicacion;
  habilidades: string[];
  status: OportunidadStatusType;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface OportunidadFormData extends Omit<Oportunidad, 'id' | 'titleLower' | 'createdAt' | 'updatedAt' | 'cuposDisponibles'> {
  // Para crear/editar oportunidades
}



export interface User {
  id: string;
  nombre: string;
  email: string;
  role: UserRoleType;
  campus: string;
  telefono?: string;
  intereses: string[];
  avatar?: string;
  avatarPath?: string;
  backgroundImage?: string;
  backgroundImagePath?: string;
  bio?: string;
  carrera?: string;
  semestre?: number;
  favoritos: string[];
  monthlyGoal: number;
  createdAt: string;
}

export interface UserProfileUpdate {
  nombre?: string;
  bio?: string;
  campus?: string;
  carrera?: string;
  semestre?: number;
  telefono?: string;
  intereses?: string[];
  avatar?: string;
  avatarPath?: string;
  backgroundImage?: string;
  backgroundImagePath?: string;
  monthlyGoal?: number;
}


export interface Postulacion {
  id: string;
  estudianteId: string;
  estudianteNombre: string;
  estudianteEmail?: string;
  estudianteAvatar?: string;
  oportunidadId: string;
  oportunidadTitulo: string;
  motivacion: string;
  disponibilidad: DisponibilidadType;
  telefono?: string;
  estado: PostulacionEstadoType;
  confirmado: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PostulacionFormData {
  motivacion: string;
  disponibilidad: DisponibilidadType;
  telefono?: string;
}



export interface OportunidadesFiltros {
  campus: string[];
  categoria: CategoriaType[];
  modalidad: ModalidadType | null;
  disponibilidad: string[]; 
  habilidades: string[];
  busqueda: string;
  status: OportunidadStatusType[];
  distancia?: string;
}



export interface UserStats {
  totalPostulaciones: number;
  postulacionesAceptadas: number;
  horasCompletadas: number;
  oportunidadesFavoritas: number;
}



export interface StatusBadgeProps {
  status: OportunidadStatusType;
  size?: 'small' | 'medium' | 'large';
}

export interface CategoriaBadgeProps {
  categoria: CategoriaType;
  size?: 'small' | 'medium' | 'large';
}

export interface FilterChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  icon?: string;
}

export interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export interface LoadingSkeletonProps {
  type: 'card' | 'detail' | 'list';
  count?: number;
}



export const COLLECTIONS = {
  OPORTUNIDADES: 'oportunidades',
  USERS: 'users',
  USUARIOS: 'users', // Alias para notificaciones
  POSTULACIONES: 'postulaciones',
} as const;



export const CATEGORIAS: { key: CategoriaType; label: string; icon: string; color: string }[] = [
  { key: 'social', label: 'Social', icon: 'people', color: '#FF6B6B' },
  { key: 'ambiental', label: 'Ambiental', icon: 'leaf', color: '#51CF66' },
  { key: 'educativo', label: 'Educativo', icon: 'school', color: '#4ECDC4' },
  { key: 'cultural', label: 'Cultural', icon: 'color-palette', color: '#AA96DA' },
  { key: 'salud', label: 'Salud', icon: 'medical', color: '#F38181' },
];

export const MODALIDADES: { key: ModalidadType; label: string; icon: string }[] = [
  { key: 'presencial', label: 'Presencial', icon: 'location' },
  { key: 'remoto', label: 'Remoto', icon: 'laptop' },
  { key: 'hibrido', label: 'Híbrido', icon: 'git-merge' },
];

export const CAMPUS_OPTIONS = [
  'UMSA',
  'UCB',
  'EMI',
  'UPSA',
  'UPB',
  'Otro',
];

export const DISPONIBILIDAD_OPTIONS: { key: DisponibilidadType; label: string }[] = [
  { key: 'fin_de_semana', label: 'Fin de semana' },
  { key: 'entre_semana', label: 'Entre semana' },
  { key: 'flexible', label: 'Flexible' },
];

export const HABILIDADES_COMUNES = [
  'Comunicación',
  'Trabajo en equipo',
  'Liderazgo',
  'Organización',
  'Creatividad',
  'Empatía',
  'Resolución de problemas',
  'Idiomas',
  'Tecnología',
  'Diseño',
  'Fotografía',
  'Cocina',
  'Primeros auxilios',
  'Manejo',
];
