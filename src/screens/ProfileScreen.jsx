import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView, Image, Switch } from "react-native";
import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Icons from "lucide-react-native";
import Card from "../components/Card";
import { colors, spacing, radius, fonts } from "../theme";
import { supabase } from "../lib/supabaseClient";

export default function ProfileScreen({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [fullName, setFullName] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Additional profile/meta
  const [role, setRole] = useState("Auditor");
  const [phone, setPhone] = useState("");
  const [joinedAt, setJoinedAt] = useState("");

  // Preferences
  const [notifOn, setNotifOn] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [autoSync, setAutoSync] = useState(true);
  const [saveOffline, setSaveOffline] = useState(true);
  const [defaultTemplate, setDefaultTemplate] = useState("General Audit");
  const [defaultLocation, setDefaultLocation] = useState("Auto");
  const [defaultPriority, setDefaultPriority] = useState("Medium");
  const [language, setLanguage] = useState("English");
  const [timezone, setTimezone] = useState("Auto");

  // Minimal stats (mock, replace with DB later)
  const [stats, setStats] = useState({ completed: 54, pending: 12, audits: 8, score: 82 });
  const [weekly, setWeekly] = useState([2, 5, 3, 6, 4, 1, 2]); 
  const [monthly, setMonthly] = useState([60, 62, 64, 58, 70, 72, 68, 75, 78, 80, 82, 85]); 

  useEffect(() => {
    const load = async () => {
      const { data: userRes } = await supabase.auth.getUser();
      const user = userRes?.user;
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", user.id)
        .single();
      const fallback = { full_name: user.user_metadata?.full_name, email: user.email };
      const next = data || fallback;
      setProfile(next);
      setFullName(next?.full_name || "");
      setRole(user.user_metadata?.role || "Auditor");
      setPhone(user.user_metadata?.phone || "");
      setJoinedAt(user?.created_at ? new Date(user.created_at).toDateString() : "");
    };
    load();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigation.replace("Login");
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const { data: userRes } = await supabase.auth.getUser();
      const user = userRes?.user;
      if (!user) return;

      const email = profile?.email || user.email || null;

      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          email,
          full_name: fullName || null,
          updated_at: new Date().toISOString(),
        }, { onConflict: "id" });
      if (error) throw error;

      // Also keep auth metadata in sync (non-blocking)
      try { await supabase.auth.updateUser({ data: { full_name: fullName || null } }); } catch {}

      setProfile((p) => ({ ...(p || {}), full_name: fullName || null }));
      setEditing(false);
    } catch (e) {
      Alert.alert("Update Failed", e?.message || String(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Profile Header */}
        <Card style={styles.card}>
          <View style={styles.headerRow}>
            <Image 
              source={require('../../assets/dp.png')} 
              style={styles.avatar}
              resizeMode="cover"
            />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.name}>{profile?.full_name || "-"}</Text>
              <Text style={styles.email}>{profile?.email || "-"}</Text>
              <Text style={styles.role}>{role}</Text>
            </View>
            <TouchableOpacity style={styles.editBtn} onPress={() => setEditing((e) => !e)}>
              <Text style={styles.editText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>

          {editing ? (
            <View style={{ marginTop: spacing.sm }}>
              <TextInput style={styles.input} placeholder="Full Name" value={fullName} onChangeText={setFullName} />
              <View style={styles.actionsRow}>
                <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}><Text style={styles.buttonText}>{saving ? "Saving..." : "Save"}</Text></TouchableOpacity>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => { setEditing(false); setFullName(profile?.full_name || ""); }}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity>
              </View>
            </View>
          ) : null}
        </Card>

        {/* Quick Stats */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Quick Stats</Text>
          <View style={styles.statsWrap}>
            <View style={styles.statMini}><Text style={styles.statMiniNum}>{stats.completed}</Text><Text style={styles.statMiniLabel}>Completed</Text></View>
            <View style={styles.statMini}><Text style={styles.statMiniNum}>{stats.pending}</Text><Text style={styles.statMiniLabel}>Pending</Text></View>
            <View style={styles.statMini}><Text style={styles.statMiniNum}>{stats.audits}</Text><Text style={styles.statMiniLabel}>Audits</Text></View>
            <View style={styles.statMini}><Text style={styles.statMiniNum}>{stats.score}%</Text><Text style={styles.statMiniLabel}>Score</Text></View>
          </View>
        </Card>

        {/* Mini Graphs */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Weekly Task Completion</Text>
          <View style={styles.barChartMini}>
            {weekly.map((v, i) => (
              <View key={i} style={[styles.barMini, { height: 6 + v * 8 }]} />
            ))}
          </View>
          <Text style={[styles.sectionTitle, { marginTop: spacing.md }]}>Monthly Performance</Text>
          <View style={styles.lineChartMini}>
            {monthly.map((v, i) => (
              <View key={i} style={[styles.dot, { left: (i / 11) * 100 + '%', bottom: (v / 100) * 60 }]} />
            ))}
            {/* simple line by connecting last dot visually via overlay line segments is skipped for simplicity */}
          </View>
        </Card>

        {/* Settings */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Settings</Text>
          {/* <View style={styles.toggleRow}><Text style={styles.toggleLabel}>Dark mode</Text><Switch value={darkMode} onValueChange={setDarkMode} /></View> */}
          <View style={styles.toggleRow}><Text style={styles.toggleLabel}>Notifications</Text><Switch value={notifOn} onValueChange={setNotifOn} /></View>
          <View style={styles.toggleRow}><Text style={styles.toggleLabel}>Auto-sync</Text><Switch value={autoSync} onValueChange={setAutoSync} /></View>
        </Card>

        {/* Logout */}
        <TouchableOpacity style={styles.primaryLogout} onPress={handleLogout} accessibilityRole="button" accessibilityLabel="Logout">
          <Text style={styles.primaryLogoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F9FAFB" },
  scroll: { padding: spacing.md, paddingBottom: spacing.xl },
  card: { marginBottom: spacing.md },
  // User info
  headerRow: { flexDirection: "row", alignItems: "center" },
  userRow: { flexDirection: "row", alignItems: "center" },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e1e4e8',
    overflow: 'hidden',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e1e4e8',
    overflow: 'hidden',
  },
  name: { fontSize: fonts.h2, fontWeight: "700", color: colors.text },
  email: { color: colors.muted, marginTop: 2 },
  role: { color: colors.text, fontWeight: "600", marginTop: 2 },
  editBtn: { backgroundColor: "#F3F4F6", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  editText: { color: colors.text, fontWeight: "700" },
  badgeRow: { flexDirection: "row", alignItems: "center", marginTop: 6, flexWrap: "wrap" },
  badge: { backgroundColor: "#E0E7FF", paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.md },
  badgeText: { color: "#111827", fontWeight: "600", fontSize: 12 },
  meta: { color: colors.muted, fontSize: 12 },
  iconBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: "#F3F4F6", alignItems: "center", justifyContent: "center" },
  actionRow: { flexDirection: "row", flexWrap: "wrap", marginTop: spacing.md },
  actionsRow: { flexDirection: "row", marginTop: 8 },
  actionBtn: { flexDirection: "row", alignItems: "center", backgroundColor: "#F3F4F6", paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, marginRight: 10, marginTop: 8 },
  actionText: { color: "#111827", fontWeight: "600" },

  // Stats
  sectionTitle: { fontWeight: "700", color: colors.text, marginBottom: 8 },
  statsWrap: { flexDirection: "row", justifyContent: "space-between" },
  statMini: { alignItems: "center", flex: 1 },
  statMiniNum: { fontSize: 18, fontWeight: "800", color: colors.text },
  statMiniLabel: { color: colors.muted, marginTop: 2 },
  statsRow: { flexDirection: "row", justifyContent: "space-between" },
  statBox: { alignItems: "center", flex: 1 },
  statNum: { fontSize: 24, fontWeight: "800", color: colors.text },
  statLabel: { color: colors.muted, marginTop: 2 },
  metaRow: { flexDirection: "row", marginTop: spacing.sm },
  metaItem: { flexDirection: "row", alignItems: "center", marginRight: 16 },
  metaText: { color: colors.muted },
  chartsRow: { flexDirection: "row", marginTop: spacing.md },
  chartTitle: { fontWeight: "700", color: colors.text, marginBottom: 6 },
  barChart: { flexDirection: "row", alignItems: "flex-end", height: 80, padding: 6, backgroundColor: "#F3F4F6", borderRadius: radius.md },
  bar: { width: 14, backgroundColor: colors.primary, borderTopLeftRadius: 6, borderTopRightRadius: 6 },
  // Mini charts
  barChartMini: { flexDirection: "row", alignItems: "flex-end", height: 70, padding: 6, backgroundColor: "#F3F4F6", borderRadius: radius.md },
  barMini: { width: 12, backgroundColor: colors.primary, borderTopLeftRadius: 6, borderTopRightRadius: 6, marginRight: 6 },
  lineChartMini: { height: 70, backgroundColor: "#F3F4F6", borderRadius: radius.md, marginTop: 6, position: "relative" },
  dot: { position: "absolute", width: 6, height: 6, borderRadius: 3, backgroundColor: colors.accent },
  pieWrap: { width: 160 },
  pie: { flexDirection: "row", height: 80, borderRadius: 12, overflow: "hidden" },
  pieSlice: {},
  legend: { marginTop: 8 },
  legendRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { color: colors.muted },

  // Preferences
  subTitle: { fontWeight: "700", color: colors.text, marginBottom: 8 },
  toggleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 8 },
  toggleLabel: { color: colors.text, fontWeight: "600" },
  helper: { color: colors.muted, marginTop: 6 },
  row: { flexDirection: "row", alignItems: "center" },
  kvRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 6 },
  kvKey: { color: colors.muted },
  kvVal: { color: colors.text, fontWeight: "600" },
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8 },
  smallBtn: { flexDirection: "row", alignItems: "center", backgroundColor: "#F3F4F6", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  smallBtnText: { color: "#111827", fontWeight: "700" },

  // Devices & security
  deviceRow: { flexDirection: "row", alignItems: "center", paddingVertical: 8 },
  deviceName: { fontWeight: "700", color: colors.text },
  deviceMeta: { color: colors.muted, marginTop: 2 },
  outlineBtn: { borderWidth: 1, borderColor: "#E5E7EB", paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8 },
  outlineBtnText: { color: colors.text, fontWeight: "700" },
  logRow: { flexDirection: "row", alignItems: "center", paddingVertical: 6 },
  logText: { color: colors.text, flex: 1 },
  logTime: { color: colors.muted },

  // Danger zone
  dangerRow: { flexDirection: "row", alignItems: "center", marginBottom: spacing.sm },
  dangerText: { color: "#7F1D1D" },
  rowGap: { flexDirection: "row", marginTop: 8 },
  dangerBtn: { flexDirection: "row", alignItems: "center", backgroundColor: "#DC2626", paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, marginRight: 12 },
  dangerBtnText: { color: "#fff", fontWeight: "700" },
  warnBtn: { flexDirection: "row", alignItems: "center", backgroundColor: "#FEE2E2", paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, marginRight: 12, marginTop: 8 },
  warnBtnText: { color: "#B91C1C", fontWeight: "700" },

  // Save/Cancel
  input: { borderWidth: 1, borderColor: "#E5E7EB", padding: 10, borderRadius: 8, backgroundColor: "#fff" },
  saveBtn: { backgroundColor: "#16A34A", paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  cancelBtn: { backgroundColor: "#F3F4F6", paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  cancelText: { color: "#111827" },
  buttonText: { color: "#fff", fontWeight: "600" },

  // Primary logout button
  primaryLogout: { marginTop: spacing.md, alignSelf: "center", backgroundColor: "#111827", paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10, flexDirection: "row", alignItems: "center" },
  primaryLogoutText: { color: "#fff", fontWeight: "800" },
});
