// // Navigation.js
// import React from "react";
// import { createNativeStackNavigator } from "@react-navigation/native-stack";
// import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
// import Ionicons from "react-native-vector-icons/Ionicons";

// import LoginScreen from "./src/screens/LoginScreen";
// import SignupScreen from "./src/screens/SignupScreen";
// import HomeScreen from "./src/screens/HomeScreen";
// import DocumentsScreen from "./src/screens/DocumentsScreen";
// import ScanScreen from "./src/screens/ScanScreen";
// import ProfileScreen from "./src/screens/ProfileScreen";

// const Stack = createNativeStackNavigator();
// const Tab = createBottomTabNavigator();

// // Bottom Tabs component
// function BottomTabs() {
//   return (
//     <Tab.Navigator
//       screenOptions={({ route }) => ({
//         headerShown: false,
//         tabBarIcon: ({ color, size }) => {
//           let iconName;
//           if (route.name === "Home") iconName = "home-outline";
//           else if (route.name === "Documents") iconName = "document-text-outline";
//           else if (route.name === "Scan") iconName = "scan-outline";
//           else if (route.name === "Profile") iconName = "person-outline";

//           return <Ionicons name={iconName} size={size} color={color} />;
//         },
//         tabBarActiveTintColor: "#1D4ED8",
//         tabBarInactiveTintColor: "#4B5563",
//       })}
//     >
//       <Tab.Screen name="Home" component={HomeScreen} />
//       <Tab.Screen name="Documents" component={DocumentsScreen} />
//       <Tab.Screen name="Scan" component={ScanScreen} />
//       <Tab.Screen name="Profile" component={ProfileScreen} />
//     </Tab.Navigator>
//   );
// }

// // Main Navigation
// export default function Navigation() {
//   return (
//     <Stack.Navigator screenOptions={{ headerShown: false }}>
//       {/* Auth Screens */}
//       <Stack.Screen name="Login" component={LoginScreen} />
//       <Stack.Screen name="Signup" component={SignupScreen} />

//       {/* After login */}
//       <Stack.Screen name="Main" component={BottomTabs} />
//     </Stack.Navigator>
//   );
// }
