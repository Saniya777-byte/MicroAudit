import React from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { Home, FileText, Camera, User, Bell, Settings  } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";


export default function Dashboard({ navigation }) {
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
          <View style={styles.card}>
            <Text style={styles.businessName}>Acme Coffee Shop</Text>
            <Text style={styles.tag}>Food & Beverage</Text>

            <View style={styles.complianceBox}>
              <Text style={styles.complianceLabel}>Compliance Score</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: "50%" }]} />
              </View>
              <Text style={styles.complianceText}>50% - Needs Attention</Text>
            </View>

            <View style={styles.grid}>
              <View style={[styles.statusBox, { backgroundColor: "#DCFCE7" }]}>
                <Text style={styles.statusNumber}>3</Text>
                <Text>Valid</Text>
              </View>
              <View style={[styles.statusBox, { backgroundColor: "#FEF9C3" }]}>
                <Text style={styles.statusNumber}>2</Text>
                <Text>Expiring</Text>
              </View>
              <View style={[styles.statusBox, { backgroundColor: "#FECACA" }]}>
                <Text style={styles.statusNumber}>1</Text>
                <Text>Expired</Text>
              </View>
              <View style={[styles.statusBox, { backgroundColor: "#E5E7EB" }]}>
                <Text style={styles.statusNumber}>0</Text>
                <Text>Pending</Text>
              </View>
            </View>
          </View>

 
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Upcoming Deadlines</Text>
            <View style={styles.deadlineRow}>
              <Text>❗ Business License</Text>
              <Text style={styles.deadlineRed}>15 days</Text>
            </View>
            <View style={styles.deadlineRow}>
              <Text>🔥 Fire Safety Certificate</Text>
              <Text style={styles.deadlineGray}>45 days</Text>
            </View>
          </View>
        </ScrollView>

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
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  businessName: { fontSize: 16, fontWeight: "600" },
  tag: {
    backgroundColor: "#E5E7EB",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    fontSize: 12,
    marginTop: 4,
  },
  complianceBox: {
    marginTop: 12,
    backgroundColor: "#FEE2E2",
    padding: 12,
    borderRadius: 8,
  },
  complianceLabel: { fontSize: 14, fontWeight: "500" },
  progressBar: {
    backgroundColor: "#E5E7EB",
    height: 10,
    borderRadius: 5,
    marginVertical: 8,
  },
  progressFill: { backgroundColor: "#1E3A8A", height: 10, borderRadius: 5 },
  complianceText: { color: "#DC2626", fontWeight: "bold", fontSize: 16 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 12,
  },
  statusBox: {
    flexBasis: "48%",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 8,
  },
  statusNumber: { fontSize: 18, fontWeight: "bold" },
  sectionTitle: { fontSize: 16, fontWeight: "600", marginBottom: 12 },
  deadlineRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    marginBottom: 8,
  },
  deadlineRed: {
    backgroundColor: "#DC2626",
    color: "#fff",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    fontSize: 12,
  },
  deadlineGray: {
    backgroundColor: "#D1D5DB",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    fontSize: 12,
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#fff",
    paddingVertical: 8,
  },
  navItem: { alignItems: "center" },
  navText: { fontSize: 12, color: "#4B5563", marginTop: 2 },
});

