import { StyleSheet, Text, View, Image, ScrollView, ImageBackground, StatusBar } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ManualScreen({ route, navigation }) {
    const { manual } = route.params;
    const bgColor = ['khaki', 'sandybrown', 'bisque', 'honeydew', 'darkkhaki', 'oldlace', 'papayawhip', 'lavender', 'wheat', 'mintcream', 'aliceblue', 'goldenrod', 'tan', 'lightsteelblue', 'burlywood', 'palegoldenrod', 'beige', 'azure'];

  return (
   <View style={{flex: 1, paddingTop: 40, backgroundColor: "#228b22", opacity: 1}}> 
    <StatusBar barStyle="light-content"/>
    <SafeAreaView style={{ backgroundColor:'black', flex: 1}}>

      <Text style={{ backgroundColor: '#2f4f4f', color:"crimson", textAlign:"center", fontSize: 21, marginBottom: 12, marginTop: 1 }}>
          {manual.title}
      </Text>

      <View style={{backgroundColor: "black", paddingBottom: 38, flex: 1}}>
        <ScrollView>
          {manual.steps.map((step, index) => {
            
            return ( <View key={index} style={{backgroundColor: "black", marginBottom: 38}}>
              
              <View style={{backgroundColor: bgColor[Math.floor(Math.random()*bgColor.length)], marginBottom: 3, fontSize:19, borderColor:"silver", borderWidth:1, borderRadius:5,}}>
                <Text style={styles.titletext}>{step.title}</Text>
              </View>

              <View>
                <Image source = { step.img } resizeMode="contain" style={{ borderRadius: 19, alignSelf: 'center', margin: 0, height: 490, width: 380 }} />
                
                <View style={{backgroundColor: "#2f4f4f", marginTop: 5, marginBottom: 2, flex: 1, padding: 3, borderColor: "silver", borderWidth: 1, borderRadius: 5, borderBottomWidth: 2}}>
                  <ScrollView>
                    <View style={styles.imgBackground}>
                      <Text style={styles.desctext}> {step.desc} </Text>
                    </View>
                  </ScrollView>
                </View>
                
                {index < manual.steps.length - 1  && ( <View style={{marginTop: 2, marginBottom: 3, flex: 1, padding: 2}}> 
                  <Image source={require('../assets/silverdivider.png')} style={styles.divider} resizeMode='contain'/>
                </View> ) } 
              </View>
            </View>);
          })}
        </ScrollView>
      </View>
    </SafeAreaView>
   </View>
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
    opacity: 1,
  },
  imgBackground: {
    minWidth: "100%",
    backgroundColor: "#2a4242",
    flex: 1,
    opacity: 1,
    margin: 0,
    padding: 3,
    borderRadius: 7, 
    borderColor: 'silver',
    borderWidth: 1,
    borderBottomWidth: 0,
    borderBottomRightRadius: 0,
    borderBottomLeftRadius: 0
  },
  desctext: {
    fontSize: 17,
    lineHeight: 21,
    fontWeight: '500',
    letterSpacing: 0.25,
    marginTop: 2,
    color: 'white',
    padding: 2, 
    borderColor:"silver", 
    borderWidth: 0, 
    borderRadius: 7,
    maxHeight: 411,
    opacity: 1,
  },divider: { width: '96%', height: 38, alignSelf: "center", paddingVertical: 3, opacity: 1 },

})