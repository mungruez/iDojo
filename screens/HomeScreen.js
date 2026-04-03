import { StyleSheet, View, Text, ScrollView, TouchableOpacity, ImageBackground, BackHandler, StatusBar, Dimensions} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useLayoutEffect, useState, useEffect} from 'react';
import { useNavigation } from '@react-navigation/native';
import { useAudioPlayer } from 'expo-audio';

const bgsoundFile = require('../assets/backgroundsound.mp3');
const ksoundFile = require('../assets/woosh.mp3');

export default function HomeScreen() {
  const [isMuted, setIsMuted] = useState(false);
  const navigation = useNavigation();
  
  const player = useAudioPlayer(bgsoundFile, (player) => {
    player.loop = true; 
    player.play();
  });

  const kplayer = useAudioPlayer(ksoundFile, (kplayer) => {
    kplayer.loop = false; 
  });

  useLayoutEffect(()=> {
    navigation.setOptions({
      headerShown: false,
    });
  }, []);


  async function stopSound() {
    try {
      if (!isMuted) {
        if (player.playing) {
          player.pause();
        } else {
          player.loop = true;
          player.play();
        }
      } else {
        player.loop = true;
        player.play();
      }
    } catch (error) {
        alert('Error pausing or un-pausing sound:'+error);
    }
    setIsMuted(!isMuted);
  }


  useEffect(() => {
    if(player && !player.playing && !isMuted) {
        player.loop = true;
        player.play();
      }

    const backAction = () => {
      if(player && player.playing && !isMuted) {
        player.pause();
      }
        
      return false; 
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => {
      backHandler.remove();
    };

  }, [player]); 



  const stopSoundN = async (sname) => {
    try {
      if(!isMuted) {
        if(kplayer) {
          kplayer.play();
        }

        if (player && player.playing && sname!=="Res" && sname!=="Manuals" && sname!=="FightersList") {
          player.pause();
          setIsMuted(true);
        }
      }

    } catch (error) {
        alert('Unable to pause background sound before going to next screen: '+error);
    }
    
    navigation.navigate(sname);
  };



  return (
    <ImageBackground style={ styles.imgBackground } resizeMode='cover' source={require('../assets/dojo1.jpeg')}>
      <StatusBar barStyle="dark-content"/>
      <View style={{flexDirection:"row", position: "relative"}}>
          <TouchableOpacity onPress={stopSound} style={{position:"absolute", top:10, right:10, zIndex:1, height: 42, width: 38}}>
            <ImageBackground style={ styles.imgSound } resizeMode='contain' source={isMuted ? require('../assets/soundoffbutton.png') : require('../assets/soundonbutton.png')}/>         
          </TouchableOpacity>
      </View> 

      <SafeAreaView style={{ flexDirection:"column", height: "100%", marginTop:19}}>
         
        <View style={{backgroundColor: '#2f4f4f', flexDirection:"row", marginHorizontal:3, marginVertical:19, textAlign:"center", justifyContent:"space-between"}}>
          <Text style={{color: "lightgray", fontWeight:"700",fontSize: 23, textAlign:"center", marginLeft:38, marginTop:10}}>Main Menu</Text>
          <ImageBackground style={ styles.icon } resizeMode='contain' source={require('../assets/icon.png')} /> 
        </View>

        <ScrollView style={{ flexDirection:"column", marginTop:57}}>
            <TouchableOpacity
              onPress={()=>stopSoundN('MoveList')}>
              <ImageBackground style={ styles.button } resizeMode='contain' source={require('../assets/redpillmoveslist.png')} />
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={()=>stopSoundN('Manuals')}>
              <ImageBackground style={ styles.button } resizeMode='contain' source={require('../assets/redpillmanuals.png')} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={()=>stopSoundN('MyDojoStyles')}>
              <ImageBackground style={ styles.button } resizeMode='contain' source={require('../assets/redpilladdmove.png')} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={()=>stopSoundN('FeaturedList')}>
              <ImageBackground style={ styles.button } resizeMode='contain' source={require('../assets/redpillfeatured.png')} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={()=>stopSoundN('FightersList')}>
              <ImageBackground style={ styles.button } resizeMode='contain' source={require('../assets/redpillfighterslist.png')} />
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={()=>stopSoundN('FreeYourMind')}>
              <ImageBackground style={ styles.button } resizeMode='contain' source={require('../assets/redpillfreeyourmind.png')} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.buttonimage}
              onPress={()=>stopSoundN('Res')}>
              <ImageBackground style={ styles.buttonres } resizeMode='contain' source={require('../assets/bluepillresources.png')} />
            </TouchableOpacity>  
        
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
    button: {
      alignItems: 'center',
      flexDirection: "row",
      justifyContent: 'center',
      paddingVertical: 0,
      paddingHorizontal: 0,
      borderWidth: 0,
      borderColor:"transparent",
      borderRadius: 25,
      elevation: 0,
      shadowColor:"transparent",
      marginBottom: 12,
      marginLeft:30,
      height: 57,
      width: 190,
      opacity: 1,
      shadowOpacity: 0,
      backgroundColor:"transparent",
    },
    buttonres:{
      alignItems: 'center',
      flexDirection: "row",
      justifyContent: 'center',
      paddingVertical: 0,
      paddingHorizontal: 0,
      borderRadius: 25,
      borderWidth:0,
      borderColor:"transparent",
      elevation: 0,
      backgroundColor: 'transparent',
      marginBottom: 12,
      marginLeft:25,
      height: 57,
      width: 193,
      opacity:1,
      shadowOpacity: 0,
    },
    buttonimage:{  
    alignItems: 'center',
    flexDirection: "row",
    justifyContent: 'center',
    paddingVertical: 0,
    paddingHorizontal:0,
    borderRadius: 25,
    elevation: 0,
    shadowColor:"transparent",
    shadowOpacity: 0,
    backgroundColor: 'transparent',
    marginBottom: 12,
    marginTop:5,
    marginLeft:15,
    height: 57,
    width: 190,
    opacity:1,
  },
    buttontext: {
      fontSize: 16,
      lineHeight: 21,
      fontWeight: '800',
      letterSpacing: 0.25,
      marginTop: 4,
      color: 'white',
      opacity:3,
      backgroundColor:"transparent"
    },
    imgBackground: {
      maxHeight: "91%",
      minWidth: "100%",
      height: Dimensions.get('window').height,
      flex: 1,
      opacity: .9,
      marginTop: "7%", 
    },
    imgSound: {
      height: "100%",
      width: "100%",
      flex: 1, 
    },
    icon: {
      height: 57,
      width: 76,
      elevation: 4,
      marginRight:1,
    },
  });