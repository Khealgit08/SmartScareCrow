import React, { useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useDetection } from "../../contexts/DetectionContext";
import { useRecording } from "../../contexts/RecordingContext";
import MenuAndWidgetPanel from "../components/MenuAndWidgetPanel";

export default function Home(): React.ReactElement {
  const [permission, requestPermission] = useCameraPermissions();
  
  // Use global detection context
  const { detectionEnabled, detections, hasHuman, hasPest, toggleDetection, setOnObjectDetected } = useDetection();
  
  // Use recording context to save captures
  const { addRecord } = useRecording();

  useEffect(() => {
    if (permission?.granted === false) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  // Register detection callback to save captures to real-time records
  useEffect(() => {
    const handleObjectDetected = (objectType: string, imageUri?: string) => {
      const now = new Date();
      const time = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        hour12: true 
      });
      const date = now.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
      });
      
      const record = {
        id: `${Date.now()}`,
        objectType,
        timestamp: time,
        dateTime: `${time} | ${date}`,
        imageUri,
      };
      
      addRecord(record);
      console.log(`📸 Captured: ${objectType} at ${time}`);
    };
    
    if (setOnObjectDetected) {
      setOnObjectDetected(handleObjectDetected);
    }
  }, [setOnObjectDetected, addRecord]);

  return (
    <MenuAndWidgetPanel>
      <CameraView style={styles.camera} facing="back" />
      
      {/* AI Detection Overlay */}
      <View style={styles.detectionOverlay}>
        {/* Detection Toggle Button */}
        <TouchableOpacity 
          style={[
            styles.detectionButton,
            detectionEnabled ? styles.detectionButtonActive : styles.detectionButtonInactive
          ]}
          onPress={toggleDetection}
        >
          <Text style={styles.detectionButtonText}>
            {detectionEnabled ? '🤖 AI ON' : '🤖 AI OFF'}
          </Text>
        </TouchableOpacity>
        
        {/* Detection Status */}
        {detectionEnabled && (
          <View style={styles.detectionStatus}>
            <View style={[
              styles.statusIndicator,
              hasPest ? styles.statusDanger : hasHuman ? styles.statusWarning : styles.statusSafe
            ]}>
              <Text style={styles.statusText}>
                {hasPest ? '🚨 PEST DETECTED' : hasHuman ? '👤 HUMAN' : '✓ CLEAR'}
              </Text>
            </View>
            
            {/* Detection count */}
            {detections.length > 0 && (
              <View style={styles.detectionCount}>
                <Text style={styles.detectionCountText}>
                  {detections.length} object(s) detected
                </Text>
              </View>
            )}
          </View>
        )}
        
        {/* Bounding boxes for detections */}
        {detectionEnabled && detections.map((detection, index) => (
          <View
            key={index}
            style={[
              styles.boundingBox,
              {
                left: `${detection.bbox.x}%`,
                top: `${detection.bbox.y}%`,
                width: `${detection.bbox.width}%`,
                height: `${detection.bbox.height}%`,
              },
            ]}
          >
            <Text style={styles.boundingBoxLabel}>
              {detection.class} ({Math.round(detection.score * 100)}%)
            </Text>
          </View>
        ))}
      </View>
    </MenuAndWidgetPanel>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  camera: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  detectionOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: "box-none",
  },
  detectionButton: {
    position: "absolute",
    top: 10,
    right: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    elevation: 5,
    zIndex: 100,
  },
  detectionButtonActive: {
    backgroundColor: "rgba(34, 197, 94, 0.9)",
  },
  detectionButtonInactive: {
    backgroundColor: "rgba(100, 100, 100, 0.9)",
  },
  detectionButtonText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "AlegreyaSCMedium",
  },
  detectionStatus: {
    position: "absolute",
    top: 60,
    right: 10,
    alignItems: "flex-end",
    zIndex: 100,
  },
  statusIndicator: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
    elevation: 5,
    marginBottom: 5,
  },
  statusSafe: {
    backgroundColor: "rgba(34, 197, 94, 0.9)",
  },
  statusWarning: {
    backgroundColor: "rgba(234, 179, 8, 0.9)",
  },
  statusDanger: {
    backgroundColor: "rgba(239, 68, 68, 0.9)",
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "AlegreyaSCMedium",
  },
  detectionCount: {
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
  },
  detectionCountText: {
    color: "#fff",
    fontSize: 11,
    fontFamily: "AlegreyaSC",
  },
  boundingBox: {
    position: "absolute",
    borderWidth: 3,
    borderColor: "#22c55e",
    borderRadius: 5,
  },
  boundingBoxLabel: {
    position: "absolute",
    top: -20,
    left: 0,
    backgroundColor: "rgba(34, 197, 94, 0.9)",
    color: "#fff",
    fontSize: 10,
    fontFamily: "AlegreyaSCMedium",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
  },
});
