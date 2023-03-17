import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import React, { useLayoutEffect, useState, useEffect } from "react";

import { db } from "../firebase";
import { collection, getDocs, addDoc, query, where } from "firebase/firestore";
import Dialog from "react-native-dialog";

import AsyncStorage from "@react-native-async-storage/async-storage";

const HomeScreen = ({ navigation }) => {
  const [code, setCode] = useState("");
  const [username, setUsername] = useState("");
  const [partyName, setPartyName] = useState("");
  const [visible, setVisible] = useState(false);

  const verifyCachedUser = async () => {
    const codeStored = await AsyncStorage.getItem("code");
    const usernameStored = await AsyncStorage.getItem("username");

    if (usernameStored != null || codeStored != null)
      navigation.navigate("GameScreen", {
        code: codeStored,
        username: usernameStored,
      });
  };

  useEffect(() => {
    verifyCachedUser();
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Penalti Counter",
    });
  }, []);

  const addUser = async () => {
    try {
      await getDocs(
        query(
          collection(db, "players"),
          where("name", "==", username),
          where("code", "==", code)
        )
      ).then(async (doc) => {
        let exists = false;
        doc.docs.map((doc) => (exists = doc.data() != null));
        if (!exists) {
          await addDoc(collection(db, "players"), {
            name: username,
            penaltis: "0",
            code: code,
            admin: false,
          });
        }
        await AsyncStorage.setItem("code", code);
        await AsyncStorage.setItem("username", username);
      });
      setCode("");
      setUsername("");
    } catch (error) {
      console.log(error);
    }
  };

  const addGame = async () => {
    try {
      await addDoc(collection(db, "players"), {
        name: username,
        penaltis: "0",
        code: code,
        admin: true,
      });
      await addDoc(collection(db, "games"), {
        name: partyName,
        code: code,
      });
      await AsyncStorage.setItem("code", code);
      await AsyncStorage.setItem("username", username);
      setCode("");
      setUsername("");
      setPartyName("");
      setVisible(false);
    } catch (error) {
      console.log(error);
    }
  };

  const joinGame = async () => {
    const q = await getDocs(
      query(collection(db, "games"), where("code", "==", code))
    );

    let gameData = null;
    q.docs.map((doc) => (gameData = doc.data()));

    if (gameData != null && username != "") {
      addUser().then(() => {
        alert(
          "You are about to experience a highly advanced application. \n\n Please proceed with maximum caution."
        );
        navigation.navigate("GameScreen", {
          code: code,
          username: username,
        });
      });
    } else if (gameData == null && code != "" && username != "") {
      setVisible(true);
    } else if (gameData == null && code == "" && username == "") {
      alert("Choose a code and name");
    } else if (gameData != null && username == "") {
      alert("Choose a name");
    } else if (code == "" && username == "") {
      alert("Choose a code and name");
    } else if (code != "" && username == "") {
      alert("Choose a name");
    } else if (code == "" && username != "") {
      alert("Choose a code");
    }
  };

  return (
    <View
      style={{ backgroundColor: "black", height: "100%", paddingTop: "10%" }}
    >
      <StatusBar barStyle="light-content" />
      <Text
        style={{
          textAlign: "center",
          paddingTop: 20,
          paddingBottom: 10,
          fontSize: 26,
          fontWeight: "800",
          paddingHorizontal: 10,
          color: "white",
        }}
      >
        Penalti Counter App
      </Text>
      <Text
        style={{
          textAlign: "center",
          marginTop: "15%",
          paddingBottom: 10,
          fontSize: 13,
          fontWeight: "500",
          paddingHorizontal: 10,
          color: "white",
        }}
      >
        Connect to a Party or Create one.
      </Text>
      <TextInput
        style={{
          alignSelf: "center",
          textAlign: "center",
          borderWidth: 1,
          fontSize: 16,
          marginTop: 20,
          paddingHorizontal: 20,
          paddingVertical: 10,
          borderRadius: 20,
          minWidth: "40%",
          backgroundColor: "white",
        }}
        placeholder="Party code"
        maxLength={25}
        value={code}
        onChangeText={(text) => setCode(text)}
      ></TextInput>
      <TextInput
        style={{
          alignSelf: "center",
          textAlign: "center",
          borderWidth: 1,
          fontSize: 16,
          marginTop: 20,
          marginBottom: 50,
          paddingHorizontal: 20,
          paddingVertical: 10,
          borderRadius: 20,
          minWidth: "40%",
          backgroundColor: "white",
        }}
        placeholder="Your Name"
        maxLength={25}
        value={username}
        onChangeText={(text) => setUsername(text)}
      ></TextInput>
      <TouchableOpacity
        onPress={() => joinGame()}
        style={{
          width: "30%",
          height: "5%",
          alignSelf: "center",
          borderRadius: 30,
          backgroundColor: "white",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ color: "black", fontSize: 16 }}>Go Party</Text>
      </TouchableOpacity>
      <Dialog.Container visible={visible}>
        <Dialog.Title>Create Party</Dialog.Title>
        <Dialog.Description>
          {username}, you are about to create a party, give it a name!
        </Dialog.Description>
        <Dialog.Input
          value={partyName}
          onChangeText={(text) => setPartyName(text)}
        />
        <Dialog.Button
          label="Cancel"
          onPress={() => {
            setVisible(false);
            setPartyName("");
          }}
        />
        <Dialog.Button
          label="Create"
          onPress={() =>
            addGame().then(() => {
              alert(
                "You are about to experience a highly advanced application. \n\n Please proceed with maximum caution."
              );
              navigation.navigate("GameScreen", {
                code: code,
                username: username,
              });
            })
          }
        />
      </Dialog.Container>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({});
