import { StyleSheet, Text, View, ImageBackground, TouchableWithoutFeedback , ScrollView, StatusBar } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { useAudioPlayer } from 'expo-audio';

const ksoundFile = require('../assets/woosh.mp3');


export default function Resources() {
  const navigation = useNavigation();


  const kplayer = useAudioPlayer(ksoundFile, (kplayer) => {
      kplayer.loop = false; 
    });
  

  const navKSound = () => {
    try {
      if(kplayer) {
        kplayer.play();
      }
    } catch (error) {
        alert("Error playing sound effect");
    }
    navigation.navigate("LoginScreen");
  };


  return (
    <ImageBackground style={ styles.imgBackground } resizeMode='stretch' source={require('../assets/greentextbackground.png')}>
      <StatusBar barStyle="light-content"/>
      <SafeAreaView style={{ flex: 1, height: "100%", marginTop:7, backgroundColor: 'transparent',}}>

      <TouchableWithoutFeedback  activeOpacity={1} onLongPress={() => navKSound()} delayLongPress={1200} style={{ marginBottom:19, paddingTop:1, paddingBottom:7, height:76 ,width: '90%',alignSelf: 'center',zIndex: 19,elevation: 19,}}>
        <ImageBackground style={ styles.icon } resizeMode='contain' source={require('../assets/resourcestitle.png')} /> 
      </TouchableWithoutFeedback > 

      <ScrollView style={{ flexDirection:"column", marginTop:5, marginBottom: 1, paddingBottom: 5 }}>
        <View style={{marginTop:2, borderColor:'silver', borderWidth:1, borderRadius:7, marginBotton:19}}>
<Text style={ styles.title }> Thank you for downloading the iDojo mobile App by DojoSoft, we hope you have learned about Self Defense, your support will be put to constructive use as we continue to build a community. Special thanks to all involved, a lot of time and effort was put into making iDojo. Thank you to the sponsors, people and organizations who made this original App possible. We mention them here with their corporate or organizational affiliation at the time from which this App was created.
  Thanks to: The World Boxing Federation, MMA and UFC for giving us the opportunity to analyse the best fighters of all time and their fighting styles. Most of all be careful when trying out these moves and have fun. 
  Disclaimer: This App does not collect any data from any device and is excellent with battery consumption.    
</Text>
<Text style={ styles.title }>Years of research into accumulating the best video, audio and graphics for Self Defense Moves has made iDojo a masterpice. All future upgrades will be free as the main goal is to teach Self Defense to those who would use it only when required. Use the volume buttom(top right) to control sounds, videos can be played in slow motion, wifi is only needed for the Featured List. DojoSoft`s continues to innovate by placing an invisible button in this iDojo App that will launch a secret password Manager App. DojoSoft promises to be the best Self Defense mobile App by releasing meaningful upgrades in the future. We plan to realse:-  In-app video recording and move analysis to allow users to record themselves performing techniques and use a video analysis service to provide feedback on their form, timing, and execution to offer personalized coaching tips based on the user's performance. Other future upgrades include:-  A community forum, Challenges and an AI Coach for traing and gear.
</Text>

<Text style={ styles.movesList }>Moves List:</Text>
<Text style={ styles.title }> A list of over eighty videos of Moves with audio and text instructions. Each video was carefully edited to contain a description with an AI Morpheus voice and can be slowed in order to, view the Move in slow motion.</Text>

<Text style={ styles.manuals }>Manuals:</Text>
<Text style={ styles.title }>A list of over 100 Moves for Self Defense training. Each Move has step by step instructions with images to make learning Moves easier. 
</Text>

<Text style={ styles.addMove }>Add Move:</Text>
<Text style={ styles.title }> Add, Share, Edit, View, Delete and Import your own Self Defense Moves into the iDojo App. You can also share the Move image or images, a single video or a single pdf when viewing a move. Moves can only be shared and imported with the iDojo App, only single videos, images and PDFs can be shared externally and instuctions are provided. Awesome for sharing individual Self Defence stories, albums, events and more. </Text>

<Text style={ styles.chapters }>Chapters:</Text>
<Text style={ styles.title }>Add, Share, Edit, View, Delete and Import your own Chapters to the iDojo App. A Chapter is a collection of videos, audios, images and PDFs in any number and in any order. You can also share an individual Chapter image, a single video or a single pdf when viewing a chapter. Chapters can be shared and imported with the iDojo App and our free wheeShare App. Only single videos, images and PDFs can be shared externally and instuctions are provided. Chapters are awesome for sharing lessons, courses, albums, events and more.
</Text>

<Text style={ styles.fightersList }>Fighters List:</Text>
<Text style={ styles.title }> A first time ever, list of the best fighters of all time. Each fighter was hand picked and carefully researched by DojoSoft before being added to the list. DojoSoft only considers real life, fighting styles that are practised for effective Self Defense. 
</Text>

<Text style={ styles.featured }>Featured:</Text>
<Text style={ styles.title }>DojoSoft's hand picked list of online videos and shorts for Self Defense, with our Featured Move Of The Day. Whether your looking for one to one paid training or just a quick watch and learn, then, this iDojo's Featured List has it. Each video must meet certain criteria in order to be considered effective Self Defense Training. WiFi is necessary for this section as Featured videos are copyrighted. Please contact us on social media to have your suggested videos in our Featured List.
</Text>

<Text style={ styles.freeyourmind }>Free Your Mind:</Text>
<Text style={ styles.title }>Audio for a healthy mind tthat will motivate Self Defense learning and intense training. Each Audio is carefully handcrafted to be interlectually, heart touching to enable you to free your mind. When playing audio, click the purple bar in the slider for seeking.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
    </ImageBackground>
  )
}


const styles = StyleSheet.create({
  imgBackground: {
    marginBottom:"5%",
    width: '100%',
    maxHeight: '95%',
    flex: 1,
    opacity: 1, 
  },
  title: {
    fontSize: 15,
    fontWeight:'medium',
    color:'white',
    backgroundColor:'lightgrey',
    backgroundColor: 'rgba(211, 211, 211, 0.1)',
    marginLeft:19,
    marginRight:19,
    marginTop: 7,
    marginBottom: 12,
    padding: 5,
  },
  text: {
    fontSize: 19,
    fontWeight:'400',
    color:'white',
    backgroundColor:'#2f4f4f',
    margin:5,
    borderColor:'silver',
    borderWidth:1.5,
    borderRadius:5
  },
  icon: {
    height: 76,
    elevation: 3,
    marginTop:38,
    textAlign: "center",
    zIndex:3 
  },
  invisiblebtn: {
    background: "transparent",
    backgroundColor: "transparent",
    border: "none",
    width: 43,   
    height: 43,
    visibility: "hidden",   
    position: "absolute",
    bottom: 19,
    right: 19,
    zIndex:99,
    elevation:99,
  },
  buttonArea: {
    flex: 1,
  },
  addMove: {
    textDecorationLine: 'underline',
    textDecorationColor: '#f74646',
    color:'red',
    fontSize: 19,
    fontStyle: "italic",
    fontWeight:'600',
    marginLeft: 7,
  },
  movesList: {
    textDecorationLine: 'underline',
    textDecorationColor: '#92192d',
    color:'red',
    fontSize: 19,
    fontStyle: "italic",
    fontWeight:'600',
    marginLeft: 7,
  },
  fightersList: {
    textDecorationLine: 'underline',
    textDecorationColor: '#b8ca12',
    fontStyle: "italic",
    color:'yellow',
    fontSize: 19,
    fontWeight:'600',
    marginLeft: 7,
  },
  chapters: {
    textDecorationLine: 'underline',
    textDecorationColor: '#948b0b',
    fontStyle: "italic",
    color: '#948b0b',
    fontSize: 19,
    fontWeight:'600',
    marginLeft: 7,
  },
  manuals: {
    textDecorationLine: 'underline',
    textDecorationColor: '#0b942e',
    fontStyle: "italic",
    color:'green',
    fontSize: 19,
    fontWeight:'600',
    marginLeft: 7,
  },
  featured: {
    textDecorationLine: 'underline',
    textDecorationColor: 'silver',
    fontStyle: "italic",
    fontSize: 19,
    color:'silver',
    fontWeight:'600',
    marginLeft: 7,
  },
  freeyourmind: {
    textDecorationLine: 'underline',
    textDecorationColor: '#a30cc9',
    fontStyle: "italic",
    fontSize: 19,
    color:'purple',
    fontWeight:'600',
    marginLeft: 7,
  },
})