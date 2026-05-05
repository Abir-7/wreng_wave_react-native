import { useForgotPassword } from "@/api/auth.api";
import FormWrapper from "@/components/form_wrapper";
import InputField from "@/components/input_field";
import ScreenWrapper from "@/components/screen_wrapper";
import { ValidRole } from "@/store/auth.store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { z } from "zod";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

const ForgotPassword = () => {
  const { mutate: forgotPassword, isPending } = useForgotPassword();

  const { role } = useLocalSearchParams<{ role: ValidRole }>();

  const onSubmit = (data: ForgotPasswordForm) => {
    forgotPassword({ email: data.email, role: role });
  };

  return (
    <ScreenWrapper>
      <FormWrapper
        isLoading={isPending}
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
    </ScreenWrapper>
  );
};

export default ForgotPassword;
