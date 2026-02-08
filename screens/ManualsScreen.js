import { StyleSheet, Text, View, ImageBackground, FlatList, Pressable, Image, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import {manuals} from '../data/manuals'
import React, { useState, useEffect} from 'react';
import { useNavigation } from '@react-navigation/native'
import { Audio } from 'expo-av';

export default function ManualsScreen() {
  const [sound, setSound] = useState();
  const [isMuted, setIsMuted] = useState(false);
  const navigation = useNavigation();  


  useEffect(() => {
    loadSound(); 
      
    return () => {
      if(!isMuted) {
        stopSound();
      }
    };

  }, []); 
  
  

  async function loadSound() {
    try {   
      const { sound } = await Audio.Sound.createAsync(
        require('../assets/woosh.mp3'),
        { shouldPlay: true }
      );
      await sound.playAsync();

    } catch (error) {
      alert('Error loading and playing sound effect: '+error);
    }
  }
    
  
  
  async function stopSound() {
    try {
      if (!isMuted) {
        if (sound && sound != null) {
          await sound.stopAsync();
        }
      } else {
        loadSound();
      }
    } catch (error) {
        alert('Error pausing or playing sound effect:'+error);
    }
    setIsMuted(!isMuted);
  }
  
  
  const navKSound = async (item) => {
    if(!isMuted) {
      loadSound();
    }
    navigation.navigate('Manual', {manual: item});
  };



  return (
    <ImageBackground style={ styles.imgBackground } resizeMode='contain' source={require('../assets/fightersbackground.jpeg')}>
      <SafeAreaView style={{ flex: 1, height: "100%", marginTop:25, backgroundColor: 'transparent',}}>

        <View style={{backgroundColor: 'black', marginBottom:19, paddingTop:0,borderRadius:7,}}>
          
          <ImageBackground style={ styles.icon } resizeMode='contain' source={require('../assets/manualstitle.png')} >
            <View style={{flexDirection:"row", position: "relative", backgroundColor:"transparent", height: 47,}}>
              
              <TouchableOpacity onPress={stopSound} style={{position:"absolute", top: 38, right:9, zIndex:2, height: 42, width: 38, elevation:8, backgroundColor:"transparent",}}>
                <ImageBackground style={ styles.imgSound } resizeMode='contain' source={isMuted ? require('../assets/soundoffbutton.png') : require('../assets/soundonbutton.png')}/>         
              </TouchableOpacity>  
            </View>
          </ImageBackground> 
        </View>    
        
            <View style={{flexDirection:'row' ,flex:1, padding: 1, backgroundColor:'transparent',}}>
              <FlatList
                data={manuals}
                numColumns={1}
                contentContainerStyle={{ paddingBottom: 57 }}
                showsVerticalScrollIndicator={false}
                renderItem={({ item, index }) => (
                  <View
                    key={item.title}
                    style={{
                      alignItems: "center",
                      flex:1,
                      justifyContent: "space-between",
                      flexDirection: "column",
                      alignItems: "top",
                      marginTop:2,
                      marginLeft:"1",
                      marginRight:"1",
                      width:"100%",
                      height:"auto",
                      borderColor:"transparent",
                      borderWidth:0,
                      backgroundColor:'#2f4f4f',
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
        </View> 
    </SafeAreaView>
  </ImageBackground>
  )
}


const styles = StyleSheet.create({
      imgBackground: {
        minWidth: '100%',
        height: '100%',
        flex: 1,
        opacity: 1,
      },
      icon: {
        height: 57,
        opacity: 1,
        marginTop:38,
        textAlign: "center" 
      },
      mainCardView: {
        height: 190,
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
        borderWidth:1,
      },
      subCardView: {
        height: 186,
        width: 180,
        marginLeft:-15,
        borderRadius: 8,
        backgroundColor: "slategray",
        borderColor: "transparent",
        color: 'crimson',
        borderWidth: 0,
        borderStyle: 'solid',
        alignSelf: 'center',
        justifyContent: 'center',
        marginRight:9,
        padding:0,
      },
      image: {
        width: 60,
        height: 60,
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
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        shadowColor: 'black',
        shadowOpacity: 0.2,
        shadowOffset: {
          height: 1,
          width: -2,
        },
        elevation: 2,
        flexWrap:'wrap'
      },
      username: {
        color: 'darkgreen',
        fontSize: 16,
        alignSelf: 'center',
        marginLeft: 4,
        flexWrap: 'wrap',
        flex:1,
        flexShrink:1,
        fontWeight:"500"
      },
      imgSound: {
      height: "undefined",
      width: "undefined",
      flex: 1, 
    },
})