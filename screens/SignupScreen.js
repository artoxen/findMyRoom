
import {
  View,
  Text,
  KeyboardAvoidingView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from "react-native";
import React, { useState } from "react";
import { TextInput, Button } from "react-native-paper";
import { auth} from "../firebase";
import validator from "email-validator";



const SignupScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setconfirmPassword] = useState("");

  // const signInWithGoogle = async () => {
  //   var provider = new firebase.auth.GoogleAuthProvider();
  //   provider.addScope('profile');
  //   provider.addScope('https://www.googleapis.com/auth/drive');
  //   firebase.auth().signInWithRedirect(provider);
  // }

  const userSignup = async () => {
    //console.log(email + ' ' + password + ' ' + confirmPassword);
    if (!email || !password || !confirmPassword) {
      Alert.alert("Please Enter All The Fields");
      return;
    } else if (validator.validate(email) == false) {
      Alert.alert("Please enter a valid email address");
      return;
    } else if (password.length < 8 || password.length > 20) {
      Alert.alert("Password should be min 8 char and max 20 char");
      return;
    } else if (password !== confirmPassword) {
      Alert.alert("Password and confirm password should be same.");
      return;
    } else if (confirmPassword.length == 0) {
      Alert.alert("Confirm Password is required feild");
      return;
    }

    try {
      const result = await auth.createUserWithEmailAndPassword(email, password);
      console.log("User is Registered");
      console.log(result.user.email);
      auth.signOut();
      Alert.alert("Account Created")
    } catch (err) {
      Alert.alert("Something went wrong try again.");
    }
  };

  // const userSignup = async () => {
  //     const result = await auth.createUserWithEmailAndPassword(email, password);

  //     console.log(result.user);

  // }

  const handleCreateAccount = () => {
    createUserWithEmailAndPassword(auth, email, password)
      .then(() => {
        console.log("Account Created");
        const user = userCredential.user;
        console.log(user);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <KeyboardAvoidingView
      style={{
        height: "100%",
        backgroundColor: "#DDE2E5",
      }}
      behavior="position"
    >
      <View style={styles.box1}>
        <Image
          style={{ width: 250, height: 250 }}
          source={require("../assets/home.png")}
        />
        <Text style={styles.text}>Please Sign Up To Continue!</Text>
      </View>
      <View style={styles.box2}>
        <TextInput
          label="Email"
          value={email}
          mode="outlined"
          onChangeText={(text) => setEmail(text)}
        />
        <TextInput
          label="Password"
          value={password}
          mode="outlined"
          secureTextEntry={true}
          onChangeText={(text) => setPassword(text)}
        />

        <TextInput
          label="Confirm password"
          value={confirmPassword}
          mode="outlined"
          secureTextEntry={true}
          onChangeText={(text) => setconfirmPassword(text)}
        />
        <Button mode="contained" onPress={() => userSignup()}>
          SignUp
        </Button>
        {/* <Button mode="contained" onPress={() => signInWithGoogle()}>
          SignUp With Google
        </Button> */}
        <TouchableOpacity onPress={() => navigation.navigate("login")}>
          <Text style={{ textAlign: "center" }}>Login ?</Text>
        </TouchableOpacity>
      </View>
      
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  box1: {
    alignItems: "center",
  },
  box2: {
    paddingHorizontal: 15,
    height: "50%",
    justifyContent: "space-evenly",
    marginHorizontal: 20,
    marginVertical: 30,
  },
  text: {
    fontSize: 22,
  },
});

export default SignupScreen;
