import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, FlatList, Pressable, ImageBackground, Image,Dimensions, ActivityIndicator  } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useEffect } from 'react'
import { useNavigation } from '@react-navigation/native'


export default function FeatureMoveList() {
  const [isloading, setIsLoading] = useState(true);
  const [hfvideos, setHfvideos] = useState([]);
  const navigation = useNavigation();


  const fetchFvideos = async () => {
    //test await AsyncStorage.clear();
    let errorFlag = 0;
    try {
    //Memory cleared if Diff in current and last updated dates > 2.28 days
      const savedDate = await AsyncStorage.getItem('xx7771xxiDojoFvideosDateStamp');
      if (savedDate) {
          const currentDate = new Date();
          const savedDateObj = new Date(savedDate);
          const differenceInMs = currentDate - savedDateObj;
          //console.log(`Difference in days: ${differenceInMs/ 86400000.0}`);
          if( (differenceInMs / 86400000.0) > 5.70) {
            //console.log(`Difference in days: ${differenceInMs}`);
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
            //console.log("Saved Videos found: "+vds.length); 
            let hVideos = [];
            let hlist = [];
            let hstyle = "";
            let hsource ="";
            for (let fvNum = 0; fvNum < vds.length; fvNum++) {
              if(vds[fvNum].Type == "Audio" || vds[fvNum].Vend == 1111111) {
    
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
    setIsLoading(false);
    //console.log("hvideos: "+hVideos[0].data.length);

    try {
      await AsyncStorage.setItem('xx7771xxiDojoFvideos', JSON.stringify(vds));
      //Save Date Stamp as ISO string
      const currentDate = new Date().toISOString();
      await AsyncStorage.setItem('xx7771xxiDojoFvideosDateStamp', currentDate);
      alert('Welcome to the iDojo Featured Content Section. Fvideoes DateStamp :'+currentDate+' Featured Content updated successfully! with: '+vds.length+' featured videos and free your mind audio files.');
    } catch (error) {
      alert("Unable to Store Featured List. Featured List only available when online. !");
    } 
  };


  useEffect(() => {
    const savedfv=fetchFvideos();
    if ( savedfv && savedfv > 38 && hfvideos.length > 38 ) { 
      //console.log("Saved Featured videos found! "+fvideos.length);
      return;
    }
    //console.log("ZERO Saved Featured videos found! ");
    try { 
    fetch("https://sheets.googleapis.com/v4/spreadsheets/1bigTkraeJ23fgTyvmFX9_-0t5OgZPh9kCyaS6hVrHXA/values/iDojoFeaturedVideos?valueRenderOption=FORMATTED_VALUE&key=AIzaSyC6hYTt4MgX6PsHyUM1I1BPVY9CkeN35WU")
    .then(res => res.json())
    .then(
      (result) => {
        parseFvideos(result.values); 
        return;     
      },
      (error) => {
        setIsLoading(false);
      }
    )
    } catch (error) {
    // This catches network errors and the custom HTTP error above
        if (error.message === 'Network request failed') {
          alert('No internet connection detected. Due to copyright laws, Wifi is required for viewing all featured content!');
         // Display a message to the user or use cached data
        } else {
          alert('An unexpected error occurred while updating featured content: ', error);
          //throw error, Rethrow other errors if needed
        }
    } 
  }, []);


  const HorizontalList = ({ data }) => {
    return (
      <FlatList
        horizontal={true} // Key prop for horizontal scrolling
        data={data}
        keyExtractor={(item) => item.Title}
        showsHorizontalScrollIndicator={true}
        contentContainerStyle={{ minWidth: (Dimensions.get('window').width*data.length)/2, paddingRight: 5, height: 313, flexGrow: 1, }}
        renderItem={({ item, index }) => (
                <View
                  style={{
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexDirection: "column",
                    alignItems: "top",
                    marginLeft:5,
                    marginTop:7,
                    width: (Dimensions.get('window').width*0.47),
                    borderColor:"transparent",
                    borderWidth:0,
                    borderRadius:38,
                    backgroundColor:'#2f4f4f',
                  }}>
              
                { item.Title && <Pressable
                  onPress={() => {navigation.navigate('Featured', {video: item});}}>
                    <View key={index}> 
                      { item.Title && <View key={item.Source} style={{backgroundColor: 'silver', marginBottom:3, borderColor:"silver", borderWidth:1, borderRadius:5, flexDirection:"column", minHeight:38, width: (Dimensions.get('window').width*0.47),}}>
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
                                ellipsizeMode='tail'
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
      {/* The nested horizontal FlatList goes here */}
      <HorizontalList data={item.data} />
    </View>
  );



  return ( <ImageBackground style={ styles.imgBackground } resizeMode='cover' source={require('../assets/dojo4.jpeg')}>
    <SafeAreaView style={{ flex: 1, height: "100%", marginTop:25, backgroundColor: 'transparent',}}>

      <View style={{backgroundColor: 'transparent', marginBottom:20, paddingBottom:10, opacity: .7,}}>
        <ImageBackground style={ styles.icon } resizeMode='contain' source={require('../assets/featuredtitle.png')} />
        <StatusBar style='light' />
      </View>
      
      {!isloading ? ( <View style={styles.imgBackground}>
          <FlatList
            data={hfvideos}
            renderItem={renderVerticalItem}
            keyExtractor={(item) => item.Source}
            contentContainerStyle={{ flex :1, paddingBottom: 57, minHeight: 411*hfvideos.length, marginTop:40, }}
            showsVerticalScrollIndicator={false}
            />
        </View> )
        : ( <View style ={{flex:1, justifyContent:'center', alignItems:'center',}}> 
          <ActivityIndicator style={{marginTop: 114, textAlign: 'center'}} size="95" color="#0e2a35ff"/> 
          <Text style={{color: '#0e2a35ff', fontSize:21, fontStyle: "italic", fontWeight:"bold", textAlign:"center",}}> Loading...</Text> 
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
      marginLeft: 3,
      color: 'white',
    }, 
    titletext: {
      fontSize: 12,
      fontWeight: '600',
      marginLeft: 3,
      color: 'black',
    },
      mainCardView: {
        height: 256,
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
        width: (Dimensions.get('window').width/100)*47,
      },
      subCardView: {
        minHeight: 235,
        width: (Dimensions.get('window').width*0.47),
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
        flex: 1,
      }, 
      icon: {
        height: 57,
        opacity: 1,
        elevation:2,
        textAlign: "center" 
      }
})