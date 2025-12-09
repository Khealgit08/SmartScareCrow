import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
} from "react-native";

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [expandedPanel, setExpandedPanel] = useState(false);
  const [geoEnabled, setGeoEnabled] = useState(false);

  // Device list sample
  const devices = ["Crow 1", "Crow 2", "Crow 3"];

  return (
    <View style={styles.screen}>
      {/* TOP MENU BUTTON */}
      <TouchableOpacity
        style={styles.menuButton}
        onPress={() => setMenuOpen(!menuOpen)}
      >
        <Text style={styles.menuIcon}>≡</Text>
      </TouchableOpacity>

      {/* DROPDOWN MENU */}
      {menuOpen && (
        <View style={styles.dropdownMenu}>
          <Text style={styles.menuItem}>Home</Text>
          <Text style={styles.menuItem}>Records</Text>
          <Text style={styles.menuItem}>Profile</Text>
          <Text style={styles.menuItem}>Settings</Text>
        </View>
      )}

      <ScrollView style={styles.content}>
        {/* CONNECTED DEVICES */}
        <Text style={styles.sectionTitle}>CONNECTED SCARECROW DEVICES</Text>
        <View style={styles.divider} />

        {devices.map((name, i) => (
          <View key={i} style={styles.deviceRow}>
            <Text style={styles.deviceIcon}>🕊️</Text>
            <Text style={styles.deviceName}>{name}</Text>

            <TouchableOpacity style={styles.eyeButton}>
              <Text>👁️</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.deleteButton}>
              <Text style={{ color: "white" }}>🗑️</Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* ALERT PREFERENCE */}
        <Text style={styles.sectionTitle}>ALERT PREFERENCE</Text>
        <View style={styles.divider} />

        <Text style={styles.subTitle}>Alert Volume</Text>

        {/* Fake slider UI (no functionality required) */}
        <View style={styles.sliderBar}>
          {[0, 25, 50, 75, 100].map((v) => (
            <View key={v} style={styles.sliderDot} />
          ))}
        </View>

        {/* Alert Sound */}
        <View style={{ marginTop: 20 }}>
          <Text style={styles.subTitle}>Alert Sound</Text>

          <View style={styles.row}>
            <Text style={styles.defaultSound}>Default sound</Text>
            <Text style={styles.checkmark}>✔️</Text>
          </View>

          <View style={[styles.row, { marginTop: 10 }]}>
            <Text style={styles.addSound}>➕ Add Alert Sound</Text>
          </View>
        </View>

        {/* GEOFENCING */}
        <Text style={styles.sectionTitle}>GEOFENCING</Text>
        <View style={styles.divider} />

        <View style={styles.row}>
          <Text style={styles.subTitle}>Enable/Disable Geofencing</Text>
          <Switch value={geoEnabled} onValueChange={setGeoEnabled} />
        </View>

        {/* BOTTOM EXPAND PANEL BUTTON */}
        <TouchableOpacity
          style={styles.bottomExpandButton}
          onPress={() => setExpandedPanel(!expandedPanel)}
        >
          <Text style={styles.expandIcon}>{expandedPanel ? "⌄" : "⌃"}</Text>
        </TouchableOpacity>

        {/* EXPANDED PANEL (WEATHER + INFO WIDGETS) */}
        {expandedPanel && (
          <View style={styles.expandedPanel}>
            <View style={styles.widget}>
              <Text style={styles.widgetLabel}>Risk Level</Text>
              <Text style={styles.widgetValueGreen}>LOW</Text>
              <Text>No Harm Detected</Text>
            </View>

            <View style={styles.widget}>
              <Text style={styles.widgetLabel}>My Location</Text>
              <Text>☁️</Text>
              <Text>Cloudy Day</Text>
            </View>

            <View style={styles.widget}>
              <Text style={styles.widgetLabel}>Temperature</Text>
              <Text style={styles.widgetValue}>78°C</Text>
            </View>

            <View style={styles.widget}>
              <Text style={styles.widgetLabel}>Humidity</Text>
              <Text style={styles.widgetValue}>67%</Text>
            </View>

            <View style={styles.widget}>
              <Text style={styles.widgetLabel}>Soil Moisture</Text>
              <Text style={styles.widgetValue}>60%</Text>
            </View>

            {/* Simple Calendar Block */}
            <View style={styles.widget}>
              <Text style={styles.widgetLabel}>September 2025</Text>
              <Text>Calendar UI Here</Text>
            </View>

            <View style={styles.widget}>
              <Text style={styles.widgetLabel}>Notification</Text>
              {[...Array(5)].map((_, i) => (
                <Text key={i} style={styles.notificationItem}>
                  Notification
                </Text>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#EBDDDC",
  },

  /* ====== MENU ====== */
  menuButton: {
    position: "absolute",
    top: 30,
    left: 20,
    zIndex: 20,
    backgroundColor: "#A2423D",
    padding: 10,
    borderRadius: 10,
  },
  menuIcon: { color: "white", fontSize: 20 },
  dropdownMenu: {
    position: "absolute",
    top: 70,
    left: 20,
    width: 120,
    backgroundColor: "#A2423D",
    padding: 10,
    borderRadius: 8,
    zIndex: 15,
  },
  menuItem: { color: "white", paddingVertical: 4 },

  /* ====== LAYOUT ====== */
  content: { marginTop: 80, paddingHorizontal: 16 },
  sectionTitle: {
    marginTop: 20,
    fontWeight: "bold",
    fontSize: 15,
  },
  divider: {
    height: 2,
    backgroundColor: "black",
    marginVertical: 6,
  },

  /* ====== DEVICES ====== */
  deviceRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    backgroundColor: "white",
    borderRadius: 8,
    marginVertical: 5,
    paddingHorizontal: 12,
  },
  deviceIcon: { marginRight: 10 },
  deviceName: { flex: 1, fontSize: 16 },
  eyeButton: {
    marginRight: 10,
    padding: 6,
  },
  deleteButton: {
    backgroundColor: "#C1423C",
    padding: 6,
    borderRadius: 5,
  },

  /* ====== ALERT PREFERENCES ====== */
  subTitle: { fontWeight: "600", marginBottom: 5 },
  sliderBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 5,
    marginTop: 8,
  },
  sliderDot: {
    width: 12,
    height: 12,
    backgroundColor: "black",
    borderRadius: 6,
  },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  checkmark: { color: "green", marginLeft: 10 },
  defaultSound: { fontSize: 16 },
  addSound: { fontSize: 16 },

  /* ====== BOTTOM EXPAND ====== */
  bottomExpandButton: {
    marginTop: 30,
    alignSelf: "center",
    backgroundColor: "#D6D6D6",
    padding: 15,
    borderRadius: 30,
    width: 70,
    alignItems: "center",
  },
  expandIcon: { fontSize: 26 },

  /* ====== EXPANDED PANEL ====== */
  expandedPanel: {
    marginTop: 20,
    backgroundColor: "#A2423D",
    borderRadius: 25,
    padding: 15,
  },
  widget: {
    backgroundColor: "white",
    padding: 16,
    marginVertical: 8,
    borderRadius: 10,
  },
  widgetLabel: { fontWeight: "bold", marginBottom: 5 },
  widgetValue: { fontSize: 20, fontWeight: "bold" },
  widgetValueGreen: { fontSize: 20, fontWeight: "bold", color: "green" },
  notificationItem: {
    backgroundColor: "#E0E0E0",
    padding: 6,
    marginTop: 4,
    borderRadius: 6,
  },
});
