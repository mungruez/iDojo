import { View, Text, TouchableOpacity, FlatList, Alert, StyleSheet, ActivityIndicator, ImageBackground, Image, Dimensions, DeviceEventEmitter, Platform, StatusBar } from 'react-native';
import { useNavigation, useFocusEffect  } from '@react-navigation/native';
import React, { useState, useCallback, useEffect  } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNetInfo } from "@react-native-community/netinfo";
import * as FileSystem from 'expo-file-system/legacy';
import * as DocumentPicker from 'expo-document-picker';
import { zip, unzip } from 'react-native-zip-archive';
import * as Sharing from 'expo-sharing';

const { width } = Dimensions.get('window');
    
export default function MyDojoStyles({route}) {
    const [moves, setMoves] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [smoves, setSMoves] = useState([]);
    const navigation = useNavigation();

    const [listmode, setListMode] = useState(false);
    const [hmoves, setHMoves] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);

    const [ftype, setType] = useState('select move type');
    const [fstyle, setFStyle] = useState('Self Defense');
    const isOffline = useNetInfo().isConnected === false;

    const showInstructions = () => {
        Alert.alert(
          "My Dojo Moves List",
          "Intructions: Save, Edit, Share, View, Delete and Import moves with iDojo. You may add any number of Moves your phone memory allows.\n(1) Use the red, green and blue plus buttons to add moves. You can either add video/pdf moves or, moves with an image, title and description in each steps.\n(2) Click on one of the red, green or blue buttons in the Moves List to see all moves with the same move list title. The first list title is all styles.  Red buttons in the list are for Video Moves and green buttons are for Steps Moves also called Manuals. The blue button is for PDF moves.\n(3) On the list screen press and hold a move to see the batch bar appear. Select all moves to share or delete and click on the share or delete button in the batch bar to share or delete moves. Use the Edit button below each move in the list to edit a move.\n(4) Scroll horizontally and vertically for the all styles list to view all your moves. Click the save button to save moves. on the add Move screen click +step button to add a new step to the move.",
          [
            {
              text: "OK",
              onPress: () => setListMode(false),
              style: "cancel" 
            }
          ],
          { cancelable: false } 
        );
    };


    const loadMoves = async () => {
      try {
        const fileUri = `${FileSystem.documentDirectory}moves.json`;
        const info = await FileSystem.getInfoAsync(fileUri);
        
        if (info.exists) {
          const content = await FileSystem.readAsStringAsync(fileUri);
          let movesList = JSON.parse(content);
          movesList = movesList.filter(m => 
            m && 
            m.id && 
            m.title && 
            m.title.trim() !== "" &&
            (m.type === 'video' || m.type === "pdf" || (m.steps && m.steps.length > 0))
          );

          setMoves(movesList);
          parseStyles(movesList);
          setHMoves(getMoves(fstyle, ftype, movesList));
        } else {
          setMoves([]);
        }
      } catch (e) {
        Alert.alert("Load Failed", e.message);
      } finally {
        setLoading(false);
      }
    };


    const handleSave = async (newData) => { 
      const incomingMoves = Array.isArray(newData) ? newData : [newData];
      const updatedList = [...moves];
      incomingMoves.forEach(moveData => {
        const index = updatedList.findIndex(m => m.id === moveData.id);
        if (index > -1) {
          updatedList[index] = moveData;
        } else {
          updatedList.push(moveData);
        }
      });
      setMoves(updatedList);
      await saveToStorage(updatedList); 
    };


    const saveToStorage = async (list) => {
      try {
        const fileUri = `${FileSystem.documentDirectory}moves.json`;
        await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(list));
        parseStyles(list);
        setHMoves(getMoves(fstyle, ftype, list)); 
      } catch (e) {
        Alert.alert("Storage Error", e.message || "Could not save move list to disk.");
      }
    };



    const myDojoHandleDelete = async (idsFromArg = []) => {
      const actualIds = Array.isArray(idsFromArg) && idsFromArg.length > 0 ? idsFromArg : selectedIds;
      const cleanIdsToDelete = actualIds.map(id => String(id).trim());
      if (cleanIdsToDelete.length === 0) return;
      Alert.alert("Delete Moves",`Remove ${cleanIdsToDelete.length} selected move(s)?`,
        [{ text: "Cancel", style: "cancel" },
          {text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const movesToDelete = moves.filter(m => cleanIdsToDelete.includes(String(m.id)));
              for (const move of movesToDelete) {
                const folderUri = `${FileSystem.documentDirectory}moves/${move.id}/`;
                await FileSystem.deleteAsync(folderUri, { idempotent: true });
              }
              const updatedList = moves.filter(m => !cleanIdsToDelete.includes(String(m.id)));
              const fileUri = `${FileSystem.documentDirectory}moves.json`;
              await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(updatedList));
              setMoves(updatedList);
              parseStyles(updatedList);
              setHMoves(getMoves(fstyle, ftype, updatedList)); 
              setSelectedIds([]);
              
            } catch (error) {
              Alert.alert("Delete Error", error.message || "Could not remove files from storage.");
            }
          }
        }
        ]);
    };


    const handleShare = async (selectedids) => {
      if (isOffline) {
        Alert.alert("No Internet", "You need an internet connection to share moves.");
        return;
      }
      try {
        if (!selectedids?.length) return;
        setLoading(true);

        const selectedMoves = fstyle === "allstyles" 
          ? hmoves.flatMap(g => g.data.filter(m => selectedids.includes(m.id)))
          : hmoves.filter(m => selectedids.includes(m.id));

        const shareDirUri = `${FileSystem.cacheDirectory}share_batch/`;
        const zipPathUri = `${FileSystem.cacheDirectory}Dojo_Export.zip`;
        await FileSystem.deleteAsync(shareDirUri, { idempotent: true });
        await FileSystem.makeDirectoryAsync(shareDirUri, { intermediates: true });

        const processedMoves = await Promise.all(selectedMoves.map(async (move, idx) => {
          const updatedMove = { ...move };
          const copyToStaging = async (uri) => {
            if (!uri || typeof uri !== 'string' || !uri.startsWith('file://')) return uri;
              const info = await FileSystem.getInfoAsync(uri);
              if (!info.exists) {
                alert(`File does not exist: ${uri}`);
                return null; 
              }  
              const fileName = `${idx}_${uri.split('/').pop()}`;
              const dest = `${shareDirUri}${fileName}`;  
            try {
              await FileSystem.copyAsync({ from: uri, to: dest });
              const destInfo = await FileSystem.getInfoAsync(dest);
              if (!destInfo.exists) {
                throw new Error(`Copy verification failed: ${fileName} not found after copy`);
              }
              return fileName;
            } catch (e) { return null; }
          };

          if (move.vid) updatedMove.vid = await copyToStaging(move.vid);
          if (move.videoUrl) updatedMove.videoUrl = await copyToStaging(move.videoUrl);
          if (Array.isArray(move.steps)) {
            updatedMove.steps = await Promise.all(move.steps.map(async (s, sIdx) => {
              const imgFileName = await copyToStaging(s.img);
              return { ...s, img: imgFileName };
            }));

            if (updatedMove.steps.some(s => s.img === null)) {
              throw new Error('Failed to share step image.');
            }
          }
          updatedMove.thumb = move.type === 'video' ? (updatedMove.vid || updatedMove.videoUrl) : move.type === 'pdf' ? (updatedMove.vid || updatedMove.videoUrl) : (updatedMove.steps?.[0]?.img || null);
          return updatedMove;
        }));

        await FileSystem.writeAsStringAsync(`${shareDirUri}data.json`, JSON.stringify(processedMoves));
        const nakedSource = Platform.OS === 'android' ? shareDirUri.replace('file://', '').replace(/\/$/, '') : shareDirUri;
        const nakedTarget = Platform.OS === 'android' ? zipPathUri.replace('file://', '') : zipPathUri;

        await zip(nakedSource, nakedTarget);

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(zipPathUri, {
            mimeType: 'application/zip',
            UTI: 'public.zip-archive' 
          });
        }
        setSelectedIds([]);
        await FileSystem.deleteAsync(shareDirUri, { idempotent: true });
        await FileSystem.deleteAsync(zipPathUri, { idempotent: true });
        
      } catch (e) {
        Alert.alert("Share Error, you may to retry. ", e.message);
      } finally {
        setLoading(false);
      }
    };




    const handleImport = async () => {
      try {
        const res = await DocumentPicker.getDocumentAsync({ 
          type: ['application/zip', 'application/x-zip-compressed', 'application/octet-stream'], 
          copyToCacheDirectory: true 
        });

        if (res.canceled) return;
        setLoading(true);

        const zipUri = res.assets ? res.assets[0].uri : res.uri;
        const importId = Date.now().toString();
        const permanentDirUri = `${FileSystem.documentDirectory}imported_${importId}/`;

        await FileSystem.makeDirectoryAsync(permanentDirUri, { intermediates: true });

        const nakedZip = Platform.OS === 'android' ? zipUri.replace('file://', '') : zipUri;
        const nakedDest = Platform.OS === 'android' ? permanentDirUri.replace('file://', '').replace(/\/$/, '') : permanentDirUri;

        await unzip(nakedZip, nakedDest);
        
        const dataFilePath = `${permanentDirUri}data.json`;
        const exists = await FileSystem.getInfoAsync(dataFilePath);
        if (!exists.exists) throw new Error("Manifest not found in zip");

        const content = await FileSystem.readAsStringAsync(dataFilePath);
        const importedMoves = JSON.parse(content);

        const finalMoves = importedMoves.map((move, index) => {
          const fixPath = (oldPath) => {
            if (!oldPath || typeof oldPath !== 'string' || oldPath.startsWith('http')) return oldPath;
            const fileName = oldPath.split('/').pop(); 
            return `${permanentDirUri}${fileName}`;
          };

          const restored = {
            ...move,
            id: `move_${importId}_${index}_${Math.random().toString(36).substr(2, 4)}`,
            vid: move.type === 'video' || move.type === "pdf" ? fixPath(move.vid || move.videoUrl) : null,
            videoUrl: move.type === 'video' || move.type === "pdf" ? fixPath(move.videoUrl || move.vid) : '',
          };

          if (move.type === 'steps' && Array.isArray(move.steps)) {
            restored.steps = move.steps.map(step => ({
              ...step, img: fixPath(step.img)
            }));
          }
          restored.thumb = move.type === 'video' ? (restored.vid || restored.videoUrl) : move.type === 'pdf' ? (restored.vid || restored.videoUrl): (restored.steps?.[0]?.img || null);
          return restored;
        });

        await handleSave(finalMoves);
        await FileSystem.deleteAsync(dataFilePath, { idempotent: true });
        Alert.alert("Success", `${finalMoves.length} moves added!`);

      } catch (e) {
        Alert.alert("Import Failed", e.message);
      } finally {
        setLoading(false);
      }
    };


  
    const parseStyles = (list) => {
      if (!Array.isArray(list)) {
        alert("Data is not an array, skipping parse.");
        return;
      }
      let videoStyles = [], stepStyles = [], pdfStyles = [];
      let sMoves = [{ id: "v-all", type: "video", style: "allstyles" }];
      let bMoves = [{ id: "s-all", type: "steps", style: "allstyles" }];
      let pMoves = [{ id: "p-all", type: "pdf", style: "allstyles" }];

      list?.forEach(m => {
        const currentStyle = m.style || "Self-Defence";
        if (m.type === "video" && !videoStyles.includes(currentStyle)) {
          videoStyles.push(currentStyle); 
          sMoves.push({ ...m, style: currentStyle }); 
        } else if (m.type === "steps" && !stepStyles.includes(currentStyle)) {
          stepStyles.push(currentStyle); 
          bMoves.push({ ...m, style: currentStyle });
        } else if (m.type === "pdf" && !pdfStyles.includes(currentStyle)) {
          pdfStyles.push(currentStyle);
          pMoves.push({ ...m, style: currentStyle });
        }
      });

      if(sMoves.length > 1 && bMoves.length > 1 && pMoves.length > 1) {
        setSMoves([...sMoves, ...bMoves, ...pMoves]);
      } else if(sMoves.length > 1 && bMoves.length > 1) {
        setSMoves([...sMoves, ...bMoves]);
      } else if(sMoves.length > 1 && pMoves.length > 1) {
        setSMoves([...sMoves, ...pMoves]);
      } else if(bMoves.length > 1 && pMoves.length > 1) {
        setSMoves([...bMoves, ...pMoves]);
      } else if (sMoves.length > 1) {
        setSMoves(sMoves);
      } else if (bMoves.length > 1) {
        setSMoves(bMoves);
      } else if (pMoves.length > 1) {
        setSMoves(pMoves);
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


    const getMoves = (mstyle, type, movesList) => {
      if(type !== "video" && type !== "steps" && type !== "pdf") return [];
      let sMoves = movesList.filter(m => m.type === type && (mstyle === "allstyles" || m.style === mstyle));
      if(mstyle=="allstyles") return parseHMoves(sMoves);
      return sMoves;
    }


    const viewPdf = async (move) => {
      if (isOffline) {
        Alert.alert("No Internet", "You need an internet connection to view PDF moves.");
        return;
      }

      if (!move) {
        Alert.alert("Error", "No move data");
        return;
      }

      if (move.videoUrl && move.videoUrl.startsWith('http')) {
        try {
          const viewerUrl = `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(move.videoUrl)}`;
          const pdfData = {
            id: move.id,
            title: move.title || 'PDF Document',
            style: move.style || 'Self-Defence',
            desc: move.desc || '',
            vid: viewerUrl,
            videoUrl: move.videoUrl,
            type: 'pdf'
          };
          navigation.navigate('PdfMove', { pdf: pdfData });
          
        } catch (err) {
          Alert.alert("Error", "Failed to open PDF: " + err.message);
        }
      } else if (move.vid) {
        setLoading(true);
        try {
          const fileInfo = await FileSystem.getInfoAsync(move.vid);
          if (!fileInfo.exists) {
            Alert.alert("Error", "PDF file not found");
            setLoading(false);
            return;
          }

          if (Platform.OS === 'ios') {
            await Sharing.shareAsync(move.vid, {
              mimeType: 'application/pdf',
              UTI: 'com.adobe.pdf'
            });
          } else {
            Alert.alert(
              "Open PDF",
              "Select a PDF viewer app, and click View PDF",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Continue",
                  onPress: async () => {
                    await Sharing.shareAsync(move.vid, {
                      mimeType: 'application/pdf',
                      dialogTitle: 'Open PDF with...'
                    });
                  }
                }
              ]
            );
          }
        } catch (err) {
          Alert.alert("Error", "Could not open PDF");
        } finally {
          setLoading(false);
        }
      }
    };


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
      if(mv === null) {
        setSelectedIds([]);
        navigation.navigate('AddMove', { move: null, mtype: ftype, mstyle: fstyle !== "allstyles" ? fstyle : 'Move List Title' })
      } else {
        setSelectedIds([]);
        navigation.navigate('AddMove', {move: mv, });
      }
    };
     

    const getYouTubeId = (url) => {
      try {
        if (!url || typeof url !== 'string') return "";
        if (url.length < 19) return "";
        if (!url.includes('/') && !url.includes('.')) return url;
        
        const regExp = /^.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
        const match = url.match(regExp);
        
        return (match && match[1]) ? match[1] : "";
        
      } catch (e) {
        return "";
      }
    };

    const checkVideo = (mv) => {
      try {
        if(mv.videourl && (mv.videoUrl.includes("youtube.com") || mv.videoUrl.includes("youtu.be"))) {
          setListMode(true);
          const mvData = {
            id: mv.id,
            Title: mv.title || "Video Move",
            Style: mv.style || "Self-Defence",
            Desc: mv.desc || "",
            Link: getYouTubeId(mv.videoUrl),
            Type: "video",
          };
          navigation.navigate('Featured', { video: mvData });
        } else {
          setListMode(true);
          navigation.navigate('Move', { video: mv });
        }
      } catch (e) {
        Alert.alert("Error", "Could not open video");
      }
    };


    const MoveCard = ({ item }) => (
      <TouchableOpacity 
        onLongPress={() => toggleSelect(item.id)}
        onPress={() => selectedIds.length > 0 ? toggleSelect(item.id) : ftype === "video" ? checkVideo(item) : ftype === "pdf" ? viewPdf(item) : navigation.navigate('Manual', { manual: item })}
        style={[styles.itemContainer, selectedIds.includes(item.id) && ftype ==="steps" ? styles.selectedItem : selectedIds.includes(item.id) && ftype === "video" ? styles.selectedItemVideo : selectedIds.includes(item.id) && ftype === "pdf" ? styles.selectedItemPdf : null]}>

        <View style={styles.card}>
          <View style={styles.titleBanner}>
            <Text numberOfLines={1} style={ftype === 'video' ? styles.titleTextVideo : ftype === "pdf" ? styles.titleTextPdf : styles.titleText}>{item.title}</Text>
          </View>
          <Image source={ ftype === "pdf" ? require('../assets/pdfplaceholder.png') : { uri: item.thumb || 'https://via.placeholder.com/150' }} style={ftype === "pdf" ? styles.thumbPdf : styles.thumbImage} />
          <View style={ftype === "steps" ? styles.pillRow : ftype === "pdf" ? styles.pillRowPdf : styles.pillRowVideo}>
            <Text style={ftype === 'video' ? styles.typePillVideo : ftype === "pdf" ? styles.typePillPdf : styles.typePill}>{item.type}</Text>
            <TouchableOpacity onPress={() => toggleListMode(item)} style={styles.editIcon}>
              <ImageBackground style={{ height: "100%", width: "100%", }} resizeMode='contain' source={ ftype === 'steps' ? require('../assets/editmanualicon.png') : ftype  === "video" ? require('../assets/editmoveicon.png') : require('../assets/editpdficon.png')}/>         
            </TouchableOpacity>             
          </View>
        </View>
      </TouchableOpacity>
    );


    const MyHeader = () => {
      if (smoves.length === 0) return null;
      const firstId = smoves[0].id;
      if (firstId === "v-all") return <Image source={require('../assets/movesdivider.png')} style={styles.redDivider} resizeMode='contain'/>;
      if (firstId === "s-all") return <Image source={require('../assets/manualsdivider.png')} style={styles.greenDivider} resizeMode='contain'/>;
      if (firstId === "p-all") return <Image source={require('../assets/pdfmovesdivider.png')} style={styles.blueDivider} resizeMode='contain'/>;
      return null;
    };


    if (loading && ftype=== 'video') return <ActivityIndicator size="large" color="#f30707" style={{marginTop:38, flex:1, transform: [{scale: 2.0}]}} />;
    if (loading && ftype=== 'steps') return <ActivityIndicator size="large" color="#0b6112" style={{marginTop:38, flex:1, transform: [{scale: 2.0}]}} />;
    if (loading && ftype=== 'pdf') return <ActivityIndicator size="large" color="#0b1461" style={{marginTop:38, flex:1, transform: [{scale: 2.0}]}} />;
    
    if (listmode) return (
      <ImageBackground style={{flex: 1, width: '100%', height: '100%', opacity: 1}} resizeMode='cover' source={require('../assets/mydojobg.jpg')}>
        <StatusBar barStyle="light-content"/>
        <SafeAreaView style={{ flex: 1, marginTop:25}}>
          <View style={{marginBottom: 19, paddingLeft: 5, paddingRight: 5, justifyContent: 'center', alignItems: 'center', opacity: 1}}>
            <ImageBackground style={ styles.icon } resizeMode='contain' imageStyle={{ opacity: 1 }} source={ftype=== "video" ? require('../assets/moveslisttitle.png') : ftype === "pdf" ? require('../assets/pdfmoveslisttitle.png') : require('../assets/manualstitle.png')} /> 
          </View>

          <View style={styles.myDojoHeader}>
            {ftype === "video" ? ( <Text style={{ color: '#ff8d8d', fontSize: 12, flex: 1, textTransform: 'uppercase' }}>{fstyle === "allstyles" ? `ALL ${ftype.toUpperCase()} MOVES` : "MOVE LIST TITLE: "+fstyle} </Text> )
              : ftype === "pdf" ? ( <Text style={{ color: '#9afff7', fontSize: 12, flex: 1, textTransform: 'uppercase' }}>{fstyle === "allstyles" ? `ALL ${ftype.toUpperCase()} MOVES` : "MOVE LIST TITLE: "+fstyle} </Text> ) 
              : ( <Text style={{ color: '#51ff00', fontSize: 12, flex: 1, textTransform: 'uppercase' }}>{fstyle === "allstyles" ? `ALL ${ftype.toUpperCase()} MOVES` : "MOVE LIST TITLE: "+fstyle} </Text> ) }
            <View style={{flexDirection:'row'}}>
              <TouchableOpacity onPress={() => { setListMode(false); setSelectedIds([]); }}>
                {ftype === "video" ? (<Text style={{color: '#ffd2d2', fontSize: 18, paddingLeft: 12}}>← BACK</Text>) : ftype === "pdf" ? (<Text style={{color: '#aed1f3', fontSize: 18, paddingLeft: 12}}>← BACK</Text>) : (<Text style={{color: '#00FF41', fontSize: 18, paddingLeft: 12}}>← BACK</Text>)}
              </TouchableOpacity>
    
              <TouchableOpacity onPress={() => toggleListMode(null)} style={ftype === "steps" ? styles.plusIcon : styles.plusIcon}>
                <ImageBackground style={{ height: "100%", width: "100%", }} resizeMode='contain' source={ftype === "steps" ? require('../assets/addmanualicon.png') : ftype === "pdf" ? require('../assets/addpdfmoveicon.png') : require('../assets/addmoveicon.png') }/>         
              </TouchableOpacity>
            </View>
          </View>
           
          <FlatList
            data={hmoves}
            extraData={[selectedIds, moves]}
            keyExtractor={(item, index) => item.id || index.toString()}
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: 57, flexGrow: 1, minHeight: 200 * Math.max(hmoves.length, 1) }}
            renderItem={({ item }) => (
              fstyle === "allstyles" ? (
                <View style={ftype == "steps" ? styles.sectionContainer : ftype === "pdf" ? styles.sectionContainerPdf : styles.sectionContainerVideo}>
                  <Text style={ftype === "steps" ? styles.sectionHeader : ftype === "pdf" ? styles.sectionHeaderPdf : styles.sectionHeaderVideo}>{item.style}</Text>
                    <FlatList
                       horizontal
                       data={item.data}
                       extraData={[selectedIds, moves]}
                       keyExtractor={m => m.id.toString()}
                       renderItem={({ item: move }) => <MoveCard item={move} />}
                       contentContainerStyle={{ paddingRight: 38, paddingLeft: 12, minWidth: (Dimensions.get('window').width * (item.data?.length || 1)) * 0.7, flexGrow: 1 }}
                       showsHorizontalScrollIndicator={false}
                     />
                 </View>
               ) : (<View style={styles.verticalWrapper}><MoveCard item={item} /></View>)
             )}
           />
     
           {selectedIds.length > 0 && (
             <View style={ftype === "steps" ? styles.batchBar  : ftype === "pdf" ? styles.batchBarPdf : styles.batchBarVideo}>
               <Text style={ftype === "steps" ? styles.batchText : ftype === "pdf" ? styles.batchTextPdf : styles.batchTextVideo}>{selectedIds.length} Selected</Text>
               <TouchableOpacity onPress={() => handleShare(selectedIds)} style={styles.shareIcon}>
                 <ImageBackground style={{height: "100%", width: "100%", }} imageStyle={{ opacity: 1 }} resizeMode='contain' source={ftype === "steps" ? require('../assets/sharemanualicon.png') : ftype === "pdf" ? require('../assets/sharepdfmoveicon.png') : require('../assets/sharemoveicon.png') }/>         
               </TouchableOpacity>
               <TouchableOpacity onPress={() => myDojoHandleDelete(selectedIds)} style={styles.myDojoDiscardIcon}>
                 <ImageBackground style={{height: "100%", width: "100%", }} imageStyle={{ opacity: 1 }} resizeMode='contain' source={require('../assets/discardicon.png') }/> 
               </TouchableOpacity>
               <TouchableOpacity onPress={() => setSelectedIds([])} style={styles.myDojoDeleteIcon}>
                 <ImageBackground style={{height: "100%", width: "100%", }} imageStyle={{ opacity: 1 }} resizeMode='contain' source={ftype === "steps" ? require('../assets/deletemanualicon.png') : ftype === "pdf" ? require('../assets/deletepdfmoveicon.png') : require('../assets/deletemoveicon.png') }/>         
               </TouchableOpacity>
             </View> ) }
        </SafeAreaView>
      </ImageBackground> );


    return (
     <ImageBackground style={styles.imgBackground } imageStyle={{ opacity: 1 }} resizeMode='cover' source={require('../assets/mydojostylesbg.jpg')}>
      <StatusBar barStyle="light-content"/>
      <SafeAreaView style={{flex: 1, marginTop: 7}}>
        <View style={{ marginBottom: 9, paddingLeft: 7, paddingRight: 7, opacity: 1, justifyContent: "center", alignItems: 'center'}}>
          <ImageBackground style={styles.icon} imageStyle={{ opacity: 1 }} resizeMode='contain' source={require('../assets/mydojostylestitle.png')} /> 
        </View>

        <View style={styles.header}>
           <Text style={styles.title}>MY DOJO MOVES LISTS</Text>
            <View style={{flexDirection:'row', alignItems:'center', justifyContent: 'center', marginBottom:5, height:38, width:"100%"}}>
              <TouchableOpacity onPress={() => navigation.navigate('AddMove', { move: null, mtype:"video", mstyle: null, })} style={styles.plusIcon}>
                <ImageBackground style={{ height:"100%", width:"100%", }} resizeMode='contain' source={require('../assets/addmoveicon.png')}/>         
              </TouchableOpacity> 
              <TouchableOpacity onPress={() => navigation.navigate('AddMove', { move: null, mtype:"steps", mstyle: null })} style={styles.plusIcon}>
                <ImageBackground style={{ height:"100%", width:"100%", }} resizeMode='contain' source={require('../assets/addmanualicon.png')}/>         
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate('AddMove', { move: null, mtype:"pdf", mstyle: null })} style={styles.plusIcon}>
                <ImageBackground style={{ height:"100%", width:"100%", }} resizeMode='contain' source={require('../assets/addpdfmoveicon.png')}/>         
              </TouchableOpacity>
              <TouchableOpacity onPress={handleImport} style={styles.importIcon}>
                <ImageBackground style={{ height:"100%", width:"100%",}} resizeMode='contain' source={require('../assets/importmoveicon.png')}/>         
              </TouchableOpacity>
              <TouchableOpacity onPress={showInstructions} style={styles.infoIcon}>
                <ImageBackground style={{ height:"100%", width:"100%",}} resizeMode='contain' source={require('../assets/mydojostylesinfoicon.png')}/>         
              </TouchableOpacity>
            </View>
        </View>

        {smoves.length > 0 ? (
          <FlatList
           data={smoves}
           extraData={moves}
           keyExtractor={item => item.id}
           ListHeaderComponent={MyHeader}
           ItemSeparatorComponent={({ leadingItem }) => {
            const index = smoves.findIndex(m => m.id === leadingItem.id);
            if (index > 0 && smoves[index]?.type === 'video' && index+1 < smoves.length && smoves[index+1]?.id === 's-all') {
              return <Image source={require('../assets/manualsdivider.png')} style={styles.greenDivider} resizeMode='contain'/>;
            }
            if (index > 0 && smoves[index]?.type !== 'pdf' && index+1 < smoves.length && smoves[index+1]?.id === 'p-all') {
              return <Image source={require('../assets/pdfmovesdivider.png')} style={styles.blueDivider} resizeMode='contain'/>;
            }
            return <View style={styles.smallGap} />;
           }}
           renderItem={({ item }) => (
            <View style={styles.card}>
              { item && item.style && item.type === "video" ? 
                ( <TouchableOpacity
                  style={{ width: '79%', height: 43 }}
                  onPress={() => { setHMoves(getMoves(item.style, item.type, moves)); setFStyle(item.style); setType(item.type); setListMode(true);}}>
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
                  : item && item.style && item.type==="steps" ? ( <TouchableOpacity
                    style={{ width: '79%', height: 43 }}
                    onPress={() => { setType(item.type); setFStyle(item.style); setHMoves(getMoves(item.style, item.type, moves)); setListMode(true); }}>
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
                  : item && item.style && item.type==="pdf" && ( <TouchableOpacity
                    style={{ width: "79%", height: 43 }}
                    onPress={() => { setType(item.type); setFStyle(item.style); setHMoves(getMoves(item.style, item.type, moves)); setListMode(true); }}>
                    <ImageBackground style={{flex: 1, justifyContent: 'center', alignItems: 'center'}} resizeMode='stretch' source={require('../assets/bluebtnbg.png')}>
                      {item.id === 'p-all' ? 
                        ( <Image
                          resizeMode="contain"
                          style={{height: "45%", width: "57%", alignSelf: "center",}}
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
            <Text style={styles.infoText}>Click one of the 3 + icons to add moves or use the import icon to import moves. You can share moves after adding or importing.</Text>
          </View>
        )}
      </SafeAreaView>
     </ImageBackground>
    );
}


const styles = StyleSheet.create({
imgBackground: { flex: 1, width: "100%", height: "100%" },
sectionContainer: { marginBottom: 25, paddingLeft: 10, backgroundColor: 'rgba(0, 255, 65, 0.1)', opacity: 1 },
sectionContainerVideo: { marginBottom: 25, paddingLeft: 10, backgroundColor: 'rgba(255, 0, 0, 0.1)', opacity: 1 },
sectionContainerPdf: { marginBottom: 25, paddingLeft: 10, backgroundColor: 'rgba(0, 0, 255, 0.1)', opacity: 1 },
sectionHeader: { color: '#33fc4d', fontSize: 14, fontWeight: 'bold', marginBottom: 9, textTransform: 'uppercase', letterSpacing: 1, backgroundColor: 'rgba(37, 37, 37, 0.76)', alignSelf: "flex-start", opacity: 1, borderRadius: 7, },
sectionHeaderVideo: { color: '#701210', fontSize: 14, fontWeight: 'bold', marginBottom: 9, textTransform: 'uppercase', letterSpacing: 1, backgroundColor: 'rgba(255, 255, 253, 0.91)', alignSelf: "flex-start", opacity: 1, borderRadius: 7, },
sectionHeaderPdf: { color: '#131375', fontSize: 14, fontWeight: 'bold', marginBottom: 9, textTransform: 'uppercase', letterSpacing: 1, backgroundColor: 'rgba(247, 247, 223, 0.9)', alignSelf: "flex-start", opacity: 1, borderRadius: 7, },
itemContainer: { width: width * 0.7, marginRight: 15, backgroundColor: 'rgba(0,0,0,0.8)', borderRadius: 15, borderWidth: 1, borderColor: '#333', overflow: 'hidden', marginBottom:12, opacity: 1},
verticalWrapper: { width: width * 0.9, alignSelf: 'center', marginBottom: 15 },
myDojoDiscardIcon: {height: 49, width: 49, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
selectedItem: { borderColor: '#8efaa9', borderWidth: 2, backgroundColor: 'rgba(31, 221, 79, 0.6)' },
selectedItemVideo: { borderColor: '#eb2121', borderWidth: 2, backgroundColor: 'rgba(250, 85, 85, 0.6)' },
selectedItemPdf: { borderWidth: 2, borderColor: '#1e0899', backgroundColor: 'rgba(97, 71, 245, 0.6)' },
titleBanner: {width: '100%', padding: 5, borderRadius: 5, marginTop: 2 },
titleText: { textAlign: 'center', fontSize: 13, fontWeight: 'bold', color: '#51fc42', alignSelf: "flex-start" },
titleTextVideo: { textAlign: 'center', fontSize: 13, fontWeight: 'bold', color: '#fcd1d1', alignSelf: "flex-start"},
titleTextPdf: { color: '#6b8cff', fontWeight: 'bold', fontSize: 13, textAlign: "center", alignSelf: "flex-start" },
thumbImage: { width: "100%", height: 152, backgroundColor: '#1a1a1a', justifyContent: 'center', alignItems: 'center' },
thumbPdf: { width: "100%", height: 76, resizeMode: 'contain', backgroundColor: '#1a1a1a', justifyContent: 'center', alignItems: 'center' },
myDojoDeleteIcon: {height: 49, width: 49, borderRadius: 0,  alignItems: 'center', justifyContent: 'center' },
pillRow: { backgroundColor: 'rgba(0, 43, 0, 0.5)',flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 3, marginTop: 8, borderRadius: 9, opacity: 1 },
pillRowVideo: { backgroundColor: 'rgba(43, 0, 0, 0.5)', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 3, marginTop: 7, borderRadius: 9, opacity: 1},
pillRowPdf: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 5, backgroundColor: 'rgba(8, 35, 153, 0.3)', paddingHorizontal: 3, borderRadius: 9, marginTop: 8, opacity: 1 },
typePill: { backgroundColor: 'rgba(203, 212, 206, 0.38)', color: '#29fd5e', fontSize: 10, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 5 },
typePillVideo: { backgroundColor: 'rgba(247, 190, 170, 0.38)', color: '#d8414d', fontSize: 10, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 5 },
typePillPdf: { color: '#6b8cff', fontSize: 10, fontWeight: 'bold' },
batchBar: { position: 'absolute', bottom: 49, left: 20, right: 20, flexDirection: 'row', backgroundColor: '#1a1a1a', padding: 15, borderRadius: 30, alignItems: 'center', justifyContent: 'space-around', borderWidth: 1, borderColor: '#00FF41', elevation: 10 },
batchBarVideo: { position: 'absolute', bottom: 49, left: 20, right: 20, flexDirection: 'row', backgroundColor: '#1a1a1a', padding: 15, borderRadius: 30, alignItems: 'center', justifyContent: 'space-around', borderWidth: 1, borderColor: '#b30000', elevation: 10 },
batchBarPdf: { position: 'absolute', bottom: 49, left: 20, right: 20, flexDirection: 'row', backgroundColor: '#1a1a1a', padding: 15, borderRadius: 30, alignItems: 'center', justifyContent: 'space-around', borderWidth: 1, borderColor: '#0505c2', elevation: 10 },
batchText: { color: '#00FF41', fontWeight: 'bold'},
batchTextVideo: { color: '#fa3030', fontWeight: 'bold'},
batchTextPdf: { color: '#2f2ff8', fontWeight: 'bold'},
shareIcon: { height: 49, width: 49, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
container: { flex: 1, backgroundColor: '#c2cdd4' },
banner: { width: '100%', height: 57, borderRadius: 12, marginBottom: 10 },
header: { flexDirection: 'column', width: "95%", minHeight: 83, backgroundColor: 'rgba(195, 209, 223, 0.4)', borderWidth: 1, borderColor: '#c2cdd4',justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginBottom: 19, },
myDojoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, backgroundColor: 'rgba(0,0,0,0.76)', opacity: 1 },
title: { fontSize: 17, fontWeight: 'bold', color: '#420105', height: 38, width: '100%', textAlign: 'center', marginBottom: 2 },
infoText: { fontSize: 14, fontWeight: 'bold', color: '#fc2626', minHeight: 76, width: '94%', textAlign: 'center', marginTop: -95, paddingHorizontal: 19, backgroundColor: 'rgba(0,0,0,0.5)' },
icon: { height: 60, width: '90%', alignSelf: 'center' },
card: { marginHorizontal: 12, marginVertical: 5, alignItems: 'center', borderRadius: 10, width: "100%", opacity: 1 },
cardText: { fontSize: 16, fontWeight: 'bold', color: '#bddff3', paddingHorizontal: 5,},
greenDivider: {width: '90%', height: 43, alignSelf: 'center',marginVertical: 15,shadowColor: '#c9f5d5', shadowOffset: { width: 0, height: 0 },shadowOpacity: 0.5,shadowRadius: 10, backgroundColor: 'rgba(195, 209, 223, 0.4)', opacity: 1},
redDivider: {width: '90%',height: 43, alignSelf: 'center', marginVertical: 15, shadowColor: '#f8d7d7', shadowOffset: { width: 0, height: 0 },shadowOpacity: 0.5,shadowRadius: 10, backgroundColor: 'rgba(195, 209, 223, 0.4)', opacity: 1},
blueDivider: { width: '90%', height: 43, alignSelf: "center", marginVertical: 15, shadowColor: '#6b8cff', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 10, backgroundColor: 'rgba(195, 209, 223, 0.4)', opacity: 1 },
smallGap: {height: 12,},
cardInternal:{ padding: 10, backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 10 },
plusIcon: { height: 47, width: 47, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 4, marginLeft: 12, marginBottom: 4, opacity: 1},
editIcon: { height: 47, width: 47, borderRadius: 4, marginLeft: 12, marginBottom: 4, opacity: 1},
infoIcon: { height: 45, width: 45, marginLeft: 16, marginBottom: 9,},
importIcon: {height: 61, width: 57, borderRadius: 9, marginLeft: 12, marginBottom: 3},
});