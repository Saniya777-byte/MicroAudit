import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';

const UploadModal = ({ visible, onClose, onGalleryPress, onDrivePress }) => (
  <Modal
    transparent={true}
    visible={visible}
    animationType="fade"
    onRequestClose={onClose}
  >
    <View style={styles.modalOverlay}>
      <View style={styles.uploadOptionsContainer}>
        <Text style={styles.uploadOptionsTitle}>Choose Source</Text>
        
        <TouchableOpacity 
          style={styles.uploadOption}
          onPress={onGalleryPress}
        >
          <Text style={styles.uploadOptionText}>Gallery</Text>
        </TouchableOpacity>
        
        <View style={styles.divider} />
        
        <TouchableOpacity 
          style={styles.uploadOption}
          onPress={onDrivePress}
        >
          <Text style={styles.uploadOptionText}>Google Drive</Text>
        </TouchableOpacity>
        
        <View style={styles.divider} />
        
        <TouchableOpacity 
          style={[styles.uploadOption, styles.cancelButton]}
          onPress={onClose}
        >
          <Text style={[styles.uploadOptionText, {color: '#ff3b30'}]}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  uploadOptionsContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '100%',
    maxWidth: 300,
    overflow: 'hidden',
  },
  uploadOptionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    padding: 20,
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  uploadOption: {
    padding: 18,
    alignItems: 'center',
  },
  uploadOptionText: {
    fontSize: 16,
    color: '#1F2937',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  cancelButton: {
    marginTop: 4,
    borderTopWidth: 6,
    borderTopColor: '#F3F4F6',
  },
});

export default UploadModal;
