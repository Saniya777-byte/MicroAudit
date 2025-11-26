import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { Grid2x2, Rows } from "lucide-react-native";
import { colors, spacing, fonts } from "../../theme";

export default function ViewToggle({ view, setView }) {
    return (
        <View style={styles.viewToggle}>
            <TouchableOpacity
                style={[styles.toggleBtn, view === "grid" && styles.toggleActive]}
                onPress={() => setView("grid")}
            >
                <Grid2x2 size={16} color={view === "grid" ? colors.surface : colors.text} />
                <Text style={[styles.toggleText, view === "grid" && { color: colors.surface }]}>
                    Grid
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.toggleBtn, view === "list" && styles.toggleActive]}
                onPress={() => setView("list")}
            >
                <Rows size={16} color={view === "list" ? colors.surface : colors.text} />
                <Text style={[styles.toggleText, view === "list" && { color: colors.surface }]}>
                    List
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    viewToggle: { flexDirection: "row", gap: 8, paddingHorizontal: spacing.md, marginTop: spacing.sm },
    toggleBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 9999,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    toggleActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    toggleText: { fontSize: fonts.small, color: colors.text },
});
