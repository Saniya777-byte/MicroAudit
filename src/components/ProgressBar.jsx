import React from "react";
import { View, StyleSheet } from "react-native";
import { colors, radius } from "../theme";

export default function ProgressBar({ value = 0 }) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${clamped}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { height: 10, backgroundColor: "#E5E7EB", borderRadius: radius.md, overflow: "hidden" },
  fill: { height: 10, backgroundColor: colors.primary, borderRadius: radius.md },
});
