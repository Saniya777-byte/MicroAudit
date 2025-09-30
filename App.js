import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Home, FileText, Camera, User } from "lucide-react-native";

import Dashboard from "./src/screens/HomeScreen";
import Documents from "./src/screens/DocumentsScreen";
import Scan from "./src/screens/ScanScreen";
import Profile from "./src/screens/ProfileScreen";
import Login from "./src/screens/LoginScreen"; 
import Signup from "./src/screens/SignupScreen";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          if (route.name === "Dashboard") return <Home color={color} size={size} />;
          if (route.name === "Documents") return <FileText color={color} size={size} />;
          if (route.name === "Scan") return <Camera color={color} size={size} />;
          if (route.name === "Profile") return <User color={color} size={size} />;
        },
        tabBarActiveTintColor: "#1D4ED8",
        tabBarInactiveTintColor: "#4B5563",
      })}
    >
      <Tab.Screen name="Dashboard" component={Dashboard} />
      <Tab.Screen name="Documents" component={Documents} />
      <Tab.Screen name="Scan" component={Scan} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Signup" component={Signup} />

        <Stack.Screen name="Main" component={BottomTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
