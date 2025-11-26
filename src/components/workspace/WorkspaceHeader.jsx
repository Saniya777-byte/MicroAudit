import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { ArrowLeft, Edit3, MoreVertical } from "lucide-react-native";
import * as Icons from "lucide-react-native";
import { spacing, radius } from "../../theme";

export default function WorkspaceHeader({ navigation, workspace }) {
    const IconCmp = Icons[workspace.icon] || Icons.Folder;

    return (
        <View style={[styles.header, { backgroundColor: workspace.color }]}>
            <TouchableOpacity onPress={() => navigation.goBack()}><ArrowLeft color="#111827" /></TouchableOpacity>
            <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
                <View style={styles.wsIconBox}><IconCmp size={18} color="#111827" /></View>
                <Text style={[styles.headerTitle, { marginLeft: 8 }]} numberOfLines={1}>{workspace.title}</Text>
            </View>
            <View style={{ flexDirection: "row" }}>
                <TouchableOpacity><Edit3 color="#111827" /></TouchableOpacity>
                <TouchableOpacity style={{ marginLeft: 12 }}><MoreVertical color="#111827" /></TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.md, paddingVertical: spacing.md, borderBottomLeftRadius: radius.lg, borderBottomRightRadius: radius.lg },
    headerTitle: { flex: 1, marginHorizontal: 12, fontWeight: "800", color: "#111827" },
    wsIconBox: { width: 28, height: 28, borderRadius: 8, backgroundColor: "#FFFFFFAA", alignItems: "center", justifyContent: "center" },
});
