import * as React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useFonts } from 'expo-font';
import Login from './assets/screens/Login';
import Signup from './assets/screens/Signup';
import Signupwith from './assets/screens/Signupwith';
import Home from './assets/screens/HomeWidget';
import Profile from './assets/screens/MainProfile';
import Settings from './assets/screens/Settings';
import RealtimeR from './assets/screens/Realtimerecord';
import SavedR from './assets/screens/SavedRecords';
import DeletedR from './assets/screens/DeletedRecords';

const Stack = createNativeStackNavigator();

export default function App() {
  const [fontsLoaded] = useFonts({
    Alef: require('./assets/fonts/ALEF-REGULAR.ttf'),
    Akshar: require('./assets/fonts/AKSHAR-REGULAR.ttf'),
    AlegreyaSCBlack: require('./assets/fonts/ALEGREYASC-BLACK.ttf'),
    AlegreyaSCMedium: require('./assets/fonts/ALEGREYASC-MEDIUM.ttf'),
    AlegreyaSC: require('./assets/fonts/AlegreyaSC-Regular.ttf'),
  });

  if (!fontsLoaded) {
    return (
      <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown:false}} initialRouteName="login">
        
        {/* Screens inside the app */}
        <Stack.Screen name="login" component={Login} />
        <Stack.Screen name="signup" component={Signup} />
        <Stack.Screen name="signupw" component={Signupwith} />
        <Stack.Screen name="home" component={Home} />
        <Stack.Screen name="profile" component={Profile} />
        <Stack.Screen name="settings" component={Settings} />
        <Stack.Screen name="realtimer" component={RealtimeR} />
        <Stack.Screen name="savedr" component={SavedR} />
        <Stack.Screen name="deletedr" component={DeletedR} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}