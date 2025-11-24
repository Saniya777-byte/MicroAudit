import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { FileText, StickyNote, CheckCircle2, Clock } from "lucide-react-native";
import Card from "../Card";
import SectionHeader from "../SectionHeader";
import { colors } from "../../theme";

export default function RecentActivity({ activity }) {
    return (
        <>
            <SectionHeader title="Recent Activity" />
            <Card>
                {activity.map((a, idx) => (
                    <View key={a.id} style={[styles.actRow, idx < activity.length - 1 && styles.actDivider]}>
                        {a.icon === "doc" && <FileText size={16} color={colors.muted} />}
                        {a.icon === "note" && <StickyNote size={16} color={colors.muted} />}
                        {a.icon === "task" && <CheckCircle2 size={16} color={colors.muted} />}
                        <Text style={{ marginLeft: 8, flex: 1 }}>{a.text}</Text>
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <Clock size={14} color={colors.muted} />
                            <Text style={{ color: colors.muted, fontSize: 12, marginLeft: 6 }}>{a.time}</Text>
                        </View>
                    </View>
                ))}
            </Card>
        </>
    );
}

const styles = StyleSheet.create({
    actRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10 },
    actDivider: { borderBottomWidth: 1, borderBottomColor: "#E5E7EB" },
});
