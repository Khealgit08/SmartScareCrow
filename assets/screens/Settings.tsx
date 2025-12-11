import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  PanResponder,
  Animated,
  Alert,
} from "react-native";
import { Audio } from 'expo-av';
import * as DocumentPicker from 'expo-document-picker';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MenuAndWidgetPanel from "../components/MenuAndWidgetPanel";
import { useRecording } from "../../contexts/RecordingContext";
import { authService } from "../../services/authService";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import FontAwesome from '@expo/vector-icons/FontAwesome';

interface AlertSound {
  id: string;
  name: string;
  uri?: string;
  isCustom: boolean;
}

interface UserSettings {
  volumeLevel: number;
  selectedSoundId: string;
  alertSounds: AlertSound[];
  geoEnabled: boolean;
  connectedDevices: string[];
  anchorLocation: Location.LocationObject | null;
}

const getSettingsKey = (userId: number | null) => {
  return userId ? `@settings_${userId}` : `@settings_guest`;
};

export default function Settings(): React.ReactElement {
  const [geoEnabled, setGeoEnabled] = useState<boolean>(false);
  const [sliderWidth, setSliderWidth] = useState<number>(300);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  // Devices
  const [availableDevices, setAvailableDevices] = useState<string[]>([]);
  const [connectedDevices, setConnectedDevices] = useState<string[]>([]);

  // Geofencing state
  const [anchorLocation, setAnchorLocation] = useState<Location.LocationObject | null>(null);
  const [geofenceBreached, setGeofenceBreached] = useState<boolean>(false);
  const geofenceRadiusMeters = 50;
  const locationSubRef = useRef<Location.LocationSubscription | null>(null);

  const { addRecord, setAlertVolume, setAlertSoundUri } = useRecording();

  // Alert sounds state
  const [selectedSoundId, setSelectedSoundId] = useState<string>("sound1");
  const [alertSounds, setAlertSounds] = useState<AlertSound[]>([
    { id: "sound1", name: "Notification Bell", isCustom: false },
    { id: "sound2", name: "Alert Chime", isCustom: false },
    { id: "sound3", name: "Alarm Beep", isCustom: false },
    { id: "sound4", name: "Warning Tone", isCustom: false },
    { id: "sound5", name: "Gentle Ring", isCustom: false },
  ]);
  const soundRef = useRef<Audio.Sound | null>(null);

  // Sound URIs
  const builtInSoundUris: { [key: string]: any } = {
    sound1: { uri: 'https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg' },
    sound2: { uri: 'https://actions.google.com/sounds/v1/alarms/beep_short.ogg' },
    sound3: { uri: 'https://actions.google.com/sounds/v1/alarms/bugle_tune.ogg' },
    sound4: { uri: 'https://actions.google.com/sounds/v1/alarms/medium_bell_ringing_near.ogg' },
    sound5: { uri: 'https://actions.google.com/sounds/v1/cartoon/siren_whistle.ogg' },
  };

  // Volume control state
  const [volumeLevel, setVolumeLevel] = useState<number>(2);
  const dotPositions = [0, 0.25, 0.5, 0.75, 1];
  const volumePercentages = [20, 40, 60, 80, 100];

  const pan = useRef(new Animated.Value(0)).current;
  const panOffset = useRef(0);
  const currentPanValue = useRef(0);

  // Load user settings on mount AND when screen comes into focus
  useEffect(() => {
    loadUserSettings();
  }, []);

  // Reload settings every time the screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log('⚡ Settings screen focused, reloading settings...');
      loadUserSettings();
    }, [])
  );

  // Save settings whenever they change
  useEffect(() => {
    if (currentUserId !== null) {
      saveUserSettings();
    }
  }, [volumeLevel, selectedSoundId, alertSounds, geoEnabled, connectedDevices, anchorLocation, currentUserId]);

  const loadUserSettings = async () => {
    try {
      const userData = await authService.getUserData();
      const userId = userData?.id || null;
      
      console.log('🔄 Loading settings for user ID:', userId);
      setCurrentUserId(userId);

      if (userId) {
        const settingsKey = getSettingsKey(userId);
        const settingsJson = await AsyncStorage.getItem(settingsKey);
        
        if (settingsJson) {
          const settings: UserSettings = JSON.parse(settingsJson);
          console.log('📥 Loaded settings:', settings);
          
          setVolumeLevel(settings.volumeLevel);
          setSelectedSoundId(settings.selectedSoundId);
          setAlertSounds(settings.alertSounds);
          setGeoEnabled(settings.geoEnabled);
          setConnectedDevices(settings.connectedDevices);
          setAnchorLocation(settings.anchorLocation);

          // Restart geofencing if it was enabled
          if (settings.geoEnabled && settings.anchorLocation) {
            restartGeofencing(settings.anchorLocation);
          }
          
          console.log('✅ Settings loaded successfully');
        } else {
          console.log('📥 No settings found, using defaults');
        }
      }
    } catch (error) {
      console.error('❌ Error loading user settings:', error);
    }
  };

  const saveUserSettings = async () => {
    try {
      if (currentUserId) {
        const settings: UserSettings = {
          volumeLevel,
          selectedSoundId,
          alertSounds,
          geoEnabled,
          connectedDevices,
          anchorLocation,
        };
        
        const settingsKey = getSettingsKey(currentUserId);
        await AsyncStorage.setItem(settingsKey, JSON.stringify(settings));
        console.log('✅ Settings saved for user:', currentUserId);
      }
    } catch (error) {
      console.error('Error saving user settings:', error);
    }
  };

  const restartGeofencing = async (anchor: Location.LocationObject) => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setGeoEnabled(false);
        return;
      }

      setAnchorLocation(anchor);
      setGeofenceBreached(false);

      if (locationSubRef.current) {
        locationSubRef.current.remove();
      }

      const sub = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 5000,
          distanceInterval: 5,
        },
        (pos) => {
          if (!anchor) return;
          const dist = distanceMeters(
            anchor.coords.latitude,
            anchor.coords.longitude,
            pos.coords.latitude,
            pos.coords.longitude
          );

          if (dist > geofenceRadiusMeters && !geofenceBreached) {
            setGeofenceBreached(true);
            const now = new Date();
            addRecord({
              id: `geofence-${now.getTime()}`,
              objectType: 'Geofence Alert',
              timestamp: now.toISOString(),
              dateTime: now.toLocaleString(),
            });
            Alert.alert('Geofence Alert', 'Device left the virtual boundary.');
          }

          if (dist <= geofenceRadiusMeters && geofenceBreached) {
            setGeofenceBreached(false);
          }
        }
      );

      locationSubRef.current = sub;
    } catch (error) {
      console.error('Error restarting geofencing:', error);
    }
  };

  // ...existing code for pan responder initialization...
  useEffect(() => {
    if (sliderWidth > 0) {
      const initialValue = dotPositions[volumeLevel] * sliderWidth;
      pan.setValue(initialValue);
      currentPanValue.current = initialValue;
    }
  }, [sliderWidth, volumeLevel, pan]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        panOffset.current = currentPanValue.current;
      },
      onPanResponderMove: (_, gestureState) => {
        const newPosition = panOffset.current + gestureState.dx;
        const clampedValue = Math.max(0, Math.min(sliderWidth, newPosition));
        pan.setValue(clampedValue);
      },
      onPanResponderRelease: (_, gestureState) => {
        const finalPosition = panOffset.current + gestureState.dx;
        const clampedPosition = Math.max(0, Math.min(sliderWidth, finalPosition));
        currentPanValue.current = clampedPosition;
        
        let nearestIndex = 0;
        let minDistance = Math.abs((clampedPosition / sliderWidth) - dotPositions[0]);
        dotPositions.forEach((pos, index) => {
          const distance = Math.abs((clampedPosition / sliderWidth) - pos);
          if (distance < minDistance) {
            minDistance = distance;
            nearestIndex = index;
          }
        });
        
        const snappedPosition = dotPositions[nearestIndex] * sliderWidth;
        pan.setValue(snappedPosition);
        currentPanValue.current = snappedPosition;
        setVolumeLevel(nearestIndex);
      },
    })
  ).current;

  // ...existing helper functions...
  const distanceMeters = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const toRad = (v: number) => (v * Math.PI) / 180;
    const R = 6371000;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const startGeofencing = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Location permission is needed for geofencing.');
        setGeoEnabled(false);
        return;
      }

      const current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setAnchorLocation(current);
      setGeofenceBreached(false);

      if (locationSubRef.current) {
        locationSubRef.current.remove();
        locationSubRef.current = null;
      }

      const sub = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 5000,
          distanceInterval: 5,
        },
        (pos) => {
          if (!current) return;
          const dist = distanceMeters(
            current.coords.latitude,
            current.coords.longitude,
            pos.coords.latitude,
            pos.coords.longitude
          );

          if (dist > geofenceRadiusMeters && !geofenceBreached) {
            setGeofenceBreached(true);
            const now = new Date();
            addRecord({
              id: `geofence-${now.getTime()}`,
              objectType: 'Geofence Alert',
              timestamp: now.toISOString(),
              dateTime: now.toLocaleString(),
            });
            Alert.alert('Geofence Alert', 'Device left the virtual boundary. Possible theft detected.');
          }

          if (dist <= geofenceRadiusMeters && geofenceBreached) {
            setGeofenceBreached(false);
          }
        }
      );

      locationSubRef.current = sub;
    } catch (error) {
      console.error('Geofencing error', error);
      Alert.alert('Geofencing Error', 'Unable to start geofencing.');
      setGeoEnabled(false);
    }
  };

  const stopGeofencing = () => {
    if (locationSubRef.current) {
      locationSubRef.current.remove();
      locationSubRef.current = null;
    }
    setAnchorLocation(null);
    setGeofenceBreached(false);
  };

  useEffect(() => {
    return () => {
      stopGeofencing();
    };
  }, []);

  useEffect(() => {
    const volumePercentage = volumePercentages[volumeLevel];
    setAlertVolume(volumePercentage);
  }, [volumeLevel, setAlertVolume]);

  useEffect(() => {
    let soundUri: string | null = null;
    
    const builtInSound = builtInSoundUris[selectedSoundId];
    if (builtInSound) {
      soundUri = builtInSound.uri;
    } else {
      const customSound = alertSounds.find(s => s.id === selectedSoundId);
      if (customSound && customSound.uri) {
        soundUri = customSound.uri;
      }
    }
    
    if (soundUri) {
      setAlertSoundUri(soundUri);
    }
  }, [selectedSoundId, alertSounds, setAlertSoundUri, builtInSoundUris]);

  const playSound = async (soundId: string) => {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
      });

      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      const sound = alertSounds.find(s => s.id === soundId);
      
      let soundSource;
      if (sound?.isCustom && sound.uri) {
        soundSource = { uri: sound.uri };
      } else if (builtInSoundUris[soundId]) {
        soundSource = builtInSoundUris[soundId];
      }

      if (soundSource) {
        const currentVolume = volumePercentages[volumeLevel] / 100;
        const { sound: newSound } = await Audio.Sound.createAsync(
          soundSource,
          { shouldPlay: true, volume: currentVolume }
        );
        soundRef.current = newSound;
        
        newSound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            newSound.unloadAsync();
            soundRef.current = null;
          }
        });
      }

      setSelectedSoundId(soundId);
    } catch (error) {
      console.error('Error playing sound:', error);
      Alert.alert('Sound Error', 'Unable to play sound. Please check your device volume.');
      setSelectedSoundId(soundId);
    }
  };

  const addCustomSound = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      const file = result.assets[0];
      
      const newSound: AlertSound = {
        id: `custom-${Date.now()}`,
        name: file.name,
        uri: file.uri,
        isCustom: true,
      };

      setAlertSounds(prev => [...prev, newSound]);
      setSelectedSoundId(newSound.id);
      setAlertSoundUri(file.uri);
      Alert.alert('Success', 'Custom sound added and selected successfully!');
    } catch (error) {
      console.error('Error picking sound:', error);
      Alert.alert('Error', 'Failed to add custom sound');
    }
  };

  return (
    <MenuAndWidgetPanel>
      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 200 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* CONNECTED DEVICES */}
        <Text style={styles.sectionTitle}>Connected ScraeCrow Devices</Text>
        <View style={styles.divider} />

        {connectedDevices.length > 0 ? (
          connectedDevices.map((name, i) => (
            <View key={i} style={styles.deviceRow}>
              <MaterialIcons name="device-hub" size={24} color="black" />
              <Text style={styles.deviceName}>{name}</Text>
              <TouchableOpacity style={styles.deleteButton} onPress={() => setConnectedDevices(prev => prev.filter(d => d !== name))}>
                <MaterialCommunityIcons name="connection" size={24} color="green" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteButton} onPress={() => setConnectedDevices(prev => prev.filter(d => d !== name))}>
                <MaterialIcons name="delete" size={24} color="red" />
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <View style={styles.emptyDevices}>
            <Text style={styles.emptyText}>No devices connected</Text>
          </View>
        )}

        {/* AVAILABLE DEVICES (Bluetooth scan) */}
        <View style={{ marginTop: 16 }}>
          <Text style={styles.sectionTitle}>Available Devices</Text>
          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.scanButton}
            onPress={() => setAvailableDevices(["Crow BT-01", "Crow BT-02", "Crow BT-03"])}
          >
            <Text style={styles.scanText}>
                <FontAwesome name="refresh" size={22} color="white" />  Scan</Text>
          </TouchableOpacity>

          {availableDevices.length > 0 ? (
            availableDevices.map((name, i) => (
              <View key={`avail-${i}`} style={styles.deviceRow}>
              <MaterialIcons name="device-hub" size={24} color="black" />
                <Text style={styles.deviceName}>{name}</Text>
                <TouchableOpacity
                  style={styles.connectButton}
                  onPress={() => {
                    setConnectedDevices(prev => prev.includes(name) ? prev : [...prev, name]);
                    setAvailableDevices(prev => prev.filter(d => d !== name));
                  }}
                >
                  <Text style={{ color: "white", fontFamily: "AlegreyaSC" }}>Connect</Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <View style={styles.emptyDevices}>
              <Text style={styles.emptyText}>No nearby devices found</Text>
            </View>
          )}
        </View>

        {/* ALERT PREFERENCE */}
        <Text style={styles.sectionTitle}>Alert Preference</Text>
        <View style={styles.divider} />

        <Text style={styles.subTitle}>Alert Volume</Text>

        {/* Interactive slider with draggable white dot */}
        <View 
          style={styles.sliderContainer}
          onLayout={(event) => {
            const { width } = event.nativeEvent.layout;
            setSliderWidth(width);
          }}
        >
          {/* Continuous horizontal line */}
          <View style={styles.sliderLine} />
          
          {/* Black dots and labels */}
          {dotPositions.map((pos, index) => (
            <View key={`dot-${index}`}>
              <View 
                style={[
                  styles.sliderDot,
                  { left: pos * sliderWidth }
                ]} 
              />
              <Text 
                style={[
                  styles.dotLabel,
                  { left: pos * sliderWidth }
                ]}
              >
                {volumePercentages[index]}%
              </Text>
            </View>
          ))}

          {/* Draggable white dot */}
          <Animated.View
            style={[
              styles.whiteDot,
              {
                transform: [{ translateX: pan }],
              },
            ]}
            {...panResponder.panHandlers}
          />
        </View>

        {/* Display current volume percentage */}
        <View style={styles.volumeDisplayContainer}>
          <Text style={styles.volumeDisplay}>
            Current Volume: {volumePercentages[volumeLevel]}%
          </Text>
        </View>

        {/* Alert Sound */}
        <View style={{ marginTop: 20 }}>
          <Text style={styles.subTitle}>Alert Sound</Text>

          {/* List of alert sounds */}
          {alertSounds.map((sound) => (
            <TouchableOpacity
              key={sound.id}
              style={styles.row}
              onPress={() => playSound(sound.id)}
            >
              <Text style={styles.soundName}>{sound.name}</Text>
              {selectedSoundId === sound.id && (
                <Text style={styles.checkmark}>✔️</Text>
              )}
            </TouchableOpacity>
          ))}

          {/* Add custom sound button */}
          <TouchableOpacity
            style={[styles.row, { marginTop: 10 }]}
            onPress={addCustomSound}
          >
            <Text style={styles.addSound}>➕ Add Alert Sound</Text>
          </TouchableOpacity>
        </View>

        {/* GEOFENCING */}
        <Text style={styles.sectionTitle}>Geofencing</Text>
        <View style={styles.divider} />

        <View style={styles.row}>
          <Text style={styles.subTitle}>Enable/Disable Geofencing</Text>
          <Switch
            value={geoEnabled}
            onValueChange={(value) => {
              setGeoEnabled(value);
              if (value) {
                startGeofencing();
                Alert.alert('Geofencing Enabled', 'Virtual boundary is active. Device leaving the boundary will trigger a theft alert and show in notifications.');
              }
              if (!value) {
                stopGeofencing();
              }
            }}
          />
        </View>
      </ScrollView>
    </MenuAndWidgetPanel>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 100,
    backgroundColor: "rgba(235, 221, 220, 0.85)",
  },
  sectionTitle: {
    marginTop: 20,
    fontSize: 20,
    fontFamily: "AlegreyaSCMedium",
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
  deviceName: { flex: 1, fontSize: 16, fontFamily: "AlegreyaSC" },
  eyeButton: {
    marginRight: 10,
    padding: 6,
  },
  deleteButton: {
    padding: 6,
    borderRadius: 5,
  },
  emptyDevices: {
    paddingVertical: 20,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
    fontFamily: "AlegreyaSC",
  },
  scanButton: {
    backgroundColor: "#a5ccffff",
    paddingVertical: 10,
    borderRadius: 10,
    marginRight: 290,
    alignItems: "center",
    marginBottom: 10,
  },
  scanText: {
    color: "white",
    fontSize: 15,
    fontFamily: "AlegreyaSC",
  },
  connectButton: {
    backgroundColor: "#3eec67ff",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },

  /* ====== ALERT PREFERENCES ====== */
  subTitle: { marginBottom: 10, fontFamily: "AlegreyaSCMedium" },
  sliderContainer: {
    height: 60,
    width: "100%",
    marginVertical: 20,
    position: "relative",
  },
  sliderLine: {
    position: "absolute",
    height: 2,
    width: "100%",
    backgroundColor: "#333",
    top: 20,
  },
  sliderDot: {
    position: "absolute",
    width: 12,
    height: 12,
    backgroundColor: "black",
    borderRadius: 6,
    top: 14,
    marginLeft: -6,
    zIndex: 2,
  },
  dotLabel: {
    position: "absolute",
    fontSize: 11,
    color: "#333",
    top: 32,
    marginLeft: -15,
    width: 30,
    textAlign: "center",
    fontFamily: "AlegreyaSC",
  },
  whiteDot: {
    position: "absolute",
    width: 20,
    height: 20,
    backgroundColor: "white",
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#333",
    top: 10,
    marginLeft: -10,
    zIndex: 3,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  checkmark: { color: "green", marginLeft: 10, fontSize: 18 },
  soundName: { fontSize: 16, color: "#333", fontFamily: "AlegreyaSC" },
  addSound: { fontSize: 16, color: "#007AFF", fontWeight: "500", fontFamily: "AlegreyaSCMedium" },
  volumeDisplayContainer: {
    alignItems: "center",
    marginBottom: 15,
  },
  volumeDisplay: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    fontFamily: "AlegreyaSCMedium",
  },
});
