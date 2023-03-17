import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
} from "react-native";
import React, { useEffect, useState } from "react";

import { db } from "../firebase";

import {
  collection,
  orderBy,
  query,
  onSnapshot,
  where,
  addDoc,
  updateDoc,
  doc,
} from "firebase/firestore";
import TimeAgo from "../components/timeAgo";

const GameScreen = ({ navigation, route }) => {
  const [players, setPlayers] = useState([]);
  const [games, setGames] = useState([]);
  const [penaltis, setPenaltis] = useState([]);
  const [user, setUser] = useState(null);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [remainingTime, setRemainingTime] = useState(null);

  const code = route.params.code;
  const username = route.params.username;

  useEffect(() => {
    navigation.setOptions({
      title: "Scoreboard - " + games?.name,
    });
  }, [games]);

  useEffect(() => {
    const qPlayers = query(
      collection(db, "players"),
      orderBy("penaltis", "desc"),
      orderBy("name"),
      where("code", "==", code)
    );

    const unsubscribe = onSnapshot(qPlayers, (querySnapshot) => {
      const newPlayers = [];
      querySnapshot.forEach((doc) => {
        const player = doc.data();
        player.id = doc.id;
        newPlayers.push(player);
        if (player.name == username) setUser(player);
      });
      setPlayers(newPlayers);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const qGames = query(collection(db, "games"), where("code", "==", code));

    const unsubscribe = onSnapshot(qGames, (querySnapshot) => {
      querySnapshot.forEach((doc) => {
        const game = doc.data();
        game.id = doc.id;
        setGames(game);
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const qPenaltis = query(
      collection(db, "penaltis"),
      where("code", "==", code),
      where("served", "==", false),
      orderBy("timestamp")
    );
    const unsubscribe = onSnapshot(qPenaltis, (querySnapshot) => {
      const newPenaltis = [];
      querySnapshot.forEach((doc) => {
        const penalti = doc.data();
        penalti.id = doc.id;
        newPenaltis.push(penalti);
      });
      setPenaltis(newPenaltis);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const solvePenalti = async (id, result, playerId) => {
    try {
      await updateDoc(doc(db, "penaltis", id), {
        code,
        name: username,
        result,
        served: true,
      });
      await updateDoc(doc(db, "players", playerId), {
        penaltis: String(
          parseInt(players.find((obj) => obj.id === playerId)?.penaltis) + 1
        ),
      });
    } catch (error) {
      console.log(error);
    }
  };

  const adminPanel = () => {
    return (
      <>
        <Text
          style={{
            marginVertical: 10,
            alignSelf: "center",
            fontSize: 20,
            fontWeight: "700",
            color: "white",
          }}
        >
          Requests
        </Text>
        <ScrollView>
          <View>
            {penaltis.slice(0, 4).map((item, index) => {
              return (
                <TouchableOpacity
                  key={index}
                  onPress={() =>
                    Alert.alert(
                      "Did " + item.name + " drink?",
                      "Are you sure?",
                      [
                        {
                          text: "Yes",
                          onPress: () =>
                            solvePenalti(item.id, true, item.player),
                        },
                        {
                          text: "No",
                          onPress: () =>
                            solvePenalti(item.id, false, item.player),
                        },
                        {
                          text: "Cancel",
                          style: "destructive",
                          onPress: () => console.log("User clicked Cancel"),
                        },
                      ]
                    )
                  }
                >
                  <View style={styles.playerContainer}>
                    <Text style={styles.playerText}>{item.name} - </Text>
                    <TimeAgo
                      style={styles.playerText}
                      timestamp={item.timestamp}
                    />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </>
    );
  };

  const scoreboard = () => {
    return (
      <ScrollView>
        {players.slice(0, !user?.admin ? 6 : 4).map((item, index) => {
          return (
            <View
              key={index}
              style={[
                styles.playerContainer,
                index == 0 && styles.firstPlayer,
                index == 1 && styles.secondPlayer,
                index == 2 && styles.thirdPlayer,
              ]}
            >
              <Text style={styles.playerText}>{item.name} </Text>
              <Text style={styles.playerText}>- {item.penaltis}</Text>
            </View>
          );
        })}
      </ScrollView>
    );
  };

  let timerId = null;
  const requestPenalti = async () => {
    if (!isButtonDisabled) {
      setIsButtonDisabled(true);
      setRemainingTime(10);
      timerId = setTimeout(() => {
        setIsButtonDisabled(false);
      }, 10000);
    }
    try {
      await addDoc(collection(db, "penaltis"), {
        code,
        name: username,
        timestamp: Date.now(),
        served: false,
        player: user.id,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const onCancelPressPenalti = () => {
    if (timerId) {
      clearTimeout(timerId);
      setIsButtonDisabled(false);
      setRemainingTime(null);
    }
  };

  const clearRequests = () => {
    penaltis.map(async (item) => {
      try {
        await updateDoc(doc(db, "penaltis", item.id), {
          code,
          name: username,
          result: false,
          served: true,
        });
      } catch (error) {
        console.log(error);
      }
    });
  };

  useEffect(() => {
    if (remainingTime) {
      timerId = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev === 1) {
            clearTimeout(timerId);
            setIsButtonDisabled(false);
            return null;
          } else {
            return prev - 1;
          }
        });
      }, 1000);
    }

    return () => clearInterval(timerId);
  }, [remainingTime]);

  return (
    <View style={{ backgroundColor: "black", height: "100%" }}>
      <StatusBar barStyle="light-content" />

      {scoreboard()}
      {user?.admin && adminPanel()}
      <TouchableOpacity
        disabled={isButtonDisabled}
        onPress={() => requestPenalti()}
        onPressOut={() => onCancelPressPenalti()}
        style={[styles.button, isButtonDisabled && styles.buttonDisable]}
      >
        <Image
          source={require("../assets/beer.png")}
          style={{ width: 70, height: 70, marginVertical: 20 }}
        ></Image>
      </TouchableOpacity>
      {user?.admin && (
        <TouchableOpacity
          onPress={() =>
            Alert.alert("Delete All Requests", "Are you sure?", [
              {
                text: "Yes",
                onPress: () => clearRequests(),
              },
              {
                text: "No",
              },
              {
                text: "Cancel",
                style: "destructive",
              },
            ])
          }
          style={[styles.button2]}
        >
          <Text style={{ color: "black", fontSize: 12 }}>
            Remove all Requests
          </Text>
        </TouchableOpacity>
      )}

      <Text style={{ color: "white", alignSelf: "center", marginBottom: 30 }}>
        {isButtonDisabled && "Remaining Time: " + remainingTime + "s"}
      </Text>
    </View>
  );
};

export default GameScreen;

const styles = StyleSheet.create({
  playerContainer: {
    flexDirection: "row",
    alignSelf: "stretch",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#bbd0ff",
  },
  firstPlayer: {
    backgroundColor: "#e7c6ff",
  },
  secondPlayer: {
    backgroundColor: "#c8b6ff",
  },
  thirdPlayer: {
    backgroundColor: "#b8c0ff",
  },
  playerText: { fontSize: 18, fontWeight: "500" },
  button: {
    alignSelf: "center",
    backgroundColor: "black",
    alignItems: "center",
    justifyContent: "center",
  },
  button2: {
    width: "40%",
    height: "5%",
    alignSelf: "center",
    borderRadius: 30,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
  },
  buttonDisable: {
    opacity: 0.3,
  },
});
