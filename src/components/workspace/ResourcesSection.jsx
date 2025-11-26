import React from "react";
import { View, Text, TouchableOpacity, Image, Linking, StyleSheet } from "react-native";
import { Link as LinkIcon } from "lucide-react-native";
import SectionHeader from "../SectionHeader";
import { colors } from "../../theme";

export default function ResourcesSection({ resources, onAdd }) {
    return (
        <>
            <View style={styles.headerRow}>
                <SectionHeader title="Resources" />
                <TouchableOpacity onPress={onAdd} style={styles.addBtn}>
                    <Text style={styles.addBtnText}>+ Add</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.imgGrid}>
                {resources.images && resources.images.length > 0 ? (
                    resources.images.map(img => (
                        <View key={img.id} style={styles.imageContainer}>
                            <Image 
                                source={img.uri}
                                style={styles.img}
                                resizeMode="cover"
                                onError={(e) => {
                                    console.log('Image load error:', e.nativeEvent.error);
                                }}
                            />
                        </View>
                    ))
                ) : (
                    <View style={styles.noImagesContainer}>
                        <Text style={styles.noImagesText}>No images available</Text>
                    </View>
                )}
            </View>
            <View style={{ marginTop: 8 }}>
                {resources.links.map(l => (
                    <TouchableOpacity key={l.id} style={[styles.linkCard, { marginTop: 8 }]} onPress={() => Linking.openURL(l.url)}>
                        <LinkIcon size={16} color={colors.muted} />
                        <Text style={{ marginLeft: 8, flex: 1 }} numberOfLines={1}>{l.title}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    imgGrid: { 
        flexDirection: "row", 
        flexWrap: "wrap", 
        marginTop: 8,
        marginRight: -8  
    },
    imageContainer: {
        width: '33.33%',  
        paddingRight: 8,
        paddingBottom: 8,
        aspectRatio: 1,   
    },
    img: { 
        width: '100%', 
        height: '100%',
        borderRadius: 12,
        backgroundColor: '#f0f0f0',  
        borderWidth: 1,
        borderColor: '#e0e0e0'
    },
    noImagesContainer: {
        width: '100%',
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    noImagesText: {
        color: colors.muted,
        fontSize: 14,
    },
    linkCard: { flexDirection: "row", alignItems: "center", backgroundColor: colors.surface, borderRadius: 12, padding: 12 },
    headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 24, marginBottom: 8 },
    addBtn: { paddingHorizontal: 12, paddingVertical: 4, backgroundColor: colors.primary + "20", borderRadius: 12 },
    addBtnText: { color: colors.primary, fontWeight: "600", fontSize: 12 },
});
