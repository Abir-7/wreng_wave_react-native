import { Colors } from "@/colors/colors";
import FormWrapper from "@/components/form_wrapper";
import InputField from "@/components/input_field";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { z } from "zod";

const forgotPasswordSchema = z.object({
  email: z.email("Invalid email address"),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

const ForgotPassword = () => {
  const router = useRouter();
  const { role } = useLocalSearchParams<{ role: string }>();

  const onSubmit = (data: ForgotPasswordForm) => {
    console.log("Forgot Password for:", data.email);
    // Go to OTP for verification
    router.push({ pathname: "/otp", params: { role, flow: "forgot-password" } });
  };

  return (
    <FormWrapper
      title="Reset Password"
      subtitle="Enter your email to receive a reset code"
      resolver={zodResolver(forgotPasswordSchema)}
      defaultValues={{ email: "" }}
      onSubmit={onSubmit}
      submitLabel="Send Code"
    >
      <InputField<ForgotPasswordForm>
        name="email"
        label="Email"
        placeholder="Enter your email"
        keyboardType="email-address"
        autoCapitalize="none"
      />
    </FormWrapper>
  );
};

export default ForgotPassword;
