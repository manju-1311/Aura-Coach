# Aura Coach - Flutter Mobile Application

A cross-platform mobile client for **Aura Coach & Agentic Study Assistant**, written in **Flutter** (Dart) with a **Purple, White, and Neon** design system.

---

## 🎨 Theme & Colors
- **Cosmic Deep Purple Canvas**: `#0D0221`
- **Surface & Cards**: `#190838` / `#260D52`
- **High-Contrast Typography**: Crisp White (`#FFFFFF`) & Soft Lilac (`#F3E8FF`)
- **Electric Neon Accents**: Neon Purple (`#A855F7`), Neon Fuchsia (`#F0ABFC`), and Neon Green (`#10B981`)
- **Neon Glow Shadows**: Custom multi-layered box shadows simulating ambient LED backlight.

---

## 🚀 Features
1. **Interactive Study Agent**:
   - Ingest notes and documents.
   - Run AI agent synthesis for **Mock Tests**, **Structured Summaries**, and **Active Recall Flashcards**.
2. **Interactive Mock Test Runner**:
   - Question carousel, option selection, instant grading, and detailed explanations.
3. **Flashcards Deck**:
   - Tap-to-flip 3D card animation with mastery marking.
4. **Backend Integration**:
   - Connects to the Express/Node.js backend endpoints (`/api/agent/run`, `/api/health`, `/api/tasks`).

---

## 📱 How to Run the Flutter App

### Prerequisites
- [Flutter SDK](https://flutter.dev/docs/get-started/install) (version `>=3.0.0`)
- Android Studio or Xcode / VS Code with Flutter Extension

### Steps
1. Navigate to the flutter app folder:
   ```bash
   cd flutter_app
   ```
2. Install dependencies:
   ```bash
   flutter pub get
   ```
3. Run the backend server (in the root folder):
   ```bash
   npm run dev
   ```
4. Configure the Backend URL in `lib/services/api_service.dart`:
   - **Android Emulator**: `http://10.0.2.2:3000` (default)
   - **iOS Simulator**: `http://localhost:3000`
   - **Physical Device**: `http://<YOUR_LOCAL_IP>:3000` or deployed Cloud Run URL
5. Launch the app on your emulator or connected mobile phone:
   ```bash
   flutter run
   ```
