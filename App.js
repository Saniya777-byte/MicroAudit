import 'react-native-gesture-handler';
import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Home, FileText, Camera, User, Briefcase } from "lucide-react-native";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { Alert } from "react-native";
import { Platform } from "react-native";

import Dashboard from "./src/screens/HomeScreen";
import Documents from "./src/screens/DocumentsScreen";
import Scan from "./src/screens/ScanScreen";
import Profile from "./src/screens/ProfileScreen";
import Login from "./src/screens/LoginScreen"; 
import Signup from "./src/screens/SignupScreen"; 
import Notes from "./src/screens/NotesScreen";
import NoteEditor from "./src/screens/NoteEditor";
import Workspaces from "./src/screens/WorkspacesScreen";
import WorkspaceDetail from "./src/screens/WorkspaceDetail";
import { useEffect, useState } from "react";
import { supabase } from "./src/lib/supabaseClient";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          if (route.name === "Dashboard") return <Home color={color} size={size} />;
          if (route.name === "Workspaces") return <Briefcase color={color} size={size} />;
          if (route.name === "Notes") return <FileText color={color} size={size} />;
          if (route.name === "Documents") return <FileText color={color} size={size} />;
          if (route.name === "Scan") return <Camera color={color} size={size} />;
          if (route.name === "Profile") return <User color={color} size={size} />;
        },
        tabBarActiveTintColor: "#1D4ED8",
        tabBarInactiveTintColor: "#4B5563",
      })}
    >
      <Tab.Screen name="Dashboard" component={Dashboard} />
      <Tab.Screen name="Workspaces" component={Workspaces} />
      <Tab.Screen name="Notes" component={Notes} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
}

export default function App() {

    const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Handle OAuth deep links globally on native. On web, Supabase handles via detectSessionInUrl.
  useEffect(() => {
    if (Platform.OS === "web") return;
    const hasAccessToken = (url) => /[?&#]access_token=[^&#]+/i.test(url || "");
    const hasCode = (url) => /[?&#]code=[^&#]+/i.test(url || "");
    const getParam = (url, key) => {
      const match = (url || "").match(new RegExp(`[?&#]${key}=([^&#]+)`, "i"));
      return match ? decodeURIComponent(match[1]) : null;
    };

    const handleDeepLink = async (event) => {
      try {
        console.log("[Auth] Deep link URL:", event?.url);
        if (!event?.url || (!hasAccessToken(event.url) && !hasCode(event.url))) {
          console.log("[Auth] No OAuth params in URL; skipping exchange.");
          return;
        }
        WebBrowser.dismissBrowser();
        if (hasCode(event.url)) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(event.url);
          if (error) {
            console.warn("[Auth] exchangeCodeForSession error:", error);
            Alert.alert("OAuth Error", error.message || "Failed to complete sign-in.");
          } else if (data?.session) {
            console.log("[Auth] Session established for:", data.session.user?.email);
          } else {
            console.log("[Auth] No session returned after exchange.");
          }
        } else if (hasAccessToken(event.url)) {
          // Expo Auth Proxy returns access_token (+ refresh_token) in URL
          const access_token = getParam(event.url, "access_token");
          const refresh_token = getParam(event.url, "refresh_token");
          if (access_token && refresh_token) {
            const { data, error } = await supabase.auth.setSession({ access_token, refresh_token });
            if (error) {
              console.warn("[Auth] setSession error:", error);
              Alert.alert("OAuth Error", error.message || "Failed to complete sign-in.");
            } else if (data?.session) {
              console.log("[Auth] Session established via proxy for:", data.session.user?.email);
            }
          } else {
            console.log("[Auth] access_token present but tokens missing; skipping.");
          }
        }
      } catch (e) {
        console.warn("Deep link handling failed:", e);
        Alert.alert("Deep Link Handling Failed", e?.message || String(e));
      }
    };

    const subscription = Linking.addEventListener("url", handleDeepLink);

    // Handle cold start where the app is opened via the OAuth redirect
    Linking.getInitialURL().then((url) => {
      const redirectPreview = Linking.createURL("/auth/callback");
      console.log("[Auth] Expected redirect (this build):", redirectPreview);
      if (url) {
        console.log("[Auth] Initial URL on app start:", url);
        if (/[?&#](code|access_token)=[^&#]+/i.test(url)) {
          handleDeepLink({ url });
        } else {
          console.log("[Auth] Initial URL has no OAuth params; skipping exchange.");
        }
      }
    });

    return () => subscription.remove();
  }, []);

    useEffect(() => {
    // ✅ Get session on app load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // ✅ Listen for login/logout
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      subscription.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const ensureProfile = async () => {
      try {
        if (!session?.user) return;
        const user = session.user;
        const fullName = user.user_metadata?.full_name || null;
        const email = user.email || null;
        const { error } = await supabase
          .from("profiles")
          .upsert(
            {
              id: user.id,
              email,
              full_name: fullName,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "id" }
          );
        if (error) {
          console.warn("[Profiles] Upsert error:", error);
        }
      } catch (e) {
        console.warn("[Profiles] Upsert failed:", e);
      }
    };
    ensureProfile();
  }, [session]);

    if (loading) return null; 

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName={session ? "Main" : "Login"}
      >
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Signup" component={Signup} />
        <Stack.Screen name="Main" component={BottomTabs} />
        <Stack.Screen name="NoteEditor" component={NoteEditor} />
        <Stack.Screen name="WorkspaceDetail" component={WorkspaceDetail} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

