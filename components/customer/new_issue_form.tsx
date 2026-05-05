import { useGetMyCars } from "@/api/car.api";
import { Colors } from "@/colors/colors";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import React, { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import CustomTimePicker from "./custome_timepicker";
import VoiceRecorder, { VoiceRecording } from "./voice_input";

export interface MyCarsResponse {
  id: string;
  brand: string;
  model: string;
  year: number;
  license_plate: string;
  tag_number: string;
  user_id: string;
  image_url: string;
  created_at: string;
  updated_at: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const DAYS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDay(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}
function chunkArray<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

const MAX_PHOTOS = 3;

// ─── Sub-components ──────────────────────────────────────────────────────────
function SectionCard({ children }: { children: React.ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

function SectionTitle({ title }: { title: string }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

function CarCard({
  car,
  selected,
  onPress,
}: {
  car: MyCarsResponse;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.carItem, selected && styles.carItemSelected]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {car.image_url ? (
        <Image
          source={{ uri: car.image_url }}
          style={styles.carImage}
          resizeMode="contain"
        />
      ) : (
        <View style={styles.carImagePlaceholder}>
          <Text style={styles.carEmoji}>🚗</Text>
        </View>
      )}
      <Text
        style={[styles.carLabel, selected && styles.carLabelSelected]}
        numberOfLines={1}
      >
        {car.brand} {car.model}
      </Text>
      {selected && (
        <View style={styles.carCheck}>
          <Text style={{ color: "#fff", fontSize: 10, fontWeight: "700" }}>
            ✓
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

function InlineCalendar({
  selected,
  onSelect,
}: {
  selected: Date | null;
  onSelect: (d: Date) => void;
}) {
  const today = selected || new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDay(viewYear, viewMonth);
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else setViewMonth((m) => m + 1);
  };

  return (
    <View>
      <View style={cal.header}>
        <TouchableOpacity onPress={prevMonth} style={cal.arrow}>
          <Text style={cal.arrowText}>{"<"}</Text>
        </TouchableOpacity>
        <Text style={cal.monthLabel}>
          {MONTHS[viewMonth]} {viewYear}
        </Text>
        <TouchableOpacity onPress={nextMonth} style={cal.arrow}>
          <Text style={cal.arrowText}>{">"}</Text>
        </TouchableOpacity>
      </View>
      <View style={cal.row}>
        {DAYS.map((d, i) => (
          <Text key={i} style={cal.dayLabel}>
            {d}
          </Text>
        ))}
      </View>
      {chunkArray(cells, 7).map((week, wi) => (
        <View key={wi} style={cal.row}>
          {week.map((day, di) => {
            if (!day) return <View key={di} style={cal.cell} />;
            const isSelected =
              selected &&
              selected.getDate() === day &&
              selected.getMonth() === viewMonth &&
              selected.getFullYear() === viewYear;
            return (
              <TouchableOpacity
                key={di}
                style={[cal.cell, isSelected && cal.selectedCell]}
                onPress={() => onSelect(new Date(viewYear, viewMonth, day))}
              >
                <Text style={[cal.dayNum, isSelected && cal.selectedDay]}>
                  {day}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
}

function TimeRow({
  time,
  setTime,
}: {
  time: Date | null;
  setTime: (t: Date) => void;
}) {
  const [showPicker, setShowPicker] = useState(false);
  const [ampm, setAmpm] = useState<"AM" | "PM">("AM");
  const display = time
    ? `${String(time.getHours() % 12 || 12).padStart(2, "0")} : ${String(time.getMinutes()).padStart(2, "0")}`
    : "09 : 00";

  return (
    <View style={tr.row}>
      <Text style={tr.label}>Time</Text>
      <TouchableOpacity onPress={() => setShowPicker(true)} style={tr.timeBox}>
        <Text style={tr.timeText}>{display}</Text>
      </TouchableOpacity>
      <View style={tr.ampmBox}>
        {(["AM", "PM"] as const).map((v) => (
          <TouchableOpacity
            key={v}
            style={[tr.ampmBtn, ampm === v && tr.ampmActive]}
            onPress={() => setAmpm(v)}
          >
            <Text style={[tr.ampmText, ampm === v && tr.ampmActiveText]}>
              {v}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <CustomTimePicker
        visible={showPicker}
        value={time}
        onConfirm={(t) => {
          setTime(t);
          setShowPicker(false);
        }}
        onCancel={() => setShowPicker(false)}
      />
    </View>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function ServiceRequestSection() {
  const { data: cars } = useGetMyCars();

  const [selectedCarId, setSelectedCarId] = useState<string | null>(null);
  const [images, setImages] = useState<any[]>([]);
  const [voiceRecording, setVoiceRecording] = useState<VoiceRecording | null>(
    null,
  ); // 👈 replaced `audio`
  const [description, setDescription] = useState("");
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<Date | null>(null);
  const [locationText, setLocationText] = useState("123 Market St, Suite 450");

  const pickImages = async () => {
    if (images.length >= MAX_PHOTOS) return;
    const remaining = MAX_PHOTOS - images.length;
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled) {
      const newAssets = result.assets.slice(0, remaining);
      setImages((prev) => [...prev, ...newAssets]);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const getCurrentLocation = async () => {
    const perm = await Location.requestForegroundPermissionsAsync();
    if (!perm.granted) return;
    const loc = await Location.getCurrentPositionAsync({});
    setLocationText(
      `${loc.coords.latitude.toFixed(4)}, ${loc.coords.longitude.toFixed(4)}`,
    );
  };

  return (
    <View style={styles.root}>
      {/* ── Select Your Car ── */}
      <SectionCard>
        <SectionTitle title="Select Your Car" />
        {!cars || cars.length === 0 ? (
          <View style={styles.noCarsBox}>
            <Text style={styles.noCarsText}>
              No cars found. Add a car first.
            </Text>
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.carRow}>
              {cars.map((car) => (
                <CarCard
                  key={car.id}
                  car={car}
                  selected={selectedCarId === car.id}
                  onPress={() => setSelectedCarId(car.id)}
                />
              ))}
              <TouchableOpacity style={styles.addCarBtn}>
                <Text style={styles.addCarPlus}>＋</Text>
                <Text style={styles.addCarLabel}>Add Car</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}
      </SectionCard>

      {/* ── Add Photo ── */}
      <SectionCard>
        <View style={styles.photoHeader}>
          <SectionTitle title="Add Photo" />
          <Text style={styles.photoCount}>
            {images.length}/{MAX_PHOTOS}
          </Text>
        </View>
        <View style={styles.photoRow}>
          {images.map((img, i) => (
            <View key={i} style={styles.photoThumb}>
              <Image source={{ uri: img.uri }} style={styles.photoImg} />
              <TouchableOpacity
                style={styles.photoRemove}
                onPress={() => removeImage(i)}
              >
                <Text
                  style={{ color: "#fff", fontSize: 10, fontWeight: "700" }}
                >
                  ✕
                </Text>
              </TouchableOpacity>
            </View>
          ))}
          {images.length < MAX_PHOTOS && (
            <TouchableOpacity style={styles.addPhotoBtn} onPress={pickImages}>
              <Text style={styles.addPhotoIcon}>📷</Text>
              <Text style={styles.addPhotoLabel}>
                {MAX_PHOTOS - images.length} left
              </Text>
            </TouchableOpacity>
          )}
        </View>
        {images.length >= MAX_PHOTOS && (
          <Text style={styles.photoLimitNote}>
            Maximum of {MAX_PHOTOS} photos reached.
          </Text>
        )}
      </SectionCard>

      {/* ── Record Voice Note ── */}
      {/* 👇 Replaced old DocumentPicker-based voice section with VoiceRecorder */}
      <SectionCard>
        <SectionTitle title="Record Voice Note" />
        <VoiceRecorder value={voiceRecording} onChange={setVoiceRecording} />
      </SectionCard>

      {/* ── Describe Problem ── */}
      <SectionCard>
        <View style={styles.descHeader}>
          <SectionTitle title="Describe problem" />
          <View style={styles.optionalBadge}>
            <Text style={styles.optionalText}>Optional</Text>
          </View>
        </View>
        <TextInput
          placeholder="e.g. Engine is making a strange noise"
          placeholderTextColor="#bbb"
          value={description}
          onChangeText={setDescription}
          style={styles.descInput}
          multiline
        />
      </SectionCard>

      {/* ── Choose Date & Time ── */}
      <SectionCard>
        <SectionTitle title="Choose Date & Time" />
        <InlineCalendar selected={date} onSelect={setDate} />
        <View style={styles.divider} />
        <TimeRow time={time} setTime={setTime} />
      </SectionCard>

      {/* ── Location ── */}
      <SectionCard>
        <SectionTitle title="Location" />
        <View style={styles.locationRow}>
          <Text style={styles.locationPin}>📍</Text>
          <TextInput
            value={locationText}
            onChangeText={setLocationText}
            style={styles.locationInput}
          />
          <TouchableOpacity>
            <Text style={styles.locationEdit}>✏️</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.currentLocBtn}
          onPress={getCurrentLocation}
        >
          <Text style={styles.currentLocIcon}>◎</Text>
          <Text style={styles.currentLocText}>Use current location</Text>
        </TouchableOpacity>
      </SectionCard>

      {/* ── CTA ── */}
      <TouchableOpacity style={styles.ctaBtn} activeOpacity={0.85}>
        <Text style={styles.ctaText}>Analysis With AI</Text>
      </TouchableOpacity>

      <View style={{ height: 32 }} />
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, padding: 0, margin: 0 },
  card: { borderRadius: 16, padding: 16 },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1a1a2e",
    marginBottom: 12,
  },

  noCarsBox: {
    paddingVertical: 16,
    alignItems: "center",
    backgroundColor: "#f8f9ff",
    borderRadius: 10,
  },
  noCarsText: { color: "#aaa", fontSize: 13 },

  carRow: { flexDirection: "row", gap: 10 },
  carItem: {
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#eee",
    borderRadius: 8,
    padding: 8,
    width: 95,
    position: "relative",
  },
  carItemSelected: { borderColor: Colors.primary, backgroundColor: "#f0f6ff" },
  carImage: { width: 100, height: 44, borderRadius: 8 },
  carImagePlaceholder: {
    width: 100,
    height: 44,
    backgroundColor: "#f0f4ff",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  carEmoji: { fontSize: 26 },
  carLabel: {
    fontSize: 11,
    color: "#555",
    marginTop: 5,
    textAlign: "center",
    fontWeight: "600",
  },
  carLabelSelected: { color: Colors.primary },
  carYear: { fontSize: 10, color: "#aaa", marginTop: 1 },
  carCheck: {
    position: "absolute",
    top: -7,
    right: -7,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  addCarBtn: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#dce6ff",
    borderRadius: 12,
    borderStyle: "dashed",
    padding: 8,
    width: 95,
  },
  addCarPlus: { fontSize: 24, color: Colors.primary },
  addCarLabel: {
    fontSize: 11,
    color: Colors.primary,
    marginTop: 2,
    fontWeight: "600",
  },

  photoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  photoCount: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.primary,
    backgroundColor: "#f0f6ff",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    marginBottom: 12,
  },
  photoRow: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
  photoThumb: { position: "relative" },
  photoImg: { width: 80, height: 80, borderRadius: 12 },
  photoRemove: {
    position: "absolute",
    top: -7,
    right: -7,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#e74c3c",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  addPhotoBtn: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: "#f0f4ff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#dce6ff",
    borderStyle: "dashed",
  },
  addPhotoIcon: { fontSize: 24 },
  addPhotoLabel: {
    fontSize: 10,
    color: Colors.primary,
    marginTop: 3,
    fontWeight: "600",
  },
  photoLimitNote: { fontSize: 11, color: "#e74c3c", marginTop: 8 },

  descHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  optionalBadge: {
    backgroundColor: "#f0f4ff",
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginBottom: 12,
  },
  optionalText: { fontSize: 11, color: Colors.primary, fontWeight: "600" },
  descInput: {
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 10,
    padding: 12,
    minHeight: 70,
    fontSize: 13,
    color: "#333",
    backgroundColor: "#fafafa",
  },

  divider: { height: 1, backgroundColor: "#f0f0f0", marginVertical: 14 },

  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#f8f9ff",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  locationPin: { fontSize: 16 },
  locationInput: { flex: 1, fontSize: 13, color: "#333" },
  locationEdit: { fontSize: 16 },
  currentLocBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    justifyContent: "center",
    paddingVertical: 6,
  },
  currentLocIcon: { color: Colors.primary, fontSize: 16 },
  currentLocText: { color: Colors.primary, fontSize: 13, fontWeight: "600" },

  ctaBtn: {
    marginHorizontal: 16,
    marginTop: 20,
    backgroundColor: "#F5A623",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#F5A623",
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  ctaText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});

const cal = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  arrow: { padding: 6 },
  arrowText: { fontSize: 16, color: Colors.primary, fontWeight: "700" },
  monthLabel: { fontSize: 14, fontWeight: "700", color: "#1a1a2e" },
  row: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 4,
  },
  dayLabel: {
    width: 36,
    textAlign: "center",
    fontSize: 12,
    color: "#aaa",
    fontWeight: "600",
  },
  cell: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
  },
  selectedCell: { backgroundColor: Colors.primary },
  dayNum: { fontSize: 13, color: "#333" },
  selectedDay: { color: "#fff", fontWeight: "700" },
});

const tr = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  label: { fontSize: 14, fontWeight: "600", color: "#1a1a2e", flex: 1 },
  timeBox: {
    backgroundColor: "#f0f4ff",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  timeText: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.primary,
    letterSpacing: 1,
  },
  ampmBox: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#dce6ff",
    borderRadius: 8,
    overflow: "hidden",
  },
  ampmBtn: { paddingHorizontal: 10, paddingVertical: 8 },
  ampmActive: { backgroundColor: Colors.primary },
  ampmText: { fontSize: 12, fontWeight: "700", color: Colors.primary },
  ampmActiveText: { color: "#fff" },
});
