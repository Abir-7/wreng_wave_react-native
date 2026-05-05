import { Colors } from "@/colors/colors";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

// ─── Types ────────────────────────────────────────────────────────────────────
interface CustomTimePickerProps {
  visible: boolean;
  value: Date | null;
  onConfirm: (date: Date) => void;
  onCancel: () => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const ITEM_HEIGHT = 48;
const VISIBLE_ITEMS = 5;
const SCROLL_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

const HOURS = Array.from({ length: 12 }, (_, i) =>
  String(i + 1).padStart(2, "0"),
);
const MINUTES = Array.from({ length: 60 }, (_, i) =>
  String(i).padStart(2, "0"),
);

// ─── Drum Scroll ──────────────────────────────────────────────────────────────
function DrumScroll({
  items,
  selectedIndex,
  onChange,
}: {
  items: string[];
  selectedIndex: number;
  onChange: (index: number) => void;
}) {
  const scrollRef = useRef<ScrollView>(null);
  const isScrolling = useRef(false);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      y: selectedIndex * ITEM_HEIGHT,
      animated: false,
    });
  }, []);

  const handleMomentumEnd = (e: any) => {
    const y = e.nativeEvent.contentOffset.y;
    const index = Math.round(y / ITEM_HEIGHT);
    const clamped = Math.max(0, Math.min(items.length - 1, index));
    onChange(clamped);
    scrollRef.current?.scrollTo({ y: clamped * ITEM_HEIGHT, animated: true });
    isScrolling.current = false;
  };

  return (
    <View style={drum.wrapper}>
      {/* Selection highlight */}
      <View style={drum.highlight} pointerEvents="none" />

      {/* Top / bottom fade */}
      <View style={[drum.fade, drum.fadeTop]} pointerEvents="none" />
      <View style={[drum.fade, drum.fadeBottom]} pointerEvents="none" />

      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onMomentumScrollEnd={handleMomentumEnd}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingVertical: ITEM_HEIGHT * 2 }}
        style={{ height: SCROLL_HEIGHT }}
      >
        {items.map((item, i) => {
          const isSelected = i === selectedIndex;
          return (
            <TouchableOpacity
              key={item}
              style={drum.item}
              onPress={() => {
                onChange(i);
                scrollRef.current?.scrollTo({
                  y: i * ITEM_HEIGHT,
                  animated: true,
                });
              }}
              activeOpacity={0.7}
            >
              <Text
                style={[drum.itemText, isSelected && drum.itemTextSelected]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function CustomTimePicker({
  visible,
  value,
  onConfirm,
  onCancel,
}: CustomTimePickerProps) {
  const slideAnim = useRef(new Animated.Value(300)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const initHour = value ? value.getHours() % 12 || 12 : 9;
  const initMinute = value ? value.getMinutes() : 0;
  const initAmpm = value ? (value.getHours() >= 12 ? 1 : 0) : 0;

  const [hourIndex, setHourIndex] = useState(initHour - 1);
  const [minuteIndex, setMinuteIndex] = useState(initMinute);
  const [ampmIndex, setAmpmIndex] = useState(initAmpm);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 11,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 300,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleConfirm = () => {
    const hour12 = hourIndex + 1;
    let hour24 = hour12 % 12;
    if (ampmIndex === 1) hour24 += 12;
    const d = new Date();
    d.setHours(hour24, minuteIndex, 0, 0);
    onConfirm(d);
  };

  const formattedHour = HOURS[hourIndex];
  const formattedMinute = MINUTES[minuteIndex];
  const ampmLabel = ampmIndex === 0 ? "AM" : "PM";

  return (
    <Modal transparent visible={visible} animationType="none">
      <TouchableWithoutFeedback onPress={onCancel}>
        <Animated.View style={[styles.overlay, { opacity: fadeAnim }]} />
      </TouchableWithoutFeedback>

      <Animated.View
        style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}
      >
        {/* Handle */}
        <View style={styles.handle} />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onCancel} style={styles.headerBtn}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>

          <View style={styles.previewBox}>
            <Text style={styles.previewText}>
              {formattedHour}:{formattedMinute}{" "}
              <Text style={styles.previewAmpm}>{ampmLabel}</Text>
            </Text>
          </View>

          <TouchableOpacity onPress={handleConfirm} style={styles.headerBtn}>
            <Text style={styles.confirmText}>Done</Text>
          </TouchableOpacity>
        </View>

        {/* Picker drums */}
        <View style={styles.pickerRow}>
          {/* Hour */}
          <View style={styles.drumColumn}>
            <Text style={styles.drumLabel}>Hour</Text>
            <DrumScroll
              items={HOURS}
              selectedIndex={hourIndex}
              onChange={setHourIndex}
            />
          </View>

          <Text style={styles.colon}>:</Text>

          {/* Minute */}
          <View style={styles.drumColumn}>
            <Text style={styles.drumLabel}>Min</Text>
            <DrumScroll
              items={MINUTES}
              selectedIndex={minuteIndex}
              onChange={setMinuteIndex}
            />
          </View>

          {/* AM / PM */}
          <View style={styles.ampmColumn}>
            <Text style={styles.drumLabel}> </Text>
            <View style={styles.ampmContainer}>
              {["AM", "PM"].map((v, i) => (
                <TouchableOpacity
                  key={v}
                  style={[
                    styles.ampmBtn,
                    ampmIndex === i && styles.ampmBtnActive,
                  ]}
                  onPress={() => setAmpmIndex(i)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.ampmText,
                      ampmIndex === i && styles.ampmTextActive,
                    ]}
                  >
                    {v}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Bottom safe area */}
        <View style={{ height: 28 }} />
      </Animated.View>
    </Modal>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: -4 },
    elevation: 20,
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#e0e0e0",
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  headerBtn: { paddingHorizontal: 4, paddingVertical: 6, minWidth: 64 },
  cancelText: { fontSize: 15, color: "#999", fontWeight: "500" },
  confirmText: {
    fontSize: 15,
    color: Colors.primary,
    fontWeight: "700",
    textAlign: "right",
  },
  previewBox: {
    backgroundColor: "#f0f4ff",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  previewText: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.primary,
    letterSpacing: 1,
  },
  previewAmpm: { fontSize: 13, fontWeight: "600", color: Colors.primary },

  // Picker layout
  pickerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  drumColumn: { alignItems: "center" },
  drumLabel: {
    fontSize: 12,
    color: "#bbb",
    fontWeight: "600",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  colon: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.primary,
    marginTop: 22,
    marginHorizontal: 4,
  },
  ampmColumn: { alignItems: "center" },
  ampmContainer: {
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "transparent",
    overflow: "hidden",
    height: SCROLL_HEIGHT,
    justifyContent: "center",
  },
  ampmBtn: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    alignItems: "center",
  },
  ampmBtnActive: { backgroundColor: Colors.primary },
  ampmText: { fontSize: 14, fontWeight: "700", color: Colors.primary },
  ampmTextActive: { color: "#fff" },
});

const drum = StyleSheet.create({
  wrapper: {
    width: 80,
    height: SCROLL_HEIGHT,
    position: "relative",
    overflow: "hidden",
  },
  highlight: {
    position: "absolute",
    top: ITEM_HEIGHT * 2,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    backgroundColor: "#f0f4ff",
    borderRadius: 10,
    zIndex: 0,
  },
  fade: {
    position: "absolute",
    left: 0,
    right: 0,
    height: ITEM_HEIGHT * 1.5,
    zIndex: 2,
  },
  fadeTop: { top: 0, backgroundColor: "rgba(255,255,255,0.85)" },
  fadeBottom: { bottom: 0, backgroundColor: "rgba(255,255,255,0.85)" },
  item: {
    height: ITEM_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  itemText: {
    fontSize: 22,
    fontWeight: "500",
    color: "#ccc",
  },
  itemTextSelected: {
    color: Colors.primary,
    fontWeight: "700",
    fontSize: 26,
  },
});
