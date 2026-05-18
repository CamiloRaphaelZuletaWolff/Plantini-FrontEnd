export type Role = 'user' | 'model';

export interface ChatFile {
  name: string;
  uri: string;
  size?: number;
  type?: string;
}

export interface Message {
  id: string;
  content: string;
  role: Role;
  timestamp: number;
  files?: ChatFile[];
}
