import React from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image, Modal, Pressable, Alert } from "react-native";
import { Home, FileText, Camera, User, Bell, Settings, Plus, StickyNote, Clock } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Card from "../components/Card";
import Button from "../components/Button";
import { colors, spacing, radius, fonts } from "../theme";


export default function Dashboard({ navigation }) {
  const notes = [
    { id: "n1", title: "Grocery List", preview: "Milk, eggs, bread...", tags: ["Personal"], color: "#DBEAFE" },
    { id: "n2", title: "Meeting Notes", preview: "Q1 goals and KPIs...", tags: ["Work"], color: "#FDE68A" },
    { id: "n3", title: "Study Plan", preview: "Read chapter 3-4...", tags: ["Study"], color: "#FCE7F3" },
  ];

  const docs = [
    { id: "d1", name: "Electricity Bill.pdf", type: "Bill", updated: "2 days ago" },
    { id: "d2", name: "Passport.pdf", type: "ID", updated: "yesterday" },
    { id: "d3", name: "Invoice_0231.pdf", type: "Bill", updated: "3 hours ago" },
  ];

  const activity = [
    { id: "a1", icon: "doc", text: "Electricity Bill.pdf — Added", time: "yesterday" },
    { id: "a2", icon: "note", text: "Shopping List — Edited", time: "3 hours ago" },
    { id: "a3", icon: "scan", text: "Passport Scan — Uploaded", time: "2 days ago" },
  ];

  const [sheetOpen, setSheetOpen] = React.useState(false);

  const onLongPressNote = (n) => {
    Alert.alert("Note Options", n.title, [
      { text: "Edit", onPress: () => {} },
      { text: "Delete", style: "destructive", onPress: () => {} },
      { text: "Share", onPress: () => {} },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const onLongPressDoc = (d) => {
    Alert.alert("Document Options", d.name, [
      { text: "Rename", onPress: () => {} },
      { text: "Delete", style: "destructive", onPress: () => {} },
      { text: "Share", onPress: () => {} },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.logo}>MicroAudit</Text>
          <View style={styles.headerIcons}>
          <Bell size={20} color="#4B5563" style={styles.icon} />
          <Settings size={20} color="#4B5563" style={styles.icon} />
          </View>
        </View>

        <ScrollView style={styles.content}>
          <Card style={{ marginBottom: spacing.md }}>
            <Text style={styles.businessName}>Welcome back 👋</Text>
            <Text style={styles.subtle}>Here’s a quick overview</Text>
            <View style={styles.overviewRow}>
              <View style={[styles.pill, { backgroundColor: "#DCFCE7" }]}>
                <Text style={styles.pillText}>3 Valid</Text>
              </View>
              <View style={[styles.pill, { backgroundColor: "#FEF9C3" }]}>
                <Text style={styles.pillText}>2 Expiring</Text>
              </View>
              <View style={[styles.pill, { backgroundColor: "#FECACA" }]}>
                <Text style={styles.pillText}>1 Expired</Text>
              </View>
            </View>
          </Card>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <TouchableOpacity><Text style={styles.link}>View all ›</Text></TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
            {notes.map((n) => (
              <TouchableOpacity key={n.id} onLongPress={() => onLongPressNote(n)} style={[styles.noteCard, { backgroundColor: n.color }]}> 
                <StickyNote color="#111827" size={18} />
                <Text style={styles.noteTitle}>{n.title}</Text>
                <Text style={styles.notePreview} numberOfLines={2}>{n.preview}</Text>
                <View style={styles.tagRow}>
                  {n.tags.map((t) => (
                    <View key={t} style={styles.tagChip}><Text style={styles.tagText}>{t}</Text></View>
                  ))}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Documents</Text>
            <TouchableOpacity><Text style={styles.link}>View all ›</Text></TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
            {docs.map((d) => (
              <TouchableOpacity key={d.id} onLongPress={() => onLongPressDoc(d)} style={styles.docTile}>
                <View style={styles.docThumb}><FileText color={colors.primary} size={22} /></View>
                <Text style={styles.docName} numberOfLines={1}>{d.name}</Text>
                <Text style={styles.docMeta}>{d.type} • Last updated: {d.updated}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
          </View>
          <Card>
            {activity.map((a, idx) => (
              <View key={a.id} style={[styles.activityRow, idx < activity.length - 1 && styles.activityDivider]}>
                <View style={styles.leftIcon}>
                  {a.icon === "doc" && <FileText size={16} color={colors.muted} />}
                  {a.icon === "note" && <StickyNote size={16} color={colors.muted} />}
                  {a.icon === "scan" && <Camera size={16} color={colors.muted} />}
                </View>
                <Text style={styles.activityText}>{a.text}</Text>
                <View style={{ marginLeft: "auto", flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Clock size={14} color={colors.muted} />
                  <Text style={styles.activityTime}>{a.time}</Text>
                </View>
              </View>
            ))}
          </Card>
        </ScrollView>

        <TouchableOpacity style={styles.fab} onPress={() => setSheetOpen(true)} accessibilityRole="button" accessibilityLabel="Create">
          <Plus color="#fff" size={28} />
        </TouchableOpacity>

        <Modal transparent visible={sheetOpen} animationType="slide" onRequestClose={() => setSheetOpen(false)}>
          <Pressable style={styles.sheetBackdrop} onPress={() => setSheetOpen(false)} />
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Create</Text>
            <View style={styles.sheetRow}>
              <TouchableOpacity style={styles.sheetAction} onPress={() => { setSheetOpen(false); navigation.navigate("NoteEditor", { id: null }); }}>
                <StickyNote color={colors.primary} size={22} />
                <Text style={styles.sheetActionText}>Create Note</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.sheetAction} onPress={() => { setSheetOpen(false); /* navigate to upload */ }}>
                <FileText color={colors.primary} size={22} />
                <Text style={styles.sheetActionText}>Upload File</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.sheetAction} onPress={() => { setSheetOpen(false); navigation.navigate("Scan"); }}>
                <Camera color={colors.primary} size={22} />
                <Text style={styles.sheetActionText}>Scan Document</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

      </View>
    </SafeAreaView>

  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F9FAFB" },
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  logo: { fontSize: 18, fontWeight: "bold", color: "#1D4ED8" },
  headerIcons: { flexDirection: "row", gap: 12 },
  icon: { fontSize: 18, color: "#4B5563" },
  content: { padding: 16 },
  businessName: { fontSize: 16, fontWeight: "600" },
  subtle: { color: "#6B7280", marginTop: 4 },
  overviewRow: { flexDirection: "row", gap: 8, marginTop: 12 },
  pill: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 9999 },
  pillText: { fontSize: 12, fontWeight: "600", color: "#111827" },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8, marginBottom: 8 },
  sectionTitle: { fontSize: 16, fontWeight: "600" },
  link: { color: "#1D4ED8", fontWeight: "600" },
  horizontalList: { paddingRight: 16 },
  noteCard: { width: 180, borderRadius: 16, padding: 12, marginRight: 12 },
  noteTitle: { fontSize: 14, fontWeight: "700", marginTop: 6 },
  notePreview: { fontSize: 12, color: "#374151", marginTop: 4 },
  tagRow: { flexDirection: "row", gap: 6, marginTop: 10 },
  tagChip: { backgroundColor: "#FFFFFFAA", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  tagText: { fontSize: 12, color: "#111827" },
  docTile: { width: 180, backgroundColor: "#fff", borderRadius: 16, padding: 12, marginRight: 12, borderWidth: 1, borderColor: "#E5E7EB" },
  docThumb: { width: 36, height: 36, borderRadius: 8, backgroundColor: "#EEF2FF", alignItems: "center", justifyContent: "center" },
  docName: { fontSize: 14, fontWeight: "600", marginTop: 8 },
  docMeta: { fontSize: 12, color: "#6B7280", marginTop: 4 },
  activityRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10 },
  activityDivider: { borderBottomWidth: 1, borderBottomColor: "#E5E7EB" },
  leftIcon: { width: 28, alignItems: "center" },
  activityText: { marginLeft: 10, color: "#111827", flexShrink: 1 },
  activityTime: { color: "#6B7280", fontSize: 12 },
  fab: { position: "absolute", right: 20, bottom: 30, width: 60, height: 60, borderRadius: 30, backgroundColor: "#1D4ED8", alignItems: "center", justifyContent: "center", elevation: 6, shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 8 },
  sheetBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.2)" },
  sheet: { backgroundColor: "#fff", padding: 16, borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  sheetHandle: { width: 50, height: 5, backgroundColor: "#E5E7EB", borderRadius: 9999, alignSelf: "center", marginBottom: 8 },
  sheetTitle: { fontSize: 16, fontWeight: "700", marginBottom: 12 },
  sheetRow: { flexDirection: "row", justifyContent: "space-around" },
  sheetAction: { alignItems: "center", gap: 6 },
  sheetActionText: { fontSize: 12, marginTop: 4 },
});

