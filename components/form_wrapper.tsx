import { Colors } from "@/colors/colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  DefaultValues,
  FieldValues,
  FormProvider,
  Resolver,
  useForm,
} from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface FormWrapperProps<T extends FieldValues> {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  showBack?: boolean;
  submitLabel?: string;
  defaultValues?: DefaultValues<T>;
  isLoading?: boolean;
  resolver?: Resolver<T>;
  onSubmit: (data: T) => void;
}

export default function FormWrapper<T extends FieldValues>({
  title,
  subtitle,
  children,
  footer,
  showBack = true,
  submitLabel = "Submit",
  defaultValues,
  isLoading = false,
  resolver,
  onSubmit,
}: FormWrapperProps<T>) {
  const router = useRouter();
  const methods = useForm<T>({ resolver, defaultValues });

  return (
    <FormProvider {...methods}>
      <SafeAreaView
        style={{ flex: 1, backgroundColor: "#f5f5f5" }}
        edges={["top", "left", "right"]}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.container}>
              {/* Back Button */}
              {showBack && (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <TouchableOpacity onPress={() => router.back()}>
                    <View
                      style={{
                        height: 30,
                        width: 30,
                        borderRadius: 20,
                        justifyContent: "center",
                        alignItems: "center",
                        backgroundColor: Colors.primary,
                      }}
                    >
                      <Ionicons name={"arrow-back"} size={20} color="#fff" />
                    </View>
                  </TouchableOpacity>
                  <Text style={{ fontSize: 25, fontWeight: "bold" }}>
                    Wrengwave
                  </Text>
                </View>
              )}

              {/* Card */}
              <View style={styles.card}>
                {/* Header */}
                <Text style={styles.title}>{title}</Text>
                {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}

                {/* Children */}
                <View style={{ marginTop: 20 }}>{children}</View>

                {/* Submit Button */}
                <TouchableOpacity
                  style={styles.button}
                  onPress={methods.handleSubmit(onSubmit)}
                >
                  <Text style={styles.buttonText}>
                    {isLoading ? "Loading..." : submitLabel}
                  </Text>
                </TouchableOpacity>

                {/* Footer */}
                {footer && <View style={{ marginTop: 10 }}>{footer}</View>}
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </FormProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  card: {},
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 6,
    marginTop: 90,
  },
  subtitle: {
    fontSize: 15,
    color: "#888",
    marginBottom: 32,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
