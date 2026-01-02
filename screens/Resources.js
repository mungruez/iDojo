import { StyleSheet, Text, View, SafeAreaView, ImageBackground, TouchableOpacity, ScrollView } from 'react-native'
import { useNavigation } from '@react-navigation/native';
import React, { useState, useEffect} from 'react';
import { Audio } from 'expo-av';

export default function Resources() {
  const navigation = useNavigation();
  const [ksound, setKSound] = useState();

  useEffect(() => {
    loadKSound(); 
    
    return () => {
      if (ksound) {
        ksound.unloadAsync();
      }
    };
  }, []); 


  async function loadKSound() {
      try {
        await Audio.setAudioModeAsync({
          allowsRecording: false,
          //interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
          shouldDuckAndroid: true,
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          //interruptionModeIOS: Audio.InterruptionModeIOS.MixWithOthers,
          playThroughEarpieceAndroid: false,
        });
          
        const { sound } = await Audio.Sound.createAsync(
            require('../assets/woosh.mp3')
        );
        setKSound(sound);
  
      } catch (error) {
        alert('Error loading or playing sound effect: '+error);
      }
  }
  
  
  const navKSound = async () => {
    try {
      if( ksound ) {
        await ksound.playAsync();
      } else {
        const { sound } = await Audio.Sound.createAsync(require('../assets/woosh.mp3'));
        if(sound) {
          await sound.playAsync();
        }
      }
    } catch (error) {
      alert('Error playing sound effect:'+error);
    }
    navigation.navigate('LoginScreen');
  };


  return (
    <ImageBackground style={ styles.imgBackground } resizeMode='stretch' source={require('../assets/greentextbackground.png')}>
      <SafeAreaView style={{ flex: 1, height: "100%", marginTop:25, backgroundColor: 'transparent',}}>

      <View style={{backgroundColor: 'transparent', marginBottom:19, paddingTop:1, paddingBottom:7,}}>
        <ImageBackground style={ styles.icon } resizeMode='contain' source={require('../assets/resourcestitle.png')} /> 
      </View> 

      <ScrollView style={{ flexDirection:"column", marginTop:5, marginBottom:19, }}>
        <View style={{marginTop:2, borderColor:'silver', borderWidth:1, borderRadius:7, marginBotton:19}}>
<Text style={ styles.title }> Thank you for downloading the iDojo mobile App by DojoSoft, we hope you have learned about Self Defense. Special thanks to all involved, a lot of time and effort was put into making the App. 
  Thanks to: The World Boxing Federation, MMA and UFC for giving us the opportunity to analyse the best fighters of all time and their fighting styles. Use the volume buttom(top right) to control sounds, videos can be played in slow motion, wifi is only needed for the Featured List. Most of all be careful when trying out these moves and have fun. 
  Disclaimer: This App does not collect any data from the device it is installed on or any device.    
</Text>
<Text style={ styles.title }>Years of research into accumulating the best audio and graphics for self defense moves made iDojo a work of art. All future upgrades will be free as the main goal is to teach Self Defense to those who would use it only when required. DojoSoft`s continues to innovate by placing an invisible button in this iDojo App that will launch a secret password Manager App. DojoSoft promises to be the best Self Defense mobile App by releasing meaningful upgrades in the future. 
</Text>
<Text style={ styles.movesList }>Moves List: </Text>
<Text style={ styles.title }> A list of over 80 videos of moves with audio and text instructions. Each video was carefully edited to contain a description with an AI Morpheus voice and can be slowed to view the move in slow motion.</Text>
<Text style={ styles.fightersList }>Fighters List: </Text>
<Text style={ styles.title }> A first time ever list of the best fighters of all time. Each fighter was hand picked and carefully researched by DojoSoft before being added to the list. DojoSoft only considers real life, Fighting styles that effective and are practised for Self Defense. 
</Text>
<Text style={ styles.manuals }>Manuals: </Text>
<Text style={ styles.title }>A list of over 100 moves for Self Defense training. Each move has step by step instructions with images to make learning moves easier. 
</Text>
<Text style={ styles.featured }>Featured: </Text>
<Text style={ styles.title }>DojoSoft's hand picked list of online videos and shorts for Self Defense. Whether your looking for one to one paid training or just a quick watch and learn this iDojo's Featured List has it. Each video must meet certain criteria in order to be considered effective Self Defense. WiFi is necessary for this section as Featured videos are copyrighted. Please contact us on social media to have your suggested videos in our Featured List.
</Text>
<Text style={ styles.freeyourmind }>Free Your Mind: </Text>
<Text style={ styles.title }>Audio for a healthy mind to help with learning Self Defense. Each Audio must meet certain requirements in order to be selected as stoic, heart touching, motivation to free your mind.
          </Text>
        </View>
      </ScrollView>

    <TouchableOpacity
        style={styles.invisiblebtn}
        onPress={() => navKSound()}>
        <View style={styles.buttonArea} />                     
    </TouchableOpacity>

    </SafeAreaView>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  imgBackground: {
    width: '100%',
    height: '100%',
    flex: 1,
    opacity: 1, 
  },
  title: {
    fontSize: 15,
    fontWeight:'medium',
    color:'white',
    backgroundColor:'lightgrey',
    backgroundColor: 'rgba(211, 211, 211, 0.1)',
    marginLeft:19,
    marginRight:19,
    marginTop:12,
    padding: 5,
  },
  text: {
    fontSize: 19,
    fontWeight:'400',
    color:'white',
    backgroundColor:'#2f4f4f',
    margin:5,
    borderColor:'silver',
    borderWidth:1.5,
    borderRadius:5
  },
  icon: {
    height: 76,
    elevation: 4,
    marginTop:38,
    textAlign: "center",
    zIndex:3 
  },
  invisiblebtn: {
    background: "transparent",
    border: "none",
    width: 38,   
    height: 38,
    visibility: "hidden",   
    position: "absolute",
    bottom: 19,
    right: 19,
  },
  buttonArea: {
    flex: 1,
  },
  movesList: {
    textDecorationLine: 'underline',
    textDecorationColor: 'red',
    color:'red',
    fontSize: 19,
    fontStyle: "italic",
    fontWeight:'600',
  },
  fightersList: {
    textDecorationLine: 'underline',
    textDecorationColor: 'yellow',
    fontStyle: "italic",
    color:'yellow',
    fontSize: 19,
    fontWeight:'600',
  },
  manuals: {
    textDecorationLine: 'underline',
    textDecorationColor: 'green',
    fontStyle: "italic",
    color:'green',
    fontSize: 19,
    fontWeight:'600',
  },
  featured: {
    textDecorationLine: 'underline',
    textDecorationColor: 'silver',
    fontStyle: "italic",
    fontSize: 19,
    color:'silver',
    fontWeight:'600',
  },
  freeyourmind: {
    textDecorationLine: 'underline',
    textDecorationColor: 'purple',
    fontStyle: "italic",
    backgroundColor: 'transparent',
    color:'purple',
    fontSize: 19,
    fontWeight:'600',
  },
})