import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { Plus } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { supabase } from '../lib/supabaseClient';
import { colors, spacing } from '../theme';
import * as FileSystem from 'expo-file-system';

// Import components
import Header from '../components/home/Header';
import WelcomeCard from '../components/home/WelcomeCard';
import NotesSection from '../components/home/NotesSection';
import DocumentsSection from '../components/home/DocumentsSection';
import ActivitySection from '../components/home/ActivitySection';
import CreateSheet from '../components/home/CreateSheet';
import UploadModal from '../components/home/UploadModal';

const HomeScreen = ({ navigation }) => {
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

  const handleDrivePress = async () => {
    try {
      // Open document picker for Google Drive
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
        multiple: false
      });

      if (result.type === 'success') {
        // Read the file content
        const fileContent = await FileSystem.readAsStringAsync(result.uri, { encoding: FileSystem.EncodingType.Base64 });
        
        // Here you can handle the file content, e.g., upload to your server
        console.log('Selected file:', result.name);
        console.log('File size:', result.size);
        console.log('File type:', result.mimeType);
        
        // Close the modal after selection
        setUploadModalVisible(false);
        
        // You can add your file upload logic here
        // For example: await uploadFileToServer(result.uri, result.name, result.mimeType);
      }
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        console.error('Error picking document:', err);
        Alert.alert('Error', 'Failed to pick document. Please try again.');
      }
    }
  };

  const onLongPressNote = (note) => {
    Alert.alert("Note Options", note.title, [
      { text: "Edit", onPress: () => navigation.navigate("NoteEditor", note) },
      { text: "Delete", style: "destructive", onPress: () => {} },
      { text: "Share", onPress: () => {} },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const onLongPressDoc = (doc) => {
    Alert.alert("Document Options", doc.name, [
      { text: "Rename", onPress: () => {} },
      { text: "Delete", style: "destructive", onPress: () => {} },
      { text: "Share", onPress: () => {} },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  // Mock data for documents and activity
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

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentContainer}>
          <Header />
          
          <View style={styles.content}>
            <WelcomeCard />
            
            <NotesSection 
              notes={notes}
              loading={loading}
              onNotePress={(note) => navigation.navigate("NoteEditor", note)}
              onNoteLongPress={onLongPressNote}
              onViewAll={() => navigation.navigate("Notes")}
            />
            
            <DocumentsSection 
              documents={docs}
              onDocumentLongPress={onLongPressDoc}
              onViewAll={() => console.log("View all documents")}
            />
            
            <ActivitySection activities={activity} />
          </View>
        </View>
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => setSheetOpen(true)} 
        accessibilityRole="button" 
        accessibilityLabel="Create"
      >
        <Plus color="#fff" size={28} />
      </TouchableOpacity>

      {/* Create Sheet */}
      <CreateSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onNotePress={() => navigation.navigate("NoteEditor", { id: null })}
        onUploadPress={() => setUploadModalVisible(true)}
        onScanPress={() => navigation.navigate("Scan")}
      />

      {/* Upload Modal */}
      <UploadModal
        visible={uploadModalVisible}
        onClose={() => setUploadModalVisible(false)}
        onGalleryPress={handleGalleryPress}
        onDrivePress={handleDrivePress}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  contentContainer: {
    flex: 1,
    paddingBottom: 24, // Extra padding at the bottom
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1D4ED8',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});

export default HomeScreen;