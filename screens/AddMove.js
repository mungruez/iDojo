import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, Alert, StyleSheet, ImageBackground } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';

const AddMove = ({ route }) => {
  const navigation = useNavigation();
  const { move, mtype, mstyle, onComplete } = route.params;
  const [title, setTitle] = useState(move?.title || '');
  const [type, setType] = useState(move?.type || mtype || 'select mode');
  const [fstyle, setFStyle] = useState(move?.style || mstyle || 'Self Defense');
  const [vid, setVid] = useState(move?.vid || null);
  const [videoUrl, setVideoUrl] = useState(move?.videoUrl || '');
  const [steps, setSteps] = useState(move?.steps || [{ id: Date.now().toString(), title:'', img: null, desc: '' }]);
  
  const pickMedia = async (index = null) => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: 'All', quality: 1.0 });
    if (!res.canceled) {
      if (type === 'video') {
        setVid(res.assets[0].uri);
      } else {
        const s = [...steps]; 
        s[index].img = res.assets[0].uri; 
        setSteps(s); 
      }
    }
  };

  const save = () => {
    if (!title.trim()) {
      Alert.alert("Required", "Please enter a Move Title.");
      return;
    }

    if (type === "steps") {
      if (steps.some(s => !s.img)) {
        Alert.alert("Missing Image", "Every step must have an image. Check your steps!");
        return;
      }

      if (steps.some(s => !s.desc || !s.desc.trim())) {
        Alert.alert("Missing Description", "Every step must have a description.");
        return;
      }

      const validatedSteps = steps.map((s, i) => ({
        ...s,
        title: s.title.trim() || `Step ${i + 1}`
      }));
      setSteps(validatedSteps);

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
      Thumb: type === 'video' ? (vid || videoUrl) : steps[0].img 
    };

    if (onComplete) {
      onComplete(finalData);
      navigation.goBack();
    } else {
      Alert.alert("Error", "Save callback not found.");
    }
  };

  return (
   <ImageBackground style={ styles.imgBackground } resizeMode='cover' source={require('../assets/addmovebg.jpg')}>
    <ScrollView style={styles.container}>
      <View style={{backgroundColor: 'transparent', marginBottom:30, paddingTop:-10, paddingBottom:20,}}>
        <ImageBackground style={ styles.icon } resizeMode='contain' source={type=='video' && !move ? require('../assets/addmovetitle.png') : type=='video' && move ? require('../assets/editmovetitle.png') : type=='steps' && !move ? require('../assets/addmanualtitle.png') : require('../assets/editmanualtitle.png') } /> 
      </View>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.discardBtn}><Text style={styles.discardText}>CANCEL</Text></TouchableOpacity>

      <Text style={styles.headerTitle}>{move ? "EDIT" : "ADD"} MOVE TO YOUR DOJO</Text>
      <Text style={styles.label}>Move Title</Text>
      <TextInput style={styles.input} placeholder="Move Title" value={title} onChangeText={setTitle} />
      
      <Text style={styles.label}>Fighting Style</Text>
      <TextInput style={styles.input} placeholder="Fighting Style" value={fstyle} onChangeText={setFStyle} />

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
          <TouchableOpacity onPress={() => pickMedia()} style={styles.videoIcon}>
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
              <TextInput style={styles.input} placeholder={`Step ${i+1} Title`} value={s.title} onChangeText={(t)=>{const ns=[...steps];ns[i].title=t;setSteps(ns)}} />
              <TouchableOpacity onPress={() => pickMedia(i)} style={styles.stepImgContainer}>
                {s.img ? <Image source={{ uri: s.img }} style={styles.stepImg} /> : <Text style={styles.plusIcon}>+</Text>}
              </TouchableOpacity>
              <View style={{ flex: 1 }}>
                <TextInput 
                  style={styles.stepInput} 
                  placeholder={`Step ${i+1} description...`}
                  value={s.desc} 
                  onChangeText={(t) => {
                    const ns = [...steps];
                    ns[i].desc = t;
                    setSteps(ns);
                  }} 
                />
                {steps.length > 1 && (
                  <TouchableOpacity onPress={() => setSteps(steps.filter(st => st.id !== s.id))} style={styles.removeStepIcon}>
                    <ImageBackground style={{ flex:1, height:"auto", width:"auto", }} resizeMode='contain' source={require('../assets/removeimgicon.png')}/>
                    <Text style={styles.videoIconText}>✕ REMOVE STEP</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
          <TouchableOpacity style={styles.addStepBtn} onPress={() => setSteps([...steps, { id: Date.now().toString(), title: '',img: null, desc: '' }])}>
            <ImageBackground style={{flex:1, height:"auto", width:"auto",}} resizeMode='contain' source={require('../assets/greenbtnbg.png')}>
              <Image
                resizeMode="contain"
                style={{ flex:1, height:"auto", width:"auto", alignSelf:"center",}}
                source={require('../assets/addstep.png')}
              />
            </ImageBackground>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity style={styles.saveBtn} onPress={() => save()}>
        <ImageBackground style={{flex:1, height:"auto", width:"auto",}} resizeMode='contain' source={require('../assets/greenbtnbg.png')}>
          <Image
            resizeMode="contain"
            style={{ flex:1, height:"auto", width:"auto", alignSelf:"center",}}
            source={require('../assets/save.png')}
          />
        </ImageBackground>
      </TouchableOpacity>
    </ScrollView>
   </ImageBackground>
  );
}

const styles = StyleSheet.create({
  imgBackground: { flex: 1, width: '100%', height: '100%', opacity: .8 },
  icon: { height: 60, width: '90%', alignSelf: 'center' },
  videoIcon: { height: 60, width:60, backgroundColor: 'rgba(235, 30, 30, 0.3)', borderRadius: 10,marginTop: 15,justifyContent: 'center', alignItems: 'center',borderWidth: 1, borderColor: '#f76b82',borderStyle: 'dashed'},
  videoIconText: { color: '#e43c3c', fontWeight: 'bold', fontSize: 12 },
  removeStepIcon: { height: 30, width: 100, marginTop: 5, flexDirection: 'row', alignItems: 'center' },
  plusIcon: { height: 38, width: 38, borderRadius: 9, marginLeft: 5 },
  container: { flex: 1, backgroundColor: 'transparent', paddingBottom: 2 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#5b12a5', marginTop: 40, marginBottom: 10 },
  label: { fontWeight: 'bold', color: '#1c1535', marginTop: 15, fontSize: 13 },
  input: { borderWidth: 1, borderColor: '#9e9797', borderRadius: 8, padding: 12, marginTop: 5, backgroundColor: 'rgba(212, 29, 54, 0.1)', },
  modeToggle: { flexDirection: 'row', marginTop: 20, borderRadius: 25, overflow: 'hidden', borderWidth: 1, borderColor: '#5b12a5' },
  tab: { flex: 1, padding: 12, alignItems: 'center', backgroundColor: '#f3bebe' },
  activeTab: { backgroundColor: '#5b12a5' },
  tabText: { color: '#3e1c5f', fontWeight: 'bold' },
  activeTabText: { color: '#e6c8c8' },
  stepRow: { flexDirection: 'row', marginTop: 20, alignItems: 'center', backgroundColor: 'rgba(93, 231, 167, 0.5)', padding: 10, borderRadius: 10, elevation: 1 },
  stepImg: { flex:1, width: '100%', height: '100%' },
  stepInput: { marginLeft: 10, borderBottomWidth: 1, borderColor: '#0f6131', padding: 5, fontSize: 14 },
  removeText: { color: 'red', fontSize: 10, marginLeft: 10, marginTop: 5, fontWeight: 'bold' },
  mediaBtn: { backgroundColor: '#f0eaff', padding: 20, borderRadius: 10, marginTop: 15, alignItems: 'center', borderStyle: 'dashed', borderWidth: 1, borderColor: '#5b12a5' },
  mediaBtnText: { color: '#5b12a5', fontWeight: 'bold' },
  addStepBtn: { padding: 15, alignItems: 'center', marginTop: 5,height: 40, width: 40, },
  addStepText: { color: '#12a568', fontWeight: 'bold' },
  saveBtn: { backgroundColor: 'transparent', width:"27%", height:95, padding: 18, borderRadius: 30, marginTop: 30, alignItems: 'center', elevation: 3 },
  saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  discardBtn: { marginTop: 20, padding: 0, height: 57, width: 40, alignSelf: 'right', borderRadius: 20, backgroundColor: 'rgba(204, 33, 56, 0.1)', },
  discardText: { textAlign: 'center', color: '#d40a25', fontWeight: 'bold' },
  stepImgContainer: { width: 75, height: 75, backgroundColor: 'rgba(255, 255, 255, 0.1)', justifyContent: 'center', alignItems: 'center', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.3)', overflow: 'hidden',marginRight: 12},
});

export default AddMove;