import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
  Animated,
} from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import type { RootStackParamList } from "../../navigation.types";
import { authService, GoogleUserInfo } from "../../services/authService";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import { useRecording } from "../../contexts/RecordingContext";
import { useDetection } from "../../contexts/DetectionContext";
import { MaterialIcons } from "@expo/vector-icons";

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
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { loadUserRecords } = useRecording();
  const { startDetection } = useDetection();
  
  // Password visibility state
  const [showPassword, setShowPassword] = useState<boolean>(false);
  
  // Error state for user-friendly messages
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [showError, setShowError] = useState<boolean>(false);
  const shakeAnimation = useState(new Animated.Value(0))[0];
  const fadeAnimation = useState(new Animated.Value(0))[0];

  // Generate the redirect URI
  const redirectUri = AuthSession.makeRedirectUri({
    scheme: 'smartcrow',
    path: undefined,
  });

  // --- GOOGLE AUTH REQUEST ---
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: "737038204682-ohnf4aqvj1ia7cld4uh5it5hgn7oa0dn.apps.googleusercontent.com",
    iosClientId: "737038204682-a2g0ph5frglv653f1bhb02no4kl891og.apps.googleusercontent.com",
    scopes: ["profile", "email"],
  });

  useEffect(() => {
    const handleResponse = async () => {
      if (response?.type === "success") {
        const { authentication } = response;
        const accessToken = authentication?.accessToken ?? authentication?.idToken ?? null;
        
        if (!accessToken) {
          console.log("Google Sign-In failed: No access token");
          displayError("Unable to sign in with Google. Please try again.");
          return;
        }

        setIsLoading(true);

        try {
          const userInfoResp = await fetch(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            {
              headers: { Authorization: `Bearer ${accessToken}` },
            }
          );

          if (!userInfoResp.ok) {
            throw new Error("Failed to fetch Google profile.");
          }

          const googleProfile: GoogleUserInfo = await userInfoResp.json();

          try {
            const authState = await (authService as any).loginWithGoogleOAuth?.(
              googleProfile.email,
              accessToken
            );

            if (authState) {
              Alert.alert(
                "Welcome!",
                `Hello, ${authState.user?.first_name ?? googleProfile.name}!`,
                [{ text: "OK", onPress: () => navigation.navigate("home") }]
              );
              return;
            }

            throw new Error("No auth state returned");
          } catch (err: any) {
            const msg = err instanceof Error ? err.message : String(err || "");
            console.log("Google OAuth error:", msg);
            if (msg.toLowerCase().includes("not found") || msg.toLowerCase().includes("unable to log in")) {
              setActiveTab("signup");
              setEmail(googleProfile.email);
              Alert.alert(
                "Account Not Found",
                "This Google account is not registered with the app. Complete Sign Up to link it."
              );
            } else {
              displayError("Unable to sign in with Google. Please try again.");
            }
          }
        } catch (err: any) {
          console.log("Google Sign-In error:", err instanceof Error ? err.message : err);
          displayError("Something went wrong with Google sign-in.");
        } finally {
          setIsLoading(false);
        }
      } else if (response?.type === "error") {
        console.log("Google sign-in was cancelled or failed");
        displayError("Google sign-in was cancelled.");
      }
    };

    handleResponse();
  }, [response]);

  // Animate error display
  const displayError = (message: string) => {
    setErrorMessage(message);
    setShowError(true);

    Animated.timing(fadeAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    Animated.sequence([
      Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();

    setTimeout(() => {
      hideError();
    }, 5000);
  };

  const hideError = () => {
    Animated.timing(fadeAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowError(false);
      setErrorMessage("");
    });
  };

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      console.log("Login validation failed: Missing credentials");
      displayError("Please enter your ID number and password");
      return;
    }

    setIsLoading(true);
    hideError();
    
    try {
      console.log("***************************************************");
      console.log("🔐 Attempting login...");
      console.log("***************************************************");
      const authState = await authService.login({
        username: username.trim(),
        password: password.trim(),
      });
      
      console.log("***************************************************");
      console.log("✅ Login successful!");
      console.log("***************************************************");
      await loadUserRecords();
      
      // Start AI detection after successful login
      startDetection();
      
      Alert.alert(
        "Welcome!",
        `Hello, ${authState.user?.first_name} ${authState.user?.last_name}!`,
        [{ text: "OK", onPress: () => navigation.navigate("home") }]
      );
    } catch (error) {
      // Log the technical error details to console only
      const technicalError = error instanceof Error ? error.message : "Login failed. Please try again.";
      console.log("***************************************************");
      console.log("❌ Login error:", technicalError);
      console.log("***************************************************");
      
      // Show only user-friendly message in UI
      displayError("Invalid ID number or password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!email.trim() || !password.trim()) {
      console.log("Signup validation failed: Missing fields");
      displayError("Please fill in all fields");
      return;
    }

    if (!email.includes("@")) {
      console.log("Signup validation failed: Invalid email");
      displayError("Please enter a valid email address");
      return;
    }

    if (password.length < 6) {
      console.log("Signup validation failed: Password too short");
      displayError("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    hideError();
    
    try {
      console.log("***************************************************");
      console.log("📝 Attempting signup...");
      console.log("***************************************************");
      const emailName = email.split("@")[0];
      const authState = await authService.signup({
        email: email.trim(),
        password: password.trim(),
        first_name: emailName,
        last_name: "User",
      });

      console.log("***************************************************");
      console.log("✅ Signup successful!");
      console.log("***************************************************");
      await loadUserRecords();
      
      // Start AI detection after successful signup
      startDetection();

      Alert.alert(
        "Account Created!",
        `Welcome, ${authState.user?.first_name ?? "user"}! You've been automatically logged in.`,
        [{ text: "Get Started", onPress: () => navigation.navigate("home") }]
      );
    } catch (error) {
      // Log the technical error details to console only
      const technicalError = error instanceof Error ? error.message : "Signup failed. Please try again.";
      console.log("***************************************************");
      console.log("❌ Signup error:", technicalError);
      console.log("***************************************************");
      
      // Show only user-friendly message in UI
      displayError("Unable to create account. Email may already be in use.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await promptAsync();
    } catch (err) {
      console.log("Failed to start Google sign-in:", err);
      displayError("Unable to start Google sign-in.");
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={["#FFFFFF", "#FFFFFF", "#F9CBCB"]}
      locations={[0, 0.31, 1]}
      style={styles.container}
    >
      {/* Error Message Banner */}
      {showError && (
        <Animated.View
          style={[
            styles.errorBanner,
            {
              opacity: fadeAnimation,
              transform: [{ translateX: shakeAnimation }],
            },
          ]}
        >
          <MaterialIcons name="error-outline" size={24} color="#fff" />
          <Text style={styles.errorText}>{errorMessage}</Text>
          <TouchableOpacity onPress={hideError} style={styles.errorClose}>
            <MaterialIcons name="close" size={20} color="#fff" />
          </TouchableOpacity>
        </Animated.View>
      )}

      <View style={styles.card}>
        {/* Toggle Bar */}
        <View style={styles.toggleWrapper}>
          <TouchableOpacity
            style={[styles.toggleButton, activeTab === "login" ? styles.active : styles.inactive]}
            onPress={() => {
              setActiveTab("login");
              hideError();
            }}
          >
            <Text style={[styles.toggleText, activeTab === "login" ? styles.activeText : styles.inactiveRed]}>
              Log In
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toggleButton, activeTab === "signup" ? styles.active : styles.inactive]}
            onPress={() => {
              setActiveTab("signup");
              hideError();
            }}
          >
            <Text style={[styles.toggleText, activeTab === "signup" ? styles.activeText : styles.inactiveRed]}>
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

            <View style={styles.passwordContainer}>
              <TextInput
                placeholder="Password"
                secureTextEntry={!showPassword}
                style={styles.passwordInput}
                underlineColorAndroid="transparent"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                autoCapitalize="none"
                editable={!isLoading}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <MaterialIcons
                  name={showPassword ? "visibility" : "visibility-off"}
                  size={22}
                  color="#666"
                />
              </TouchableOpacity>
            </View>
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

            <View style={styles.passwordContainer}>
              <TextInput
                placeholder="Password"
                secureTextEntry={!showPassword}
                style={styles.passwordInput}
                underlineColorAndroid="transparent"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                autoCapitalize="none"
                editable={!isLoading}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <MaterialIcons
                  name={showPassword ? "visibility" : "visibility-off"}
                  size={22}
                  color="#666"
                />
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Google Login Button */}
        <TouchableOpacity 
          style={[styles.googleButton, isLoading && styles.buttonDisabled]} 
          onPress={handleGoogleSignIn} 
          disabled={isLoading || !request}
        >
          <Image source={require("../../assets/image/GoogleLogo.png")} style={styles.googleIcon} />
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
              {activeTab === "login" ? "Log In" : "Sign Up"}
            </Text>
          )}
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

  errorBanner: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: '#E53E3E',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1000,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },

  errorText: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
    fontFamily: "AlegreyaSC",
    marginLeft: 12,
    marginRight: 8,
  },

  errorClose: {
    padding: 4,
  },

  card: {
    width: 300,
    height: 450,
    padding: 20,
    borderRadius: 20,
    backgroundColor: "rgba(66, 52, 52, 0.15)",
    shadowColor: "rgba(0, 0, 0, 0.25)",
    shadowOffset: { 
      width: 0, 
      height: 4 
    },
    shadowOpacity: 1,
    shadowRadius: 20,
  },
  toggleWrapper: {
    flexDirection: "row",
    borderRadius: 30,
    overflow: "hidden",
    backgroundColor: "white",
    marginBottom: 90,
    marginTop: 10,
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

  input: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: "transparent",
  },

  passwordContainer: {
    position: 'relative',
    marginBottom: 12,
  },

  passwordInput: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 10,
    paddingRight: 45,
    fontSize: 14,
    borderWidth: 1,
    borderColor: "transparent",
  },

  eyeIcon: {
    position: 'absolute',
    right: 12,
    top: 10,
    padding: 4,
  },

  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingVertical: 10,
    borderRadius: 6,
    marginBottom: 15,
    marginTop: 10,
    marginHorizontal: 25,
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

  mainButton: {
    width: 130,
    backgroundColor: "#fafafa",
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center",
    alignSelf: "center",
    marginTop: 30,
  },

  mainButtonText: {
    fontFamily: "AlegreyaSCMedium",
    fontSize: 16,
    color: "#444",
  },

  mainButtonDisabled: {
    opacity: 0.5,
  },

  buttonDisabled: {
    opacity: 0.5,
  },

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
