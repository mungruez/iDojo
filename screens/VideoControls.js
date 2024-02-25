import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";

const VideoControls = ({
  onTogglePlayPause,
  onToggleMute,
  onTogglePlaybackSpeed,
  onToggleFullscreen,
  rate,
  isMuted,
  shouldPlay,
  fullScreenValue,
}) => {

  return (
    <>
      <View style={styles.controls}>
        <TouchableOpacity
          onPress={() => {
            onTogglePlayPause();
          }}
          style={styles.controlButton}
        >
          <Ionicons
            name={shouldPlay ? "pause" : "play-sharp"}
            size={24}
            color="white"
          />
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => {
            onToggleMute();
          }}
          style={styles.controlButton}
        >
          <Ionicons
            name={isMuted ? "volume-mute" : "volume-high"}
            size={24}
            color="white"
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            onTogglePlaybackSpeed();
          }}
          style={styles.controlButton}
        >
          <Text style={styles.playbackSpeedText}>{`${rate}x`}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            onToggleFullscreen();
          }}
          style={styles.controlButton}
        >
          <MaterialIcons
            name={fullScreenValue ? "fullscreen-exit" : "fullscreen"}
            size={24}
            color="white"
          />
        </TouchableOpacity>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    backgroundColor: "#323232",
  },
  controlButton: {
    marginHorizontal: 10,
  },
  playbackSpeedText: {
    color: "white",
    fontSize: 16,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    alignSelf: "center",
    backgroundColor: "black",
    padding: 10,
  },
  slider: {
    flex: 1,
    marginHorizontal: 10,
  },
  timeText: {
    color: "white",
    fontSize: 12,
  },
});

export default VideoControls;