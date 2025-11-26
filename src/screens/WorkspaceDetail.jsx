import React, { useMemo, useState, useEffect, useCallback } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from "react-native";
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
import AddResourceSheet from "../components/workspace/AddResourceSheet";

const mockNotes = [
  { id: "n1", title: "Sprint plan", preview: "Backlog grooming...", color: "#DBEAFE", tags: ["Work"], pinned: true },
  { id: "n2", title: "Ideas", preview: "Smart capture...", color: "#FDE68A", tags: ["Ideas"], pinned: false },
];
const mockDocs = [
  { id: "d1", name: "Invoice_1234.pdf", updated: "2d ago" },
  { id: "d2", name: "Contract.pdf", updated: "5d ago" },
];
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
  const [resourceSheetOpen, setResourceSheetOpen] = useState(false);
  const [resources, setResources] = useState({ images: [], links: [] });

  const fetchTasks = async () => {
    try {
      // First, fetch existing tasks
      const { data: existingTasks, error: fetchError } = await supabase
        .from("tasks")
        .select("*")
        .eq("workspace_id", workspace.id)
        .order("created_at", { ascending: true });

      if (fetchError) throw fetchError;

      // If no tasks exist, create default ones
      if (!existingTasks || existingTasks.length === 0) {
        const defaultTasks = {
          'Personal': [
            { title: "Plan weekend activities", done: false },
            { title: "Buy groceries", done: true },
            { title: "Call family", done: false }
          ],
          'Work': [
            { title: "Prepare presentation", done: true },
            { title: "Reply to client emails", done: false },
            { title: "Team meeting at 2 PM", done: false }
          ],
          'Projects': [
            { title: "Fix navigation bug", done: true },
            { title: "Add new feature", done: false },
            { title: "Update documentation", done: true }
          ]
        };

        const workspaceTasks = defaultTasks[workspace.title] || defaultTasks['Personal'];
        const tasksToInsert = workspaceTasks.map(task => ({
          ...task,
          workspace_id: workspace.id
        }));

        // Insert default tasks
        const { data: insertedTasks, error: insertError } = await supabase
          .from('tasks')
          .insert(tasksToInsert)
          .select();

        if (insertError) throw insertError;
        
        setTasks(insertedTasks || []);
      } else {
        setTasks(existingTasks || []);
      }
    } catch (error) {
      console.error("Error in fetchTasks:", error);
    }
  };

  const fetchResources = async () => {
    try {
      console.log('Fetching resources for workspace:', workspace.id, workspace.title);
      
      const { data, error } = await supabase
        .from("workspace_resources")
        .select("*")
        .eq("workspace_id", workspace.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      let images = [];
      let links = [];

      if (data && data.length > 0) {
        console.log('Found existing resources:', data);
        // Use existing resources if available
        images = data.filter(r => r.type === 'image').map(r => ({ 
          id: r.id, 
          uri: r.url,
          type: 'image'
        }));
        links = data.filter(r => r.type === 'link').map(r => ({ 
          id: r.id, 
          title: r.title, 
          url: r.url,
          type: 'link'
        }));
      } else {
        console.log('No resources found, using default images');
        // Add default images from local assets
        const defaultImages = {
          'Personal': [
            require('../../assets/pic1.jpg'),
            require('../../assets/pic2.jpg'),
            require('../../assets/pic3.jpg')
          ],
          'Work': [
            require('../../assets/pic1.jpg'),
            require('../../assets/pic2.jpg'),
            require('../../assets/pic3.jpg')
          ],
          'Projects': [
            require('../../assets/pic1.jpg'),
            require('../../assets/pic2.jpg'),
            require('../../assets/pic3.jpg')
          ]
        };

        // Use workspace title to get the appropriate images
        const workspaceImages = defaultImages[workspace.title] || defaultImages['Personal'];
        console.log('Using default images:', workspaceImages);
        
        images = workspaceImages.map((img, index) => ({
          id: `default-${workspace.id}-${index}`,
          uri: img,  // Directly use the required image
          type: 'image',
          isDefault: true
        }));
      }

      console.log('Setting resources:', { images, links });
      setResources({ images, links });
    } catch (error) {
      console.error("Error fetching resources:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (workspace.id) {
        fetchTasks();
        fetchResources();
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

  const addResource = async (resource) => {
    try {
      const { data, error } = await supabase
        .from("workspace_resources")
        .insert([
          {
            workspace_id: workspace.id,
            type: resource.type,
            title: resource.title,
            url: resource.type === 'image' ? resource.uri : resource.url // For images, we are using URI as URL for now
          }
        ])
        .select()
        .single();

      if (error) throw error;

      // Optimistic update or refetch
      fetchResources();
    } catch (error) {
      console.error("Error adding resource:", error);
      Alert.alert("Error", "Failed to add resource");
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

        <ResourcesSection
          resources={resources}
          onAdd={() => setResourceSheetOpen(true)}
        />

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

      <AddResourceSheet
        visible={resourceSheetOpen}
        onClose={() => setResourceSheetOpen(false)}
        onAdd={addResource}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.bg },
  fab: { position: "absolute", right: 20, bottom: 30, width: 60, height: 60, borderRadius: 30, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center", elevation: 6 },
});
