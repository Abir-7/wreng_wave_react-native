import { useAuthStore } from "@/store/auth.store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5,
    },
  },
});

export default function RootLayout() {
  const [hydrated, setHydrated] = useState(false);
  const {
    access_token,
    role,
    isTokenExpired,
    is_user_car_data_complete,
    is_mechanic_data_complete,
    user_id,
  } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const unsub = useAuthStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });

    if (useAuthStore.persist.hasHydrated()) {
      setHydrated(true);
    }

    return () => unsub();
  }, []);

  useEffect(() => {
    if (hydrated && access_token && role && !isTokenExpired()) {
      if (role === "customer") {
        if (!is_user_car_data_complete) {
          router.replace({
            pathname: "/customer/add-car",
            params: { user_id: user_id! },
          });
        } else {
          router.replace("/(customer)/home");
        }
      } else if (role === "mechanic") {
        if (!is_mechanic_data_complete) {
          router.replace({
            pathname: "/mechanic/complete-profile",
            params: { user_id: user_id! },
          });
        } else {
          router.replace("/(mechanic)/home");
        }
      }
    }
  }, [hydrated, access_token, role]);

  if (!hydrated) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <Stack screenOptions={{}}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ title: "Login" }} />
          <Stack.Screen name="signup" options={{ title: "Create Account" }} />
          <Stack.Screen
            name="forgot-password"
            options={{ title: "Forgot Password" }}
          />
          <Stack.Screen name="otp" options={{ title: "Verify OTP" }} />
          <Stack.Screen
            name="reset-password"
            options={{ title: "Reset Password" }}
          />
          <Stack.Screen
            name="location-permission"
            options={{ title: "Location Permission" }}
          />
          <Stack.Screen
            name="customer/add-car"
            options={{ title: "Add New Car" }}
          />
          <Stack.Screen name="(customer)" options={{ headerShown: false }} />
          <Stack.Screen
            name="mechanic/complete-profile"
            options={{ title: "Complete Profile" }}
          />
          <Stack.Screen name="(mechanic)" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="auto" />

        <Toast position="bottom" />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
