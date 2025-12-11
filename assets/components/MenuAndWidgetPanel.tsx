import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
  PanResponder,
  Alert,
  ScrollView,
  ImageSourcePropType,
} from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import * as Location from "expo-location";
import { fetchWeather } from "../services/weatherService";
import { useDetection } from "../../contexts/DetectionContext";
import { useRecording, CapturedRecord } from "../../contexts/RecordingContext";
import type { RootStackParamList } from "../../navigation.types";

import arrowup from "../image/arrow-up.png";
import menuClosedImg from "../image/menu.png";
import menuExpandedImg from "../image/menuexpand.png";

type MenuNavigationProp = NavigationProp<RootStackParamList>;

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface MenuAndWidgetPanelProps {
  children: React.ReactNode;
}

// Notification Banner Component (separate to use hooks properly)
interface NotificationBannerProps {
  notification: CapturedRecord;
  onRemove: (id: string) => void;
  onPress: () => void;
}

const NotificationBanner: React.FC<NotificationBannerProps> = ({ notification, onRemove, onPress }) => {
  const panX = useRef(new Animated.Value(0)).current;
  
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gesture) => {
        return Math.abs(gesture.dx) > 10;
      },
      onPanResponderMove: (_, gesture) => {
        if (gesture.dx > 0) {
          panX.setValue(gesture.dx);
        }
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > 100) {
          // Swipe right - dismiss without navigation
          Animated.timing(panX, {
            toValue: 300,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            onRemove(notification.id);
          });
        } else {
          // Snap back
          Animated.spring(panX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;
  
  return (
    <Animated.View
      style={[
        { transform: [{ translateX: panX }] },
      ]}
      {...panResponder.panHandlers}
    >
      <TouchableOpacity 
        style={[styles.notif, styles.notifActive]}
        onPress={onPress}
      >
        <Text style={styles.notifLabel}>📸 {notification.objectType}</Text>
        <Text style={styles.notifTime}>{notification.timestamp}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function MenuAndWidgetPanel({
  children,
}: MenuAndWidgetPanelProps): React.ReactElement {
  const navigation = useNavigation<MenuNavigationProp>();
  const { riskLevel, riskCondition, riskColor } = useDetection(); // Global detection state
  const { notifications, removeNotification } = useRecording(); // Recording notifications
  const [widgetsVisible, setWidgetsVisible] = useState<boolean>(false);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [activeOption, setActiveOption] = useState<string | null>(null);
  const [locationText, setLocationText] = useState<string>("My Location");
  const [locationLoading, setLocationLoading] = useState<boolean>(false);
  const [weatherCondition, setWeatherCondition] = useState<string>(
    "Sunny Morning"
  );
  const [weatherIcon, setWeatherIcon] = useState<ImageSourcePropType>(
    require("../image/sunnyday.png")
  );
  const [currentCoords, setCurrentCoords] = useState<Coordinates | null>(null);
  const [weatherLoading, setWeatherLoading] = useState<boolean>(false);
  const [temperatureC, setTemperatureC] = useState<number | null>(null);
  const [humidity, setHumidity] = useState<number | null>(null);
  const [windKph, setWindKph] = useState<number | null>(null);
  const [soilMoisture, setSoilMoisture] = useState<number | null>(null);
  const [soilLoading, setSoilLoading] = useState<boolean>(false);

  const slideAnim = useRef(new Animated.Value(0)).current;
  const menuAnim = useRef(new Animated.Value(0)).current;
  const EXPANDED_WIDTH = 150;
  const CLOSED_WIDTH = EXPANDED_WIDTH * 0.5;
  const OPTION_HEIGHT = 44;

  const updateWeather = async (latitude: number, longitude: number): Promise<void> => {
    try {
      setWeatherLoading(true);
      const {
        condition,
        icon,
        temperatureC: temp,
        humidity: hum,
        windKph: wind,
      } = await fetchWeather(latitude, longitude);
      if (condition) setWeatherCondition(condition);
      if (icon) setWeatherIcon(icon as unknown as ImageSourcePropType);
      if (temp !== undefined) setTemperatureC(temp);
      if (hum !== undefined) setHumidity(hum);
      if (wind !== undefined) setWindKph(wind);
    } catch (error) {
      console.error("Failed to update weather:", error);
    } finally {
      setWeatherLoading(false);
    }
  };

  const handleWeatherPress = async (): Promise<void> => {
    if (currentCoords) {
      await updateWeather(currentCoords.latitude, currentCoords.longitude);
    } else {
      Alert.alert(
        "No Location",
        "Please set your location first to get weather updates."
      );
    }
  };

  const computeSoilMoisture = (temp: number | null, hum: number | null): number => {
    if (temp == null || hum == null) {
      return Math.round(45 + Math.random() * 20);
    }
    const humidityFactor = hum * 0.6;
    const tempDelta = 22 - temp;
    const tempFactor = Math.max(-20, Math.min(20, tempDelta * 2));
    const base = humidityFactor + tempFactor;
    const noise = (Math.random() - 0.5) * 6;
    const value = Math.max(5, Math.min(95, base + noise));
    return Math.round(value);
  };

  const handleSoilPress = async (): Promise<void> => {
    if (!currentCoords) {
      Alert.alert(
        "No Location",
        "Please set your location first to simulate soil moisture."
      );
      return;
    }
    try {
      setSoilLoading(true);
      if (temperatureC == null || humidity == null) {
        await updateWeather(currentCoords.latitude, currentCoords.longitude);
      }
      const value = computeSoilMoisture(temperatureC, humidity);
      setSoilMoisture(value);
    } catch (error) {
      console.error("Soil moisture simulation error:", error);
    } finally {
      setSoilLoading(false);
    }
  };

  const handleLocationPress = async (): Promise<void> => {
    try {
      setLocationLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Location permission is required to access your location."
        );
        setLocationLoading(false);
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      const addresses = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });
      if (addresses && addresses.length > 0) {
        const address = addresses[0];
        const fullAddress = `${address.street || ""} ${address.city || ""} ${
          address.region || ""
        }`.trim();
        setLocationText(fullAddress || "Location Found");
      } else {
        setLocationText(
          `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
        );
      }
      setCurrentCoords({ latitude, longitude });
      await updateWeather(latitude, longitude);
    } catch (error) {
      console.error("Location error:", error);
      Alert.alert("Error", "Could not retrieve location. Please try again.");
    } finally {
      setLocationLoading(false);
    }
  };

  const toggleDropdown = (): void => {
    const toValue = menuOpen ? 0 : 1;
    Animated.timing(menuAnim, {
      toValue,
      duration: 250,
      useNativeDriver: false,
    }).start();
    setMenuOpen(!menuOpen);
  };

  const handleOptionPress = (option: string): void => {
    setActiveOption(option);

    switch (option) {
      case "Home":
        navigation.navigate("home");
        break;
      case "Records":
        navigation.navigate("realtimer");
        break;
      case "Profile":
        navigation.navigate("profile");
        break;
      case "Settings":
        navigation.navigate("settings");
        break;
      default:
        break;
    }

    setMenuOpen(false);
    Animated.timing(menuAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy < -20,
      onPanResponderRelease: () => {
        toggleWidgets();
      },
    })
  ).current;

  const toggleWidgets = (): void => {
    Animated.timing(slideAnim, {
      toValue: widgetsVisible ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setWidgetsVisible(!widgetsVisible);
  };

  const panelTranslateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [670, 0],
  });

  const arrowRotation = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const menuOptions = ["Home", "Records", "Profile", "Settings"];

  return (
    <View style={styles.container}>
      {children}

      {/* Collapsible Menu */}
      <Animated.View
        style={[
          styles.menuContainer,
          {
            height: menuAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [60, 60 + menuOptions.length * OPTION_HEIGHT],
            }),
            width: menuAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [CLOSED_WIDTH, EXPANDED_WIDTH],
            }),
            borderTopRightRadius: menuAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [50, 10],
            }),
            borderBottomRightRadius: menuAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [50, 10],
            }),
          },
        ]}
      >
        <TouchableOpacity
          style={styles.menuHeader}
          onPress={toggleDropdown}
          activeOpacity={0.8}
        >
          <Image
            source={menuOpen ? menuExpandedImg : menuClosedImg}
            style={
              menuOpen ? styles.burgerIconExpanded : styles.burgerIconClosed
            }
            resizeMode="contain"
          />
        </TouchableOpacity>

        <Animated.View
          style={{
            overflow: "hidden",
            height: menuAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, menuOptions.length * OPTION_HEIGHT],
            }),
            opacity: menuAnim,
          }}
        >
          {menuOptions.map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.menuOptions,
                activeOption === option && styles.activeMenuOption,
              ]}
              onPress={() => handleOptionPress(option)}
            >
              <Text style={styles.menuText}>{option}</Text>
            </TouchableOpacity>
          ))}
        </Animated.View>
      </Animated.View>

      {/* Bottom Swipe Panel */}
      <Animated.View
        style={[styles.bottomPanel, { transform: [{ translateY: panelTranslateY }] }]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity onPress={toggleWidgets} style={styles.arrowButton}>
          <Animated.Image
            source={arrowup}
            style={{
              width: 50,
              height: 50,
              transform: [{ rotate: arrowRotation }],
            }}
            resizeMode="contain"
          />
        </TouchableOpacity>

        <View style={styles.widgetsContainer}>
          <View style={styles.widgetColumnsWrapper}>
            {/* Left Column */}
            <View style={styles.widgetLeftColumn}>
              <View style={styles.widgetRisk}>
                <Text style={styles.widgetRiskLabel}>Risk Level</Text>
                <Text style={[styles.widgetRiskLevel, { color: riskColor }]}>
                  {riskLevel}
                </Text>
                <View style={styles.divider} />
                <Text style={styles.widgetRiskVerdict}>{riskCondition}</Text>
              </View>

              <TouchableOpacity
                style={styles.widgetTemperature}
                onPress={handleWeatherPress}
                disabled={weatherLoading}
                activeOpacity={0.7}
              >
                <Text style={styles.widgetTempLabel}>Temperature</Text>
                <Text style={styles.widgetTempValue}>
                  {temperatureC !== null
                    ? `${temperatureC}°C`
                    : weatherLoading
                      ? "..."
                      : "0°C"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.widgetHumidity}
                onPress={handleWeatherPress}
                disabled={weatherLoading}
                activeOpacity={0.7}
              >
                <Text style={styles.widgetHumidityLabel}>Humidity</Text>
                <Text style={styles.widgetHumidityValue}>
                  {humidity !== null
                    ? `${humidity}%`
                    : weatherLoading
                      ? "..."
                      : "0%"}
                </Text>
                <Text style={styles.widgetWindValue}>
                  {windKph !== null
                    ? `Wind: ${windKph} km/h`
                    : weatherLoading
                      ? "..."
                      : "0 km/h"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.widgetSoil}
                onPress={handleSoilPress}
                disabled={soilLoading}
                activeOpacity={0.7}
              >
                <Text style={styles.widgetSoilLabel}>Soil Moisture</Text>
                <Text style={styles.widgetSoilValue}>
                  {soilMoisture !== null
                    ? `${soilMoisture}%`
                    : soilLoading
                      ? "..."
                      : "0%"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Right Column */}
            <View style={styles.widgetRightColumn}>
              <View style={styles.widgetLocation}>
                <View style={styles.locationArea}>
                  <TouchableOpacity
                    onPress={handleLocationPress}
                    disabled={locationLoading}
                    style={styles.locationIconButton}
                  >
                    <Image
                      source={require("../image/Location.png")}
                      style={styles.locpng}
                    />
                  </TouchableOpacity>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.locationTextScroll}
                    contentContainerStyle={styles.locationTextContent}
                  >
                    <Text style={styles.widgetLocLabel}>
                      {locationLoading ? "Loading..." : locationText}
                    </Text>
                  </ScrollView>
                </View>

                <TouchableOpacity
                  style={styles.weather}
                  onPress={handleWeatherPress}
                  disabled={weatherLoading}
                  activeOpacity={0.7}
                >
                  <Image
                    source={weatherIcon}
                    style={styles.weatherCondition}
                  />
                  <Text style={styles.condition}>
                    {weatherLoading ? "Updating..." : weatherCondition}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.widgetCalendar}>
                <Text style={styles.calendarMonthYear}>
                  {new Date().toLocaleString("en-US", {
                    month: "short",
                    year: "numeric",
                  })}
                </Text>
                <View style={styles.divider2} />
                <View style={styles.calendarGrid}>
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                    (day) => (
                      <Text key={day} style={styles.calendarDayHeader}>
                        {day.slice(0, 1)}
                      </Text>
                    )
                  )}
                  {Array.from({ length: 35 }).map((_, idx) => {
                    const firstDay = new Date(
                      new Date().getFullYear(),
                      new Date().getMonth(),
                      1
                    ).getDay();
                    const daysInMonth = new Date(
                      new Date().getFullYear(),
                      new Date().getMonth() + 1,
                      0
                    ).getDate();
                    const dayNum = idx - firstDay + 1;
                    const today = new Date().getDate();
                    const isToday =
                      dayNum === today &&
                      idx >= firstDay &&
                      idx < firstDay + daysInMonth;
                    const isValidDay = dayNum > 0 && dayNum <= daysInMonth;
                    return (
                      <View
                        key={idx}
                        style={[
                          styles.calendarDateCell,
                          isToday && styles.calendarToday,
                        ]}
                      >
                        {isValidDay && (
                          <Text
                            style={[
                              styles.calendarDate,
                              isToday && styles.calendarTodayText,
                            ]}
                          >
                            {dayNum}
                          </Text>
                        )}
                      </View>
                    );
                  })}
                </View>
              </View>

              <View style={styles.widgetNotifications}>
                <Text style={styles.widgetNotifLabel}>Notifications</Text>
                <ScrollView 
                  horizontal={false}
                  showsVerticalScrollIndicator={false}
                  style={{ maxHeight: 150 }}
                >
                  {notifications.length > 0 && notifications.map((notif, index) => (
                    <NotificationBanner
                      key={`notif-${notif.id}-${index}`}
                      notification={notif}
                      onRemove={removeNotification}
                      onPress={() => {
                        removeNotification(notif.id);
                        navigation.navigate('realtimer');
                      }}
                    />
                  ))}
                </ScrollView>
              </View>
            </View>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  menuContainer: {
    position: "absolute",
    top: 35,
    left: 0,
    backgroundColor: "rgba(217,217,217,0.9)",
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    overflow: "hidden",
    zIndex: 10,
  },
  menuHeader: {
    height: 60,
    justifyContent: "center",
    paddingLeft: 10,
    alignItems: "flex-start",
  },
  burgerIconClosed: {
    width: 30,
    height: 30,
    marginLeft: 2,
  },
  burgerIconExpanded: {
    width: 40,
    height: 40,
  },
  menuOptions: {
    paddingLeft: 14,
    height: 44,
    justifyContent: "center",
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.99)",
  },
  menuText: {
    fontSize: 16,
    fontFamily: "AlegreyaSC",
  },
  activeMenuOption: {
    backgroundColor: "rgba(255, 255, 255, 0.99)",
  },
  bottomPanel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 750,
    backgroundColor: "rgba(217, 217, 217, 0.42)",
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    alignItems: "center",
  },
  arrowButton: {
    marginTop: 15,
    marginBottom: 15,
  },
  widgetsContainer: {
    marginTop: 5,
    alignItems: "center",
  },
  widgetColumnsWrapper: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 2,
  },
  widgetLeftColumn: {
    width: "30%",
    flex: 1,
    alignItems: "flex-start",
  },
  widgetRightColumn: {
    width: "70%",
    flex: 1,
    alignItems: "flex-end",
  },
  widgetRisk: {
    width: 143,
    height: 151,
    backgroundColor: "rgba(255,255,255,1)",
    borderRadius: 10,
    paddingHorizontal: 12,
    alignItems: "center",
    elevation: 2,
    marginBottom: 10,
    marginLeft: 13,
  },
  widgetTemperature: {
    width: 143,
    height: 151,
    backgroundColor: "rgba(255,255,255,1)",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    alignItems: "center",
    elevation: 2,
    marginBottom: 10,
    marginLeft: 13,
  },
  widgetHumidity: {
    width: 143,
    height: 151,
    backgroundColor: "rgba(255,255,255,1)",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    alignItems: "center",
    elevation: 2,
    marginBottom: 10,
    marginLeft: 13,
  },
  widgetSoil: {
    width: 143,
    height: 151,
    backgroundColor: "rgba(255,255,255,1)",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    alignItems: "center",
    elevation: 2,
    marginBottom: 10,
    marginLeft: 13,
  },
  widgetLocation: {
    width: 233,
    height: 151,
    backgroundColor: "rgba(255,255,255,1)",
    borderRadius: 10,
    marginBottom: 10,
    marginRight: 13,
    elevation: 2,
  },
  widgetCalendar: {
    width: 233,
    height: 226,
    backgroundColor: "rgba(255,255,255,1)",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    alignItems: "center",
    marginBottom: 10,
    marginRight: 13,
    elevation: 2,
  },
  widgetNotifications: {
    width: 233,
    height: 236,
    backgroundColor: "rgba(255,255,255,1)",
    borderRadius: 10,
    marginBottom: 10,
    marginRight: 13,
    elevation: 2,
  },
  widgetRiskLabel: {
    fontSize: 13,
    fontFamily: "AlegreyaSC",
    color: "#000000ff",
    marginTop: 8,
    marginBottom: 6,
  },
  widgetRiskLevel: {
    fontSize: 25,
    fontFamily: "AlegreyaSCMedium",
    color: "#2ABD1D",
  },
  divider: {
    height: 2,
    width: "85%",
    backgroundColor: "rgba(0, 0, 0, 1)",
    marginVertical: 8,
  },
  widgetRiskVerdict: {
    fontSize: 12,
    fontFamily: "AlegreyaSCMedium",
    color: "#000000ff",
    marginTop: 6,
  },
  widgetTempLabel: {
    fontSize: 13,
    fontFamily: "AlegreyaSC",
    color: "#000000ff",
    marginTop: 10,
    marginBottom: 6,
  },
  widgetTempValue: {
    marginTop: 6,
    fontSize: 50,
    fontFamily: "Akshar",
  },
  widgetHumidityLabel: {
    fontSize: 13,
    fontFamily: "AlegreyaSC",
    color: "#000000ff",
    marginTop: 10,
    marginBottom: 6,
  },
  widgetHumidityValue: {
    marginTop: 6,
    fontSize: 50,
    fontFamily: "Akshar",
  },
  widgetWindValue: {
    fontSize: 11,
    fontFamily: "AlegreyaSC",
    color: "#000000ff",
    marginTop: 5,
    marginBottom: 5,
  },
  widgetSoilLabel: {
    fontSize: 13,
    fontFamily: "AlegreyaSC",
    color: "#000000ff",
    marginTop: 10,
    marginBottom: 6,
  },
  widgetSoilValue: {
    marginTop: 6,
    fontSize: 50,
    fontFamily: "Akshar",
  },
  locationArea: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 8,
    paddingHorizontal: 8,
  },
  locationIconButton: {
    marginRight: 5,
  },
  locpng: {
    width: 30,
    height: 30,
  },
  locationTextScroll: {
    flex: 1,
    maxHeight: 40,
  },
  locationTextContent: {
    alignItems: "center",
  },
  widgetLocLabel: {
    fontSize: 12,
    fontFamily: "AlegreyaSC",
    color: "#000000ff",
    paddingTop: 4,
  },
  weather: {
    alignItems: "center",
  },
  weatherCondition: {
    width: 120,
    height: 80,
    alignSelf: "center",
  },
  condition: {
    fontSize: 12,
    fontFamily: "AlegreyaSCMedium",
    color: "#000000ff",
    alignSelf: "center",
  },
  calendarMonthYear: {
    fontSize: 14,
    fontFamily: "AlegreyaSCMedium",
    color: "#222",
    marginBottom: 8,
    textAlign: "center",
  },
  divider2: {
    width: "95%",
    height: 2,
    backgroundColor: "rgba(0, 0, 0, 1)",
  },
  calendarGrid: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    width: "100%",
  },
  calendarDayHeader: {
    width: "14.28%",
    textAlign: "center",
    fontSize: 14,
    fontFamily: "AlegreyaSCMedium",
    color: "#666",
    marginTop: 5,
    marginBottom: 4,
  },
  calendarDateCell: {
    width: "14.28%",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 4,
    marginBottom: 2,
  },
  calendarToday: {
    backgroundColor: "#2563EB",
    borderRadius: 100,
  },
  calendarDate: {
    fontSize: 14,
    fontFamily: "AlegreyaSC",
    color: "#333",
  },
  calendarTodayText: {
    color: "#fff",
    fontFamily: "AlegreyaSC",
  },
  widgetNotifLabel: {
    fontSize: 18,
    fontFamily: "AlegreyaSCMedium",
    color: "#000000ff",
    alignSelf: "center",
  },
  notif: {
    backgroundColor: "rgba(217, 217, 217, 1)",
    paddingVertical: 6,
    paddingLeft: 8,
    paddingRight: 8,
    marginHorizontal: 6,
    marginBottom: 6,
    borderRadius: 6,
    alignItems: "flex-start",
    minHeight: 45,
  },
  notifActive: {
    backgroundColor: "rgba(34, 197, 94, 0.2)",
    borderLeftWidth: 4,
    borderLeftColor: "#22C55E",
  },
  notifLabel: {
    fontFamily: "Alef",
  },
  notifTime: {
    fontFamily: "AlegreyaSC",
    fontSize: 10,
    color: "#666",
    marginTop: 2,
  },
});
