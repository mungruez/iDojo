import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ManualScreen({ route, navigation }) {
    const { manual } = route.params;
    const bgColor = ['lightpurple','lightblue','skyblue','yellow','lightgreen','gold','silver','brown','crimson']

  return (
    <SafeAreaView>
      <Text style={{ backgroundColor:'#2f4f4f',color:"crimson",textAlign:"center",fontSize:21,marginBottom:19, marginTop:38 }}>
          {manual.title}
      </Text>

      {manual.steps.map((step, index) => {
            return (
              <View style={{backgroundColor: index<1 ? 'silver' : bgColor[Math.floor(Math.random()*bgColor.length)],fontSize:16}}>
                <Text>{step.title}</Text>
                <Image
                  source={step.img}
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
                <Text>{step.desc}</Text>
              </View>
            );
    })}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({})