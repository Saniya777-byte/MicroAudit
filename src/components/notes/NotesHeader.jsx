import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MoreVertical } from "lucide-react-native";
import { colors, spacing, radius, fonts } from "../../theme";

export default function NotesHeader({ onMenuPress }) {
    return (
        <View style={styles.header}>
            <Text style={styles.title}>Notes</Text>
            <TouchableOpacity onPress={onMenuPress}>
                <MoreVertical color={colors.text} />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        backgroundColor: colors.surface,
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
        borderBottomLeftRadius: radius.lg,
        borderBottomRightRadius: radius.lg,
    },
    title: { fontSize: fonts.h1, fontWeight: "700", color: colors.text },
});
