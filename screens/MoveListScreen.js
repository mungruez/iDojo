import { StyleSheet, Text, View, SafeAreaView, FlatList, TouchableWithoutFeedback } from 'react-native'
import React from 'react'
import moves from '../data/moves'
import { useNavigation } from '@react-navigation/native'
import Animated, {FadeInDown} from 'react-native-reanimated';
import * as VideoThumbnails from 'expo-video-thumbnails';

export default function MoveListScreen() {
  const navigation = useNavigation();

  const generateThumbnail = async (viduri) => {
    try {
      const { uri } = await VideoThumbnails.getThumbnailAsync(
        require("../assets/videos/elbowstrike.mp4"),
        {
          time: 15000,
        }
      );
      return uri;
    } catch (e) {
      console.warn(e);
      return require("../assets/dojo3.png");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, height: "100%", marginTop:25, backgroundColor: '#2f4f4f',}}>
      <View style={{backgroundColor: '#2f4f4f', color:"#dc143c", marginBottom:20, paddingBottom:10}}>
        <Text style={styles.title}>Moves List</Text>
      </View>
      <View style={{flex:1}}>
          <FlatList
            data={moves}
            numColumns={2}
            contentContainerStyle={{ paddingBottom: 57 }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item, index }) => (
              <View
                key={item.mid}
                style={{
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexDirection: "column",
                  alignItems: "top",
                  marginTop:7,
                  marginLeft:"1",
                  marginRight:"1",
                  width:"50%",
                  height:"auto",
                  borderColor:"transparent",
                  borderWidth:0,
                  backgroundColor:'darkslategray'
                }}
              >
              
              <Animated.View entering={FadeInDown.delay(209 * (index+1))}>
                <TouchableWithoutFeedback
                  onPress={() => {navigation.navigate('Move', {video: item});}}>
                    <View style={styles.mainCardView}>
                        <View style={{flexDirection: 'column', alignItems: 'flex-start', marginTop:0}}>
                            <View style={styles.subCardView}>
                                <Animated.Image
                                  source={generateThumbnail}
                                  resizeMode="cover"
                                  style={{
                                    borderRadius: 12,
                                    alignSelf: 'flex-start',
                                    marginTop:0,
                                    marginLeft:0,
                                    height: 130,
                                    width: 180,
                                }}
                                sharedTransitionTag={item.title}/>
                            

                        <View style={{marginLeft: 12}}>
                            <Text
                              style={{
                                fontSize: 14,
                                color: "crimson",
                                fontWeight: 'bold',
                                textTransform: 'capitalize',
                              }}>
                                {item.title}
                            </Text>
                            
                            <View
                              style={{
                                marginTop: 4,
                                borderWidth: 0,
                                width: '85%',
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
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </Animated.View>
    </View>)}
  />

  </View>
</SafeAreaView>

)}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'column',
        flex: 1,
        backgroundColor:'#acd4c4',
        marginRight: 3,
        marginTop: 3
    },
    title: {
        fontSize: 30, 
        color:'crimson',
        borderColor:'#000',
        fontWeight:"500",
        borderWidth: 2,
        backgroundColor:'#acd4c4',
        fontSize: 24,
        lineHeight: 32,
        textAlign:"center",
        marginTop: 4,
    },
    header: {
        fontSize: 24, 
        color:'#fff',
        fontWeight:"bold",
        backgroundColor:'#228B22',
        fontSize: 18,
        lineHeight: 28,
        textAlign:"center",
        marginTop: 3,
        marginLeft:3,
        marginRight: 3,
    },
    stext: { 
        color:'#acd4c4',
        fontWeight:"bold",
        backgroundColor:'#228B22',
        fontSize: 12,
        lineHeight: 20,
        marginTop: 3,
        marginLeft:3,
        marginRight: 3,
    },
    row: {
        color:'#fff',
        fontWeight:"300",
        backgroundColor:'#228B22',
        fontSize: 13,
        lineHeight: 19,
        flexDirection: "row",
        textAlign:"left",
        marginLeft: 3,
        justifyContent: "space-between",
    },
    button: {
        alignItems: 'center',
        flexDirection: "row",
        justifyContent: 'center',
        paddingVertical: 2,
        paddingHorizontal: 3,
        borderRadius: 6,
        elevation: 5,
        backgroundColor: '#acd4c4',
        marginBottom: 5,
        marginLeft: 5,
        marginTop:5,
        height: 38,
        fontWeight: 'bold', 
    },
    text: {
        fontSize: 14,
        lineHeight: 22,
        fontWeight: '400',
        marginTop: 0,
        marginLeft:3,
        backgroundColor: 'lightgray',
        color: '#000',
    },
    mtext: {
        fontSize: 13,
        lineHeight: 20,
        fontWeight: '400',
        marginTop: 0,
        marginLeft:3,
        backgroundColor: 'lightgray',
        color: '#000',
    },
    container2: {
        flexDirection: 'row',
        marginTop: 20,
        backgroundColor: 'white',
        padding: 10,
        marginHorizontal: 10,
        borderRadius: 20,
      },
      image: {
        width: 140,
        height: 140,
        borderRadius: 10,
      },
      textContainer: {
        margin: 20,
        flexShrink: 1,
        gap: 10,
      },
      textName: {
        color: '#323232',
        fontSize: 28,
        fontWeight: 'bold',
      },
      textLocation: {
        color: '#323232',
        fontSize: 18,
      },
      container: {
        flex: 1,
        backgroundColor: "#fff",
      },
      mainCardView: {
        height: 190,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: "darkslategray",
        borderRadius: 15,
        shadowColor: "#000",
        shadowOffset: {width: 0, height: 0},
        shadowOpacity: 1,
        shadowRadius: 8,
        elevation: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingLeft: 16,
        paddingRight: 14,
        marginTop: 1,
        marginBottom: 1,
        marginLeft: 1,
        marginRight: 5,
        borderColor: "#228b22",
        borderWidth:1,
      },
      subCardView: {
        height: 186,
        width: 180,
        marginLeft:-15,
        borderRadius: 25,
        backgroundColor: "228B22",
        borderColor: "transparent",
        color: 'crimson',
        borderWidth: .5,
        borderStyle: 'solid',
        alignSelf: 'center',
        justifyContent: 'center',
        marginRight:9,
        padding:0,
      },
})