import React, { useRef, useState, useEffect } from "react";
import { Dimensions, SafeAreaView, View, ScrollView, Text } from "react-native";
import { Video, ResizeMode } from "expo-av";
import VideoControls from "./VideoControls";
import * as ScreenOrientation from "expo-screen-orientation";

const playbackSpeedOptions = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2];

const videos = require.context('../assets/videos', true, /\.mp4$/);

const videoSources = videos.keys().map((key) => videos(key));


const MoveScreen = ({ route, navigation }) => {
  const { video } = route.params;
  const videoRef = useRef(null);
  const [orientation, setOrientation] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    // Simulate fetching lessons by course
    const fakeLessons = [
      {
        lessonId: "1",
        lessonVideoUrl: "https://example.com/video1.mp4",
        lessonTitle: "Lesson 1",
        lessonDescription: "Introduction to React Native 1",
        videoTotalDuration: "600",
        lessonThumbnailImageUrl: "https://example.com/thumbnail1.jpg",
      },
      {
        lessonId: "2",
        lessonVideoUrl: "https://example.com/video2.mp4",
        lessonTitle: "Lesson 2",
        lessonDescription: "Introduction to React Native 2",
        videoTotalDuration: "800",
        lessonThumbnailImageUrl: "https://example.com/thumbnail2.jpg",
      },
      // Add more lessons here
    ];
    //setLessons(fakeLessons);
  }, []);


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
     <Text style={{ backgroundColor:'#2f4f4f',color:"crimson",textAlign:"center",fontSize:21,marginBottom:169 }}>
      {video.title}
     </Text>
      {video.title && (
        <View style={{flex:1, padding:0,backgroundColor:'#323232',marginLeft:0,marginTop:-19, marginBottom:0, height:"60%" }}>
            
            <Video
              ref={videoRef}
              source={videoSources[video.mid]}
              rate={playbackSpeed}
              isMuted={isMuted}
              shouldPlay={isPlaying}
              resizeMode={ResizeMode.COVER}
              width={"100%"}
              height={"53%"}
              minHeight={"53%"}
              maxHeight={"60%"}
              style={{ flex: 1, marginLeft:1, marginRight:3, marginTop:-152, width:"100%", padding:0,borderColor:'#9a9aa1',borderWidth:2,marginBottom:-107 }}
            />
          
          {showControls && (
          <View style={{ marginLeft:1, marginRight:3, marginTop:-176, width:"100%", paddingTop:0,borderColor:'#9a9aa1',borderWidth:2,marginBottom:0,padding:7, elevation:3, backgroundColor:"#323232" }}>
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
      )}

      <View style={{flex: 1, height:"45%"}}>
        <ScrollView>
          <Text style={{backgroundColor:'#323232', color:"#fff", marginLeft:12, marginRight:7, marginBottom:138,padding:9, width:"96%"}}>
              {video.desc}
          </Text>
        </ScrollView>
      </View>

      {orientation == 1 && (
        <View>
    
        </View>
      )}

    </SafeAreaView>
  );
};

export default MoveScreen;