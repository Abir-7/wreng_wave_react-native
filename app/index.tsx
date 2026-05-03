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
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function RoleScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<ValidRole | null>(null);

  const handleContinue = (role: ValidRole) => {
    router.push({ pathname: "/login", params: { role } });
  };

  return (
    <ImageBackground
      source={require("../assets/ui/select_role.jpg")}
      style={[
        styles.container,
        { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 },
      ]}
    >
      <View style={styles.overlay} />
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Select your role</Text>
      </View>

      <View style={styles.buttonContainer}>
        {/* User Card */}
        <TouchableOpacity
          onPress={() => {
            setSelected("user");
            handleContinue("user");
          }}
          style={{
            ...styles.button,
            backgroundColor:
              selected === "user" ? Colors.primary : "transparent",
            borderColor: "white",
            borderWidth: selected === "user" ? 0 : 1,
          }}
        >
          <Text style={styles.button_text}>User</Text>
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
          <Text style={styles.button_text}>Mechanic</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  headerContainer: {
    gap: 15,
    width: "80%",
  },
  headerText: {
    color: "white",
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
  },
  buttonContainer: {
    gap: 15,
    width: "80%",
  },
  button: {
    padding: 10,
    borderRadius: 5,
    flexDirection: "row",
    gap: 10,
    width: "100%",
    alignItems: "center",
    height: 60,
    justifyContent: "center",
  },

  button_text: {
    color: "white",
    fontWeight: "500",
    fontSize: 20,
  },
});
