import React, { useState } from "react";
import { View, Text, Switch, StyleSheet, ScrollView } from "react-native";

export default function App() {
  const [notifications, setNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  return (
    <ScrollView style={styles.container}>
      {/* ACCOUNT */}
      <Text style={styles.sectionTitle}>Account</Text>
      <View style={styles.item}>
        <Text style={styles.itemText}>Profile</Text>
      </View>
      <View style={styles.item}>
        <Text style={styles.itemText}>Change Password</Text>
      </View>

      {/* PREFERENCES */}
      <Text style={styles.sectionTitle}>Preferences</Text>
      <View style={styles.itemRow}>
        <Text style={styles.itemText}>Notifications</Text>
        <Switch value={notifications} onValueChange={setNotifications} />
      </View>
      <View style={styles.itemRow}>
        <Text style={styles.itemText}>Dark Mode</Text>
        <Switch value={darkMode} onValueChange={setDarkMode} />
      </View>

      {/* SUPPORT */}
      <Text style={styles.sectionTitle}>Support</Text>
      <View style={styles.item}>
        <Text style={styles.itemText}>Help Center</Text>
      </View>
      <View style={styles.item}>
        <Text style={styles.itemText}>Contact Support</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff"
  },
  sectionTitle: {
    marginTop: 24,
    marginLeft: 16,
    marginBottom: 8,
    fontWeight: "bold",
    fontSize: 14,
    color: "#666"
  },
  item: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: "#eee"
  },
  itemRow: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: "#eee",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  itemText: {
    fontSize: 16
  }
});
