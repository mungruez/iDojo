import { StyleSheet, Text, View, ImageBackground, FlatList, Pressable, Image, SafeAreaView, Dimensions } from 'react-native'
import {fighters} from '../data/fighters'
import React, { useState, useEffect} from 'react';
import { useNavigation } from '@react-navigation/native'
import { Audio } from 'expo-av';

export default function FightersList() {
  const [ksound, setKSound] = useState();
  const navigation = useNavigation();
  

  async function stopSound() {
    try {
      if (ksound) {
        await ksound.stopAsync();
      }
      
    } catch (error) {
        alert('Error pausing or playing sound effect:'+error);
    }
  }



  useEffect(() => {
    loadKSound(); 
    
    return () => {
      stopSound();
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
          require('../assets/woosh.mp3'),
          { shouldPlay: true }
      );
      setKSound(sound);

    } catch (error) {
      alert('Error loading or playing sound effect: '+error);
    }
  }



  const navKSound = async (item) => {
    try {
      const { sound } = await Audio.Sound.createAsync(require('../assets/woosh.mp3'),
        { shouldPlay: true }
      );
      if(sound) {
        await sound.playAsync();
      }
    } catch (error) {
        alert('Error playing sound effect:'+error);
    }
    navigation.navigate('FighterScreen', {fighter: item, offset: 0});
  };


  return (
    <ImageBackground style={ styles.imgBackground } resizeMode='cover' source={require('../assets/fightersbackground.jpeg')}>
      <SafeAreaView style={{ flex: 1, height: "100%", marginTop:25, backgroundColor: 'transparent',}}>

        <View style={{backgroundColor: 'transparent', marginBottom:30, paddingTop:-10, paddingBottom:20,}}>
          <ImageBackground style={ styles.icon } resizeMode='contain' source={require('../assets/fighterslisttitle.png')} /> 
        </View>    
            <View style={{flexDirection:'row' ,flex:1}}>
              <FlatList
                data={fighters}
                numColumns={2}
                contentContainerStyle={{ paddingBottom: 57 }}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <View
                    key={item.name}
                    style={{
                      alignItems: "center",
                      flex:1,
                      justifyContent: "space-between",
                      flexDirection: "column",
                      alignItems: "top",
                      marginTop:7,
                      marginLeft:"1",
                      marginRight:"1",
                      width:"50%",
                      height:"auto",
                      borderColor:"transparent",
                      borderWidth:0,
                      backgroundColor:'#2f4f4f'
                    }}
                  >
              
                <Pressable
                  onPress={() => navKSound(item)}>
                    <View style={styles.mainCardView}>
                        <View style={{flexDirection: 'column', alignItems: 'flex-start', marginTop:0}}>
                          <Text>{item.name}</Text>
                          <View style={styles.subCardView}>
                                <Image
                                  source={item.avatar}
                                  resizeMode="contain"
                                  style={{
                                    borderRadius: 12,
                                    alignSelf: 'flex-start',
                                    marginTop:0,
                                    marginLeft:0,
                                    height: 130,
                                    width: 180,
                                  }}
                                />

                        <View style={{marginLeft: 12}}>
                            <Text
                              style={{
                                fontSize: 14,
                                color: "gold",
                                fontWeight: 'bold',
                                textTransform: 'capitalize',
                              }}>
                                {item.name}
                            </Text>
                            
                            <View
                              style={{
                                marginTop: 3,
                                borderWidth: .5,
                                borderColor:'#228b22',
                                flexDirection:'row',
                                backgroundColor:'#323232',
                                justifyContent:'space-between'
                              }}>
                                <Text
                                    style={{
                                       color: '#9a9aa1',
                                       fontSize: 12,
                                    }}>
                                    {item.style}
                                </Text>
                            </View>
                          </View>
                        </View>
                    </View>
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
        minHeight: '100%',
        height: Dimensions.get('window').height,
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
})