import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Modal, Pressable, ToastAndroid } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, MoreVertical, Pin, PinOff, Share2, Bold, Italic, Underline, List, CheckSquare, Hash, Palette } from "lucide-react-native";
import { colors, spacing, radius, fonts } from "../theme";
import { supabase } from "../lib/supabaseClient";

const pastelColors = ["#FFFFFF", "#FDE68A", "#FCE7F3", "#DBEAFE", "#DCFCE7", "#E9D5FF", "#FFE4E6", "#E0F2FE"];

export default function NoteEditor({ navigation, route }) {
  const initialId = route?.params?.id || null;
  const initialTitle = route?.params?.title || "";
  const initialContent = route?.params?.content || "";
  const initialColor = route?.params?.color || "#FFFFFF";
  const initialTags = route?.params?.tags || [];
  const initialPinned = !!route?.params?.pinned;

  const [noteId, setNoteId] = useState(initialId);
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [color, setColor] = useState(initialColor);
  const [tags, setTags] = useState(initialTags);
  const [pinned, setPinned] = useState(initialPinned);
  const [toolbarVisible, setToolbarVisible] = useState(true);
  const [tagSheetOpen, setTagSheetOpen] = useState(false);
  const [colorSheetOpen, setColorSheetOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const saveTimer = useRef(null);

  // Auto-save debounce
  const scheduleSave = () => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      if (saving) return;
      
      setSaving(true);
      
      try {
        // Get current session and user
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          console.error("No active session found");
          if (Platform.OS === "android") {
            ToastAndroid.show("Please sign in to save notes", ToastAndroid.SHORT);
          }
          return;
        }

        const user = session.user;
        
        // Create or update note
        const payload = {
          id: noteId || undefined,
          user_id: user.id,
          title: title || "Untitled",
          content: content || "",
          color,
          tags: tags || [],
          pinned: pinned || false,
          updated_at: new Date().toISOString(),
        };

        const { data, error } = await supabase
          .from("notes")
          .upsert(payload, { onConflict: 'id' })
          .select()
          .single();

        if (error) throw error;

        // If this is a new note, update the local ID
        if (!noteId && data?.id) {
          setNoteId(data.id);
          console.log("New note created with ID:", data.id);
        }

        console.log("Note saved successfully");
        if (Platform.OS === "android") {
          ToastAndroid.show("Note saved", ToastAndroid.SHORT);
        }
      } catch (error) {
        console.error("Error saving note:", error);
        if (Platform.OS === "android") {
          ToastAndroid.show("Failed to save note: " + (error.message || "Unknown error"), ToastAndroid.LONG);
        }
      } finally {
        setSaving(false);
      }
    }, 1000); // 1 second debounce
  };

  useEffect(() => { return () => { if (saveTimer.current) clearTimeout(saveTimer.current); }; }, []);
  useEffect(() => { scheduleSave(); }, [title, content]);
  useEffect(() => { scheduleSave(); }, [pinned, color, JSON.stringify(tags)]);

  const toggleTag = (t) => {
    setTags((prev) => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  };

  const suggestedTags = useMemo(() => {
    const base = ["Work", "Study", "Personal", "Ideas", "Important"];
    return Array.from(new Set([...base, ...tags]));
  }, [tags]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: color }]}> 
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeft color={"#111827"} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>{title?.length ? title : "New Note"}</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <TouchableOpacity onPress={() => { setPinned((p) => !p); }}>
              {pinned ? <Pin color="#111827" /> : <PinOff color="#111827" />}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { /* share placeholder */ }}>
              <Share2 color="#111827" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { /* more options placeholder */ }}>
              <MoreVertical color="#111827" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Title */}
        <View style={styles.titleWrap}>
          <TextInput
            style={styles.titleInput}
            placeholder="Title…"
            value={title}
            onChangeText={setTitle}
            placeholderTextColor="#9CA3AF"
            autoFocus={!noteId}
          />

          {/* Applied tags */}
          {tags.length > 0 && (
            <View style={styles.tagRow}> 
              {tags.map((t) => (
                <View key={t} style={styles.tagChip}><Text style={styles.tagText}>{t}</Text></View>
              ))}
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.contentWrap}>
          <TextInput
            style={styles.contentInput}
            placeholder="Start writing…"
            value={content}
            onChangeText={setContent}
            placeholderTextColor="#9CA3AF"
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* Bottom toolbar */}
        {toolbarVisible && (
          <View style={styles.toolbar}>
            <TouchableOpacity style={styles.toolBtn}><Bold size={16} color={"#111827"} /></TouchableOpacity>
            <TouchableOpacity style={styles.toolBtn}><Italic size={16} color={"#111827"} /></TouchableOpacity>
            <TouchableOpacity style={styles.toolBtn}><Underline size={16} color={"#111827"} /></TouchableOpacity>
            <TouchableOpacity style={styles.toolBtn}><List size={16} color={"#111827"} /></TouchableOpacity>
            <TouchableOpacity style={styles.toolBtn}><CheckSquare size={16} color={"#111827"} /></TouchableOpacity>
            <TouchableOpacity style={styles.toolBtn} onPress={() => setColorSheetOpen(true)}><Palette size={16} color={"#111827"} /></TouchableOpacity>
            <TouchableOpacity style={styles.toolBtn} onPress={() => setTagSheetOpen(true)}><Hash size={16} color={"#111827"} /></TouchableOpacity>
            <Text style={styles.savedText}>{saving ? "Saving…" : "Saved"}</Text>
          </View>
        )}

        {/* Color Picker Sheet */}
        <Modal transparent visible={colorSheetOpen} animationType="slide" onRequestClose={() => setColorSheetOpen(false)}>
          <Pressable style={styles.sheetBackdrop} onPress={() => setColorSheetOpen(false)} />
          <View style={styles.sheet}> 
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Choose Color</Text>
            <View style={styles.colorRow}>
              {pastelColors.map((c) => (
                <TouchableOpacity key={c} style={[styles.colorDot, { backgroundColor: c, borderColor: c === "#FFFFFF" ? "#E5E7EB" : "transparent" }, color === c && styles.colorDotActive]} onPress={() => { setColor(c); setColorSheetOpen(false); }} />
              ))}
            </View>
          </View>
        </Modal>

        {/* Tag Picker Sheet */}
        <Modal transparent visible={tagSheetOpen} animationType="slide" onRequestClose={() => setTagSheetOpen(false)}>
          <Pressable style={styles.sheetBackdrop} onPress={() => setTagSheetOpen(false)} />
          <View style={styles.sheet}> 
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Tags</Text>
            <View style={styles.tagsWrap}>
              {suggestedTags.map((t) => {
                const active = tags.includes(t);
                return (
                  <TouchableOpacity key={t} style={[styles.tagPick, active && styles.tagPickActive]} onPress={() => toggleTag(t)}>
                    <Text style={[styles.tagPickText, active && { color: "#111827", fontWeight: "700" }]}>{t}</Text>
                  </TouchableOpacity>
                );
              })}
              <TouchableOpacity style={styles.tagCreate} onPress={() => { const name = `Tag ${tags.length + 1}`; toggleTag(name); }}> 
                <Text style={{ color: colors.primary, fontWeight: "700" }}>+ Create new tag</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.md, paddingVertical: spacing.md },
  headerTitle: { flex: 1, marginHorizontal: 12, fontWeight: "700", color: "#111827" },
  titleWrap: { paddingHorizontal: spacing.md },
  titleInput: { fontSize: 22, fontWeight: "700", color: "#111827", paddingTop: 6 },
  tagRow: { flexDirection: "row", gap: 6, marginTop: 8, flexWrap: "wrap" },
  tagChip: { backgroundColor: "#FFFFFFAA", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  tagText: { fontSize: 11, color: "#111827" },
  contentWrap: { flex: 1, paddingHorizontal: spacing.md, paddingTop: spacing.md },
  contentInput: { flex: 1, fontSize: 16, color: "#111827", textAlignVertical: "top" },
  toolbar: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#FFFFFFE6", paddingHorizontal: spacing.md, paddingVertical: 10, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, elevation: 4 },
  toolBtn: { padding: 6, borderRadius: 8 },
  savedText: { marginLeft: "auto", color: "#6B7280", fontSize: 12 },
  sheetBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.2)" },
  sheet: { backgroundColor: "#fff", padding: spacing.md, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg },
  sheetHandle: { width: 50, height: 5, backgroundColor: "#E5E7EB", borderRadius: 9999, alignSelf: "center", marginBottom: 8 },
  sheetTitle: { fontWeight: "800", marginBottom: spacing.md },
  colorRow: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  colorDot: { width: 34, height: 34, borderRadius: 17, borderWidth: 1 },
  colorDotActive: { borderColor: colors.primary, borderWidth: 2 },
  tagsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  tagPick: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 9999, backgroundColor: "#F3F4F6" },
  tagPickActive: { backgroundColor: "#E5E7EB" },
  tagPickText: { color: "#6B7280", fontSize: 13 },
  tagCreate: { marginTop: 8 },
});
