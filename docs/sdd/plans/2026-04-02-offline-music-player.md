# Offline Music Player SDD Implementation Plan

## 1. Problem Summary
- Goal: Build an Android-focused offline music player that discovers local audio files, lists metadata, supports playback controls, and provides a dedicated Now Playing experience with seek support.
- User value: Users can play music already stored on-device without internet, with a clean and minimal interface.
- Out of scope:
  - Online streaming
  - Playlist management/editing
  - Background download/sync
  - iOS-first polish (Android is priority)

## 2. Acceptance Criteria
1. App requests Android storage/audio permissions and handles `granted`, `denied`, and `blocked` states.
2. App fetches local audio files and renders a scrollable list with title, artist (if available), and duration.
3. User can play, pause/resume, skip next, and skip previous.
4. Now Playing screen displays title, artist, seekable progress, play/pause, next/previous.
5. UI uses only:
   - Background `#FAF9F6`
   - Buttons `#1C1C1C`
   - Text on buttons `#FFFFFF`
   - Secondary text `#3A3A3A`
6. Navigation includes exactly:
   - `SongListScreen`
   - `NowPlayingScreen`
7. Folder structure includes:
   - `components/`
   - `screens/`
   - `services/`
   - `utils/`
8. Edge cases are handled:
   - No songs found
   - Permission denied
   - Playback error
9. Optional features when feasible:
   - Search by song name
   - Sort by title
   - Album art display if available

## 3. Current State Findings
- Relevant files/modules:
  - Existing app is Expo Router starter (`app/_layout.tsx`, `app/(tabs)/index.tsx`, etc.).
  - No local media scanning, playback service, or permission service exists.
  - No Android native config currently checked into repo (`android/` absent in managed setup).
- Existing behavior:
  - Template tab app only; no music-related UI or state.
- Technical constraints:
  - Local file discovery + robust playback needs native modules (`react-native-track-player`, `react-native-fs`, `react-native-permissions`).
  - Requirement prefers RN CLI when native modules are needed.

## 4. Proposed Design
- High-level approach:
  - Use React Native CLI architecture for reliable native module support and Android permission control.
  - Implement modular app layers:
    - `services`: permission, media library, playback orchestration
    - `screens`: Song List and Now Playing
    - `components`: reusable UI pieces (SongCard, Mini/Full controls, progress bar, empty states)
    - `utils`: formatters, constants, metadata fallback helpers
- Data/model changes:
  - Introduce `Song` model:
    - `id`, `title`, `artist`, `duration`, `url`, `artwork?`, `album?`
  - Introduce playback state model:
    - `currentTrackId`, `isPlaying`, `position`, `duration`, `queueIndex`
- UI/API changes:
  - Replace template navigation with stack navigation for two screens.
  - Theming hardcoded via centralized color tokens matching strict palette.
- Backward compatibility notes:
  - This is a net-new feature app; no legacy domain contracts to maintain.
  - Migration from current Expo template to RN CLI structure is expected.

## 5. Phase Plan
### Phase 1: Bootstrap and Foundation
- Objective: Create stable project foundation for Android offline playback app.
- Files to change:
  - `package.json`
  - `tsconfig.json`
  - `babel.config.js` (if needed by selected setup)
  - `App.tsx`
  - `src/components/` (new)
  - `src/screens/` (new)
  - `src/services/` (new)
  - `src/utils/` (new)
  - `src/navigation/AppNavigator.tsx` (new)
  - `src/theme/colors.ts` (new)
  - `src/types/song.ts` (new)
- Tasks:
  - Set up RN CLI TypeScript app shell (or migrate existing repo to equivalent structure).
  - Install core dependencies:
    - `@react-navigation/native`
    - `@react-navigation/native-stack`
    - `react-native-screens`
    - `react-native-safe-area-context`
  - Wire root navigation with `SongListScreen` and `NowPlayingScreen`.
  - Add strict theme tokens and spacing constants.
- Verification:
  - App launches on Android emulator/device.
  - Can navigate between Song List and Now Playing placeholder screens.

### Phase 2: Permissions Layer (Android)
- Objective: Ensure storage/audio read permissions are properly requested and handled.
- Files to change:
  - `android/app/src/main/AndroidManifest.xml`
  - `src/services/permissionService.ts` (new)
  - `src/components/PermissionGate.tsx` (new)
  - `src/screens/SongListScreen.tsx`
- Tasks:
  - Add manifest permissions:
    - `android.permission.READ_MEDIA_AUDIO` (API 33+)
    - `android.permission.READ_EXTERNAL_STORAGE` with `maxSdkVersion="32"`
  - Implement runtime permission checks with `react-native-permissions`.
  - Add UX for denied/blocked states with retry/open-settings actions.
- Verification:
  - Android 13+ asks for `READ_MEDIA_AUDIO`.
  - Android 12 and below follows `READ_EXTERNAL_STORAGE`.
  - Permission denied state renders expected fallback UI.

### Phase 3: Local Music Discovery Service
- Objective: Discover and normalize local audio files from device storage.
- Files to change:
  - `src/services/musicLibraryService.ts` (new)
  - `src/utils/fileFilters.ts` (new)
  - `src/utils/formatters.ts` (new)
  - `src/hooks/useMusicLibrary.ts` (new)
  - `src/types/song.ts`
- Tasks:
  - Integrate `react-native-fs` to scan known music directories.
  - Filter extensions (`.mp3`, `.m4a`, `.aac`, `.wav`, `.flac`, `.ogg`).
  - Derive fallback metadata from filename when tags missing.
  - Populate song list and handle empty/error states.
- Verification:
  - With local test songs, list displays title/artist/duration.
  - No-song devices show clear empty state.
  - Scan errors are surfaced without app crash.

### Phase 4: Playback Engine Integration
- Objective: Implement robust queue-based playback and seek controls.
- Files to change:
  - `src/services/playerService.ts` (new)
  - `src/services/trackPlayerBootstrap.ts` (new)
  - `src/hooks/usePlayerState.ts` (new)
  - `src/hooks/usePlaybackProgress.ts` (new)
  - `index.js` (track player service registration, if required)
  - `android/app/src/main/java/...` (only if native setup requires manual steps)
- Tasks:
  - Integrate `react-native-track-player`.
  - Setup player lifecycle and queue from local songs.
  - Implement controls:
    - play
    - pause/resume
    - next
    - previous
    - seek
  - Keep UI state synced with track player events.
- Verification:
  - All controls work from both screens.
  - Progress updates and seek behavior remain smooth.
  - Track transitions do not crash.

### Phase 5: Song List UI (Minimal Modern Cards)
- Objective: Build primary discovery/play entry screen.
- Files to change:
  - `src/screens/SongListScreen.tsx`
  - `src/components/SongListItem.tsx` (new)
  - `src/components/SearchBar.tsx` (new, optional)
  - `src/components/EmptyState.tsx` (new)
  - `src/components/ErrorState.tsx` (new)
- Tasks:
  - Render scrollable list using clean spacing/card layout.
  - Show title, artist, duration per row.
  - Tap row to start playback and navigate to Now Playing.
  - Apply strict color palette only.
  - Add optional search and sort by title.
- Verification:
  - Visual audit confirms palette compliance.
  - List remains performant for large local libraries.
  - Search/sort function as expected (if implemented).

### Phase 6: Now Playing UI
- Objective: Deliver focused playback interaction screen.
- Files to change:
  - `src/screens/NowPlayingScreen.tsx`
  - `src/components/NowPlayingHeader.tsx` (new)
  - `src/components/PlaybackControls.tsx` (new)
  - `src/components/SeekBar.tsx` (new)
  - `src/components/AlbumArt.tsx` (new, optional)
- Tasks:
  - Display current title/artist.
  - Add seekable progress bar.
  - Add play/pause, next, previous controls.
  - Show album art when available, fallback placeholder otherwise.
- Verification:
  - Seek updates track position correctly.
  - Play/pause/skip controls match player state without lag.
  - Missing metadata/artwork handled gracefully.

### Phase 7: Hardening, QA, and Delivery
- Objective: Make app robust and shippable for Android usage.
- Files to change:
  - `README.md`
  - `android/app/src/main/AndroidManifest.xml`
  - `src/services/*` and `src/screens/*` for bug fixes
- Tasks:
  - Add key comments in non-obvious logic paths (permissions, playback sync, metadata fallback).
  - Test matrix:
    - Android 13+ permissions
    - Android 12 and below permissions
    - no songs
    - corrupted file
    - permission denied/blocked
  - Document setup, run steps, and native configuration.
- Verification:
  - Fresh clone setup works from README.
  - Core flows pass manual QA checklist.
  - No known crash in primary user journeys.

## 6. Test Strategy
- Unit tests:
  - Formatter utilities (`duration`, fallback title/artist parsing)
  - File extension/audio filter logic
  - Permission state mapping logic
- Integration tests:
  - Song list renders from mocked local library data
  - Tapping song triggers player service and navigation
  - Playback controls invoke expected service methods
- Manual QA:
  - Device/emulator with and without songs
  - Permission denied and settings recovery flow
  - Long list scrolling and responsiveness

## 7. Risks and Mitigations
- Risk: Migration from existing Expo template to RN CLI may increase setup time.
  - Mitigation: Keep migration as isolated Phase 1 with a smoke test gate before feature coding.
- Risk: Local metadata (artist/duration/artwork) may be inconsistent across files.
  - Mitigation: Implement strict fallback behavior and resilient UI rendering.
- Risk: Permissions behavior differs across Android SDK versions.
  - Mitigation: Explicit API-level handling and test pass on both 13+ and <=12.
- Risk: Playback state desync between UI and native player events.
  - Mitigation: Centralize player state hooks and subscribe to official track player events only.

## 8. Developer Handoff
- Plan ID or path:
  - `docs/sdd/plans/2026-04-02-offline-music-player.md`
- Ordered checklist:
  1. Complete Phase 1 foundation
  2. Implement Phase 2 permissions
  3. Implement Phase 3 library discovery
  4. Implement Phase 4 playback engine
  5. Implement Phase 5 song list UI
  6. Implement Phase 6 now playing UI
  7. Run Phase 7 QA and docs
- Blocking questions:
  - Confirm whether we should fully migrate to RN CLI now, or keep Expo and prebuild for native modules.
  - Confirm minimum Android SDK/device target for QA baseline.
- Verification commands:
  - `npm install`
  - `npm run lint`
  - `npm run android`
