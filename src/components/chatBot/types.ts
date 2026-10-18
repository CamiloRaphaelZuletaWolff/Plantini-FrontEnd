/**
 * Client-side chat types for the Plantini chatBot UI.
 *
 * These are purely for display/persistence in the app. The backend contract only
 * needs `prompt` + `chatId` + image files — roles and timestamps are local concerns.
 */

export type ChatRole = 'user' | 'assistant';

/** A locally-picked image attached to a message (sent as multipart to the backend). */
export interface ChatAttachment {
  uri: string;
  name: string;
  mimeType: string;
  size?: number;
}

export interface ChatMessage {
  id: string;
  role: ChatRole;
  text: string;
  createdAt: number;
  attachments?: ChatAttachment[];
}
