import { useLogout } from "@/api/auth.api";
import { Colors } from "@/colors/colors";
import FormWrapper from "@/components/form_wrapper";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function UserHome() {
  const { handleLogout } = useLogout();

  return (
    <FormWrapper title="Welcome, User!" subtitle="This is your dashboard.">
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Active Requests</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Total Cars</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </FormWrapper>
  );
}

const styles = StyleSheet.create({
  statsContainer: {
    flexDirection: "row",
    gap: 15,
    marginBottom: 30,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#eee",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 5,
  },
  button: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
    alignSelf: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
