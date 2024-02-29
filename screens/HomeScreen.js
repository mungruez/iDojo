import { Image,StyleSheet,SafeAreaView,View,Text,ScrollView,TouchableOpacity,ImageBackground, Dimensions} from 'react-native'
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
      <ImageBackground style={ styles.imgBackground } resizeMode='stretch' source={require('../assets/dojo1.jpg')}>
        <SafeAreaView style={{ flexDirection:"column", height: "100%", marginTop:38}}>
        <View style={{backgroundColor: '#2f4f4f', alignItems: "center", marginLeft:"5", marginRight:"5", marginBottom:19}}>
            <Text style={{ backgroundColor: '#2f4f4f', color:"#dc143c", width:"100%", textAlign: "center",fontSize: 19, fontWeight:"bold" }}>zDojo</Text>
        </View>

        <ScrollView style={{ flexDirection:"column", marginTop:19}}>
        <TouchableOpacity 
              style={styles.button}
              onPress={()=> navigation.navigate('MoveList')}>
              <Text style={{color: "#dc143c",marginTop: 4, fontWeight:"600",fontSize: 19}}>Moves List</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.button}
              onPress={()=> navigation.navigate('Chapters')}>
              <Text style={{color: "#dc143c",marginTop: 4, fontWeight:"600",fontSize: 19}}>Chapters</Text>
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
      height: 57,
      width: 348,
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
  });