import { View, Text, TouchableOpacity, FlatList, Alert, StyleSheet, ActivityIndicator, ImageBackground, Image, Dimensions, DeviceEventEmitter } from 'react-native';
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

    const loadMoves = async () => {
      try {
        const file = new File(Paths.document, 'moves.json');
        if (file.exists) {
          const content = await file.text(); 
          const movesList = JSON.parse(content);
          setMoves(movesList);
          parseStyles(movesList);
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
      } catch (e) {
        console.error("Save failed", e);
        Alert.alert("Error", "Could not save moves to storage.");
      }
    };

    const myDojoHandleDelete = (id = null) => {
      const actualId = (id && typeof id === 'object' && id.nativeEvent) ? null : id;
      const idsToDelete = actualId ? [actualId] : selectedIds;
      if (idsToDelete.length === 0) return;
      Alert.alert("Delete Moves", `Remove ${idsToDelete.length} selected move(s)?`, [
        { text: "Cancel", style:"cancel" },
        { text: "Delete", style: 'destructive', onPress: async () => {
          const updatedList = moves.filter(m => !idsToDelete.includes(m.id));
          try {
            const file = new File(Paths.document, 'moves.json');
            await file.write(JSON.stringify(updatedList));
            setMoves(updatedList);
            setHMoves(prev => prev.filter(m => !idsToDelete.includes(m.id)));
            parseStyles(updatedList);
            setSelectedIds([]); 
          } catch (e) {
            Alert.alert("Error", "Failed to delete.");
          }
        }}
      ]);
    };

    const handleImport = async () => {
      try {
        if (isOffline) return Alert.alert("Offline", "Internet required.");
        const res = await DocumentPicker.getDocumentAsync({ 
          type: ['application/zip', 'application/x-zip-compressed', '*/*'], 
          copyToCacheDirectory: true 
        });

        if (res.canceled || !res.assets || res.assets.length === 0) return;
        setLoading(true);
        const zipUri = res.assets[0].uri;
        const tempDir = new Directory(Paths.document, 'temp_import');
        if (!tempDir.exists) tempDir.create();
        await unzip(zipUri, tempDir.uri);
        const dataFile = new File(tempDir, 'data.json');
        if (dataFile.exists) {
          const content = await dataFile.text();
          handleSave(JSON.parse(content));
        }
        tempDir.delete();
      } catch (e) {
        console.error("Import error:", e);
        Alert.alert("Error", "The picker failed to open or the ZIP is invalid.");
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
      let sMoves = [{ id: 'v-all', type: 'video', style: 'allstyles' }];
      let bMoves = [{ id: 's-all', type: 'steps', style: 'allstyles' }];

      list?.forEach(m => {
        const currentStyle = m.style || 'Self-Defence';
        if (m.type === 'video' && !videoStyles.includes(currentStyle)) {
          videoStyles.push(currentStyle); 
          sMoves.push({ ...m, style: currentStyle }); 
        } else if (m.type === 'steps' && !stepStyles.includes(currentStyle)) {
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
        const currentStyle = move.style || 'Self-Defence'; 
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
      const subscription = DeviceEventEmitter.addListener('SAVE_MOVE_EVENT', (newMove) => {
        handleSave(newMove);
        setHMoves(getMoves(fstyle, ftype));
      });
      const unsubscribeNav = navigation.addListener('beforeRemove', () => {
        // Any cleanup if needed
      });

      return () => {
        subscription.remove();
        unsubscribeNav();
      };
    }, [moves]);

    //From here added myDojo styles screen with list of styles grouped by type, and an all styles button for each types.
      const handleShare = async () => {
        try {
          if (isOffline) {
            return Alert.alert("Offline", "No Wifi detected to share moves...");
          }
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
          const shareDir = new Directory(Paths.document, 'batch_share');
          if (shareDir.exists) {
            await shareDir.delete(); 
          }
          await shareDir.create();
          const dataFile = new File(shareDir, 'data.json');
          if (!dataFile.exists) {
            await dataFile.create();
          }
          await dataFile.write(JSON.stringify(selectedMoves)); 
          const zipFileName = `Dojo_Batch_${Date.now()}.zip`;
          const zipPath = `${Paths.document.uri}/${zipFileName}`;
          await zip(shareDir.uri, zipPath);
          if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(zipPath, {
              mimeType: 'application/zip',
              dialogTitle: 'Share your Dojo Moves',
            });
          } else {
            Alert.alert("Error", "Sharing is not available on this device.");
          }

          setTimeout(async () => {
            try {
              const zipFile = new File(Paths.document, zipFileName);
              if (zipFile.exists) await zipFile.delete();
              if (shareDir.exists) await shareDir.delete();
            } catch (cleanupError) {
              alert("Cleanup failed, but share worked.");
            }
          }, 1000);

          setSelectedIds([]); 
        } catch (e) {
          console.error("Batch share error:", e);
          Alert.alert("Error", "Sharing failed. Check storage permissions.");
        } finally {
          setLoading(false);
        }
      };

    const toggleSelect = (id) => {
      setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };
    
    const MoveCard = ({ item }) => (
      <TouchableOpacity 
        onLongPress={() => toggleSelect(item.id)}
        onPress={() => selectedIds.length > 0 ? toggleSelect(item.id) : navigation.navigate('Move', { video: item })}
        style={[styles.itemContainer, selectedIds.includes(item.id) && styles.selectedItem]}
      >
        <View style={styles.card}>
          <View style={styles.titleBanner}>
            <Text numberOfLines={1} style={styles.titleText}>{item.title}</Text>
          </View>
          <Image source={{ uri: item.Thumb || 'https://via.placeholder.com' }} style={styles.thumbImage} />
          <View style={styles.pillRow}>
            <Text style={styles.typePill}>{item.type}</Text>
            <TouchableOpacity onPress={() => {navigation.navigate('AddMove', {move: item})}} style={styles.plusIcon}>
              <ImageBackground style={{ height:"100%", width:"100%", }} resizeMode='contain' source={ ftype === 'steps' ? require('../assets/editmanualicon.png') : require('../assets/editmoveicon.png') }/>         
            </TouchableOpacity>             
          </View>
        </View>
      </TouchableOpacity>
    );    

    if (loading && ftype=== 'video') return <ActivityIndicator size="large" color="#f30707" style={{marginTop:38, flex:1, transform: [{scale: 2.0}]}} />;
    if (loading && ftype=== 'steps') return <ActivityIndicator size="large" color="#0b6112" style={{marginTop:38, flex:1, transform: [{scale: 2.0}]}} />;
    if (adding) return (<ImageBackground style={ styles.imgBackground } resizeMode='cover' source={require('../assets/mydojostylesbg.jpg')}>
      <SafeAreaView style={{flex:1, marginTop:25}}>
        </SafeAreaView>
        </ImageBackground>);

    if (listmode) return (
      <ImageBackground style={{flex:1,width:'100%',height:'100%'}} resizeMode='cover' source={require('../assets/mydojobg.jpg')}>
        <SafeAreaView style={{ flex: 1, margingTop:25}}>
          <View style={{backgroundColor: 'transparent', marginBottom:30, paddingLeft:5, paddingRight:5}}>
            <ImageBackground style={ styles.icon } resizeMode='contain' source={ftype=== 'video' ? require('../assets/moveslisttitle.png') : require('../assets/manualstitle.png')} /> 
          </View>
          <View style={styles.myDojoHeader}>
            <Text style={{ color: '#00FF41', fontSize: 12, flex: 1, textTransform: 'uppercase' }}>{fstyle === 'allstyles' ? `ALL ${ftype.toUpperCase()} FIGHTING STYLES` : "FIGHTING STYLE: "+fstyle}</Text>
            <View style={{flexDirection:'row'}}>
              <TouchableOpacity onPress={() => { setListMode(false); setSelectedIds([]); }}>
                <Text style={{color: '#00FF41', fontSize: 18, paddingLeft: 10}}>← BACK</Text>
              </TouchableOpacity>
    
              <TouchableOpacity onPress={() => navigation.navigate('AddMove', { move: null, mtype: ftype, mstyle: fstyle !== 'allstyles' ? fstyle : 'Self Defense' })} style={styles.plusIcon}>
                <ImageBackground style={{ flex:1, height:"auto", width:"auto", }} resizeMode='contain' source={ftype === 'steps' ? require('../assets/addmanualicon.png') : require('../assets/addmoveicon.png') }/>         
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
                  <Text style={styles.sectionHeader}>{item.style}</Text>
                    <FlatList
                       horizontal
                       data={item.data}
                       extraData={moves}
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
                 <ImageBackground style={{height:"100%", width:"100%", }} resizeMode='contain' source={ftype === 'steps' ? require('../assets/sharemanualicon.png') : require('../assets/sharemoveicon.png') }/>         
               </TouchableOpacity>
               <TouchableOpacity onPress={() => myDojoHandleDelete()} style={styles.myDojoDeleteIcon}>
                 <ImageBackground style={{height:"100%", width:"100%", }} resizeMode='contain' source={ftype === 'steps' ? require('../assets/deletemanualicon.png') : require('../assets/deletemoveicon.png') }/>         
               </TouchableOpacity>
               <TouchableOpacity onPress={() => setSelectedIds([])} style={styles.myDojoDiscardIcon}>
                 <ImageBackground style={{height:"100%", width:"100%", }} resizeMode='contain' source={require('../assets/discardicon.png') }/> 
               </TouchableOpacity>
             </View>
           )}
         </SafeAreaView>
        </ImageBackground>);



    return (
     <ImageBackground style={ styles.imgBackground } resizeMode='cover' source={require('../assets/mydojostylesbg.jpg')}>
      <SafeAreaView style={{flex:1, marginTop:25}}>
        <View style={{backgroundColor: 'transparent', marginBottom:30, paddingLeft:5, paddingRight:5}}>
          <ImageBackground style={ styles.icon } resizeMode='contain' source={require('../assets/mydojostylestitle.png')} /> 
        </View>
        <View style={styles.header}>
           <Text style={styles.title}>MY DOJO FIGHTING STYLES LIST</Text>
            <View style={{flexDirection:'row', alignItems:'center', justifyContent: 'center', marginBottom:5, height:38, width:"100%"}}>
              <TouchableOpacity onPress={() => navigation.navigate('AddMove', { move: null, mtype: 'video', mstyle: null, })} style={styles.plusIcon}>
                <ImageBackground style={{ flex:1, height:"100%", width:"100%", }} resizeMode='contain' source={require('../assets/addmoveicon.png')}/>         
              </TouchableOpacity> 
              <TouchableOpacity onPress={() => navigation.navigate('AddMove', { move: null, mtype: 'steps', mstyle: null })} style={styles.plusIcon}>
                <ImageBackground style={{ flex:1, height:"100%", width:"100%", }} resizeMode='contain' source={require('../assets/addmanualicon.png')}/>         
              </TouchableOpacity>
              <TouchableOpacity onPress={handleImport} style={styles.importIcon}>
                <ImageBackground style={{ flex:1, height:"100%", width:"100%",}} resizeMode='contain' source={require('../assets/importmoveicon.png')}/>         
              </TouchableOpacity>
            </View>
        </View>

        {smoves.length > 0 ? (
          <FlatList
           data={smoves}
           extraData={moves}
           keyExtractor={item => item.id}
           ItemSeparatorComponent={({ leadingItem }) => {
            const index = smoves.findIndex(m => m.id === leadingItem.id);
            if (index > 0 && smoves[index]?.id === 'v-all' && smoves[index + 1]?.id === 's-all') {
              return <Image source={require('../assets/manualsdivider.png')} style={styles.greenDivider} resizeMode='contain'/>;
            } else if (index > -1 && smoves[index]?.id === 'v-all') {
              return <Image source={require('../assets/movesdivider.png')} style={styles.redDivider} resizeMode='contain'/>;
            }
            return <View style={styles.smallGap} />;
           }}
           renderItem={({ item }) => (
            <View style={styles.card}>
              { item && item.style && item.type === 'video' ? 
                ( <TouchableOpacity
                  style={{ width: '79%', height: 43 }}
                  onPress={() => { setHMoves(getMoves(item.style, item.type)); setFStyle(item.style); setType(item.type); setListMode(true);}}>
                  <ImageBackground style={{flex: 1, justifyContent: 'center', alignItems: 'center'}} resizeMode='stretch' source={require('../assets/redbtnbg.png')}>
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
                  : item && item.style && item.type==='steps' && ( <TouchableOpacity
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
verticalWrapper: { width: width * 0.9, alignSelf: 'center', marginBottom: 15 },
myDojoDiscardIcon: {height: 43, width: 43, borderRadius: 9, backgroundColor: '#d1deeb', alignItems: 'center', justifyContent: 'center' },
selectedItem: { borderColor: '#8efaa9', borderWidth: 2, backgroundColor: 'rgba(16, 212, 65, 0.6)' },
titleBanner: {width: '90%', padding: 5, borderRadius: 5, marginTop: 3 },
titleText: { textAlign: 'center', fontSize: 11, fontWeight: 'bold', color: '#00FF41' },
thumbImage: { width: '100%', height: 150, backgroundColor: '#1a1a1a' },
myDojoDeleteIcon: {height: 43, width: 43, borderRadius: 9, backgroundColor: '#d9d6e4', alignItems: 'center', justifyContent: 'center' },
pillRow: { backgroundColor: 'rgba(0, 255, 65, 0.3)',flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 3, marginTop: 8 },
typePill: { backgroundColor: 'rgba(0, 255, 65, 0.1)', color: '#00FF41', fontSize: 10, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 5 },
editIcon: { fontSize: 16 },
batchBar: { position: 'absolute', bottom: 49, left: 20, right: 20, flexDirection: 'row', backgroundColor: '#1a1a1a', padding: 15, borderRadius: 30, alignItems: 'center', justifyContent: 'space-around', borderWidth: 1, borderColor: '#00FF41', elevation: 10 },
batchText: { color: '#00FF41', fontWeight: 'bold' },
batchIcon: { fontSize: 22, color: '#fff' },
shareIcon: {height: 43, width: 43, borderRadius: 9, backgroundColor: '#daf1dc', alignItems: 'center', justifyContent: 'center' },
container: { flex: 1, backgroundColor: '#c2cdd4' },
banner: { width: '100%', height: 57, borderRadius: 12, marginBottom: 10 },
header: {flexDirection: 'column', width:"90%", minHeight:86, backgroundColor: 'rgba(195, 209, 223, 0.4)', borderWidth: 1, borderColor: '#c2cdd4',justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginBottom: 25, },
myDojoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, backgroundColor: 'rgba(0,0,0,0.5)' },
title: { fontSize: 18, fontWeight: 'bold', color: '#420105', height: 38, width: '100%', textAlign: 'center', marginBottom: 5 },
infoText: { fontSize: 14, fontWeight: 'bold', color: '#420105', minHeight: 76, width: '100%', textAlign: 'center', marginTop: 19 },
icon: { height: 60, width: '90%', alignSelf: 'center' },
card: { backgroundColor: 'transparent', marginHorizontal: 12, marginVertical: 5, alignItems: 'center'},
cardText: { fontSize: 15, fontWeight: 'bold', color: '#88949b', paddingHorizontal: 5,},
greenDivider: {width: '90%',height: 40, alignSelf: 'center',marginVertical: 15,shadowColor: '#c9f5d5', shadowOffset: { width: 0, height: 0 },shadowOpacity: 0.5,shadowRadius: 10,backgroundColor: 'rgba(195, 209, 223, 0.4)'},
redDivider: {width: '90%',height: 40, alignSelf: 'center',marginVertical: 15,shadowColor: '#f8d9de', shadowOffset: { width: 0, height: 0 },shadowOpacity: 0.5,shadowRadius: 10,backgroundColor: 'rgba(195, 209, 223, 0.4)'},
smallGap: {height: 12,},
cardInternal: { padding: 10, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 10 },
deleteIcon: { height: 35, width: 35 },
discardIcon: { height: 35, width: 35 },
redPill: {backgroundColor: 'rgba(211, 47, 47, 0.8)', borderRadius: 25,borderWidth: 1,borderColor: '#ff4444',},
bluePill: {backgroundColor: 'rgba(25, 118, 210, 0.8)', borderRadius: 25,borderWidth: 1,borderColor: '#44aaff',},
plusIcon:{height:43, width:43, borderRadius:9, marginLeft:21, backgroundColor: '#c2cdd4'},
importIcon:{height:67, width:47, borderRadius:9, marginLeft:19},
pillButton: {paddingVertical: 15, paddingHorizontal: 25, borderRadius: 30, marginVertical: 10, marginHorizontal: 20, borderWidth: 1,borderColor: 'rgba(255,255,255,0.3)',elevation: 5, 
  shadowColor: '#000', shadowOffset: { width: 0, height: 2 },shadowOpacity: 0.8,shadowRadius: 2,}
});