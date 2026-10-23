import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import { SplashScreen } from '../screens/SplashScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { MainNavigator } from './MainNavigator';

const Stack = createStackNavigator();

export function RootNavigator() {
  const { user } = useAuth();
  const [splashDone, setSplashDone] = useState(false);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
        {!splashDone ? (
          <Stack.Screen name="Splash">
            {() => <SplashScreen onFinish={() => setSplashDone(true)} />}
          </Stack.Screen>
        ) : !user ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <Stack.Screen name="Main" component={MainNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
