import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons, Feather, MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from '@react-navigation/native';

export default function SavedR() {
  const navigation = useNavigation();

  const savedData = [
    { id: 1, filename: "Record 1" },
    { id: 2, filename: "Record 2" },
    { id: 3, filename: "Record 3" },
    { id: 4, filename: "Record 4" },
    { id: 5, filename: "Record 5" },
  ];

  return (
    <View style={styles.container}>
      {/* Profile Header */}
      <View style={styles.profileSection}>
        <Ionicons name="person-circle-outline" size={90} color="#000" />
        <Text style={styles.username}>Username</Text>
      </View>

      {/* Section Title */}
      <TouchableOpacity style={styles.sectionRow} onPress={() => navigation.navigate('profile')}>
        <Ionicons name="chevron-back" size={20} color="#000" />
        <Text style={styles.sectionTitle}>Saved Records</Text>
      </TouchableOpacity>

      <View style={styles.line} />

      {/* Saved items list */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {savedData.map((item) => (
          <View style={styles.card} key={item.id}>
            <Feather
              name="video"
              size={20}
              color="#000"
              style={{ marginRight: 10 }}
            />
            <Text style={styles.filename}>{item.filename}</Text>

            <View style={styles.actionRow}>
              <TouchableOpacity>
                <MaterialIcons name="delete" size={22} color="#E3342F" />
              </TouchableOpacity>

              <TouchableOpacity style={{ marginLeft: 15 }}>
                <Ionicons name="share-social-outline" size={22} color="#34C759" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
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

  actionRow: {
    flexDirection: "row",
    alignItems: "center",
  },
});
