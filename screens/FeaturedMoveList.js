import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, FlatList, Pressable, ImageBackground, Image,Dimensions, ActivityIndicator  } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNetInfo } from "@react-native-community/netinfo"; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useEffect } from 'react'
import { useNavigation } from '@react-navigation/native'

export default function FeatureMoveList() {
  const [isloading, setIsLoading] = useState(true);
  const [hfvideos, setHfvideos] = useState([]);
  const navigation = useNavigation();

  const isOffline = useNetInfo().isConnected === false;
  
  const fetchFvideos = async () => {
    let errorFlag = 0;
    try {
    //Memory cleared if Diff in current and last updated dates > 2.28 days
      const savedDate = await AsyncStorage.getItem('xx7771xxiDojoFvideosDateStamp');
      if (savedDate) {
          const currentDate = new Date();
          const savedDateObj = new Date(savedDate);
          const differenceInMs = currentDate - savedDateObj;
          
          if( (differenceInMs / 86400000.0) > 5.70) {
            alert("Featured Videos not Updated in a few days. Trying to update .....");
            const currentDate = new Date().toISOString(); 
            await AsyncStorage.setItem('xx7771xxiDojoFvideosDateStamp', currentDate);
            return errorFlag;
          }  
      }
    } catch (error) {
      alert("Featured Videos not visited for some time. Updating List...");
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
        alert("Featured Videos not visited for some time. Updating List...");
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

    let hVideos = [];
    let hlist = [];
    let hstyle = "";
    let hsource ="";
    for (let fvNum = 0; fvNum < vds.length; fvNum++) {
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
    //console.log("hvideos: "+hVideos[0].data.length);

    try {
      await AsyncStorage.setItem('xx7771xxiDojoFvideos', JSON.stringify(vds));
      //Save Date Stamp as ISO string
      const currentDate = new Date().toISOString();
      await AsyncStorage.setItem('xx7771xxiDojoFvideosDateStamp', currentDate);
    } catch (error) {
      alert("Unable to Store Featured List. Featured List only available when online. !");
    } 
  };


  useEffect(() => {
    if (isOffline) {
      alert("Offline", "Internet required for featured content.");
      return;
    } 
    
    fetchFvideos();
    if ( hfvideos.length > 6 ) { 
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
    //alert('Welcome to the iDojo Featured Content Section. Fvideoes DateStamp :'+currentDate+' Featured Content updated successfully! with: '+vds.length+' featured videos and free your mind audio files.');
    } catch (error) {
        if (error.message === 'Network request failed') {
          alert('No internet connection detected. Due to copyright laws, Wifi is required for viewing all featured content!');
        } else {
          alert('An unexpected error occurred while updating featured content: ', error);
        }
    } 
  }, []);



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
              
                { item.Title && <Pressable
                  onPress={() => {navigation.navigate('Featured', {video: item});}}>
                    <View key={index}> 
                      { item.Title && <View key={item.Source} style={{backgroundColor: 'silver', marginLeft: 6, marginBottom: 2, borderColor:"silver", borderWidth:1, borderRadius:5, flexDirection:"column", minHeight:38, width: (Dimensions.get('window').width*0.47),}}>
                        <Text numberOfLines={2} style={styles.titletext}>{item.Title}</Text>
                      </View> } 

                      <View style={styles.mainCardView}>
                        <View style={{flexDirection: 'column', alignItems: 'flex-start', marginTop:0,}}>
                          <View style={styles.subCardView}>
                            <View>
                            <Image
                              source={{uri: item.Thumb}}
                              resizeMode="cover"
                              style={{
                                borderRadius: 12,
                                alignSelf: 'flex-start',
                                marginTop:0,
                                marginLeft:3,
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
                                <Text style={{color: '#9a9aa1',fontSize: 11, marginLeft: 2,}}>
                                    {item.Type}
                                </Text>

                                <Text style={{color: '#fff',fontSize: 11, marginRight: 3,}}>
                                    {item.Style}
                                </Text>
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
                </Pressable>}

              </View>)}
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
    <SafeAreaView style={{ flex: 1, height: Dimensions.get('window').height, marginTop:25,}}>

      <View style={{ marginBottom: 7, paddingBottom:10, opacity: 1, alignItmms: "center", justifyContent: "center",}}>
        <ImageBackground style={ styles.icon } imageStyle={{ opacity: 1 }} resizeMode='contain' source={require('../assets/featuredtitle.png')} />
        <StatusBar style='light' />
      </View>
      
      {!isloading ? ( <View style={styles.imgBackground}>
          <FlatList
            data={hfvideos}
            renderItem={renderVerticalItem}
            keyExtractor={(item) => item.Source}
            contentContainerStyle={{ flex :1, paddingBottom: 57, minHeight: 411*hfvideos.length, marginTop: 7, }}
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
      minWidth: '100%',
      minHeight: '100%',
      height: Dimensions.get('window').height,
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
    }, 
    titletext: {
      fontSize: 12,
      fontWeight: '600',
      marginLeft: 5,
      color: 'black',
    },
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
        justifyContent: 'space-between',
        padding:1,
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
      icon: {
        height: 57,
        opacity: 1,
        elevation: 2,
      }
})