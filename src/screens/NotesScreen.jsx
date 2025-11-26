import React, { useEffect, useMemo, useState, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Plus } from "lucide-react-native";
import { colors, spacing } from "../theme";
import { supabase } from "../lib/supabaseClient";

import NotesHeader from "../components/notes/NotesHeader";
import SearchBar from "../components/notes/SearchBar";
import TagsFilter from "../components/notes/TagsFilter";
import ViewToggle from "../components/notes/ViewToggle";
import EmptyNotes from "../components/notes/EmptyNotes";
import NoteCard from "../components/notes/NoteCard";
import NoteRow from "../components/notes/NoteRow";
import NotesMenu from "../components/notes/NotesMenu";
import CreateNoteSheet from "../components/notes/CreateNoteSheet";

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
        .eq("user_id", user.id)
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

  useFocusEffect(
    useCallback(() => {
      loadNotes();
    }, [])
  );


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

  const onLongPressNote = async (n) => {
    const handleDelete = async () => {
      try {
        const { error } = await supabase
          .from('notes')
          .delete()
          .eq('id', n.id);

        if (error) {
          console.error('Error deleting note:', error);
          Alert.alert('Error', 'Failed to delete the note. Please try again.');
          return;
        }
        
        // Update local state to remove the deleted note
        setNotes(prevNotes => prevNotes.filter(note => note.id !== n.id));
      } catch (err) {
        console.error('Unexpected error deleting note:', err);
        Alert.alert('Error', 'An unexpected error occurred while deleting the note.');
      }
    };

    Alert.alert(
      "Note Options",
      n.title,
      [
        { text: n.pinned ? "Unpin" : "Pin", onPress: () => { } },
        { text: "Edit", onPress: () => navigation.navigate("NoteEditor", n) },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: () => {
            Alert.alert(
              "Delete Note",
              "Are you sure you want to delete this note?",
              [
                {
                  text: "Cancel",
                  style: "cancel"
                },
                { 
                  text: "Delete", 
                  style: "destructive",
                  onPress: handleDelete
                }
              ]
            );
          } 
        },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <NotesHeader onMenuPress={() => setMenuOpen(true)} />

      <SearchBar query={query} setQuery={setQuery} />

      <TagsFilter allTags={allTags} activeTag={activeTag} setActiveTag={setActiveTag} />

      <ViewToggle view={view} setView={setView} />

      <ScrollView contentContainerStyle={{ padding: spacing.md }}>
        {filtered.length === 0 && (
          <EmptyNotes onCreate={() => navigation.navigate("NoteEditor", { id: null })} />
        )}

        {/* Pinned */}
        {pinned.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Pinned</Text>
            {view === "grid" ? (
              <View style={styles.grid}>
                {pinned.map((n) => (
                  <NoteCard
                    key={n.id}
                    note={n}
                    onPress={() => navigation.navigate("NoteEditor", n)}
                    onLongPress={() => onLongPressNote(n)}
                  />
                ))}
              </View>
            ) : (
              pinned.map((n) => (
                <NoteRow
                  key={n.id}
                  note={n}
                  onPress={() => navigation.navigate("NoteEditor", n)}
                  onLongPress={() => onLongPressNote(n)}
                />
              ))
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
                  <NoteCard
                    key={n.id}
                    note={n}
                    onPress={() => navigation.navigate("NoteEditor", n)}
                    onLongPress={() => onLongPressNote(n)}
                  />
                ))}
              </View>
            ) : (
              others.map((n) => (
                <NoteRow
                  key={n.id}
                  note={n}
                  onPress={() => navigation.navigate("NoteEditor", n)}
                  onLongPress={() => onLongPressNote(n)}
                />
              ))
            )}
          </>
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate("NoteEditor", { id: null })}>
        <Plus color="#fff" size={28} />
      </TouchableOpacity>

      <CreateNoteSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onCreateNote={() => navigation.navigate("NoteEditor", { id: null })}
      />

      <NotesMenu
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        setView={setView}
        onDeleteAll={() => { }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.bg },
  sectionLabel: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    marginLeft: spacing.md,
    fontWeight: "700",
    color: colors.muted,
  },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
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
});


