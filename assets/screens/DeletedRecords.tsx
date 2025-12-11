import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Image,
  Pressable,
} from "react-native";
import { Ionicons, Feather, MaterialIcons } from "@expo/vector-icons";
import { useNavigation, NavigationProp, useFocusEffect } from "@react-navigation/native";
import MenuAndWidgetPanel from "../components/MenuAndWidgetPanel";
import { useRecording, CapturedRecord } from "../../contexts/RecordingContext";
import type { RootStackParamList } from "../../navigation.types";
import { authService, UserData } from "../../services/authService";

type DeletedRecordsNavigationProp = NavigationProp<
  RootStackParamList,
  "deletedr"
>;

export default function DeletedR(): React.ReactElement {
  const navigation = useNavigation<DeletedRecordsNavigationProp>();
  const { deletedRecords, restoreToSaved, clearDeletedRecords } = useRecording();
  const [selectedImage, setSelectedImage] = useState<CapturedRecord | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      console.log('⚡ Deleted Records screen focused, reloading data...');
      loadUserData();
    }, [])
  );

  const loadUserData = async () => {
    try {
      const data = await authService.getUserData();
      const picture = await authService.getProfilePicture();
      setUserData(data);
      setProfilePicture(picture);
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const displayName = userData 
    ? `${userData.first_name} ${userData.last_name}`.trim() || userData.email || userData.username
    : "Username";

  const handleCardPress = (item: CapturedRecord): void => {
    setSelectedImage(item);
    setModalVisible(true);
  };

  const closeModal = (): void => {
    setModalVisible(false);
    setSelectedImage(null);
  };

  const handleRestore = (id: string): void => {
    restoreToSaved(id);
  };

  const handleDeleteAllPermanently = (): void => {
    clearDeletedRecords();
  };

  return (
    <MenuAndWidgetPanel>
      <View style={styles.container}>
        {/* Profile Header */}
        <View style={styles.profileSection}>
          {profilePicture ? (
            <Image source={{ uri: profilePicture }} style={styles.profileImage} />
          ) : (
            <Ionicons name="person-circle-outline" size={90} color="#000" />
          )}
          <Text style={styles.username}>{displayName}</Text>
        </View>

        {/* Section Title */}
        <TouchableOpacity
          style={styles.sectionRow}
          onPress={() => navigation.navigate("profile")}
        >
          <Ionicons name="chevron-back" size={20} color="#000" />
          <Text style={styles.sectionTitle}>Recently Deleted</Text>
        </TouchableOpacity>

        <View style={styles.line} />

        {/* Deleted items */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 80 }}
        >
          {deletedRecords.length > 0 ? (
            deletedRecords.map((item, index) => (
              <TouchableOpacity 
                style={styles.card}
                key={`deleted-${item.id}-${index}`}
                onPress={() => handleCardPress(item)}
                activeOpacity={0.7}
              >
                <View style={styles.cardContent}>
                  <MaterialIcons name="image" size={20} color="#b36d75" style={{ marginRight: 10 }} />
                  <View style={styles.info}>
                    <Text style={styles.filename}>{item.objectType}</Text>
                    <Text style={styles.timestamp}>{item.dateTime}</Text>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    handleRestore(item.id);
                  }}
                >
                  <MaterialIcons name="restore" size={22} color="#555" />
                </TouchableOpacity>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No deleted records yet</Text>
              <Text style={styles.emptySubtext}>Deleted detections will appear here</Text>
            </View>
          )}
        </ScrollView>

        {/* Delete all permanently button */}
        {deletedRecords.length > 0 && (
          <TouchableOpacity 
            style={styles.deleteAllBtn}
            onPress={handleDeleteAllPermanently}
          >
            <Text style={styles.deleteAllText}>DELETE ALL PERMANENTLY</Text>
          </TouchableOpacity>
        )}

        {/* Image Preview Modal */}
        <Modal
          visible={modalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={closeModal}
        >
          <Pressable 
            style={styles.modalOverlay}
            onPress={closeModal}
          >
            <View style={styles.modalContent}>
              <View style={styles.imagePreviewContainer}>
                {selectedImage?.imageUri ? (
                  <Image 
                    source={{ uri: selectedImage.imageUri }}
                    style={styles.previewImage}
                    resizeMode="contain"
                  />
                ) : (
                  <View style={styles.placeholderImage}>
                    <MaterialIcons name="image" size={80} color="#b36d75" />
                    <Text style={styles.placeholderText}>No image captured</Text>
                  </View>
                )}
                <View style={styles.imageInfo}>
                  <Text style={styles.imageInfoTitle}>{selectedImage?.objectType}</Text>
                  <Text style={styles.imageInfoTime}>{selectedImage?.dateTime}</Text>
                </View>
              </View>
            </View>
          </Pressable>
        </Modal>
      </View>
    </MenuAndWidgetPanel>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(246, 237, 237, 0.85)",
    padding: 20,
  },

  profileSection: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 10,
  },
  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  username: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 5,
    color: "#000",
    fontFamily: "AlegreyaSC",
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
    fontFamily: "AlegreyaSC",
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

  cardContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  info: {
    flex: 1,
  },

  filename: {
    flex: 1,
    fontWeight: "600",
    fontSize: 13,
    color: "#2d2d2d",
    fontFamily: "AlegreyaSC",
  },

  timestamp: {
    fontSize: 12,
    color: "#8a8a8a",
    marginTop: 4,
    fontFamily: "AlegreyaSC",
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 80,
  },

  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#999",
    fontFamily: "AlegreyaSC",
  },

  emptySubtext: {
    fontSize: 14,
    color: "#bbb",
    marginTop: 8,
    fontFamily: "AlegreyaSC",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalContent: {
    width: "90%",
    maxWidth: 500,
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },

  imagePreviewContainer: {
    width: "100%",
  },

  previewImage: {
    width: "100%",
    height: 400,
    backgroundColor: "#f0f0f0",
  },

  placeholderImage: {
    width: "100%",
    height: 400,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },

  placeholderText: {
    marginTop: 12,
    fontSize: 16,
    color: "#999",
    fontFamily: "AlegreyaSC",
  },

  imageInfo: {
    padding: 16,
    backgroundColor: "#fff",
  },

  imageInfoTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2d2d2d",
    marginBottom: 6,
    fontFamily: "AlegreyaSC",
  },

  imageInfoTime: {
    fontSize: 14,
    color: "#8a8a8a",
    fontFamily: "AlegreyaSC",
  },

  deleteAllBtn: {
    backgroundColor: "#FFE5E5",
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 20,
    alignSelf: "center",
    marginBottom: 80,
  },

  deleteAllText: {
    fontSize: 12,
    color: "#B02222",
    fontWeight: "700",
    fontFamily: "AlegreyaSC",
  },
});
