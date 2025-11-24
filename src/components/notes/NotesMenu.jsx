import React from "react";
import { View, Text, TouchableOpacity, Modal, Pressable, Alert, StyleSheet } from "react-native";
import { colors, spacing, radius } from "../../theme";

export default function NotesMenu({ visible, onClose, setView, onDeleteAll }) {
    return (
        <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
            <Pressable style={styles.menuBackdrop} onPress={onClose} />
            <View style={styles.menu}>
                <Text style={styles.menuTitle}>Options</Text>
                <TouchableOpacity style={styles.menuItem}>
                    <Text>Sort: Newest first</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem} onPress={() => { setView("grid"); onClose(); }}>
                    <Text>Change view: Grid</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem} onPress={() => { setView("list"); onClose(); }}>
                    <Text>Change view: List</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem}>
                    <Text>Create Tag</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.menuItem, { borderTopWidth: 1, borderTopColor: "#E5E7EB" }]}
                    onPress={() => {
                        onClose();
                        Alert.alert("Danger", "Delete all?", [
                            { text: "Cancel", style: "cancel" },
                            { text: "Delete", style: "destructive", onPress: onDeleteAll },
                        ]);
                    }}
                >
                    <Text style={{ color: colors.danger }}>Delete all</Text>
                </TouchableOpacity>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    menuBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.2)" },
    menu: {
        position: "absolute",
        top: 60,
        right: 12,
        backgroundColor: colors.surface,
        padding: spacing.md,
        borderRadius: radius.md,
        width: 220,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 4,
    },
    menuTitle: { fontWeight: "700", marginBottom: 6 },
    menuItem: { paddingVertical: 8 },
});
