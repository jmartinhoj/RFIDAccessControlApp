import * as WebBrowser from 'expo-web-browser';
import * as React from 'react';
import { Image,Switch, Platform, StyleSheet, Text, ToastAndroid, View, TextInput, Button } from 'react-native';
import { RectButton, ScrollView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import Spinner from 'react-native-loading-spinner-overlay';
import { Overlay } from 'react-native-elements';
import FloatingActionButton from "react-native-floating-action-button"


export default class PeopleScreen extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isRefreshing: false,
      isLoaded: false,
      people: [],
      spinner: true,
      editModalVisible: false,
      addModalVisible: false,
      form: {
        name: "",
        RFID: "",
        authorized: false,
        id: ""
      }
    };
  }

  async getPeopleFromApi() {
    console.log("aqui")
    var jsonResponse;
    var list;
    try {
      var response = await fetch('http://192.168.43.90:3000/people', {
        method: 'GET',
      });
      console.log("tá")
      jsonResponse = await response.json()
      list = await jsonResponse;
      this.setState({people: list, spinner: false})
    }
    catch(error) {
        console.log(error);
        return null;
    }
  }

  async componentDidMount() {
    await this.getPeopleFromApi()
  }

  authorize = () => {
    this.setState(prevState => {
      let form = Object.assign({}, prevState.form);  
      form.authorized = !form.authorized;             
      return { form };
    })
  }


  onChangeName = (name) => {
    this.setState(prevState => {
      let form = Object.assign({}, prevState.form);  
      form.name = name;             
      return { form };
    })
  }

  onChangeRFID = (RFID) => {
    this.setState(prevState => {
      let form = Object.assign({}, prevState.form);  
      form.RFID = RFID;             
      return { form };
    })
  }


  sendPatch = () => {
    return fetch('http://192.168.43.90:3000/people/' + this.state.form.id , {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: this.state.form.name,
        RFID: this.state.form.RFID,
        authorized: this.state.form.authorized
      })
    }).then(res => {
      if(res.ok) {
        this.setState({spinner: true, editModalVisible: false})
        this.getPeopleFromApi();
        ToastAndroid.show("Utilizador Adicionado!", ToastAndroid.SHORT)
      }
      throw new Error('Network errr');
    }).catch(error => {
      ToastAndroid.show("Houve algum erro", ToastAndroid.SHORT)
      console.log('There has been a problem with your fetch operation: ', error);
    })
  }

  addUser = () => {
    return fetch('http://192.168.43.90:3000/people', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: this.state.form.name,
        RFID: this.state.form.RFID,
        authorized: this.state.form.authorized
      })
    }).then(res => {
      if(res.ok) {
        this.setState({spinner: true, addModalVisible: false})
        this.getPeopleFromApi();
        ToastAndroid.show("Utilizador Adicionado!", ToastAndroid.SHORT)
      }
      throw new Error('Network error');
    }).catch(error => {
      ToastAndroid.show("Houve algum erro", ToastAndroid.SHORT)
      console.log('There has been a problem with your fetch operation: ', error);
    })
  }

  EditingCard = (onclick, buttonText, visible) => {
    return(
      <Overlay transparent={true} isVisible={this.state.editModalVisible}>
        <View style={{flexDirection:"row"}}>
          <Text>Nome: </Text>
          <TextInput style={{  borderColor: 'gray', borderWidth: 1 }} onChangeText={text => this.onChangeName(text)} value={this.state.form.name}/>
        </View>
        <View style={{flexDirection:"row"}}>
          <Text>RFID: </Text>
          <TextInput style={{ borderColor: 'gray', borderWidth: 1 }} onChangeText={text => this.onChangeRFID(text)} value={this.state.form.RFID}/>
        </View>
        <View style={{flexDirection:"row"}}>
          <Text>Authorized: </Text>
          <Switch trackColor={{ false: "#767577", true: "#81b0ff" }} thumbColor={this.state.form.authorized ? "#f5dd4b" : "#f4f3f4"} onValueChange={this.authorize} ios_backgroundColor="#3e3e3e" value={this.state.form.authorized}/>
        </View>
        <View style={{flexDirection:"row"}}>
          <Button color="#544849" onPress={() => this.setState({modalVisible: false})} title = "Cancelar"/>
          <Button color="#31b51d" onPress={() => onclick()} title = {buttonText}/>
        </View>
      </Overlay>
    )
  }

  openEditingModal = (name, RFID, authorized, id) => {
    this.setState(prevState => {
      let form = Object.assign({}, prevState.form);  
      form.name = name;
      form.RFID = RFID;
      form.authorized = authorized;
      form.id = id;             
      return { form };
    })
  
    this.setState({editModalVisible: !this.state.editModalVisible})
  
  
  }

  openAddModal = () => {
    this.setState(
      {
        form: {
          name: "",
          RFID: "",
          authorized: false,
          id: ""
        },
        addModalVisible: !this.state.addModalVisible
      })  
  }
  

  closeModals = () => {
    this.setState({editModalVisible: false, addModalVisible: false})
  }
  


  render() { 
    return (
      <View style={styles.container}>
        <EditingCard onChangeName={this.onChangeName} onChangeRFID={this.onChangeRFID} cancel={this.closeModals} authorize={this.authorize} form={this.state.form} isVisible={this.state.editModalVisible} submit={this.sendPatch} buttonText="Alterar" />
        <EditingCard onChangeName={this.onChangeName} onChangeRFID={this.onChangeRFID} cancel={this.closeModals} authorize={this.authorize} form={this.state.form} isVisible={this.state.addModalVisible} submit={this.addUser} buttonText="Adicionar" />
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
          {this.state.people.length > 0?this.state.people.map((val, key) => {
            return (<Person that = {this} key={key} name = {val.name} RFID ={val.RFID} authorized={val.authorized} isLastOption={false} id={val._id}/>)
          }):null}
          <Spinner
          visible={this.state.spinner}
          textContent={'Loading...'}
          textStyle={styles.spinnerTextStyle}
        />
        </ScrollView>
        <FloatingActionButton
          text="Share"
          iconName="md-add"
          iconType="Ionicons"
          iconColor="black"
          textColor="black"
          shadowColor="red"
          rippleColor="red"
          onPress={() =>{
            this.openAddModal();
          }}
        />
        {/* <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {console.log("CONA")}}
          style={styles.TouchableOpacityStyle}>
          <Image
            //We are making FAB using TouchableOpacity with an image
            //We are using online image here
             source={{uri:'https://raw.githubusercontent.com/AboutReact/sampleresource/master/plus_icon.png',}}
            //You can use you project image Example below
            //source={require('./images/float-add-icon.png')}
            style={styles.FloatingButtonStyle}
          />
        </TouchableOpacity> */}
      </View>
    );
  }

}

function EditingCard(props) {
  return(
    <Overlay transparent={true} isVisible={props.isVisible}>
    <View style={{flexDirection:"row"}}>
      <Text>Nome: </Text>
      <TextInput style={{  borderColor: 'gray', borderWidth: 1 }} onChangeText={text => props.onChangeName(text)} value={props.form.name}/>
    </View>
    <View style={{flexDirection:"row"}}>
      <Text>RFID: </Text>
      <TextInput style={{ borderColor: 'gray', borderWidth: 1 }} onChangeText={text => props.onChangeRFID(text)} value={props.form.RFID}/>
    </View>
    <View style={{flexDirection:"row"}}>
      <Text>Authorized: </Text>
      <Switch trackColor={{ false: "#767577", true: "#81b0ff" }} thumbColor={props.form.authorized ? "#f5dd4b" : "#f4f3f4"} onValueChange={props.authorize} ios_backgroundColor="#3e3e3e" value={props.form.authorized}/>
    </View>
    <View style={{flexDirection:"row"}}>
      <Button color="#544849" onPress={() => props.cancel()} title = "Cancelar"/>
      <Button color="#31b51d" onPress={() => props.submit()} title = {props.buttonText}/>
    </View>
  </Overlay>
  )
}


function Person({ name, RFID, authorized, isLastOption, id, that }) {
  const icon = authorized?"md-checkmark":"md-alert";
  const color = authorized?"rgba(24,163,66,1)":"rgba(207,21,4,1)"
  return (
    <RectButton style={[styles.option, isLastOption && styles.lastOption]} onPress={() => {that.openEditingModal(name, RFID, authorized, id)}}>
      <View style={{ flexDirection: 'row' }}>
        <View style={styles.optionIconContainer}>
          <Ionicons name="ios-person" size={22} />
        </View>
        <View style={styles.optionTextContainer}>
          <Text style={styles.optionText}>{name}</Text>
        </View>
      </View>
    </RectButton>
  );
}

const styles = StyleSheet.create({
  TouchableOpacityStyle: {
    //Here is the trick
    position: 'absolute',
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    right: 30,
    bottom: 30,
 },
 FloatingButtonStyle: {
  resizeMode: 'contain',
  width: 50,
  height: 50,
  //backgroundColor:'black'
},
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
