import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { colors, radius, spacing, fonts } from "../theme";

export default function Button({ title, onPress, style, variant = "primary" }) {
  const isGhost = variant === "ghost";
  return (
    <TouchableOpacity onPress={onPress} style={[styles.btn, isGhost ? styles.ghost : styles.primary, style]}>
      <Text style={[styles.text, isGhost && { color: colors.text }]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: { paddingVertical: spacing.sm, paddingHorizontal: spacing.lg, borderRadius: radius.md, alignItems: "center" },
  primary: { backgroundColor: colors.primary },
  ghost: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.chipBg },
  text: { color: "#fff", fontSize: fonts.body, fontWeight: "600" },
});
