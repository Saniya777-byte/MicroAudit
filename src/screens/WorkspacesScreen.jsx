import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Plus, MoreVertical, Search, Clock } from "lucide-react-native";
import Card from "../components/Card";
import ProgressBar from "../components/ProgressBar";
import { colors, spacing, radius, fonts } from "../theme";

const mock = [
  { id: "w1", title: "Personal", icon: "🧠", color: "#DBEAFE", notes: 6, docs: 3, done: 4, total: 7, updated: "yesterday" },
  { id: "w2", title: "Client A", icon: "🏢", color: "#FDE68A", notes: 12, docs: 9, done: 8, total: 12, updated: "3h ago" },
  { id: "w3", title: "Study", icon: "📚", color: "#FCE7F3", notes: 9, docs: 1, done: 3, total: 8, updated: "2d ago" },
];

export default function WorkspacesScreen({ navigation }) {
  const [q, setQ] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [icon, setIcon] = useState("🗂️");
  const [color, setColor] = useState("#DBEAFE");

  const list = useMemo(() => (q ? mock.filter(w => w.title.toLowerCase().includes(q.toLowerCase())) : mock), [q]);

  const onLongPress = (w) => {
    Alert.alert("Workspace", w.title, [
      { text: "Edit", onPress: () => setSheetOpen(true) },
      { text: "Change icon/color", onPress: () => setSheetOpen(true) },
      { text: "Delete", style: "destructive", onPress: () => {} },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const createWorkspace = () => {
    // TODO: integrate Supabase insert
    setSheetOpen(false);
    setTitle("");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Workspaces</Text>
        <View style={{ flexDirection: "row", gap: 12 }}>
          <TouchableOpacity onPress={() => setSheetOpen(true)}><Plus color={colors.text} /></TouchableOpacity>
          <TouchableOpacity><MoreVertical color={colors.text} /></TouchableOpacity>
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
      <ScrollView contentContainerStyle={{ padding: spacing.md, gap: 12 }}>
        {list.map((w) => {
          const progress = w.total ? Math.round((w.done / w.total) * 100) : 0;
          return (
            <TouchableOpacity key={w.id} activeOpacity={0.9} onPress={() => navigation.navigate("WorkspaceDetail", { workspace: w })} onLongPress={() => onLongPress(w)}>
              <View style={[styles.wsCard, { backgroundColor: w.color }]}> 
                <View style={styles.wsHeader}>
                  <Text style={styles.wsIcon}>{w.icon}</Text>
                  <Text style={styles.wsTitle}>{w.title}</Text>
                </View>
                <Text style={styles.wsSub}>{w.notes} Notes • {w.docs} Documents • {w.done}/{w.total} Tasks</Text>
                <View style={{ marginTop: 10 }}>
                  <ProgressBar value={progress} />
                </View>
                <View style={styles.wsFooter}>
                  <Clock size={14} color="#374151" />
                  <Text style={styles.wsTime}>Updated {w.updated}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setSheetOpen(true)}>
        <Plus color="#fff" size={28} />
      </TouchableOpacity>

      {/* Create Sheet */}
      <Modal transparent visible={sheetOpen} animationType="slide" onRequestClose={() => setSheetOpen(false)}>
        <Pressable style={styles.sheetBackdrop} onPress={() => setSheetOpen(false)} />
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>Create Workspace</Text>
          <Text style={styles.label}>Title</Text>
          <TextInput style={styles.input} placeholder="e.g., Client A" value={title} onChangeText={setTitle} />
          <Text style={styles.label}>Icon</Text>
          <View style={styles.iconRow}>
            {['🗂️','🏢','📚','🧠','🧪','🛠️','💼','📁'].map(i => (
              <TouchableOpacity key={i} onPress={() => setIcon(i)} style={[styles.iconPick, icon === i && styles.iconActive]}><Text style={{ fontSize: 18 }}>{i}</Text></TouchableOpacity>
            ))}
          </View>
          <Text style={styles.label}>Color</Text>
          <View style={styles.colorRow}>
            {["#DBEAFE","#FDE68A","#FCE7F3","#DCFCE7","#E9D5FF","#FFE4E6","#E0F2FE"].map(c => (
              <TouchableOpacity key={c} onPress={() => setColor(c)} style={[styles.colorDot, { backgroundColor: c }, color === c && styles.colorActive]} />
            ))}
          </View>
          <TouchableOpacity style={styles.createBtn} onPress={createWorkspace}><Text style={{ color: "#fff", fontWeight: "700" }}>Create</Text></TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: spacing.md, paddingVertical: spacing.md, backgroundColor: colors.surface, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  title: { fontSize: fonts.h1, fontWeight: "800", color: colors.text },
  searchWrap: { margin: spacing.md, paddingHorizontal: spacing.md, backgroundColor: colors.surface, borderRadius: 9999, height: 44, flexDirection: "row", alignItems: "center", gap: 8, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 },
  search: { flex: 1, height: 44, color: colors.text },
  wsCard: { borderRadius: 16, padding: spacing.md, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  wsHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  wsIcon: { fontSize: 20 },
  wsTitle: { fontWeight: "800", color: "#111827" },
  wsSub: { color: "#374151", marginTop: 6 },
  wsFooter: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 10 },
  wsTime: { color: "#374151", fontSize: 12 },
  fab: { position: "absolute", right: 20, bottom: 30, width: 60, height: 60, borderRadius: 30, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center", elevation: 6 },
  sheetBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.2)" },
  sheet: { backgroundColor: colors.surface, padding: spacing.md, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg },
  sheetHandle: { width: 50, height: 5, backgroundColor: "#E5E7EB", borderRadius: 9999, alignSelf: "center", marginBottom: 8 },
  sheetTitle: { fontWeight: "800", marginBottom: spacing.md },
  label: { color: colors.muted, marginTop: spacing.sm },
  input: { borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 10, padding: 10, marginTop: 6 },
  iconRow: { flexDirection: "row", gap: 8, marginTop: 6 },
  iconPick: { width: 36, height: 36, borderRadius: 10, backgroundColor: "#F3F4F6", alignItems: "center", justifyContent: "center" },
  iconActive: { borderWidth: 2, borderColor: colors.primary },
  colorRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 6 },
  colorDot: { width: 28, height: 28, borderRadius: 14, borderWidth: 1, borderColor: "#E5E7EB" },
  colorActive: { borderColor: colors.primary, borderWidth: 2 },
  createBtn: { marginTop: spacing.md, backgroundColor: colors.primary, padding: 12, borderRadius: 12, alignItems: "center" },
});
