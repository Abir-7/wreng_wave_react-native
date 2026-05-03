import { Colors } from "@/colors/colors";
import FormWrapper from "@/components/form_wrapper";
import InputField from "@/components/input_field";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { z } from "zod";

const resetPasswordSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirm_password: z.string().min(6, "Password must be at least 6 characters"),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
  });

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

const ResetPassword = () => {
  const router = useRouter();
  const { role } = useLocalSearchParams<{ role: string }>();

  const onSubmit = (data: ResetPasswordForm) => {
    console.log("Password Reset Successful");
    router.push({ pathname: "/login", params: { role } });
  };

  return (
    <FormWrapper
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
  );
};

export default ResetPassword;
