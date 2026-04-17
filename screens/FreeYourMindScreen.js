import { StyleSheet, Text, TouchableOpacity, View, ImageBackground, ActivityIndicator, FlatList, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNetInfo } from "@react-native-community/netinfo";
import { DeviceEventEmitter } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import TrackPlayer from './TrackPlayer';

export default function FreeYourMindScreen() {
  const [musicFiles, setMusicFiles] = useState([]);
  const [faudio, setFaudio] = useState([]);
  const [playingId, setPlayingId] = useState(-1);
  const [loading, setLoading] = useState(true);
  const isOffline = useNetInfo().isConnected === false;
  const navigation = useNavigation();

  const fetchMusicFiles = async () => {
        let mhaudio = [
        {
          filename: 'Free Your Mind - (Part 1)', 
          uri: '../assets/freeyourmind/freeyourmind(part1).mp3',
          duration: "2:36",
          ispaused: false,
          stopped: false,
          id: 0,
        },
        {
          filename: 'Free Your Mind - (Part 2)', 
          uri: '../assets/freeyourmind/freeyourmind(part2).mp3',
          duration: "2:46",
          ispaused: false,
          stopped: false,
          id: 1,
        },
        {
          filename: 'Free Your Mind - (Part 3)', 
          uri: '../assets/freeyourmind/freeyourmind(part3).mp3',
          duration: "3:41",
          ispaused: false,
          stopped: false,
          id: 2,
        },
        {
          filename: 'Free Your Mind - (Part 4)', 
          uri: '../assets/freeyourmind/freeyourmind(part4).mp3',
          duration: "1:05",
          ispaused: false,
          stopped: false,
          id: 3,
        },
        {
          filename: 'Free Your Mind - (Part 5)', 
          uri: '../assets/freeyourmind/freeyourmind(part5).mp3',
          duration: "3:37",
          ispaused: false,
          stopped: false,
          id: 4,
        },
        {
          filename: 'Free Your Mind - (Part 6)', 
          uri: '../assets/freeyourmind/freeyourmind(part6).mp3',
          duration: "3:37",
          ispaused: false,
          stopped: false,
          id: 5,
        },
        {
          filename: 'Free Your Mind - (Part 7)', 
          uri: '../assets/freeyourmind/freeyourmind(part7).mp3',
          duration: "3:37",
          ispaused: false,
          stopped: false,
          id: 6,
        },
        {
          filename: 'Free Your Mind - (Part 8)', 
          uri: '../assets/freeyourmind/freeyourmind(part8).mp3',
          duration: "3:53",
          ispaused: false,
          stopped: false,
          id: 7,
        },
        {
          filename: 'Free Your Mind - (Part 9)', 
          uri: '../assets/freeyourmind/freeyourmind(part9).mp3',
          duration: "19:47",
          ispaused: false,
          stopped: false,
          id: 8,
        },
        {
          filename: 'The Universe Forces You To Let Go- (Part 1)', 
          uri: '../assets/freeyourmind/theuniverseforcesyoutoletgo(part1).mp3',
          duration: "14:38",
          ispaused: false,
          stopped: false,
          id: 9,
        },
        {
          filename: 'The Universe Forces You To Let Go- (Part 2)', 
          uri: '../assets/freeyourmind/theuniverseforcesyoutoletgo(part2).mp3',
          duration: "7:45",
          ispaused: false,
          stopped: false,
          id: 10,
        },
        {
          filename: 'The Universe Forces You To Let Go- (Part 3)', 
          uri: '../assets/freeyourmind/theuniverseforcesyoutoletgo(part3).mp3',
          duration: "2:53",
          ispaused: false,
          stopped: false,
          id: 11,
        }]

        if (isOffline) {
          Alert.alert("Offline", "Internet required for some audio.");
          setMusicFiles(mhaudio);
          return;
        } 
        
        for(let faNum=0; faNum<faudio.length; faNum++) {
          mhaudio.push({
            filename: faudio[faNum].filename,
            uri: faudio[faNum].uri,
            duration: faudio[faNum].duration,
            ispaused: false,
            stopped: false,
            id: faudio[faNum].id,
          });
        }
        setMusicFiles(mhaudio);
    }

    const handleTrackFinished = () => {
      setPlayingId(-1); 
    };


    const pausePlayMusic = (fileId) => {
      if (playingId !== -1 && playingId !== fileId) {
        setPlayingId(-1); 
        setTimeout(() => {
          setPlayingId(fileId);
        }, 190);
        return;
      }
      
      setMusicFiles(prevFiles => prevFiles.map(file => {
      if (file.id === fileId) {
        const isCurrentlyActive = playingId === fileId;
          return { ...file, ispaused: isCurrentlyActive ? !file.ispaused : false };
        }
        return { ...file, ispaused: false };
      }));
      setPlayingId(fileId);
    };

    useEffect(() => {
      const subscription = DeviceEventEmitter.addListener('TRACK_FINISHED', () => {
      setPlayingId(-1);
      });

      const unsubscribeNav = navigation.addListener('beforeRemove', () => {
        setPlayingId(-1);
      });

      fetchFeaturedAudio();
      fetchMusicFiles();
      setLoading(false);
    
      return () => {
        subscription.remove(); 
        unsubscribeNav();
      };
    }, [faudio.length, navigation])


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
                //console.log(`Difference in days: ${differenceInMs}`);
                alert("Featured Content not Updated in a few days. Trying to update .....");
                const currentDate = new Date().toISOString(); 
                await AsyncStorage.setItem('xx7771xxiDojoFvideosDateStamp', currentDate);
                return errorFlag;
              }  
          }
        } catch (error) {
          alert("Featured Content not visited for some time. Updating List...");
          const currentDate = new Date().toISOString(); 
          await AsyncStorage.setItem('xx7771xxiDojoFvideosDateStamp', currentDate);
          return errorFlag;
        }
    
          let vds = [];
          try {
            AsyncStorage.getItem('xx7771xxiDojoFvideos').then((fvalue) => {
              if (fvalue != null) {
                vds = JSON.parse(fvalue);
                let hAudio = [];
                let hid = 11;

                for (let fvNum = 0; fvNum < vds.length; fvNum++) {
                  if(vds[fvNum].Type == "Audio" || vds[fvNum].Vend == 1111111) {
                    hid++;
                    hAudio.push({
                      filename: vds[fvNum].Title,
                      uri: vds[fvNum].Link,
                      duration: vds[fvNum].Desc,
                      id: hid,
                    });
                  } 
                }
                setFaudio(hAudio);
                return hAudio.length;
              }
            }).catch((error) => {
              return errorFlag;
            });
    
          } catch (error) {
            alert("Featured Content not visited for some time. Updating Videos and Audio files...");
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
  
        let hAudio = [];
        let hid = 11;
        for (let fvNum = 0; fvNum < vds.length; fvNum++) {
          if(vds[fvNum].Type == "Audio" && vds[fvNum].Vend == 1111111) {
            hid++;
            hAudio.push({
              filename: vds[fvNum].Title,
              uri: vds[fvNum].Link,
              duration: vds[fvNum].Desc,
              id: hid,
            });
          } 
        }
        setFaudio(hAudio);
    
        try {
          await AsyncStorage.setItem('xx7771xxiDojoFvideos', JSON.stringify(vds));
          const currentDate = new Date().toISOString();
          await AsyncStorage.setItem('xx7771xxiDojoFvideosDateStamp', currentDate);
          alert('Welcome to the iDojo Featured Content Section. Fvideoes DateStamp :'+currentDate+' Featured Content updated successfully! with: '+vds.length+' featured videos and free your mind audio files.');
        } catch (error) {
          alert("Unable to Store Featured List. Featured List only available when online. !");
        } 
      };
    
    

      const fetchFeaturedAudio = () => {
        const savedfv=fetchFvideos();
        if ( faudio && faudio.length > 3) { 
          return;
        }
        
        try { 
        fetch("https://sheets.googleapis.com/v4/spreadsheets/1bigTkraeJ23fgTyvmFX9_-0t5OgZPh9kCyaS6hVrHXA/values/iDojoFeaturedVideos?valueRenderOption=FORMATTED_VALUE&key=AIzaSyC6hYTt4MgX6PsHyUM1I1BPVY9CkeN35WU")
        .then(res => res.json())
        .then(
          (result) => {
            parseFvideos(result.values); 
            return;     
          },
          (error) => {
            alert('A Connection error occurred while updating featured content: ', error);
          }
        )
        } catch (error) {
            if (error.message === 'Network request failed') {
              alert('No Internet connection detected. Due to copyright laws, Wifi is required for viewing all featured content!');
            } else {
              alert('A Connection error occurred while updating featured content: ', error);
            }
        } 
      };

    if (loading) return <ActivityIndicator size="large" color="#430d79" style={{flex:1, transform: [{scale: 2.0}]}} />;

    return (
      <ImageBackground style={ styles.imgBackground } imageStyle={{ opacity: 1 }} resizeMode='cover' source={require('../assets/fymbackground.png')}>
        <SafeAreaView style={{ flex: 1, height: "100%", marginTop: 7, opacity: 1}}>
          <View style={styles.container}>

            <View style={{ marginBottom:19, paddingBottom: 7, justifyContent: "center", opacity: 1}}>
                <ImageBackground style={ styles.title } imageStyle={{ opacity: 1 }} resizeMode='contain' source={require('../assets/freeyourmindtitle.png')} />
                <StatusBar barStyle='light-content' backgroundColor='#430d79'/>
            </View>

            <Text style={styles.heading}>
                iDojo's best mind mastering audio. 
            </Text>

            <FlatList
              data={musicFiles} 
              style={{flex: 1, width:"94%", flexDirection: "column", alignSelf: "center", marginTop: 1, borderRadius: 50,}}
              keyExtractor={(item) => item.id.toString()} 
              extraData={playingId} 
              renderItem={({ item: file }) => (
                <View style={styles.list}>
                  <TouchableOpacity 
                    onPress={() => (pausePlayMusic(file.id))}                              
                    style={styles.playButton}>
                                  
                      <View style={{
                        backgroundColor: "transparent",
                        alignItems:"flex-start",
                        height: 47,
                        width: "100%",}}>
                                  
                          <ImageBackground 
                            style={ styles.imgSound }
                            imageStyle={{ opacity: 1 }}
                            resizeMode='contain' 
                            source={playingId === file.id && !file.ispaused ? require('../assets/fympausebutton.png') : require('../assets/fymplaybutton.png')}>
              
                          </ImageBackground>
                      </View>
                    </TouchableOpacity>
                    <View style={{
                        backgroundColor: "transparent",
                        alignItems:"flex-start",
                        height: 17,
                        width: "95%",}}>
                        <Text style={styles.fileName} numberOfLines={2} ellipsizeMode='tail'> {file.filename.length > 29 ? file.filename : file.filename+"\u00A0\u00A0\u00A0\u00A0"} </Text>        
                    </View>
                  

                  { playingId == file.id && (
                    <TrackPlayer track={file} />
                  )}
                </View>
              )}

              ListFooterComponent={() => (
                <View style={{ width: "100%", height: 9, justifyContent: "center", alignItems: "center", marginTop: 38, paddingBottom:4, borderRadius:12,}}>
                  <Text style={{ textAlign: "center", height: 7,  color: "rgb(52, 15, 90)", fontSize: 9, borderColor: '#5f239bff', borderWidth: 2, borderRadius: 12, padding: 1 }}>
                        ____________________________
                  </Text>
                </View>
              )} 
            />
          </View >
        </SafeAreaView>
      </ImageBackground>
    );
}


const styles = StyleSheet.create({
    container: {
        backgroundColor: "transparent",
        height: "100%",
        flex: 1,
        marginTop: 7,
    },
    heading: {
        color: "#b18bd6ff",
        fontSize: 16,
        textAlign: "center",
        fontWeight: "bold",
    },
    list: {
      marginTop: 22,
      minHeight: 67,
      width:"94%",
      backgroundColor: "#C0C0C0",
      borderRadius: 50,
      padding: 0,  
      borderColor: '#5f239bff',
      borderWidth: 5, 
    },
    fileName: {
      fontSize: 11,
      color: "#5b12a5ff",
      fontWeight: 'bold',
      maxHeight: 17,
      backgroundColor: "transparent",
      width:"100%",
      textAlign: "left",
      paddingLeft: 62,
      marginTop: -57,
      overflow: "hidden",
    },
    playButton: {
      backgroundColor: 'transparent',
      borderRadius: 50,
      width: 57,
      height: 57,
      padding: 5,
      marginLeft: 7,
      marginBottom: 5,
      marginRight: 10,
      marginTop: 5,
      borderColor: '#5f239bff',
      borderWidth: 0,
     // Unified Shadow for React Native
      shadowColor: "#c494e4",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
      elevation: 5, // Required for Android shadow
      },
    imgSound: {
      backgroundColor: "transparent",
      height: 47,
      width: 47,
      marginTop: 7,
    },
      title: {
        height: 57,
        opacity: 1,
        marginTop: 38, 
      },
    imgBackground: {
      marginBottom: "5%",
      maxHeight: "95%",
      width: "100%",
      flex: 1,
      borderRadius: 50,
    },
});