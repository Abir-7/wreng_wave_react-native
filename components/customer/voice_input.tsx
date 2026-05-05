import { Colors } from "@/colors/colors";
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  useAudioPlayer,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export interface VoiceRecording {
  uri: string;
  durationMillis: number;
}

interface VoiceRecorderProps {
  value: VoiceRecording | null;
  onChange: (recording: VoiceRecording | null) => void;
}

function formatDuration(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

// ─── Pulsing ring animation ───────────────────────────────────────────────────
function PulseRing({ active }: { active: boolean }) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    if (active) {
      Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(scale, {
              toValue: 1.5,
              duration: 700,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(scale, {
              toValue: 1,
              duration: 700,
              easing: Easing.in(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(opacity, {
              toValue: 0,
              duration: 700,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0.6,
              duration: 700,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ).start();
    } else {
      scale.stopAnimation();
      opacity.stopAnimation();
      scale.setValue(1);
      opacity.setValue(0.6);
    }
  }, [active]);

  if (!active) return null;

  return (
    <Animated.View
      style={[modalStyles.pulseRing, { transform: [{ scale }], opacity }]}
    />
  );
}

// ─── Waveform bars ────────────────────────────────────────────────────────────
function WaveformBars({
  active,
  count = 28,
}: {
  active: boolean;
  count?: number;
}) {
  const animations = useRef(
    Array.from({ length: count }, () => new Animated.Value(0.3)),
  ).current;

  useEffect(() => {
    if (active) {
      const loops = animations.map((anim, i) =>
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: 0.3 + Math.random() * 0.7,
              duration: 250 + Math.random() * 300,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: false,
              delay: i * 20,
            }),
            Animated.timing(anim, {
              toValue: 0.1 + Math.random() * 0.3,
              duration: 250 + Math.random() * 300,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: false,
            }),
          ]),
        ),
      );
      loops.forEach((l) => l.start());
      return () => loops.forEach((l) => l.stop());
    } else {
      animations.forEach((a) => a.setValue(0.3));
    }
  }, [active]);

  return (
    <View style={modalStyles.waveContainer}>
      {animations.map((anim, i) => (
        <Animated.View
          key={i}
          style={[
            modalStyles.waveBar,
            {
              height: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [4, 28],
              }),
              opacity: active ? 1 : 0.4,
            },
          ]}
        />
      ))}
    </View>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function VoiceRecorder({ value, onChange }: VoiceRecorderProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0); // ms — synced from recorder state

  // ── expo-audio hooks ──────────────────────────────────────────────────────
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder, 100); // poll every 100 ms
  const player = useAudioPlayer(value?.uri ?? "");

  const isRecording = recorderState.isRecording;

  // Keep elapsed in sync with recorder's own meter
  useEffect(() => {
    if (isRecording) {
      setElapsed(Math.round(recorderState.durationMillis ?? 0));
    }
  }, [recorderState.durationMillis, isRecording]);

  // Auto-stop playing state when playback finishes
  useEffect(() => {
    if (!player.playing && isPlaying) {
      setIsPlaying(false);
    }
  }, [player.playing]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isRecording) recorder.stop();
    };
  }, []);

  const startRecording = async () => {
    try {
      const { granted } = await requestRecordingPermissionsAsync();
      if (!granted) return;
      setElapsed(0);
      await recorder.record();
    } catch (e) {
      console.error("Failed to start recording", e);
    }
  };

  const stopRecording = async () => {
    try {
      const durationMillis = recorderState.durationMillis ?? elapsed;
      await recorder.stop();
      const uri = recorder.uri;
      if (uri) {
        onChange({ uri, durationMillis });
      }
    } catch (e) {
      console.error("Failed to stop recording", e);
    }
  };

  const playRecording = () => {
    if (!value?.uri) return;
    player.seekTo(0);
    player.play();
    setIsPlaying(true);
  };

  const stopPlayback = () => {
    player.pause();
    setIsPlaying(false);
  };

  const deleteRecording = () => {
    onChange(null);
    setElapsed(0);
    setIsPlaying(false);
  };

  const handleClose = async () => {
    if (isRecording) await stopRecording();
    setModalVisible(false);
  };

  const displayDuration = isRecording
    ? formatDuration(elapsed)
    : value
      ? formatDuration(value.durationMillis)
      : "0:00";

  return (
    <>
      {/* ── Inline row (shown in parent) ── */}
      <View style={inlineStyles.row}>
        <TouchableOpacity
          style={[inlineStyles.playBtn, !value && inlineStyles.playBtnDisabled]}
          onPress={() => {
            if (!value) {
              setModalVisible(true);
            } else if (isPlaying) {
              stopPlayback();
            } else {
              playRecording();
            }
          }}
          activeOpacity={0.8}
        >
          <Text style={inlineStyles.playIcon}>{isPlaying ? "⏹" : "▶"}</Text>
        </TouchableOpacity>

        <View style={inlineStyles.waveform}>
          {Array.from({ length: 28 }).map((_, i) => (
            <View
              key={i}
              style={[
                inlineStyles.waveBar,
                { height: 6 + Math.abs(Math.sin(i * 0.7)) * 12 },
                value &&
                  i < Math.floor((i / 28) * 28) &&
                  inlineStyles.waveBarActive,
                value && inlineStyles.waveBarFilled,
              ]}
            />
          ))}
        </View>

        <Text style={inlineStyles.duration}>{displayDuration}</Text>

        {value ? (
          <>
            <View style={inlineStyles.checkBadge}>
              <Text style={{ color: "#fff", fontSize: 12 }}>✓</Text>
            </View>
            <TouchableOpacity
              style={inlineStyles.deleteBtn}
              onPress={deleteRecording}
            >
              <Text style={inlineStyles.deleteIcon}>🗑</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={inlineStyles.rerecordBtn}
              onPress={() => setModalVisible(true)}
            >
              <Text style={inlineStyles.rerecordText}>Re-record</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={inlineStyles.recordBtn}
            onPress={() => setModalVisible(true)}
          >
            <Text style={inlineStyles.recordBtnText}>Record</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ── Recording Modal ── */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={handleClose}
      >
        <View style={modalStyles.overlay}>
          <View style={modalStyles.sheet}>
            {/* Header */}
            <View style={modalStyles.header}>
              <Text style={modalStyles.title}>Voice Note</Text>
              <TouchableOpacity
                onPress={handleClose}
                style={modalStyles.closeBtn}
              >
                <Text style={modalStyles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Waveform visualizer */}
            <View style={modalStyles.visualizerBox}>
              <WaveformBars active={isRecording} />
            </View>

            {/* Timer */}
            <Text style={modalStyles.timer}>{formatDuration(elapsed)}</Text>
            <Text style={modalStyles.hint}>
              {isRecording ? "Recording…" : "Tap the mic to start"}
            </Text>

            {/* Mic button */}
            <View style={modalStyles.micWrapper}>
              <PulseRing active={isRecording} />
              <TouchableOpacity
                style={[
                  modalStyles.micBtn,
                  isRecording && modalStyles.micBtnActive,
                ]}
                onPress={isRecording ? stopRecording : startRecording}
                activeOpacity={0.85}
              >
                <Text style={modalStyles.micIcon}>
                  {isRecording ? "⏹" : "🎙"}
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={modalStyles.subHint}>
              {isRecording
                ? "Tap to stop"
                : value
                  ? "Tap to re-record"
                  : "Tap to record"}
            </Text>
          </View>
        </View>
      </Modal>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const inlineStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#ffe4d2b6",
    padding: 10,
    borderRadius: 10,
    flexWrap: "wrap",
  },
  playBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  playBtnDisabled: { backgroundColor: "#ccc" },
  playIcon: { color: "#fff", fontSize: 14, marginLeft: 2 },
  waveform: { flex: 1, flexDirection: "row", alignItems: "center", gap: 2 },
  waveBar: {
    width: 3,
    borderRadius: 2,
    backgroundColor: "#ddd",
  },
  waveBarActive: { backgroundColor: Colors.primary },
  waveBarFilled: { backgroundColor: Colors.primary, opacity: 0.6 },
  duration: { fontSize: 12, color: "#888" },
  checkBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#27ae60",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteBtn: { padding: 4 },
  deleteIcon: { fontSize: 16 },
  recordBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  recordBtnText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  rerecordBtn: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  rerecordText: { color: Colors.primary, fontSize: 11, fontWeight: "700" },
});

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
    alignItems: "center",
  },
  header: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  title: { fontSize: 17, fontWeight: "700", color: "#1a1a2e" },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
  },
  closeText: { fontSize: 13, color: "#555", fontWeight: "700" },

  visualizerBox: {
    width: "100%",
    height: 60,
    backgroundColor: "#fdf4ee",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    overflow: "hidden",
  },
  waveContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 10,
  },
  waveBar: {
    width: 4,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },

  timer: {
    fontSize: 40,
    fontWeight: "800",
    color: "#1a1a2e",
    letterSpacing: 2,
    marginBottom: 6,
  },
  hint: { fontSize: 13, color: "#999", marginBottom: 36 },

  micWrapper: {
    width: 96,
    height: 96,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  pulseRing: {
    position: "absolute",
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.primary,
  },
  micBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.primary,
    shadowOpacity: 0.45,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  micBtnActive: { backgroundColor: "#e74c3c" },
  micIcon: { fontSize: 32 },
  subHint: { fontSize: 13, color: "#bbb", fontWeight: "600" },
});
