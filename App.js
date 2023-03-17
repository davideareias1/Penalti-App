import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HomeScreen from "./screens/HomeScreen";
import GameScreen from "./screens/GameScreen";

const Stack = createNativeStackNavigator();

const globalScreenOptions = {
  headerTintColor: "white",
  headerStyle: {
    backgroundColor: "black",
  },
  headerTitleStyle: {
    color: "white",
  },
};

function LoginStack() {
  return (
    <Stack.Navigator screenOptions={globalScreenOptions}>
      <Stack.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="GameScreen" component={GameScreen} />
    </Stack.Navigator>
  );
}

function RootNavigator() {
  return (
    <NavigationContainer>
      <LoginStack />
    </NavigationContainer>
  );
}

export default function App() {
  return <RootNavigator />;
}
