import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Alert, Modal, Text, TextInput, KeyboardAvoidingView, Platform, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Plus } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { supabase } from '../lib/supabaseClient';
import { colors, spacing } from '../theme';
import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';

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
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);

  // New state for file naming
  const [namingModalVisible, setNamingModalVisible] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileNameInput, setFileNameInput] = useState('');

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No user found — clearing data');
        setNotes([]);
        setDocuments([]);
        setLoading(false);
        return;
      }
      console.log('Loading data for user:', user.id);

      // Load Notes
      const { data: notesData, error: notesError } = await supabase
        .from('notes')
        .select('id, title, content, color, tags, pinned, updated_at')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(3);
      if (notesError) console.error('Error loading notes:', notesError);
      const mappedNotes = (notesData || []).map(n => ({
        id: n.id,
        title: n.title || 'Untitled',
        content: n.content || '',
        preview: n.content ? (n.content.length > 50 ? n.content.substring(0, 50) + '...' : n.content) : '',
        color: n.color || '#FFFFFF',
        tags: Array.isArray(n.tags) ? n.tags : [],
        pinned: !!n.pinned,
        updatedAt: n.updated_at,
      }));
      setNotes(mappedNotes);

      // Load Documents
      const { data: docsData, error: docsError } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
      if (docsError) console.error('Error loading documents:', docsError);
      let mappedDocs = [];

      // If no documents exist, create dummy ones for demo
      if (!docsData || docsData.length === 0) {
        mappedDocs = [
          {
            id: 'demo1',
            name: 'Project Overview',
            type: 'image/jpeg',
            updated: new Date().toLocaleDateString(),
            url: 'https://placehold.co/600x400/DBEAFE/1e40af?text=Project+Overview',
            isDemo: true
          },
          {
            id: 'demo2',
            name: 'Meeting Notes',
            type: 'image/jpeg',
            updated: new Date().toLocaleDateString(),
            url: 'https://placehold.co/600x400/FDE68A/92400e?text=Meeting+Notes',
            isDemo: true
          },
          {
            id: 'demo3',
            name: 'Design Mockups',
            type: 'image/jpeg',
            updated: new Date().toLocaleDateString(),
            url: 'https://placehold.co/600x400/DCFCE7/166534?text=Design+Mockups',
            isDemo: true
          },
          {
            id: 'demo4',
            name: 'Requirements',
            type: 'image/jpeg',
            updated: new Date().toLocaleDateString(),
            url: 'https://placehold.co/600x400/FEE2E2/b91c1c?text=Requirements',
            isDemo: true
          },
          {
            id: 'demo5',
            name: 'User Stories',
            type: 'image/jpeg',
            updated: new Date().toLocaleDateString(),
            url: 'https://placehold.co/600x400/EDE9FE/5b21b6?text=User+Stories',
            isDemo: true
          }
        ];
      } else {
        // Map real documents
        mappedDocs = docsData.map(d => ({
          id: d.id,
          name: d.name,
          type: d.type || 'File',
          updated: new Date(d.created_at).toLocaleDateString(),
          url: d.url,
          isDemo: false
        }));
      }
      setDocuments(mappedDocs);
    } catch (err) {
      console.error('Unexpected error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Gallery upload handler
  const handleGalleryPress = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Camera roll permissions are needed to select images.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: false,
        quality: 1,
      });
      if (!result.canceled) {
        const asset = result.assets[0];
        initiateUpload({
          uri: asset.uri,
          name: asset.fileName || `image_${Date.now()}.jpg`,
          mimeType: asset.mimeType || 'image/jpeg',
        });
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  // Drive upload handler
  const handleDrivePress = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (result.type === 'success') {
        const mime = result.mimeType || 'application/octet-stream';
        initiateUpload({
          uri: result.uri,
          name: result.name,
          mimeType: mime,
        });
      }
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        console.error('Error picking document:', err);
        Alert.alert('Error', 'Failed to pick document. Please try again.');
      }
    }
  };

  useEffect(() => {
    loadData();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      loadData();
    });
    const notesChannel = supabase
      .channel('notes_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notes' }, () => {
        loadData();
      })
      .subscribe();
    const docsChannel = supabase
      .channel('documents_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'documents' }, () => {
        loadData();
      })
      .subscribe();
    return () => {
      subscription?.unsubscribe();
      supabase.removeChannel(notesChannel);
      supabase.removeChannel(docsChannel);
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const uploadFile = async (uri, name, mimeType) => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
      const filePath = `${user.id}/${new Date().getTime()}_${name}`;
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, decode(base64), { contentType: mimeType, upsert: false });
      if (uploadError) throw uploadError;
      const { data: publicUrlData } = supabase.storage.from('documents').getPublicUrl(filePath);
      const { error: dbError } = await supabase
        .from('documents')
        .insert({
          user_id: user.id,
          name,
          type: mimeType,
          url: publicUrlData.publicUrl,
          size: base64.length,
        });
      if (dbError) throw dbError;
      Alert.alert('Success', 'File uploaded successfully');
      loadData();
    } catch (error) {
      console.error('Upload failed:', error);
      Alert.alert('Error', 'Failed to upload file: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const initiateUpload = (file) => {
    setSelectedFile(file);
    const nameWithoutExt = file.name ? file.name.split('.').slice(0, -1).join('.') : 'Untitled';
    setFileNameInput(nameWithoutExt || file.name || 'Untitled');
    setUploadModalVisible(false);
    setNamingModalVisible(true);
  };

  const handleSaveFile = async () => {
    if (!fileNameInput.trim()) {
      Alert.alert('Error', 'Please enter a file name');
      return;
    }
    if (!selectedFile) return;
    let finalName = fileNameInput;
    const originalExt = selectedFile.name ? selectedFile.name.split('.').pop() : '';
    if (originalExt && !finalName.endsWith(`.${originalExt}`)) {
      finalName = `${finalName}.${originalExt}`;
    }
    setNamingModalVisible(false);
    await uploadFile(selectedFile.uri, finalName, selectedFile.mimeType);
    setSelectedFile(null);
    setFileNameInput('');
  };

  const handleDocumentPress = (doc) => {
    if (doc?.url) {
      Linking.openURL(doc.url).catch(err => console.error('Failed to open URL:', err));
    }
  };

  const onLongPressDoc = (doc) => {
    // placeholder for long press actions
  };

  const onLongPressNote = (note) => {
    // placeholder for long press actions
  };

  const activity = [
    { id: 1, text: 'Created Invoice #INV-001', time: '2h ago', icon: 'doc' },
    { id: 2, text: 'Updated business profile', time: '1d ago', icon: 'note' },
    { id: 3, text: 'Scanned receipt', time: '2d ago', icon: 'scan' },
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
              onNotePress={note => navigation.navigate('NoteEditor', note)}
              onNoteLongPress={onLongPressNote}
              onViewAll={() => navigation.navigate('Notes')}
            />
            <DocumentsSection
              documents={documents}
              onDocumentPress={handleDocumentPress}
              onDocumentLongPress={onLongPressDoc}
              onViewAll={() => console.log('View all documents')}
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
        onNotePress={() => navigation.navigate('NoteEditor', { id: null })}
        onUploadPress={() => setUploadModalVisible(true)}
        onScanPress={() => navigation.navigate('Scan')}
      />

      {/* Upload Modal */}
      <UploadModal
        visible={uploadModalVisible}
        onClose={() => setUploadModalVisible(false)}
        onGalleryPress={handleGalleryPress}
        onDrivePress={handleDrivePress}
      />

      {/* Naming Modal */}
      <Modal
        visible={namingModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setNamingModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Name your file</Text>
            <Text style={styles.modalSubtitle}>Enter a name for this document</Text>
            <TextInput
              style={styles.input}
              value={fileNameInput}
              onChangeText={setFileNameInput}
              placeholder="File name"
              autoFocus
              selectTextOnFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setNamingModalVisible(false);
                  setSelectedFile(null);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveFile}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
    paddingBottom: 24,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#111827',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 24,
    backgroundColor: '#F9FAFB',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  saveButton: {
    backgroundColor: '#1D4ED8',
  },
  cancelButtonText: {
    color: '#374151',
    fontWeight: '600',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});

export default HomeScreen;