import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, Alert, StyleSheet, ImageBackground, DeviceEventEmitter, StatusBar, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';

const AddMove = ({ route }) => {
  const navigation = useNavigation();
  const { move, mtype, mstyle } = route.params;
  const [title, setTitle] = useState(move?.title || "");
  const [type, setType] = useState(move?.type || mtype || "select mode");
  const [fstyle, setFStyle] = useState(move?.style || mstyle || "Self Defense");
  const [vid, setVid] = useState(move?.vid || null);
  const [desc, setDesc] = useState(move?.desc || "");
  const [videoUrl, setVideoUrl] = useState(move?.videoUrl || "");
  const [steps, setSteps] = useState(move?.steps || [{ id: Date.now().toString(), title:"", img: null, desc: "" }]);
  
  const pickMedia = async (index = null) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Gallery access is needed to add moves!");
      return;
    }
    
    const isVideo = (type === "video" && index === null);
    const mediaType = isVideo ? 'videos' : 'images';
    try {

      if(type === "pdf") {
        const result = await DocumentPicker.getDocumentAsync({
          type: 'application/pdf',
        });
        if (!result.canceled && result.assets && result.assets.length > 0) setVid(result.assets[0].uri);

      } else {
        const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: [mediaType],
          allowsEditing: false,
          quality: 1.0,
        });

        if (!res.canceled && res.assets && res.assets.length > 0) {
          const pickedUri = res.assets[0].uri; 
          if (isVideo) {
            setVid(pickedUri);
          } else {
            const s = [...steps];
            s[index].img = pickedUri;
            setSteps(s);
          }
        }
      }
    } catch (err) {
      Alert.alert("Picker Error", "Could not open gallery.");
    }
  };


  const save = async () => {
    let validatedSteps = []; 
    if (!title.trim()) {
      Alert.alert("Required", "Please enter a Move Title.");
      return;
    }

    if (type === "steps") {
      if (steps.some(s => !s.img)) {
        Alert.alert("Missing Image", "Every step must have an image!");
        return;
      }
      if (steps.some(s => !s.desc || !s.desc.trim())) {
        Alert.alert("Missing Description", "Every step must have a description.");
        return;
      }

      validatedSteps = steps.map((s, i) => ({
        ...s,
        title: s.title.trim() || `Step ${i + 1}`
      }));

    } else if (type === "video" || type === "pdf") {
      if (!vid && !videoUrl.trim()) {
        if(type === "video") Alert.alert("Required", "Please upload a video or provide a link.");
        if(type === "pdf") Alert.alert("Required", "Please upload a pdf or provide a link.");
        return;
      }
      if(!desc) {
        Alert.alert("Required", "Please provide a description.");
        return;
      }
    }

    try {
      const moveId = move?.id || Date.now().toString();
      const permanentDirUri = `${FileSystem.documentDirectory}moves/${moveId}/`;
      const videoChanged = move && (type === "video" || type === "pdf") && vid && vid !== move?.vid;
      const stepsChanged = move && type === 'steps' && steps.some(s => s.img && !s.img.includes('/moves/'));
      if (videoChanged || stepsChanged) {
        await FileSystem.deleteAsync(permanentDirUri, { idempotent: true });
      }

      await FileSystem.makeDirectoryAsync(permanentDirUri, { intermediates: true });
      const ensurePermanent = async (uri, fileName) => {
        if (!uri || !uri.startsWith('file://') || uri.includes('/moves/')) return uri;
        const destUri = `${permanentDirUri}${fileName}`;
        try {
          await FileSystem.copyAsync({ from: uri, to: destUri });
          return destUri;
        } catch (e) {
          Alert.alert("Copy Failed", `File: ${fileName}\nError: ${e.message}`);
          return uri;
        }
      };

      let finalVid = vid; 
      let finalSteps = [...steps];
      if ((type === "video" || type === "pdf") && vid) {
        finalVid = await ensurePermanent(vid, `video_${Date.now()}.mp4`);
      }
      if (type === 'steps') {
        finalSteps = await Promise.all(steps.map(async (s, i) => ({
          ...s,
          title: s.title.trim() || `Step ${i + 1}`,
          img: await ensurePermanent(s.img, `step_${i}_${Date.now()}.jpg`)
        })));
      }

      const finalData = {
        id: moveId,
        title: title.trim(),
        type,
        style: fstyle.trim() || "Self-Defence",
        steps: type === "steps" ? finalSteps : [],
        vid: type === "video" || type === "pdf" ? finalVid : null,
        videoUrl: type === "video" || type === "pdf" ? videoUrl : '',
        thumb: type === "video" || type === "pdf" ? (finalVid || videoUrl) : (finalSteps[0]?.img || null),
        desc: desc 
      };

      DeviceEventEmitter.emit('SAVE_MOVE_EVENT', finalData);
      navigation.pop();

    } catch (err) {
      Alert.alert("Save Error", err.message || "An unknown error occurred.");
    }
  };


  return (
   <ImageBackground style={ styles.imgBackground } imageStyle={{ opacity: 0.7 }} resizeMode='cover' source={require('../assets/addmovebg.jpg')}>
    <StatusBar barStyle="light-content" />
    <KeyboardAvoidingView 
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
    <View style={{backgroundColor: 'transparent', marginBottom:12, paddingLeft:5, paddingRight:5, marginTop:25, opacity : 1}}>
      <ImageBackground style={ styles.icon } resizeMode='contain' source={type=='video' && !move ? require('../assets/addmovetitle.png') : type=='video' && move ? require('../assets/editmovetitle.png') : type=='steps' && !move ? require('../assets/addmanualtitle.png') : type=='steps' && move ? require('../assets/editmanualtitle.png') : type=="pdf" && move ? require('../assets/editpdfmovetitle.png') : require('../assets/addpdfmovetitle.png') } /> 
    </View>
    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.discardBtn}>
      <ImageBackground style={{ alignSelf:'center', height:67, width:"100%", opacity: 1}} imageStyle={{ opacity: 1 }} resizeMode='contain' source={require('../assets/discardicon.png')}/>
      <Text style={styles.discardText}>CANCEL</Text>
    </TouchableOpacity>

    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
      <Text style={ type === "steps" ? styles.headerTitle : type === "video" ? styles.headerTitleVideo : styles.headerTitlePdf }>{move ? "EDIT" : "ADD"} MOVE TO YOUR DOJO</Text>
      <Text style={styles.label}>Move Title</Text>
      <TextInput style={type ==='video' ? styles.input : type === "pdf" ? styles.pdfinput : styles.stepInput} underlineColorAndroid="transparent" placeholder="Enter Move Title" value={title} onChangeText={setTitle} />
      
      <Text style={styles.label}>Moves List Title/Styles</Text>
      <TextInput style={type ==='video' ? styles.input : type === "pdf" ? styles.pdfinput : styles.stepInput} underlineColorAndroid="transparent" placeholder="Enter Fighting Style" value={fstyle} onChangeText={setFStyle} />

      { !move && type !== "video" && type !== "steps" && type !== "pdf" && (
        <View style={styles.modeToggle}>
          <TouchableOpacity onPress={() => setType('video')} style={[styles.tab, type === 'video' && styles.activeTab]}>
            <Text style={[styles.tabText, type === 'video' && styles.activeTabText]}>VIDEO MOVE</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setType('steps')} style={[styles.tab, type === 'steps' && styles.activeTab]}>
            <Text style={[styles.tabText, type === 'steps' && styles.activeTabText]}>IMAGE STEPS MOVE</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setType('pdf')} style={[styles.tab, type === 'pdf' && styles.activeTab]}>
            <Text style={[styles.tabText, type === 'pdf' && styles.activeTabText]}>PDF MOVE</Text>
          </TouchableOpacity>
        </View>
      ) }

      { type === "video" ? (
        <View>
          <Text style={styles.label}>Move Video URL</Text>
          {!vid && <TextInput placeholder="Enter Video Link" value={videoUrl} onChangeText={setVideoUrl} style={styles.input} />}
          <TouchableOpacity onPress={() => pickMedia()} style={vid || videoUrl ? styles.videoIconUploaded : styles.videoIcon}>
            { vid || videoUrl ? 
              ( <ImageBackground style={{ alignSelf:'center', height: 57, width: 57, }} resizeMode='contain' source={require('../assets/fileuploadedicon.png')}/> )
              : ( <ImageBackground style={{ alignSelf: 'center', height: 67, width: 76, }} resizeMode='contain' source={require('../assets/uploadvideobg.png')} />) 
            }
          </TouchableOpacity>
          <Text style={styles.label}>Move Description</Text>
          <TextInput style={styles.input} multiline={true} textAlignVertical="top" underlineColorAndroid="transparent" placeholder="Enter Description" value={desc} onChangeText={setDesc} />
        </View>
        ) : type ===  "pdf" ? (
          <View>
            <Text style={styles.label}>PDF URL of Move</Text>
            {!vid && <TextInput placeholder="Enter PDF Link" value={videoUrl} onChangeText={setVideoUrl} style={styles.pdfinput} />}
            <TouchableOpacity onPress={() => pickMedia()} style={vid || videoUrl ? styles.videoIconUploaded : styles.pdfIcon}>
              { vid || videoUrl ? 
                ( <ImageBackground style={{ alignSelf: 'center', height: 57, width: 57, }} resizeMode='contain' source={require('../assets/fileuploadedicon.png')}/> )
                : ( <ImageBackground style={{ alignSelf: 'center', height: 67, width: 76, }} resizeMode='contain' source={require('../assets/uploadpdfbg.png')} /> ) 
              }
            </TouchableOpacity>
            <Text style={styles.label}>Move Description</Text>
            <TextInput style={styles.pdfinput} multiline={true} textAlignVertical="top" underlineColorAndroid="transparent" placeholder="Enter Description" value={desc} onChangeText={setDesc} />
          </View>
        ) : (
        <View style={{ marginTop: 3 }}>
          {steps.map((s, i) => (
            <View key={s.id} style={styles.stepRow}>
              <Text style={styles.label}>Step Title</Text>
              <TextInput style={styles.stepInput} underlineColorAndroid="transparent" placeholder={`Enter Step ${i+1} Title`} value={s.title} onChangeText={(t)=>{const ns=[...steps];ns[i].title=t;setSteps(ns)}} />
              <Text style={styles.label}>Step Image</Text>
              <TouchableOpacity onPress={() => pickMedia(i)} style={styles.stepImgContainer}>
                {s.img ? <Image source={{ uri: s.img }} style={styles.stepImg} /> : <ImageBackground style={{ alignSelf: 'center', height: 77, width: 77, }} resizeMode='contain' source={require('../assets/uploadimagebg.png')} />}
              </TouchableOpacity>

              <View style={{ width: '100%', marginTop: 12 }}>
                <Text style={styles.label}>Step Description</Text>
                <TextInput 
                  style={styles.stepInput} 
                  multiline={true} 
                  textAlignVertical="top"
                  underlineColorAndroid="transparent"
                  placeholder={`Enter Step ${i+1} Description...`} value={s.desc} 
                  onChangeText={(t) => { const ns = [...steps]; ns[i].desc = t; setSteps(ns); }} 
                />
                {steps.length > 1 && (
                  <TouchableOpacity onPress={() => setSteps(steps.filter(st => st.id !== s.id))} style={styles.removeStepIcon}>
                    <ImageBackground style={{ height:91, width:"100%", }} imageStyle={{ opacity: 1 }} resizeMode='contain' source={require('../assets/removeimgicon.png')}/>
                    <Text style={styles.removeText}>✕ REMOVE STEP</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
          <TouchableOpacity style={styles.addStepBtn} onPress={() => setSteps([...steps, { id: Date.now().toString(), title: '',img: null, desc: '' }])}>
            <ImageBackground style={{width: '100%', height: 38, justifyContent: 'center',}} imageStyle={{ opacity: 1 }} resizeMode='contain' source={require('../assets/addstepbtn.png')} />
          </TouchableOpacity>
        </View>
        
      )}

      <TouchableOpacity style={styles.saveBtn} onPress={() => save()}>
        { type === "pdf" ? ( <ImageBackground style={{ height: 43, width: "100%",justifyContent: 'center', opacity: 1, borderRadius: 12 }} imageStyle={{ opacity: 1, borderRadius:12 }} resizeMode='stretch' source={require('../assets/bluebtnbg.png')}>
          <Image
            resizeMode = "contain"
            style={{height: 38, width: 172, alignSelf:"center", opacity: 1}}
            source={require('../assets/save.png')}
          />
        </ImageBackground> ) 
        : type === "video" ? ( <ImageBackground style={{ height: 57, width: "100%",justifyContent: 'center', opacity: 1, borderRadius: 12 }} imageStyle={{ opacity: 1, borderRadius:12 }} resizeMode='contain' source={require('../assets/savevideobtn.png')} />
         ) 
        : ( <ImageBackground style={{ height:47, width:"100%",justifyContent: 'center', opacity: 1, borderRadius: 12 }} imageStyle={{ opacity: 1, borderRadius:12 }} resizeMode='contain' source={require('../assets/savemanualbtn.png')} />
         ) }
      </TouchableOpacity>
    </ScrollView>
   </KeyboardAvoidingView>
   </ImageBackground>
  );
}

const styles = StyleSheet.create({
  imgBackground: {  ...StyleSheet.absoluteFillObject, flex: 1, },
  icon: { height: 57, width: '90%', alignSelf: 'center' },
  videoIcon: { height: 76, width: 76, marginLeft: 12, backgroundColor: 'rgba(212, 29, 54, 0.1)', borderRadius: 2, marginTop: 5, justifyContent: 'center', alignItems: 'center'},
  videoIconUploaded: { height: 76, width: 76, marginLeft: 12, backgroundColor: 'rgba(72, 243, 163, 0.4)', borderRadius: 10,marginTop: 5,justifyContent: 'center', alignItems: 'center',borderWidth: 1, borderColor: '#f84444',borderStyle: 'dashed'},
  pdfIcon: { height: 76, width:76, backgroundColor: 'hsla(204, 77%, 48%, 0.17)', borderRadius: 2, marginTop: 5, justifyContent: 'center', alignItems: 'center', marginLeft: 12},
  pdfIconText: { color: '#020142', fontWeight: 'bold', fontSize: 12, marginLeft: 4 },
  videoIconText: { color: '#420105', fontWeight: 'bold', fontSize: 12 },
  plusIcon: { height: 38, width: 38, borderRadius: 9, marginLeft: 5 },
  plusIconText: { color: '#420105', fontWeight: 'bold', fontSize: 10 },
  container: { flex: 1, backgroundColor: 'transparent', },
  headerTitle: { fontSize: 17, fontWeight: 'bold', color: '#023010', marginTop:7, marginBottom: 3, marginLeft: 43, backgroundColor: 'rgba(61, 170, 91, 0.2)', textDecorationLine: 'underline', textDecorationColor: '#014211', textDecorationStyle: 'solid', borderRadius: 12, alignSelf: "flex-start", paddingHorizontal: 4, paddingVertical: 1,},
  headerTitleVideo: { fontSize: 17, fontWeight: 'bold', color: '#420105', marginTop:7, marginBottom: 3, marginLeft: 43, backgroundColor: 'rgba(167, 38, 57, 0.2)', textDecorationLine: 'underline', textDecorationColor: '#420105', textDecorationStyle: 'solid', borderRadius: 12, alignSelf: "flex-start", paddingHorizontal: 4, paddingVertical: 1,},
  headerTitlePdf: { fontSize: 17, fontWeight: 'bold', color: '#010242', marginTop:7, marginBottom: 3, marginLeft: 43, backgroundColor: 'rgba(45, 43, 158, 0.2)', textDecorationLine: 'underline', textDecorationColor: '#020142', textDecorationStyle: 'solid', borderRadius: 12, alignSelf: "flex-start", paddingHorizontal: 4, paddingVertical: 1,},
  label: { fontWeight: 'bold', color: '#420105', marginTop: 12, fontSize: 13, marginLeft:12 },
  input: { borderWidth: 1, borderColor: '#990808', borderRadius: 12, padding: 8, marginTop: 7, backgroundColor: 'rgba(212, 29, 54, 0.1)', opacity: 1, fontWeight: "semibold" },
  pdfinput: { borderWidth: 1, borderColor: '#436fff', borderRadius: 12, padding: 8, marginTop: 7, backgroundColor: 'rgba(28, 142, 218, 0.17)', opacity: 1, fontWeight: "semibold" },
  modeToggle: { flexDirection: 'row', marginTop: 7, borderRadius: 25, overflow: 'hidden', borderWidth: 1, borderColor: '#5b12a5' },
  tab: { flex: 1, padding: 12, alignItems: 'center', backgroundColor: '#f3bebe' },
  activeTab: { backgroundColor: '#5b12a5' },
  tabText: { color: '#3e1c5f', fontWeight: 'bold' },
  activeTabText: { color: '#e6c8c8' },
  stepRow: { flexDirection: 'column', marginTop: 7, alignItems: 'center', backgroundColor: 'transparent', padding: 10, borderRadius: 10, elevation: 1 },
  stepImg: { width: '100%', height: '100%' },
  stepInput: { borderWidth: 1, borderColor: '#083a1d', padding: 8, marginTop: 7, backgroundColor: 'rgba(80, 214, 145, 0.41)', borderRadius: 12, opacity: 1, fontWeight: "semibold"},
  removeText: { color: '#d40a25', fontSize: 10, textAlign:'center', marginTop:1, fontWeight: 'bold', height: 17, width: '100%' },
  removeStepIcon:{alignItems: 'center', justifyContent: 'center', marginTop:5, height:107, width:95, flexDirection: 'column', backgroundColor: 'rgba(255, 0, 0, 0.1)', borderRadius: 20, borderWidth: 1, borderColor: '#ff4d4d', opacity: 1},
  mediaBtn: { backgroundColor: '#f0eaff', borderRadius: 10, marginTop: 15, alignItems: 'center', borderStyle: 'dashed', borderWidth: 1, borderColor: '#5b12a5' },
  mediaBtnText: { color: '#5b12a5', fontWeight: 'bold' },
  addStepBtn: {marginTop: 5, height: 41 ,width: 114, alignSelf:'center', alignItems: 'center',justifyContent:'center'},
  saveBtn: { width: 125, height: 97, borderRadius: 15, marginTop: 7, alignSelf:'center', alignItems: 'center', justifyContent:'center', },
  discardBtn: { marginBottom: 9, marginLeft: 12, height: 70, width: 67, borderRadius: 10, justifyContent: 'center', alignItems: 'center', opacity: 1},
  discardText: { textAlign: 'center', color: '#ac162a', fontWeight: 'bold', fontSize: 10, marginTop: 1, height: 15, width: '100%' },
  stepImgContainer: { width: 77, height: 77, justifyContent: 'center', alignItems: 'center', borderRadius: 12, borderWidth: 0, opacity: 1},
});

export default AddMove;