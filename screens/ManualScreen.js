import { StyleSheet, Text, View, Image, ScrollView, ImageBackground } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ManualScreen({ route, navigation }) {
    const { manual } = route.params;
    const bgColor = ['palegoldenrod', 'khaki','goldenrod','orange', 'gold','cornflowerblue','peru','darkgoldenrod','darkorange ','tan','chocolate', 'brown']

  return (
    <SafeAreaView style={{ backgroundColor:'black', flex:1}}>

      <Text style={{ backgroundColor:'#2f4f4f',color:"crimson",textAlign:"center",fontSize:21,marginBottom:19, marginTop:38 }}>
          {manual.title}
      </Text>

      <View style={{backgroundColor:"black", paddingBottom:19, flex:1}}>
        <ScrollView>
          {manual.steps.map((step, index) => {
            
            return ( <View key={index} style={{backgroundColor:"black", marginBottom:19}}>
              
              <View style={{backgroundColor: bgColor[(index%12)], marginBottom:3, fontSize:19, borderColor:"silver", borderWidth:1, borderRadius:5,}}>
                <Text style={styles.titletext}>{step.title}</Text>
              </View>

              <View>
                <Image
                  source={step.img}
                  resizeMode="contain"
                  style={{
                   borderRadius: 19,
                   alignSelf: 'flex-start',
                   marginTop:0,
                   marginBottom:0,
                   margin:0,
                   height: 490,
                   maxWidth: 380,
                  }}
                />

                <View style={{backgroundColor: "#2f4f4f", marginTop:5, marginBottom:8, flex:1,padding:0, borderColor:"silver", borderWidth:1, borderRadius:5, borderBottomWidth:2}}>
                  <ScrollView>
                    <ImageBackground style={ styles.imgBackground } resizeMode='cover' source={require('../assets/greentextbackground.png')}>
                      
                      <View style={{backgroundColor: "#2f4f4f",  borderColor:"silver", borderWidth:0, borderRadius:5}}>
                        <Text style={styles.desctext}> {step.desc} </Text>
                      </View>
                    
                    </ImageBackground>
                  </ScrollView>
                </View>
                
              </View>
            </View>);
          })}
    
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  titletext: {
    fontSize: 17,
    lineHeight: 21,
    fontWeight: '600',
    letterSpacing: 0.25,
    marginLeft: 7,
    color: 'black',
    opacity:1,
    backgroundColor:"transparent"
  },
  imgBackground: {
    
    minWidth:"100%",
    flex: 1,
    opacity: .8,
    margin:0,
    padding:0,
    borderRadius:5, 
    borderColor: 'silver',
    borderWidth:1,
    borderBottomWidth:0,
    borderBottomRightRadius:0,
    borderBottomLeftRadius:0
  },
  desctext: {
    fontSize: 17,
    lineHeight: 21,
    fontWeight: '500',
    letterSpacing: 0.25,
    marginTop: 0,
    color: 'white',
    padding:1, 
    backgroundColor:"transparent",
    borderColor:"silver", 
    borderWidth:0, 
    borderRadius:5,
    maxHeight:411,
    opacity:1,
  },
})