import { StyleSheet, Text, View, SafeAreaView, ImageBackground } from 'react-native'
import React from 'react'

export default function Resources() {
  return (
    <ImageBackground style={ styles.imgBackground } resizeMode='stretch' source={require('../assets/greentextbackground.png')}>
    <SafeAreaView style={{ flex: 1, height: "100%", marginTop:25, backgroundColor: 'transparent',}}>
    <View style={{backgroundColor: 'transparent', marginBottom:30, paddingTop:-10, paddingBottom:20,}}>
          <ImageBackground style={ styles.icon } resizeMode='contain' source={require('../assets/resourcestitle.png')} /> 
        </View> 

    <View style={{marginTop:2}}>
      <Text style={ styles.title }> Thank you for downloading iDojo mobile App, we hope you learned about self defense. Special thanks to all those involved, a lot of time and effort was put into making the App .  Thanks the World Boxing Federation, MMA and UFC for giving us the opportunity to analyse the best fighters of all time and their fighting styles. </Text>
    </View>

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
    fontSize: 17,
    fontWeight:'500',
    color:'darkblue',
    backgroundColor:'lightgrey',
    margin:5,
    borderColor:'silver',
    borderWidth:1.5,
    borderRadius:5,
  },
  text: {
    fontSize: 19,
    fontWeight:'400',
    color:'white',
    backgroundColor:'#2f4f4f',
    margin:5,
    borderColor:'silver',
    borderWidth:1.5,
    borderRadius:5,
  },
  icon: {
    height: 76,
    opacity: 1,
    marginTop:38,
    textAlign: "center",
    zIndex:3 
  },
})