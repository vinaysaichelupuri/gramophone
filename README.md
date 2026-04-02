# GramoPhone - Offline Music Player

Android-focused offline music player built with React Native + Expo project setup, using native modules for:

- local file scan (`react-native-fs`)
- audio playback (`expo-av`)
- runtime permissions (`react-native-permissions`)

## Features

- Discover local audio files from device storage
- Song list with title, artist fallback, and duration placeholder/fallback
- Playback controls: play/pause, next, previous
- Now Playing screen with seekable progress bar
- Permission handling for Android local media access
- Search by song name and title sort toggle

## Project Structure

- `components/`
- `screens/`
- `services/`
- `utils/`
- `types/`

## Setup

1. Install dependencies:

```bash
npm install
```

2. Build and run Android development build (required for native modules):

```bash
npm run android
```

3. Start Metro for the dev client:

```bash
npm run start:dev-client
```

Optional (Expo Go, no native playback/filesystem support):

```bash
npm run android:go
```

## Android Permission Configuration

This project injects Android storage/audio permissions into `AndroidManifest.xml` via Expo config plugin:

- Plugin file: `plugins/withAndroidAudioPermissions.js`
- Config reference: `app.json` → `expo.plugins`

Injected permissions:

- `android.permission.READ_MEDIA_AUDIO`
- `android.permission.READ_EXTERNAL_STORAGE` with `maxSdkVersion=32`

## Notes

- The app is optimized for Android local playback.
- Metadata quality depends on files available on the device and what can be inferred from file names/track data.
- If no songs are found, place audio files in device `Music` or `Download` directories and scan again.
