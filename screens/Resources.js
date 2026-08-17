import { StyleSheet, Text, View, ImageBackground, TouchableWithoutFeedback , ScrollView, StatusBar, TouchableOpacity, Alert, Linking } from 'react-native'
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

  const handlePress = async () => {
    try {
      const supported = await Linking.canOpenURL("https://mungruez.github.io/myPortfolioWebsite/idojoprivacy.html");
      if (supported) {
        await Linking.openURL("https://mungruez.github.io/myPortfolioWebsite/idojoprivacy.html");
      } else {
        Alert.alert('Error', 'Unable to open browser. Please check your web browser configuration.');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred while trying to launch the policy page.');
    }
  };
  
  const navKSound = () => {
    try {
      if(kplayer) {
        kplayer.play();
      }
    } catch (error) {
        Alert.alert("Sound Error","Error playing sound effect");
    }
    
    navigation.navigate("LoginScreen");
  };

  const showEulaModal = () => {
    Alert.alert(
      "Terms of Use & EULA",
      `1. AGE CLASSIFICATION REQUIREMENT: By purchasing, downloading, and using this application, you affirm, represent, and warrant that you are at least 18 years of age. This application targets an adult audience and is strictly restricted from use by individuals under the age of 18.\n\n2. LOCAL STORAGE & DATA USER RESPONSIBILITY: This application operates strictly as a local creation framework tool. All custom moves, fighters, data objects, manifests, and chapters built or imported inside this application are stored exclusively on the user's local device hardware. The developer does not host, stream, view, intercept, or manage user-generated content (UGC) over an external server or cloud database system.\n\n3. CONTENT LIABILITY & IMPORT DISCLAIMER: The user retains 100% individual legal responsibility and liability for all text, files, structural chapters, media assets, and zipped file archives imported into or created within their local application storage space. The developer holds zero liability or responsibility for any user-created, user-imported, or community-shared data structures.\n\n4. TRANSACTIONS AND REFUND POLICY: All financial transactions, application purchases, and licensing rights are executed and managed strictly by the Google Play Billing engine. All refund inquiries, payment processing issues, or transaction updates must comply with and be routed through Google Play's standard consumer terms and conditions.`,
      [{ text: "I Accept and Agree", style: "default" }]
    );
  };

  
  return (
    <ImageBackground style={ styles.imgBackground } resizeMode='stretch' source={require('../assets/greentextbackground.png')}>
      <StatusBar barStyle="light-content"/>
      <SafeAreaView style={{ flex: 1, height: "100%", marginTop:7, backgroundColor: 'transparent',}}>

      <TouchableWithoutFeedback  activeOpacity={1} onLongPress={() => navKSound()} delayLongPress={1200} style={{ marginBottom:19, paddingTop:1, paddingBottom:7, height:76 ,width: '90%',alignSelf: 'center',zIndex: 19,elevation: 19,}}>
        <ImageBackground style={ styles.icon } resizeMode='contain' source={require('../assets/resourcestitle.png')} /> 
      </TouchableWithoutFeedback > 

      <ScrollView style={{ flexDirection:"column", marginTop:5, marginBottom: 1, paddingBottom: 5 }}>
        <View style={{marginTop: 2, borderColor: 'silver', borderWidth: 1, borderRadius: 7, marginBottom: 19}}>
          <TouchableOpacity style={styles.eulaButton} onPress={showEulaModal}>
            <Text style={styles.eulaButtonText}>⚖️ View Terms of Use & EULA (18+)</Text>
          </TouchableOpacity>

<Text style={ styles.title }> Thank you for downloading the iDojo mobile App. We hope you have learned about Self Defense, your support will be put to constructive use as we continue to build a social community. Special thanks to all involved, a lot of time and effort was put into making iDojo. Thank you to the sponsors, people and organizations who made this original App possible. We mention them here with their corporate or organizational affiliation at the time from which this App was created.
  Thanks to: The World Boxing Federation, MMA and UFC for giving us the opportunity to analyse the best fighters of all time and their fighting styles. Most of all be careful when trying out these moves and have fun. 
  Disclaimer: This App does not collect any data from any device, it is excellent with battery consumption and it is memory efficient.    
</Text>
<Text style={ styles.title }>Years of research into accumulating the best video, audio and graphics for Self Defense Moves has made iDojo a masterpiece. All future upgrades will be free as the main goal is to teach Self Defense to those who would use it only when required. Use the volume button(top right) to control sounds, videos can be played in slow motion, Wi-Fi is only needed for the Featured List. iDojo continues to innovate by placing an invisible button in the App that launches a secret password Manager App. It is recommended to clear the App Cache in your phone Settings. Do not clear the App Data or you will loose your Passwords, Moves and Chapters. iDojo promises to be the best Self Defense mobile App by releasing meaningful upgrades in the future:-  In-app video recording and move analysis to allow users to record themselves, performing techniques, and use a video analysis service to provide feedback on their form, timing, and execution to offer personalized coaching tips based on the user's performance. Other future upgrades include:-  A community forum, Challenges and an AI Coach for training and gear.
</Text>

<Text style={ styles.disclaimer }> 🚨 Absolute Privacy & Zero Data Collection</Text>
<Text style={ styles.title }> 🛡️ We believe your personal data belongs to you: This application operates entirely offline and collects absolutely zero user data.</Text>
<Text style={ styles.title }> 👮 No Tracking: We do not track your location, app usage, or personal identity.</Text>
<Text style={ styles.title }> 🔑 No Accounts Required: You do not need to sign up, log in, or link any social media accounts to access the self-defense manuals.</Text>
<Text style={ styles.title }> 🔋 Battery Efficient & Lightweight PerformanceThis app was engineered from the ground up to be ultra-efficient, ensuring it does not drain your battery or waste your phone's resources.</Text>
<Text style={ styles.title }> 📱 Zero Background Activity: The app stops completely when you close it. It does not run background processes or stealthily drain power.</Text> 
<Text style={ styles.title }> 🤸 Optimized Image Loading: Our cartoonized manuals use highly compressed, hardware-accelerated vector rendering. This means gorgeous graphics that consume virtually no battery while you read.</Text>
<Text style={ styles.title }> 💾 Memory & Storage Optimized: You won't have to delete other apps to make room for this one.</Text>
<Text style={ styles.title }> 💻 Tiny Storage Footprint: All videos, historical steps and illustrations have been compressed and optimized into a remarkably small file size.</Text>
<Text style={ styles.title }> 🤺 Smart Ram Management: The thumbnail grid and manual screens use active memory recycling. It frees up RAM instantly as you scroll, ensuring zero lag, zero memory leaks, and absolutely no impact on your phone's speed.</Text>

<Text style={ styles.disclaimer }>Historical Context & Intellectual Property Disclaimer:</Text>
<Text style={ styles.title }> This application features modernized illustrations and text instructions adapted from the historical martial arts text, The Secrets of Jujitsu: A Complete Course in Self Defense (1920) by Captain Allan Corstorphin Smith. The original 1920 source material is firmly in the public domain globally. All cartoonized illustrations, redesigned user interfaces, and rewritten modern English step-by-step texts featured within this application are original derivative works and are the exclusive intellectual property of DojoSoft/ Zaakir Mungrue © 2026. Unauthorized duplication or distribution of these specific digital assets is prohibited.</Text>

<Text style={ styles.disclaimer }> Physical Liability & Safety Waiver</Text>
<Text style={ styles.title }> The techniques displayed in this application are for historical, archival, and educational purposes only. Martial arts, Jiu-Jitsu, and physical self-defense maneuvers carry an inherent risk of severe physical injury, permanent disability, or death.</Text> 
<Text style={ styles.title }> By using this application, you acknowledge and agree that:</Text>
<Text style={ styles.title }> 🥷 You will not attempt any technique without first consulting a licensed medical professional and a certified martial arts instructor.</Text>
<Text style={ styles.title }> 🥷 The creators, developers, and publishers of this application are not responsible or liable for any injury, accident, harm, or legal consequence resulting from the misuse, practice, or application of the information contained herein.</Text>
<Text style={ styles.title }> 🥷 You practice these movements entirely at your own risk and discretion.</Text>

<Text style={ styles.movesList }>Moves List:</Text>
<Text style={ styles.title }> A list of over eighty videos of Moves with audio and text instructions. Each video was carefully edited to contain a description with an AI Morpheus voice and can be slowed in order to, view the Move in slow motion.</Text>
<Text style={ styles.manuals }>Manuals:</Text>
<Text style={ styles.title }> A list of over 100 Moves for Self Defense training. Each Move has step by step instructions with images to make learning Moves easier.</Text>
<Text style={ styles.addMove }>Add Move:</Text>
<Text style={ styles.title }> Add, Share, Edit, View, Delete and Import your own Self Defense Moves into the iDojo App. You can also share the Move image or images, a single video or a single pdf when viewing a move. Moves can only be shared and imported with the iDojo App, only single videos, images and PDFs can be shared externally and instructions are provided. Only iDojo zip files containing Moves can be imported. Awesome for sharing individual Self Defense stories, albums, events and more. </Text>
<Text style={ styles.chapters }>Chapters:</Text>
<Text style={ styles.title }> Add, Share, Edit, View, Delete and Import your own Chapters to the iDojo App. A Chapter is a collection of videos, audios, images and PDFs in any number and in any order. You can also share an individual Chapter image, a single video or a single pdf when viewing a chapter. Chapters can be shared and imported with the iDojo App and our free WheeShare App. Only single videos, images and PDFs can be shared externally and instructions are provided. Only iDojo zip files containing Chapters can be imported. Chapters are awesome for sharing lessons, courses, albums, events and more.</Text>
<Text style={ styles.fightersList }>Fighters List:</Text>
<Text style={ styles.title }> Building a first time ever, list of the best fighters of all time. One fighter was hand-picked and carefully researched by DojoSoft before being added to this list. DojoSoft only considers real life, fighting styles that are practiced for effective Self Defense. Add, Share, Edit, View, Delete and Import your own Fighters into the list in the iDojo App. Fighters can only be shared and imported with the iDojo App.</Text>
<Text style={ styles.featured }>Featured:</Text>
<Text style={ styles.title }> iDojo's hand-picked list of online videos and shorts for Self Defense, including our Featured Move Of The Day. Whether you are looking for one to one paid training or just a quick watch and learn, then, this iDojo's Featured List has it. Each video must meet certain criteria in order to be considered effective Self Defense Training. Wi-Fi is necessary for this section as Featured videos are copyrighted. Please contact us on social media to have your suggested videos in our Featured List.</Text>
<Text style={ styles.freeyourmind }>Free Your Mind:</Text>
<Text style={ styles.title }> Audio for a healthy mind that will motivate Self Defense learning and intense training. Each Audio is carefully handcrafted to be intellectually, heart touching to enable you to free your mind. When playing audio, click the purple bar in the slider for seeking.</Text>

<TouchableOpacity onPress={handlePress} style={{ paddingVertical: 12, alignItems: 'center', justifyContent: 'center' }} accessibilityRole="link">
  <Text style={{ color: '#007AFF', fontSize: 15, textDecorationLine: 'underline', fontStyle: "italic", fontWeight: '500' }}>View Privacy Policy</Text>
</TouchableOpacity>
    </View>
   </ScrollView>
  </SafeAreaView>
 </ImageBackground>
)}

const styles = StyleSheet.create({
  imgBackground: { marginBottom:"5%",width: '100%', maxHeight: '95%', flex: 1, opacity: 1 },
  title: {fontSize: 15,fontWeight:'medium',color:'white',backgroundColor:'lightgrey',backgroundColor: 'rgba(211, 211, 211, 0.1)',marginLeft: 19,marginRight: 19,marginTop: 7,marginBottom: 12,padding: 5},
  icon: { height: 76, elevation: 3, marginTop:38, textAlign: "center", zIndex:3 },
  invisiblebtn: {background: "transparent",backgroundColor: "transparent",border: "none",width: 43,height: 43,visibility: "hidden",position: "absolute",bottom: 19,right: 19,zIndex:99,elevation:95},
  buttonArea: { flex: 1 },
  addMove: {textDecorationLine: 'underline',textDecorationColor: '#f74646',color:'red',fontSize: 19,fontStyle: "italic",fontWeight:'600',marginLeft: 10},
  movesList: {textDecorationLine: 'underline',textDecorationColor: '#92192d',color:'red',fontSize: 19,fontStyle: "italic",fontWeight:'600',marginLeft: 10},
  fightersList: {textDecorationLine: 'underline',textDecorationColor: '#b8ca12',fontStyle: "italic",color:'yellow',fontSize: 19,fontWeight:'600',marginLeft: 10},
  chapters: {textDecorationLine: 'underline',textDecorationColor: '#948b0b',fontStyle: "italic",color: '#948b0b',fontSize: 19,fontWeight:'700',marginLeft: 10},
  manuals: {textDecorationLine: 'underline',textDecorationColor: '#0b942e',fontStyle: "italic",color:'green',fontSize: 19,fontWeight:'600',marginLeft: 10},
  featured: {textDecorationLine: 'underline',textDecorationColor: 'silver',fontStyle: "italic",fontSize: 19,color:'silver',fontWeight:'600',marginLeft: 10},
  freeyourmind: {textDecorationLine: 'underline',textDecorationColor: '#a30cc9',fontStyle: "italic",fontSize: 19,color:'purple',fontWeight:'600',marginLeft: 10},
  disclaimer: {textDecorationLine: 'underline',textDecorationColor: '#d0f5db',backgroundColor: 'rgba(211, 211, 211, 0.1)',fontStyle: "italic",fontSize: 19,color: '#d0f5db',fontWeight: '700',marginLeft: 10,marginTop: 7,marginBottom: 12,padding: 5},
  eulaButton: {backgroundColor: '#1a331a',borderColor: '#00ff00',borderWidth: 1.5,borderRadius: 8,paddingVertical: 12,paddingHorizontal: 15,marginVertical: 12,alignItems: 'center',shadowColor: '#00ff00',shadowOffset: { width: 0, height: 2 },shadowOpacity: 0.3,shadowRadius: 4,elevation: 4},
  eulaButtonText: {color: '#00ff00',fontWeight: 'bold',fontSize: 14,textTransform: 'uppercase',letterSpacing: 0.5,},
})