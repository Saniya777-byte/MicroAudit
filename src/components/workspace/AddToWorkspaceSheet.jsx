import React from "react";
import { View, Text, TouchableOpacity, Modal, Pressable, StyleSheet } from "react-native";
import { StickyNote, Camera, FileText } from "lucide-react-native";
import { colors, spacing, radius } from "../../theme";

export default function AddToWorkspaceSheet({ visible, onClose, navigation }) {
    return (
        <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
            <Pressable style={styles.sheetBackdrop} onPress={onClose} />
            <View style={styles.sheet}>
                <View style={styles.sheetHandle} />
                <Text style={styles.sheetTitle}>Add to Workspace</Text>
                <View style={styles.sheetRow}>
                    <TouchableOpacity style={styles.sheetAction} onPress={() => { onClose(); navigation.navigate("NoteEditor", { id: null }); }}>
                        <StickyNote color={colors.primary} size={22} />
                        <Text style={styles.sheetActionText}>Create Note</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.sheetAction} onPress={() => { onClose(); navigation.navigate("Scan"); }}>
                        <Camera color={colors.primary} size={22} />
                        <Text style={styles.sheetActionText}>Scan Document</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.sheetAction} onPress={() => { onClose(); }}>
                        <FileText color={colors.primary} size={22} />
                        <Text style={styles.sheetActionText}>Upload File</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    sheetBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.2)" },
    sheet: { backgroundColor: colors.surface, padding: spacing.md, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg },
    sheetHandle: { width: 50, height: 5, backgroundColor: "#E5E7EB", borderRadius: 9999, alignSelf: "center", marginBottom: 8 },
    sheetTitle: { fontWeight: "800", marginBottom: spacing.md },
    sheetRow: { flexDirection: "row", justifyContent: "space-around" },
    sheetAction: { alignItems: "center", marginRight: 6 },
    sheetActionText: { fontSize: 12, marginTop: 4 },
});
