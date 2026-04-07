import { StyleSheet, Text, View, Image, ScrollView, StatusBar } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react'

const images = require.context('../assets/fighters', true, /\.png$/);

const imageSources = images.keys().map((key) => images(key));


export default function Fighter({ route, navigation }) {
  const { fighter,offset } = route.params;
  const bgColor = ['khaki', 'sandybrown', 'bisque', 'honeydew', 'darkkhaki', 'oldlace', 'papayawhip', 'lavender', 'wheat', 'mintcream', 'aliceblue', 'goldenrod', 'tan', 'lightsteelblue', 'burlywood', 'palegoldenrod', 'beige', 'azure'];


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bgColor[Math.floor(Math.random()*bgColor.length)], width:'100%', height:'100%' }}>
      <StatusBar barStyle="dark-content"/>
      <ScrollView style={{marginBottom: 38, marginTop: 19, padding: 7}}>

        <Text style={{ backgroundColor:'#2f4f4f', color: "crimson", textAlign:"center", fontSize: 21, marginBottom: 19, marginTop: 38 }}>
          {fighter.name}
        </Text>

        <View style={{ marginBottom:9, textAlign:"center"}}>
          <Image
              source={fighter.avatar}
              resizeMode="contain"
              style={styles.fighterAvatar}
          />
        </View>

        {fighter.desc.map((quote, index) => {
          return (
            <View key={index}>
              <Text style={{backgroundColor: bgColor[Math.floor(Math.random()*bgColor.length)], fontSize: 16, color: "black", fontWeight: "semibold"}}>{quote}</Text>
            </View>
          );
        })}

        {fighter.moves.map((move, index) => {
          return (
            <View key={move.title} style={{backgroundColor: bgColor[Math.floor(Math.random()*bgColor.length)], fontSize: 16}}>
              <Text>{move.title}</Text>
              <Image
                source={move.img}
                resizeMode="contain"
                style={styles.fighterImage}
              />
              <Text style={{color: "black", fontWeight: "semibold"}}>{move.desc}</Text>
            </View>
          );
        })}
    </ScrollView>
  </SafeAreaView>
  )
}


const styles = StyleSheet.create({
  fighterImage: {
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 0,
    margin: 0,
    height: 490,
    maxWidth: 380, 
  },
  fighterAvatar: {
    borderRadius: 12,
    marginBottom: -30,
    marginTop: 0,
    marginLeft: 57,
    height: 380,
    width: 228, 
  },
})