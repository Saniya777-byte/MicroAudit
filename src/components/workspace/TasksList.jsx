import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Alert, Modal, Pressable } from "react-native";
import { CheckCircle2, Circle } from "lucide-react-native";
import SectionHeader from "../SectionHeader";
import { colors, spacing, radius } from "../../theme";

export default function TasksList({ tasks, toggleTask, newTask, setNewTask, addTask, deleteTask, updateTaskTitle }) {
    const [editingTask, setEditingTask] = useState(null);
    const [editTitle, setEditTitle] = useState("");

    const onLongPress = (task) => {
        Alert.alert("Task Options", task.title, [
            {
                text: "Edit",
                onPress: () => {
                    setEditingTask(task);
                    setEditTitle(task.title);
                }
            },
            {
                text: "Delete",
                style: "destructive",
                onPress: () => deleteTask(task.id)
            },
            { text: "Cancel", style: "cancel" },
        ]);
    };

    const handleUpdate = () => {
        if (editingTask && editTitle.trim()) {
            updateTaskTitle(editingTask.id, editTitle.trim());
            setEditingTask(null);
            setEditTitle("");
        }
    };

    return (
        <>
            <SectionHeader title="Tasks / Checklist" />
            <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: spacing.md }}>
                {tasks.map(t => (
                    <TouchableOpacity
                        key={t.id}
                        style={[styles.taskRow, { marginBottom: 10 }]}
                        onPress={() => toggleTask(t.id)}
                        onLongPress={() => onLongPress(t)}
                    >
                        {t.done ? <CheckCircle2 size={18} color="#16A34A" /> : <Circle size={18} color="#9CA3AF" />}
                        <Text style={[styles.taskText, t.done && { textDecorationLine: "line-through", color: "#6B7280" }]}>{t.title}</Text>
                    </TouchableOpacity>
                ))}
                <View style={styles.taskAdd}>
                    <TextInput placeholder="Add new task" value={newTask} onChangeText={setNewTask} style={{ flex: 1 }} />
                    <TouchableOpacity onPress={addTask}><Text style={{ color: colors.primary, fontWeight: "700" }}>Add</Text></TouchableOpacity>
                </View>
            </View>

            {/* Edit Modal */}
            <Modal transparent visible={!!editingTask} animationType="fade" onRequestClose={() => setEditingTask(null)}>
                <Pressable style={styles.modalBackdrop} onPress={() => setEditingTask(null)}>
                    <Pressable style={styles.modalContent} onPress={() => { }}>
                        <Text style={styles.modalTitle}>Edit Task</Text>
                        <TextInput
                            style={styles.input}
                            value={editTitle}
                            onChangeText={setEditTitle}
                            autoFocus
                        />
                        <View style={styles.modalActions}>
                            <TouchableOpacity onPress={() => setEditingTask(null)} style={styles.cancelBtn}>
                                <Text style={{ color: colors.text }}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleUpdate} style={styles.saveBtn}>
                                <Text style={{ color: "#fff", fontWeight: "700" }}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    taskRow: { flexDirection: "row", alignItems: "center" },
    taskText: { color: colors.text, marginLeft: 8 },
    taskAdd: { flexDirection: "row", alignItems: "center", borderTopWidth: 1, borderTopColor: "#E5E7EB", paddingTop: 8 },
    modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", padding: 20 },
    modalContent: { backgroundColor: "#fff", borderRadius: radius.lg, padding: spacing.lg, width: "100%", maxWidth: 340 },
    modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12, color: colors.text },
    input: { borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 8, padding: 10, fontSize: 16, marginBottom: 16 },
    modalActions: { flexDirection: "row", justifyContent: "flex-end", gap: 12 },
    cancelBtn: { paddingVertical: 8, paddingHorizontal: 12 },
    saveBtn: { backgroundColor: colors.primary, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8 },
});
