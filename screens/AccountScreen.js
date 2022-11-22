import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Card, Paragraph } from "react-native-paper";
import { auth } from "../firebase";
import { COLORS, SIZES } from "../constants";
import { store, storage } from "../firebase";
import Icon from 'react-native-vector-icons/FontAwesome';

const storageRef = storage.ref();

const AccountScreen = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const getDetails = async () => {
    const querySnap = await store
      .collection("ads")
      .where("uid", "==", auth.currentUser.uid)
      .get();
    const result = querySnap.docs.map((docSnap) => docSnap.data());
    console.log(result);
    setItems(result);
  };

  useEffect(() => {
    getDetails();
    return () => {
      console.log("cleanup");
    };
  }, []);

  // for deleting add with images start =================================================

  const deleteAd = (id, imageNames) => {
    store.collection("ads").doc(id).delete().then(() => {  // will delete the ad from firestore.
      console.log("Document successfully deleted !");
      alert("Ad deleted SuccessFully!");
    }).catch((error) => {
      console.error("Error removing document: ", error);
    });

    if (imageNames.length > 0) {  // will delete the images of deleted add from storage.
      for (let i = 0; i < imageNames.length; i++) {
        var imageRef = storageRef.child(`/images/${imageNames[i]}`);
        imageRef.delete().then(() => {
          if (i === (imageNames.length) - 1) console.log("All Images Deleted !")
          else{console.log("deleting images one by one...")}
        }).catch((error) => {
          console.log(error);
        });
      };
    }
    getDetails(); // will auto reload the page after deletion of ad.
  }
  // 

  // for deleting add with images end =================================================

  const renderItem = (item, deletePost) => {
    return (
      <Card style={styles.card}>
        <Card.Title title={item.name} />
        <Card.Content>
          <Paragraph>LandMark : {item.LandMrk}</Paragraph>
        </Card.Content>
        <Card.Cover
          style={{ borderRadius: 10, overflow: "hidden" }}
          source={{ uri: item.urls[0] }}
        />
        <TouchableOpacity 
          onPress={() => deleteAd(item.id, item.imageNames)}
          style={styles.delButton}>

          <Text>
              <Icon name="trash" size={30} color="black" />
          </Text>
        </TouchableOpacity>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        data={items}
        keyExtractor={(item) => item.phone}
        renderItem={({ item }) => renderItem(item)}
        onRefresh={() => {
          setLoading(true);
          getDetails();
          setLoading(false);
        }}
        refreshing={loading}
        ListHeaderComponent={
          <View style={styles.flatListHeaderStyle}>
            <Text style={styles.emailId}>Logged in as: {auth.currentUser.email}</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => auth.signOut()}
            >
              <Text style={styles.buttonText}>Logout</Text>
            </TouchableOpacity>
            <Text
              style={{
                color: "#DDE2E5",
                fontSize: 15,
                marginTop: 10,
                alignSelf: "center",
              }}
            >
              Your Posted Ad(s) Will Appear Here...
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#DDE2E5",
  },
  emailId: {
    color: "#ffffff",
    textAlign: "center",
    paddingBottom: 14,
  },
  flatListHeaderStyle: {
    margin: 10,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    padding: SIZES.font,
  },
  card: {
    margin: 20,
    elevation: 10,
    borderRadius: 20,
    overflow: "hidden",
    padding: 10,
  },
  button: {
    margin: 6,
    backgroundColor: "#ffffff",
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 25,
    alignSelf: "center",
  },
  delButton: {
    margin: 6,
    backgroundColor: "lightgrey",
    paddingHorizontal: 25,
    paddingVertical: 0,
    paddingBottom: 3,
    borderRadius: 25,
    alignSelf: "center",
  },
  buttonText: {
    color: "#000",
  },
});

export default AccountScreen;
