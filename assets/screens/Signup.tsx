import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function AuthScreen(): React.ReactElement {
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");

  return (
    <LinearGradient colors={["#ffffff", "#f8cfd4"]} style={styles.container}>
      <View style={styles.card}>
        {/* Toggle Bar */}
        <View style={styles.toggleWrapper}>
          {/* LOG IN */}
          <TouchableOpacity
            style={[
              styles.toggleButton,
              activeTab === "login" ? styles.active : styles.inactive,
            ]}
            onPress={() => setActiveTab("login")}
          >
            <Text
              style={[
                styles.toggleText,
                activeTab === "login" ? styles.activeText : styles.inactiveRed,
              ]}
            >
              LOG IN
            </Text>
          </TouchableOpacity>

          {/* SIGN UP */}
          <TouchableOpacity
            style={[
              styles.toggleButton,
              activeTab === "signup" ? styles.active : styles.inactive,
            ]}
            onPress={() => setActiveTab("signup")}
          >
            <Text
              style={[
                styles.toggleText,
                activeTab === "signup" ? styles.activeText : styles.inactiveRed,
              ]}
            >
              SIGN UP
            </Text>
          </TouchableOpacity>
        </View>

        {/* Inputs (same for both now) */}
        <TextInput
          placeholder="Username"
          style={styles.input}
          placeholderTextColor="#999"
        />

        <TextInput
          placeholder="Password"
          secureTextEntry
          style={styles.input}
          placeholderTextColor="#999"
        />

        {/* Button */}
        <TouchableOpacity style={styles.mainButton}>
          <Text style={styles.mainButtonText}>
            {activeTab === "login" ? "Log In" : "Sign Up"}
          </Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  card: {
    width: 300,
    height: 450,
    padding: 20,
    borderRadius: 16,
    backgroundColor: "#f1eaea",
    elevation: 6,
  },

  /* Toggle pill */
  toggleWrapper: {
    flexDirection: "row",
    borderRadius: 30,
    overflow: "hidden",
    backgroundColor: "white",
    marginBottom: 90,
    marginHorizontal: 40,
  },

  toggleButton: {
    flex: 1,
    paddingVertical: 3,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 30,
  },

  active: {
    backgroundColor: "black",
  },

  inactive: {
    backgroundColor: "white",
  },

  toggleText: {
    fontSize: 18,
    fontFamily: "AlegreyaSCMedium",
  },

  activeText: {
    color: "white",
  },

  inactiveRed: {
    color: "#d94d48",
  },

  /* Inputs */
  input: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    fontSize: 14,
    fontFamily: "AlegreyaSC",
  },

  /* Main button */
  mainButton: {
    backgroundColor: "#fafafa",
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 10,
  },

  mainButtonText: {
    fontFamily: "AlegreyaSC",
    color: "#444",
  },
});
