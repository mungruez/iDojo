import React, { useRef, useState } from "react";
import { View, Dimensions, Text, StyleSheet } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Video, ResizeMode } from "expo-av";
import VideoControls from "./VideoControls";
import * as ScreenOrientation from "expo-screen-orientation";
import { WebView } from 'react-native-webview';
import YoutubePlayer from 'react-native-youtube-iframe';

const playbackSpeedOptions = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2];

const deviceWidth = Dimensions.get('window').width;
const deviceHeight = Dimensions.get('window').height;

const INJECTED_JAVASCRIPT = `
  (function() {
    const header = document.getElementById('header');
    if (header) {
      header.style.display = 'none';
    }
    
    const footers = document.getElementsByClassName('footer');
    for (let i = 0; i < footers.length; i++) {
      footers[i].style.display = 'none';
    }
  })();
`;

const FeaturedMove = ({ route, navigation }) => {
  const { video } = route.params;
  const videoRef = useRef(null);
  const [orientation, setOrientation] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const togglePlayPause = () => {
    if (isPlaying) {
      videoRef.current.pauseAsync();
    } else {
      videoRef.current.playAsync();
    }
    setIsPlaying(!isPlaying);
  };

  const togglePlaybackSpeed = () => {
    //gets the next playback speed index
    const nextSpeedIndex = playbackSpeedOptions.indexOf(playbackSpeed) + 1;
    if (nextSpeedIndex < playbackSpeedOptions.length) {
      videoRef.current.setRateAsync(playbackSpeedOptions[nextSpeedIndex], true);
      setPlaybackSpeed(playbackSpeedOptions[nextSpeedIndex]);
    }
    //if the last option i.e. 2x speed is applied. then moves to first option 
    else {
      videoRef.current.setRateAsync(playbackSpeedOptions[0], true);
      setPlaybackSpeed(playbackSpeedOptions[0]);
    }
  };

  const toggleMute = () => {
    videoRef.current.setIsMutedAsync(isMuted);
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = async () => {
    if (!isFullscreen) {
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.LANDSCAPE_LEFT
      );
      setIsFullscreen(true);
    } else {
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT_UP
      );
      setIsFullscreen(false);
    }
    setOrientation(await ScreenOrientation.getOrientationAsync());
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor:'#323232',width:'100%', height:'100%', marginTop:38 }}>
     <Text style={{ backgroundColor:'#2f4f4f',color:"crimson",textAlign:"center",fontSize:21,marginBottom:9 }}>
      {video.Title}
     </Text>
       {video.Link && video.Link.length < 19 ? (
        <View style={{flex:1, padding:0,backgroundColor:'#323232',marginLeft:0,marginTop:5, marginBottom:0, width:"100%" }}>
            <YoutubePlayer
              height={500}
              style={{ alignSelf: 'stretch', height: 700 }}
              fullscreen={true}
              videoId={video.Link}
            />
        </View>) : video.Vend < 0 ?
        ( <View style={styles.wvcontainer}> 
          <WebView
            style={styles.webview}
            injectedJavaScript={INJECTED_JAVASCRIPT}
            source={{uri: video.Link}}
          /> 
        </View> ) : (
        <View style={{flex:1, padding:0,backgroundColor:'#323232',marginLeft:0,marginTop:5, marginBottom:0, width:"100%", maxHeight:"91%" }}>
            
            <Video
              ref={videoRef}
              source={{ uri: video.Link }}
              rate={playbackSpeed}
              isMuted={isMuted}
              shouldPlay={isPlaying}
              resizeMode={ResizeMode.CONTAIN}
              width={deviceWidth}
              height={deviceHeight}
              style={{ flex: 1,marginBottom:5, marginLeft:1, marginRight:3, padding:0,borderColor:'#9a9aa1',borderWidth:2, height:"95%" }}
            />
          
          {showControls && (
          <View style={{ marginLeft:1, marginRight:3, marginTop:0, width:"99%", paddingTop:0,borderColor:'#9a9aa1',borderWidth:2,marginBottom:0,padding:7, backgroundColor:"#323232" }}>
            <VideoControls
              onTogglePlayPause={togglePlayPause}
              onToggleMute={toggleMute}
              onTogglePlaybackSpeed={togglePlaybackSpeed}
              onToggleFullscreen={toggleFullscreen}
              rate={playbackSpeed}
              isMuted={isMuted}
              shouldPlay={isPlaying}
              fullScreenValue={isFullscreen}
            />
          </View>
          )}
        </View>
        )
      }
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  wvcontainer: {
    flex: 1,
    marginTop: -50, // Add some top margin
    width: deviceWidth,
    height: deviceHeight, // Define the height of the WebView container in React Native
  },
  webview: {
    flex: 1, // Make the WebView fill its container
    backgroundColor: 'black',
  },
});

export default FeaturedMove;