import { StyleSheet, Text, View, Image, ScrollView, StatusBar } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react'

const images = require.context('../assets/fighters', true, /\.png$/);

const imageSources = images.keys().map((key) => images(key));


export default function Fighter({ route, navigation }) {
  const { fighter,offset } = route.params;
  const bgColor = ['khaki', 'sandybrown', 'bisque', 'honeydew', 'darkkhaki', 'oldlace', 'papayawhip', 'lavender', 'wheat', 'mintcream', 'aliceblue', 'goldenrod', 'tan', 'lightsteelblue', 'burlywood', 'palegoldenrod', 'beige', 'azure'];


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bgColor[Math.floor(Math.random()*bgColor.length)] }}>
      <StatusBar barStyle="dark-content"/>

      <ScrollView style={{flex: 1, marginBottom: 38, marginTop: 7, padding: 15}}>

        <Text style={{ backgroundColor:'#2f4f4f', color: "crimson", textAlign:"center", fontSize: 21, marginBottom: 7, marginTop: 7, fontWeight: "500", borderRadius: 4 }}>
          {fighter.name}
        </Text>

        <View style={{ marginBottom: 2, textAlign:"center"}}>
          <Image
              source={fighter.avatar}
              resizeMode="contain"
              style={styles.fighterAvatar}
          />
        </View>

        {fighter.desc.map((quote, index) => {
          return (
            <View key={index} style={{borderRadius: 19, padding: 12}}>
              <Text style={{backgroundColor: bgColor[Math.floor(Math.random()*bgColor.length)], fontSize: 15, color: "black", fontWeight: "600", padding: 7, borderRadius: 12}}>{quote}</Text>
              
              {index === fighter.desc.length - 1  && ( <View style={{marginTop: -12, marginBottom: 12, flex: 1 }}> 
                <Image source={require('../assets/silverdivider.png')} style={styles.divider} resizeMode='contain'/>
              </View> ) }

            </View>
          );
        })}

        {fighter.moves.map((move, index) => {
          return ( <View key={move.title} style={{marginBottom: 7, borderRadius: 7}}>
            <View style={{backgroundColor: bgColor[Math.floor(Math.random()*bgColor.length)], fontSize: 15, borderRadius: 7, padding: 4}}>
              <Text>{move.title}</Text>
              
              <Image
                source={move.img}
                resizeMode="contain"
                style={styles.fighterImage}
              />
              
              <Text style={{color: "black", fontWeight: "500", padding: 7, fontSize: 14}}> {move.desc} </Text>
              
              {index < fighter.moves.length - 1  && ( <View style={{marginTop: -12, marginBottom: 7, flex: 1 }}> 
                <Image source={require('../assets/silverdivider.png')} style={styles.divider} resizeMode='contain'/>
              </View> ) }

            </View>
          </View> );
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
    width: "100%", 
  },
  fighterAvatar: {
    borderRadius: 12,
    marginBottom: -7,
    marginTop: 0,
    marginLeft: 57,
    height: 380,
    width: 228, 
  },
  divider: { 
    width: '100%', 
    height: 49, 
    alignSelf: "center", 
    paddingVertical: 2, 
    opacity: 1 },
})