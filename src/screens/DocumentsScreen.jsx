import React, { useState } from "react";
import { SafeAreaView, View,  Text,FlatList,Image, StyleSheet, ScrollView,} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

export default function DocumentsScreen() {
  const [documents, setDocuments] = useState({});


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

  return (
    <SafeAreaView style={styles.safeArea}>
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

