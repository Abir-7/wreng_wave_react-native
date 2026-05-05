import { useResetPassword } from "@/api/auth.api";
import { Colors } from "@/colors/colors";
import FormWrapper from "@/components/form_wrapper";
import InputField from "@/components/input_field";
import ScreenWrapper from "@/components/screen_wrapper";
import { ValidRole } from "@/store/auth.store";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { z } from "zod";

const resetPasswordSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirm_password: z
      .string()
      .min(6, "Password must be at least 6 characters"),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
  });

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

const ResetPassword = () => {
  const router = useRouter();
  const { role, user_id, token } = useLocalSearchParams<{
    role: string;
    user_id: string;
    token: string;
  }>();
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const { mutate: resetPassword, isPending } = useResetPassword();

  const onSubmit = (data: ResetPasswordForm) => {
    resetPassword(
      {
        password: data.password,
        user_id: user_id!,
        token: token!,
        role: role as ValidRole,
      },
      {
        onSuccess: () => {
          setShowSuccessModal(true);
        },
      },
    );
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    router.replace({ pathname: "/login", params: { role } });
  };

  return (
    <ScreenWrapper>
      <FormWrapper
        isLoading={isPending}
        title="New Password"
        subtitle="Set your new password"
        resolver={zodResolver(resetPasswordSchema)}
        defaultValues={{ password: "", confirm_password: "" }}
        onSubmit={onSubmit}
        submitLabel="Reset Password"
      >
        <InputField<ResetPasswordForm>
          name="password"
          label="New Password"
          placeholder="Enter new password"
          secureTextEntry
        />
        <InputField<ResetPasswordForm>
          name="confirm_password"
          label="Confirm Password"
          placeholder="Confirm new password"
          secureTextEntry
        />
      </FormWrapper>

      <Modal
        animationType="fade"
        transparent={true}
        visible={showSuccessModal}
        onRequestClose={handleModalClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.iconContainer}>
              <Ionicons
                name="checkmark-circle"
                size={80}
                color={Colors.primary}
              />
            </View>
            <Text style={styles.modalTitle}>Success!</Text>
            <Text style={styles.modalSubtitle}>
              Your password has been reset successfully.
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleModalClose}
            >
              <Text style={styles.modalButtonText}>Go to Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    width: "100%",
    maxWidth: 400,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  iconContainer: {
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 10,
  },
  modalSubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
  },
  modalButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ResetPassword;
