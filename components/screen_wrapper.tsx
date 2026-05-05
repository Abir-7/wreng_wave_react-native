import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ScreenWrapperProps {
  children: React.ReactNode;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  withScroll?: boolean;
  backgroundColor?: string;
  headerShown?: boolean;
  page_title?: string;
}

export default function ScreenWrapper({
  children,
  style,
  contentContainerStyle,
  withScroll = true,
  backgroundColor = "#fff",
  page_title,
}: ScreenWrapperProps) {
  // Always include 'top' edge to be safe, especially with edgeToEdgeEnabled
  const edges: ("top" | "bottom" | "left" | "right")[] = [
    "top",
    "bottom",
    "left",
    "right",
  ];
  const router = useRouter();

  return (
    <SafeAreaView
      style={[styles.outerContainer, { backgroundColor }, style]}
      edges={edges}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      >
        {withScroll ? (
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={[
              styles.scrollContent,
              contentContainerStyle,
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={{ fontSize: 22, fontWeight: 500, marginBottom: 8 }}>
              Wrengwave
            </Text>
            {page_title && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  paddingVertical: 10,
                }}
              >
                {/* Back Button */}
                <Pressable
                  onPress={() => router.back()}
                  style={{
                    padding: 6,
                    borderRadius: 8,
                    backgroundColor: "#f2f2f2",
                  }}
                >
                  <Ionicons name="arrow-back" size={18} color="#333" />
                </Pressable>

                {/* Title */}
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "600",
                    color: "#111",
                  }}
                  numberOfLines={1}
                >
                  {page_title}
                </Text>
              </View>
            )}
            {children}
          </ScrollView>
        ) : (
          <View style={[styles.content, contentContainerStyle]}>
            {children}
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
});
