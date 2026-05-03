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

interface FormWrapperProps<T extends FieldValues> {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  showBack?: boolean;
  submitLabel?: string;
  defaultValues?: DefaultValues<T>;
  resolver?: Resolver<T>;
  onSubmit: (data: T) => void;
}

export default function FormWrapper<T extends FieldValues>({
  title,
  subtitle,
  children,
  showBack = true,
  submitLabel = "Submit",
  defaultValues,
  resolver,
  onSubmit,
}: FormWrapperProps<T>) {
  const router = useRouter();
  const methods = useForm<T>({ resolver, defaultValues });

  return (
    <FormProvider {...methods}>
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
                style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
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
                <Text style={styles.buttonText}>{submitLabel}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </FormProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 24,
    paddingTop: 60,
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
