import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";

export default function AuthScreen() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState("login");

  return (
    <LinearGradient colors={["#ffffff", "#f8cfd4"]} style={styles.container}>
      <View style={styles.card}>

        {/* Toggle Bar */}
        <View style={styles.toggleWrapper}>
          
          {/* LOG IN */}
          <TouchableOpacity
            style={[
              styles.toggleButton,
              activeTab === "login" ? styles.active : styles.inactive
            ]}
            onPress={() => setActiveTab("login")}
          >
            <Text
              style={[
                styles.toggleText,
                activeTab === "login" ? styles.activeText : styles.inactiveRed
              ]}
            >
              LOG IN
            </Text>
          </TouchableOpacity>

          {/* SIGN UP */}
          <TouchableOpacity
            style={[
              styles.toggleButton,
              activeTab === "signup" ? styles.active : styles.inactive
            ]}
            onPress={() => setActiveTab("signup")}
          >
            <Text
              style={[
                styles.toggleText,
                activeTab === "signup" ? styles.activeText : styles.inactiveRed
              ]}
            >
              SIGN UP
            </Text>
          </TouchableOpacity>
        </View>

        {/* Inputs */}
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

        {/* Google Login Button */}
        <TouchableOpacity style={styles.googleButton}>
          <Image
            source={{
              uri: "https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg",
            }}
            style={styles.googleIcon}
          />
          <Text style={styles.googleText}>Continue with Google</Text>
        </TouchableOpacity>

        {/* Main Button */}
        <TouchableOpacity 
          style={styles.mainButton}
          onPress={() => navigation.navigate("home")}
        >
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
    width: 270,
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
    marginBottom: 20,
  },

  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    justifyContent: "center",
    alignItems: "center",
  },

  active: {
    backgroundColor: "black",
  },

  inactive: {
    backgroundColor: "white",
  },

  toggleText: {
    fontWeight: "bold",
    fontSize: 16,
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
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
    fontSize: 14,
  },

  /* Google Button */
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingVertical: 10,
    borderRadius: 6,
    marginBottom: 15,
    justifyContent: "center",
  },

  googleIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },

  googleText: {
    fontSize: 14,
    color: "#444",
    fontWeight: "600",
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
    fontWeight: "bold",
    color: "#444",
  },
});
