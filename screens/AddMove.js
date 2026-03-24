import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, Alert, StyleSheet, ImageBackground } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';

const AddMove = ({ route }) => {
  const navigation = useNavigation();
  const { move, mtype, mstyle } = route.params;
  const [title, setTitle] = useState(move?.title || '');
  const [type, setType] = useState(move?.type || mtype || 'select mode');
  const [fstyle, setFStyle] = useState(move?.style || mstyle || 'Self Defense');
  const [vid, setVid] = useState(move?.vid || null);
  const [videoUrl, setVideoUrl] = useState(move?.videoUrl || '');
  const [steps, setSteps] = useState(move?.steps || [{ id: Date.now().toString(), title:'', img: null, desc: '' }]);
  
  const pickMedia = async (index = null) => {
    const isVideo = (type === 'video' && index === null);
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: isVideo 
        ? ImagePicker.MediaTypeOptions.Videos 
        : ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1.0,
    });

    if (!res.canceled) {
      const pickedUri = res.assets[0].uri;

      if (isVideo) {
        setVid(pickedUri);
      } else {
        const s = [...steps];
        s[index].img = pickedUri;
        setSteps(s);
      }
    }
  };

  const save = () => {
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

    } else if (type === "video") {
      if (!vid && !videoUrl.trim()) {
        Alert.alert("Required", "Please upload a video or provide a link.");
        return;
      }
    }

    const finalData = {
      id: move?.id || Date.now().toString(),
      title: title.trim(),
      type,
      style: fstyle.trim() || 'Self-Defence',
      steps: type === 'steps' ? validatedSteps : [],
      vid: type === 'video' ? vid : null,
      videoUrl: type === 'video' ? videoUrl : '',
      Thumb: type === 'video' ? (vid || videoUrl) : validatedSteps[0]?.img 
    };

    DeviceEventEmitter.emit('SAVE_MOVE_EVENT', finalData);
    navigation.pop();
  };


  return (
   <ImageBackground style={ styles.imgBackground } resizeMode='cover' source={require('../assets/addmovebg.jpg')}>
    <View style={{backgroundColor: 'transparent', marginBottom:12, paddingLeft:5, paddingRight:5, marginTop:25}}>
      <ImageBackground style={ styles.icon } resizeMode='contain' source={type=='video' && !move ? require('../assets/addmovetitle.png') : type=='video' && move ? require('../assets/editmovetitle.png') : type=='steps' && !move ? require('../assets/addmanualtitle.png') : require('../assets/editmanualtitle.png') } /> 
    </View>
    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.discardBtn}>
      <ImageBackground style={{ alignSelf:'center', height:70, width:"100%", }} resizeMode='contain' source={require('../assets/discardicon.png')}/>
      <Text style={styles.discardText}>CANCEL</Text>
    </TouchableOpacity>

    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
      <Text style={styles.headerTitle}>{move ? "EDIT" : "ADD"} MOVE TO YOUR DOJO</Text>
      <Text style={styles.label}>Move Title</Text>
      <TextInput style={type ==='video' ? styles.input : styles.stepInput} placeholder="Enter ove Title" value={title} onChangeText={setTitle} />
      
      <Text style={styles.label}>Fighting Style</Text>
      <TextInput style={type ==='video' ? styles.input : styles.stepInput} placeholder="Enter Fighting Style" value={fstyle} onChangeText={setFStyle} />

      {!move && type !== 'video' && type!=='steps' && ( 
        <View style={styles.modeToggle}>
          <TouchableOpacity onPress={() => setType('video')} style={[styles.tab, type === 'video' && styles.activeTab]}>
            <Text style={[styles.tabText, type === 'video' && styles.activeTabText]}>VIDEO MOVE</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setType('steps')} style={[styles.tab, type === 'steps' && styles.activeTab]}>
            <Text style={[styles.tabText, type === 'steps' && styles.activeTabText]}>IMAGE STEPS MOVE</Text>
          </TouchableOpacity>
        </View>
      )}

      {type === 'video' ? (
        <View>
          <TextInput placeholder="Video Link" value={videoUrl} onChangeText={setVideoUrl} style={styles.input} />
          <TouchableOpacity onPress={() => pickMedia()} style={vid || videoUrl ? styles.videoIconUploaded : styles.videoIcon}>
            { vid || videoUrl ? 
              ( <ImageBackground style={{ alignSelf:'center', height:50, width:50, }} resizeMode='contain' source={require('../assets/fileuploadedicon.png')}/> )
              : ( <Text style={styles.videoIconText}>UPLOAD MP4 FILE</Text> ) 
            }
          </TouchableOpacity>
        </View>
      ) : (
        <View style={{ marginTop: 10 }}>
          {steps.map((s, i) => (
            <View key={s.id} style={styles.stepRow}>
              <Text style={styles.label}>Step Title</Text>
              <TextInput style={styles.stepInput} placeholder={`Enter Step ${i+1} title`} value={s.title} onChangeText={(t)=>{const ns=[...steps];ns[i].title=t;setSteps(ns)}} />
              
              <Text style={styles.label}>Step Image</Text>
              <TouchableOpacity onPress={() => pickMedia(i)} style={styles.stepImgContainer}>
                {s.img ? <Image source={{ uri: s.img }} style={styles.stepImg} /> : <Text style={styles.plusIconText}>+ image</Text>}
              </TouchableOpacity>

              <View style={{ width: '100%', marginTop: 12 }}>
                <Text style={styles.label}>Step Description</Text>
                <TextInput 
                  style={styles.stepInput} 
                  multiline={true}
                  placeholder={`Enter Step ${i+1} description...`}
                  value={s.desc} 
                  onChangeText={(t) => {
                    const ns = [...steps];
                    ns[i].desc = t;
                    setSteps(ns);
                  }} 
                />
                {steps.length > 1 && (
                  <TouchableOpacity onPress={() => setSteps(steps.filter(st => st.id !== s.id))} style={styles.removeStepIcon}>
                    <ImageBackground style={{ height:91, width:"100%", }} resizeMode='contain' source={require('../assets/removeimgicon.png')}/>
                    <Text style={styles.removeText}>✕ REMOVE STEP</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
          <TouchableOpacity style={styles.addStepBtn} onPress={() => setSteps([...steps, { id: Date.now().toString(), title: '',img: null, desc: '' }])}>
            <ImageBackground style={{width: '100%', height: 43, justifyContent: 'center'}} resizeMode='contain' source={require('../assets/greenbtnbg.png')}>
              <Image
                resizeMode="contain"
                style={{ height:34, width: 152, alignSelf:"center",}}
                source={require('../assets/addstep.png')}
              />
            </ImageBackground>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity style={styles.saveBtn} onPress={() => save()}>
        <ImageBackground style={{ height:43, width:"100%",justifyContent: 'center'}} resizeMode='contain' source={type==='steps' ? require('../assets/greenbtnbg.png') : require('../assets/redbtnbg.png')}>
          <Image
            resizeMode="contain"
            style={{height:34, width:161, alignSelf:"center",}}
            source={require('../assets/save.png')}
          />
        </ImageBackground>
      </TouchableOpacity>
    </ScrollView>
   </ImageBackground>
  );
}

const styles = StyleSheet.create({
  imgBackground: {  ...StyleSheet.absoluteFillObject, opacity: .7 },
  icon: { height: 57, width: '90%', alignSelf: 'center' },
  videoIcon: { height: 76, width:76, backgroundColor: 'rgba(212, 29, 54, 0.1)', borderRadius: 10,marginTop: 5,justifyContent: 'center', alignItems: 'center',borderWidth: 1, borderColor: '#f76b82',borderStyle: 'dashed'},
  videoIconUploaded: { height: 76, width:76, backgroundColor: 'rgba(72, 243, 163, 0.4)', borderRadius: 10,marginTop: 5,justifyContent: 'center', alignItems: 'center',borderWidth: 1, borderColor: '#f76b82',borderStyle: 'dashed'},
  videoIconText: { color: '#420105', fontWeight: 'bold', fontSize: 12 },
  plusIcon: { height: 38, width: 38, borderRadius: 9, marginLeft: 5 },
  plusIconText: { color: '#420105', fontWeight: 'bold', fontSize: 10 },
  container: { flex: 1, backgroundColor: 'transparent', },
  headerTitle: { fontSize: 19, fontWeight: 'bold', color: '#420105', marginTop:7, marginBottom: 15, marginLeft: 19, backgroundColor: 'rgba(212, 29, 54, 0.1)', textDecorationLine: 'underline', textDecorationColor: '#420105', textDecorationStyle: 'solid',},
  label: { fontWeight: 'bold', color: '#420105', marginTop: 7, fontSize: 13, marginLeft:12 },
  input: { borderWidth: 1, borderColor: '#990808', borderRadius: 8, padding: 8, marginTop: 7, backgroundColor: 'rgba(212, 29, 54, 0.1)', },
  modeToggle: { flexDirection: 'row', marginTop: 7, borderRadius: 25, overflow: 'hidden', borderWidth: 1, borderColor: '#5b12a5' },
  tab: { flex: 1, padding: 12, alignItems: 'center', backgroundColor: '#f3bebe' },
  activeTab: { backgroundColor: '#5b12a5' },
  tabText: { color: '#3e1c5f', fontWeight: 'bold' },
  activeTabText: { color: '#e6c8c8' },
  stepRow: { flexDirection: 'column', marginTop: 12, alignItems: 'center', backgroundColor: 'transparent', padding: 10, borderRadius: 10, elevation: 1 },
  stepImg: { flex:1, width: '100%', height: '100%' },
  stepInput: { borderWidth: 1, borderColor: '#083a1d', padding: 8, backgroundColor: 'rgba(93, 231, 167, 0.5)', borderRadius: 8,},
  removeText: { color: '#d40a25', fontSize: 10, textAlign:'center', marginTop:3, fontWeight: 'bold', height: 19, width: '100%' },
  removeStepIcon:{alignItems: 'center', justifyContent: 'center', marginTop:5, height:114, width:95, flexDirection: 'column', backgroundColor: 'rgba(255, 0, 0, 0.1)', borderRadius: 20, borderWidth: 1, borderColor: '#ff4d4d',},
  mediaBtn: { backgroundColor: '#f0eaff', borderRadius: 10, marginTop: 15, alignItems: 'center', borderStyle: 'dashed', borderWidth: 1, borderColor: '#5b12a5' },
  mediaBtnText: { color: '#5b12a5', fontWeight: 'bold' },
  addStepBtn: {marginTop:5, height:45 ,width: 170, alignSelf:'center', alignItems: 'center',justifyContent:'center'},
  addStepText: { color: '#0b5737', fontWeight: 'bold' },
  saveBtn: { backgroundColor:'transparent', width:190, height:50, borderRadius: 12, marginTop:19,alignSelf:'center',alignItems: 'center', justifyContent:'center', },
  saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  discardBtn: { marginBottom: 7, height: 95, width: 83, borderRadius: 12, backgroundColor: 'rgba(204, 33, 56, 0.1)', justifyContent: 'center', alignItems: 'center'},
  discardText: { textAlign: 'center', color: '#d40a25', fontWeight: 'bold', fontSize:10, marginTop: 3, height: 19, width: '100%' },
  stepImgContainer: { width: 75, height: 75, backgroundColor: 'rgba(93, 231, 167, 0.5)', justifyContent: 'center', alignItems: 'center', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.3)', overflow: 'hidden',},
});

export default AddMove;