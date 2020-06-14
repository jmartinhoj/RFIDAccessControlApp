import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import React, { useState } from 'react';
import { StyleSheet, Text, View, RefreshControl } from 'react-native';
import { RectButton, ScrollView } from 'react-native-gesture-handler';




export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isRefreshing: false,
      isLoaded: false,
      events: []
    };
  }

  async getEventsFromApi() {
    var jsonResponse;
    var list;
    try {
      var response = await fetch('http://192.168.43.90:3000/events', {
        method: 'GET',
      });
      jsonResponse = await response.json()
      list = await jsonResponse.events;
      this.setState({events: list})
    }
    catch(error) {
        console.error(error);
        return null;
    }
  }

  async componentDidMount() {
    await this.getEventsFromApi()
  }

  _onRefresh = () => {
    this.setState({isRefreshing: true});
    this.getEventsFromApi().then(() => {
      this.setState({isRefreshing: false});
    });
  }


  render() {
    return (
      <ScrollView
        refreshControl={<RefreshControl refreshing={this.state.isRefreshing} onRefresh={this._onRefresh} />}
        style={styles.container} contentContainerStyle={styles.contentContainer}>
        {this.state.events.map((ev, key) => 
          <AccessEvent
            key = {key}
            accessIsGranted={ev.granted}
            name = {ev.name?ev.name:"INTRUSO"}
            RFID = {ev.RFID}
            onPress={() => {}}
          />
        )}
      </ScrollView>
    );
  }
}

function AccessEvent({ name, RFID, onPress, accessIsGranted, isLastOption }) {
  const icon = accessIsGranted?"md-checkmark":"md-alert";
  const color = accessIsGranted?"rgba(24,163,66,1)":"rgba(207,21,4,1)"
  return (
    <RectButton style={[styles.option, isLastOption && styles.lastOption]} onPress={onPress}>
      <View style={{ flexDirection: 'row' }}>
        <View style={styles.optionIconContainer}>
          <Ionicons name={icon} size={22} color={color} />
        </View>
        <View style={styles.optionTextContainer}>
          <Text style={styles.optionText}>{accessIsGranted?"Acesso Autorizado: " + name + " (" + RFID + ")":"Acesso Negado: " + name + " (" + RFID + ")" }</Text>
        </View>
      </View>
    </RectButton>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  contentContainer: {
    paddingTop: 15,
  },
  optionIconContainer: {
    marginRight: 12,
  },
  option: {
    backgroundColor: '#fdfdfd',
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: 0,
    borderColor: '#ededed',
  },
  lastOption: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  optionText: {
    fontSize: 15,
    alignSelf: 'flex-start',
    marginTop: 1,
  },
});
