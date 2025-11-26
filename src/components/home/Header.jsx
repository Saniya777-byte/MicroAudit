import React from 'react';
import { View, Text, StyleSheet, StatusBar, Platform } from 'react-native';
import { Bell, Settings } from 'lucide-react-native';

// Get status bar height based on platform
const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight;

const Header = () => (
  <View style={styles.header}>
    <Text style={styles.logo}>
      MicroAudit
    </Text>
    <View style={styles.headerIcons}>
      <Bell size={20} color="#4B5563" style={styles.icon} />
      <Settings size={20} color="#4B5563" style={styles.icon} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 8 : 14,
    paddingBottom: 14,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  logo: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1D4ED8',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  icon: {
    color: '#4B5563',
  },
});

export default Header;
