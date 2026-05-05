import { Colors } from "@/colors/colors";
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
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface FormWrapperProps<T extends FieldValues> {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  header?: React.ReactNode;
  submitLabel?: string;
  defaultValues?: DefaultValues<T>;
  isLoading?: boolean;
  resolver?: Resolver<T>;
  onSubmit?: (data: T) => void;
  headerShown?: boolean;
}

export default function FormWrapper<T extends FieldValues>({
  title,
  subtitle,
  children,
  footer,
  header,
  submitLabel = "Submit",
  defaultValues,
  isLoading = false,
  resolver,
  onSubmit,
  headerShown = true,
}: FormWrapperProps<T>) {
  const methods = useForm<T>({ resolver, defaultValues });
  const insets = useSafeAreaInsets();

  const content = (
    <View style={styles.container}>
      {/* Custom Header */}
      {header}

      {/* Card */}
      <View style={styles.card}>
        {/* Header */}
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}

        {/* Children */}
        <View style={{ marginTop: 20 }}>{children}</View>

        {/* Submit Button */}
        {onSubmit && (
          <TouchableOpacity
            style={styles.button}
            onPress={methods.handleSubmit(onSubmit)}
          >
            <Text style={styles.buttonText}>
              {isLoading ? "Loading..." : submitLabel}
            </Text>
          </TouchableOpacity>
        )}

        {/* Footer */}
        {footer && <View style={{ marginTop: 10 }}>{footer}</View>}
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0} // Adjust based on header height if needed
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingTop: headerShown ? 0 : insets.top,
            paddingBottom: insets.bottom + 20,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {onSubmit ? (
            <FormProvider {...methods}>{content}</FormProvider>
          ) : (
            content
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 24,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 10,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
