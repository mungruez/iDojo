import { View, Text, TouchableOpacity, FlatList, Alert, StyleSheet, ActivityIndicator, ImageBackground, Image, Dimensions, DeviceEventEmitter,PermissionsAndroid, Platform } from 'react-native';
import { useNavigation, useFocusEffect  } from '@react-navigation/native'
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNetInfo } from "@react-native-community/netinfo"; 
import { File, Directory, Paths } from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import React, { useState, useCallback, useEffect  } from 'react';
import { zip, unzip } from 'react-native-zip-archive';
import * as Sharing from 'expo-sharing';

const { width } = Dimensions.get('window');
//Code for parent screen whith one list, A list all moves grouped first by move.type=(video or steps) then grouped by move.style(user entered or Self-Defence by default) 
//depending on which group (a specific moves style button or all styles button) is clicked on navigate and show list of moves filtered by type and style clicked on all style button but no all types button 
//this means no screen will show all video and steps moves in one list. So the child MyDojo screen will only have lists with either (1) a type with all styles, OR (2) a type and one style    
//only when rendering moves with all styles from a type MyDojo will need to render a vertical list (for each style) and horizontal list(for each move with same style) in the manager, instead of one vertical list that will be rendered when hmoves=one type and one style. 
// A horizontal divider needed in flatList when type changes to type=='steps',
//use matrix dojo in bg, try use red/blue pills buttons (each style,allstyles) , 
// Added Move title - subtitle add,share,import moves, Edit Move title, My Dojo Move Styles, MyDojo
//Added-> share btn, import btn, plus btn, edit btn, del btn, add step btn, save move btn, info btn 
// added cool fonts, and a prieview for the video(or Thumbnail) and images in the steps, and an import/share many option.    
export default function MyDojoStyles({route}) {
    const [moves, setMoves] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [smoves, setSMoves] = useState([]);
    const navigation = useNavigation();

    const [adding, setAdding] = useState(false);
    const [listmode, setListMode] = useState(false);
    const [prevMode, setPrevMode] = useState('none');
    const [hmoves, setHMoves] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);

    const [ftype, setType] = useState('select move type');
    const [fstyle, setFStyle] = useState('Self Defense');
    const isOffline = useNetInfo().isConnected === false;

    const requestStoragePermission = async () => {
      if (Platform.OS !== 'android') return true;

      try {
        if (Platform.Version >= 33) {
          const granted = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
          ]);
          return (
            granted['android.permission.READ_MEDIA_IMAGES'] === 'granted' &&
            granted['android.permission.READ_MEDIA_VIDEO'] === 'granted'
          );
        } else {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
          );
          return granted === PermissionsAndroid.RESULTS.GRANTED;
        }
      } catch (err) {
        console.warn(err);
        return false;
      }
    };

    const showInstructions = () => {
        Alert.alert(
          "<--iDojo Hidden Password Manager-->",
          "Intructions - How to use the Password Manager: All passwords are encrytped before saving to the phone only the owner can decrypt them for viewing in the App. No data is collected in any way by iDojo App.\n(1) Passwords may be any length and may contain all charcters available on a normal keyboard except slashes (/,\)\n(2) You may store any number of Passwords. Clearing the App Data will delete all your passwords.\n(3) Use the Rest PIN button at the top to reset your PIN\n(4) Use the gold Edit button to edit the password or view it for copy and pasting.\n(5) Click trash icon and then confirm to delete a Password.\n(6) Scroll horizontally left and right to view all your passwords.\n(7) Click the golden vault icon to Close the Password Manager. Thank you for purchasing iDojo the invisible button is intended to inovate and its location is kept secret please enjoy.",
          [
            {
              text: "OK",
              onPress: () => setPasswordNumTemp(passwordNum),
              style: "cancel" 
            }
          ],
          { cancelable: false } 
        );
    };

    const loadMoves = async () => {
      try {
        const file = new File(Paths.document, 'moves.json');
        if (file.exists) {
          const content = await file.text(); 
          const movesList = JSON.parse(content);
          setMoves(movesList);
          parseStyles(movesList);
          setHMoves(getMoves(fstyle, ftype));
        } else {
          setMoves([]);
        }
      } catch (e) {
        Alert.alert("Load failed", "Unable to Load Moves");
      } finally {setLoading(false);}
    };


    const handleSave = async (newData) => { 
      const incomingMoves = Array.isArray(newData) ? newData : [newData];
      let currentList = [...moves];
      incomingMoves.forEach(moveData => {
        const index = currentList.findIndex(m => m.id === moveData.id);
        if (index > -1) {
          currentList[index] = moveData; 
        } else {
          currentList.push(moveData);
        }
      });

      try {
        const file = new File(Paths.document, 'moves.json');
        await file.write(JSON.stringify(currentList)); 
        setMoves(currentList);
        parseStyles(currentList);
        setHMoves(getMoves(fstyle, ftype));
      } catch (e) {
        Alert.alert("Error", "Could not save moves to storage.");
      }
    };


    const myDojoHandleDelete = (idsFromArg = []) => {
      const actualIds = Array.isArray(idsFromArg) && idsFromArg.length > 0 ? idsFromArg : selectedIds;
      const cleanIdsToDelete = actualIds.map(id => String(id).trim());
      if (cleanIdsToDelete.length === 0) return;
      Alert.alert("Delete Moves",`Remove ${cleanIdsToDelete.length} selected move(s)?`,
        [{ text: "Cancel", style: "cancel" },
          {text: "Delete",style: "destructive",onPress: async () => {
            try {
              let updatedListSnapshot = [];
              setMoves(currentMoves => {
                updatedListSnapshot = currentMoves.filter(m => !cleanIdsToDelete.includes(String(m.id)));
                return updatedListSnapshot;
              });
              const file = new File(Paths.document, "moves.json");
              await file.write(JSON.stringify(updatedListSnapshot));
              setHMoves(h => h.filter(m => !cleanIdsToDelete.includes(String(m.id))));
              parseStyles(updatedListSnapshot);
              setHMoves(getMoves(fstyle, ftype));
              setSelectedIds([]);
              setListMode(false);
              } catch (error) {
                console.error("File write error:", error);
              }
          }}
        ]);
    };

    const handleShare = async () => {
      try {
        if (isOffline) return Alert.alert("Offline", "You need an internet connection to share.");
        const hasPermission = await requestStoragePermission();
        if (!hasPermission) return;
        if (selectedIds.length === 0) return;
        let selectedMoves = [];
        
        if (fstyle === "allstyles") {
          hmoves.forEach(group => {
            const found = group.data.filter(m => selectedIds.includes(m.id));
            selectedMoves = [...selectedMoves, ...found];
          });
        } else {
          selectedMoves = hmoves.filter(m => selectedIds.includes(m.id));
        }
        setLoading(true);
        const shareDir = `${FileSystem.documentDirectory}batch_share/`;
        const shareInfo = await FileSystem.getInfoAsync(shareDir);
        if (shareInfo.exists) {
          await FileSystem.deleteAsync(shareDir);
        }
        await FileSystem.makeDirectoryAsync(shareDir, { intermediates: true });
        const processedMoves = await Promise.all(selectedMoves.map(async (move) => {
          let updatedMove = { ...move };
          if (move.type === 'video' && move.vid && move.vid.startsWith('file://')) {
            const fileName = move.vid.split('/').pop();
            const destPath = `${shareDir}${fileName}`;
            await FileSystem.copyAsync({ from: move.vid, to: destPath });
            updatedMove.vid = fileName; 
          }
          if (move.type === 'steps' && move.steps) {
            updatedMove.steps = await Promise.all(move.steps.map(async (step) => {
              if (step.img && step.img.startsWith('file://')) {
                const fileName = step.img.split('/').pop();
                const destPath = `${shareDir}${fileName}`;
                await FileSystem.copyAsync({ from: step.img, to: destPath });
                return { ...step, img: fileName };
              }
              return step;
            }));
          }
          return updatedMove;
        }));
        const dataFilePath = `${shareDir}data.json`;
        await FileSystem.writeAsStringAsync(dataFilePath, JSON.stringify(processedMoves));
        const zipFileName = `Dojo_Batch_${Date.now()}.zip`;
        const zipPath = `${FileSystem.documentDirectory}${zipFileName}`;
        await zip(shareDir, zipPath);
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(zipPath, {
            mimeType: 'application/zip',
            dialogTitle: 'Share your Dojo Moves',
            UTI: 'com.pkware.zip-archive', 
          });
        } else {
          Alert.alert("Error", "Sharing is not available on this device.");
        }
        setSelectedIds([]); 
        await FileSystem.deleteAsync(shareDir).catch(() => {});
        setTimeout(async () => {
          try {
            const zipCheck = await FileSystem.getInfoAsync(zipPath);
            if (zipCheck.exists) await FileSystem.deleteAsync(zipPath);
          } catch (err) { console.log("Post-share cleanup failed", err); }
        }, 15000);

      } catch (e) {
        console.error("Batch share error:", e);
        Alert.alert("Error", "Sharing failed. Please check app storage permissions.");
      } finally {
        setLoading(false);
      }
    };

    const handleImport = async () => {
      try {
        const res = await DocumentPicker.getDocumentAsync({ 
          type: ['application/zip', 'application/x-zip-compressed'], 
          copyToCacheDirectory: true 
        });

        if (res.canceled || !res.assets) return;
        setLoading(true);
        const zipUri = res.assets[0].uri;
        const importId = Date.now().toString();
        const permanentDir = `${Paths.document.uri}/imported_${importId}/`;
        await FileSystem.makeDirectoryAsync(permanentDir, { intermediates: true });
        await unzip(zipUri, permanentDir);
        const dataFilePath = `${permanentDir}data.json`;
        const content = await FileSystem.readAsStringAsync(dataFilePath);
        const importedMoves = JSON.parse(content);
        const finalMoves = importedMoves.map(move => {
          let restored = { ...move, id: Date.now().toString() + Math.random() };

          if (move.type === 'video' && move.vid && !move.vid.includes('://')) {
            restored.vid = `${permanentDir}${move.vid}`;
          }

          if (move.type === 'steps') {
            restored.steps = move.steps.map(step => ({
              ...step,
              img: (step.img && !step.img.includes('://')) 
                  ? `${permanentDir}${step.img}` 
                  : step.img
            }));
          }
          restored.Thumb = restored.type === 'video' ? (restored.vid || restored.videoUrl) : restored.steps[0]?.img;
          return restored;
        });
        handleSave(finalMoves);
        await FileSystem.deleteAsync(dataFilePath).catch(() => {});
        Alert.alert("Success", "Moves imported to your Dojo!");
      } catch (e) {
        console.error("Import error:", e);
        Alert.alert("Error", "Invalid ZIP or import failed.");
      } finally {
        setLoading(false);
      }
    };

    
    const parseStyles = (list) => {
      if (!Array.isArray(list)) {
        alert("Data is not an array, skipping parse.");
        return;
      }
      let videoStyles = [], stepStyles = [];
      let sMoves = [{ id: "v-all", type: "video", style: "allstyles" }];
      let bMoves = [{ id: "s-all", type: "steps", style: "allstyles" }];

      list?.forEach(m => {
        const currentStyle = m.style || "Self-Defence";
        if (m.type === "video" && !videoStyles.includes(currentStyle)) {
          videoStyles.push(currentStyle); 
          sMoves.push({ ...m, style: currentStyle }); 
        } else if (m.type === "steps" && !stepStyles.includes(currentStyle)) {
          stepStyles.push(currentStyle); 
          bMoves.push({ ...m, style: currentStyle });
        }
      });
      if(sMoves.length>1 && bMoves.length > 1) {
        setSMoves([...sMoves, ...bMoves]);
      } else if (sMoves.length>1) {
        setSMoves(sMoves);
      } else if (bMoves.length>1) {
        setSMoves(bMoves);
      } else {
        setSMoves([]);
      }
    };
    
    const parseHMoves = (movesList) => {
      let hMoves = [];
      let stylesSeen = [];
      for (let mNum = 0; mNum < movesList.length; mNum++) {
        const move = movesList[mNum];
        const currentStyle = move.style || "Self-Defence"; 
        let mIndex = stylesSeen.indexOf(currentStyle);

        if (mIndex < 0) {
          stylesSeen.push(currentStyle);
          hMoves.push({
            style: currentStyle,
            data: [move],
          });
        } else {
          hMoves[mIndex].data.push(move);
        }
      }
      return hMoves;
    };

    const getMoves = (mstyle, type) => {
      if(type !== "video" && type !== "steps") return [];
      let sMoves = moves.filter(m => m.type === type && (mstyle === "allstyles" || m.style === mstyle));
      if(mstyle=="allstyles") return parseHMoves(sMoves);
      return sMoves;
    }

    useFocusEffect(useCallback(() => { loadMoves(); }, []));

    useEffect(() => {
      if (route.params?.savedMove) {
        handleSave(route.params.savedMove);
        navigation.setParams({ savedMove: undefined });
      }

      if (route.params?.deletedId) {
        myDojoHandleDelete(route.params.deletedId);
        navigation.setParams({ deletedId: undefined });
      }
    }, [route.params?.savedMove, route.params?.deletedId]);

    useEffect(() => {
      const subscription = DeviceEventEmitter.addListener("SAVE_MOVE_EVENT", (newMove) => {
        handleSave(newMove);
      });
      const unsubscribeNav = navigation.addListener("beforeRemove", () => {
        // Any cleanup if needed
      });

      return () => {
        subscription.remove();
        unsubscribeNav();
      };
    }, [moves]);

    const toggleSelect = (id) => {
      setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const toggleListMode = (mv) => {
      if(mv===null) {
        setListMode(false);
        navigation.navigate('AddMove', { move: null, mtype: ftype, mstyle: fstyle !== "allstyles" ? fstyle : 'Self Defense' })
      } else {
        setListMode(false);
        navigation.navigate('AddMove', {move: mv, });
      }
    };
    
    const MoveCard = ({ item }) => (
      <TouchableOpacity 
        onLongPress={() => toggleSelect(item.id)}
        onPress={() => selectedIds.length > 0 ? toggleSelect(item.id) : navigation.navigate('Move', { video: item })}
        style={[styles.itemContainer, selectedIds.includes(item.id) && styles.selectedItem]}>

        <View style={styles.card}>
          <View style={styles.titleBanner}>
            <Text numberOfLines={1} style={ftype === 'video' ? styles.titleTextVideo : styles.titleText}>{item.title}</Text>
          </View>
          <Image source={{ uri: item.Thumb || 'https://via.placeholder.com/150' }} style={styles.thumbImage} />
          <View style={styles.pillRow}>
            <Text style={ftype === 'video' ? styles.typePillVideo : styles.typePill}>{item.type}</Text>
            <TouchableOpacity onPress={() => toggleListMode(item)} style={styles.plusIcon}>
              <ImageBackground style={{ height:"100%", width:"100%", }} resizeMode='contain' source={ ftype === 'steps' ? require('../assets/editmanualicon.png') : require('../assets/editmoveicon.png') }/>         
            </TouchableOpacity>             
          </View>
        </View>
      </TouchableOpacity>
    );    

    if (loading && ftype=== 'video') return <ActivityIndicator size="large" color="#f30707" style={{marginTop:38, flex:1, transform: [{scale: 2.0}]}} />;
    if (loading && ftype=== 'steps') return <ActivityIndicator size="large" color="#0b6112" style={{marginTop:38, flex:1, transform: [{scale: 2.0}]}} />;
    if (listmode) return (
      <ImageBackground style={{flex:1,width:'100%',height:'100%'}} resizeMode='cover' source={require('../assets/mydojobg.jpg')}>
        <SafeAreaView style={{ flex: 1, marginTop:25}}>
          <View style={{backgroundColor: 'transparent', marginBottom:30, paddingLeft:5, paddingRight:5}}>
            <ImageBackground style={ styles.icon } resizeMode='contain' source={ftype=== "video" ? require('../assets/moveslisttitle.png') : require('../assets/manualstitle.png')} /> 
          </View>
          <View style={styles.myDojoHeader}>
            {ftype === "video" ? ( <Text style={{ color: '#e43838', fontSize: 11, flex: 1, textTransform: 'uppercase' }}>{fstyle === "allstyles" ? `ALL ${ftype.toUpperCase()} FIGHTING STYLES` : "FIGHTING STYLE: "+fstyle} </Text> )
              : ( <Text style={{ color: '#00FF41', fontSize: 12, flex: 1, textTransform: 'uppercase' }}>{fstyle === "allstyles" ? `ALL ${ftype.toUpperCase()} FIGHTING STYLES` : "FIGHTING STYLE: "+fstyle} </Text> )}
            <View style={{flexDirection:'row'}}>
              <TouchableOpacity onPress={() => { setListMode(false); setSelectedIds([]); }}>
                {ftype === "video" ? (<Text style={{color: '#e43838', fontSize: 18, paddingLeft: 10}}>← BACK</Text>) : (<Text style={{color: '#00FF41', fontSize: 18, paddingLeft: 10}}>← BACK</Text>)}
              </TouchableOpacity>
    
              <TouchableOpacity onPress={() => toggleListMode(null)} style={styles.plusIcon}>
                <ImageBackground style={{ flex:1, height:"auto", width:"auto", }} resizeMode='contain' source={ftype === "steps" ? require('../assets/addmanualicon.png') : require('../assets/addmoveicon.png') }/>         
              </TouchableOpacity>
            </View>
          </View>
           
          <FlatList
            data={hmoves}
            extraData={[selectedIds, moves]}
            keyExtractor={(item, index) => item.id || index.toString()}
            renderItem={({ item }) => (
              fstyle === "allstyles" ? (
                <View style={styles.sectionContainer}>
                  <Text style={ftype === "steps" ? styles.sectionHeader : styles.sectionHeaderVideo}>{item.style}</Text>
                    <FlatList
                       horizontal
                       data={item.data}
                       extraData={[selectedIds, moves]}
                       keyExtractor={m => m.id.toString()}
                       renderItem={({ item }) => <MoveCard item={item} />}
                       contentContainerStyle={{ paddingRight: 50, paddingLeft: 12 }}
                       showsHorizontalScrollIndicator={false}
                     />
                 </View>
               ) : (<View style={styles.verticalWrapper}><MoveCard item={item} /></View>)
             )}
           />
     
           {selectedIds.length > 0 && (
             <View style={styles.batchBar}>
               <Text style={styles.batchText}>{selectedIds.length} Selected</Text>
               <TouchableOpacity onPress={handleShare} style={styles.shareIcon}>
                 <ImageBackground style={{height:"100%", width:"100%", }} resizeMode='contain' source={ftype === "steps" ? require('../assets/sharemanualicon.png') : require('../assets/sharemoveicon.png') }/>         
               </TouchableOpacity>
               <TouchableOpacity onPress={() => myDojoHandleDelete(selectedIds)} style={styles.myDojoDeleteIcon}>
                 <ImageBackground style={{height:"100%", width:"100%", }} resizeMode='contain' source={ftype === "steps" ? require('../assets/deletemanualicon.png') : require('../assets/deletemoveicon.png') }/>         
               </TouchableOpacity>
               <TouchableOpacity onPress={() => setSelectedIds([])} style={styles.myDojoDiscardIcon}>
                 <ImageBackground style={{height:"100%", width:"100%", }} resizeMode='contain' source={require('../assets/discardicon.png') }/> 
               </TouchableOpacity>
             </View>)}
        </SafeAreaView>
      </ImageBackground>);

    return (
     <ImageBackground style={styles.imgBackground } resizeMode='cover' source={require('../assets/mydojostylesbg.jpg')}>
      <SafeAreaView style={{flex:1, marginTop:25}}>
        <View style={{backgroundColor: 'transparent', marginBottom:19, paddingLeft:5, paddingRight:5}}>
          <ImageBackground style={styles.icon} resizeMode='contain' source={require('../assets/mydojostylestitle.png')} /> 
        </View>
        <View style={styles.header}>
           <Text style={styles.title}>MY DOJO FIGHTING STYLES LIST</Text>
            <View style={{flexDirection:'row', alignItems:'center', justifyContent: 'center', marginBottom:5, height:38, width:"100%"}}>
              <TouchableOpacity onPress={() => navigation.navigate('AddMove', { move: null, mtype:"video", mstyle: null, })} style={styles.plusIcon}>
                <ImageBackground style={{ flex:1, height:"100%", width:"100%", }} resizeMode='contain' source={require('../assets/addmoveicon.png')}/>         
              </TouchableOpacity> 
              <TouchableOpacity onPress={() => navigation.navigate('AddMove', { move: null, mtype:"steps", mstyle: null })} style={styles.plusIcon}>
                <ImageBackground style={{ flex:1, height:"100%", width:"100%", }} resizeMode='contain' source={require('../assets/addmanualicon.png')}/>         
              </TouchableOpacity>
              <TouchableOpacity onPress={handleImport} style={styles.importIcon}>
                <ImageBackground style={{ flex:1, height:"100%", width:"100%",}} resizeMode='contain' source={require('../assets/importmoveicon.png')}/>         
              </TouchableOpacity>
              <TouchableOpacity onPress={showInstructions} style={styles.plusIcon}>
                <ImageBackground style={{ flex:1, height:"100%", width:"100%",}} resizeMode='contain' source={require('../assets/infobtn.png')}/>         
              </TouchableOpacity>
            </View>
        </View>

        {smoves.length > 0 ? (
          <FlatList
           data={smoves}
           extraData={moves}
           keyExtractor={item => item.id}
           ListHeaderComponent={() => <Image source={require('../assets/movesdivider.png')} style={styles.redDivider} resizeMode='contain'/>}
           ItemSeparatorComponent={({ leadingItem }) => {
            const index = smoves.findIndex(m => m.id === leadingItem.id);
            if (index > 0 && smoves[index]?.type === 'video' && index+1 < smoves.length && smoves[index+1]?.id === 's-all') {
              return <Image source={require('../assets/manualsdivider.png')} style={styles.greenDivider} resizeMode='contain'/>;
            }
            return <View style={styles.smallGap} />;
           }}
           renderItem={({ item }) => (
            <View style={styles.card}>
              { item && item.style && item.type === "video" ? 
                ( <TouchableOpacity
                  style={{ width: '79%', height: 43 }}
                  onPress={() => { setHMoves(getMoves(item.style, item.type)); setFStyle(item.style); setType(item.type); setListMode(true);}}>
                  <ImageBackground style={{flex: 1, justifyContent:'center', alignItems:'center'}} resizeMode='stretch' source={require('../assets/redbtnbg.png')}>
                    {item.id === 'v-all' ? 
                      ( <Image
                          resizeMode="contain"
                          style={{ height:"45%", width:"57%", alignSelf:"center",}}
                          source={require('../assets/allstyles.png')}
                        /> ) : (
                          <Text numberOfLines={1} ellipsizeMode="tail" style={styles.cardText}>{item.style}</Text> 
                      )}
                  </ImageBackground>
                  </TouchableOpacity>) 
                  : item && item.style && item.type==="steps" && ( <TouchableOpacity
                    style={{ width: '79%', height: 43 }}
                    onPress={() => { setType(item.type); setFStyle(item.style); setHMoves(getMoves(item.style, item.type)); setListMode(true); }}>
                    <ImageBackground style={{flex: 1, justifyContent: 'center', alignItems: 'center'}} resizeMode='stretch' source={require('../assets/greenbtnbg.png')}>
                      {item.id === 's-all' ? 
                        ( <Image
                          resizeMode="contain"
                          style={{height:"45%", width:"57%", alignSelf:"center",}}
                          source={require('../assets/allstyles.png')}
                        /> ) : (
                          <Text numberOfLines={1} ellipsizeMode="tail" style={styles.cardText}>{item.style}</Text> 
                      )}
                    </ImageBackground>
                  </TouchableOpacity> )
                }
            </View>
           )}
         />) : (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={styles.infoText}>Click the + icons to adds moves or use the import icon to import moves. You can share the moves after.</Text>
          </View>
        )}
      </SafeAreaView>
     </ImageBackground>
    );
}

const styles = StyleSheet.create({
imgBackground: { flex: 1, width: '100%', height: '100%', opacity:.9 },
sectionContainer: { marginBottom: 25, paddingLeft: 10, backgroundColor: 'rgba(0, 255, 65, 0.1)' },
sectionHeader: { color: '#00FF41', fontSize: 18, fontWeight: 'bold', marginBottom: 9, textTransform: 'uppercase', letterSpacing: 1 },itemContainer: { width: width * 0.7, marginRight: 15, backgroundColor: 'rgba(0,0,0,0.8)', borderRadius: 15, borderWidth: 1, borderColor: '#333', overflow: 'hidden', marginBottom:12, },
sectionHeader: { color: '#e72f0f', fontSize: 18, fontWeight: 'bold', marginBottom: 9, textTransform: 'uppercase', letterSpacing: 1 },itemContainer: { width: width * 0.7, marginRight: 15, backgroundColor: 'rgba(0,0,0,0.8)', borderRadius: 15, borderWidth: 1, borderColor: '#333', overflow: 'hidden', marginBottom:12, },
verticalWrapper: { width: width * 0.9, alignSelf: 'center', marginBottom: 15 },
myDojoDiscardIcon: {height: 43, width: 43, borderRadius: 9, backgroundColor: '#d1deeb', alignItems: 'center', justifyContent: 'center' },
selectedItem: { borderColor: '#8efaa9', borderWidth: 2, backgroundColor: 'rgba(16, 212, 65, 0.6)' },
titleBanner: {width: '90%', padding: 5, borderRadius: 5, marginTop: 3 },
titleText: { textAlign: 'center', fontSize: 12, fontWeight: 'bold', color: '#048119' },
titleTextVideo: { textAlign: 'center', fontSize: 12, fontWeight: 'bold', color: '#ff5722' },
thumbImage: { width: '100%', height: 150, backgroundColor: '#1a1a1a' },
myDojoDeleteIcon: {height: 43, width: 43, borderRadius: 9, backgroundColor: '#d9d6e4', alignItems: 'center', justifyContent: 'center' },
pillRow: { backgroundColor: 'rgba(0, 255, 65, 0.3)',flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 3, marginTop: 8 },
typePill: { backgroundColor: 'rgba(5, 17, 8, 0.2)', color: '#00FF41', fontSize: 10, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 5 },
typePillVideo: { backgroundColor: 'rgba(235, 77, 14, 0.2)', color: '#c21b29', fontSize: 10, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 5 },
editIcon: { fontSize: 16 },
batchBar: { position: 'absolute', bottom: 49, left: 20, right: 20, flexDirection: 'row', backgroundColor: '#1a1a1a', padding: 15, borderRadius: 30, alignItems: 'center', justifyContent: 'space-around', borderWidth: 1, borderColor: '#00FF41', elevation: 10 },
batchText: { color: '#00FF41', fontWeight: 'bold' },
batchIcon: { fontSize: 22, color: '#fff' },
shareIcon: {height: 43, width: 43, borderRadius: 9, backgroundColor: '#daf1dc', alignItems: 'center', justifyContent: 'center' },
container: { flex: 1, backgroundColor: '#c2cdd4' },
banner: { width: '100%', height: 57, borderRadius: 12, marginBottom: 10 },
header: {flexDirection: 'column', width:"90%", minHeight:83, backgroundColor: 'rgba(195, 209, 223, 0.4)', borderWidth: 1, borderColor: '#c2cdd4',justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginBottom: 19, },
myDojoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, backgroundColor: 'rgba(0,0,0,0.5)' },
title: { fontSize: 17, fontWeight: 'bold', color: '#420105', height: 38, width: '100%', textAlign: 'center', marginBottom: 2 },
infoText: { fontSize: 14, fontWeight: 'bold', color: '#420105', minHeight: 76, width: '100%', textAlign: 'center', marginTop: 19 },
icon: { height: 60, width: '90%', alignSelf: 'center' },
card: { backgroundColor: 'transparent', marginHorizontal: 12, marginVertical: 5, alignItems: 'center'},
cardText: { fontSize: 16, fontWeight: 'bold', color: '#bddff3', paddingHorizontal: 5,},
greenDivider: {width: '90%',height: 40, alignSelf: 'center',marginVertical: 15,shadowColor: '#c9f5d5', shadowOffset: { width: 0, height: 0 },shadowOpacity: 0.5,shadowRadius: 10,backgroundColor: 'rgba(195, 209, 223, 0.4)'},
redDivider: {width: '90%',height: 40, alignSelf: 'center',marginVertical: 15,shadowColor: '#f8d9de', shadowOffset: { width: 0, height: 0 },shadowOpacity: 0.5,shadowRadius: 10,backgroundColor: 'rgba(195, 209, 223, 0.4)'},
smallGap: {height: 12,},
cardInternal: { padding: 10, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 10 },
deleteIcon: { height: 35, width: 35 },
discardIcon: { height: 35, width: 35 },
redPill: {backgroundColor: 'rgba(211, 47, 47, 0.8)', borderRadius: 25,borderWidth: 1,borderColor: '#ff4444',},
bluePill: {backgroundColor: 'rgba(25, 118, 210, 0.8)', borderRadius: 25,borderWidth: 1,borderColor: '#44aaff',},
plusIcon:{height: 43, width: 43, borderRadius: 9, marginLeft: 21, backgroundColor: '#c2cdd4', marginBottom: 7},
importIcon:{height: 72, width:48, borderRadius: 9, marginLeft: 19, marginBottom:3},
pillButton: {paddingVertical: 15, paddingHorizontal: 25, borderRadius: 30, marginVertical: 10, marginHorizontal: 20, borderWidth: 1,borderColor: 'rgba(255,255,255,0.3)',elevation: 5, 
  shadowColor: '#000', shadowOffset: { width: 0, height: 2 },shadowOpacity: 0.8,shadowRadius: 2,}
});