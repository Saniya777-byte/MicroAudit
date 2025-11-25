import React, { useState, useRef } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet, SafeAreaView, ScrollView, TextInput, Alert, } from "react-native";
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
            // Get current date for folder organization
            const today = new Date();
            const monthYear = today.toLocaleString('default', { month: 'long', year: 'numeric' });
            
            // Get existing documents
            let savedDocs = await AsyncStorage.getItem("documents");
            savedDocs = savedDocs ? JSON.parse(savedDocs) : {};
            
            // Create folder if it doesn't exist
            if (!savedDocs[monthYear]) {
                savedDocs[monthYear] = [];
            }
            
            // Add new document
            const newDoc = {
                id: Date.now().toString(),
                name: docType,
                uri: image,
                savedAt: today.toISOString(),
                type: 'image'
            };
            
            savedDocs[monthYear].push(newDoc);
            
            // Save back to storage
            await AsyncStorage.setItem("documents", JSON.stringify(savedDocs));
            
            Alert.alert("Success", "Document saved successfully!");
            navigation.goBack();
        } catch (error) {
            console.error("Error saving document:", error);
            Alert.alert("Error", "Failed to save document. Please try again.");
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

    if (image) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.previewContainer}>
                    <Image source={{ uri: image }} style={styles.previewImage} />
                    <TextInput
                        style={styles.input}
                        placeholder="Enter document name"
                        value={docType}
                        onChangeText={setDocType}
                        placeholderTextColor="#999"
                    />
                    <View style={styles.buttonRow}>
                        <TouchableOpacity 
                            style={[styles.actionBtn, { backgroundColor: '#ff3b30' }]}
                            onPress={() => setImage(null)}
                        >
                            <Text style={styles.btnText}>Retake</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.actionBtn, { backgroundColor: '#34C759' }]}
                            onPress={saveImage}
                            disabled={!docType.trim()}
                        >
                            <Text style={styles.btnText}>Save Document</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={{ padding: 20 }}>
                <Text style={styles.title}>📄 Document Scanner</Text>
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.button} onPress={openCamera}>
                        <Text style={styles.buttonText}>📷 Scan with Camera</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button} onPress={pickImage}>
                        <Text style={styles.buttonText}>🖼️ Pick from Gallery</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    previewContainer: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
    },
    previewImage: {
        width: '100%',
        height: 300,
        resizeMode: 'contain',
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
        marginBottom: 20,
    },
    input: {
        backgroundColor: '#f5f5f5',
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
        fontSize: 16,
        color: '#000',
    },
    buttonContainer: {
        marginTop: 20,
        gap: 15,
    },
    button: {
        backgroundColor: '#007AFF',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
    },
    actionBtn: {
        flex: 1,
        padding: 15,
        backgroundColor: "#007AFF",
        borderRadius: 8,
        alignItems: 'center',
    },
    btnText: {
        color: "white",
        textAlign: "center",
        fontWeight: '600',
    },
    camera: {
        flex: 1,
    },
    cameraButtons: {
        flexDirection: "row",
        justifyContent: "space-around",
        padding: 20,
        backgroundColor: 'rgba(0,0,0,0.7)',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#000',
        textAlign: 'center',
    },
});
