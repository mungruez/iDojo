import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const images = require.context('../assets/fighters', true, /\.png$/);

const imageSources = images.keys().map((key) => images(key));

export default function Fighter({ route, navigation }) {
  const { fighter,offset } = route.params;
  const bgColor = ['purple','red','blue','yellow','green','gold','silver','brown','crimson']

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor:'#323232',width:'100%', height:'100%' }}>
     <Text style={{ backgroundColor:'#2f4f4f',color:"crimson",textAlign:"center",fontSize:21,marginBottom:169 }}>
      {fighter.name}
     </Text>
     
     {fighter.desc.map((quote, index) => {
            return (
              <View>
                <Text style={{backgroundColor: index<1 ? 'black' : bgColor[Math.floor(Math.random()*bgColor.length)],fontSize:16}}>{quote}</Text>
              </View>
            );
    })}

    {fighter.moves.map((move, index) => {

            return (
              <View style={{backgroundColor: index<1 ? 'black' : bgColor[Math.floor(Math.random()*bgColor.length)],fontSize:16}}>
                <Text>{move.title}</Text>
                <Image
                  source={imageSources[index+offset]}
                  resizeMode="cover"
                  style={{
                   borderRadius: 12,
                   alignSelf: 'flex-start',
                   marginTop:0,
                   marginLeft:0,
                   height: 130,
                   width: 180,
                  }}
                />
                <Text>{move.desc}</Text>
              </View>
            );
    })}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({})