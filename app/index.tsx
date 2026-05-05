import { Colors } from "@/colors/colors";
import { ValidRole } from "@/store/auth.store";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RoleScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<ValidRole | null>(null);

  const handleContinue = (role: ValidRole) => {
    router.push({ pathname: "/login", params: { role } });
  };

  return (
    <ImageBackground
      source={require("../assets/ui/select_role.jpg")}
      style={styles.container}
    >
      <View style={styles.overlay} />
      <SafeAreaView style={styles.content}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>Select your role</Text>
        </View>

        <View style={styles.buttonContainer}>
          {/* User Card */}
          <TouchableOpacity
            onPress={() => {
              setSelected("customer");
              handleContinue("customer");
            }}
            style={{
              ...styles.button,
              backgroundColor:
                selected === "customer" ? Colors.primary : "transparent",
              borderColor: "white",
              borderWidth: selected === "customer" ? 0 : 1,
            }}
          >
            <Text style={styles.buttonText}>User</Text>
          </TouchableOpacity>

          {/* Mechanic Card */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => {
              setSelected("mechanic");
              handleContinue("mechanic");
            }}
            style={{
              ...styles.button,
              backgroundColor:
                selected === "mechanic" ? Colors.primary : "transparent",
              borderColor: "white",
              borderWidth: selected === "mechanic" ? 0 : 1,
            }}
          >
            <Text style={styles.buttonText}>Mechanic</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  content: {
    flex: 1,
    paddingLeft: 24,
    paddingRight: 24,
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerContainer: {
    width: "100%",
  },
  headerText: {
    color: "white",
    fontSize: 34,
    fontWeight: "bold",
    textAlign: "center",
  },
  buttonContainer: {
    gap: 16,
    width: "100%",
  },
  button: {
    padding: 10,
    borderRadius: 12,
    flexDirection: "row",
    width: "100%",
    alignItems: "center",
    height: 64,
    justifyContent: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 22,
  },
});
