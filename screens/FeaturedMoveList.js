import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, FlatList, Pressable, ImageBackground, Image,Dimensions, ActivityIndicator, ScrollView  } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react'
import { useNavigation } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function FeatureMoveList() {
  const [isloading, setIsLoading] = useState(true);
  const [errormsg, setError] = useState(false);
  const [fvideos, setFvideos] = useState([]);
  const navigation = useNavigation();

  const deviceWidth = (Dimensions.get('window').width / 100)*46;
  const deviceHeight = Dimensions.get('window').height;

  const stringInt = (rawString) => {
    const cleanString = rawString.trim();
    const numericString = cleanString.replace(/[^0-9.]/g, '');
    const valueInt = rawString ? parseInt(numericString, 10) : 0;
    return valueInt;
  };

  const fetchFvideos = async () => {
    //await AsyncStorage.clear();
    let errorFlag = 0;
    try {
    //Memory cleared if Diff in current and last updated dates > 2.28 days
      const savedDate = await AsyncStorage.getItem('xx7771xxiDojoFvideosDateStamp');
      if (savedDate) {
          const currentDate = new Date();
          const savedDateObj = new Date(savedDate);
          const differenceInMs = currentDate - savedDateObj;
          console.log(`Difference in days: ${differenceInMs/ 86400000.0}`);
          if( (differenceInMs / 86400000.0) > 2.28) {
            console.log(`Difference in days: ${differenceInMs}`);
            //await AsyncStorage.clear();
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
            setFvideos(vds);
            setIsLoading(false);
            console.log("Saved Videos found: "+vds.length); // Outputs the actual string value
            return vds.length;
          }
        }).catch((error) => {
          console.error(error);
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

    setFvideos(vds);
    setIsLoading(false);

    try {
      await AsyncStorage.setItem('xx7771xxiDojoFvideos', JSON.stringify(vds));
      //Save Date Stamp as ISO string
      const currentDate = new Date().toISOString();
      await AsyncStorage.setItem('xx7771xxiDojoFvideosDateStamp', currentDate);
      console.log('Fvideoes DateStamp :'+currentDate+' Saved successfully! with: '+vds.length+' videos.');
    } catch (error) {
      alert("Unable to Store Featured List. Featured List only available when online. !");
    } 
  };


  useEffect(() => {
    const savedfv=fetchFvideos();
    if ( savedfv && savedfv > 38 && fvideos.length > 38 ) { 
      console.log("Saved Featured videos found! "+fvideos.length);
      return;
    }
    console.log("ZERO Saved Featured videos found! ");
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
        setError(error);
      }
    )
    } catch (error) {
    // This catches network errors and the custom HTTP error above
        if (error.message === 'Network request failed') {
          alert('No internet connection detected. Wifi is required for featured content!');
         // Display a message to the user or use cached data
        } else {
          alert('An unexpected error occurred: ', error);
          //throw error, Rethrow other errors if needed
        }
    } 
  }, []);


   

  return (<ImageBackground style={ styles.imgBackground } resizeMode='cover' source={require('../assets/dojo4.jpeg')}>
    {!isloading ? <SafeAreaView style={{ flex: 1, height: "100%", marginTop:25, backgroundColor: 'transparent',}}>

      <View style={{backgroundColor: 'transparent', marginBottom:20, paddingBottom:10, opacity: .7,}}>
        <ImageBackground style={ styles.icon } resizeMode='contain' source={require('../assets/featuredtitle.png')} />
        <StatusBar style='light' />
       
      </View>

      <View style={{backgroundColor:"transparent", marginBottom:19, flex:1}}>
         <View style={{flex:1}}>
            <FlatList
              data={fvideos}
              numColumns={2}
              contentContainerStyle={{ paddingBottom: 57 }}
              showsVerticalScrollIndicator={false}
              renderItem={({ item, index }) => (
                <View
                  key={item.Title}
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
                  backgroundColor:'#2f4f4f',
                }}>
              
                { item.Vend < 0 ? <Pressable
                  onPress={() => {navigation.navigate('Featured', {video: item});}}>
                    <View key={index} > 
                      { item.Vend < 0 && <View style={{ marginTop:3, borderColor:"silver", borderWidth:1, borderRadius:5, flexDirection:"column",  minHeight:38,}}>
                        <Text style={styles.sourcetext}> {item.Source}</Text>
                      </View>} 

                      <View style={styles.mainCardView}>
                        <View style={{flexDirection: 'column', alignItems: 'flex-start', marginTop:0,}}>
                          <View style={styles.subCardView}>
                            <Image
                              source={{uri: item.Thumb}}
                              resizeMode="cover"
                              style={styles.image}
                            />
                            
                            <View style={{marginLeft: 12,}}>
                              <Text
                                style={{
                                  fontSize: 12,
                                  color: "crimson",
                                  fontWeight: 'bold',
                                  textTransform: 'capitalize',
                                }}>
                                {item.Title}
                              </Text>
                              
                              <View
                                style={{
                                  marginTop: 3,
                                  borderWidth: .5,
                                  borderColor:'#228b22',
                                  flexDirection:'row',
                                  backgroundColor:'#323232',
                                  justifyContent:'space-between',
                                }}>
                                <Text style={{color: '#9a9aa1',fontSize: 11, }}>
                                    {item.Type}
                                </Text>

                                <Text style={{color: '#fff',fontSize: 11,}}>
                                    {item.Style}
                                </Text>
                              </View>
                            </View>

                            
                          </View>
                        </View>
                      </View>
                    </View>
                </Pressable> 

                : <Pressable
                  onPress={() => {navigation.navigate('Featured', {video: item});}}>
                    <View key={index}> 
                      { item.Vend >= 0 && <View key={item.Source} style={{backgroundColor: 'silver', marginBottom:3, borderColor:"silver", borderWidth:1, borderRadius:5, flexDirection:"column", minHeight:29, width: (Dimensions.get('window').width*0.47),}}>
                        <Text style={styles.titletext}>{item.Title}</Text>
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
                                marginLeft:0,
                                height: 145,
                                width: (Dimensions.get('window').width/100)*45,
                              }}
                            />
                            </View>
                            
                            <View style={{marginLeft: 12, marginTop:5,}}>
                              <View
                                style={{
                                  marginTop: 3,
                                  borderWidth: .5,
                                  borderColor:'#228b22',
                                  flexDirection:'row',
                                  backgroundColor:'#323232',
                                  justifyContent:'space-between',
                                }}>
                                <Text style={{color: '#9a9aa1',fontSize: 11,}}>
                                    {item.Type}
                                </Text>

                                <Text style={{color: '#fff',fontSize: 11,}}>
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
          </View> 
        </View>  
      </SafeAreaView> : 
        ( <View style ={{flex:1, justifyContent:'center', alignItems:'center',}}> 
          <ActivityIndicator style={{marginTop: 114, textAlign: 'center'}} size="95" color="#0e2a35ff"/> 
          <Text style={{color: '#0e2a35ff', fontSize:21, fontStyle: "italic", fontWeight:"bold", textAlign:"center",}}> Loading...</Text> 
        </View> )
    }
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
      maxHeight: 145,
      height: "100%",
      flex: 1,
      borderRadius: 12,
      alignSelf: 'flex-start',
      marginTop:0,
      marginLeft:0,
      width: "100%",
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
        height: 246,
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