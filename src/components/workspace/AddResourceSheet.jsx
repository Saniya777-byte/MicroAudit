import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, Pressable, StyleSheet, TextInput, ActivityIndicator, Alert } from "react-native";
import { Link as LinkIcon, Image as ImageIcon, X } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { colors, spacing, radius, fonts } from "../../theme";

export default function AddResourceSheet({ visible, onClose, onAdd }) {
    const [type, setType] = useState("link"); // 'link' or 'image'
    const [title, setTitle] = useState("");
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);

    const handleAdd = async () => {
        if (type === "link") {
            if (!url.trim()) {
                Alert.alert("Validation", "Please enter a URL");
                return;
            }
            // Simple URL validation/prefixing
            let finalUrl = url.trim();
            if (!/^https?:\/\//i.test(finalUrl)) {
                finalUrl = "https://" + finalUrl;
            }

            setLoading(true);
            await onAdd({ type: "link", title: title.trim() || finalUrl, url: finalUrl });
            setLoading(false);
            resetAndClose();
        }
    };

    const handlePickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: 'images',
                quality: 0.8,
                base64: true, // We might need base64 if we are uploading, but for now let's assume we handle the URI
            });

            if (!result.canceled) {
                setLoading(true);
                const asset = result.assets[0];
                // For a real app, we would upload the image here and get a URL.
                // For this implementation, we'll pass the local URI and let the parent handle upload if needed,
                // or just store the URI if we are just testing (though persistent storage needs upload).
                // We'll pass the asset to onAdd.
                await onAdd({ type: "image", uri: asset.uri, base64: asset.base64 });
                setLoading(false);
                resetAndClose();
            }
        } catch (error) {
            console.error("Error picking image:", error);
            Alert.alert("Error", "Failed to pick image");
            setLoading(false);
        }
    };

    const resetAndClose = () => {
        setType("link");
        setTitle("");
        setUrl("");
        setLoading(false);
        onClose();
    };

    return (
        <Modal transparent visible={visible} animationType="slide" onRequestClose={resetAndClose}>
            <Pressable style={styles.backdrop} onPress={resetAndClose} />
            <View style={styles.sheet}>
                <View style={styles.handle} />
                <View style={styles.header}>
                    <Text style={styles.title}>Add Resource</Text>
                    <TouchableOpacity onPress={resetAndClose}>
                        <X color={colors.muted} size={24} />
                    </TouchableOpacity>
                </View>

                <View style={styles.tabs}>
                    <TouchableOpacity
                        style={[styles.tab, type === "link" && styles.activeTab]}
                        onPress={() => setType("link")}
                    >
                        <LinkIcon size={18} color={type === "link" ? colors.primary : colors.muted} />
                        <Text style={[styles.tabText, type === "link" && styles.activeTabText]}>Link</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, type === "image" && styles.activeTab]}
                        onPress={() => setType("image")}
                    >
                        <ImageIcon size={18} color={type === "image" ? colors.primary : colors.muted} />
                        <Text style={[styles.tabText, type === "image" && styles.activeTabText]}>Image</Text>
                    </TouchableOpacity>
                </View>

                {type === "link" ? (
                    <View style={styles.form}>
                        <Text style={styles.label}>Title (Optional)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. Design System"
                            value={title}
                            onChangeText={setTitle}
                        />
                        <Text style={styles.label}>URL</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. https://example.com"
                            value={url}
                            onChangeText={setUrl}
                            autoCapitalize="none"
                            keyboardType="url"
                        />
                        <TouchableOpacity style={styles.btn} onPress={handleAdd} disabled={loading}>
                            {loading ? <ActivityIndicator color="white" /> : <Text style={styles.btnText}>Add Link</Text>}
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.centerContent}>
                        <Text style={styles.helperText}>Upload an image from your gallery</Text>
                        <TouchableOpacity style={styles.btn} onPress={handlePickImage} disabled={loading}>
                            {loading ? <ActivityIndicator color="white" /> : <Text style={styles.btnText}>Pick Image</Text>}
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.3)" },
    sheet: { backgroundColor: colors.surface, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: spacing.lg, marginTop: "auto" },
    handle: { width: 40, height: 4, backgroundColor: "#E5E7EB", borderRadius: 2, alignSelf: "center", marginBottom: spacing.lg },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.lg },
    title: { fontSize: fonts.h1, fontWeight: "700", color: colors.text },
    tabs: { flexDirection: "row", marginBottom: spacing.lg, backgroundColor: colors.bg, borderRadius: radius.md, padding: 4 },
    tab: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 8, borderRadius: radius.sm, gap: 6 },
    activeTab: { backgroundColor: colors.surface, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
    tabText: { fontWeight: "600", color: colors.muted },
    activeTabText: { color: colors.primary },
    form: { gap: spacing.md },
    label: { fontSize: fonts.small, fontWeight: "600", color: colors.text, marginBottom: 4 },
    input: { borderWidth: 1, borderColor: "#E5E7EB", borderRadius: radius.md, padding: spacing.md, fontSize: fonts.body },
    btn: { backgroundColor: colors.primary, padding: spacing.md, borderRadius: radius.md, alignItems: "center", marginTop: spacing.sm },
    btnText: { color: "white", fontWeight: "700", fontSize: fonts.body },
    centerContent: { alignItems: "center", paddingVertical: spacing.xl, gap: spacing.lg },
    helperText: { color: colors.muted, textAlign: "center" },
});
