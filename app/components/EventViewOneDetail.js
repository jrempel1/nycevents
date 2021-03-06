"use strict";

import React from "react";
import {
  Icon,
  List,
  ListItem,
  Text,
  Right,
  H1,
  Body,
  Content
} from "native-base";
import { Linking, Platform, Image, View } from "react-native";

const EventViewOneDetail = props =>
  <Content style={{ backgroundColor: "white" }}>
    {props.event.image.length > 0 &&
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <Image
          style={{
            width: 450,
            height: 300
          }}
          source={{ uri: props.event.image.replace("http", "https") }}
        />
      </View>}

    <List>
      <ListItem>
        <H1>
          {props.event.title}
        </H1>
      </ListItem>
      <ListItem>
        <Body>
          <Text>
            {props.event.description}
          </Text>
        </Body>
      </ListItem>
      <ListItem
        onPress={() => openMap(props.event.coordinates, props.event.location)}
      >
        <Body>
          <Text note>Location</Text>
          <Text style={{ color: "blue" }}>
            {props.event.location}
          </Text>
        </Body>
        <Right>
          <Icon name="arrow-forward" />
        </Right>
      </ListItem>

      {props.event.parkids.length > 0 &&
        <ListItem>
          <Body>
            <Text note>Borough</Text>
            <Text>
              {props.event.borough}
            </Text>
          </Body>
        </ListItem>}
      <ListItem>
        <Body>
          <Text note>Date</Text>
          <Text>
            {props.event.startdate}
          </Text>
        </Body>
      </ListItem>
      <ListItem>
        <Body>
          <Text note>Time</Text>
          <Text>
            {props.event.starttime} - {props.event.endtime}
          </Text>
        </Body>
      </ListItem>
      <ListItem onPress={() => Linking.openURL(props.event.link)}>
        <Body>
          <Text note>Website</Text>
          <Text style={{ color: "blue" }}>
            {props.event.link}
          </Text>
        </Body>
        <Right>
          <Icon name="arrow-forward" />
        </Right>
      </ListItem>
      {props.event.contact_phone &&
        <ListItem>
          <Body>
            <Text note>Contact Phone</Text>
            <Text>
              {props.event.contact_phone}
            </Text>
          </Body>
        </ListItem>}
      <ListItem>
        <Body>
          <Text note>Categories</Text>
          <Text>
            {props.event.categories.join("\n")}
          </Text>
        </Body>
      </ListItem>
    </List>
  </Content>;

export default EventViewOneDetail;

function openMap(coords, locationName) {
  if (Platform.OS == "ios") {
    const iosAMap = `http://maps.apple.com/?dirflg=t&t=r&q=${locationName}&ll=${coords.latitude},${coords.longitude}`;
    Linking.openURL(iosAMap);

    // const iosGMap =
    //   "comgooglemaps-x-callback://?q=" +
    //   locationName +
    //   " New York" +
    //   "&x-success=sourceapp://?resume=true" +
    //   "&x-source=NYCEvents";
    //       Linking.canOpenURL(iosGMap).then(supported => {
    //         if (supported) {
    //           Linking.openURL(iosGMap);
    //         } else {
    //           Linking.openURL(iosAMap);
    //         }
    //       });
  } else {
    const andGMap =
      "https://www.google.com/maps/search/?api=1&query=" +
      locationName +
      " New York";
    Linking.openURL(andGMap);
  }
}
