import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Card from '../Card';

const WelcomeCard = () => (
  <Card style={{ marginBottom: 16 }}>
    <Text style={styles.businessName}>Welcome back 👋</Text>
    <Text style={styles.subtle}>Here's a quick overview</Text>
    <View style={styles.overviewRow}>
      <View style={[styles.pill, { backgroundColor: '#DCFCE7' }]}>
        <Text style={styles.pillText}>3 Valid</Text>
      </View>
      <View style={[styles.pill, { backgroundColor: '#FEF9C3' }]}>
        <Text style={styles.pillText}>2 Expiring</Text>
      </View>
      <View style={[styles.pill, { backgroundColor: '#FECACA' }]}>
        <Text style={styles.pillText}>1 Expired</Text>
      </View>
    </View>
  </Card>
);

const styles = StyleSheet.create({
  businessName: {
    fontSize: 16,
    fontWeight: '600',
  },
  subtle: {
    color: '#6B7280',
    marginTop: 4,
  },
  overviewRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  pill: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 9999,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
  },
});

export default WelcomeCard;
