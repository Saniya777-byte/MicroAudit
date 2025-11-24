import React from "react";
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from "react-native";
import { CheckCircle2, Circle } from "lucide-react-native";
import SectionHeader from "../SectionHeader";
import { colors, spacing } from "../../theme";

export default function TasksList({ tasks, toggleTask, newTask, setNewTask, addTask }) {
    return (
        <>
            <SectionHeader title="Tasks / Checklist" />
            <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: spacing.md }}>
                {tasks.map(t => (
                    <TouchableOpacity key={t.id} style={[styles.taskRow, { marginBottom: 10 }]} onPress={() => toggleTask(t.id)}>
                        {t.done ? <CheckCircle2 size={18} color="#16A34A" /> : <Circle size={18} color="#9CA3AF" />}
                        <Text style={[styles.taskText, t.done && { textDecorationLine: "line-through", color: "#6B7280" }]}>{t.title}</Text>
                    </TouchableOpacity>
                ))}
                <View style={styles.taskAdd}>
                    <TextInput placeholder="Add new task" value={newTask} onChangeText={setNewTask} style={{ flex: 1 }} />
                    <TouchableOpacity onPress={addTask}><Text style={{ color: colors.primary, fontWeight: "700" }}>Add</Text></TouchableOpacity>
                </View>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    taskRow: { flexDirection: "row", alignItems: "center" },
    taskText: { color: colors.text, marginLeft: 8 },
    taskAdd: { flexDirection: "row", alignItems: "center", borderTopWidth: 1, borderTopColor: "#E5E7EB", paddingTop: 8 },
});
