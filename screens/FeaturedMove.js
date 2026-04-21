import React, { useRef, useState, useEffect } from "react";
import { View, Dimensions, Text, StyleSheet, AppState } from "react-native"; 
import { SafeAreaView } from 'react-native-safe-area-context';
import { useVideoPlayer, VideoView } from 'expo-video'; 
import { useIsFocused } from '@react-navigation/native';
import YoutubePlayer from "react-native-youtube-iframe";

const deviceWidth = Dimensions.get('window').width;

const FeaturedMove = ({ route, navigation }) => {
  const { video } = route.params;
  const isFocused = useIsFocused(); 
  const [playing, setPlaying] = useState(true);


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


  const player = useVideoPlayer(video.Link, (player) => {
    player.loop = true;
    if (video.Link && video.Link.length >= 19) {
      player.play();
    }
  });


  return (
    <SafeAreaView style={{ backgroundColor:'#323232',width:'100%', height:'100%', marginTop: 38 }}>
     <Text style={{ backgroundColor:'#2f4f4f',color:"crimson", textAlign:"center",fontSize: 21, marginBottom: 9 }}>
      {video.Title}
     </Text>

       {video.Link && video.Link.length < 19 ?
        ( <View style={styles.wvcontainer}> 
            <YoutubePlayer
              height={deviceWidth * 0.5625}
              play={playing && isFocused}
              videoId={video.Link}
              initialPlayerParams={{
                controls: true,
                modestbranding: true,
                rel: false,
              }}
            />
        </View> )
        : ( <View style={{flex: 1, padding: 0,backgroundColor: '#323232',marginLeft: 0,marginTop: 5, marginBottom: 0, width: "100%", maxHeight: "91%" }}>
            <VideoView
              player={player}
              allowsTransparency={true}
              contentFit="contain"
              useNativeControls
              allowsPictureinPicture
              style={{ flex: 1,marginBottom: 5, marginLeft: 1, marginRight: 3, padding: 0, borderColor:'#9a9aa1', borderWidth: 2, height: "95%"}}
            />
        </View>)
      }
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  wvcontainer: {
    marginTop: 2, 
    width: deviceWidth,
  }
});

export default FeaturedMove;