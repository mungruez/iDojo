import { StyleSheet, Text, View, FlatList, Pressable, ImageBackground, Image,Dimensions } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react'
import {featured} from '../data/featured'
import { useNavigation } from '@react-navigation/native'


export default function FeatureMoveList() {
  const navigation = useNavigation();

  return (
    <ImageBackground style={ styles.imgBackground } resizeMode='cover' source={require('../assets/dojo4.jpeg')}>
    <SafeAreaView style={{ flex: 1, height: "100%", marginTop:25, backgroundColor: 'transparent',}}>
      <View style={{backgroundColor: '#323232', color:"#dc143c", marginBottom:20, paddingBottom:10, opacity: .7}}>
        <ImageBackground style={ styles.icon } resizeMode='contain' source={require('../assets/featuredtitle.png')} />
      </View>

      <View style={{backgroundColor:"black", marginBottom:19, flex:1}}>
        <FlatList
          data={featured}
          numColumns={1}
          contentContainerStyle={{ paddingBottom: 57 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, findex }) => ( <View> 
              <View key={item.source} style={{backgroundColor: 'silver', marginBottom:3, fontSize:19, borderColor:"silver", borderWidth:1, borderRadius:5,}}>
                <Text style={styles.text}>{item.source}</Text>
              </View> 

              <View style={{flex:1}}>
                <FlatList
                  data={item.videos}
                  numColumns={2}
                  contentContainerStyle={{ paddingBottom: 57 }}
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item, index }) => (
                <View
                  key={item.title}
                  style={{
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexDirection: "column",
                  alignItems: "top",
                  marginTop:7,
                  marginLeft:"1",
                  marginRight:"1",
                  width:"50%",
                  borderColor:"transparent",
                  borderWidth:0,
                  backgroundColor:'#2f4f4f'
                }}
              >
              
                <Pressable
                  onPress={() => {navigation.navigate('Featured', {video: item});}}>
                    <View style={styles.mainCardView}>
                        <View style={{flexDirection: 'column', alignItems: 'flex-start', marginTop:0}}>
                             <View style={styles.subCardView}>
                                <Image
                                  source={{uri: item.thumb}}
                                  resizeMode="cover"
                                  style={{
                                    borderRadius: 12,
                                    alignSelf: 'flex-start',
                                    marginTop:0,
                                    marginLeft:0,
                                    height: 130,
                                    width: 180,
                                  }}
                                />
                            

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
                                marginTop: 3,
                                borderWidth: .5,
                                borderColor:'#228b22',
                                flexDirection:'row',
                                backgroundColor:'#323232',
                                justifyContent:'space-between'
                              }}>
                                <Text
                                    style={{
                                       color: '#9a9aa1',
                                       fontSize: 12,
                                    }}>
                                    {item.style}
                                </Text>
                                <Text
                                    style={{
                                       color: '#fff',
                                       fontSize: 12,
                                    }}>
                                    iDojo
                                </Text>
                            </View>
                            </View>
                        </View>
                    </View>
                </View>
            </Pressable>
          </View>)}
          />
        </View> 
      </View>)} />
    </View>  
  </SafeAreaView>
</ImageBackground>

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
        borderRadius: 5,
        backgroundColor:'#9a9aa1',
        fontSize: 22,
        lineHeight: 29,
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
        backgroundColor: "#2f4f4f",
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: {width: 0, height: 0},
        shadowOpacity: 1,
        shadowRadius: 5,
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
        borderRadius: 8,
        backgroundColor: "slategray",
        borderColor: "transparent",
        color: 'crimson',
        borderWidth: 0,
        borderStyle: 'solid',
        alignSelf: 'center',
        justifyContent: 'center',
        marginRight:9,
        padding:0,
      },
      imgBackground: {
        minWidth: '100%',
        minHeight: '100%',
        height: Dimensions.get('window').height,
        flex: 1,
        opacity: .9, 
      },
      icon: {
        height: 57,
        opacity: 1,
        textAlign: "center" 
      }
})