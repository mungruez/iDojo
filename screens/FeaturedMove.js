import React, { useRef, useState } from "react";
import { View, Dimensions, Text, StyleSheet } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { useVideoPlayer, VideoView } from 'expo-video'; 

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

  const embedUrl = `https://www.youtube.com/embed/${video.Link}?rel=0&autoplay=0&showinfo=0&controls=1`;


  const player = useVideoPlayer(video.Link, (player) => {
      player.loop = true;
      player.play();
    });


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor:'#323232',width:'100%', height:'100%', marginTop:38 }}>
     <Text style={{ backgroundColor:'#2f4f4f',color:"crimson",textAlign:"center",fontSize: 21, marginBottom: 9 }}>
      {video.Title}
     </Text>

       {video.Link && video.Link.length < 19 ?
        
        ( <View style={styles.wvcontainer}> 
          <WebView
            style={styles.webview}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            allowsInlineMediaPlayback={true}
            source={{ uri: embedUrl }}
            injectedJavaScript={INJECTED_JAVASCRIPT}
          /> 
          
        </View> )
        : (
        <View style={{flex:1, padding:0,backgroundColor:'#323232',marginLeft:0,marginTop:5, marginBottom:0, width:"100%", maxHeight:"91%" }}>
            
            <VideoView
              player={player}
              allowsTransparency={true}
              contentFit="contain"
              useNativeControls
              allowsPictureinPicture
              style={{ flex: 1,marginBottom:5, marginLeft:1, marginRight:3, padding:0,borderColor:'#9a9aa1',borderWidth:2, height:"95%"}}
            />
        </View>
        )
      }
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  wvcontainer: {
    flex: 1,
    marginTop: -50, 
    width: deviceWidth,
    height: deviceHeight, 
  },
  webview: {
    flex: 1, 
    backgroundColor: 'black',
  },
});

export default FeaturedMove;