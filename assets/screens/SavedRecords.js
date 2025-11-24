import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";

export default function SavedR() {
  const savedData = [
    { id: 1, filename: "FileName", datetime: "11/04/2025 | 10:12AM" },
    { id: 2, filename: "FileName", datetime: "11/04/2025 | 10:13AM" },
    { id: 3, filename: "FileName", datetime: "11/04/2025 | 10:14AM" },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Saved Records</Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        {savedData.map((item) => (
          <View style={styles.card} key={item.id}>
            <View>
              <Text style={styles.filename}>{item.filename}</Text>
              <Text style={styles.datetime}>{item.datetime}</Text>
            </View>

            <View style={styles.iconRow}>
              <TouchableOpacity>
                <Ionicons name="eye-outline" size={26} color="#000" />
              </TouchableOpacity>

              <TouchableOpacity style={{ marginLeft: 15 }}>
                <MaterialIcons name="delete" size={28} color="#E63946" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  header: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 15,
  },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    elevation: 2,
  },
  filename: {
    fontSize: 16,
    fontWeight: "600",
  },
  datetime: {
    fontSize: 12,
    color: "#777",
    marginTop: 3,
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
  },
});
