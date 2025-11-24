import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { StickyNote, Pin } from "lucide-react-native";
import { colors, spacing, fonts } from "../../theme";

export default function NoteRow({ note, onPress, onLongPress }) {
    return (
        <TouchableOpacity
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.row}
        >
            <View style={[styles.rowIcon, { backgroundColor: note.color }]}>
                <StickyNote size={18} color="#111827" />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle} numberOfLines={1}>
                    {note.title}
                </Text>
                <Text style={styles.rowPreview} numberOfLines={1}>
                    {note.content}
                </Text>
            </View>
            {note.pinned && <Pin size={16} color={colors.muted} />}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: spacing.md,
        paddingVertical: 12,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
    },
    rowIcon: {
        width: 32,
        height: 32,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 10,
    },
    rowTitle: { fontWeight: "700", color: colors.text },
    rowPreview: { fontSize: fonts.small, color: colors.muted },
});
