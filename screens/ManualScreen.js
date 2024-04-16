import { StyleSheet, Text, View, Image, ScrollView } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ManualScreen({ route, navigation }) {
    const { manual } = route.params;
    const bgColor = ['khaki','palegoldenrod','goldenrod','orange', 'gold','cornflowerblue','peru','darkgoldenrod','darkorange ','tan','chocolate', 'brown']

  return (
    <SafeAreaView style={{ backgroundColor:'#2f4f4f'}}>

      <Text style={{ backgroundColor:'#2f4f4f',color:"crimson",textAlign:"center",fontSize:21,marginBottom:19, marginTop:38 }}>
          {manual.title}
      </Text>
      <ScrollView>
      {manual.steps.map((step, index) => {
            return (
              <View style={{backgroundColor: bgColor[index], fontSize:19}}>
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
    </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({})