import { StyleSheet, View, Image, TextInput, TouchableOpacity, ImageBackground, StatusBar, Alert, Pressable,  UIManager, findNodeHandle, KeyboardAvoidingView, Platform} from 'react-native'
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

  const insideViewRef = React.useRef(null);

  const fetchPasswords = async () => {
    try {
      const savedPIN = await AsyncStorage.getItem('xx7771xxiDojoPIN');
      if(savedPIN==null) {

        let passKey = await AsyncStorage.getItem('xx7771xxiDojoAESpassKey');
        if(passKey==null) {
          setHasPasswordList(false);
          await AsyncStorage.setItem('xx7771xxiDojoAESpassKey', 'o');
          Alert.alert("Welcome to iDojo's Passwords Manager", " No Saved PIN or passwords found. Please enter a PIN or Password as your Master Password for all your saved passwords. PINs or Passwords should be at least 4 characters long with no slashes. PIN can only be changed after login.");
          return;
        }
                    
        for(let pkI=0; pkI < passKey.length; pkI++) {
          if(passKey.charAt(pkI) =='x' ) {
            setHasPasswordList(true);
            Alert.alert("Welcome to iDojo's Passwords Manager", " Passwords found! No PIN found. Please enter a PIN or Password as your Master Password to view your saved passwords.");
            return;
          }
        }

        Alert.alert("Welcome to iDojo's Passwords Manager", " No Saved PIN or Passwords found. please enter a PIN or Password as your Master Password for all your saved passwords.");
        setHasPasswordList(false);
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

        Alert.alert("Welcome Back", " Please enter your PIN/Password to proceed to iDojo's Passwords Manager.");
        return;
      }
    } catch(error) {
      Alert.alert("PIN Error", "Error trying to find PIN!!!"+error);
      return; 
    }
  }
  

  useEffect(() => {

    fetchPasswords();
  }, []);



  const handleGlobalTouch = (event) => {
    const insideViewNode = findNodeHandle(insideViewRef.current);
    const touchedNode = event?.nativeEvent?.target;
    if (insideViewNode && touchedNode !== insideViewNode) {
      UIManager.viewIsDescendantOf(touchedNode, insideViewNode, (isAncestor) => {
        if (!isAncestor) {
          closeOverlay();
        }
      });
    }
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
        Alert.alert("PIN Deleted","Successfully deleted PIN, found No Passwords to delete.");
        await AsyncStorage.setItem('xx7771xxiDojoAESpassKey', 'o');
        setHasPasswords(false);
        setHasPasswordList(false);
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
        setHasPasswordList(false);
        await AsyncStorage.clear();
        await AsyncStorage.setItem('xx7771xxiDojoAESpassKey', 'o');
        Alert.alert("PIN Deleted","Successfully deleted PIN, found 0 Passwords to delete.");
        return;
      }
      
      await AsyncStorage.removeItem('xx7771xxiDojoPIN');
      await AsyncStorage.clear();
      await AsyncStorage.setItem('xx7771xxiDojoAESpassKey', 'o');
    
    } catch(error) {
      Alert.alert("Delete Error", "Error deleting the PIN :"+error);
      setHasPasswords(false);
      setHasPasswordList(false);
      return
    }

    setHasPasswords(false);
    setHasPasswordList(false);
    Alert.alert("PIN Deleted", "Successfully deleted PIN and ALL "+errorFlag+" Passwords."); 
  }


  const checkPin = async () => {
    try{
      
      if(pin && pin.length < 4) {
        Alert.alert("PIN Too Short", "The PIN entered is too short!");
        setPin("");
        return;
      }

      const savedPIN = await AsyncStorage.getItem('xx7771xxiDojoPIN');

      if(pin && savedPIN) {
        const cleanPIN = savedPIN.trim();
        if(pin.length != cleanPIN.length) {
          Alert.alert("PIN Does Not Match", "PIN entered does not match with what is saved. Please try again.");
          setPin("");
          return;
        }

        for (let index = 0; index < pin.length; index++) {
          if(pin[index] != cleanPIN[index]) {
            setPin("")
            Alert.alert("PIN Does Not Match", "PIN entered does not match with what is saved. Please try again.");
            return;
          }
        }
        
        setPin("");
        setPinConfirm("");
        setHasPasswords(true);
        navigation.navigate('PasswordManager');

      } else {
        Alert.alert("Enter PIN", "Please enter your PIN to use the Password Manager.");
        setPin("");
        if(savedPIN) {
          return;
        }
        setHasPasswords(false);
        return;
      }

    } catch(error) {
      Alert.alert("No PIN Found", " Please submit a PIN as a Master Passord for the Password Manager.");
      setPin("");
      setHasPasswords(false);
      return;
    }    
  }

  const showConfirmDialog = () => {
    Alert.alert(
      "Confirm Reset!",
      "Are you sure you want to: Reset All Passwords?",
      [
        {
          text: "Cancel",
          onPress: () => setPinConfirm(""),
          style: "cancel" 
        },
        {
          text: "OK",
          onPress: () => resetPasswords()
        }
      ],
      { cancelable: false } 
    );
  };


  const savePin = async () => {
    if(pin) {
      if( (pin.length != pinConfirm.length) || (pin.length < 4) || (pinConfirm.length < 4)) {
        Alert.alert("PIN Do Not Match"," A PIN is too short or lengths do not match!");
        setPin("");
        setPinConfirm("");
        return;
      }

      for (let index = 0; index < pin.length; index++) {
        if(pin[index] != pinConfirm[index]) {
          Alert.alert("PINs Do Not Match", "PIN and the PIN confiem do not match !");
          setPin("");
          setPinConfirm("");
          return;
        }
      }

      await AsyncStorage.setItem('xx7771xxiDojoPIN', pin);
      setPin("");
      setPinConfirm("");
      setHasPasswords(true);
      navigation.navigate('PasswordManager');
    }  
  }


  return ( !hasPasswords ? ( 
    <SafeAreaView style={{ flex: 1, height: "100%", marginTop:25, backgroundColor:'lightgrey', backgroundColor: 'rgba(211, 211, 211, 0.1)',}}>
     <StatusBar barStyle="light-content" backgroundColor="#96891a"/>
     <KeyboardAvoidingView 
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
     >
      <View style={{ marginBottom:19, paddingBottom:7, opacity: 1}}>
        <ImageBackground style={ styles.loginscreentitle } resizeMode='contain' source={require('../assets/loginscreentitle.png')} />
        <StatusBar style='light' />
      </View>
      
      <View style={styles.container}>
        <Image style={styles.image} resizeMode='contain' source={require('../assets/icon.png')}/>

        <View style={styles.inputview} > 
          <TextInput
            style={styles.textinput} 
              placeholder="Enter PIN/Password"
              placeholderTextColor= "#003f5c"
              secureTextEntry={true}
              value={pin}
              onChangeText= {(pin)=>setPin(pin)}
          />
        </View> 

        <View style={styles.inputview} > 
            <TextInput
              style={styles.textinput} 
              placeholder="Confirm PIN/Password"
              placeholderTextColor= "#003f5c"
              secureTextEntry={true}
              value={pinConfirm}
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
      </View> 
     </KeyboardAvoidingView>
    </SafeAreaView>) 

    : isOverlayVisible ? (<Pressable style={{flex:1,}} onPress={handleGlobalTouch}> 
      <StatusBar style="light" backgroundColor="#96891a"/>
        <SafeAreaView style={{ flex: 1, height: "100%", marginTop:25, backgroundColor:'lightgrey', backgroundColor: 'rgba(211, 211, 211, 0.1)',}}>
         <KeyboardAvoidingView 
           style={{ flex: 1 }}
           behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
           keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
         >
          <View style={{backgroundColor: 'transparent', marginBottom:19, paddingBottom:7, opacity: 1}}>
            <ImageBackground style={ styles.loginscreentitle } resizeMode='contain' source={require('../assets/loginscreentitle.png')} />
            <StatusBar barStyle="light-content" backgroundColor="#96891a"/>
          </View>
          <View style={styles.container}>
            <Image style={styles.image} resizeMode="contain" source={require('../assets/icon.png')}/>
            <StatusBar style='light' />

            <View style={styles.inputview} > 
              <TextInput
                style={styles.textinput} 
                placeholder="Enter PIN/Password"
                placeholderTextColor= "#003f5c"
                secureTextEntry={true}
                value={pin}
                onChangeText= {(pin)=>setPin(pin)}
              />
            </View> 

                <View ref={insideViewRef} style={{flexDirection:"row", maxHeight:57, padding:0, width:"77%", marginTop:16,}}>
                  <TouchableOpacity
                    style={{height:27, width:"43%", alignSelf:"center", backgroundColor:"transparent", marginLeft:19,}}
                    onPress={showConfirmDialog}>
                      <ImageBackground style={{ height:"100%", width:"100%",}} resizeMode='contain' source={require('../assets/confirmbutton.png')} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={{height:27, width:"34%", alignSelf:"center", backgroundColor:"transparent",}}
                    onPress={closeOverlay}>
                      <ImageBackground style={{ height:"100%", width:"100%",}} resizeMode='contain' source={require('../assets/cancelbutton.png')} />
                  </TouchableOpacity>
                </View> 
            
            <TouchableOpacity
              style={{height:67, width:"80%",alignSelf:"center", backgroundColor:"transparent", marginTop: 43,}}
              onPress={checkPin}>
                <ImageBackground style={{height:"100%", width:"100%",}} resizeMode='contain' source={require('../assets/loginbutton.png')} />
            </TouchableOpacity>
          </View> 
         </KeyboardAvoidingView>
        </SafeAreaView>
        </Pressable>)

        : ( <SafeAreaView style={{ flex: 1, height: "100%", marginTop:25, backgroundColor:'lightgrey', backgroundColor: 'rgba(211, 211, 211, 0.1)',}}>
         <StatusBar barStyle="light-content" backgroundColor="#96891a"/>
         <KeyboardAvoidingView 
           style={{ flex: 1 }}
           behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
           keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
         >
          <View style={{backgroundColor: 'transparent', marginBottom:19, paddingBottom:7, opacity: 1}}>
            <ImageBackground style={ styles.loginscreentitle } resizeMode='contain' source={require('../assets/loginscreentitle.png')} />
            <StatusBar style='light' />
          </View>
            <View style={styles.container}>
              <Image style={styles.image} resizeMode="contain" source={require('../assets/icon.png')}/>
              <StatusBar style='light' />

              <View style={styles.inputview}> 
                <TextInput
                  style={styles.textinput} 
                  placeholder="Enter PIN/Password"
                  placeholderTextColor= "#003f5c"
                  secureTextEntry={true}
                  value={pin}
                  onChangeText= {(pin)=>setPin(pin)}
                />
              </View> 

            { hasPasswordList && ( <TouchableOpacity
              style={{height:43, width: "61%", alignSelf:"center", backgroundColor:"transparent",}}
              onPress={openOverlay}>
                <ImageBackground style={{ height: "100%", width: "100%",}} resizeMode='contain' source={require('../assets/resetpwrds.png')} />
            </TouchableOpacity> ) } 

            { !hasPasswordList && ( <TouchableOpacity
              style={{height:43, width: "61%", alignSelf:"center", backgroundColor:"transparent",}}
              onPress={openOverlay}>
                <ImageBackground style={{ height: "100%", width: "100%",}} resizeMode='contain' source={require('../assets/resetloginpin.png')} />
            </TouchableOpacity> ) }
            
            <TouchableOpacity
              style={{height: 67, width: "80%", alignSelf: "center", backgroundColor: "transparent", marginTop: 43,}}
              onPress={checkPin}>
                <ImageBackground style={{height:"100%", width:"100%",}} resizeMode='contain' source={require('../assets/loginbutton.png')} />
            </TouchableOpacity>
            </View>
         </KeyboardAvoidingView>
        </SafeAreaView>)
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
      color: "#c58c3dff", 
      textAlign: "center",
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
    backButton: {
        backgroundColor: "transparent", 
        borderRadius: 7, 
        padding: 1, 
        marginLeftt: 10, 
        borderWidth: 2, 
        borderColor: "goldenrod",
        elevation: 0,
        height: 76,
        width: 57,
        shadowColor: "#000",
        shadowOffset: {width: 0, height: 0},
        shadowOpacity: 1,
        shadowRadius: 8,
    },
})