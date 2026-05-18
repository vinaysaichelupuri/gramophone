# Phase 3: Personalization and Library Features

## 1. Phase Goal
Transform the core player into a personalized music app by adding:
- likes
- albums
- advanced playback modes
- queue actions

This phase is focused on user retention and personal library control.

## 2. Scope
This phase includes:
- Liked songs persistence and screen
- Library store architecture
- User-created albums and song management
- System-generated albums (artist/album/folder grouping)
- Advanced playback options:
  - repeat modes
  - shuffle
  - play now / play next / add to queue

This phase does not include:
- release hardening matrix
- final documentation and release package

## 3. Key Files and Modules
- `services/libraryStore.ts`
- `hooks/useLibrary.ts`
- `screens/LikedSongsScreen.tsx`
- `screens/AlbumsScreen.tsx`
- `screens/AlbumDetailScreen.tsx`
- `components/SongOptionsMenu.tsx`
- `screens/SongListScreen.tsx`
- `screens/NowPlayingScreen.tsx`
- `services/playerService.ts`

## 4. Detailed Task Breakdown

### 4.1 Persistent Library Store
1. Finalize store schema:
   - `likedSongIds`
   - `albums`
2. Implement load-once initialization.
3. Implement persistence to local JSON file.
4. Add subscription mechanism for reactive UI refresh.
5. Add safe error handling for corrupt or missing store file.

### 4.2 Like/Unlike Experience
1. Add like toggle action on song list rows.
2. Add like toggle action on now playing screen.
3. Build Liked Songs screen listing only liked items.
4. Keep like state synchronized across all screens.
5. Ensure likes persist after app restart.

### 4.3 Albums Module (User Managed)
1. Implement create album flow with validation.
2. Implement rename album flow.
3. Implement delete album flow with confirmation.
4. Build album detail view with song list.
5. Support add/remove song from custom album.
6. Support playback from album context.

### 4.4 System Albums (Dynamic Grouping)
1. Build computed albums from metadata:
   - album tag
   - artist tag
2. Add folder-name fallback grouping when metadata is missing.
3. Filter noisy folder names and technical folders.
4. Merge user albums + system albums for tab/screen rendering.

### 4.5 Advanced Queue and Playback Controls
1. Implement repeat modes:
   - off
   - repeat all
   - repeat one
2. Implement shuffle enable/disable with queue continuity.
3. Add options menu actions:
   - play now
   - play next
   - add to queue
4. Ensure queue mutation does not break currently playing track.
5. Add next-up rendering in now playing when queue allows.

### 4.6 UX Consistency and State Integrity
1. Ensure mini-player, song list, liked, albums, and player remain in sync.
2. Add guardrails for missing song references in removed albums.
3. Ensure no duplicate additions to album or queue where not intended.

## 5. Deliverables
1. Persistent likes and dedicated Liked Songs flow.
2. Full albums management module with detail screen.
3. Dynamic system album grouping for metadata-poor libraries.
4. Advanced playback behavior and queue action menu.

## 6. Exit Criteria (Definition of Done)
1. Like state persists and syncs across screens.
2. Albums CRUD works without data loss.
3. Songs can be added/removed and played from album detail.
4. Repeat and shuffle behave predictably during real playback.
5. Play Now / Play Next / Add to Queue actions execute correctly.

## 7. Risks and Mitigation
- Risk: store and UI becoming out-of-sync.
  - Mitigation: strict subscription refresh points and immutable snapshots.
- Risk: queue corruption after shuffle/repeat toggles.
  - Mitigation: maintain original queue reference and controlled reorder strategy.
- Risk: system albums producing noisy groups.
  - Mitigation: ignored folder dictionary + normalization.

## 8. QA Checklist (Phase 3)
1. Like a song -> appears in liked screen.
2. Restart app -> liked song still present.
3. Create/rename/delete album -> changes persist.
4. Add/remove songs in album detail -> list updates instantly.
5. Repeat off/all/one transitions verified at track end.
6. Shuffle on/off preserves current song continuity.
7. Queue actions from options menu behave as expected.

## 9. Suggested Ownership
- Data Engineer: library store + persistence
- Frontend Engineer: liked/albums UI workflows
- Audio Engineer: repeat/shuffle/queue action behavior

