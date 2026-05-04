import { Colors } from "@/colors/colors";
import { useAuthStore } from "@/store/auth.store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
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

  useEffect(() => {
    const unsub = useAuthStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });

    if (useAuthStore.persist.hasHydrated()) {
      setHydrated(true);
    }

    return () => unsub();
  }, []);

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
        <Stack
          screenOptions={{
            headerShown: true,
            headerStyle: {
              backgroundColor: "#fff",
            },
            headerTintColor: Colors.primary,
            headerTitleStyle: {
              fontWeight: "bold",
              fontSize: 18,
            },
            headerShadowVisible: false,
            headerTitleAlign: "center",
          }}
        >
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
            name="customer/add-car"
            options={{ title: "Add New Car" }}
          />
          <Stack.Screen name="customer/home" options={{ title: "Dashboard" }} />
          <Stack.Screen
            name="mechanic/home"
            options={{ title: "Mechanic Dashboard" }}
          />
        </Stack>
        <StatusBar style="auto" />

        <Toast position="bottom" />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
