import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Card from "../Card";
import ProgressBar from "../ProgressBar";
import { spacing } from "../../theme";

export default function WorkspaceOverview({ workspace, tasks, progress }) {
    return (
        <Card style={{ borderRadius: 24, padding: spacing.lg }}>
            <Text style={styles.ovTitle}>Overview</Text>
            <View style={styles.ovRow}>
                <View style={styles.ovStat}><Text style={styles.ovNumber}>{workspace.notes || 12}</Text><Text style={styles.ovLabel}>Notes</Text></View>
                <View style={styles.ovStat}><Text style={styles.ovNumber}>{workspace.docs || 5}</Text><Text style={styles.ovLabel}>Documents</Text></View>
                <View style={styles.ovStat}><Text style={styles.ovNumber}>{tasks.filter(t => t.done).length}</Text><Text style={styles.ovLabel}>Tasks</Text></View>
            </View>
            <Text style={{ marginTop: 8, fontWeight: "700" }}>Progress: {progress}%</Text>
            <View style={{ marginTop: 8 }}><ProgressBar value={progress} /></View>
        </Card>
    );
}

const styles = StyleSheet.create({
    ovTitle: { fontWeight: "800", fontSize: 16, marginBottom: 8 },
    ovRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
    ovStat: { alignItems: "center", flex: 1 },
    ovNumber: { fontWeight: "800", fontSize: 18 },
    ovLabel: { color: "#6B7280" },
});
