import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from "react-native";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function ProfileScreen({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [fullName, setFullName] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

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
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      {editing ? (
        <>
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={fullName}
            onChangeText={setFullName}
            autoComplete="name"
          />
          <View style={{ flexDirection: "row", gap: 12, marginTop: 8 }}>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
              <Text style={styles.buttonText}>{saving ? "Saving..." : "Save"}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => { setEditing(false); setFullName(profile?.full_name || ""); }}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <>
          <Text style={styles.text}>Name: {profile?.full_name || "-"}</Text>
          <Text style={styles.text}>Email: {profile?.email || "-"}</Text>
          <TouchableOpacity style={styles.editBtn} onPress={() => setEditing(true)}>
            <Text style={styles.buttonText}>Edit</Text>
          </TouchableOpacity>
        </>
      )}
      <TouchableOpacity style={styles.button} onPress={handleLogout} accessibilityRole="button" accessibilityLabel="Logout">
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F9FAFB" },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  text: { fontSize: 14, color: "#4B5563", textAlign: "center", paddingHorizontal: 20, marginTop: 6 },
  input: {
    width: "80%",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#fff",
    marginTop: 8,
  },
  editBtn: {
    backgroundColor: "#3B82F6",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 12,
  },
  saveBtn: {
    backgroundColor: "#16A34A",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  cancelBtn: {
    backgroundColor: "#F3F4F6",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  cancelText: { color: "#111827" },
  button: {
    backgroundColor: "#EF4444",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: { color: "#fff", fontWeight: "600" },
});
