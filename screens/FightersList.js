import { StyleSheet, Text, View, ImageBackground, FlatList, Pressable, Image, Dimensions, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {fighters} from '../data/fighters';
import { useNavigation } from '@react-navigation/native';
import { useAudioPlayer } from 'expo-audio';

const ksoundFile = require('../assets/woosh.mp3');

export default function FightersList() {
  const navigation = useNavigation();
  

  const kplayer = useAudioPlayer(ksoundFile, (kplayer) => {
    kplayer.loop = false; 
  });


  const navKSound = (item) => {
    try {
      if(kplayer) {
        kplayer.play();
      }
    } catch (error) {
        alert('Error playing sound effect:'+error);
    }
    navigation.navigate('FighterScreen', {fighter: item, offset: 0});
  };


  return (
    <ImageBackground style={ styles.imgBackground } imageStyle={{ opacity: 1 }} resizeMode='cover' source={require('../assets/fightersbackground.jpeg')}>
      <StatusBar barStyle="light-content"/>
      <SafeAreaView style={{ flex: 1, height: "100%", marginTop: 7,}}>

        <View style={{marginBottom:19, paddingTop:-10, paddingBottom: 10,}}>
          <ImageBackground style={ styles.icon } imageStyle={{ opacity: 1 }} resizeMode='contain' source={require('../assets/fighterslisttitle.png')} /> 
        </View>    
        
        <FlatList
          data={fighters}
          numColumns={2}
          contentContainerStyle={{ paddingBottom: 57 }}
          keyExtractor={(item, index) => item.name || index.toString()}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View
              style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 2,
                  marginLeft: 7,
                  marginRight: 7,
                  width: "50%",
                  borderWidth: 0,
                }}
              >
              
                <Pressable onPress={() => navKSound(item)} style={styles.mainCardView}>
                    <View style={styles.subCardView}>
                      <Image
                        source={item.avatar}
                        resizeMode="contain"
                          style={{
                            borderRadius: 12,
                            alignSelf: 'flex-start',
                            margin: 0,
                            height: 133,
                            width: "100%",
                          }}
                        />

                        <View style={{marginLeft: 12, marginBottom: 7}}>
                          <Text
                              style={{
                                fontSize: 14,
                                color: "gold",
                                fontWeight: 'bold',
                                textTransform: 'capitalize',
                              }}>
                                {item.name}
                          </Text>
                            
                          <View
                              style={{
                                marginTop: 3,
                                borderWidth: .5,
                                borderRadius: 12,
                                borderColor:'#228b22',
                                flexDirection:'row',
                                backgroundColor:'#323232',
                                justifyContent: 'flex-start',
                                alignItems: 'flex-start',
                                paddingHorizontal: 4,
                                paddingVertical: 2,
                              }}>
                                <Text
                                    style={{
                                       color: '#9a9aa1',
                                       fontSize: 12,
                                    }}>
                                    {item.style}
                                </Text>
                            </View>
                        </View>
                      </View>
                </Pressable>
            </View>)}
          />
      </SafeAreaView>
    </ImageBackground>
  )
}


const styles = StyleSheet.create({
      imgBackground: {
        minWidth: '100%',
        minHeight: '100%',
        height: Dimensions.get('window').height,
        flex: 1,
      },
      icon: {
        height: 57,
        opacity: 1,
        marginTop: 38,
        textAlign: "center" 
      },
      mainCardView: {
        minHeight: 228,
        width: "100%",
        backgroundColor: "#2f4f4f",
        borderRadius: 15,
        shadowColor: "#000",
        shadowOffset: {width: 0, height: 0},
        shadowOpacity: 1,
        shadowRadius: 5,
        elevation: 8,
        justifyContent: 'center',
        padding: 5,
        marginTop: 12,
        marginBottom: 12,
        marginLeft: 1,
        marginRight: 5,
        borderColor: "#228b22",
        borderWidth: 2,
        flexDirection: 'column',
        alignItems: 'flex-start',
      },
      subCardView: {
        minHeight: 207,
        width: "100%",
        marginLeft: 7,
        borderRadius: 8,
        backgroundColor: "slategray",
        color: 'crimson',
        borderWidth: 0,
        alignSelf: 'center',
        justifyContent: 'center',
        marginRight: 7,
        padding:0,
      },
})