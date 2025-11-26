import React from "react";
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from "react-native";
import { Search } from "lucide-react-native";
import { colors, spacing } from "../../theme";

export default function SearchBar({ query, setQuery }) {
    return (
        <View style={styles.searchWrap}>
            <Search size={18} color={colors.muted} />
            <TextInput
                style={styles.search}
                placeholder="Search notes…"
                value={query}
                onChangeText={setQuery}
                placeholderTextColor="#9CA3AF"
            />
            {query.length > 0 && (
                <TouchableOpacity onPress={() => setQuery("")}>
                    <Text style={{ color: colors.muted }}>✕</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    searchWrap: {
        margin: spacing.md,
        paddingHorizontal: spacing.md,
        backgroundColor: colors.surface,
        borderRadius: 9999,
        height: 44,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 1,
    },
    search: { flex: 1, height: 44, color: colors.text },
});
