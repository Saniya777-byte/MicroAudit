import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert,} from "react-native";
import { supabase } from "../lib/supabaseClient";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { Platform } from "react-native";
import { makeRedirectUri } from "expo-auth-session";

export default function SignupScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  // Cross-platform notifications
  const notify = (title, message) => {
    if (Platform.OS === "web") {
      // eslint-disable-next-line no-alert
      window.alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleSignup = async () => {
    console.log("[Signup] Button pressed", { namePresent: !!name, emailPresent: !!email, passwordPresent: !!password });
    if (!email || !password)
      return notify("Error", "Please fill all fields");

    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },

      });

      if (error) throw error;

      if (data?.session) {
        // Immediate session available
        navigation.replace("Main");
        return;
      }

      // Try immediate login (will only work if confirmations are disabled)
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (!signInError && signInData?.session) {
        navigation.replace("Main");
        return;
      }

      // Fall back to Home (no verify message)
      navigation.replace("Main");
    } catch (error) {
      notify("Signup Failed", error.message);
    } finally {
      setLoading(false);
    }
  };


  const handleGoogleSignup = async () => {
  try {
    const redirectUrl = Platform.OS === "web"
      ? `${window.location.origin}/auth/callback` // web: normal redirect
      : makeRedirectUri({ useProxy: true }); // native: Expo Auth proxy


    if (Platform.OS === "web") {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: redirectUrl },
      });
      if (error) throw error;
      return; // browser will redirect
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: redirectUrl, skipBrowserRedirect: true },
    });

    if (error) throw error;

    if (data?.url) {
      console.log("Opening Google OAuth URL:", data.url);
      await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
      // Global deep link handler in App.js will exchange the code and navigate
    }
  } catch (error) {
    console.error("Google Signup Failed:", error);
    notify("Google Signup Failed", error.message);
  }
};


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create your MicroAudit account</Text>

      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={name}
        onChangeText={setName}
        autoComplete="name"
        onSubmitEditing={() => {}}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoComplete="email"
        onSubmitEditing={() => {}}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        autoCapitalize="none"
        autoComplete="new-password"
        onSubmitEditing={handleSignup}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleSignup}
        disabled={loading}
        accessibilityRole="button"
        accessibilityLabel="Sign Up"
      >
        <Text style={styles.buttonText}>
          {loading ? "Signing up..." : "Sign Up"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.googleButton}
        onPress={handleGoogleSignup}
        disabled={loading}
        accessibilityRole="button"
        accessibilityLabel="Sign Up with Google"
      >
        <Text style={styles.googleText}>Sign Up with Google</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={styles.link}>Already have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginVertical: 8,
    borderRadius: 8,
  },
  button: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    marginVertical: 10,
  },
  buttonText: { color: "#fff", fontSize: 16 },
  googleButton: {
    backgroundColor: "#DB4437",
    padding: 15,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    marginVertical: 5,
  },
  googleText: { color: "#fff", fontSize: 16 },
  link: { color: "#007bff", marginTop: 10 },
});
