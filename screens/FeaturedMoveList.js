import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, FlatList, Pressable, ImageBackground, Image,Dimensions, ActivityIndicator, Alert, Animated, TouchableOpacity  } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNetInfo } from "@react-native-community/netinfo"; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useEffect, useRef } from 'react'
import { useNavigation } from '@react-navigation/native'

export default function FeatureMoveList() {
  const [isloading, setIsLoading] = useState(true);
  const [hfvideos, setHfvideos] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  
  const panelAnim = useRef(new Animated.Value(0)).current;

  const SCREEN_WIDTH = Dimensions.get('window').width*.47;

  const navigation = useNavigation();

  const isOffline = useNetInfo().isConnected === false;
  

  const isSameDayUTC = (inputDate) => {
    if (!inputDate || typeof inputDate !== "string") {
      return false;
    }

    var parsed = new Date(inputDate);

    if (isNaN(parsed.getTime())) {
      return false;
    }

    var today = new Date();

    return (
      parsed.getUTCFullYear() === today.getUTCFullYear() &&
      parsed.getUTCMonth() === today.getUTCMonth() &&
      parsed.getUTCDate() === today.getUTCDate()
    );
  }



  const fetchFvideos = async () => {
    let errorFlag = 0;
    try {
      const savedDate = await AsyncStorage.getItem('xx7771xxiDojoFvideosDateStamp');
      if (savedDate) {
          const currentDate = new Date();
          const savedDateObj = new Date(savedDate);
          const differenceInMs = currentDate - savedDateObj;
          
          if( (differenceInMs / 86400000.0) > 5.70) {
            Alert.alert("Featured Content","Featured Videos not Updated in a few days. Trying to update .....");
            const currentDate = new Date().toISOString(); 
            await AsyncStorage.setItem('xx7771xxiDojoFvideosDateStamp', currentDate);
            return errorFlag;
          }  
      }
    } catch (error) {
      Alert.alert("Featured Content","Featured Videos not visited for some time. Updating List...");
      const currentDate = new Date().toISOString(); 
      await AsyncStorage.setItem('xx7771xxiDojoFvideosDateStamp', currentDate);
      return errorFlag;
    }

      let vds = [];
      try {
        AsyncStorage.getItem('xx7771xxiDojoFvideos').then((fvalue) => {
          if (fvalue != null) {
            vds = JSON.parse(fvalue);
            let hVideos = [];
            let hlist = [];
            let hstyle = "";
            let hsource ="";
            for (let fvNum = 0; fvNum < vds.length; fvNum++) {
              if( vds[fvNum].Style === "iDojoMoveOfTheDay" && !isSameDayUTC(vds[fvNum].Type) ) {
                continue;
              }
              if(vds[fvNum].Vend < 0 || vds[fvNum].Vend == 7777777) {
    
                if(hlist.length > 0) {
                  if(vds[fvNum].Vend ==  7777777) {
                    hlist.push(vds[fvNum]);
                  }
                  hVideos.push({
                    Style: hstyle,
                    Source: hsource,
                    data: hlist,
                  });
                } 
                hlist=[];
                hlist.push(vds[fvNum]);
                hstyle=vds[fvNum].Style;
                hsource=vds[fvNum].Source;
    
              } else {
                hlist.push(vds[fvNum]);
              }
    
              if(vds[fvNum].Vend == 7777777) {
                break;
              }
            }
            setHfvideos(hVideos);
            setIsLoading(false);
            return vds.length;
          }
        }).catch((error) => {
          return errorFlag;
        });

      } catch (error) {
        Alert.alert("Featured Content","Featured Videos not visited for some time. Updating List...");
      }

    return errorFlag;
  }
  


  const parseFvideos = async (vidArr) => {
    let vds =[];
    for (let fvNum = 1; fvNum < vidArr.length; fvNum++) {
      let fVideo = {
        Title:  vidArr[fvNum][0],
        Link:   vidArr[fvNum][1],
        Type:   vidArr[fvNum][2],
        Thumb:  vidArr[fvNum][3],
        Desc:   vidArr[fvNum][4],
        Source: vidArr[fvNum][5],
        Style:  vidArr[fvNum][6],
        Vend:   vidArr[fvNum][7],  
      }
      vds.push(fVideo);
    }

    let hlist = [];
    let hVideos = [];
    let hstyle = "";
    let hsource = "";
    for (let fvNum = 0; fvNum < vds.length; fvNum++) {
      if( vds[fvNum].Style === "iDojoMoveOfTheDay" && !isSameDayUTC(vds[fvNum].Type) ) {
        continue;
      }

      if(vds[fvNum].Vend < 0 || vds[fvNum].Vend == 7777777) {

        if(hlist.length > 0) {
          if(vds[fvNum].Vend ==  7777777) {
            hlist.push(vds[fvNum]);
          }
          hVideos.push({
            Style: hstyle,
            Source: hsource,
            data: hlist,
          });
        } 
        hlist=[];
        hlist.push(vds[fvNum]);
        hstyle=vds[fvNum].Style;
        hsource=vds[fvNum].Source;

      } else {
        hlist.push(vds[fvNum]);
      }

      if(vds[fvNum].Vend == 7777777) {
        break;
      }
    }
    setHfvideos(hVideos);

    try {
      await AsyncStorage.setItem('xx7771xxiDojoFvideos', JSON.stringify(vds));
      const currentDate = new Date().toISOString();
      await AsyncStorage.setItem('xx7771xxiDojoFvideosDateStamp', currentDate);
    } catch (error) {
      Alert.alert("Featured Content","Unable to Store Featured List. Featured List only available when online. !");
    } 
  };



  useEffect(() => {
    if (isOffline) {
      Alert.alert("Offline", "Internet required for featured content.");
      if(isloading) {
        setIsLoading(false);
      }
      return;
    } 
    
    fetchFvideos();

    if ( hfvideos.length > 5 ) { 
      if(isloading) {
        setIsLoading(false);
      }
      return;
    }
    
    try { 
      fetch("https://sheets.googleapis.com/v4/spreadsheets/1bigTkraeJ23fgTyvmFX9_-0t5OgZPh9kCyaS6hVrHXA/values/iDojoFeaturedVideos?valueRenderOption=FORMATTED_VALUE&key=AIzaSyC6hYTt4MgX6PsHyUM1I1BPVY9CkeN35WU")
      .then(res => res.json())
      .then(
        (result) => {
          parseFvideos(result.values); 
          setIsLoading(false);
          return;     
        },
        (error) => {
          setIsLoading(false);
        }
      )
    } catch (error) {
        if (error.message === 'Network request failed') {
          Alert.alert("Connection Error",'No internet connection detected. Due to copyright laws, Wifi is required for viewing Featured content!');
        } else {
          Alert.alert("Featured Content",'An unexpected error occurred while updating featured content: ', error);
        }
    } 
  }, []);



   const checkWifi = (item) => {
    if(isOffline) {
      Alert.alert("Connection Error","No internet connection detected. Due to copyright laws, Wifi is required for viewing Featured content! Thumbnails may show because of the cache.");
      return;
    }
    navigation.navigate('Featured', {video: item});
  }



  
  const togglePanel = (item) => {
    if(isOffline) {
      Alert.alert("Connection Error","No internet connection detected. Due to copyright laws, Wifi is required for viewing Featured content! Thumbnails may show because of the cache.");
      return;
    }
    const nextOpenState = !isOpen;
    const toValue = nextOpenState ? 1 : 0;
    
    Animated.timing(panelAnim, {
      toValue: toValue,
      duration: 950,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if ( finished ) {
        setIsOpen(nextOpenState);
      }
    });
  };



  const translateX = panelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, (-1*SCREEN_WIDTH)], 
  });




  const HorizontalList = ({ data }) => {
    return (
      <FlatList
        horizontal={true} 
        data={data}
        keyExtractor={(item) => item.Title}
        showsHorizontalScrollIndicator={true}
        contentContainerStyle={{ minWidth: (Dimensions.get('window').width*data.length)/2, paddingRight: 5, flexGrow: 1, }}
        renderItem={({ item, index }) => (
          <View
            style={{
              alignItems: "center",
              justifyContent: "space-between",
              flexDirection: "column",
              marginLeft: 9,
              marginRight: 7,
              marginTop: 9,
              width: (Dimensions.get('window').width*0.47),
              borderWidth: 0,
              borderRadius: 38,
            }}>

              { item.Style !== "iDojoMoveOfTheDay" ? ( <Pressable
                onPress={() => checkWifi(item) }>
                  <View key={index}> 
                    { item.Title && <View style={{ backgroundColor: 'silver', marginLeft: 6, marginBottom: 2, borderColor:"silver", borderWidth:1, borderRadius:5, flexDirection:"column", minHeight: 38, width: (Dimensions.get('window').width*0.47) }}>
                      <Text numberOfLines={2} style={styles.titletext}>{item.Title}</Text>
                    </View> } 

                    <View style={styles.mainCardView}>
                      <View style={{flexDirection: 'column', alignItems: 'flex-start', marginTop: 0 }}>
                        <View style={styles.subCardView}>
                          <View>
                          <Image
                            source={{uri: item.Thumb}}
                            resizeMode="cover"
                            style={{
                              borderRadius: 12,
                              alignSelf: 'flex-start',
                              marginTop: 0,
                              marginLeft: 3,
                              height: 190,
                              width: (Dimensions.get('window').width/100)*45,
                            }}
                          />
                          </View>
                            
                          <View style={{marginLeft: 4, marginTop:1,}}>
                            <View
                              style={{
                                borderWidth: .5,
                                borderColor:'#228b22',
                                flexDirection:'row',
                                backgroundColor:'#323232',
                                justifyContent:'space-between',
                              }}>
                              <Text style={{color: '#9a9aa1',fontSize: 11, marginLeft: 1,}}>
                                  {item.Type}
                              </Text>
                              
                              { item.Type.length + item.Style.length < 22 &&
                                ( <Text style={{color: '#fff',fontSize: 11, marginRight: 3,}}>
                                  {item.Style}
                                </Text> ) }
                            </View>
                          </View>

                            <Text
                              numberOfLines={3}
                              ellipsizeMode='clip'
                              style={{
                                fontSize: 11,
                                color: "#cfcfafff",
                                fontWeight: 'medium',
                                overflow:"scroll",
                              }}>
                                {item.Desc}
                            </Text>
                            
                        </View>
                      </View>
                    </View>
                  </View>
              </Pressable> ) : ( 
                <Pressable onPress={() => togglePanel(item)} style={{ zIndex: 2 }}>
                  <View> 
                    { item.Title && <View style={{backgroundColor: 'silver', marginLeft: 6, marginBottom: 2, borderColor:"silver", borderWidth:1, borderRadius:5, flexDirection:"column", minHeight: 38, width: (Dimensions.get('window').width*0.47), textAlign: "flex-start" }}>
                      <Text numberOfLines={2} style={styles.titletext}>{item.Title.trim()}</Text>
                    </View> } 

                    <View style={styles.mainCardView}>
                      <View style={{flexDirection: 'column', alignItems: 'center', marginTop: 0,  overflow: 'hidden' }}>
                        <View style={styles.subCardView}>
                          <TouchableOpacity  style={styles.backendImageContainer} 
                            onPress={(e) => {
                              e.stopPropagation();
                                if (!isOpen) {
                                  togglePanel(item);
                                } else {
                                  checkWifi(item);
                                }
                              }} >

                            <Image 
                              source={{uri: item.Thumb}}
                              resizeMode="cover"
                              style={{
                                borderRadius: 7,
                                alignSelf: 'center',
                                marginTop: -31,
                                marginBottom: 12,
                                marginLeft: 0,
                                height: "95%",
                                width: (Dimensions.get('window').width/100)*45,
                              }}
                            />

                            <TouchableOpacity style={{ position: 'absolute', bottom: -14, alignItems: 'center',  alignItems: 'center', justifyContent:"center", zIndex: 5, height: 38, backgroundColor: 'rgba(0, 0, 0, 0.38)', paddingTop: 0, paddingHorizontal: 15, borderRadius: 15, borderWidth: .5, borderColor: "#94cccc", paddingBottom: 3}} hitSlop={{ top: 12, bottom: 12, left: 19, right: 19 }} onPress={(e) => { e.stopPropagation(); togglePanel(item);}} >
                              <Text style={{ color: '#fff', fontWeight: 'bold', alignSelf: 'center',fontSize: 19, marginLeft: 0, marginTop: 0}}>➔</Text>
                            </TouchableOpacity>
                          </TouchableOpacity>

                          <Animated.View style={[ styles.slidingPanel, { transform: [{ translateX }] }]}>
                            <Image
                              source={require('../assets/moveoftheday.jpg')} 
                              resizeMode="stretch"
                              style={{
                                borderRadius: 7,
                                alignSelf: 'center',
                                marginTop: 0,
                                marginLeft: 0,
                                height: "83%",
                                width: (Dimensions.get('window').width/100)*46,
                              }}
                            />

                            <View style={{ height: 40, width: (Dimensions.get('window').width/100)*46, position: 'absolute', bottom: 4, alignItems: 'center',  alignItems: 'center', justifyContent: "center", zIndex: 5, backgroundColor: "slategray" }} >
                              <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold', marginBottom: 1, paddingVertical: 9, marginTop: 5}}>{item.Type.slice(0,10)}</Text>
                            </View>
                          </Animated.View>
                        </View>
                      </View>
                    </View>
                  </View>
              </Pressable> ) }
          </View>
        ) }
      />
    );
  };



  const renderVerticalItem = ({ item }) => (
    <View>
      <Text style={styles.sourcetext}>{item.Source}</Text>
      <HorizontalList data={item.data} />
    </View>
  );


  return ( <ImageBackground style={ styles.imgBackground } imageStyle={{ opacity: 1 }} resizeMode='cover' source={require('../assets/dojo4.jpeg')}>
    <SafeAreaView style={{ flex: 1, height: Dimensions.get('window').height, marginTop:25 }}>

      <View style={{ marginBottom: 7, paddingBottom:10, opacity: 1, alignItmms: "center", justifyContent: "center" }}>
        <ImageBackground style={ styles.icon } imageStyle={{ opacity: 1 }} resizeMode='contain' source={require('../assets/featuredtitle.png')} />
        <StatusBar style='light' />
      </View>

      {isOffline ? (<Text style={{ marginTop: Dimensions.get('window').height*0.43, height: "100%", width: "100%", color: 'rgb(174, 185, 185)', fontSize: 14, fontStyle: "italic", fontWeight:"bold", textAlign:"center", alignSelf: "center"}}> No Wifi Detected! Internet is required for viewing Featured videos!</Text> )
      
      : !isloading ? ( <View style={styles.imgBackground}>
          <FlatList
            data={hfvideos}
            renderItem={renderVerticalItem}
            keyExtractor={(item) => item.Source}
            contentContainerStyle={{ flex : 1, paddingBottom: 57, minHeight: 411*hfvideos.length, marginTop: 7 }}
            showsVerticalScrollIndicator={false}
            />
        </View> )
        : ( <View style ={{ marginTop: Dimensions.get('window').height*0.43, justifyContent:'center', alignItems:'center',  borderRadius: 12, marginLeft: 9, marginRight: 9, padding: 9,}}> 
          <ActivityIndicator style={{alignSelf: "center", textAlign: 'center', transform: [{scale: 3.0}]}} size="large" color="rgb(174, 185, 185)"/> 
          <Text style={{ marginTop: 57, height: "100%", color: 'rgb(174, 185, 185)', fontSize: 25, fontStyle: "italic", fontWeight:"bold", textAlign:"center", alignSelf: "center"}}> Loading...</Text> 
        </View> )
      }

    </SafeAreaView>
  </ImageBackground>)
}


const styles = StyleSheet.create({
  imgBackground: {
      minWidth: "100%",
      minHeight: "95%",
      height: Dimensions.get('window').height * 0.95,
      flex: 1, 
  }, 
  image: {
      height: 190,
      flex: 1,
      borderRadius: 12,
      alignSelf: 'flex-start',
      marginTop:0,
      marginLeft:3,
      width:(Dimensions.get('window').width/100)*46,
  },
  sourcetext: {
      fontSize: 12,
      fontWeight: '600',
      marginLeft: 7,
      color: 'white',
      backgroundColor: 'rgba(0, 0, 0, 0.76)',
      alignSelf: 'flex-start',
      marginTop: 12,
      paddingLeft: 3,
      paddingRight: 3,
      borderRadius: 5,
    }, 
  titletext: { fontSize: 12, fontWeight: '600', marginLeft: 5, color: 'black' },
  mainCardView: {
    height: 273,
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
    padding: 1,
    marginTop: 1,
    marginBottom: 1,
    marginLeft: 5,
    marginRight: 5,
    borderColor: "#228b22",
    borderWidth: 1,
    width: ((Dimensions.get('window').width/100)*47)+5,
  },
  subCardView: {
    minHeight: 257,
    width: (Dimensions.get('window').width*0.47),
    borderRadius: 8,
    backgroundColor: "slategray",
    color: 'crimson',
    borderWidth: 0,
    alignSelf: 'center',
    justifyContent: 'center',
    padding: 3,
    flex: 1,
  }, 
  icon: { height: 57, opacity: 1, elevation: 2 },
  backendImageContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  slidingPanel: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
    position: 'absolute', 
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
})