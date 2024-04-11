import { StyleSheet, Text, View, SafeAreaView, ImageBackground } from 'react-native'
import React from 'react'

export default function Resources() {
  return (
    <ImageBackground style={ styles.imgBackground } resizeMode='repeat' source={require('../assets/resbackground.png')}>
    <SafeAreaView style={{ flex: 1, height: "100%", marginTop:25, backgroundColor: 'transparent',}}>
    <View style={{marginTop:120}}>

      <Text style={ styles.title }>Resources</Text>
      <Text>We hope you learned about self defense. Thanks for downloading iDojo mobile App. Special thanks to all those involved, a lot of time and effort was put into making the App .  Thanks the World Boxing Federation, MMA and UFC for giving us the opportunity to analyse the best fighters of all time. </Text>
    
    </View>
    </SafeAreaView>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  imgBackground: {
    minWidth: '100%',
    minHeight: '100%',
    flex: 1,
    opacity: .8, 
  },
  title: {
    fontSize: 21,
    fontWeight:'700',
    color:'crimson',
    backgroundColor:'#2f4f4f',
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
  }
})