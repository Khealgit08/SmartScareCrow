import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  Image,
  Pressable,
} from "react-native";
import MenuAndWidgetPanel from "../components/MenuAndWidgetPanel";
import { useRecording, CapturedRecord } from "../../contexts/RecordingContext";

export default function RealtimeR(): React.ReactElement {
  const { records, saveRecord, moveToDeleted } = useRecording();
  const [selectedImage, setSelectedImage] = useState<CapturedRecord | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleDownload = (id: string): void => {
    saveRecord(id);
    console.log("Record saved", id);
  };

  const handleSave = (id: string): void => {
    saveRecord(id);
  };

  const handleDelete = (id: string): void => {
    moveToDeleted(id);
  };

  const handleCardPress = (item: CapturedRecord): void => {
    setSelectedImage(item);
    setModalVisible(true);
  };

  const closeModal = (): void => {
    setModalVisible(false);
    setSelectedImage(null);
  };

  const renderItem = ({ item }: { item: CapturedRecord }): React.ReactElement => (
    <TouchableOpacity 
      style={styles.card}
      activeOpacity={0.7}
      onPress={() => handleCardPress(item)}
    >
      <View style={styles.thumbBox}>
        <MaterialIcons name="image" size={26} color="#b36d75" />
      </View>
      <View style={styles.info}>
        <Text style={styles.filename}>{item.objectType}</Text>
        <Text style={styles.timestamp}>{item.dateTime}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.download]}
          onPress={(e) => {
            e.stopPropagation();
            handleDownload(item.id);
          }}
        >
          <MaterialIcons name="download" size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.delete]}
          onPress={(e) => {
            e.stopPropagation();
            handleDelete(item.id);
          }}
        >
          <MaterialIcons name="delete" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <MenuAndWidgetPanel>
      <LinearGradient
        colors={["#ffffff", "#f6e1e5"]}
        style={styles.contentArea}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Real Time Records</Text>
        </View>

        {records.length > 0 ? (
          <FlatList
            data={records}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No detections yet</Text>
            <Text style={styles.emptySubtext}>Captured objects will appear here</Text>
          </View>
        )}
      </LinearGradient>

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
    </MenuAndWidgetPanel>
  );
}

const styles = StyleSheet.create({
  contentArea: {
    flex: 1,
  },
  header: { alignItems: "center", paddingTop: 50, paddingBottom: 16 },
  title: {
    fontSize: 22,
    fontFamily: "AlegreyaSCMedium",
    color: "#222",
    marginVertical: 10,
  },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#faf9f7",
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  thumbBox: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  info: { flex: 1 },
  filename: {
    fontSize: 14,
    fontFamily: "AlegreyaSCMedium",
    color: "#2d2d2d",
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 11,
    color: "#8a8a8a",
  },
  actions: { flexDirection: "row", alignItems: "center" },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  download: { backgroundColor: "#4caf50" },
  delete: { backgroundColor: "#e53e3e" },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: "AlegreyaSCMedium",
    color: "#999",
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: "AlegreyaSC",
    color: "#bbb",
    marginTop: 8,
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
    fontFamily: "AlegreyaSC",
    color: "#999",
  },
  imageInfo: {
    padding: 16,
    backgroundColor: "#fff",
  },
  imageInfoTitle: {
    fontSize: 18,
    fontFamily: "AlegreyaSCMedium",
    color: "#2d2d2d",
    marginBottom: 6,
  },
  imageInfoTime: {
    fontSize: 14,
    fontFamily: "AlegreyaSC",
    color: "#8a8a8a",
  },
});
