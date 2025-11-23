import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { StickyNote } from 'lucide-react-native';

const NoteCard = ({ note, onPress, onLongPress }) => (
  <TouchableOpacity
    onPress={onPress}
    onLongPress={onLongPress}
    style={[styles.noteCard, { backgroundColor: note.color }]}
  >
    <StickyNote color="#111827" size={18} />
    <Text style={styles.noteTitle}>{note.title}</Text>
    {note.preview && (
      <Text style={styles.notePreview} numberOfLines={2}>
        {note.preview}
      </Text>
    )}
    {note.tags && note.tags.length > 0 && (
      <View style={styles.tagRow}>
        {note.tags.slice(0, 2).map((tag) => (
          <View key={tag} style={styles.tagChip}>
            <Text style={styles.tagText} numberOfLines={1}>
              {tag}
            </Text>
          </View>
        ))}
        {note.tags.length > 2 && (
          <View style={styles.tagChip}>
            <Text style={styles.tagText}>+{note.tags.length - 2}</Text>
          </View>
        )}
      </View>
    )}
  </TouchableOpacity>
);

const NotesSection = ({ notes, loading, onNotePress, onNoteLongPress, onViewAll }) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>Recent Notes</Text>
      <TouchableOpacity onPress={onViewAll}>
        <Text style={styles.link}>View all ›</Text>
      </TouchableOpacity>
    </View>
    {loading ? (
      <View style={styles.loadingContainer}>
        <Text>Loading notes...</Text>
      </View>
    ) : notes.length > 0 ? (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalList}
      >
        {notes.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            onPress={() => onNotePress(note)}
            onLongPress={() => onNoteLongPress(note)}
          />
        ))}
      </ScrollView>
    ) : (
      <View style={styles.emptyNotes}>
        <Text style={styles.emptyText}>No notes yet. Tap + to create one!</Text>
      </View>
    )}
  </View>
);

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  link: {
    color: '#1D4ED8',
    fontWeight: '600',
  },
  horizontalList: {
    paddingRight: 16,
  },
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
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 4,
  },
  notePreview: {
    fontSize: 12,
    color: '#4B5563',
    marginBottom: 8,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  tagChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    maxWidth: 60,
  },
  tagText: {
    fontSize: 10,
    color: '#111827',
  },
  loadingContainer: {
    padding: 16,
    alignItems: 'center',
  },
  emptyNotes: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  emptyText: {
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default NotesSection;
