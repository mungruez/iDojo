import { StyleSheet, Text, View, Image, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react'

const images = require.context('../assets/fighters', true, /\.png$/);

const imageSources = images.keys().map((key) => images(key));

export default function Fighter({ route, navigation }) {
  const { fighter,offset } = route.params;
  const bgColor = ['lightpurple','lightblue','skyblue','yellow','lightgreen','gold','silver','brown','crimson']

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor:'#323232',width:'100%', height:'100%' }}>
        <ScrollView>
          <Text style={{ backgroundColor:'#2f4f4f',color:"crimson",textAlign:"center",fontSize:21,marginBottom:19, marginTop:38 }}>
            {fighter.name}
          </Text>
          <View style={{ marginBottom:9, textAlign:"center"}}>
            <Image
              source={fighter.avatar}
              resizeMode="contain"
                style={{
                  borderRadius: 12,
                  marginBottom:-30,
                  marginTop:0,
                  marginLeft:57,
                  height: 380,
                  width: 220,
                }}
            />
          </View>

     {fighter.desc.map((quote, index) => {
            return (
              <View>
                <Text style={{backgroundColor: index<1 ? 'black' : bgColor[Math.floor(Math.random()*bgColor.length)],fontSize:16}}>{quote}</Text>
              </View>
            );
    })}

    {fighter.moves.map((move, index) => {
            return (
              <View style={{backgroundColor: index<1 ? 'silver' : bgColor[Math.floor(Math.random()*bgColor.length)],fontSize:16}}>
                <Text>{move.title}</Text>
                <Image
                  source={move.img}
                  resizeMode="contain"
                  style={{
                   borderRadius: 12,
                   alignSelf: 'flex-start',
                   marginTop:0,
                   margin:0,
                   height: 490,
                   maxWidth: 380,
                  }}
                />
                <Text>{move.desc}</Text>
              </View>
            );
    })}

    </ScrollView>
  </SafeAreaView>
  )
}

const styles = StyleSheet.create({})