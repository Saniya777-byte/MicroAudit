import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Pin, Clock } from "lucide-react-native";
import { radius, spacing, fonts } from "../../theme";

export default function NoteCard({ note, onPress, onLongPress }) {
    return (
        <TouchableOpacity
            onPress={onPress}
            onLongPress={onLongPress}
            style={[styles.card, { backgroundColor: note.color }]}
        >
            <View style={styles.cardHeader}>
                <Text style={styles.cardTitle} numberOfLines={1}>
                    {note.title}
                </Text>
                {note.pinned && <Pin size={14} color="#111827" />}
            </View>
            <Text style={styles.cardPreview} numberOfLines={3}>
                {note.content}
            </Text>
            <View style={styles.tagRow}>
                {note.tags.map((t) => (
                    <View key={t} style={styles.tagChip}>
                        <Text style={styles.tagText}>{t}</Text>
                    </View>
                ))}
            </View>
            <View style={styles.timeRow}>
                <Clock size={12} color="#374151" />
                <Text style={styles.timeText}>Edited {note.updatedAt} ago</Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: { width: "47%", borderRadius: radius.lg, padding: spacing.md },
    cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    cardTitle: { fontWeight: "700", color: "#111827" },
    cardPreview: { color: "#374151", marginTop: 6, fontSize: fonts.small },
    tagRow: { flexDirection: "row", gap: 6, marginTop: 8, flexWrap: "wrap" },
    tagChip: { backgroundColor: "#FFFFFFAA", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
    tagText: { fontSize: 11, color: "#111827" },
    timeRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 8 },
    timeText: { fontSize: 11, color: "#374151" },
});
