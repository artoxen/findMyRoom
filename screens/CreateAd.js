import React, { useState } from "react";
import {
  TouchableOpacity,
  ScrollView,
  View,
  Text,
  StyleSheet,
  Alert,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { TextInput, Button } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import { store, auth, storage } from "../firebase";
import { Context } from "../Context";
import { COLORS, SIZES } from "../constants";
import { Dropdown } from "react-native-element-dropdown";

const storageRef = storage.ref();

const CreateAd = ({ navigation }) => {
  const { pin, isAdmin} = React.useContext(Context);

  const data = [
    { label: "Boys", value: "Boys" },
    { label: "Girls", value: "Girls" },
    { label: "Common", value: "Common" },
  ];

  const [isAvailableFor, setIsAvailableFor] = useState("");
  const [isFocus, setIsFocus] = useState(false);
  const [name, setName] = useState("");
  const [LandMrk, setLandMrk] = useState("");
  const [desc, setDesc] = useState("");
  const [size, setSize] = useState("");
  const [price, setPrice] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [images, setImages] = useState([]);
  const [urls, setUrls] = useState([]);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [imageNames,setImageNames] = useState([]);


  const postData = async () => {
    try {
      var id = await store.collection("ads").add({
        name,
        LandMrk,
        desc,
        isAvailableFor,
        size,
        price,
        phone,
        urls,
        address,
        pin,
        uid: auth.currentUser.uid,
        imageNames,  // will be used for deleting images.
      });
      store.collection("ads").doc(id.id).set({
        id: id.id,
      }, { merge: true });

      Alert.alert("posted your Ad!");


      setName("");
      setLandMrk("");
      setDesc("");
      setSize("");
      setPrice("");
      setPhone("");
      setAddress("");
      setImages([]);
      setUrls([]);
      setIsAvailableFor("");
      setImageNames([]);

    } catch (err) {
      console.log(err);
      Alert.alert("something went wrong.try again");
    }
  };

  // image work Start ======================================================

  const pickImages = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      selectionLimit: 5,
      aspect: [4, 3],
      quality: 0.6,  // decreasing quality of image to 60% for fast loading.
    });

    if(!result.hasOwnProperty("selected")){
        const newImage = result;
        newImage["id"] = Math.random();
        setImages((prevState) => [...prevState, newImage]);
        console.log(images.length);
    } else {
      for (let i = 0; i < result.selected.length; i++) {
          const newImage = result.selected[i];
          newImage["id"] = Math.random();
          setImages((prevState) => [...prevState, newImage]);
          console.log(images.length);
      }
    }
  };

  const uplaodImages = async () => {
    let cnt = 1;
    setLoading(true);
    images.map(async (image) => {
      console.log(image.uri);
      const response = await fetch(image.uri)
      const blob = await response.blob();
      const filename = Date.now();
      var ref = storageRef.child(`/images/${filename}`).put(blob);
      setImageNames((prevState) => [...prevState, filename]);

      ref.then((snapshot) => {
        ref.snapshot.ref.getDownloadURL().then((downloadURL) => {
          setUrls((prevState) => [...prevState, downloadURL]);
        });

        var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(progress);
        var message = "uploaded image" + cnt;
        if (progress == 100) { console.log(message); cnt++; }
        if (cnt === images.length + 1) {
          console.log("all done."); alert("All Images Uploaded"); setLoading(false);}
      }
      );
    }
    );
  }

  // image work end  ======================================================


if (!isAdmin)
  return (
    <View style={styles.container}>
      <View style={styles.flatListHeaderStyle}>
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
          Post Your Entries Here..
        </Text>
      </View>
      <Text style={{ textAlign: "center" }}>
        Sorry Only Hostel Owner's Can Post Entries
      </Text>
    </View>
  );
else
  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
    >

      {loading ?
        (<View style={styles.loader}><ActivityIndicator size="large" color="violet"/>
        <Text>Uploading Images ...</Text></View>)
        : (
          <View>

            <View style={styles.flatListHeaderStyle}>
              <Text style={{ color: "#DDE2E5", fontSize: 18, alignSelf: "center" }}>
                Post Your Entries Here..
              </Text>
            </View>

            <TextInput
              style={styles.inputBox}
              label="Name"
              value={name}
              numberOfLines={1}
              multiline={true}
              onChangeText={(text) => setName(text)}
            />

            <TextInput
              style={styles.inputBox}
              label="Landmark/Locality"
              value={LandMrk}
              onChangeText={(text) => setLandMrk(text)}
            />

            <TextInput
              style={styles.inputBox}
              label="Full address"
              value={address}
              numberOfLines={3}
              multiline={true}
              onChangeText={(text) => setAddress(text)}
            />
            <TextInput
              style={styles.inputBox}
              label="Describe room/place"
              value={desc}
              numberOfLines={5}
              multiline={true}
              onChangeText={(text) => setDesc(text)}
            />
            <View>
              <Dropdown
                style={[styles.dropdown, isFocus && { borderColor: "blue" }]}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                inputSearchStyle={styles.inputSearchStyle}
                iconStyle={styles.iconStyle}
                data={data}
                labelField="label"
                valueField="value"
                placeholder={!isFocus ? "Available for" : "..."}
                value={isAvailableFor}
                onFocus={() => setIsFocus(true)}
                onBlur={() => setIsFocus(false)}
                onChange={(item) => {
                  setIsAvailableFor(item.value);
                  setIsFocus(false);
                }}
              />
            </View>

            <TextInput
              style={styles.inputBox}
              label="Size of Room (Number of Beds)"
              value={size}
              onChangeText={(text) => setSize(text)}
            />
            
            <TextInput
              style={styles.inputBox}
              label="Price in INR"
              value={price}
              // keyboardType="numeric"
              onChangeText={(text) => setPrice(text)}
              underlineColorAndroid="#FFF"
              autoCorrect={false}
            />

            <TextInput
              style={styles.inputBox}
              label="Your Contact Number"
              value={phone}
              keyboardType="numeric"
              onChangeText={(text) => setPhone(text)}
            />

            <Button
              style={styles.button}
              onPress={() => {
                navigation.navigate("map");
              }}
              title="Map"
              mode="contained"
            >
              Set Location
            </Button>

            <Button
              style={styles.button}
              icon="camera"
              mode="contained"
              onPress={() => pickImages()}
            >
              pick Images
            </Button>
            <Button
              style={styles.button}
              icon="camera"
              mode="contained"
              disabled={!images.length}
              onPress={() => uplaodImages()}
            >
              upload Images
            </Button>

            <Button
              style={styles.button}
              mode="contained"
              onPress={() => postData()}
            >
              Post
            </Button>
          </View>
        )
      }
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  loader:{
    marginTop:"50%",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center'
  },
  inputBox: {
    marginHorizontal: 15,
    marginVertical: 5,
    backgroundColor: "#F7F7F7",
  },
  button: {
    marginHorizontal: 15,
    marginVertical: 5,
  },
  container: {
    flex: 1,
    backgroundColor: "#EFF5F5",
  },
  text: {
    fontSize: 24,
    textAlign: "center",
  },
  map: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
  flatListHeaderStyle: {
    margin: 10,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    padding: SIZES.font,
  },
  dropdown: {
    height: 50,
    borderColor: "#B2B2B2",
    borderBottomWidth: 0.5,
    paddingHorizontal: 8,
    marginHorizontal: 15,
    marginVertical: 5,
    elevation: 1,
    backgroundColor: "#F7F7F7",
  },
  icon: {
    marginRight: 5,
  },
  label: {
    position: "absolute",
    backgroundColor: "white",
    left: 22,
    top: 8,
    zIndex: 999,
    paddingHorizontal: 8,
    fontSize: 14,
  },
  placeholderStyle: {
    fontSize: 16,
    color: "grey",
  },
  selectedTextStyle: {
    fontSize: 16,
    color: "grey",
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
});

export default CreateAd;

