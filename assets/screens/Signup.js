import React, { useRef, useState } from "react";
import { View, TouchableOpacity, StyleSheet, Text, PanResponder, Animated, Dimensions} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CameraView, useCameraPermissions } from "expo-camera";

export default function CameraScreen() {
  const {height} = Dimensions.get('window');
  const camRef = useRef(null);

  // Handle camera permissions
  const [permission, requestPermission] = useCameraPermissions();

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>Camera access required</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={{ color: "white" }}>Allow Camera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Capture photo
  const takePicture = async () => {
    if (camRef.current) {
      const photo = await camRef.current.takePictureAsync();
      console.log("📸 Photo captured:", photo.uri);
    }
  };

  return (
    <View style={styles.container}>
      {/* Live camera preview */}
      <CameraView
        ref={camRef}
        style={styles.camera}
        facing="back"  // or "front"
      />

      {/* Capture button */}
      <View style={styles.captureContainer}>
        <TouchableOpacity style={styles.captureButton} onPress={takePicture} />
      </View>
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  camera: { flex: 1 },
  captureContainer: {
    position: "absolute",
    bottom: 40,
    width: "100%",
    alignItems: "center",
  },
  captureButton: {
    width: 50,
    height: 50,
    borderRadius: 50,
    backgroundColor: "white",
    borderWidth: 3,
    borderColor: "#333",
    opacity: 0.9,
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  permissionText: {
    color: "white",
    fontSize: 16,
    marginBottom: 10,
  },
  permissionButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#444",
    borderRadius: 8,
  },
});
