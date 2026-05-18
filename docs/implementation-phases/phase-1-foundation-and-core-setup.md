# Phase 1: Foundation and Core Setup

## 1. Phase Goal
Establish a clean, stable, and scalable technical foundation for the offline music player before feature implementation begins.

This phase ensures every future sprint can move fast without rework caused by architecture, configuration, or environment issues.

## 2. Scope
This phase includes:
- Project initialization and structure standardization
- Core dependency setup
- Native Android configuration baseline
- Routing and navigation shell
- Shared design/system primitives (types, utils, colors)
- Permission service implementation (without final UI polish)
- Local music discovery service baseline (scan + filter + normalize)

This phase does not include:
- Full player screen UI
- Albums/likes business flows
- Advanced queue modes (shuffle/repeat)

## 3. Key Files and Modules
- `package.json`
- `app/_layout.tsx`
- `app/index.tsx`
- `app.json`
- `plugins/withAndroidAudioPermissions.js`
- `android/app/src/main/AndroidManifest.xml`
- `types/song.ts`
- `utils/colors.ts`
- `utils/formatters.ts`
- `utils/music.ts`
- `utils/runtime.ts`
- `services/permissionService.ts`
- `services/musicLibraryService.ts`

## 4. Detailed Task Breakdown

### 4.1 Project Baseline and Structure
1. Verify Expo TypeScript project baseline and lock compatible versions.
2. Confirm folder architecture is consistent and future-proof:
   - `app/`
   - `screens/`
   - `components/`
   - `services/`
   - `hooks/`
   - `utils/`
   - `types/`
3. Ensure path alias `@/*` is working across TypeScript and Metro.
4. Remove or isolate template-only starter artifacts that are not part of app scope.

### 4.2 Dependency and Runtime Setup
1. Validate required package set:
   - navigation/router
   - audio playback (`expo-av`)
   - filesystem (`react-native-fs`)
   - permissions (`react-native-permissions`)
   - slider and safe area dependencies
2. Run install and verify native autolinking.
3. Confirm app can build on Android dev client.

### 4.3 Native Android Baseline
1. Configure required Android permissions via config plugin.
2. Reconcile `app.json` plugin intent and generated `AndroidManifest.xml`.
3. Verify deep-link scheme and intent-filter foundations for audio file handling.
4. Ensure no contradictory or duplicate critical permission declarations.

### 4.4 Routing and App Shell
1. Establish app navigation stack skeleton:
   - home (all songs)
   - now playing route
   - placeholder routes for liked/albums as needed
2. Apply theme provider and status bar defaults.
3. Confirm route transitions are working and crash-free.

### 4.5 Shared Core Contracts
1. Finalize `Song` model fields and naming consistency.
2. Create shared color token set and enforce usage in screens/components.
3. Implement foundational utility functions:
   - duration formatting
   - title extraction from file path
   - audio extension checking
   - runtime environment checks (Expo Go vs native dev client)

### 4.6 Permission Service Baseline
1. Implement permission status mapping:
   - `granted`
   - `denied`
   - `blocked`
   - `unavailable`
2. Implement:
   - `requestAudioPermission()`
   - `openPermissionSettings()`
3. Add API-level permission branching (`READ_MEDIA_AUDIO` vs `READ_EXTERNAL_STORAGE`).

### 4.7 Music Discovery Service Baseline
1. Implement local filesystem scan roots (Music/Download paths).
2. Add recursive scan with safe max depth.
3. Filter supported audio formats.
4. Normalize song IDs/paths and deduplicate entries.
5. Add cache and subscription model for downstream UI updates.

## 5. Deliverables
1. Runnable Android dev build with stable base architecture.
2. Permission service module with deterministic outputs.
3. Local song discovery service returning normalized song list.
4. Shared model/util/color foundation used by app shell.

## 6. Exit Criteria (Definition of Done)
1. App launches successfully on Android emulator/device.
2. `requestAudioPermission()` flow works without runtime errors.
3. `getLocalSongs()` returns deterministic list for a test folder.
4. Linting passes on Phase 1 touched files.
5. No critical native config mismatch between `app.json` and generated manifest behavior.

## 7. Risks and Mitigation
- Risk: Native module unavailable in Expo Go.
  - Mitigation: enforce dev-client runtime check and clear fallback messaging.
- Risk: Android API permission behavior variance.
  - Mitigation: explicit version branching in permission service.
- Risk: scan performance degradation on large storage.
  - Mitigation: max depth controls and dedupe pipeline.

## 8. QA Checklist (Phase 1)
1. Fresh install -> app launch success.
2. Permission request appears correctly.
3. Denied permission state handled without crash.
4. With sample files present, discovery service returns expected song count.
5. Invalid/unreadable directory paths do not break app execution.

## 9. Suggested Ownership
- Platform Engineer: native config + permissions
- Core Engineer: project structure + shared contracts
- Data/Service Engineer: discovery service baseline

