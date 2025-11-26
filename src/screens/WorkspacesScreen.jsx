import React, { useMemo, useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Pressable, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Plus, MoreVertical, Search, Clock } from "lucide-react-native";
import * as Icons from "lucide-react-native";
import Card from "../components/Card";
import ProgressBar from "../components/ProgressBar";
import { colors, spacing, radius, fonts } from "../theme";
import { supabase } from "../lib/supabaseClient";
import { useFocusEffect } from "@react-navigation/native";

export default function WorkspacesScreen({ navigation }) {
  const [q, setQ] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [icon, setIcon] = useState("Folder");
  const [color, setColor] = useState("#DBEAFE");
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const fetchWorkspaces = async () => {
    try {
      const { data, error } = await supabase
        .from("workspaces")
        .select("*, tasks(id, done)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setWorkspaces(data || []);
    } catch (error) {
      console.error("Error fetching workspaces:", error);
      Alert.alert("Error", "Failed to fetch workspaces");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchWorkspaces();
    }, [])
  );

  const list = useMemo(() => (q ? workspaces.filter(w => w.title.toLowerCase().includes(q.toLowerCase())) : workspaces), [q, workspaces]);

  const handleEdit = (w) => {
    setEditingId(w.id);
    setTitle(w.title);
    setIcon(w.icon || "Folder");
    setColor(w.color || "#DBEAFE");
    setSheetOpen(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setIcon("Folder");
    setColor("#DBEAFE");
    setSheetOpen(false);
  };

  const onLongPress = (w) => {
    Alert.alert("Workspace", w.title, [
      { text: "Edit", onPress: () => handleEdit(w) },
      { text: "Delete", style: "destructive", onPress: () => deleteWorkspace(w.id) },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const deleteWorkspace = async (id) => {
    try {
      const { error } = await supabase.from("workspaces").delete().eq("id", id);
      if (error) throw error;
      setWorkspaces(prev => prev.filter(w => w.id !== id));
    } catch (error) {
      console.error("Error deleting workspace:", error);
      Alert.alert("Error", "Failed to delete workspace");
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert("Validation", "Please enter a title");
      return;
    }

    setCreating(true);
    try {
      if (editingId) {
        // Update existing workspace
        const { data, error } = await supabase
          .from("workspaces")
          .update({
            title: title.trim(),
            icon,
            color,
          })
          .eq("id", editingId)
          .select("*, tasks(id, done)")
          .single();

        if (error) throw error;

        setWorkspaces(prev => prev.map(w => w.id === editingId ? data : w));
        Alert.alert("Success", "Workspace updated");
      } else {
        // Create new workspace
        const { data, error } = await supabase
          .from("workspaces")
          .insert([
            {
              title: title.trim(),
              icon,
              color,
            },
          ])
          .select()
          .single();

        if (error) throw error;

        // New workspace has no tasks initially
        const newWorkspace = { ...data, tasks: [] };
        setWorkspaces(prev => [newWorkspace, ...prev]);
      }
      resetForm();
    } catch (error) {
      console.error("Error saving workspace:", error);
      Alert.alert("Error", `Failed to ${editingId ? "update" : "create"} workspace`);
    } finally {
      setCreating(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Workspaces</Text>
        <View style={{ flexDirection: "row" }}>
          <TouchableOpacity onPress={() => { resetForm(); setSheetOpen(true); }}><Plus color={colors.text} /></TouchableOpacity>
          <TouchableOpacity style={{ marginLeft: 12 }}><MoreVertical color={colors.text} /></TouchableOpacity>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <Search size={18} color={colors.muted} />
        <TextInput
          style={styles.search}
          placeholder="Search workspaces…"
          value={q}
          onChangeText={setQ}
          placeholderTextColor="#9CA3AF"
        />
        {q.length > 0 && (
          <TouchableOpacity onPress={() => setQ("")}>
            <Text style={{ color: colors.muted }}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* List */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: spacing.md }}>
          {list.length === 0 ? (
            <View style={{ alignItems: "center", marginTop: 50 }}>
              <Text style={{ color: colors.muted }}>No workspaces found</Text>
              <TouchableOpacity onPress={() => { resetForm(); setSheetOpen(true); }} style={{ marginTop: 10 }}>
                <Text style={{ color: colors.primary, fontWeight: "bold" }}>Create one</Text>
              </TouchableOpacity>
            </View>
          ) : (
            list.map((w) => {
              const IconCmp = Icons[w.icon || "Folder"] || Icons.Folder;

              // Calculate stats from real data
              const tasks = w.tasks || [];
              const totalTasks = tasks.length;
              const doneTasks = tasks.filter(t => t.done).length;
              const progress = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0;

              // Mock counts for notes/docs until those tables are linked
              const notesCount = 0;
              const docsCount = 0;

              const updatedDate = new Date(w.created_at).toLocaleDateString();

              return (
                <TouchableOpacity key={w.id} activeOpacity={0.9} onPress={() => navigation.navigate("WorkspaceDetail", { workspace: w })} onLongPress={() => onLongPress(w)}>
                  <View style={[styles.wsCard, { backgroundColor: w.color || "#DBEAFE" }]}>
                    <View style={styles.wsHeader}>
                      <View style={styles.wsIconBox}>
                        <IconCmp size={18} color="#111827" />
                      </View>
                      <Text style={styles.wsTitle}>{w.title}</Text>
                    </View>
                    <Text style={styles.wsSub}>{notesCount} Notes • {docsCount} Documents • {doneTasks}/{totalTasks} Tasks</Text>
                    <View style={{ marginTop: 10 }}>
                      <ProgressBar value={progress} />
                    </View>
                    <View style={styles.wsFooter}>
                      <Clock size={14} color="#374151" />
                      <Text style={styles.wsTime}>Created {updatedDate}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      )}

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => { resetForm(); setSheetOpen(true); }}>
        <Plus color="#fff" size={28} />
      </TouchableOpacity>

      {/* Create/Edit Sheet */}
      <Modal transparent visible={sheetOpen} animationType="slide" onRequestClose={resetForm}>
        <Pressable style={styles.sheetBackdrop} onPress={resetForm} />
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>{editingId ? "Edit Workspace" : "Create Workspace"}</Text>
          <Text style={styles.label}>Title</Text>
          <TextInput style={styles.input} placeholder="e.g., Client A" value={title} onChangeText={setTitle} />
          <Text style={styles.label}>Icon</Text>
          <View style={styles.iconRow}>
            {['Folder', 'Briefcase', 'Building2', 'BookOpen', 'Lightbulb', 'Wrench', 'Files', 'Layers'].map(name => {
              const I = Icons[name] || Icons.Folder;
              const active = icon === name;
              return (
                <TouchableOpacity key={name} onPress={() => setIcon(name)} style={[styles.iconPick, active && styles.iconActive]}>
                  <I size={18} color="#111827" />
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={styles.label}>Color</Text>
          <View style={styles.colorRow}>
            {["#DBEAFE", "#FDE68A", "#FCE7F3", "#DCFCE7", "#E9D5FF", "#FFE4E6", "#E0F2FE"].map(c => (
              <TouchableOpacity key={c} onPress={() => setColor(c)} style={[styles.colorDot, { backgroundColor: c }, color === c && styles.colorActive]} />
            ))}
          </View>
          <TouchableOpacity style={styles.createBtn} onPress={handleSave} disabled={creating}>
            {creating ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff", fontWeight: "700" }}>{editingId ? "Save Changes" : "Create"}</Text>}
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: spacing.md, paddingVertical: spacing.md, backgroundColor: colors.surface, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  title: { fontSize: fonts.h1, fontWeight: "800", color: colors.text },
  searchWrap: { margin: spacing.md, paddingHorizontal: spacing.md, backgroundColor: colors.surface, borderRadius: 9999, height: 44, flexDirection: "row", alignItems: "center", shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 },
  search: { flex: 1, height: 44, color: colors.text, marginLeft: 8 },
  wsCard: { borderRadius: 16, padding: spacing.md, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 6, elevation: 2, marginBottom: 12 },
  wsHeader: { flexDirection: "row", alignItems: "center" },
  wsIconBox: { width: 28, height: 28, borderRadius: 8, backgroundColor: "#FFFFFFAA", alignItems: "center", justifyContent: "center" },
  wsTitle: { fontWeight: "800", color: "#111827", marginLeft: 10 },
  wsSub: { color: "#374151", marginTop: 6 },
  wsFooter: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  wsTime: { color: "#374151", fontSize: 12 },
  fab: { position: "absolute", right: 20, bottom: 30, width: 60, height: 60, borderRadius: 30, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center", elevation: 6 },
  sheetBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.2)" },
  sheet: { backgroundColor: colors.surface, padding: spacing.md, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg },
  sheetHandle: { width: 50, height: 5, backgroundColor: "#E5E7EB", borderRadius: 9999, alignSelf: "center", marginBottom: 8 },
  sheetTitle: { fontWeight: "800", marginBottom: spacing.md },
  label: { color: colors.muted, marginTop: spacing.sm },
  input: { borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 10, padding: 10, marginTop: 6 },
  iconRow: { flexDirection: "row", marginTop: 6 },
  iconPick: { width: 36, height: 36, borderRadius: 10, backgroundColor: "#F3F4F6", alignItems: "center", justifyContent: "center", marginRight: 8 },
  iconActive: { borderWidth: 2, borderColor: colors.primary },
  colorRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 6 },
  colorDot: { width: 28, height: 28, borderRadius: 14, borderWidth: 1, borderColor: "#E5E7EB", marginRight: 10, marginBottom: 10 },
  colorActive: { borderColor: colors.primary, borderWidth: 2 },
  createBtn: { marginTop: spacing.md, backgroundColor: colors.primary, padding: 12, borderRadius: 12, alignItems: "center" },
});

