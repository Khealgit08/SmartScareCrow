import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Login from './assets/screens/Login';
import Signup from './assets/screens/Signup';
import Signupwith from './assets/screens/Signupwith';
import Home from './assets/screens/Home&Widget';
import Profile from './assets/screens/MainProfile';
import Settings from './assets/screens/Settings';
import RealtimeR from './assets/screens/Realtimerecord';
import SavedR from './assets/screens/SavedRecords';
import DeletedR from './assets/screens/DeletedRecords';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="login">
        
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
