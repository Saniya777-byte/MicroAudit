import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Pressable, TextInput, Linking, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, MoreVertical, Edit3, Star, FileText, StickyNote, Camera, Plus, Clock, Link as LinkIcon, CheckCircle2, Circle } from "lucide-react-native";
import * as Icons from "lucide-react-native";
import ProgressBar from "../components/ProgressBar";
import SectionHeader from "../components/SectionHeader";
import Card from "../components/Card";
import { colors, spacing, radius, fonts } from "../theme";

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
const mockTasksInit = [
  { id: "t1", title: "Prepare invoice", done: true },
  { id: "t2", title: "Upload scanned receipt", done: false },
  { id: "t3", title: "Email client", done: false },
];
const mockActivity = [
  { id: "a1", text: "Added document \"Invoice_1234.pdf\"", time: "3h ago", icon: "doc" },
  { id: "a2", text: "Created note \"Sprint plan\"", time: "1d ago", icon: "note" },
  { id: "a3", text: "Completed task \"Prepare invoice\"", time: "2d ago", icon: "task" },
];

export default function WorkspaceDetail({ route, navigation }) {
  const workspace = route?.params?.workspace || { id: "w0", title: "Workspace", icon: "Folder", color: "#DBEAFE", notes: 0, docs: 0, done: 0, total: 0 };
  const IconCmp = Icons[workspace.icon] || Icons.Folder;
  const [tasks, setTasks] = useState(mockTasksInit);
  const [newTask, setNewTask] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);

  const progress = useMemo(() => {
    const total = tasks.length || 0;
    const done = tasks.filter(t => t.done).length;
    return total ? Math.round((done / total) * 100) : 0;
  }, [tasks]);

  const toggleTask = (id) => setTasks(ts => ts.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const addTask = () => { if (!newTask.trim()) return; setTasks(ts => [...ts, { id: `t${ts.length+1}`, title: newTask.trim(), done: false }]); setNewTask(""); };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
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

      <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: 100 }}>
        {/* Overview */}
        <Card style={{ borderRadius: 24, padding: spacing.lg }}>
          <Text style={styles.ovTitle}>Overview</Text>
          <View style={styles.ovRow}>
            <View style={styles.ovStat}><Text style={styles.ovNumber}>{workspace.notes || 12}</Text><Text style={styles.ovLabel}>Notes</Text></View>
            <View style={styles.ovStat}><Text style={styles.ovNumber}>{workspace.docs || 5}</Text><Text style={styles.ovLabel}>Documents</Text></View>
            <View style={styles.ovStat}><Text style={styles.ovNumber}>{tasks.filter(t=>t.done).length}</Text><Text style={styles.ovLabel}>Tasks</Text></View>
          </View>
          <Text style={{ marginTop: 8, fontWeight: "700" }}>Progress: {progress}%</Text>
          <View style={{ marginTop: 8 }}><ProgressBar value={progress} /></View>
        </Card>

        {/* Pinned */}
        <SectionHeader title="Pinned" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 4 }}>
          {mockNotes.filter(n=>n.pinned).map(n => (
            <View key={n.id} style={[styles.pinCard, { backgroundColor: n.color }]}>
              <Star size={14} color="#111827" />
              <Text numberOfLines={1} style={{ fontWeight: "700", marginTop: 4 }}>{n.title}</Text>
              <Text numberOfLines={1} style={{ color: "#374151", marginTop: 2 }}>{n.preview}</Text>
            </View>
          ))}
          {mockDocs.slice(0,1).map(d => (
            <View key={d.id} style={[styles.pinCard, { backgroundColor: "#EEF2FF" }]}>
              <FileText size={14} color="#1D4ED8" />
              <Text numberOfLines={1} style={{ fontWeight: "700", marginTop: 4 }}>{d.name}</Text>
              <Text numberOfLines={1} style={{ color: "#374151", marginTop: 2 }}>Updated {d.updated}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Notes */}
        <SectionHeader title="Notes" actionText="View All" onPress={() => navigation.navigate("Notes")} />
        <View style={styles.grid}> 
          {mockNotes.map(n => (
            <TouchableOpacity key={n.id} style={[styles.noteCard, { backgroundColor: n.color }]} onPress={() => navigation.navigate("NoteEditor", n)}>
              <StickyNote size={16} color="#111827" />
              <Text style={{ fontWeight: "700", marginTop: 6 }} numberOfLines={1}>{n.title}</Text>
              <Text style={{ color: "#374151", marginTop: 4 }} numberOfLines={2}>{n.preview}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Documents */}
        <SectionHeader title="Documents" actionText="View All" onPress={() => navigation.navigate("Documents")} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 4 }}>
          {mockDocs.map(d => (
            <View key={d.id} style={styles.docTile}>
              <View style={styles.docThumb}><FileText color={colors.primary} size={20} /></View>
              <Text style={styles.docName} numberOfLines={1}>{d.name}</Text>
              <Text style={styles.docMeta}>Last updated: {d.updated}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Resources */}
        <SectionHeader title="Resources" />
        <View style={styles.imgGrid}>
          {mockResources.images.map(img => (
            <TouchableOpacity key={img.id} onPress={() => Linking.openURL(img.uri)}>
              <Image source={{ uri: img.uri }} style={styles.img} />
            </TouchableOpacity>
          ))}
        </View>
        <View style={{ marginTop: 8 }}>
          {mockResources.links.map(l => (
            <TouchableOpacity key={l.id} style={[styles.linkCard, { marginTop: 8 }]} onPress={() => Linking.openURL(l.url)}>
              <LinkIcon size={16} color={colors.muted} />
              <Text style={{ marginLeft: 8, flex: 1 }} numberOfLines={1}>{l.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Checklist */}
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

        {/* Recent Activity */}
        <SectionHeader title="Recent Activity" />
        <Card>
          {mockActivity.map((a, idx) => (
            <View key={a.id} style={[styles.actRow, idx < mockActivity.length - 1 && styles.actDivider]}>
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
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setSheetOpen(true)}>
        <Plus color="#fff" size={28} />
      </TouchableOpacity>

      {/* Bottom Sheet */}
      <Modal transparent visible={sheetOpen} animationType="slide" onRequestClose={() => setSheetOpen(false)}>
        <Pressable style={styles.sheetBackdrop} onPress={() => setSheetOpen(false)} />
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>Add to Workspace</Text>
          <View style={styles.sheetRow}>
            <TouchableOpacity style={styles.sheetAction} onPress={() => { setSheetOpen(false); navigation.navigate("NoteEditor", { id: null }); }}>
              <StickyNote color={colors.primary} size={22} />
              <Text style={styles.sheetActionText}>Create Note</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sheetAction} onPress={() => { setSheetOpen(false); navigation.navigate("Scan"); }}>
              <Camera color={colors.primary} size={22} />
              <Text style={styles.sheetActionText}>Scan Document</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sheetAction} onPress={() => { setSheetOpen(false); }}>
              <FileText color={colors.primary} size={22} />
              <Text style={styles.sheetActionText}>Upload File</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.md, paddingVertical: spacing.md, borderBottomLeftRadius: radius.lg, borderBottomRightRadius: radius.lg },
  headerTitle: { flex: 1, marginHorizontal: 12, fontWeight: "800", color: "#111827" },
  ovTitle: { fontWeight: "800", fontSize: 16, marginBottom: 8 },
  ovRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  ovStat: { alignItems: "center", flex: 1 },
  ovNumber: { fontWeight: "800", fontSize: 18 },
  ovLabel: { color: "#6B7280" },
  pinCard: { width: 140, borderRadius: 16, padding: 10, marginRight: 10 },
  grid: { flexDirection: "row", flexWrap: "wrap", marginTop: 6 },
  noteCard: { width: "47%", borderRadius: 16, padding: 12, marginRight: 12, marginBottom: 12 },
  docTile: { width: 180, backgroundColor: "#fff", borderRadius: 16, padding: 12, marginRight: 12, borderWidth: 1, borderColor: "#E5E7EB" },
  docThumb: { width: 36, height: 36, borderRadius: 8, backgroundColor: "#EEF2FF", alignItems: "center", justifyContent: "center" },
  docName: { fontWeight: "700", marginTop: 8 },
  docMeta: { fontSize: 12, color: "#6B7280", marginTop: 4 },
  imgGrid: { flexDirection: "row", flexWrap: "wrap", marginTop: 8 },
  img: { width: 100, height: 100, borderRadius: 12 },
  linkCard: { flexDirection: "row", alignItems: "center", backgroundColor: colors.surface, borderRadius: 12, padding: 12 },
  taskRow: { flexDirection: "row", alignItems: "center" },
  taskText: { color: colors.text },
  taskAdd: { flexDirection: "row", alignItems: "center", borderTopWidth: 1, borderTopColor: "#E5E7EB", paddingTop: 8 },
  actRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10 },
  actDivider: { borderBottomWidth: 1, borderBottomColor: "#E5E7EB" },
  fab: { position: "absolute", right: 20, bottom: 30, width: 60, height: 60, borderRadius: 30, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center", elevation: 6 },
  sheetBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.2)" },
  sheet: { backgroundColor: colors.surface, padding: spacing.md, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg },
  sheetHandle: { width: 50, height: 5, backgroundColor: "#E5E7EB", borderRadius: 9999, alignSelf: "center", marginBottom: 8 },
  sheetTitle: { fontWeight: "800", marginBottom: spacing.md },
  sheetRow: { flexDirection: "row", justifyContent: "space-around" },
  sheetAction: { alignItems: "center", marginRight: 6 },
  sheetActionText: { fontSize: 12, marginTop: 4 },
});
