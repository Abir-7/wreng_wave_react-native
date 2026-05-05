import { Colors } from "@/colors/colors";
import React from "react";
import {
  DefaultValues,
  FieldValues,
  FormProvider,
  Resolver,
  useForm,
} from "react-hook-form";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface FormWrapperProps<T extends FieldValues> {
  children: React.ReactNode;
  onSubmit?: (data: T) => void;
  defaultValues?: DefaultValues<T>;
  resolver?: Resolver<T>;
  submitLabel?: string;
  isLoading?: boolean;
  title?: string;
  subtitle?: string;
  footer?: React.ReactNode;
}

export default function FormWrapper<T extends FieldValues>({
  children,
  onSubmit,
  defaultValues,
  resolver,
  submitLabel = "Submit",
  isLoading = false,
  title,
  subtitle,
  footer,
}: FormWrapperProps<T>) {
  const methods = useForm<T>({ resolver, defaultValues });

  const content = (
    <View style={styles.formContainer}>
      {title && <Text style={styles.title}>{title}</Text>}
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}

      <View style={styles.fieldsContainer}>{children}</View>

      {onSubmit && (
        <TouchableOpacity
          style={styles.button}
          onPress={methods.handleSubmit(onSubmit)}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? "Loading..." : submitLabel}
          </Text>
        </TouchableOpacity>
      )}

      {footer && <View style={styles.footerContainer}>{footer}</View>}
    </View>
  );

  return onSubmit ? (
    <FormProvider {...methods}>{content}</FormProvider>
  ) : (
    <View>{content}</View>
  );
}

const styles = StyleSheet.create({
  formContainer: {
    width: "100%",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 24,
  },
  fieldsContainer: {
    marginBottom: 16,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  footerContainer: {
    marginTop: 16,
  },
});
