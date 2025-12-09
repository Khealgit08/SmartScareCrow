import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const PRIMARY_COLOR = '#8b0000'; // A dark red/maroon for the accent text/lines

const MainProfileScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Top Menu Button */}
      <TouchableOpacity style={styles.menuButton}>
        <Ionicons name="menu" size={30} color="black" />
      </TouchableOpacity>

      {/* User Profile Section */}
      <View style={styles.profileSection}>
        <View style={styles.profileIconContainer}>
          <Ionicons name="person-circle-outline" size={90} color="black" />
          <View style={styles.plusIcon}>
             {/* The green plus icon on the profile image */}
            <Ionicons name="add-circle" size={24} color="green" /> 
          </View>
        </View>
        <Text style={styles.usernameText}>USERNAME</Text>
      </View>
      
      <View style={styles.divider} />

      {/* Records Icons Section */}
      <View style={styles.recordsSection}>
        {/* Saved Records Button */}
        <View style={styles.recordItem}>
          <MaterialCommunityIcons name="cloud-check-outline" size={50} color="black" />
          <Text style={styles.recordText}>SAVED RECORDS</Text>
        </View>

        {/* Recently Deleted Records Button - Navigates to the next screen */}
        <TouchableOpacity 
          style={styles.recordItem} 
          onPress={() => navigation.navigate('deletedr')}
        >
          <Ionicons name="trash-outline" size={50} color="black" />
          <Text style={styles.recordText}>RECENTLY DELETED RECORDS</Text>
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
    background: 'linear-gradient(180deg, rgba(127, 34, 34, 1) 0%, rgba(229, 62, 62, 1) 100%)',
    // I tried putting a gradient background to match the figma, but it wouldn't show up.
    padding: 5, 
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'black',
    // The actual image uses a different shape, but this is a close approximation
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
    fontFamily: 'serif', // Trying to match the font style from the image
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
  recordsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 50,
    paddingHorizontal: 20,
  },
  recordItem: {
    alignItems: 'center',
    width: '40%',
  },
  recordText: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 12,
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

export default MainProfileScreen;