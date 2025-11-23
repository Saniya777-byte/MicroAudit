import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Modal, Pressable, Alert, Image } from "react-native";
import { Home, FileText, Camera, User, Bell, Settings, Plus, StickyNote, Clock } from "lucide-react-native";
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from "react-native-safe-area-context";
import Card from "../components/Card";
import Button from "../components/Button";
import { colors, spacing, radius, fonts } from "../theme";
import { supabase } from "../lib/supabaseClient";

export default function Dashboard({ navigation }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);

  const loadNotes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        console.log("No user found — clearing notes");
        setNotes([]);
        setLoading(false);
        return;
      }

      console.log("Loading notes for user:", user.id);

      const { data, error } = await supabase
        .from("notes")
        .select("id, title, content, color, tags, pinned, updated_at")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(3); // Only get the 3 most recent notes for the home screen

      if (error) {
        console.error("Error loading notes:", error);
        setLoading(false);
        return;
      }

      const mapped = (data || []).map((n) => ({
        id: n.id,
        title: n.title || "Untitled",
        preview: n.content ? (n.content.length > 50 ? n.content.substring(0, 50) + '...' : n.content) : "",
        color: n.color || "#FFFFFF",
        tags: Array.isArray(n.tags) ? n.tags : [],
        pinned: !!n.pinned,
        updatedAt: n.updated_at,
      }));

      setNotes(mapped);
    } catch (err) {
      console.error("Unexpected error loading notes:", err);
    } finally {
      setLoading(false);
    }
  };

  // Load notes on mount and when user logs in/out
  useEffect(() => {
    loadNotes();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      loadNotes();
    });

    // Set up real-time subscription
    const channel = supabase
      .channel('notes_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notes' },
        () => {
          loadNotes();
        }
      )
      .subscribe();

    return () => {
      subscription?.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, []);

  const docs = [
    { id: "d1", name: "Electricity Bill.pdf", type: "Bill", updated: "2 days ago" },
    { id: "d2", name: "Passport.pdf", type: "ID", updated: "yesterday" },
    { id: "d3", name: "Invoice_0231.pdf", type: "Bill", updated: "3 hours ago" },
  ];

  const activity = [
    { id: 1, text: "Created Invoice #INV-001", time: "2h ago", icon: "doc" },
    { id: 2, text: "Updated business profile", time: "1d ago", icon: "note" },
    { id: 3, text: "Scanned receipt", time: "2d ago", icon: "scan" },
  ];

  const handleGalleryPress = async () => {
    try {
      // Request permission to access the media library
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Sorry, we need camera roll permissions to select images.');
        return;
      }

      // Launch the image library
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        // The selected image is available in result.assets[0].uri
        const selectedImage = result.assets[0];
        console.log('Selected image:', selectedImage.uri);
        
        // Here you can handle the selected image, e.g., upload it or display it
        Alert.alert('Image Selected', `Successfully selected: ${selectedImage.fileName || 'image'}`);
        
        // You can add your upload logic here
        // For example: await uploadImage(selectedImage.uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    } finally {
      setUploadModalVisible(false);
    }
  };

  const handleDrivePress = () => {
    setUploadModalVisible(false);
    Alert.alert('Google Drive', 'Google Drive integration will be implemented here');
    console.log("Opening drive...");
    // Note: To implement Google Drive integration, you would need to:
    // 1. Set up Google API credentials
    // 2. Use a library like react-native-google-drive-api-wrapper
    // 3. Implement OAuth flow
  };

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
            <Text style={styles.sectionTitle}>Recent Notes</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Notes")}>
              <Text style={styles.link}>View all ›</Text>
            </TouchableOpacity>
          </View>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text>Loading notes...</Text>
            </View>
          ) : notes.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
              {notes.map((n) => (
                <TouchableOpacity 
                  key={n.id} 
                  onPress={() => navigation.navigate("NoteEditor", n)}
                  onLongPress={() => onLongPressNote(n)} 
                  style={[styles.noteCard, { backgroundColor: n.color }]}
                > 
                  <StickyNote color="#111827" size={18} />
                  <Text style={styles.noteTitle}>{n.title}</Text>
                  {n.preview ? (
                    <Text style={styles.notePreview} numberOfLines={2}>{n.preview}</Text>
                  ) : null}
                  {n.tags && n.tags.length > 0 && (
                    <View style={styles.tagRow}>
                      {n.tags.slice(0, 2).map((t) => (
                        <View key={t} style={styles.tagChip}>
                          <Text style={styles.tagText} numberOfLines={1}>{t}</Text>
                        </View>
                      ))}
                      {n.tags.length > 2 && (
                        <View style={styles.tagChip}>
                          <Text style={styles.tagText}>+{n.tags.length - 2}</Text>
                        </View>
                      )}
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.emptyNotes}>
              <Text style={styles.emptyText}>No notes yet. Tap + to create one!</Text>
            </View>
          )}

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
              <TouchableOpacity 
                style={styles.sheetAction} 
                onPress={() => {
                  setSheetOpen(false);
                  setUploadModalVisible(true);
                }}
              >
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

        {/* Upload Options Modal */}
        <Modal
          transparent={true}
          visible={uploadModalVisible}
          animationType="fade"
          onRequestClose={() => setUploadModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.uploadOptionsContainer}>
              <Text style={styles.uploadOptionsTitle}>Choose Source</Text>
              
              <TouchableOpacity 
                style={styles.uploadOption}
                onPress={handleGalleryPress}
              >
                <Text style={styles.uploadOptionText}>Gallery</Text>
              </TouchableOpacity>
              
              <View style={styles.divider} />
              
              <TouchableOpacity 
                style={styles.uploadOption}
                onPress={handleDrivePress}
              >
                <Text style={styles.uploadOptionText}>Google Drive</Text>
              </TouchableOpacity>
              
              <View style={styles.divider} />
              
              <TouchableOpacity 
                style={[styles.uploadOption, styles.cancelButton]}
                onPress={() => setUploadModalVisible(false)}
              >
                <Text style={[styles.uploadOptionText, {color: '#ff3b30'}]}>Cancel</Text>
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
  noteCard: { 
    width: 180, 
    borderRadius: 16, 
    padding: 16, 
    marginRight: 16,
    minHeight: 160,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)'
  },
  // Upload Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  uploadOptionsContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingBottom: 20,
  },
  uploadOptionsTitle: {
    fontSize: 16,
    color: '#8e8e93',
    textAlign: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5ea',
  },
  uploadOption: {
    padding: 16,
    alignItems: 'center',
  },
  uploadOptionText: {
    fontSize: 18,
    color: '#007AFF',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e5ea',
    marginHorizontal: 16,
  },
  cancelButton: {
    marginTop: 8,
    borderRadius: 12,
    backgroundColor: '#f2f2f7',
    marginHorizontal: 16,
  },
  noteTitle: { 
    fontSize: 16, 
    fontWeight: '700', 
    marginTop: 8,
    color: '#111827',
    marginBottom: 4
  },
  notePreview: { 
    fontSize: 13, 
    color: 'rgba(17, 24, 39, 0.9)', 
    marginTop: 6, 
    lineHeight: 18,
    flex: 1,
    marginBottom: 8
  },
  tagRow: { 
    flexDirection: "row", 
    flexWrap: 'wrap', 
    gap: 6, 
    marginTop: 'auto',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)'
  },
  tagChip: { 
    backgroundColor: 'rgba(255, 255, 255, 0.7)', 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)'
  },
  tagText: { 
    fontSize: 11, 
    color: '#111827',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  emptyNotes: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 160,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  emptyText: {
    color: '#64748B',
    textAlign: 'center',
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
  },
  loadingContainer: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
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

