import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function DocumentsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>📄 Documents</Text>
      <Text style={styles.text}>Here you can manage all your compliance documents.</Text>
    </View>
    
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F9FAFB" },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  text: { fontSize: 14, color: "#4B5563", textAlign: "center", paddingHorizontal: 20 },
});
