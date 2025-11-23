import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { FileText } from 'lucide-react-native';
import { colors } from '../../theme';

const DocumentCard = ({ document, onPress, onLongPress }) => (
  <TouchableOpacity onPress={onPress} onLongPress={onLongPress} style={styles.docTile}>
    <View style={styles.docThumb}>
      <FileText color={colors.primary} size={22} />
    </View>
    <Text style={styles.docName} numberOfLines={1}>
      {document.name}
    </Text>
    <Text style={styles.docMeta}>
      {document.type} • Last updated: {document.updated}
    </Text>
  </TouchableOpacity>
);

const DocumentsSection = ({ documents, onDocumentPress, onDocumentLongPress, onViewAll }) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>My Documents</Text>
      <TouchableOpacity onPress={onViewAll}>
        <Text style={styles.link}>View all ›</Text>
      </TouchableOpacity>
    </View>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.horizontalList}
    >
      {documents.map((doc) => (
        <DocumentCard
          key={doc.id}
          document={doc}
          onPress={() => onDocumentPress(doc)}
          onLongPress={() => onDocumentLongPress(doc)}
        />
      ))}
    </ScrollView>
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
  docTile: {
    width: 180,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  docThumb: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  docName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  docMeta: {
    fontSize: 12,
    color: '#6B7280',
  },
});

export default DocumentsSection;
