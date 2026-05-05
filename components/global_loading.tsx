import { ActivityIndicator, Modal, StyleSheet, Text, View } from "react-native";
import React from "react";
import { Colors } from "@/colors/colors";

interface GlobalLoadingProps {
  visible: boolean;
  message?: string;
}

const GlobalLoading = ({ visible, message = "Please wait..." }: GlobalLoadingProps) => {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ActivityIndicator size="large" color={Colors.primary} />
          {message ? <Text style={styles.text}>{message}</Text> : null}
        </View>
      </View>
    </Modal>
  );
};

export default GlobalLoading;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    backgroundColor: "white",
    padding: 25,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    minWidth: 150,
  },
  text: {
    marginTop: 15,
    fontSize: 16,
    color: "#333",
    fontWeight: "600",
  },
});
