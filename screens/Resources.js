import { StyleSheet, Text, View, SafeAreaView, ImageBackground } from 'react-native'
import React from 'react'

export default function Resources() {
  return (
    <ImageBackground style={ styles.imgBackground } resizeMode='cover' source={require('../assets/fightersbackground.jpeg')}>
    <SafeAreaView style={{ flex: 1, height: "100%", marginTop:25, backgroundColor: 'transparent',}}>
    <View style={{marginTop:120}}>

      <Text>Resources</Text>
      <Text>Thank You for using iDojo. Special thanks to all those involved. </Text>
    
    </View>
    </SafeAreaView>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({})