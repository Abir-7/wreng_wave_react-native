import { useLogout } from "@/api/auth.api";
import { Colors } from "@/colors/colors";
import MyCarsSection from "@/components/customer/my_cars_section";
import FormWrapper from "@/components/form_wrapper";
import ScreenWrapper from "@/components/screen_wrapper";
import { useRouter } from "expo-router";

import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

export default function UserHome() {
  const { handleLogout } = useLogout();
  const router = useRouter();
  return (
    <ScreenWrapper headerShown={false}>
      <FormWrapper title="Welcome, User!" subtitle="This is your dashboard.">
        <MyCarsSection />

        <TouchableOpacity style={styles.button} onPress={handleLogout}>
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/customer/new_issue")}
        >
          <Text style={styles.buttonText}>New Issue</Text>
        </TouchableOpacity>
      </FormWrapper>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
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
