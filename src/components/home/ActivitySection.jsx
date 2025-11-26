import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FileText, StickyNote, Clock, Camera } from 'lucide-react-native';
import Card from '../Card';
import { colors } from '../../theme';

const ActivityItem = ({ activity, isLast }) => {
  const getIcon = (iconName) => {
    switch (iconName) {
      case 'doc':
        return <FileText size={16} color={colors.muted} />;
      case 'note':
        return <StickyNote size={16} color={colors.muted} />;
      case 'scan':
        return <Camera size={16} color={colors.muted} />;
      default:
        return null;
    }
  };

  return (
    <View style={[styles.activityRow, !isLast && styles.activityDivider]}>
      <View style={styles.leftIcon}>
        {getIcon(activity.icon)}
      </View>
      <Text style={styles.activityText} numberOfLines={1} ellipsizeMode="tail">
        {activity.text}
      </Text>
      <View style={styles.timeContainer}>
        <Clock size={14} color={colors.muted} />
        <Text style={styles.activityTime}>{activity.time}</Text>
      </View>
    </View>
  );
};

const ActivitySection = ({ activities }) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>Recent Activity</Text>
    </View>
    <Card>
      {activities.map((activity, index) => (
        <ActivityItem
          key={activity.id}
          activity={activity}
          isLast={index === activities.length - 1}
        />
      ))}
    </Card>
  </View>
);

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  activityDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  leftIcon: {
    marginRight: 12,
    width: 24,
    alignItems: 'center',
  },
  activityText: {
    flex: 1,
    fontSize: 14,
    color: '#4B5563',
    marginRight: 12,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activityTime: {
    fontSize: 12,
    color: colors.muted,
  },
});

export default ActivitySection;
