import { View, ScrollView, Text } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useVideoPlayer, VideoView } from 'expo-video';

const videos = require.context('../assets/videos', true, /\.mp4$/);

const videoSources = videos.keys().map((key) => videos(key));

const MoveScreen = ({ route, navigation }) => {
  const { video } = route.params;

  //useVideoPlayer hook init video source with move.mid or move.vid automatically unloads video when component unmounts
  const player = useVideoPlayer(videoSources[video.mid], (player) => {
    player.loop = true;
    player.play();
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor:'#323232',width:'100%', height:'100%', marginTop:38, opacity: 1 }}>
      <Text style={{ backgroundColor:'#2f4f4f',color:"crimson",textAlign:"center",fontSize:21,marginBottom:9 }}>
        {video.title}
      </Text>

      {video.title && (
        <View style={{flex:1, padding:0,backgroundColor:'#323232',marginLeft:0,marginTop:5, marginBottom:0, width:"100%", maxHeight:"45%" }}>
            
            <VideoView
              player={player}
              allowsTransparency={true}
              contentFit="contain"
              useNativeControls
              allowsPictureinPicture
              allowsPlayBackSpeed={true}
              style={{ flex: 1,marginBottom:5, marginLeft:1, marginRight:3, padding:0,borderColor:'#9a9aa1', borderWidth:2, width:"100%", height:"38%" }}
            />
        
        </View>
      )}

      <View style={{maxHeight:"33%"}}>
        <ScrollView>
          <Text style={{backgroundColor:'#323232', color:"#fff", marginLeft:12, marginRight:7, marginBottom:19,padding:9, width:"96%"}}>
              {video.desc}
          </Text>
        </ScrollView>
      </View>

    </SafeAreaView>
  );
};

export default MoveScreen;