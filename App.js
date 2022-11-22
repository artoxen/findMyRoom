import { StyleSheet, View, SafeAreaView } from "react-native";
import React, { useState, useEffect } from "react";
import { DefaultTheme, Provider as PaperProvider } from "react-native-paper";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import {
  NavigationContainer,
  DefaultTheme as DefaultThemeNav,
} from "@react-navigation/native";
import { auth } from "./firebase";

import LoginScreen from "./screens/LoginScreen";
import SignupScreen from "./screens/SignupScreen";
import CreateAd from "./screens/CreateAd";
import ItemsList from "./screens/ItemsList";
import AccountScreen from "./screens/AccountScreen";
import Feather from "react-native-vector-icons/Feather";
import Map from "./screens/Map";
import Description from "./screens/Description";
import { Provider } from "./Context";
import CurrLocation from "./screens/CurrLocation";

const theme = {
  ...DefaultTheme,
  roundness: 2,
  colors: {
    ...DefaultTheme.colors,
    primary: "deepskyblue",
  },
};

const MyTheme = {
  ...DefaultThemeNav,
  colors: {
    ...DefaultThemeNav.colors,
    background: "white",
  },
};

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const AuthNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="signup"
        component={SignupScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

const AdNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="add"
        component={CreateAd}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="map"
        component={Map}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

const ListNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="item"
        component={ItemsList}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="description"
        component={Description}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="currlocation"
        component={CurrLocation}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color }) => {
          let iconName;

          if (route.name === "home") {
            iconName = "home";
          } else if (route.name === "create") {
            iconName = "plus-circle";
          } else if (route.name === "account") {
            iconName = "user";
          }

          return (
            <View style={{ borderColor: "white", borderRadius: 30 }}>
              <Feather name={iconName} size={30} color={color} />
            </View>
          );
        },
      })}
    >
      <Tab.Screen
        name="home"
        component={ListNavigator}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="create"
        component={AdNavigator}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="account"
        component={AccountScreen}
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
};

const Navigation = () => {
  const [user, setUser] = useState("");
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((userExist) => {
      if (userExist) {
        setUser(userExist);
      } else {
        setUser("");
      }
    });
    return unsubscribe;
  }, []);

  return (
    <NavigationContainer theme={MyTheme}>
      {user ? <TabNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

export default function App() {

  return (
    <Provider>
      <PaperProvider theme={theme}>
        <SafeAreaView style={styles.container}>
          <Navigation />
        </SafeAreaView>
      </PaperProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    // alignItems: 'center',
    justifyContent: "center",
  },
});
