import {
  useResendCode,
  useVerifyResetPassword,
  useVerifyUser,
} from "@/api/auth.api";
import { Colors } from "@/colors/colors";
import FormWrapper from "@/components/form_wrapper";
import GlobalLoading from "@/components/global_loading";
import ScreenWrapper from "@/components/screen_wrapper";
import { ValidRole } from "@/store/auth.store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { Controller, useFormContext } from "react-hook-form";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { OtpInput } from "react-native-otp-entry";
import { z } from "zod";

const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
});

type OtpForm = z.infer<typeof otpSchema>;

const OtpBoxInput = () => {
  const { control } = useFormContext<OtpForm>();

  return (
    <View style={styles.otpContainer}>
      <Controller
        control={control}
        name="otp"
        render={({ field: { onChange }, fieldState: { error } }) => (
          <>
            <OtpInput
              numberOfDigits={6}
              onTextChange={onChange}
              focusColor={Colors.primary}
              theme={{
                containerStyle: styles.boxesRow,
                pinCodeContainerStyle: styles.box,
                pinCodeTextStyle: styles.boxText,
                focusedPinCodeContainerStyle: styles.boxFocused,
              }}
            />
            {error && <Text style={styles.errorText}>{error.message}</Text>}
          </>
        )}
      />
    </View>
  );
};

const Otp = () => {
  const { user_id, role, flow } = useLocalSearchParams<{
    user_id: string;
    role: string;
    flow?: string;
  }>();
  const { mutate: verifyUser, isPending: isVerifying } = useVerifyUser();
  const { mutate: resendCode, isPending: isResending } = useResendCode();
  const { mutate: verifyResetPassword, isPending: isVerifyingReset } =
    useVerifyResetPassword();

  const onSubmit = (data: OtpForm) => {
    if (flow === "forgot-password") {
      verifyResetPassword({
        code: data.otp,
        user_id: user_id,
        role: role as ValidRole,
      });
    } else {
      verifyUser({
        code: data.otp,
        user_id: user_id,
        role: role as ValidRole,
        flow: flow || "",
      });
    }
  };

  const isLoading = isVerifying || isResending || isVerifyingReset;

  return (
    <ScreenWrapper>
      <GlobalLoading visible={isLoading} message="Verifying..." />
      <FormWrapper
        title="Verify your email"
        subtitle="We have sent a 6-digit code to your email"
        resolver={zodResolver(otpSchema)}
        defaultValues={{ otp: "" }}
        onSubmit={onSubmit}
        submitLabel="Verify"
      >
        <OtpBoxInput />

        <View style={styles.resendRow}>
          <Text style={styles.resendText}>Didn&apos;t receive the code? </Text>
          <TouchableOpacity onPress={() => resendCode({ user_id })}>
            <Text style={styles.resendLink}>Resend</Text>
          </TouchableOpacity>
        </View>
      </FormWrapper>
    </ScreenWrapper>
  );
};

export default Otp;

const styles = StyleSheet.create({
  otpContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#444",
    marginBottom: 12,
  },
  boxesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  box: {
    width: 45,
    height: 55,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
  },
  boxFocused: {
    borderColor: Colors.primary,
    borderWidth: 2,
    backgroundColor: "#fff",
  },
  boxText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  errorText: {
    color: "#d32f2f",
    fontSize: 12,
    marginTop: 8,
  },
  resendRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
    marginBottom: 8,
  },
  resendText: {
    color: "#888",
    fontSize: 14,
  },
  resendLink: {
    color: Colors.secondary,
    fontSize: 14,
    fontWeight: "bold",
  },
});
