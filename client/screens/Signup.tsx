import {
  View,
  Text,
  ScrollView,
  ImageBackground,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import React, { useState } from "react";
import InputComponent from "../components/InputComponent";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
const Signup: React.FC = () => {
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const navigation = useNavigation();

  const handleSignUp = async () => {
    console.log("Sign Up")
    try {
      const response = await axios.post("http://10.0.2.2:3000/signup", {
        username,
        email,
        password,
      });
      console.log(username);
      console.log(email);
      console.log(password);
      console.log(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const navigateToSignUp = () => {
    navigation.navigate("Login")
  }
  return (
    <View style={{ flex: 1, justifyContent: "center" }}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
        }}
      >
        <ImageBackground
          source={require("../assets/bg.png")}
          style={styles.bgContainer}
          resizeMode="cover"
        >
          <View style={styles.hello_text}>
            <Text style={styles.headerText}>Welcome Here!</Text>
            <Text style={styles.subHeaderText}>
              Create an account to enjoy our services.
            </Text>
          </View>

          <View style={styles.inputContainer}>
          <InputComponent
              placeholder="User name"
              value={username}
              onChangeText={setUsername}
              iconSource={require("../assets/ic_invite.png")}
            />
            <InputComponent
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              iconSource={require("../assets/ic_mail.png")}
            />
            <InputComponent
              inputpassword
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              iconSource={require("../assets/Vector.png")}
              secureTextEntry
            />
          </View>
          <Text style={styles.recoveryText}>Recovery password</Text>
          <TouchableOpacity style={styles.loginButton} onPress={handleSignUp}>
            <Text style={styles.loginButtonText}>Sign up</Text>
          </TouchableOpacity>
          <View style={styles.orTextContainer}>
            <View style={styles.line}></View>
            <Text style={styles.orText}>Or continue with</Text>
            <View style={styles.line}></View>
          </View>
          <View style={styles.otherMethod}>
            <TouchableOpacity>
              <FontAwesome name="facebook-square" color="pink" size={70} />
            </TouchableOpacity>
            <TouchableOpacity>
              <FontAwesome name="google" color="pink" size={70} />
            </TouchableOpacity>
            <TouchableOpacity>
              <FontAwesome name="apple" color="pink" size={70} />
            </TouchableOpacity>
          </View>
          <View style={styles.registerContainer}>
            <Text style={styles.notMemberText}>Already have an account? </Text>
            <TouchableOpacity onPress={navigateToSignUp}>
              <Text style={styles.registerText}>Login</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </ScrollView>
    </View>
  );
};

export default Signup;

const styles = StyleSheet.create({
  hello_text: {
    flexDirection: "column",
    gap: 13,
    alignItems: "center",
    marginBottom: 40,
  },
  bgContainer: {
    flex: 1,
    flexDirection: "column",
    gap: 15,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 50,
  },
  inputContainer: {
    gap: 20,
  },
  recoveryText: {
    textAlign: "right",
    marginRight: 3,
    color: "#fff",
    marginBottom: 25,
  },
  loginButton: {
    backgroundColor: "pink",
    height: 60,
    borderRadius: 15,
    justifyContent: "center",
  },
  loginButtonText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  orTextContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 30,
    marginBottom: 30,
  },
  line: {
    height: 1,
    backgroundColor: "#fff",
    flex: 1,
  },
  orText: {
    color: "#rgba(255, 255, 255, 1)",
    textAlign: "center",
    fontSize: 15,
    padding: 10,
  },
  otherMethod: {
    flexDirection: "row",
    gap: 30,
    justifyContent: "center",
    marginBottom: 30,
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  notMemberText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
  registerText: {
    fontSize: 15,
    fontWeight: "600",
    color: "aqua",
  },
  headerText: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    color: "#fff",
  },
  subHeaderText: {
    fontSize: 18,
    fontWeight: "500",
    textAlign: "center",
    maxWidth: 200,
    color: "#fff",
  },
});
