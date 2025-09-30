import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function ScanScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>📷 Scan</Text>
      <Text style={styles.text}>Use this screen to scan and upload compliance documents.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F9FAFB" },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  text: { fontSize: 14, color: "#4B5563", textAlign: "center", paddingHorizontal: 20 },
});
