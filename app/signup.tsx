import { useSignup } from "@/api/auth.api";
import { Colors } from "@/colors/colors";
import FormWrapper from "@/components/form_wrapper";
import InputField from "@/components/input_field";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { z } from "zod";

const signupSchema = z
  .object({
    email: z.email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    full_name: z.string().min(3, "Name must be at least 3 characters"),
    confirm_password: z
      .string()
      .min(6, "Password must be at least 6 characters"),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
  });

type SignupForm = z.infer<typeof signupSchema>;

const Signup = () => {
  const router = useRouter();
  const { role } = useLocalSearchParams<{ role: "customer" | "mechanic" }>();
  const { mutate: signup, isPending } = useSignup();
  const onSubmit = (data: SignupForm) => {
    const data_with_role = { ...data, role: role };
    signup(data_with_role);
  };

  return (
    <FormWrapper
      isLoading={isPending}
      title={"Sign up now"}
      subtitle=""
      resolver={zodResolver(signupSchema)}
      defaultValues={{
        email: "",
        password: "",
        full_name: "",
        confirm_password: "",
      }}
      onSubmit={onSubmit}
      footer={
        <View style={styles.signupRow}>
          <Text style={styles.signupText}>Already have an account? </Text>
          <TouchableOpacity
            onPress={() =>
              router.push({ pathname: "/login", params: { role } })
            }
          >
            <Text style={styles.signupLink}>Login</Text>
          </TouchableOpacity>
        </View>
      }
    >
      <InputField<SignupForm>
        name="full_name"
        label="Name"
        placeholder="Enter your name"
        keyboardType="default"
        autoCapitalize="none"
      />
      <InputField<SignupForm>
        name="email"
        label="Email"
        placeholder="Enter your email"
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <InputField<SignupForm>
        name="password"
        label="Password"
        placeholder="Enter your password"
        secureTextEntry
      />
      <InputField<SignupForm>
        name="confirm_password"
        label="Confirm Password"
        placeholder="Enter your password"
        secureTextEntry
      />
    </FormWrapper>
  );
};

export default Signup;

const styles = StyleSheet.create({
  signupRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
    marginBottom: 8,
  },
  signupText: {
    color: "#888",
    fontSize: 14,
  },
  signupLink: {
    color: Colors.secondary,
    fontSize: 14,
    fontWeight: "bold",
  },
});
