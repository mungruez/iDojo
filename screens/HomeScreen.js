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
              onPress={()=> navigation.navigate('Manuals')}>
              <ImageBackground style={ styles.button } resizeMode='contain' source={require('../assets/redpillmanuals.png')} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={()=> navigation.navigate('FightersList')}>
              <ImageBackground style={ styles.button } resizeMode='contain' source={require('../assets/redpillfighterslist.png')} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.buttonimage}
              onPress={()=> navigation.navigate('Res')}>
              <ImageBackground style={ styles.buttonres } resizeMode='contain' source={require('../assets/bluepillresources.png')} />
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
      paddingVertical: 0,
      paddingHorizontal: 0,
      borderWidth: 0,
      borderColor:"transparent",
      borderRadius: 25,
      elevation: 0,
      shadowColor:"transparent",
      marginBottom: 12,
      marginLeft:30,
      height: 57,
      width: 190,
      opacity: 1,
      shadowOpacity: 0,
      backgroundColor:"transparent",
    },
    buttonres:{
      alignItems: 'center',
      flexDirection: "row",
      justifyContent: 'center',
      paddingVertical: 0,
      paddingHorizontal: 0,
      borderRadius: 25,
      borderWidth:0,
      borderColor:"transparent",
      elevation: 0,
      backgroundColor: 'transparent',
      marginBottom: 12,
      marginLeft:25,
      height: 57,
      width: 193,
      opacity:1,
      shadowOpacity: 0,
    },
    buttonimage:{  
    alignItems: 'center',
    flexDirection: "row",
    justifyContent: 'center',
    paddingVertical: 0,
    paddingHorizontal:0,
    borderRadius: 25,
    elevation: 0,
    shadowColor:"transparent",
    shadowOpacity: 0,
    backgroundColor: 'transparent',
    marginBottom: 12,
    marginTop:5,
    marginLeft:15,
    height: 57,
    width: 190,
    opacity:1,
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