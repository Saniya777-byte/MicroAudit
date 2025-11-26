import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { StickyNote } from "lucide-react-native";
import SectionHeader from "../SectionHeader";

export default function NotesGrid({ notes, navigation }) {
    return (
        <>
            <SectionHeader title="Notes" actionText="View All" onPress={() => navigation.navigate("Notes")} />
            <View style={styles.grid}>
                {notes.map(n => (
                    <TouchableOpacity key={n.id} style={[styles.noteCard, { backgroundColor: n.color }]} onPress={() => navigation.navigate("NoteEditor", n)}>
                        <StickyNote size={16} color="#111827" />
                        <Text style={{ fontWeight: "700", marginTop: 6 }} numberOfLines={1}>{n.title}</Text>
                        <Text style={{ color: "#374151", marginTop: 4 }} numberOfLines={2}>{n.preview}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    grid: { flexDirection: "row", flexWrap: "wrap", marginTop: 6 },
    noteCard: { width: "47%", borderRadius: 16, padding: 12, marginRight: 12, marginBottom: 12 },
});
