import React from "react";
import { ScrollView, TouchableOpacity, Text, StyleSheet } from "react-native";
import { colors, spacing, fonts } from "../../theme";

export default function TagsFilter({ allTags, activeTag, setActiveTag }) {
    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            {allTags.map((t) => {
                const active = t === activeTag;
                return (
                    <TouchableOpacity
                        key={t}
                        style={[styles.chip, active ? styles.chipActive : styles.chipOutline]}
                        onPress={() => setActiveTag(t)}
                    >
                        <Text style={[styles.chipText, active && { color: "#111827", fontWeight: "700" }]}>
                            {t}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    chips: { paddingHorizontal: spacing.md, gap: 8 },
    chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 9999, marginRight: 8 },
    chipOutline: { backgroundColor: colors.surface, borderWidth: 1, borderColor: "#E5E7EB" },
    chipActive: { backgroundColor: "#E5E7EB" },
    chipText: { color: colors.muted, fontSize: fonts.small },
});
