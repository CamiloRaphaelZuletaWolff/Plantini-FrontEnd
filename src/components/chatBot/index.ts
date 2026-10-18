// Plantini chatBot — self-contained chat feature wired to the `backend/` service.
// Screen + entry widgets are the public surface; internals are available too.

export { default as ChatBotScreen } from './ChatBotScreen';
export { PlantiniHomeCard } from './PlantiniHomeCard';
export { PlantiniFloatingButton } from './PlantiniFloatingButton';

export { useChatBot } from './hooks/useChatBot';
export { useChatBotStore } from './store/chatBotStore';

export type { ChatMessage, ChatAttachment, ChatRole } from './types';
