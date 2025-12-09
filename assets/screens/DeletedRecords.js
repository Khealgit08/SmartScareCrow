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
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const ACCENT_COLOR = '#8b0000'; // Dark red/maroon for permanent delete

// Dummy data for the records list
const deletedRecords = [
  { id: '1', name: 'RECORD 1' },
  { id: '2', name: 'RECORD 2' },
  { id: '3', name: 'RECORD 3' },
  // Added more records for scrolling demonstration
  { id: '4', name: 'RECORD 4' },
  { id: '5', name: 'RECORD 5' },
];

// Component for a single record item
const RecordItem = ({ recordName }) => (
  <View style={styles.recordItemContainer}>
    <MaterialCommunityIcons name="video-outline" size={24} color="black" style={{ marginRight: 10 }} />
    <Text style={styles.recordItemText}>{recordName}</Text>
    {/* Restore Icon (Circular arrow) */}
    <TouchableOpacity style={styles.restoreIcon}>
      <Ionicons name="refresh-circle-outline" size={28} color="black" />
    </TouchableOpacity>
  </View>
);

const DeletedRecordsScreen = () => {
  const navigation = useNavigation();

  const handleDeleteAll = () => {
    // Logic to permanently delete all records goes here
    alert('All records deleted permanently!');
  };

  return (
    <View style={styles.container}>
      {/* Top Menu Button (Simulated) */}
      <TouchableOpacity style={styles.menuButton}>
        <Ionicons name="menu" size={30} color="black" />
      </TouchableOpacity>

      {/* User Profile Section (Simulated) */}
      <View style={styles.profileSection}>
        <View style={styles.profileIconContainer}>
          <Ionicons name="person-circle-outline" size={90} color="black" />
          <View style={styles.plusIcon}>
            <Ionicons name="add-circle" size={24} color="green" /> 
          </View>
        </View>
        <Text style={styles.usernameText}>USERNAME</Text>
      </View>
      
      <View style={styles.divider} />

      {/* Recently Deleted Header */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.deletedHeader}>
        <Ionicons name="arrow-back" size={24} color="black" style={{ marginRight: 10 }} />
        <Text style={styles.deletedHeaderText}>RECENTLY DELETED</Text>
      </TouchableOpacity>
      
      <View style={styles.contentContainer}>
        <ScrollView style={styles.recordsList}>
          {deletedRecords.map(record => (
            <RecordItem key={record.id} recordName={record.name} />
          ))}
        </ScrollView>
        
        {/* Delete All Permanently Button */}
        <TouchableOpacity onPress={handleDeleteAll} style={styles.deleteButton}>
          <Text style={styles.deleteButtonText}>DELETE ALL PERMANENTLY</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Up Arrow (placeholder for bottom sheet/tab bar) */}
      <View style={styles.bottomBar}>
        <Ionicons name="chevron-up-sharp" size={40} color="black" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6EEEE',
    paddingTop: 50, // To avoid status bar overlap
  },
  menuButton: {
    position: 'absolute',
    top: 50,
    left: 15,
    background: 'linear-gradient(180deg, rgba(127, 34, 34, 1) 0%, rgba(229, 62, 62, 1) 100%)',     padding: 5, 
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'black',
  },
  profileSection: {
    alignItems: 'center',
    marginTop: 20,
  },
  profileIconContainer: {
    position: 'relative',
  },
  plusIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  usernameText: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'serif',
    marginTop: 5,
    marginBottom: 20,
  },
  divider: {
    borderBottomColor: 'black',
    borderBottomWidth: 1,
    width: '90%',
    alignSelf: 'center',
    marginVertical: 10,
  },
  deletedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  deletedHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'serif',
  },
  contentContainer: {
    flex: 1, // Take up the remaining space
    paddingHorizontal: 20,
  },
  recordsList: {
    flex: 1,
  },
  recordItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  recordItemText: {
    flex: 1, // Takes up space between icon and restore icon
    fontSize: 16,
    fontFamily: 'serif',
  },
  restoreIcon: {
    padding: 5,
  },
  deleteButton: {
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 100, // Make space for the bottom bar
  },
  deleteButtonText: {
    color: ACCENT_COLOR,
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'serif',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: '#D9D9D9', // Dark grey background
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
});

export default DeletedRecordsScreen;
