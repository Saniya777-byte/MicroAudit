import React from "react";
import { View, Text, TouchableOpacity, Image, Linking, StyleSheet } from "react-native";
import { Link as LinkIcon } from "lucide-react-native";
import SectionHeader from "../SectionHeader";
import { colors } from "../../theme";

export default function ResourcesSection({ resources }) {
    return (
        <>
            <SectionHeader title="Resources" />
            <View style={styles.imgGrid}>
                {resources.images.map(img => (
                    <TouchableOpacity key={img.id} onPress={() => Linking.openURL(img.uri)}>
                        <Image source={{ uri: img.uri }} style={styles.img} />
                    </TouchableOpacity>
                ))}
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
    imgGrid: { flexDirection: "row", flexWrap: "wrap", marginTop: 8 },
    img: { width: 100, height: 100, borderRadius: 12 },
    linkCard: { flexDirection: "row", alignItems: "center", backgroundColor: colors.surface, borderRadius: 12, padding: 12 },
});
