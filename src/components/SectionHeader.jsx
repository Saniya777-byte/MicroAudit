import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { colors, spacing, fonts } from "../theme";

export default function SectionHeader({ title, actionText, onPress }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      {actionText ? (
        <TouchableOpacity onPress={onPress}><Text style={styles.action}>{actionText}</Text></TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: spacing.md, marginBottom: spacing.sm, paddingHorizontal: spacing.md },
  title: { fontSize: fonts.h2, fontWeight: "700", color: colors.text },
  action: { color: "#1D4ED8", fontWeight: "700" },
});
