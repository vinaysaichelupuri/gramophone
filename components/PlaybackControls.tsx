import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { COLORS } from "@/utils/colors";
import { RepeatMode } from "@/services/playerService";

interface PlaybackControlsProps {
  isPlaying: boolean;
  repeatMode: RepeatMode;
  isShuffleEnabled: boolean;
  onPlayPausePress: () => void;
  onNextPress: () => void;
  onPreviousPress: () => void;
  onShufflePress: () => void;
  onRepeatPress: () => void;
}

export function PlaybackControls({
  isPlaying,
  repeatMode,
  isShuffleEnabled,
  onPlayPausePress,
  onNextPress,
  onPreviousPress,
  onShufflePress,
  onRepeatPress,
}: PlaybackControlsProps) {
  const getRepeatIcon = (): React.ComponentProps<typeof Ionicons>["name"] => {
    return "repeat";
  };

  const isRepeatActive = repeatMode !== "off";

  return (
    <View style={styles.controlsRow}>
      <Pressable onPress={onShufflePress} style={styles.secondaryButton}>
        <Ionicons
          name="shuffle"
          size={24}
          color={isShuffleEnabled ? COLORS.accent : COLORS.secondaryText}
        />
      </Pressable>

      <Pressable onPress={onPreviousPress} style={styles.secondaryButton}>
        <Ionicons name="play-skip-back" size={28} color={COLORS.primaryText} />
      </Pressable>

      <Pressable onPress={onPlayPausePress} style={styles.playPauseButton}>
        <Ionicons
          name={isPlaying ? "pause-circle" : "play-circle"}
          size={80}
          color={COLORS.primaryText}
        />
      </Pressable>

      <Pressable onPress={onNextPress} style={styles.secondaryButton}>
        <Ionicons name="play-skip-forward" size={28} color={COLORS.primaryText} />
      </Pressable>

      <Pressable onPress={onRepeatPress} style={styles.secondaryButton}>
        <View>
          <Ionicons
            name={getRepeatIcon()}
            size={24}
            color={isRepeatActive ? COLORS.accent : COLORS.secondaryText}
          />
          {repeatMode === "one" && (
            <View style={styles.repeatOneBadge}>
              <Text style={styles.repeatOneText}>1</Text>
            </View>
          )}
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  controlsRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    width: "100%",
  },
  playPauseButton: {
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButton: {
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
  repeatOneBadge: {
    alignItems: "center",
    backgroundColor: COLORS.background,
    borderRadius: 6,
    bottom: -2,
    height: 12,
    justifyContent: "center",
    position: "absolute",
    right: -2,
    width: 12,
  },
  repeatOneText: {
    color: COLORS.accent,
    fontSize: 8,
    fontWeight: "bold",
    lineHeight: 12,
  },
});
