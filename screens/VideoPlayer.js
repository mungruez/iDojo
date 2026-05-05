import React, { useState, useEffect } from "react";
import { View, ScrollView, Dimensions, Text, StyleSheet, AppState, ActivityIndicator, TouchableOpacity, Image, Alert, Share } from "react-native"; 
import { SafeAreaView } from 'react-native-safe-area-context';
import { useVideoPlayer, VideoView } from 'expo-video'; 
import { useIsFocused } from '@react-navigation/native';
import YoutubePlayer from "react-native-youtube-iframe";
import * as Sharing from 'expo-sharing';

const deviceWidth = Dimensions.get('window').width;


export default function VideoPlayer({ video }) {
  const isFocused = useIsFocused(); 
  const [playing, setPlaying] = useState(true);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const subscription = AppState.addEventListener("change", nextAppState => {
      if (nextAppState !== "active") {
        setPlaying(false); 
      }
    });

    return () => subscription.remove();
  }, []);


  useEffect(() => {
    if (!isFocused) {
      setPlaying(false);
    }
  }, [isFocused]);



  const isYouTube = video.videoUrl && video.videoUrl.length > 0 && video.videoUrl.length < 19; 

  const player = useVideoPlayer(isYouTube ? '' : video.vid?.length > 0 ? video.vid : video.videoUrl, (player) => {
    if (isYouTube) return;
  
    player.loop = true;
    if (video.videoUrl && video.videoUrl.length >= 19) {
      player.play();
    }

    player.addListener('statusChange', ({ status }) => {
      if (status === 'readyToPlay') {
        setLoading(false);
      } else if (status === 'loading') {
        setLoading(true);
      }
    });
  });



  const shareVideo = async () => {
    try {
      if (!video) {
        Alert.alert('Share Error', 'No video available to share.');
        return;
      }

      if (isYouTube) {
        const youtubeUrl = `https://youtu.be/${video.videoUrl}`;
        await Share.share({ title: video.title, message: youtubeUrl, url: youtubeUrl });
        return;
      }

      const uri = video.vid?.startsWith('file://') ? video.vid : video.videoUrl;
      if (!uri) {
        Alert.alert('Share Error', 'No video source available to share.');
        return;
      }

      if (uri.startsWith('file://')) {
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, {
            mimeType: 'video/mp4',
            dialogTitle: `Share ${video.title}`,
          });
        } else {
          Alert.alert('Share Error', 'Sharing is not available on this device.');
        }
      } else {
        await Share.share({ title: video.title, message: uri, url: uri });
      }
    } catch (error) {
      Alert.alert('Share Error', error.message || 'Could not share video.');
    }
  };


  return (
    <SafeAreaView style={{ backgroundColor: '#323232', width: '100%', height: '100%', marginTop: 38 }}>
      
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12, marginBottom: 9 }}>
        <Text style={{ backgroundColor: '#2f4f4f', color: 'crimson', fontSize: 21, flex: 1, flexWrap: 'wrap', textAlign: 'left' }}>
          {video.title}
        </Text>
        <TouchableOpacity onPress={shareVideo} style={{ marginLeft: 8, padding: 4, height: 28, width: 28, justifyContent: 'center', alignItems: 'center' }}>
          <Image source={require('../assets/redsharearrow.png')} style={{ width: 24, height: 24 }} resizeMode='contain' />
        </TouchableOpacity>
      </View>

      { video.videoUrl && video.videoUrl.length < 19 ?
        ( <View style={styles.wvcontainer}> 
            <YoutubePlayer
              height={deviceWidth * 0.57}
              play={playing && isFocused}
              videoId={video.videoUrl}
              initialPlayerParams={{
                controls: true,
                modestbranding: true,
                rel: false,
              }}
            />
        </View> )
        : ( <View style={{flex: 1, padding: 0, backgroundColor: '#323232', marginLeft: 0,marginTop: 5, marginBottom: 0, width: "100%", maxHeight: "45%" }}>
            <VideoView
              player={player}
              allowsTransparency={true}
              contentFit="contain"
              useNativeControls
              allowsPictureinPicture
              style={{ flex: 1, marginBottom: 5, marginLeft: 1, marginRight: 3, padding: 0, borderColor:'#9a9aa1', borderWidth: 2, height: "38%%"}}
            />

             { loading && (
                <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.7)' }}>
                    <ActivityIndicator size="large" color="#f30707" />
                    <Text style={{ color: 'white', marginTop: 10 }}>Loading...</Text>
                </View>
            ) }
        </View>)
      }

      <View style={{maxHeight: "33%"}}>
        <ScrollView>
          <Text style={{backgroundColor:'#323232', color:"#fff", marginLeft: 12, marginRight: 7, marginBottom: 19, padding: 9, width: "96%"}}>
              {video.desc}
          </Text>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  wvcontainer: {
    marginTop: 2, 
    width: deviceWidth,
  }
});