import { StyleSheet, Text, View, Image, TextInput, TouchableOpacity, ImageBackground, StatusBar, Alert, TouchableWithoutFeedback } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import React, {useState,useEffect} from 'react';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen() {
  const [pin, setPin] = useState(""); 
  const [pinConfirm, setPinConfirm] = useState("");
  const [hasPasswords, setHasPasswords] = useState(false);
  const [isOverlayVisible, setOverlayVisible] = useState(false);
  const [hasPasswordList, setHasPasswordList] = useState(false);
  const navigation = useNavigation();


  const fetchPasswords = async () => {
    try {
      const savedPIN = await AsyncStorage.getItem('xx7771xxiDojoPIN');
      if(savedPIN==null) {

        let passKey = await AsyncStorage.getItem('xx7771xxiDojoAESpassKey');
        if(passKey==null) {
          setHasPasswordList(false);
          await AsyncStorage.setItem('xx7771xxiDojoAESpassKey', 'o');
          alert("Welcome to iDojo's Passwords Manager. No Saved PIN or passwords found. please enter a PIN or Password as your Master Password for all your saved passwords. PINs or Passwords should be at least 4 characters long with no slashes.");
          return;
        }
                    
        if(passKey == 'o') {
          setHasPasswordList(false);
          return;
        }
        
        for(let pkI=0; pkI < passKey.length; pkI++) {
          if(passKey.charAt(pkI) =='x' ) {
            setHasPasswordList(true);
            alert("Welcome to iDojo's Passwords Manager. No PIN found. Please enter a PIN or Password as your Master Password for all your saved passwords.");
            return;
          }
        }

        alert("Welcome to iDojo's Passwords Manager. No Saved PIN or Passwords found. please enter a PIN or Password as your Master Password for all your saved passwords.");
        return;
      } else {
        setHasPasswords(true);

        let passKey = await AsyncStorage.getItem('xx7771xxiDojoAESpassKey');
        if(passKey==null) {
          setHasPasswordList(false);
          await AsyncStorage.setItem('xx7771xxiDojoAESpassKey', 'o');
          return;
        }
                    
        if(passKey == 'o') {
          setHasPasswordList(false);
          return;
        }
        
        for(let pkI=0; pkI < passKey.length; pkI++) {
          if(passKey.charAt(pkI) =='x' ) {
            setHasPasswordList(true);
            return;
          }
        }

        alert("Welcome to iDojo's Passwords Manager. Please enter your PIN/Password to proceed.");
        return;
      }
    } catch(error) {
      alert("Error trying to find PIN!!!"+error);
      return; 
    }
  }
  

  useEffect(() => {
 
    fetchPasswords();
  }, []);


  const showConfirmDialog = () => {
    Alert.alert(
      "Confirm Reset!",
      "Are you sure you want to: Reset All Passwords?",
      [
        {
          text: "Cancel",
          onPress: () => setPinConfirm(""),
          style: "cancel" // Applies 'cancel' style for iOS (places it correctly)
        },
        {
          text: "OK",
          onPress: () => resetPasswords()
        }
      ],
      { cancelable: false } // Prevents closing the alert by tapping outside
    );
  };


  const closeOverlay = () => {
    setOverlayVisible(false);
  };
  
  const openOverlay = () => {
    setOverlayVisible(true);
  };


  const resetPasswords = async () => {
    let errorFlag = 0;
    try {
      const passKey = await AsyncStorage.getItem('xx7771xxiDojoAESpassKey');

      if(passKey==null) {
        alert("Successfully deleted PIN, found no Passwords to delete.");
        await AsyncStorage.setItem('xx7771xxiDojoAESpassKey', 'o');
        setHasPasswords(false);
        await AsyncStorage.clear();
        return;
      }

      for(let i = 0; i < passKey.length; i++) {
        try {
          if(passKey[i] =='x' ) {
            await AsyncStorage.removeItem('xx7771xxiDojoPassword'+i);
            await AsyncStorage.removeItem('xx7771xxiDojoWebsite' +i);
            await AsyncStorage.removeItem('xx7771xxiDojoUsername'+i);
            errorFlag++;
          }
        } catch(error) {
          continue; 
        }
      }
      
      if(errorFlag == 0) {
        setHasPasswords(false);
        await AsyncStorage.clear();
        await AsyncStorage.setItem('xx7771xxiDojoAESpassKey', 'o');
        alert("Successfully deleted PIN, found 0 Passwords to delete.");
        return;
      }
      
      await AsyncStorage.removeItem('xx7771xxiDojoPIN');
      await AsyncStorage.clear();
      await AsyncStorage.setItem('xx7771xxiDojoAESpassKey', 'o');
    
    } catch(error) {
      alert("Error deleting PIN :"+error);
    }

    setHasPasswords(false);
    alert("Successfully deleted PIN and ALL "+errorFlag+" Passwords."); 
  }



  const checkPin = async () => {
    try{
      
      if(pin && pin.length < 4) {
        alert("PIN entered is too short!");
        setPin("");
        return;
      }

      const savedPIN = await AsyncStorage.getItem('xx7771xxiDojoPIN');

      if(pin && savedPIN) {
        const cleanPIN = savedPIN.trim();
        //const cleanPIN = cleanString.replace(/[^0-9.]/g, '');
        //console.log("Your PIN :"+cleanPIN);
        if(pin.length != cleanPIN.length) {
          alert("PIN entered does not match with what is saved. Try Again!");
          setPin("");
          return;
        }

        for (let index = 0; index < pin.length; index++) {
          if(pin[index] != cleanPIN[index]) {
            setPin("    ")
            alert("PIN entered does not match with what is saved. Try Again");
            setPin("");
            return;
          }
        }
        
        setPin("");
        navigation.navigate('PasswordManager');

      } else {
        alert("Please submit a PIN as a Master Passord for the Password Manager.");
        setPin("");
        setHasPasswords(false);
        return;
      }

    } catch(error) {
      alert("No PIN is found!! Please submit a PIN as a Master Passord for the Password Manager.");
      setPin("");
      setHasPasswords(false);
      return;
    }    
  }


  const savePin = async () => {
    if(pin) {
      if( (pin.length != pinConfirm.length) || (pin.length < 4) || (pinConfirm.length < 4)) {
        alert("A PIN is too short or lengths dont match!");
        setPin("");
        setPinConfirm("");
        return;
      }

      for (let index = 0; index < pin.length; index++) {
        if(pin[index] != pinConfirm[index]) {
          alert("PINs do not match !");
          setPin("");
          setPinConfirm("");
          return;
        }
      }

      await AsyncStorage.setItem('xx7771xxiDojoPIN', pin);
      await AsyncStorage.setItem('xx7771xxiDojoAESpassKey', 'o');
      setPin("");
      setPinConfirm("");
      setHasPasswords(true);
      navigation.navigate('PasswordManager');
    }  
  }



  return (
    <SafeAreaView style={{ flex: 1, height: "100%", marginTop:25, backgroundColor:'lightgrey', backgroundColor: 'rgba(211, 211, 211, 0.1)',}}>
      <View style={{backgroundColor: 'transparent', marginBottom:19, paddingBottom:7, opacity: 1}}>
        <ImageBackground style={ styles.loginscreentitle } resizeMode='contain' source={require('../assets/loginscreentitle.png')} />
        <StatusBar style='light' />
      </View>

      {!hasPasswords ? 
        ( <View style={styles.container}>
          <Image style={styles.image} resizeMode='contain' source={require('../assets/icon.png')}/>

          <View style={styles.inputview} > 
            <TextInput
              style={styles.textinput} 
              placeholder="Enter PIN/Password"
              placeholderTextColor= "#003f5c"
              securetextEntry={true}
              onChangeText= {(pin)=>setPin(pin)}
            />
          </View>

          <View style={styles.inputview} > 
            <TextInput
              style={styles.textinput} 
              placeholder="Confirm PIN/Password"
              placeholderTextColor= "#003f5c"
              securetextEntry={true}
              onChangeText= {(pinConfirm)=>setPinConfirm(pinConfirm)}
            />
          </View>  
        
          <TouchableOpacity onPress={() => navigation.popToTop()} style={ styles.backButton }>
            <ImageBackground style={{ flex:1, height:"auto", width:"auto", }} resizeMode='contain' source={require('../assets/backicon.png')}/>         
          </TouchableOpacity> 

          <TouchableOpacity
              style={{height:67, width:"80%",alignSelf:"center", backgroundColor:"transparent", marginTop: 43,}}
              onPress={savePin}>
                <ImageBackground style={{flex:1, height:"auto", width:"auto",}} resizeMode='contain' source={require('../assets/loginbutton.png')} />
            </TouchableOpacity>
        </View> ) 

        :  ( <View style={styles.container}>
            <Image style={styles.image} resizeMode="contain" source={require('../assets/icon.png')}/>
            <StatusBar style='light' />

            <View style={styles.inputview} > 
              <TextInput
                style={styles.textinput} 
                placeholder="Enter PIN/Password"
                placeholderTextColor= "#003f5c"
                securetextEntry={true}
                onChangeText= {(pin)=>setPin(pin)}
              />
            </View> 
        
            { hasPasswordList && !isOverlayVisible ? ( <TouchableOpacity
                style={{height:43, width:"61%", alignSelf:"center", backgroundColor:"transparent",}}
                onPress={openOverlay}>
                  <ImageBackground style={{flex:1, height:"auto", width:"auto",}} resizeMode='contain' source={require('../assets/resetpwrds.png')} />
              </TouchableOpacity> 
              ) : isOverlayVisible && (
                <View  style={{flex:1, flexDirection:"row"}}>
                  <TouchableOpacity
                    style={{height:27, width:"43%", alignSelf:"center", backgroundColor:"transparent", marginLeft:19,}}
                    onPress={resetPasswords}>
                      <ImageBackground style={{flex:1, height:"auto", width:"auto",}} resizeMode='contain' source={require('../assets/confirmbutton.png')} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={{height:27, width:"34%", alignSelf:"center", backgroundColor:"transparent",}}
                    onPress={closeOverlay}>
                      <ImageBackground style={{flex:1, height:"auto", width:"auto",}} resizeMode='contain' source={require('../assets/cancelbutton.png')} />
                  </TouchableOpacity>
                </View> )
            }

            <TouchableOpacity
              style={{height:67, width:"80%",alignSelf:"center", backgroundColor:"transparent", marginTop: 43,}}
              onPress={checkPin}>
                <ImageBackground style={{flex:1, height:"auto", width:"auto",}} resizeMode='contain' source={require('../assets/loginbutton.png')} />
            </TouchableOpacity>
          </View> )
      }
    </SafeAreaView>
  )}

  const styles = StyleSheet.create({
    container: {
      justifyContent: 'center',
      flex: 1,
      backgroundColor:'transparent',
      alignItems: "center",
    },
    image: {
      height: 99,
      width: 114,
      elevation: 4,
      borderRadius: 19,
      marginBottom:38,
    },
    inputview: {
        fontSize: 13,
        borderRadius:30,
        width:"70%",
        height: 45,
        marginBottom: 20,
        backgroundColor: 'goldenrod',
    },
    textinput: {
        flex: 1,
        height: 50,
        padding: 10,
        marginleft: 20,
        color: "black",
        fontWeight:"bold",
    },
    resetpasswords: {
      height: 45,
      marginBottom: 20,
      fontWeight:"semibold",
    },
    loginbutton: {
      width:"80%",
      borderRadius: 25,
      height: 50,
      justifyContent: 'center',
      alignItems: "center",
      marginTop: 40,
      backgroundColor: "green",
    },
    logintext: {
      color: "#c58c3dff", // White text color
      textAlign: "center", // Center align the text
      fontWeight:"bold",
    },
    loginscreentitle: {
        height: 76,
        marginTop: 38,
        width: "100%", 
      },
      title: {
        fontSize: 30, 
        color:'crimson',
        borderColor:'#FFc0CB',
        fontWeight:"500",
        borderWidth: 2,
        backgroundColor:'#acd4c4',
        fontSize: 24,
        lineHeight: 32,
        textAlign:"center",
        marginTop: 4,
    },
    header: {
        fontSize: 24, 
        color:'#fff',
        fontWeight:"bold",
        backgroundColor:'#228B22',
        fontSize: 18,
        lineHeight: 28,
        textAlign:"center",
        marginTop: 3,
        marginLeft:3,
        marginRight: 3,
    },
    button: {
        alignItems: 'center',
        flexDirection: "row",
        justifyContent: 'center',
        paddingVertical: 2,
        paddingHorizontal: 3,
        borderRadius: 6,
        elevation: 5,
        backgroundColor: '#acd4c4',
        marginBottom: 5,
        marginLeft: 5,
        marginTop:5,
        height: 38,
        fontWeight: 'bold', 
    },
    text: {
        fontSize: 14,
        lineHeight: 22,
        fontWeight: '400',
        marginTop: 0,
        marginLeft:3,
        backgroundColor: 'lightgray',
        color: '#000',
    },
      mainCardView: {
        height: 190,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: "darkslategray",
        borderRadius: 15,
        shadowColor: "#000",
        shadowOffset: {width: 0, height: 0},
        shadowOpacity: 1,
        shadowRadius: 8,
        elevation: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingLeft: 16,
        paddingRight: 14,
        marginTop: 1,
        marginBottom: 1,
        marginLeft: 1,
        marginRight: 5,
        borderColor: "#228b22",
        borderWidth:1,
      },
    // Style for the back button
    backButton: {
        backgroundColor: "transparent", // Blue background
        borderRadius: 7, // Slightly rounded corners
        padding: 2, // Add padding inside the button
        marginLeftt: 10, // Space to the right of the button
        borderWidth: 2, // Border width
        borderColor: "goldenrod",
        elevation: 7,
        height: 47,
        width:45,
        shadowColor: "#000",
        shadowOffset: {width: 0, height: 0},
        shadowOpacity: 1,
        shadowRadius: 8,
    },
})