
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, TouchableOpacity, View, ImageBackground, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useState } from 'react';
import { Audio } from 'expo-av';

export default function FreeYourMindScreen() {
    const [musicFiles, setMusicFiles] = useState([]);
    const [playing, setPlaying] = useState(-1);
    const [fymsound, setSound] = useState(null);
    const [progressDuration, setProgressDuration] = useState("0:00");

    const fetchMusicFiles = async () => {
        const mhaudio = [
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
          duration: "19:41",
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
        setMusicFiles(mhaudio);
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
                require('../assets/freeyourmind/shaolinfreeyourmind(part1).mp3'),
                { shouldPlay: true }
            ); 
            setSound(sound);
            //setPlaying(fileID);
        } else if(fileID==1) {
            const { sound } = await Audio.Sound.createAsync(
                require('../assets/freeyourmind/shaolinfreeyourmind(part2).mp3'),
                { shouldPlay: true }
            ); 
            setSound(sound);
            //setPlaying(fileID);
        } else if(fileID==2) {
            const { sound } = await Audio.Sound.createAsync(
                require('../assets/freeyourmind/shaolinfreeyourmind(part3).mp3'),
                { shouldPlay: true }
            ); 
            setSound(sound);
            //setPlaying(fileID);
            console.log("playing part 3  fileID:"+fileID);
        } else if(fileID==3) {
            const { sound } = await Audio.Sound.createAsync(
                require('../assets/freeyourmind/shaolinfreeyourmind(part4).mp3'),
                { shouldPlay: true }
            ); 
            setSound(sound);
            //setPlaying(fileID);
        } else if(fileID==4) {
            const { sound } = await Audio.Sound.createAsync(
                require('../assets/freeyourmind/shaolinfreeyourmind(part5).mp3'),
                { shouldPlay: true }
            ); 
            setSound(sound);
            //setPlaying(fileID);
        } else if(fileID==5) {
            const { sound } = await Audio.Sound.createAsync(
                require('../assets/freeyourmind/shaolinfreeyourmind(part6).mp3'),
                { shouldPlay: true }
            ); 
            setSound(sound);
            
        } else if(fileID==6) {
            const { sound } = await Audio.Sound.createAsync(
                require('../assets/freeyourmind/shaolinfreeyourmind(part7).mp3'),
                { shouldPlay: true }
            ); 
            setSound(sound);
            
        } else if(fileID==7) {
            const { sound } = await Audio.Sound.createAsync(
                require('../assets/freeyourmind/shaolinfreeyourmind(part8).mp3'),
                { shouldPlay: true }
            ); 
            setSound(sound);
          
        } else if(fileID==8) {
            const { sound } = await Audio.Sound.createAsync(
                require('../assets/freeyourmind/theuniverseforcesyoutoletgo(part1).mp3'),
                { shouldPlay: true }
            ); 
            setSound(sound);
            
        } else if(fileID==9) {
            const { sound } = await Audio.Sound.createAsync(
                require('../assets/freeyourmind/theuniverseforcesyoutoletgo(part2).mp3'),
                { shouldPlay: true }
            ); 
            setSound(sound);
            
        } else if(fileID==10) {
            const { sound } = await Audio.Sound.createAsync(
                require('../assets/freeyourmind/theuniverseforcesyoutoletgo(part3).mp3'),
                { shouldPlay: true }
            ); 
            setSound(sound);
        
        } else if(fileID==11) {
            const { sound } = await Audio.Sound.createAsync(
                require('../assets/freeyourmind/theuniverseforcesyoutoletgo(part4).mp3'),
                { shouldPlay: true }
            ); 
            setSound(sound);
    
        }

      } catch(error) {
        alert(error+" .Error in playMusic  track#: "+playing);
      }
    }



    const pauseMusic = async () => {
      try {
        if(fymsound) {
          await fymsound.stopAsync();
          setPlaying(-1);
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
      fetchMusicFiles();
      //Unload sound when component unmounts to prevent memory leaks
      return () => {
        pauseMusic();
      };
    }, [])
    


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
                                        source={playing !== file.id ? require('../assets/fymplaybutton.png') : require('../assets/fympausebutton.png')}>

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