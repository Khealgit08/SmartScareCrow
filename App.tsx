import * as React from 'react';
import { View, ActivityIndicator, LogBox } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useFonts } from 'expo-font';
import { DetectionProvider } from './contexts/DetectionContext';
import { RecordingProvider } from './contexts/RecordingContext';
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

// Disable the red box error screen in development
// Errors will still be logged to console but won't show the red overlay
if (__DEV__) {
  const originalConsoleError = console.error;
  console.error = (...args) => {
    // Log errors normally but prevent them from triggering the red box
    originalConsoleError(...args);
  };
}

// Suppress LogBox warnings and errors from showing in the UI
LogBox.ignoreAllLogs(true); // This will suppress ALL LogBox notifications

export default function App(): React.ReactElement {
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
    <DetectionProvider>
      <RecordingProvider>
        <NavigationContainer>
        <Stack.Navigator 
          id="root"
          screenOptions={{ headerShown: false }} 
          initialRouteName="home"
        >
          <Stack.Screen name="login" component={Login} />
          <Stack.Screen name="signup" component={Signup} />
          <Stack.Screen name="signupwith" component={Signupwith} />
          <Stack.Screen name="home" component={Home} />
          <Stack.Screen name="profile" component={Profile} />
          <Stack.Screen name="settings" component={Settings} />
          <Stack.Screen name="realtimer" component={RealtimeR} />
          <Stack.Screen name="savedr" component={SavedR} />
          <Stack.Screen name="deletedr" component={DeletedR} />
        </Stack.Navigator>
      </NavigationContainer>
      </RecordingProvider>
    </DetectionProvider>
  );
}
