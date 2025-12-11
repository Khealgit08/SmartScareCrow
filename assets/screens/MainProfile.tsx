import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import MenuAndWidgetPanel from "../components/MenuAndWidgetPanel";
import type { RootStackParamList } from "../../navigation.types";

type MainProfileNavigationProp = NavigationProp<RootStackParamList, "profile">;

export default function MainProfileScreen(): React.ReactElement {
  const navigation = useNavigation<MainProfileNavigationProp>();

  return (
    <MenuAndWidgetPanel>
      <View style={styles.container}>
        <View style={styles.profileSection}>
          <View style={styles.profileIconContainer}>
            <Ionicons name="person-circle-outline" size={90} color="black" />
            <View style={styles.plusIcon}>
              <Ionicons name="add-circle" size={24} color="green" />
            </View>
          </View>
          <Text style={styles.usernameText}>USERNAME</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.recordsSection}>
          <TouchableOpacity
            style={styles.recordItem}
            onPress={() => navigation.navigate("savedr")}
          >
            <MaterialCommunityIcons
              name="cloud-check-outline"
              size={50}
              color="black"
            />
            <Text style={styles.recordText}>SAVED RECORDS</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.recordItem}
            onPress={() => navigation.navigate("deletedr")}
          >
            <Ionicons name="trash-outline" size={50} color="black" />
            <Text style={styles.recordText}>RECENTLY DELETED RECORDS</Text>
          </TouchableOpacity>
        </View>
      </View>
    </MenuAndWidgetPanel>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(246, 238, 238, 0.85)",
    paddingTop: 50,
  },
  profileSection: {
    alignItems: "center",
    marginTop: 20,
  },
  profileIconContainer: {
    position: "relative",
  },
  plusIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
  },
  usernameText: {
    fontSize: 20,
    fontWeight: "bold",
    fontFamily: "AlegreyaSCMedium",
    marginTop: 5,
    marginBottom: 20,
  },
  divider: {
    borderBottomColor: "black",
    borderBottomWidth: 1,
    width: "90%",
    alignSelf: "center",
    marginVertical: 10,
  },
  recordsSection: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 50,
    paddingHorizontal: 20,
  },
  recordItem: {
    alignItems: "center",
    width: "40%",
  },
  recordText: {
    textAlign: "center",
    marginTop: 8,
    fontSize: 12,
    fontWeight: "bold",
    fontFamily: "AlegreyaSC",
  },
});
