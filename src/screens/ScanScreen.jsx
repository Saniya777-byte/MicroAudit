import React, { useState, useRef } from "react";
import { View, Text,  TouchableOpacity, Image,StyleSheet, SafeAreaView,  ScrollView,  TextInput,  Alert,} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ScanScreen({ navigation }) {
  const [image, setImage] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [docType, setDocType] = useState("");
  const cameraRef = useRef(null);


  const openCamera = async () => {
    if (!permission?.granted) {
      await requestPermission();
      return;
    }
    setShowCamera(true);
  };


  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      setImage(photo.uri);
      setShowCamera(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const saveImage = async () => {
    if (!image) {
      Alert.alert("Error", "No image to save.");
      return;
    }
    if (!docType.trim()) {
      Alert.alert("Error", "Please enter a document name.");
      return;
    }

    try {
      let savedDocs = await AsyncStorage.getItem("scannedDocuments");
      savedDocs = savedDocs ? JSON.parse(savedDocs) : [];

      savedDocs.push({ name: docType, uri: image });

      await AsyncStorage.setItem("scannedDocuments", JSON.stringify(savedDocs));

      Alert.alert("Success", "Document saved!");
      setImage(null);
      setDocType("");
    } catch (error) {
      console.error("Error saving document:", error);
    }
  };

  if (showCamera) {
    return (
      <SafeAreaView style={styles.container}>
        {permission?.granted ? (
          <>
            <CameraView
              ref={cameraRef}
              style={styles.camera}
              facing="back"
            />
            <View style={styles.cameraButtons}>
              <TouchableOpacity style={styles.actionBtn} onPress={takePicture}>
                <Text style={styles.btnText}>Capture</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => setShowCamera(false)}
              >
                <Text style={styles.btnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <Text style={{ textAlign: "center", marginTop: 50 }}>
            Camera permission not granted
          </Text>
        )}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>📄 Document Scanner</Text>

        <TouchableOpacity style={styles.button} onPress={openCamera}>
          <Text style={styles.btnText}>📷 Scan with Camera</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={pickImage}>
          <Text style={styles.btnText}>🖼️ Pick from Gallery</Text>
        </TouchableOpacity>

        {image && (
          <View style={styles.previewContainer}>
            <Image source={{ uri: image }} style={styles.preview} />

            <TextInput
              style={styles.input}
              placeholder="Enter document name"
              value={docType}
              onChangeText={setDocType}
            />

            <TouchableOpacity style={styles.saveBtn} onPress={saveImage}>
              <Text style={styles.btnText}>💾 Save Document</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#4A90E2" }]}
          onPress={() => navigation.navigate("History")}
        >
          <Text style={styles.btnText}>📂 View History</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#F5F5F5",
    },
    scrollContainer: {
      padding: 20,
      alignItems: "center",
      flexGrow: 1, 
      justifyContent: "center",          
    },
    title: {
      fontSize: 26,
      fontWeight: "bold",
      marginBottom: 25,
      color: "#333",
    },
    button: {
      width: "90%",
      paddingVertical: 15,
      paddingHorizontal: 20,
      borderRadius: 12,
      backgroundColor: "#FF6F61",
      alignItems: "center",
      marginVertical: 10,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    btnText: {
      fontSize: 16,
      fontWeight: "600",
      color: "#fff",
    },
    previewContainer: {
      marginTop: 20,
      alignItems: "center",
      width: "100%",
      backgroundColor: "#fff",
      borderRadius: 12,
      padding: 15,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    preview: {
      width: 250,
      height: 350,
      borderRadius: 12,
      marginBottom: 15,
      resizeMode: "cover",
    },
    input: {
      borderWidth: 1,
      borderColor: "#ccc",
      padding: 12,
      width: "90%",
      borderRadius: 10,
      marginBottom: 15,
      backgroundColor: "#f9f9f9",
    },
    saveBtn: {
      width: "90%",
      padding: 14,
      backgroundColor: "#28A745",
      borderRadius: 12,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 3,
      elevation: 4,
    },
    camera: {
      flex: 1,
      width: "100%",
    },
    cameraButtons: {
      flexDirection: "row",
      justifyContent: "space-around",
      padding: 20,
      backgroundColor: "#000",
    },
    actionBtn: {
      paddingVertical: 15,
      paddingHorizontal: 25,
      backgroundColor: "#FF6F61",
      borderRadius: 12,
    },
  });
  