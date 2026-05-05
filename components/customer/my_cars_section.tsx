import { useGetMyCars } from "@/api/car.api";
import React from "react";
import { FlatList, Image, StyleSheet, Text, View } from "react-native";

export default function MyCarsSection() {
  const { data: cars } = useGetMyCars();
  console.log(cars);
  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>My Car</Text>
      <FlatList
        data={cars}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.carListContent}
        ItemSeparatorComponent={() => <View style={{ width: 14 }} />}
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No cars added yet.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.carCard}>
            <Image
              source={{ uri: item.image_url }}
              style={styles.carImage}
              resizeMode="cover"
            />
            <View style={{ paddingHorizontal: 10, paddingBottom: 8 }}>
              <Text style={styles.carName} numberOfLines={1}>
                {item.brand} {item.model}
              </Text>
              <Text style={styles.carPlate}>{item.license_plate}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 14,
  },
  carListContent: {
    paddingRight: 4,
  },
  carCard: {
    overflow: "hidden",

    borderWidth: 1,
    borderColor: "#eee",
    width: 260,
    borderRadius: 8,
  },
  carImage: {
    width: "auto",
    height: 110,

    backgroundColor: "#e9ecef",
    marginBottom: 8,
  },
  carName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  carPlate: {
    fontSize: 14,
    color: "#6e6e6e",
    marginTop: 2,
  },
  emptyCard: {
    width: 160,
    height: 110,
    borderRadius: 8,
    backgroundColor: "#f1f3f5",
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 13,
    color: "#aaa",
  },
});
