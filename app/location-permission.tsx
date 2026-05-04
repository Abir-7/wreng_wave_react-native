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
import { SafeAreaView } from "react-native-safe-area-context";
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
      console.log("Requesting location...");
      // 1. Check if location services are enabled
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

      // 2. Request permissions
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

      // 3. Get current position with higher accuracy
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      console.log("Location received:", location.coords);

      const userIdStr = Array.isArray(user_id) ? user_id[0] : user_id;
      const roleStr = Array.isArray(role) ? role[0] : role;

      if (!userIdStr) {
        console.error("User ID missing in search params");
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "User ID is missing. Please try signing up again.",
        });
        setLoading(false);
        return;
      }

      // 4. Update location via API
      console.log("Calling updateLocation API...");
      updateLocation(
        {
          user_id: userIdStr,
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
        {
          onSuccess: () => {
            console.log("Location updated successfully");
            router.replace({ pathname: "/login", params: { role: roleStr } });
          },
          onError: (error: any) => {
            console.error("API Error in LocationPermission:", error);
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
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="location" size={80} color={Colors.primary} />
        </View>
        <Text style={styles.title}>Enable Location</Text>
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },
  iconContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 15,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 50,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 18,
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
