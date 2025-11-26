import React, { useState, useRef } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet, SafeAreaView, TextInput, Alert, StatusBar } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Camera, Image as ImageIcon, X, Check, RefreshCw, ChevronLeft } from "lucide-react-native";
import { colors, spacing, radius, fonts } from "../theme";

export default function ScanScreen({ navigation }) {
    const [image, setImage] = useState(null);
    const [showCamera, setShowCamera] = useState(false);
    const [permission, requestPermission] = useCameraPermissions();
    const [docType, setDocType] = useState("");
    const cameraRef = useRef(null);


    const openCamera = async () => {
        if (!permission?.granted) {
            const { granted } = await requestPermission();
            if (!granted) return;
        }
        setShowCamera(true);
    };


    const takePicture = async () => {
        if (cameraRef.current) {
            try {
                const photo = await cameraRef.current.takePictureAsync();
                setImage(photo.uri);
                setShowCamera(false);
            } catch (error) {
                Alert.alert("Error", "Failed to take picture");
            }
        }
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: 'images',
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
            <View style={styles.cameraContainer}>
                <StatusBar hidden />
                <CameraView
                    ref={cameraRef}
                    style={styles.camera}
                    facing="back"
                />
                <View style={styles.cameraOverlay}>
                    <View style={styles.cameraHeader}>
                        <TouchableOpacity
                            style={styles.iconButton}
                            onPress={() => setShowCamera(false)}
                        >
                            <X color="white" size={24} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.cameraFooter}>
                        <TouchableOpacity
                            style={styles.captureBtn}
                            onPress={takePicture}
                        >
                            <View style={styles.captureBtnInner} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    }

    if (image) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => setImage(null)} style={styles.backButton}>
                        <ChevronLeft color={colors.text} size={24} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Save Document</Text>
                    <View style={{ width: 24 }} />
                </View>

                <View style={styles.previewContent}>
                    <View style={styles.imageContainer}>
                        <Image source={{ uri: image }} style={styles.previewImage} />
                    </View>

                    <View style={styles.formContainer}>
                        <Text style={styles.label}>Document Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. Receipt, Invoice, Contract"
                            value={docType}
                            onChangeText={setDocType}
                            placeholderTextColor={colors.muted}
                            autoFocus
                        />

                        <View style={styles.actionButtons}>
                            <TouchableOpacity
                                style={[styles.actionBtn, styles.retakeBtn]}
                                onPress={() => setImage(null)}
                            >
                                <RefreshCw color={colors.text} size={20} />
                                <Text style={styles.retakeText}>Retake</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.actionBtn, styles.saveBtn, !docType.trim() && styles.disabledBtn]}
                                onPress={saveImage}
                                disabled={!docType.trim()}
                            >
                                <Check color="white" size={20} />
                                <Text style={styles.saveText}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ChevronLeft color={colors.text} size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Scan Document</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.mainContent}>
                <Text style={styles.subtitle}>Choose how you want to add a document</Text>

                <View style={styles.cardsContainer}>
                    <TouchableOpacity style={styles.card} onPress={openCamera}>
                        <View style={[styles.iconContainer, { backgroundColor: '#E0F2FE' }]}>
                            <Camera color={colors.primary} size={32} />
                        </View>
                        <Text style={styles.cardTitle}>Camera</Text>
                        <Text style={styles.cardDesc}>Take a photo of a document</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.card} onPress={pickImage}>
                        <View style={[styles.iconContainer, { backgroundColor: '#DCFCE7' }]}>
                            <ImageIcon color={colors.accent} size={32} />
                        </View>
                        <Text style={styles.cardTitle}>Gallery</Text>
                        <Text style={styles.cardDesc}>Import from your photos</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bg,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border || '#E5E7EB',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: fonts.h1,
        fontWeight: '600',
        color: colors.text,
    },
    mainContent: {
        flex: 1,
        padding: spacing.xl,
        justifyContent: 'center',
    },
    subtitle: {
        fontSize: fonts.body,
        color: colors.muted,
        textAlign: 'center',
        marginBottom: spacing.xl,
    },
    cardsContainer: {
        gap: spacing.lg,
    },
    card: {
        backgroundColor: colors.surface,
        padding: spacing.xl,
        borderRadius: radius.xl,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 3,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.03)',
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    cardTitle: {
        fontSize: fonts.h1,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 4,
    },
    cardDesc: {
        fontSize: fonts.small,
        color: colors.muted,
    },

    // Camera Styles
    cameraContainer: {
        flex: 1,
        backgroundColor: 'black',
    },
    camera: {
        flex: 1,
    },
    cameraOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'space-between',
        padding: spacing.xl,
    },
    cameraHeader: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        paddingTop: spacing.xl,
    },
    iconButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cameraFooter: {
        alignItems: 'center',
        paddingBottom: spacing.xl,
    },
    captureBtn: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    captureBtnInner: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'white',
    },

    // Preview Styles
    previewContent: {
        flex: 1,
        padding: spacing.lg,
    },
    imageContainer: {
        flex: 1,
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        overflow: 'hidden',
        marginBottom: spacing.lg,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    previewImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
        backgroundColor: '#F3F4F6',
    },
    formContainer: {
        backgroundColor: colors.surface,
        padding: spacing.lg,
        borderRadius: radius.lg,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 5,
    },
    label: {
        fontSize: fonts.small,
        fontWeight: '600',
        color: colors.text,
        marginBottom: spacing.xs,
        marginLeft: 4,
    },
    input: {
        backgroundColor: colors.bg,
        padding: spacing.md,
        borderRadius: radius.md,
        fontSize: fonts.body,
        color: colors.text,
        marginBottom: spacing.lg,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    actionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.md,
        borderRadius: radius.md,
        gap: 8,
    },
    retakeBtn: {
        backgroundColor: colors.bg,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    saveBtn: {
        backgroundColor: colors.primary,
    },
    disabledBtn: {
        opacity: 0.5,
    },
    retakeText: {
        fontWeight: '600',
        color: colors.text,
    },
    saveText: {
        fontWeight: '600',
        color: 'white',
    },
});
