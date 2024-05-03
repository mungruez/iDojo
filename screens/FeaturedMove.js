import React, { useRef, useState, useEffect } from "react";
import { Dimensions, View, ScrollView, Text } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Video, ResizeMode } from "expo-av";
import VideoControls from "./VideoControls";
import * as ScreenOrientation from "expo-screen-orientation";
import { WebView } from 'react-native-webview';
import YoutubePlayer from 'react-native-youtube-iframe';


const playbackSpeedOptions = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2];

const videos = require.context('../assets/videos', true, /\.mp4$/);

const videoSources = videos.keys().map((key) => videos(key));


const FeaturedMove = ({ route, navigation }) => {
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
        lessonDescription: "Introduction to Self Defense",
        videoTotalDuration: "600",
        lessonThumbnailImageUrl: "https://example.com/thumbnail1.jpg",
      },
      {
        lessonId: "2",
        lessonVideoUrl: "https://example.com/video2.mp4",
        lessonTitle: "Lesson 2",
        lessonDescription: "Introduction to Self defense2",
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
     <Text style={{ backgroundColor:'#2f4f4f',color:"crimson",textAlign:"center",fontSize:21,marginBottom:9 }}>
      {video.title}
     </Text>
       {video.title && (
        <View style={{flex:1, padding:0,backgroundColor:'#323232',marginLeft:0,marginTop:5, marginBottom:0, width:"100%" }}>
            
            
            
            <YoutubePlayer
    
        height={500}
       
        videoId={video.link}
      />

        </View>
      )}

    </SafeAreaView>
  );
};

export default FeaturedMove;