import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { FileText } from "lucide-react-native";
import SectionHeader from "../SectionHeader";
import { colors } from "../../theme";

export default function DocumentsList({ docs, navigation }) {
    return (
        <>
            <SectionHeader title="Documents" actionText="View All" onPress={() => navigation.navigate("Documents")} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 4 }}>
                {docs.map(d => (
                    <View key={d.id} style={styles.docTile}>
                        <View style={styles.docThumb}><FileText color={colors.primary} size={20} /></View>
                        <Text style={styles.docName} numberOfLines={1}>{d.name}</Text>
                        <Text style={styles.docMeta}>Last updated: {d.updated}</Text>
                    </View>
                ))}
            </ScrollView>
        </>
    );
}

const styles = StyleSheet.create({
    docTile: { width: 180, backgroundColor: "#fff", borderRadius: 16, padding: 12, marginRight: 12, borderWidth: 1, borderColor: "#E5E7EB" },
    docThumb: { width: 36, height: 36, borderRadius: 8, backgroundColor: "#EEF2FF", alignItems: "center", justifyContent: "center" },
    docName: { fontWeight: "700", marginTop: 8 },
    docMeta: { fontSize: 12, color: "#6B7280", marginTop: 4 },
});
