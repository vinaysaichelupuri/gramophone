# Phase 2: Core Music Experience

## 1. Phase Goal
Deliver the first complete user journey:
discover songs -> tap song -> play audio -> control playback.

This phase creates the app's primary value proposition.

## 2. Scope
This phase includes:
- All Songs screen (main entry)
- List states (loading, empty, error)
- Search and sort experience
- Playback engine integration
- Now Playing screen
- Seek, next, previous, play/pause controls
- Mini player integration across primary screens

This phase does not include:
- Liked songs persistence
- Albums CRUD
- Advanced queue actions (`Play Next`, `Add to Queue`)

## 3. Key Files and Modules
- `screens/SongListScreen.tsx`
- `screens/NowPlayingScreen.tsx`
- `components/SongListItem.tsx`
- `components/SeekBar.tsx`
- `components/PlaybackControls.tsx`
- `components/MiniPlayer.tsx`
- `components/StatusCard.tsx`
- `services/playerService.ts`
- `services/musicLibraryService.ts`
- `services/permissionService.ts`

## 4. Detailed Task Breakdown

### 4.1 Build All Songs Screen Flow
1. Create/validate screen layout with header + actions.
2. Integrate permission gate:
   - handle `granted`, `denied`, `blocked`, `unavailable`.
3. Wire loading state during scan.
4. Render list of discovered songs with `FlatList`.
5. Implement empty state when no songs found.
6. Implement recoverable error state for scan/playback failures.

### 4.2 Song List Interaction
1. Build reusable list row component for song title/artist/duration.
2. Support press interaction to start playback from selected index.
3. Maintain stable keys and avoid duplicate list IDs.
4. Add pull-to-refresh to trigger force rescan.

### 4.3 Search and Sort
1. Implement search bar toggle and query state.
2. Support matching across title/artist/album.
3. Add lightweight relevance scoring for better ordering.
4. Implement ascending/descending sort control.
5. Ensure no performance issues on larger lists.

### 4.4 Playback Engine (Core Mode)
1. Ensure one-time player setup and audio mode config.
2. Implement queue loading with selected start index.
3. Implement stable track loader with unload-before-load behavior.
4. Implement controls:
   - play/pause
   - skip next
   - skip previous
   - seek
5. Handle track finish behavior for base mode.
6. Maintain in-memory playback snapshot APIs for UI reads.

### 4.5 Build Now Playing Screen
1. Create screen UI for active track details.
2. Render artwork fallback if artwork absent.
3. Integrate seek bar and time labels.
4. Bind play/pause/next/previous controls to service.
5. Poll snapshots or subscribe for state refresh.
6. Handle edge states:
   - no active track
   - playback unavailable

### 4.6 Mini Player Integration
1. Add mini player to song list and secondary screens where needed.
2. Show active track summary + compact controls.
3. Add progress indicator rail.
4. Tapping mini player opens Now Playing.

## 5. Deliverables
1. Fully functional All Songs screen with search/sort and robust states.
2. Fully functional Now Playing screen with core controls.
3. Playback engine stable for primary user journey.
4. Mini player visible and synced with active playback.

## 6. Exit Criteria (Definition of Done)
1. User can discover songs and start playback from song list.
2. Now Playing accurately reflects current track and progress.
3. Seek/next/previous/play-pause actions work consistently.
4. Permission and no-song scenarios are handled gracefully.
5. No crash in normal discovery/playback flows.

## 7. Risks and Mitigation
- Risk: audio state desync between service and UI.
  - Mitigation: centralized snapshot refresh contract and frequent sync.
- Risk: rapid tap actions causing race conditions.
  - Mitigation: loading guards in track transition logic.
- Risk: poor search performance in large lists.
  - Mitigation: memoized filtering and stable list rendering.

## 8. QA Checklist (Phase 2)
1. Permission granted -> songs load and list renders.
2. Tap song -> player opens and starts playback.
3. Seek -> playback position updates correctly.
4. Next/previous -> queue navigation works.
5. Empty library -> clear message and retry action shown.
6. Permission blocked -> settings action visible and functional.

## 9. Suggested Ownership
- Frontend Engineer: song list + now playing UI
- Audio Engineer: playback service stability
- QA Engineer: journey-level test coverage

