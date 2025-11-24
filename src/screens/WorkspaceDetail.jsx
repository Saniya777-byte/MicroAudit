import React, { useMemo, useState, useEffect, useCallback } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Plus } from "lucide-react-native";
import { colors, spacing } from "../theme";
import { supabase } from "../lib/supabaseClient";
import { useFocusEffect } from "@react-navigation/native";

import WorkspaceHeader from "../components/workspace/WorkspaceHeader";
import WorkspaceOverview from "../components/workspace/WorkspaceOverview";
import PinnedSection from "../components/workspace/PinnedSection";
import NotesGrid from "../components/workspace/NotesGrid";
import DocumentsList from "../components/workspace/DocumentsList";
import ResourcesSection from "../components/workspace/ResourcesSection";
import TasksList from "../components/workspace/TasksList";
import RecentActivity from "../components/workspace/RecentActivity";
import AddToWorkspaceSheet from "../components/workspace/AddToWorkspaceSheet";

const mockNotes = [
  { id: "n1", title: "Sprint plan", preview: "Backlog grooming...", color: "#DBEAFE", tags: ["Work"], pinned: true },
  { id: "n2", title: "Ideas", preview: "Smart capture...", color: "#FDE68A", tags: ["Ideas"], pinned: false },
];
const mockDocs = [
  { id: "d1", name: "Invoice_1234.pdf", updated: "2d ago" },
  { id: "d2", name: "Contract.pdf", updated: "5d ago" },
];
const mockResources = {
  images: [
    { id: "img1", uri: "https://picsum.photos/200/200?1" },
    { id: "img2", uri: "https://picsum.photos/200/200?2" },
    { id: "img3", uri: "https://picsum.photos/200/200?3" },
  ],
  links: [
    { id: "l1", title: "Design System", url: "https://shadcn.com" },
    { id: "l2", title: "Docs", url: "https://reactnative.dev" },
  ],
};
const mockActivity = [
  { id: "a1", text: "Added document \"Invoice_1234.pdf\"", time: "3h ago", icon: "doc" },
  { id: "a2", text: "Created note \"Sprint plan\"", time: "1d ago", icon: "note" },
  { id: "a3", text: "Completed task \"Prepare invoice\"", time: "2d ago", icon: "task" },
];

export default function WorkspaceDetail({ route, navigation }) {
  const workspace = route?.params?.workspace || { id: "w0", title: "Workspace", icon: "Folder", color: "#DBEAFE", notes: 0, docs: 0, done: 0, total: 0 };
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("workspace_id", workspace.id)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (workspace.id) {
        fetchTasks();
      }
    }, [workspace.id])
  );

  const progress = useMemo(() => {
    const total = tasks.length || 0;
    const done = tasks.filter(t => t.done).length;
    return total ? Math.round((done / total) * 100) : 0;
  }, [tasks]);

  const toggleTask = async (id) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const newDone = !task.done;

    // Optimistic update
    setTasks(ts => ts.map(t => t.id === id ? { ...t, done: newDone } : t));

    try {
      const { error } = await supabase
        .from("tasks")
        .update({ done: newDone })
        .eq("id", id);

      if (error) {
        throw error;
        // Revert on error
        setTasks(ts => ts.map(t => t.id === id ? { ...t, done: !newDone } : t));
      }
    } catch (error) {
      console.error("Error updating task:", error);
      Alert.alert("Error", "Failed to update task");
    }
  };

  const deleteTask = async (id) => {
    // Optimistic update
    const prevTasks = [...tasks];
    setTasks(ts => ts.filter(t => t.id !== id));

    try {
      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", id);

      if (error) throw error;
    } catch (error) {
      console.error("Error deleting task:", error);
      Alert.alert("Error", "Failed to delete task");
      setTasks(prevTasks); // Revert
    }
  };

  const updateTaskTitle = async (id, newTitle) => {
    // Optimistic update
    const prevTasks = [...tasks];
    setTasks(ts => ts.map(t => t.id === id ? { ...t, title: newTitle } : t));

    try {
      const { error } = await supabase
        .from("tasks")
        .update({ title: newTitle })
        .eq("id", id);

      if (error) throw error;
    } catch (error) {
      console.error("Error updating task:", error);
      Alert.alert("Error", "Failed to update task");
      setTasks(prevTasks); // Revert
    }
  };

  const addTask = async () => {
    if (!newTask.trim()) return;

    const title = newTask.trim();
    setNewTask(""); // Clear input immediately

    try {
      const { data, error } = await supabase
        .from("tasks")
        .insert([
          {
            title,
            workspace_id: workspace.id,
            done: false
          },
        ])
        .select()
        .single();

      if (error) throw error;
      setTasks(ts => [...ts, data]);
    } catch (error) {
      console.error("Error creating task:", error);
      Alert.alert("Error", "Failed to create task");
      setNewTask(title); // Restore input on error
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <WorkspaceHeader navigation={navigation} workspace={workspace} />

      <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: 100 }}>
        <WorkspaceOverview workspace={workspace} tasks={tasks} progress={progress} />

        <PinnedSection notes={mockNotes} docs={mockDocs} />

        <NotesGrid notes={mockNotes} navigation={navigation} />

        <DocumentsList docs={mockDocs} navigation={navigation} />

        <ResourcesSection resources={mockResources} />

        <TasksList
          tasks={tasks}
          toggleTask={toggleTask}
          newTask={newTask}
          setNewTask={setNewTask}
          addTask={addTask}
          deleteTask={deleteTask}
          updateTaskTitle={updateTaskTitle}
        />

        <RecentActivity activity={mockActivity} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setSheetOpen(true)}>
        <Plus color="#fff" size={28} />
      </TouchableOpacity>

      <AddToWorkspaceSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        navigation={navigation}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.bg },
  fab: { position: "absolute", right: 20, bottom: 30, width: 60, height: 60, borderRadius: 30, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center", elevation: 6 },
});
