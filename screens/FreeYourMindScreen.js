
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, TouchableOpacity, View, ImageBackground, ScrollView, ActivityIndicator, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { Audio } from 'expo-av';

export default function FreeYourMindScreen() {
    const [musicFiles, setMusicFiles] = useState([]);
    const [playing, setPlaying] = useState(-1);
    const [fymsound, setSound] = useState(null);
    const [isPaused, setIsPaused] = useState(false);
    const [faudio, setFaudio] = useState([]);
    const [progressDuration, setProgressDuration] = useState("0:00");

    const fetchMusicFiles = async () => {
        let mhaudio = [
        {
          filename: 'Free Your Mind - (Part 1)', 
          uri: '../assets/freeyourmind/freeyourmind(part1).mp3',
          duration: "2:36",
          id: 0,
        },
        {
          filename: 'Free Your Mind - (Part 2)', 
          uri: '../assets/freeyourmind/freeyourmind(part2).mp3',
          duration: "2:46",
          id: 1,
        },
        {
          filename: 'Free Your Mind - (Part 3)', 
          uri: '../assets/freeyourmind/freeyourmind(part3).mp3',
          duration: "3:41",
          id: 2,
        },
        {
          filename: 'Free Your Mind - (Part 4)', 
          uri: '../assets/freeyourmind/freeyourmind(part4).mp3',
          duration: "1:05",
          id: 3,
        },
        {
          filename: 'Free Your Mind - (Part 5)', 
          uri: '../assets/freeyourmind/freeyourmind(part5).mp3',
          duration: "3:37",
          id: 4,
        },
        {
          filename: 'Free Your Mind - (Part 6)', 
          uri: '../assets/freeyourmind/freeyourmind(part6).mp3',
          duration: "3:37",
          id: 5,
        },
        {
          filename: 'Free Your Mind - (Part 7)', 
          uri: '../assets/freeyourmind/freeyourmind(part7).mp3',
          duration: "3:37",
          id: 6,
        },
        {
          filename: 'Free Your Mind - (Part 8)', 
          uri: '../assets/freeyourmind/freeyourmind(part8).mp3',
          duration: "3:53",
          id: 7,
        },
        {
          filename: 'Free Your Mind - (Part 9)', 
          uri: '../assets/freeyourmind/freeyourmind(part9).mp3',
          duration: "19:47",
          id: 8,
        },
        {
          filename: 'The Universe Forces You To Let Go- (Part 1)', 
          uri: '../assets/freeyourmind/theuniverseforcesyoutoletgo(part1).mp3',
          duration: "14:38",
          id: 9,
        },
        {
          filename: 'The Universe Forces You To Let Go- (Part 2)', 
          uri: '../assets/freeyourmind/theuniverseforcesyoutoletgo(part2).mp3',
          duration: "7:45",
          id: 10,
        },
        {
          filename: 'The Universe Forces You To Let Go- (Part 3)', 
          uri: '../assets/freeyourmind/theuniverseforcesyoutoletgo(part3).mp3',
          duration: "2:53",
          id: 11,
        }]

        for(let faNum=0; faNum<faudio.length; faNum++) {
          mhaudio.push({
            filename: faudio[faNum].filename,
            uri: faudio[faNum].uri,
            duration: faudio[faNum].duration,
            id: faudio[faNum].id,
          });
        }

        setMusicFiles(mhaudio);
        console.log("Total Free Your Mind Audio files: "+mhaudio.length);
    }


    const playMusic = async (fileID) => {
      try {
        if(fymsound && playing !== fileID && playing > -1) {
          await fymsound.stopAsync();
          await fymsound.unloadAsync();
          setSound(null);
        }
      } catch(error) {
        alert(error+" .Error in stopMusic  track#: "+playing);
      }

      setPlaying(fileID);

      try {
        await Audio.setAudioModeAsync({
        allowsRecording: false,
        //interruptionModeAndroid: Audio.InterruptionModeAndroid.,
        shouldDuckAndroid: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        //interruptionModeIOS: Audio.InterruptionModeIOS.MixWithOthers,
        playThroughEarpieceAndroid: false,
        });

        if(fileID==0) {
            const { sound } = await Audio.Sound.createAsync(
                require('../assets/freeyourmind/freeyourmind(part1).mp3'),
                { shouldPlay: true }
            ); 
            setSound(sound);
            //setPlaying(fileID);
        } else if(fileID==1) {
            const { sound } = await Audio.Sound.createAsync(
                require('../assets/freeyourmind/freeyourmind(part2).mp3'),
                { shouldPlay: true }
            ); 
            setSound(sound);
            //setPlaying(fileID);
        } else if(fileID==2) {
            const { sound } = await Audio.Sound.createAsync(
                require('../assets/freeyourmind/freeyourmind(part3).mp3'),
                { shouldPlay: true }
            ); 
            setSound(sound);
            //setPlaying(fileID);
            console.log("playing part 3  fileID:"+fileID);
        } else if(fileID==3) {
            const { sound } = await Audio.Sound.createAsync(
                require('../assets/freeyourmind/freeyourmind(part4).mp3'),
                { shouldPlay: true }
            ); 
            setSound(sound);
            //setPlaying(fileID);
        } else if(fileID==4) {
            const { sound } = await Audio.Sound.createAsync(
                require('../assets/freeyourmind/freeyourmind(part5).mp3'),
                { shouldPlay: true }
            ); 
            setSound(sound);
            //setPlaying(fileID);
        } else if(fileID==5) {
            const { sound } = await Audio.Sound.createAsync(
                require('../assets/freeyourmind/freeyourmind(part6).mp3'),
                { shouldPlay: true }
            ); 
            setSound(sound);
            
        } else if(fileID==6) {
            const { sound } = await Audio.Sound.createAsync(
                require('../assets/freeyourmind/freeyourmind(part7).mp3'),
                { shouldPlay: true }
            ); 
            setSound(sound);
            
        } else if(fileID==7) {
            const { sound } = await Audio.Sound.createAsync(
                require('../assets/freeyourmind/freeyourmind(part8).mp3'),
                { shouldPlay: true }
            ); 
            setSound(sound);
          
        } else if(fileID==8) {
            const { sound } = await Audio.Sound.createAsync(
                require('../assets/freeyourmind/freeyourmind(part9).mp3'),
                { shouldPlay: true }
            ); 
            setSound(sound);
    
        } else if(fileID==9) {
            const { sound } = await Audio.Sound.createAsync(
                require('../assets/freeyourmind/theuniverseforcesyoutoletgo(part1).mp3'),
                { shouldPlay: true }
            ); 
            setSound(sound);
            
        } else if(fileID==10) {
            const { sound } = await Audio.Sound.createAsync(
                require('../assets/freeyourmind/theuniverseforcesyoutoletgo(part2).mp3'),
                { shouldPlay: true }
            ); 
            setSound(sound);
            
        } else if(fileID==11) {
            const { sound } = await Audio.Sound.createAsync(
                require('../assets/freeyourmind/theuniverseforcesyoutoletgo(part3).mp3'),
                { shouldPlay: true }
            ); 
            setSound(sound);
        } else if(fileID>11) {
            const { sound } = await Audio.Sound.createAsync(
                {uri: musicFiles[fileID]?.uri},
                { shouldPlay: true }
            ); 
            //await sound.playAsync();
            setSound(sound);  
        }
      } catch(error) {
        alert(error+" .Error in playMusic track: "+musicFiles[fileID]?.uri);
      }
    }



    const pauseMusic = async () => {
      try {
        if(fymsound) {
          if(isPaused) {
            await fymsound.playAsync();
            setIsPaused(false);
          } else {
            await fymsound.pauseAsync();
            setIsPaused(true);
          }
        } 
      } catch(error) {
          alert("error in pauseMusic: "+error);
      }
    }



    useEffect(() => {
      if (!fymsound) {
        return;
      }
      try {
        fymsound.setOnPlaybackStatusUpdate(
            async (status) => {
                if (status.didJustFinish) {
                    setPlaying(-1)
                    await fymsound.unloadAsync();
                    setSound(null);
                }
                else {
                    let mins = status.positionMillis / 1000;
                    let secs = Math.floor(mins % 60);
                    mins = Math.floor(mins / 60);
                    setProgressDuration(" "+mins+":"+secs+" ");
                }
            }
        );
      } catch(error) {
        alert(error+" .Error in Time Progress Update, track#: "+playing);
      }
    }, [fymsound])

    
    

    useEffect(() => {
      fetchFeaturedAudio();
      fetchMusicFiles();
      //Unload sound when component unmounts to prevent memory leaks
      return () => {
        pauseMusic();
      };
    }, [faudio.length])
    


    useEffect(( ) => {
      const backAction = () => {
        //Stop audio playback here
        if(fymsound) {
          fymsound.stopAsync();
          fymsound.unloadAsync(); 
        }
        // Return false to allow default back button behavior after stopping audio
        return false; 
      };

      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        backAction
      );

      return () => backHandler.remove();
    }, [])



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
              //console.log(`Difference in days: ${differenceInMs/ 86400000.0}`);
              if( (differenceInMs / 86400000.0) > 5.70) {
                //console.log(`Difference in days: ${differenceInMs}`);
                //await AsyncStorage.clear();
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
                console.log("Saved Audio found: "+hAudio.length);
                return hAudio.length;
              }
            }).catch((error) => {
              //console.error(error);
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
        console.log("Parsed Featured Audio files: "+hAudio.length);
    
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
    
    
      const fetchFeaturedAudio = () => {
        const savedfv=fetchFvideos();
        if ( faudio && faudio.length > 3) { 
          console.log("Saved Featured audio found! "+faudio.length);
          return;
        }
        console.log("ZERO Saved Featured audio found! ");
        try { 
        fetch("https://sheets.googleapis.com/v4/spreadsheets/1bigTkraeJ23fgTyvmFX9_-0t5OgZPh9kCyaS6hVrHXA/values/iDojoFeaturedVideos?valueRenderOption=FORMATTED_VALUE&key=AIzaSyC6hYTt4MgX6PsHyUM1I1BPVY9CkeN35WU")
        .then(res => res.json())
        .then(
          (result) => {
            parseFvideos(result.values); 
            return;     
          },
          (error) => {
            alert('An unexpected error occurred while updating featured content: ', error);
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
      };



    return (
      <ImageBackground style={ styles.imgBackground } resizeMode='cover' source={require('../assets/fymbackground.png')}>
        <SafeAreaView style={{ flex: 1, height: "100%", marginTop: 7, backgroundColor: 'transparent',}}>
          <View style={styles.container}>

            <View style={{backgroundColor: 'transparent', marginBottom:19, paddingBottom:7, opacity: 1}}>
                <ImageBackground style={ styles.title } resizeMode='contain' source={require('../assets/freeyourmindtitle.png')} />
                <StatusBar style='light' />
            </View>

            <Text style={styles.heading}>
                iDojo's best mind mastering audio. 
            </Text>

            <ScrollView>
              <View style={styles.list}>

                {musicFiles.map((file, index) => {

                    return (
                        <View key={index}>
                          
                            <TouchableOpacity onPress={
                                    playing !== file.id ? () => {playMusic(file.id)} : () => {pauseMusic()}
                                } 
                                
                                style={styles.playButton}>

                                <View style={{
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    backgroundColor: "transparent",
                                    height: 47,
                                    width: "94%",
                                    }}>

                                    <ImageBackground 
                                        style={ styles.imgSound } 
                                        resizeMode='contain' 
                                        source={playing !== file.id || isPaused ? require('../assets/fymplaybutton.png') : require('../assets/fympausebutton.png')}>

                                        <Text style={styles.fileName}> {file.filename} </Text>
                                    </ImageBackground>        
                                </View>

                                <View style={styles.row}>

                                    {playing == file.id && fymsound ?
                                        <Text style={styles.duration}>
                                            {progressDuration} / {file.duration}
                                        </Text> : playing == file.id ?
                                            <ActivityIndicator size="small" color="#5b12a5ff" /> :
                                        <></>
                                    }
                                </View>
                            </TouchableOpacity>
                        </View>
                    )
                })}
              </View >

              <View style={{flex: 1, width: "94%", height: 19, marginBottom: 38, justifyContent: "center", alignItems: "center", backgroundColor: "transparent",}}>
                <Text style={{textAlign:"center", color: "#b18bd6ff", fontSize: 12, borderColor: '#5f239bff', borderWidth: 2, borderRadius: 2, padding:0, height: 12,}}> ________________ </Text>
              </View>
            
            </ScrollView>
          </View>
        </SafeAreaView>
      </ImageBackground>
    );
}


const styles = StyleSheet.create({
    row: {
        flexDirection: "row",
        justifyContent: "space-evenly",
    },
    container: {
        //backgroundColor: "#2f4f4f",
        backgroundColor: "transparent",
        height: "100%",
        marginTop: 7,
    },
    heading: {
        color: "#b18bd6ff",
        fontSize: 16,
        textAlign: "center",
        fontWeight: "bold",
    },
    list: {
        marginTop: 4,
        flex: 1,
        //backgroundColor: '#2f4f4f',
        backgroundColor: "transparent",
        flexDirection: "column",
         
    },
    duration: {
        fontSize: 12,
        color: "#5b12a5ff",
        fontWeight: 'bold',
        marginLeft: 57,
        borderColor: '#8d6facff',
        borderWidth: 2,
        borderRadius: 30,
    },
    fileName: {
        fontSize: 12,
        color: "#5b12a5ff",
        fontWeight: 'bold',
        marginLeft: 57,
        backgroundColor: "transparent",
    },
    playButton: {
        backgroundColor: '#C0C0C0',
        //backgroundColor:"transparent",
        borderRadius: 50,
        padding: 5,
        marginLeft: 16,
        marginBottom: 5,
        marginRight: 10,
        marginTop: 19,
        borderColor: '#5f239bff',
        borderWidth: 5,
        boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)',
    },
    imgSound: {
      //backgroundColor: "#2f4f4f",
      backgroundColor: "transparent",
      height: 47,
      width: 47,
      flex: 1,
      justifyContent: "space-between", 
      marginRight: 7,
    },
      title: {
        height: 57,
        opacity: 1,
        marginTop:38,
        textAlign: "center", 
      },
    imgBackground: {
      height: "100%",
      width: "100%",
      flex: 1,
      opacity: .9, 
      borderRadius: 50,
    },
});