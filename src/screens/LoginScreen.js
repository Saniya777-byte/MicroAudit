import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert,} from "react-native";
import { supabase } from "../lib/supabaseClient";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { Platform } from "react-native";
import { makeRedirectUri } from "expo-auth-session";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Navigate to Home after OAuth completes and session is set
  useEffect(() => {
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        navigation.replace("Main");
      }
    });
    return () => subscription.subscription.unsubscribe();
  }, [navigation]);

  // Cross-platform notifications (Alert can be a no-op on web)
  const notify = (title, message) => {
    if (Platform.OS === "web") {
      // eslint-disable-next-line no-alert
      window.alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  // const handleLogin = async () => {
  //   if (!email || !password)
  //     return Alert.alert("Error", "Please fill all fields");
  //   try {
  //     setLoading(true);
  //     const { error } = await supabase.auth.signInWithPassword({
  //       email,
  //       password,
  //     });
  //     if (error) throw error;
  //     Alert.alert("Success", "Logged in successfully!");
  //     navigation.replace("Main");
  //   } catch (error) {
  //     Alert.alert("Login Failed", error.message);
  //   } finally {
  //     setLoading(false);
  //   }
  // };


  const handleLogin = async () => {
  console.log("[Login] Button pressed", { emailPresent: !!email, passwordPresent: !!password });
  if (!email || !password) {
    return notify("Error", "Please fill all fields");
  }

  try {
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;

    if (sessionData?.session) {
      console.log("✅ Logged in as:", sessionData.session.user.email);
      navigation.replace("Main"); // ✅ this is correct
    } else {
      throw new Error("No session found after login");
    }

  } catch (error) {
    const msg = String(error?.message || error);
    if (/email\s*not\s*confirmed/i.test(msg)) {
      console.warn("[Login] Email not confirmed. Proceeding to Home per requirement.");
      navigation.replace("Main");
    } else {
      notify("Login Failed", msg);
      console.error("Login error:", error);
    }
  } finally {
    setLoading(false);
  }
};


   const handleGoogleLogin = async () => {
    try {
      const redirectUrl = Platform.OS === "web"
        ? `${window.location.origin}/auth/callback` // web: normal redirect, parsed by detectSessionInUrl
        : makeRedirectUri({ useProxy: true }); // native: use Expo Auth Session proxy

      if (Platform.OS === "web") {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: { redirectTo: redirectUrl },
        });
        if (error) throw error;
        // Browser will redirect; detectSessionInUrl will complete
        return;
      }

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: redirectUrl, skipBrowserRedirect: true },
      });
      if (error) throw error;

      if (data?.url) {
        await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
        // App.js deep link handler will exchange code; auth listener above will navigate
      }
    } catch (e) {
      console.warn("Google Login failed:", e);
      Alert.alert("Google Login Failed", e?.message || String(e));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login to MicroAudit</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoComplete="email"
        onSubmitEditing={() => {
          // If user presses Enter on email field, move to password
        }}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        autoCapitalize="none"
        autoComplete="password"
        onSubmitEditing={handleLogin}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}
        disabled={loading}
        accessibilityRole="button"
        accessibilityLabel="Login"
      >
        <Text style={styles.buttonText}>
          {loading ? "Logging in..." : "Login"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.googleButton}
        onPress={handleGoogleLogin}
        accessibilityRole="button"
        accessibilityLabel="Login with Google"
      >
        <Text style={styles.googleText}>Login with Google</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
        <Text style={styles.link}>Don’t have an account? Sign Up</Text>
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
