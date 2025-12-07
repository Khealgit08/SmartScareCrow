import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons, Feather, MaterialIcons } from "@expo/vector-icons";

export default function DeletedR() {
  const deletedData = [
    { id: 1, filename: "Record 1" },
    { id: 2, filename: "Record 2" },
    { id: 3, filename: "Record 3" },
  ];

  return (
    <View style={styles.container}>
      {/* Profile Header */}
      <View style={styles.profileSection}>
        <Ionicons name="person-circle-outline" size={90} color="#000" />
        <Text style={styles.username}>Username</Text>
      </View>

      {/* Section Title */}
      <View style={styles.sectionRow}>
        <Ionicons name="chevron-back" size={20} color="#000" />
        <Text style={styles.sectionTitle}>Recently Deleted</Text>
      </View>

      <View style={styles.line} />

      {/* Deleted items */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 80 }} // BIGGER lift
      >
        {deletedData.map((item) => (
          <View style={styles.card} key={item.id}>
            <Feather
              name="video"
              size={20}
              color="#000"
              style={{ marginRight: 10 }}
            />

            <Text style={styles.filename}>{item.filename}</Text>

            <TouchableOpacity>
              <MaterialIcons name="restore" size={22} color="#555" />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* Delete all permanently button */}
      <TouchableOpacity style={styles.deleteAllBtn}>
        <Text style={styles.deleteAllText}>DELETE ALL PERMANENTLY</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6EDED", padding: 20 },

  profileSection: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 10,
  },
  username: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 5,
    color: "#000",
  },

  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 14,
    marginLeft: 5,
    fontWeight: "600",
  },

  line: {
    borderBottomColor: "#000",
    borderBottomWidth: 1,
    marginVertical: 10,
    width: "95%",
    alignSelf: "center",
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginBottom: 12,
  },

  filename: {
    flex: 1,
    fontWeight: "600",
    fontSize: 13,
  },

  deleteAllBtn: {
    backgroundColor: "#FFE5E5",
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 20,
    alignSelf: "center",
    marginBottom: 30, // lifted higher
  },

  deleteAllText: {
    fontSize: 12,
    color: "#B02222",
    fontWeight: "700",
  },
});
