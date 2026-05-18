Plantini chat integration

This folder implements the Plantini chatbot integration for VoluntariadoUPB.

Notes and configuration
- The backend base URL is centralized in `src/config/gemini.ts`. Priority order:
  1. `app.json > expo.extra.GEMINI_BASE_URL`  (hard override — use for production)
  2. `process.env.GEMINI_BASE_URL`
  3. Auto-detected from `Constants.expoConfig.hostUri` — Expo already knows your
     machine's IP to serve the JS bundle; we swap port 8081 for 3000. This makes
     physical devices and Android emulators work on your local network without ngrok.
  4. Fallback to `http://localhost:3000` (web browser / iOS Simulator)

- Chat persistence uses Zustand + AsyncStorage under key `chat_store_v1`.
  The `chatId` is persisted so conversations survive navigation and app restarts.
- Image picking uses `expo-image-picker`; attachments are sent as multipart/form-data.
- Every request includes `Authorization: Bearer <token>` (Supabase JWT). The backend
  validates it via AuthGuard before processing any message.

Files
- `services/chatApi.ts`    — HTTP wrapper for POST /api/gemini/chat-stream (streaming)
- `store/chatStore.ts`     — Zustand store persisted in AsyncStorage
- `hooks/useChat.ts`       — sendMessage, cancel, messages with incremental stream updates
- `components/`            — UI components; PlantiniHomeCard lives in the Home tab

Testing tips
- Start the NestJS backend: `npm run start:dev` inside `gemini-backend/`
- Make sure your phone/emulator is on the same WiFi as your dev machine.
- Run `npx expo start` — the backend URL is auto-detected, no manual config needed.
- Open the Home tab and tap the Plantini card ''Abrir chat''.
