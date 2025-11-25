import React, { useState } from "react";
import { SafeAreaView, View, Text, FlatList, Image, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Camera, Plus } from "lucide-react-native";
import { colors, spacing } from "../theme";

export default function DocumentsScreen() {
  const [documents, setDocuments] = useState({});
  const navigation = useNavigation();


  useFocusEffect(
    React.useCallback(() => {
      const loadDocs = async () => {
        try {
          const data = await AsyncStorage.getItem("documents");
          if (data) setDocuments(JSON.parse(data));
          else setDocuments({});
        } catch (e) {
          console.error("Failed to load documents", e);
        }
      };
      loadDocs();
    }, [])
  );

  const handleScanPress = () => {
    navigation.navigate('Scan');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>My Documents</Text>
        <TouchableOpacity style={styles.scanButton} onPress={handleScanPress}>
          <Camera size={20} color="white" />
          <Text style={styles.scanButtonText}>Scan</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.container}>
        {Object.keys(documents).length === 0 ? (
          <Text style={styles.emptyText}>No documents saved yet</Text>
        ) : (
          Object.keys(documents).map((folder) => (
            <View key={folder} style={styles.folder}>
              <Text style={styles.folderTitle}>{folder}</Text>
              <FlatList
                horizontal
                data={documents[folder].sort(
                  (a, b) => new Date(b.savedAt) - new Date(a.savedAt)
                )}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                  <Image source={{ uri: item.uri }} style={styles.docImage} />
                )}
                showsHorizontalScrollIndicator={false}
              />
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "white" },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    gap: spacing.xs,
  },
  scanButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  container: { padding: 20, paddingBottom: 40 }, 
  emptyText: {
    textAlign: "center",
    color: "#666",
    marginTop: 50,
    fontSize: 16,
  },
  folder: { marginBottom: 30 },
  folderTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  docImage: {
    width: 120,
    height: 160,
    marginRight: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
});

