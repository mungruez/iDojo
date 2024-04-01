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
        <SafeAreaView style={{ flexDirection:"column", height: "100%", marginTop:38}}>
        <View style={{backgroundColor: '#2f4f4f', alignItems: "left", marginLeft:"5", marginRight:"5", marginBottom:19}}>
            <ImageBackground style={ styles.icon } resizeMode='cover' source={require('../assets/icon.png')} /> 

        </View>

        <ScrollView style={{ flexDirection:"column", marginTop:19}}>
            <TouchableOpacity
              onPress={()=> navigation.navigate('MoveList')}>
              <ImageBackground style={ styles.button } resizeMode='cover' source={require('../assets/redpillmoveslist.png')} />
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={()=> navigation.navigate('Chapters')}>
              <ImageBackground style={ styles.button } resizeMode='cover' source={require('../assets/redpillmanuals.png')} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={()=> navigation.navigate('Res')}>
              <ImageBackground style={ styles.button } resizeMode='cover' source={require('../assets/redpillfighterslist2.png')} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.button}
              onPress={()=> navigation.navigate('Res')}>
              <Text style={{color: "#fff",marginTop: 4, fontWeight:"600",fontSize: 19}}>Resources</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.button}
              onPress={()=> navigation.navigate('Res')}>
              <Text style={{color: "#fff",marginTop: 4, fontWeight:"600",fontSize: 19}}>Resources</Text>
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
      borderRadius: 5,
      elevation: 3,
      color: "#dc143c",
      backgroundColor: '#2f4f4f',
      marginBottom: 7,
      marginLeft:19,
      height: 60,
      width: 159,
      fontWeight: 'bold',
      opacity:1 
    },
    buttontext: {
      fontSize: 16,
      lineHeight: 21,
      fontWeight: '800',
      letterSpacing: 0.25,
      marginTop: 4,
      color: 'white',
      opacity:3
    },
    imgBackground: {
      minHeight: Dimensions.get('window').height,
      minWidth: Dimensions.get('window').width,
      flex: 1,
      opacity: .8, 
    },
    icon: {
      height: 107,
      width: 114,
      opacity: .9,
      textAlign: "left" 
    },
  });