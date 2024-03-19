import { StyleSheet, Text, View, ImageBackground } from 'react-native'
import React from 'react'

export default function FightersList() {
  return (
    <View style={{backgroundColor: '#9a9aa1', color:"#dc143c", marginBottom:20, paddingBottom:10, opacity: .7}}>
      <ImageBackground style={ styles.icon } resizeMode='contain' source={require('../assets/fighterslisttitle.png')} /> 
    </View>
  
  )
}

const styles = StyleSheet.create({
      icon: {
        height: 57,
        opacity: 1,
        textAlign: "center" 
      }
})