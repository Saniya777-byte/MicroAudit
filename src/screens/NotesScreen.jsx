import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Search, MoreVertical, Grid2x2, Rows, Plus, StickyNote, Pin, Clock } from "lucide-react-native";
import Card from "../components/Card";
import Button from "../components/Button";
import { colors, spacing, radius, fonts } from "../theme";
import { supabase } from "../lib/supabaseClient";

export default function NotesScreen({ navigation }) {
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState("All");
  const [view, setView] = useState("grid");
  const [menuOpen, setMenuOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [notes, setNotes] = useState([]);

  const loadNotes = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        console.log("No user found — clearing notes");
        setNotes([]);
        return;
      }

      console.log("Loading notes for user:", user.id);

      const { data, error } = await supabase
        .from("notes")
        .select("id, title, content, color, tags, pinned, updated_at, user_id")
        .eq("user_id", user.id) // 🔥 FIXED: no mismatch
        .order("updated_at", { ascending: false });

      if (error) {
        console.error("Error loading notes:", error);
        return;
      }

      const mapped = (data || []).map((n) => ({
        id: n.id,
        title: n.title || "Untitled",
        content: n.content || "",
        color: n.color || "#FFFFFF",
        tags: Array.isArray(n.tags) ? n.tags : [],
        pinned: !!n.pinned,
        updatedAt: n.updated_at,
      }));

      setNotes(mapped);
    } catch (err) {
      console.error("Unexpected error loading notes:", err);
    }
  };

  // Load on mount + when user logs in/out
  useEffect(() => {
    loadNotes();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadNotes();
    });

    return () => subscription?.unsubscribe();
  }, []);


  useEffect(() => {
    const channel = supabase
      .channel("notes_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notes" },
        async (payload) => {
          const {
            data: { user },
          } = await supabase.auth.getUser();

          if (!user) return;

          // Only refresh data if this note belongs to the logged-in user
          if (payload.new?.user_id === user.id || payload.old?.user_id === user.id) {
            console.log("Realtime update detected — reloading notes");
            loadNotes();
          }
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const allTags = useMemo(() => {
    const set = new Set();
    notes.forEach((n) => n.tags?.forEach((t) => set.add(t)));
    return ["All", ...Array.from(set)];
  }, [notes]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return notes.filter((n) => {
      const matchText =
        !q ||
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        n.tags.some((t) => t.toLowerCase().includes(q));

      const matchTag = activeTag === "All" || n.tags.includes(activeTag);

      return matchText && matchTag;
    });
  }, [query, activeTag, notes]);

  const pinned = filtered.filter((n) => n.pinned);
  const others = filtered.filter((n) => !n.pinned);

  const onLongPressNote = (n) => {
    Alert.alert("Note", n.title, [
      { text: n.pinned ? "Unpin" : "Pin", onPress: () => {} },
      { text: "Edit", onPress: () => {} },
      { text: "Duplicate", onPress: () => {} },
      { text: "Share", onPress: () => {} },
      { text: "Delete", style: "destructive", onPress: () => {} },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const NoteCard = ({ note }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate("NoteEditor", note)}
      onLongPress={() => onLongPressNote(note)}
      style={[styles.card, { backgroundColor: note.color }]}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {note.title}
        </Text>
        {note.pinned && <Pin size={14} color="#111827" />}
      </View>
      <Text style={styles.cardPreview} numberOfLines={3}>
        {note.content}
      </Text>
      <View style={styles.tagRow}>
        {note.tags.map((t) => (
          <View key={t} style={styles.tagChip}>
            <Text style={styles.tagText}>{t}</Text>
          </View>
        ))}
      </View>
      <View style={styles.timeRow}>
        <Clock size={12} color="#374151" />
        <Text style={styles.timeText}>Edited {note.updatedAt} ago</Text>
      </View>
    </TouchableOpacity>
  );

  const NoteRow = ({ note }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate("NoteEditor", note)}
      onLongPress={() => onLongPressNote(note)}
      style={styles.row}
    >
      <View style={[styles.rowIcon, { backgroundColor: note.color }]}>
        <StickyNote size={18} color="#111827" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowTitle} numberOfLines={1}>
          {note.title}
        </Text>
        <Text style={styles.rowPreview} numberOfLines={1}>
          {note.content}
        </Text>
      </View>
      {note.pinned && <Pin size={16} color={colors.muted} />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Notes</Text>
        <TouchableOpacity onPress={() => setMenuOpen(true)}>
          <MoreVertical color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <Search size={18} color={colors.muted} />
        <TextInput
          style={styles.search}
          placeholder="Search notes…"
          value={query}
          onChangeText={setQuery}
          placeholderTextColor="#9CA3AF"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery("")}>
            <Text style={{ color: colors.muted }}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Tags */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {allTags.map((t) => {
          const active = t === activeTag;
          return (
            <TouchableOpacity
              key={t}
              style={[styles.chip, active ? styles.chipActive : styles.chipOutline]}
              onPress={() => setActiveTag(t)}
            >
              <Text style={[styles.chipText, active && { color: "#111827", fontWeight: "700" }]}>
                {t}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* View toggle */}
      <View style={styles.viewToggle}>
        <TouchableOpacity
          style={[styles.toggleBtn, view === "grid" && styles.toggleActive]}
          onPress={() => setView("grid")}
        >
          <Grid2x2 size={16} color={view === "grid" ? colors.surface : colors.text} />
          <Text style={[styles.toggleText, view === "grid" && { color: colors.surface }]}>
            Grid
          </Text>
        </TouchableOpacity>

      <TouchableOpacity
          style={[styles.toggleBtn, view === "list" && styles.toggleActive]}
          onPress={() => setView("list")}
        >
          <Rows size={16} color={view === "list" ? colors.surface : colors.text} />
          <Text style={[styles.toggleText, view === "list" && { color: colors.surface }]}>
            List
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={{ padding: spacing.md }}>
        {filtered.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyTitle}>No notes yet</Text>
            <Text style={styles.emptyText}>Start capturing ideas, thoughts, or reminders.</Text>
            <Button title="Create Your First Note" onPress={() => navigation.navigate("NoteEditor", { id: null })} />
          </View>
        )}

        {/* Pinned */}
        {pinned.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Pinned</Text>
            {view === "grid" ? (
              <View style={styles.grid}>
                {pinned.map((n) => (
                  <NoteCard key={n.id} note={n} />
                ))}
              </View>
            ) : (
              pinned.map((n) => <NoteRow key={n.id} note={n} />)
            )}
          </>
        )}

        {/* Others */}
        {others.length > 0 && (
          <>
            {pinned.length > 0 && <Text style={styles.sectionLabel}>Others</Text>}
            {view === "grid" ? (
              <View style={styles.grid}>
                {others.map((n) => (
                  <NoteCard key={n.id} note={n} />
                ))}
              </View>
            ) : (
              others.map((n) => <NoteRow key={n.id} note={n} />)
            )}
          </>
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate("NoteEditor", { id: null })}>
        <Plus color="#fff" size={28} />
      </TouchableOpacity>

      {/* Bottom Sheet */}
      <Modal transparent visible={sheetOpen} animationType="slide" onRequestClose={() => setSheetOpen(false)}>
        <Pressable style={styles.sheetBackdrop} onPress={() => setSheetOpen(false)} />
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>Create</Text>
          <View style={styles.sheetRow}>
            <TouchableOpacity style={styles.sheetAction} onPress={() => { setSheetOpen(false); }}>
              <StickyNote color={colors.primary} size={22} />
              <Text style={styles.sheetActionText}>Create Note</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sheetAction} onPress={() => { setSheetOpen(false); }}>
              <Text style={styles.sheetActionText}>Upload File</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Menu */}
      <Modal transparent visible={menuOpen} animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <Pressable style={styles.menuBackdrop} onPress={() => setMenuOpen(false)} />
        <View style={styles.menu}>
          <Text style={styles.menuTitle}>Options</Text>
          <TouchableOpacity style={styles.menuItem}>
            <Text>Sort: Newest first</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => setView("grid")}>
            <Text>Change view: Grid</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => setView("list")}>
            <Text>Change view: List</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Text>Create Tag</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.menuItem, { borderTopWidth: 1, borderTopColor: "#E5E7EB" }]}
            onPress={() =>
              Alert.alert("Danger", "Delete all?", [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", style: "destructive" },
              ])
            }
          >
            <Text style={{ color: colors.danger }}>Delete all</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
  },
  title: { fontSize: fonts.h1, fontWeight: "700", color: colors.text },
  searchWrap: {
    margin: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 9999,
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  search: { flex: 1, height: 44, color: colors.text },
  chips: { paddingHorizontal: spacing.md, gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 9999, marginRight: 8 },
  chipOutline: { backgroundColor: colors.surface, borderWidth: 1, borderColor: "#E5E7EB" },
  chipActive: { backgroundColor: "#E5E7EB" },
  chipText: { color: colors.muted, fontSize: fonts.small },
  viewToggle: { flexDirection: "row", gap: 8, paddingHorizontal: spacing.md, marginTop: spacing.sm },
  toggleBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 9999,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  toggleActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  toggleText: { fontSize: fonts.small, color: colors.text },
  sectionLabel: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    marginLeft: spacing.md,
    fontWeight: "700",
    color: colors.muted,
  },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  card: { width: "47%", borderRadius: radius.lg, padding: spacing.md },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardTitle: { fontWeight: "700", color: "#111827" },
  cardPreview: { color: "#374151", marginTop: 6, fontSize: fonts.small },
  tagRow: { flexDirection: "row", gap: 6, marginTop: 8, flexWrap: "wrap" },
  tagChip: { backgroundColor: "#FFFFFFAA", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  tagText: { fontSize: 11, color: "#111827" },
  timeRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 8 },
  timeText: { fontSize: 11, color: "#374151" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  rowTitle: { fontWeight: "700", color: colors.text },
  rowPreview: { fontSize: fonts.small, color: colors.muted },
  empty: { alignItems: "center", padding: spacing.lg, gap: 8 },
  emptyIcon: { fontSize: 40 },
  emptyTitle: { fontWeight: "800", fontSize: fonts.h1 },
  emptyText: { color: colors.muted, marginBottom: spacing.sm },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
  },
  sheetBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.2)" },
  sheet: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
  },
  sheetHandle: {
    width: 50,
    height: 5,
    backgroundColor: "#E5E7EB",
    borderRadius: 9999,
    alignSelf: "center",
    marginBottom: 8,
  },
  sheetTitle: { fontWeight: "800", marginBottom: spacing.md },
  sheetRow: { flexDirection: "row", justifyContent: "space-around" },
  sheetAction: { alignItems: "center", gap: 6 },
  sheetActionText: { marginTop: 4 },
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

