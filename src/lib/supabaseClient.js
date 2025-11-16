import { createClient } from "@supabase/supabase-js";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { Platform } from "react-native";

// Only for native; on web we rely on normal redirect flow
if (Platform.OS !== "web") {
  WebBrowser.maybeCompleteAuthSession();
}

const supabaseUrl = Constants.expoConfig.extra.supabaseUrl;
const supabaseAnonKey = Constants.expoConfig.extra.supabaseAnonKey;

const redirectTo = Platform.OS === "web"
  ? `${window.location.origin}/auth/callback`
  : Linking.createURL("/auth/callback");


export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: Platform.OS === "web",
  },
});
