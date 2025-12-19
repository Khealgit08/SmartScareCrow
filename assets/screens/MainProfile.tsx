import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Image, Alert } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import MenuAndWidgetPanel from "../components/MenuAndWidgetPanel";
import type { RootStackParamList } from "../../navigation.types";
import { authService, UserData } from "../../services/authService";
import * as ImagePicker from "expo-image-picker";
import { useDetection } from "../../contexts/DetectionContext";

type MainProfileNavigationProp = NavigationProp<RootStackParamList, "profile">;

export default function MainProfileScreen(): React.ReactElement {
  const navigation = useNavigation<MainProfileNavigationProp>();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const { stopDetection } = useDetection();

  useEffect(() => {
    loadUserData();
    loadProfilePicture();
  }, []);

  const loadUserData = async () => {
    try {
      const data = await authService.getUserData();
      setUserData(data);
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadProfilePicture = async () => {
    try {
      const uri = await authService.getProfilePicture();
      setProfilePicture(uri);
    } catch (error) {
      console.error("Error loading profile picture:", error);
    }
  };

  const pickImage = async () => {
    try {
      // Request media library permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Sorry, we need camera roll permissions to upload a profile picture.'
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaType.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;
        
        // Save profile picture
        await authService.saveProfilePicture(uri);
        setProfilePicture(uri);
        
        Alert.alert('Success', 'Profile picture updated!');
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert('Error', 'Failed to upload profile picture. Please try again.');
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await authService.getToken();
              
              // Stop AI detection before logging out
              stopDetection();
              
              await authService.logout(token || undefined);
              
              // DO NOT clear profile picture - it should persist for this account
              // Profile picture is tied to user and will reload on next login
              
              Alert.alert('Logged Out', 'You have been logged out successfully. Your data is saved and will be restored when you log back in.', [
                { text: 'OK', onPress: () => navigation.navigate('login') }
              ]);
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ]
    );
  };

  const displayName = userData 
    ? `${userData.first_name} ${userData.last_name}`.trim() || userData.email || userData.username
    : "USERNAME";

  return (
    <MenuAndWidgetPanel>
      <View style={styles.container}>
        {/* Logout Button */}
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={24} color="#E53E3E" />
        </TouchableOpacity>

        <View style={styles.profileSection}>
          <TouchableOpacity 
            style={styles.profileIconContainer}
            onPress={pickImage}
            activeOpacity={0.7}
          >
            {profilePicture ? (
              <Image source={{ uri: profilePicture }} style={styles.profileImage} />
            ) : (
              <Ionicons name="person-circle-outline" size={90} color="black" />
            )}
            <View style={styles.plusIcon}>
              <Ionicons name="add-circle" size={24} color="green" />
            </View>
          </TouchableOpacity>
          {loading ? (
            <ActivityIndicator size="small" color="black" style={styles.loader} />
          ) : (
            <>
              <Text style={styles.usernameText}>{displayName}</Text>
              {userData?.id_number && (
                <Text style={styles.idNumberText}>ID: {userData.id_number}</Text>
              )}
            </>
          )}
        </View>

        <View style={styles.divider} />

        <View style={styles.recordsSection}>
          <TouchableOpacity
            style={styles.recordItem}
            onPress={() => navigation.navigate("savedr")}
          >
            <MaterialCommunityIcons
              name="cloud-check-outline"
              size={50}
              color="black"
            />
            <Text style={styles.recordText}>SAVED RECORDS</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.recordItem}
            onPress={() => navigation.navigate("deletedr")}
          >
            <Ionicons name="trash-outline" size={50} color="black" />
            <Text style={styles.recordText}>RECENTLY DELETED RECORDS</Text>
          </TouchableOpacity>
        </View>
      </View>
    </MenuAndWidgetPanel>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(246, 238, 238, 0.85)",
    paddingTop: 50,
  },
  logoutButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    marginTop: 25,
    zIndex: 10,
    padding: 8,
    backgroundColor: 'white',
    borderRadius: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  profileSection: {
    alignItems: "center",
    marginTop: 20,
  },
  profileIconContainer: {
    position: "relative",
  },
  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: "black",
  },
  plusIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
  },
  usernameText: {
    fontSize: 20,
    fontWeight: "bold",
    fontFamily: "AlegreyaSCMedium",
    marginTop: 5,
    marginBottom: 5,
  },
  idNumberText: {
    fontSize: 14,
    fontFamily: "AlegreyaSC",
    color: "#666",
    marginBottom: 20,
  },
  loader: {
    marginTop: 10,
    marginBottom: 20,
  },
  divider: {
    borderBottomColor: "black",
    borderBottomWidth: 1,
    width: "90%",
    alignSelf: "center",
    marginVertical: 10,
  },
  recordsSection: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 50,
    paddingHorizontal: 20,
  },
  recordItem: {
    alignItems: "center",
    width: "40%",
  },
  recordText: {
    textAlign: "center",
    marginTop: 8,
    fontSize: 12,
    fontWeight: "bold",
    fontFamily: "AlegreyaSC",
  },
});
