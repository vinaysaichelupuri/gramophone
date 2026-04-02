import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppButton } from "@/components/AppButton";
import { SongListItem } from "@/components/SongListItem";
import { StatusCard } from "@/components/StatusCard";
import {
  getLocalSongs,
  isMusicLibraryModuleAvailable,
} from "@/services/musicLibraryService";
import {
  AudioPermissionState,
  openPermissionSettings,
  requestAudioPermission,
} from "@/services/permissionService";
import {
  arePlaybackModulesAvailable,
  loadQueueAndPlay,
  setupPlayer,
} from "@/services/playerService";
import { Song } from "@/types/song";
import { COLORS } from "@/utils/colors";

export function SongListScreen() {
  const router = useRouter();
  const [songs, setSongs] = useState<Song[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortAscending, setSortAscending] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [permissionState, setPermissionState] =
    useState<AudioPermissionState>("denied");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const hasNativeModuleSupport =
    isMusicLibraryModuleAvailable() && arePlaybackModulesAvailable();

  const visibleSongs = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const filteredSongs = normalizedQuery
      ? songs.filter((song) =>
          song.title.toLowerCase().includes(normalizedQuery),
        )
      : songs;

    return sortAscending ? filteredSongs : [...filteredSongs].reverse();
  }, [searchQuery, songs, sortAscending]);

  const loadLibrary = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      if (!hasNativeModuleSupport) {
        setPermissionState("unavailable");
        setSongs([]);
        return;
      }

      const permissionResult = await requestAudioPermission();
      setPermissionState(permissionResult.status);

      if (permissionResult.status !== "granted") {
        setSongs([]);
        return;
      }

      await setupPlayer();
      const discoveredSongs = await getLocalSongs();
      setSongs(discoveredSongs);
    } catch (error) {
      setErrorMessage(
        "Unable to load local songs right now. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [hasNativeModuleSupport]);

  useEffect(() => {
    // Bootstraps permission + media scan when the screen mounts.
    void loadLibrary();
  }, [loadLibrary]);

  const handlePlaySong = useCallback(
    async (songIndex: number) => {
      try {
        await loadQueueAndPlay(visibleSongs, songIndex);
        router.push("/now-playing");
      } catch {
        setErrorMessage(
          "Playback could not start. Please try a different file.",
        );
      }
    },
    [router, visibleSongs],
  );

  const renderBody = () => {
    if (isLoading) {
      return (
        <View style={styles.centeredState}>
          <ActivityIndicator color={COLORS.button} />
          <Text style={styles.secondaryText}>
            Scanning your local audio files...
          </Text>
        </View>
      );
    }

    if (permissionState !== "granted") {
      const isBlocked = permissionState === "blocked";
      const isUnavailable = permissionState === "unavailable";
      const title = isUnavailable
        ? "Native Modules Unavailable"
        : isBlocked
          ? "Permission Blocked"
          : "Permission Required";
      const description = isUnavailable
        ? "This app needs a native development build. Run 'npx expo run:android' and open the dev client."
        : isBlocked
          ? "Music access is blocked. Open settings to allow local audio access."
          : "Allow local audio access so the app can list songs on your device.";

      return (
        <View style={styles.gap}>
          <StatusCard title={title} description={description} />
          {isUnavailable ? null : (
            <AppButton
              title={isBlocked ? "Open Settings" : "Grant Permission"}
              onPress={isBlocked ? openPermissionSettings : loadLibrary}
            />
          )}
        </View>
      );
    }

    if (songs.length === 0) {
      return (
        <View style={styles.gap}>
          <StatusCard
            title="No Local Songs Found"
            description="No supported audio files were detected in Music or Download folders."
          />
          <AppButton title="Scan Again" onPress={loadLibrary} />
        </View>
      );
    }

    return (
      <FlatList
        data={visibleSongs}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <SongListItem song={item} onPress={() => handlePlaySong(index)} />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <StatusCard
            title="No Results"
            description="No songs match your search. Try another song title."
          />
        }
      />
    );
  };

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.container}>
      <Text style={styles.title}>GramoPhone</Text>
      <Text style={styles.subtitle}>
        Play songs already available on your device.
      </Text>

      <View style={styles.controlsRow}>
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search songs"
          placeholderTextColor={COLORS.secondaryText}
          style={styles.searchInput}
        />
        <AppButton
          title={sortAscending ? "A-Z" : "Z-A"}
          onPress={() => setSortAscending((previous) => !previous)}
          style={styles.sortButton}
        />
      </View>

      {errorMessage ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : null}

      <View style={styles.body}>{renderBody()}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    flex: 1,
    paddingBottom: 18,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  title: {
    color: COLORS.primaryText,
    fontSize: 26,
    fontWeight: "700",
  },
  subtitle: {
    color: COLORS.secondaryText,
    fontSize: 14,
    marginTop: 6,
  },
  controlsRow: {
    alignItems: "center",
    flexDirection: "row",
    marginTop: 18,
  },
  searchInput: {
    borderColor: COLORS.secondaryText,
    borderRadius: 12,
    borderWidth: 1,
    color: COLORS.primaryText,
    flex: 1,
    fontSize: 16,
    marginRight: 10,
    minHeight: 48,
    paddingHorizontal: 12,
  },
  sortButton: {
    minWidth: 84,
  },
  errorText: {
    color: COLORS.secondaryText,
    fontSize: 13,
    marginTop: 10,
  },
  body: {
    flex: 1,
    marginTop: 14,
  },
  listContent: {
    paddingBottom: 28,
  },
  centeredState: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  secondaryText: {
    color: COLORS.secondaryText,
    fontSize: 14,
    marginTop: 10,
  },
  gap: {
    gap: 12,
  },
});
