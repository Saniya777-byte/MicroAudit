import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Button from "../Button";
import { colors, spacing, fonts } from "../../theme";

export default function EmptyNotes({ onCreate }) {
    return (
        <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyTitle}>No notes yet</Text>
            <Text style={styles.emptyText}>Start capturing ideas, thoughts, or reminders.</Text>
            <Button title="Create Your First Note" onPress={onCreate} />
        </View>
    );
}

const styles = StyleSheet.create({
    empty: { alignItems: "center", padding: spacing.lg, gap: 8 },
    emptyIcon: { fontSize: 40 },
    emptyTitle: { fontWeight: "800", fontSize: fonts.h1 },
    emptyText: { color: colors.muted, marginBottom: spacing.sm },
});
