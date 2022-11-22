import React, { useEffect, useState } from "react";
import {
  StatusBar,
  View,
  Text,
  FlatList,
  StyleSheet,
  Linking,
  Platform,
  TouchableOpacity,
  TouchableHighlight,
  ScrollView,
} from "react-native";
import { Card, Paragraph } from "react-native-paper";
import { store } from "../firebase";
import HomeHeader from "../components/HomeHeader";
import { Context } from "../Context";
import * as Location from "expo-location";
import * as geolib from "geolib";


const ItemsList = ({ navigation }) => {
  const { sortingOption, setSortingOption, coordinates, setCoordinates } =
    React.useContext(Context);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newData, setNewData] = useState(items);

  const range = 4000;

  const getDetails = async () => {
    const querySnap = await store.collection("ads").get();
    const result = querySnap.docs.map((docSnap) => docSnap.data());
    console.log(querySnap.docs.map((docSnap) => docSnap.data()));

    // console.log(result);
    setItems(result);
    setNewData(result);
  };

  const openDial = (phone) => {
    if (Platform.OS === "android") {
      Linking.openURL(`tel:${phone}`);
    } else {
      Linking.openURL(`telprompt:${phone}`);
    }
  };

  async function getLocation() {
    let { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission not granted",
        "Allow the app to use location service.",
        [{ text: "OK" }],
        { cancelable: false }
      );
    }

    let { coords } = await Location.getCurrentPositionAsync();

    if (coords) {
      const { latitude, longitude } = coords;
      let response = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      setCoordinates({
        latitude: latitude,
        longitude: longitude,
      });
      // console.log(latitude + " " + longitude);
      //console.log(items);
      //console.log(coords);

      // for (let item of response) {
      //   let address = `${item.name}, ${item.street}, ${item.postalCode}, ${item.city}`;

      //   console.log(address);
      // }
    }
  }

  useEffect(() => {
    getLocation();
    getDetails();
    return () => {
      console.log("cleanup");
    };
  }, []);

  const handleRange = (range) => {
    const filteredData = items.filter((item) => {
      // item.LandMrk.toLowerCase().includes(value.toLowerCase())
      if (parseInt(item.price) <= range) {
        return true;
      }
      return false;
    });

    setNewData(filteredData);
  };

  const handleSearch = (value) => {
    if (value.length === 0) {
      setNewData(items);
    }
    const filteredData = items.filter((item) => {
      // item.LandMrk.toLowerCase().includes(value.toLowerCase())
      if (
        item.address.toLowerCase().includes(value.toLowerCase()) ||
        item.price.toLowerCase().includes(value.toLowerCase()) ||
        item.address.toLowerCase().includes(value.toLowerCase()) ||
        item.desc.toLowerCase().includes(value.toLowerCase())
      ) {
        return true;
      }
      return false;
    });

    if (filteredData.length === 0) {
      setNewData(items);
    } else {
      setNewData(filteredData);
    }
  };

  // const descAlert = (value) => {
  //   alert(value);
  // };
  const renderItem = (item) => {
    return (
      <Card style={styles.card}>
        <Card.Title title={item.name} />

        <Card.Content>
          <Paragraph style={{ textAlign: "left", fontWeight: "bold" }}>Rs {item.price}/-</Paragraph>
          <Paragraph style={{ paddingBottom: 5 }}>
            Hostel is just <Text style = {{fontWeight: "bold"}}>{geolib.getDistance(item.pin, coordinates) / 1000}{" "}km</Text>
            {" "}away from you
          </Paragraph>
          {/* <Paragraph>{item.desc}</Paragraph> */}
        </Card.Content>
        <TouchableHighlight
          style={{ borderRadius: 10 }}
          onPress={() => {
            navigation.navigate("description", {
              name: item.name,
              desc: item.desc,
              isAvailableFor: item.isAvailableFor,
              landMrk: item.LandMrk,
              size: item.size,
              price: item.price,
              // maxCap: item.maxCap,
              address: item.address,
              phone: item.phone,
              pin: item.pin,
              urls: item.urls,
            });
          }}
        >
          <Card.Cover
            style={{ borderRadius: 10, overflow: "hidden" }}
            source={{ uri: item.urls[0] }}
          />
        </TouchableHighlight>
        <Card.Actions>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              navigation.navigate("description", {
                name: item.name,
                desc: item.desc,
                landMrk: item.LandMrk,
                size: item.size,
                isAvailableFor: item.isAvailableFor,
                price: item.price,
                // maxCap: item.maxCap,
                address: item.address,
                phone: item.phone,
                pin: item.pin,
                urls: item.urls,
              });
            }}
            title="Description"
          >
            <Text style={styles.buttonText}>Description</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => openDial(item.phone)}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Call</Text>
          </TouchableOpacity>
          {/* <Button style={styles.button} onPress={()=>(openDial(item.phone))}> call</Button> */}

          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              navigation.navigate("currlocation", {
                pin: item.pin,
              });
            }}
            title="CurrLocation"
          >
            <Text style={styles.buttonText}>Location</Text>
          </TouchableOpacity>
        </Card.Actions>
      </Card>
    );
  };

  // const sortingMethod = (sortingOption) => {
  //   return (sortingOption.value ? newData.sort((a, b) => a.price.localeCompare(b.price)) : (newData.sort((a, b) => a.price.localeCompare(b.price)).reverse()));
  // }

  const sortingMethod = (sortingOption) => {
    sortingOption = sortingOption.value;

    if (sortingOption == 0) {
      return newData.sort((a, b) => a.price.localeCompare(b.price));
    } else if (sortingOption == 1) {
      return newData.sort((a, b) => a.price.localeCompare(b.price)).reverse();
    } else if (sortingOption == 2) {
      return newData.sort(
        (a, b) =>
          geolib.getDistance(a.pin, coordinates) / 1000 >
          geolib.getDistance(b.pin, coordinates) / 1000
      );
    } else if (sortingOption == 3) {
      return newData.sort(
        (a, b) =>
          geolib.getDistance(a.pin, coordinates) / 1000 <
          geolib.getDistance(b.pin, coordinates) / 1000
      );
    } else return newData;
  };

  return (
    <View style={{ backgroundColor: "#DDE2E5" }}>
      <StatusBar backgroundColor="#DDE2E5" barStyle={"dark-content"} />
      <FlatList
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        data={sortingMethod(sortingOption)}
        // data={newData.sort((a,b) => a.price.localeCompare(b.price))}
        keyExtractor={(item) => item.phone}
        renderItem={({ item }) => renderItem(item)}
        onRefresh={() => {
          setLoading(true);
          getDetails();
          setLoading(false);
        }}
        refreshing={loading}
        ListHeaderComponent={
          <HomeHeader onSearch={handleSearch} onSelectRange={handleRange} />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 20,
    elevation: 10,
    borderRadius: 20,
    overflow: "hidden",
    padding: 10,
  },
  button: {
    margin: 6,
    backgroundColor: "#054367",
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 25,
  },
  buttonText: {
    color: "white",
  },
});

export default ItemsList;
