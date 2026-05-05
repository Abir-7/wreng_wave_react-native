import { useLogin } from "@/api/auth.api";
import { Colors } from "@/colors/colors";
import FormWrapper from "@/components/form_wrapper";
import InputField from "@/components/input_field";
import GlobalLoading from "@/components/global_loading";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const router = useRouter();
  const { role } = useLocalSearchParams<{ role: "customer" | "mechanic" }>();
  const { mutate: login, isPending } = useLogin();
  const onSubmit = (data: LoginForm) => {
    login({ user_email: data.email, password: data.password });
  };

  return (
    <>
      <GlobalLoading visible={isPending} message="Signing in..." />
      <FormWrapper
        title={"Sign in now"}
        subtitle=""
        resolver={zodResolver(loginSchema)}
        defaultValues={{ email: "" }}
        onSubmit={onSubmit}
        footer={
          <View style={styles.signupRow}>
            <Text style={styles.signupText}>Don&apos;t have an account? </Text>
            <TouchableOpacity
              onPress={() =>
                router.push({ pathname: "/signup", params: { role } })
              }
            >
              <Text style={styles.signupLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        }
      >
        <InputField<LoginForm>
          name="email"
          label="Email"
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <InputField<LoginForm>
          name="password"
          label="Password"
          placeholder="Enter your password"
          secureTextEntry
        />

        {/* Forgot Password Link */}
        <TouchableOpacity
          onPress={() =>
            router.push({ pathname: "/forgot-password", params: { role } })
          }
          style={styles.forgotPasswordContainer}
        >
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>
      </FormWrapper>
    </>
  );
}

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
  forgotPasswordContainer: {
    alignSelf: "flex-end",
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: Colors.secondary,
    fontSize: 14,
    fontWeight: "600",
  },
});
