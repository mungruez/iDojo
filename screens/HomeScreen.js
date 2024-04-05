import { Image,StyleSheet,SafeAreaView,View,Text,ScrollView,TouchableOpacity,ImageBackground,Dimensions} from 'react-native'
import React, {useLayoutEffect} from 'react'
import { useNavigation } from '@react-navigation/native'

export default function HomeScreen() {
  const navigation = useNavigation();

  useLayoutEffect(()=> {
    navigation.setOptions({
      headerShown: false,
    });
  }, []);

  return (
      <ImageBackground style={ styles.imgBackground } resizeMode='cover' source={require('../assets/dojo1.jpeg')}>
        <SafeAreaView style={{ flexDirection:"column", height: "100%", marginTop:19}}>
        <View style={{backgroundColor: '#2f4f4f', flexDirection:"row", marginHorizontal:3, marginVertical:19, textAlign:"center", justifyContent:"space-between"}}>
          <Text style={{color: "lightgray", fontWeight:"700",fontSize: 23, textAlign:"center", marginLeft:38, marginTop:10}}>Main Menu</Text>
            <ImageBackground style={ styles.icon } resizeMode='contain' source={require('../assets/icon.png')} /> 
        </View>

        <ScrollView style={{ flexDirection:"column", marginTop:57}}>
            <TouchableOpacity
              onPress={()=> navigation.navigate('MoveList')}>
              <ImageBackground style={ styles.button } resizeMode='contain' source={require('../assets/redpillmoveslist.png')} />
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={()=> navigation.navigate('Chapters')}>
              <ImageBackground style={ styles.button } resizeMode='contain' source={require('../assets/redpillmanuals.png')} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={()=> navigation.navigate('FightersList')}>
              <ImageBackground style={ styles.button } resizeMode='contain' source={require('../assets/redpillfighterslist.png')} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.button}
              onPress={()=> navigation.navigate('Res')}>
              <ImageBackground style={ styles.button } resizeMode='contain' source={require('../assets/bluepillresources.png')} />
            </TouchableOpacity>
            
        </ScrollView>
        </SafeAreaView>
      </ImageBackground>
  )
}

const styles = StyleSheet.create({
    button: {
      alignItems: 'center',
      flexDirection: "row",
      justifyContent: 'center',
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 25,
      elevation: 5,
      color: "#dc143c",
      backgroundColor: 'transparent',
      marginBottom: 7,
      marginLeft:19,
      height: 60,
      width: 159,
      fontWeight: 'bold',
      opacity:1,
      backgroundColor:"transparent",
    },
    buttontext: {
      fontSize: 16,
      lineHeight: 21,
      fontWeight: '800',
      letterSpacing: 0.25,
      marginTop: 4,
      color: 'white',
      opacity:3,
      backgroundColor:"transparent"
    },
    imgBackground: {
      maxHeight: "95%",
      minWidth: "100%",
      flex: 1,
      opacity: .8,
      marginTop:"7%" 
    },
    icon: {
      height: 57,
      width: 76,
      opacity: .9,
      marginRight:1,
    },
  });