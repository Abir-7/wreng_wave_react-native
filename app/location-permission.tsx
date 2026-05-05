import { useUpdateLocation } from "@/api/auth.api";
import { Colors } from "@/colors/colors";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import FormWrapper from "@/components/form_wrapper";
import ScreenWrapper from "@/components/screen_wrapper";
import Toast from "react-native-toast-message";

const LocationPermission = () => {
  const router = useRouter();
  const { user_id, role } = useLocalSearchParams<{
    user_id: string;
    role: string;
  }>();
  const [loading, setLoading] = useState(false);
  const { mutate: updateLocation } = useUpdateLocation();

  const handleAllowLocation = async () => {
    setLoading(true);
    try {
      const enabled = await Location.hasServicesEnabledAsync();
      if (!enabled) {
        Toast.show({
          type: "error",
          text1: "Location Services Disabled",
          text2: "Please enable location services in your settings.",
        });
        setLoading(false);
        return;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Toast.show({
          type: "error",
          text1: "Permission Denied",
          text2: "Location access is required to continue.",
        });
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const userIdStr = Array.isArray(user_id) ? user_id[0] : user_id;
      const roleStr = Array.isArray(role) ? role[0] : role;

      if (!userIdStr) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "User ID is missing. Please try signing up again.",
        });
        setLoading(false);
        return;
      }

      updateLocation(
        {
          user_id: userIdStr,
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
        {
          onSuccess: () => {
            router.replace({ pathname: "/login", params: { role: roleStr } });
          },
          onSettled: () => {
            setLoading(false);
          },
        },
      );
    } catch (error) {
      console.error("Location Error:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Something went wrong while getting your location.",
      });
      setLoading(false);
    }
  };

  const handleSkip = () => {
    router.replace({ pathname: "/login", params: { role } });
  };

  return (
    <ScreenWrapper>
      <FormWrapper title="Enable Location">
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons name="location" size={80} color={Colors.primary} />
          </View>
          <Text style={styles.subtitle}>
            We need your location to provide better service and find nearby
            assistance.
          </Text>

          <TouchableOpacity
            style={styles.button}
            onPress={handleAllowLocation}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Allow Location</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkip}
            disabled={loading}
          >
            <Text style={styles.skipButtonText}>Skip for now</Text>
          </TouchableOpacity>
        </View>
      </FormWrapper>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  content: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 20,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 40,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 15,
    width: "100%",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  skipButton: {
    marginTop: 20,
    paddingVertical: 10,
  },
  skipButtonText: {
    color: "#888",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default LocationPermission;
