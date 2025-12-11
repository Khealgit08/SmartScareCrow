import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
  Pressable,
} from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import type { RootStackParamList } from "../../navigation.types";
import { authService, GoogleUserInfo } from "../../services/authService";
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

type LoginScreenNavigationProp = NavigationProp<RootStackParamList, "login">;

interface LoginScreenProps {
  navigation?: LoginScreenNavigationProp;
}

export default function AuthScreen(): React.ReactElement {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showGooglePicker, setShowGooglePicker] = useState<boolean>(false);
  
  // Mock Google accounts (simulating device accounts)
  const [googleAccounts] = useState<GoogleUserInfo[]>([
    { email: "user@gmail.com", name: "User Name", given_name: "User", family_name: "Name" },
    { email: "example@gmail.com", name: "Example User", given_name: "Example", family_name: "User" },
  ]);

  const handleLogin = async () => {
    // Validation
    if (!username.trim() || !password.trim()) {
      Alert.alert("Error", "Please enter both ID number and password");
      return;
    }

    setIsLoading(true);

    try {
      console.log("🔐 Attempting login...");
      const authState = await authService.login({
        username: username.trim(),
        password: password.trim(),
      });

      console.log("✅ Login successful!");
      Alert.alert(
        "Welcome!",
        `Hello, ${authState.user?.first_name} ${authState.user?.last_name}!`,
        [
          {
            text: "OK",
            onPress: () => navigation.navigate("home"),
          },
        ]
      );
    } catch (error) {
      console.error("❌ Login error:", error);
      const errorMessage = error instanceof Error ? error.message : "Login failed. Please try again.";
      Alert.alert("Login Failed", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async () => {
    // Validation
    if (!email.trim() || !password.trim() || !firstName.trim() || !lastName.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (!email.includes("@")) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      console.log("📝 Attempting signup...");
      const authState = await authService.signup({
        email: email.trim(),
        password: password.trim(),
        first_name: firstName.trim(),
        last_name: lastName.trim(),
      });

      console.log("✅ Signup successful!");
      Alert.alert(
        "Account Created!",
        `Welcome, ${authState.user?.first_name}! You've been automatically logged in.`,
        [
          {
            text: "Get Started",
            onPress: () => navigation.navigate("home"),
          },
        ]
      );
    } catch (error) {
      console.error("❌ Signup error:", error);
      const errorMessage = error instanceof Error ? error.message : "Signup failed. Please try again.";
      Alert.alert("Signup Failed", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    setShowGooglePicker(true);
  };

  const handleGoogleAccountSelect = async (account: GoogleUserInfo) => {
    setShowGooglePicker(false);
    
    if (activeTab === "login") {
      // Try to login with Google account
      Alert.alert(
        "Sign in with Google",
        `Sign in as ${account.name}?\n\nNote: If this is your first time, you'll need to sign up first.`,
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          {
            text: "Continue",
            onPress: async () => {
              // Prompt for password
              Alert.prompt(
                "Enter Password",
                `Please enter your password for ${account.email}`,
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Sign In",
                    onPress: async (password) => {
                      if (!password) {
                        Alert.alert("Error", "Password is required");
                        return;
                      }

                      setIsLoading(true);
                      try {
                        const authState = await authService.loginWithGoogle(account.email, password);
                        Alert.alert(
                          "Welcome Back!",
                          `Hello, ${authState.user?.first_name}!`,
                          [{ text: "OK", onPress: () => navigation.navigate("home") }]
                        );
                      } catch (error) {
                        const errorMessage = error instanceof Error ? error.message : "";
                        if (errorMessage.includes("Unable to log in") || errorMessage.includes("Invalid")) {
                          Alert.alert(
                            "Account Not Found",
                            "This Google account is not registered. Would you like to sign up?",
                            [
                              { text: "Cancel", style: "cancel" },
                              {
                                text: "Sign Up",
                                onPress: () => {
                                  setActiveTab("signup");
                                  setEmail(account.email);
                                  setFirstName(account.given_name);
                                  setLastName(account.family_name);
                                }
                              }
                            ]
                          );
                        } else {
                          Alert.alert("Error", errorMessage);
                        }
                      } finally {
                        setIsLoading(false);
                      }
                    }
                  }
                ],
                "secure-text"
              );
            }
          }
        ]
      );
    } else {
      // Sign up mode - pre-fill email and name
      setEmail(account.email);
      setFirstName(account.given_name);
      setLastName(account.family_name);
      Alert.alert(
        "Google Account Selected",
        `Email: ${account.email}\n\nPlease enter a password to complete your registration.`
      );
    }
  };

  return (
    <LinearGradient
      colors={["#FFFFFF", "#FFFFFF", "#F9CBCB"]}
      locations={[0, 0.31, 1]}
      style={styles.container}
    >
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
              Log In
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
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>

        {/* Inputs */}
        {activeTab === "login" ? (
          <>
            <TextInput
              placeholder="ID Number"
              style={styles.input}
              underlineColorAndroid="transparent"
              placeholderTextColor="#999"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              keyboardType="default"
              editable={!isLoading}
            />

            <TextInput
              placeholder="Password"
              secureTextEntry
              style={styles.input}
              underlineColorAndroid="transparent"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
              editable={!isLoading}
            />
          </>
        ) : (
          <>
            <TextInput
              placeholder="Email Address"
              style={styles.input}
              underlineColorAndroid="transparent"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!isLoading}
            />

            <TextInput
              placeholder="First Name"
              style={styles.input}
              underlineColorAndroid="transparent"
              placeholderTextColor="#999"
              value={firstName}
              onChangeText={setFirstName}
              autoCapitalize="words"
              editable={!isLoading}
            />

            <TextInput
              placeholder="Last Name"
              style={styles.input}
              underlineColorAndroid="transparent"
              placeholderTextColor="#999"
              value={lastName}
              onChangeText={setLastName}
              autoCapitalize="words"
              editable={!isLoading}
            />

            <TextInput
              placeholder="Password"
              secureTextEntry
              style={styles.input}
              underlineColorAndroid="transparent"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
              editable={!isLoading}
            />
          </>
        )}

        {/* Google Login Button */}
        <TouchableOpacity 
          style={styles.googleButton}
          onPress={handleGoogleSignIn}
          disabled={isLoading}
        >
          <Image
            source={require("../../assets/image/Google__G__logo.png")}
            style={styles.googleIcon}
          />
          <Text style={styles.googleText}>Continue with Google</Text>
        </TouchableOpacity>

        {/* Main Button */}
        <TouchableOpacity
          style={[styles.mainButton, isLoading && styles.mainButtonDisabled]}
          onPress={activeTab === "login" ? handleLogin : handleSignup}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#444" size="small" />
          ) : (
            <Text style={styles.mainButtonText}>
              {activeTab === "login" ? "Sign In Securely" : "Create Account"}
            </Text>
          )}
        </TouchableOpacity>

        {/* Google Account Picker Modal */}
        <Modal
          visible={showGooglePicker}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowGooglePicker(false)}
        >
          <Pressable 
            style={styles.modalOverlay}
            onPress={() => setShowGooglePicker(false)}
          >
            <View style={styles.pickerContainer}>
              <Text style={styles.pickerTitle}>Choose an account</Text>
              <Text style={styles.pickerSubtitle}>
                to continue to SmartScareCrow
              </Text>
              
              <FlatList
                data={googleAccounts}
                keyExtractor={(item) => item.email}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.accountItem}
                    onPress={() => handleGoogleAccountSelect(item)}
                  >
                    <View style={styles.accountAvatar}>
                      <Text style={styles.accountInitial}>
                        {item.given_name[0]}
                      </Text>
                    </View>
                    <View style={styles.accountInfo}>
                      <Text style={styles.accountName}>{item.name}</Text>
                      <Text style={styles.accountEmail}>{item.email}</Text>
                    </View>
                  </TouchableOpacity>
                )}
              />

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowGooglePicker(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Modal>
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
    fontWeight: "bold",
    color: "#444",
  },

  mainButtonDisabled: {
    opacity: 0.5,
  },

  /* Google Account Picker Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  pickerContainer: {
    width: 320,
    maxHeight: 480,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    elevation: 8,
  },

  pickerTitle: {
    fontSize: 20,
    fontFamily: "AlegreyaSCMedium",
    color: "#333",
    textAlign: "center",
    marginBottom: 5,
  },

  pickerSubtitle: {
    fontSize: 13,
    fontFamily: "AlegreyaSC",
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },

  accountItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: "#f9f9f9",
  },

  accountAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#4285F4",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  accountInitial: {
    fontSize: 18,
    fontFamily: "AlegreyaSCMedium",
    color: "white",
  },

  accountInfo: {
    flex: 1,
  },

  accountName: {
    fontSize: 15,
    fontFamily: "AlegreyaSCMedium",
    color: "#333",
    marginBottom: 2,
  },

  accountEmail: {
    fontSize: 13,
    fontFamily: "AlegreyaSC",
    color: "#666",
  },

  cancelButton: {
    paddingVertical: 12,
    borderRadius: 6,
    backgroundColor: "#f1f1f1",
    marginTop: 10,
  },

  cancelButtonText: {
    fontSize: 14,
    fontFamily: "AlegreyaSCMedium",
    color: "#444",
    textAlign: "center",
  },
});
