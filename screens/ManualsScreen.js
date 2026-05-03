import { StyleSheet, Text, View, ImageBackground, FlatList, Pressable, Image, TouchableOpacity, StatusBar, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {manuals} from '../data/manuals';
import React, { useState} from 'react';
import { useNavigation } from '@react-navigation/native';
import { useAudioPlayer } from 'expo-audio';

const ksoundFile = require('../assets/woosh.mp3'); 

export default function ManualsScreen() {
  const [isMuted, setIsMuted] = useState(false);
  const navigation = useNavigation();  

  const kplayer = useAudioPlayer(ksoundFile, (kplayer) => {
      kplayer.loop = false; 
  });
  

  async function stopSound() {
    try {
      if (kplayer && isMuted && !kplayer.playing) {
        kplayer.seekTo(0);
        kplayer.play();  
      }
    } catch (error) {
      alert("Error pausing or un-pausing sound");
    }
    setIsMuted(!isMuted);
  }

  
  const navKSound = (item) => {
      try {
        if(!isMuted && kplayer) {
          kplayer.seekTo(0);
          kplayer.play();
        }
      } catch (error) {
          alert("Error playing sound effect");
      }
      navigation.navigate("Manual", {manual: item});
  };


  return (
    <ImageBackground style={ styles.imgBackground } imageStyle={{ opacity: 1 }} resizeMode='stretch' source={require('../assets/fightersbackground.jpeg')}>
      <StatusBar barStyle="light-content" backgroundColor="#269b26"  /> 
      <SafeAreaView style={{ flex: 1, marginTop:25}}>

        <View style={{backgroundColor: 'black', marginBottom:19, paddingTop:0, borderRadius: 7,}}>
          
          <ImageBackground style={ styles.icon } resizeMode='contain' source={require('../assets/manualstitle.png')} >
            <View style={{flexDirection:"row", position: "relative", backgroundColor:"transparent", height: 47,}}>
              
              <TouchableOpacity onPress={stopSound} style={{position:"absolute", top: 38, right:9, zIndex:2, height: 42, width: 38, elevation:8, backgroundColor:"transparent", opacity:1}}>
                <ImageBackground style={ styles.imgSound } resizeMode='contain' source={isMuted ? require('../assets/soundoffbutton.png') : require('../assets/soundonbutton.png')}/>         
              </TouchableOpacity>  
            </View>
          </ImageBackground> 
        </View>    
        
       
              <FlatList
                data={manuals}
                numColumns={1}
                style={{flex: 1}}
                contentContainerStyle={{ paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
                renderItem={({ item, index }) => (
                  <View
                    key={item.title}
                    style={{
                      alignItems: "flex-start",
                      borderColor: "#228b22",
                      borderWidth: 2,
                      borderRadius: 12,
                      flex: 1,
                      justifyContent: "space-between",
                      flexDirection: "column",
                      marginTop: 5,
                      marginLeft: 21,
                      width: "90%",
                      borderWidth: 0,
                      backgroundColor: '#2f4f4f',
                    }}
                  >
              
                <Pressable
                  onPress={() => navKSound(item)}>

                    <View style={styles.box}>
                      <Image style={styles.image} source={item.steps[0].img} />
                      <Text style={styles.username}>{item.title}</Text>
                      <Text
                        style={{
                          color: '#9a9aa1',
                          fontSize: 12,
                          alignSelf: 'flex-end',
                          textAlignVertical:'bottom'
                        }}>
                          {item.style}
                      </Text>
                    </View>
              </Pressable>
            </View>)}
          />
    </SafeAreaView>
  </ImageBackground>
  )
}


const styles = StyleSheet.create({
      imgBackground: {
        width: '100%',
        height: "95%",
        flex: 1,
        opacity: 1,
      },
      icon: {
        height: 57,
        opacity: 1,
        marginTop: 38,
        textAlign: "center" 
      },
      mainCardView: {
        height: 304,
        width: "100%",
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: "#2f4f4f",
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: {width: 0, height: 0},
        shadowOpacity: 1,
        shadowRadius: 5,
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
        borderWidth: 2,
      },
      subCardView: {
        height: 285,
        width: "100%",
        marginLeft:-15,
        borderRadius: 8,
        backgroundColor: "slategray",
        color: 'crimson',
        borderWidth: 0,
        borderStyle: 'solid',
        alignSelf: 'center',
        justifyContent: 'center',
        marginRight:9,
        padding:0,
      },
      image: {
        width: 95,
        height: 101,
        borderColor: "#1b681b",
        borderWidth: 2,
        borderRadius: 12,
      },
      name: {
        fontSize: 22,
        color: '#FFFFFF',
        fontWeight: '600',
      },
      body: {
        padding: 5,
        backgroundColor: '#E6E6FA',
      },
      box: {
        padding: 5,
        marginTop: 1,
        marginBottom: 1,
        borderColor: "#228b22",
        borderWidth: 2,
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        shadowColor: 'black',
        shadowOpacity: 0.2,
        shadowOffset: {
          height: 1,
          width: -2,
        },
        elevation: 2,
        flexWrap:'wrap',
        width: "100%",
      },
      username: {
        color: 'darkgreen',
        fontSize: 14,
        alignSelf: 'flex-start',
        marginLeft: 4,
        flexWrap: 'wrap',
        flex:1,
        fontWeight:"500"
      },
      imgSound: {
      height: "100%",
      width: "100%",
    },
})