import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import React, { useEffect, } from 'react';

const LOCAL_AUDIO_MAP = {
  0: require('../assets/freeyourmind/freeyourmind(part1).mp3'),
  1: require('../assets/freeyourmind/freeyourmind(part2).mp3'),
  2: require('../assets/freeyourmind/freeyourmind(part3).mp3'),
  3: require('../assets/freeyourmind/freeyourmind(part4).mp3'),
  4: require('../assets/freeyourmind/freeyourmind(part5).mp3'),
  5: require('../assets/freeyourmind/freeyourmind(part6).mp3'),
  6: require('../assets/freeyourmind/freeyourmind(part7).mp3'),
  7: require('../assets/freeyourmind/freeyourmind(part8).mp3'),
  8: require('../assets/freeyourmind/freeyourmind(part9).mp3'),
  9: require('../assets/freeyourmind/theuniverseforcesyoutoletgo(part1).mp3'),
  10: require('../assets/freeyourmind/theuniverseforcesyoutoletgo(part2).mp3'),
  11: require('../assets/freeyourmind/theuniverseforcesyoutoletgo(part3).mp3'),
};

export default function TrackPlayer({ track, onFinished }) {
  const source = track.id <= 11 ? LOCAL_AUDIO_MAP[track.id] : track.uri;
  const player = useAudioPlayer(source);
  const status = useAudioPlayerStatus(player);

  const formatTime = (seconds) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  //Initial Play & Auto-Unload/Cleanup
  useEffect(() => {
    if(player) player.play();
    
    return () => {
      if(player) player.pause();
    };
  }, [player]);

  //Sync with Pause/Play Button from Parent
  useEffect(() => {
    if (!player || !status || !track) return;

    if (track.ispaused && status.playing) {
      player.pause();
    } else if (!track.ispaused && !status.playing) {
      player.play();
    }
  }, [track.ispaused, status.playing]);

  useEffect(() => {
    if (status && status.didJustFinish) {
      onFinished();
    }
  }, [status.didJustFinish]);

  useEffect(() => {
    if (status.error) {
      alert(`Connection issue with "${track.filename}". Please check your WiFi...`);
      onFinished(); 
    }
  }, [status.error]);

  return (
    <View style={styles.row}>
      {status.error ? (
        <Text style={styles.duration}>WiFi Error</Text>
          ) : status.playing || status.currentTime > 0 ? (
            <Text style={styles.duration}>
              {formatTime(status.currentTime)} / {formatTime(status.duration)}
            </Text>
          ) : player && !track.ispaused ?
            <ActivityIndicator size="small" color="#5b12a5ff" /> :
      <></> }
    </View>
  );
};

const styles = StyleSheet.create({
  row: { 
    marginTop: -43, 
    padding: 1, 
    backgroundColor: 'transparent', 
    borderRadius: 7,
    borderWidth: 0, 
    width:"fit-content",
    alignItems: "center",
    borderRadius: 50,
  }, 
  slider: { 
    flex: 1, 
    height: 40,
    marginHorizontal: 5
  },
  duration: {
    fontSize: 12,
    color: "#5b12a5ff",
    fontWeight: 'bold',
    borderColor: '#8d6facff',
    backgroundColor: '#C0C0C0',
    borderWidth: 2,
    borderRadius: 19,
  }
});
