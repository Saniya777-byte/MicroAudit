import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable } from 'react-native';
import { StickyNote, FileText, Camera, Plus } from 'lucide-react-native';
import { colors, spacing } from '../../theme';

const CreateSheet = ({ visible, onClose, onNotePress, onUploadPress, onScanPress }) => (
  <Modal
    transparent
    visible={visible}
    animationType="slide"
    onRequestClose={onClose}
  >
    <Pressable style={styles.sheetBackdrop} onPress={onClose} />
    <View style={styles.sheet}>
      <View style={styles.sheetHandle} />
      <Text style={styles.sheetTitle}>Create</Text>
      <View style={styles.sheetRow}>
        <TouchableOpacity
          style={styles.sheetAction}
          onPress={() => {
            onClose();
            onNotePress();
          }}
        >
          <StickyNote color={colors.primary} size={22} />
          <Text style={styles.sheetActionText}>Create Note</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.sheetAction}
          onPress={() => {
            onClose();
            onUploadPress();
          }}
        >
          <FileText color={colors.primary} size={22} />
          <Text style={styles.sheetActionText}>Upload File</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.sheetAction}
          onPress={() => {
            onClose();
            onScanPress();
          }}
        >
          <Camera color={colors.primary} size={22} />
          <Text style={styles.sheetActionText}>Scan Document</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  sheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing.md,
    paddingBottom: spacing.xl,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: spacing.lg,
    color: '#111827',
  },
  sheetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
  },
  sheetAction: {
    alignItems: 'center',
    width: '30%',
  },
  sheetActionText: {
    marginTop: 8,
    fontSize: 12,
    color: '#4B5563',
    textAlign: 'center',
  },
});

export default CreateSheet;
