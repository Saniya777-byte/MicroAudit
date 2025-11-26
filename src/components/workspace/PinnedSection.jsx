import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { Star, FileText } from "lucide-react-native";
import SectionHeader from "../SectionHeader";

export default function PinnedSection({ notes, docs }) {
    return (
        <>
            <SectionHeader title="Pinned" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 4 }}>
                {notes.filter(n => n.pinned).map(n => (
                    <View key={n.id} style={[styles.pinCard, { backgroundColor: n.color }]}>
                        <Star size={14} color="#111827" />
                        <Text numberOfLines={1} style={{ fontWeight: "700", marginTop: 4 }}>{n.title}</Text>
                        <Text numberOfLines={1} style={{ color: "#374151", marginTop: 2 }}>{n.preview}</Text>
                    </View>
                ))}
                {docs.slice(0, 1).map(d => (
                    <View key={d.id} style={[styles.pinCard, { backgroundColor: "#EEF2FF" }]}>
                        <FileText size={14} color="#1D4ED8" />
                        <Text numberOfLines={1} style={{ fontWeight: "700", marginTop: 4 }}>{d.name}</Text>
                        <Text numberOfLines={1} style={{ color: "#374151", marginTop: 2 }}>Updated {d.updated}</Text>
                    </View>
                ))}
            </ScrollView>
        </>
    );
}

const styles = StyleSheet.create({
    pinCard: { width: 140, borderRadius: 16, padding: 10, marginRight: 10 },
});
