import React, { useState, useRef } from 'react';
import { View, StyleSheet, Button, SafeAreaView, Text } from 'react-native';
import Animated, {FadeInDown, FadeIn} from 'react-native-reanimated';
import Video from 'react-native-video';
import v1 from '../assets/videos/elbowstrike.mp4'

export default function Resources() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [vrate, setVrate] = useState(1.0);
    const videoRef = useRef(null); 

    const togglePlaying = () => {
      if (videoRef.current) {
        if (isPlaying) {
          videoRef.current.pause();
        } else {
          videoRef.current.play();
        }
        setIsPlaying(!isPlaying);
        if (vrate==.5) {
            setVrate(1.0);
        }
      }
    };

    const toggleVrate = () => {
      if (vrate==1) {
        setVrate(.5);
      }
    };

    const togglePrate = () => {
        if (vrate==.5) {
          setVrate(1.0);
        }
    };

    return (
      <SafeAreaView style={{ flex: 1, height: "100%", marginTop:25, backgroundColor: '#fff',}}>
        <View>
          <Video
                ref={videoRef}
                source={require('../assets/videos/elbowstrike.mp4')}
                paused={!isPlaying}
                controls={false} // Hide built-in controls
                rate={vrate}
                style={styles.backgroundVideo}
                muted={isMuted}
            />
         
          <Button onPress={togglePlaying} title={isPlaying ? 'Stop' : 'Play'} />

          <Button
            onPress={() => setIsMuted(m => !m)}
            title={isMuted ? 'Unmute' : 'Mute'}
          />
          <Button onPress={toggleVrate} title={'Slow'} />
          
        </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    backgroundVideo: {
    width: 320,
    height: 620,
  },
  textContainer: {
    margin: 20,
    flexShrink: 1,
    gap: 10,
  },
})