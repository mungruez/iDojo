import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, StyleSheet, Alert, ImageBackground, KeyboardAvoidingView, Platform, StatusBar, FlatList, Dimensions, BackHandler, ActivityIndicator } from 'react-native';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { fighters as initialStaticFighters } from '../data/fighters';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNetInfo } from "@react-native-community/netinfo";
import { useNavigation } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { zip, unzip } from 'react-native-zip-archive';
import * as ImagePicker from 'expo-image-picker';
import { useAudioPlayer } from 'expo-audio';
import { useAudioPlayer } from 'expo-audio';
import * as Sharing from 'expo-sharing';
import Fighter from './Fighter';

const { height, width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.76;
  
const ksoundFile = require('../assets/woosh.mp3');

export default function FightersList() {
  const [mode, setMode] = useState("list");
  const [allFighters, setAllFighters] = useState([]);
  const [currentFighter, setCurrentFighter] = useState(null); 
  const [hFighters, setHFighters] = useState([]);

  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isPicking, setIsPicking] = useState(false);
  const isPickingRef = useRef(false);
  const isLoadingRef = useRef(false);
  const isOffline = useNetInfo().isConnected === false;

  const [fighterId, setFighterId] = useState(null);
  const [fighterName, setFighterName] = useState("");
  const [fighterStyle, setFighterStyle] = useState("");
  const [fighterConc, setFighterConc] = useState("");
  const [fighterDescList, setFighterDescList] = useState([""]); 
  const [fighterMoves, setFighterMoves] = useState([]);
  const [activeAvatarUri, setActiveAvatarUri] = useState(null);

  const navigation = useNavigation();
  

  const kplayer = useAudioPlayer(ksoundFile, (kplayer) => {
    kplayer.loop = false; 
  });


  const navKSound = (item) => {
    try {
      if(kplayer) {
        kplayer.seekTo(0);
        kplayer.play();
      }
    } catch (error) {}

    setCurrentFighter(item);
    setMode("view");
  };


  const loadFighters = async () => {
    try {
      if (isLoadingRef.current) return; 
      isLoadingRef.current = true;
      setLoading(true);

      const fileUri = `${FileSystem.documentDirectory}fighters_custom.json`;
      const trackingUri = `${FileSystem.documentDirectory}.fighters_user_initialized`;
      
      const info = await FileSystem.getInfoAsync(fileUri);
      const trackingInfo = await FileSystem.getInfoAsync(trackingUri);
    
      if (!info.exists && !trackingInfo.exists) {
        await FileSystem.writeAsStringAsync(fileUri, JSON.stringify([]));
        await FileSystem.writeAsStringAsync(trackingUri, "true");
      }

      let customFighters = [];
      const currentInfo = await FileSystem.getInfoAsync(fileUri);
      if (currentInfo.exists) {
        const content = await FileSystem.readAsStringAsync(fileUri);
        customFighters = JSON.parse(content || "[]");
        customFighters = customFighters.filter(f => f && f.id && f.name && f.name.trim() !== "");
      }

      const mappedStaticBundle = initialStaticFighters.map((item, index) => ({
        ...item,
        id: `static_fighter_${index}`,
        isStaticBundle: true
      }));

      const masterList = [...mappedStaticBundle, ...customFighters];
      setAllFighters(masterList);
      
      const query = searchQuery?.trim()?.toLowerCase();
      if (query) {
        const filtered = masterList.filter(f => 
          f.name?.toLowerCase().includes(query) ||
          f.style?.toLowerCase().includes(query) ||
          f.desc?.some(d => d?.toLowerCase().includes(query)) ||
          f.moves?.some(m => m.title?.toLowerCase().includes(query) || m.desc?.toLowerCase().includes(query))
        );
        setHFighters(filtered);
      } else {
        setHFighters(masterList);
      }

      setTimeout(async () => {
        try {
          const baseDir = `${FileSystem.documentDirectory}fighters/`;
          const dirInfo = await FileSystem.getInfoAsync(baseDir);
          if (dirInfo.exists) {
            const localFolders = await FileSystem.readDirectoryAsync(baseDir);
            const validIds = customFighters.map(f => String(f.id).trim());
            for (const folderId of localFolders) {
              if (!validIds.includes(String(folderId).trim())) {
                await FileSystem.deleteAsync(`${baseDir}${folderId}/`, { idempotent: true });
              }
            }
          }
        } catch (gcError) { }
      }, 1500);

    } catch (e) {
      Alert.alert("Load Failed", e.message || "Failed to load Fighter files.");
    } finally {
      isLoadingRef.current = false;
      setLoading(false);
    }
  };


  const populateForEdit = (fighter, activeStyle) => {
    if (!fighter) {
      setSelectedIds([]); setFighterName(""); setFighterConc(""); setActiveAvatarUri(null);
      setFighterStyle(""); setFighterId(Date.now().toString()); setFighterDescList([""]); setFighterMoves([]);
    } else {
      setCurrentFighter(fighter); setFighterId(fighter.id); setFighterName(fighter.name);
      setFighterStyle(fighter.style); setFighterConc(fighter.conc || "");
      setActiveAvatarUri(typeof fighter.avatar === 'string' ? fighter.avatar : null);
      setFighterDescList(Array.isArray(fighter.desc) ? [...fighter.desc] : [""]);
      setFighterMoves(Array.isArray(fighter.moves) ? [...fighter.moves] : []);
    }
    setMode("add");
  };



  const deleteFighters = async (idsFromArg = []) => {
    const actualIds = Array.isArray(idsFromArg) && idsFromArg.length > 0 ? idsFromArg : (selectedIds || []);
    const cleanIdsToDelete = actualIds.map(id => String(id).trim());
    if (cleanIdsToDelete.length === 0) return;

    const staticSelections = cleanIdsToDelete.filter(id => id.startsWith('static_fighter_'));
    if (staticSelections.length > 0) {
      Alert.alert("Permission Blocked", "Built-in legendary fighter files cannot be removed from your catalog roster.");
      return;
    }

    const isDeletingAll = actualIds.length === hFighters.length;
    Alert.alert(
      isDeletingAll ? "Purge Catalog Items" : "Delete Selection",
      isDeletingAll ? "Remove all custom entries under this style column?" : `Remove ${cleanIdsToDelete.length} custom fighter profile(s)?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const customFightersOnly = allFighters.filter(f => !f.isStaticBundle);
              const staticFightersOnly = allFighters.filter(f => f.isStaticBundle);

              const itemsToDelete = customFightersOnly.filter(f => cleanIdsToDelete.includes(String(f.id).trim()));
              let errfound = false;

              for (const fighterItem of itemsToDelete) {
                const folderUri = `${FileSystem.documentDirectory}fighters/${fighterItem.id}/`;
                try {
                  await FileSystem.deleteAsync(folderUri, { idempotent: true });
                } catch (err) {
                  if (!errfound) {
                    errfound = true;
                    Alert.alert("Storage Error", "Could not remove trailing media files.");
                  }
                }
              }

              const updatedCustomList = customFightersOnly.filter(f => !cleanIdsToDelete.includes(String(f.id).trim()));
              const fileUri = `${FileSystem.documentDirectory}fighters_custom.json`;
              await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(updatedCustomList));

              if (updatedCustomList.length === 0) {
                const trackingUri = `${FileSystem.documentDirectory}.fighters_user_initialized`;
                await FileSystem.writeAsStringAsync(trackingUri, "true");
              }

              const nextCombinedMaster = [...staticFightersOnly, ...updatedCustomList];
              setAllFighters(nextCombinedMaster);
              setHFighters(nextCombinedMaster);
              setSelectedIds([]);
              setCurrentFighter(null);

              const remainingItems = nextCombinedMaster.filter(f => 
                fighterStyle === "allstyles" || f.style === fighterStyle
              );

              if (isDeletingAll || remainingItems.length < 1) {
                setMode('main');
              }
            } catch (e) {
              Alert.alert("Delete Error", e.message || "Failed to purge database selections.");
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  
  
  const shareFighters = async (fighterIds) => {
    if (isOffline) {
      Alert.alert("No Internet", "An active internet profile connection is required to share fighters.");
      return;
    }
    if (!fighterIds?.length) return;
    const cleanSharableIds = fighterIds.filter(id => !id.startsWith('static_fighter_'));
    if (cleanSharableIds.length === 0) {
      Alert.alert("Action Blocked", "Built-in core fighters cannot be compressed into external sharing packages.");
      return;
    }

    let shareDir = null;
    let zipPath = null;
    let shareSuccess = false;

    try {
      setLoading(true);
      shareDir = `${FileSystem.cacheDirectory}fighter_export_${Date.now()}/`;
      zipPath = `${FileSystem.cacheDirectory}iDojo_Fighters_${Date.now()}.zip`;

      await FileSystem.deleteAsync(shareDir, { idempotent: true });
      await FileSystem.makeDirectoryAsync(shareDir, { intermediates: true });

      const customFightersOnly = allFighters.filter(f => !f.isStaticBundle);
      const itemsToShare = customFightersOnly.filter(f => cleanSharableIds.includes(f.id));

      for (let i = 0; i < itemsToShare.length; i++) {
        await FileSystem.makeDirectoryAsync(`${shareDir}fighter_${i}/`, { intermediates: true });
      }

      const exportPromises = itemsToShare.map(async (fighter, fIdx) => {
        const fCopy = { ...fighter, moves: fighter.moves?.map(m => ({ ...m })) || [] };
        const targetDir = `${shareDir}fighter_${fIdx}/`;

        if (fCopy.avatar && typeof fCopy.avatar === 'string' && fCopy.avatar.startsWith('file://')) {
          const avatarName = `avatar_${fCopy.avatar.split('/').pop()}`;
          await FileSystem.copyAsync({ from: fCopy.avatar, to: `${targetDir}${avatarName}` });
          fCopy.avatar = avatarName;
        }

        for (let mIdx = 0; mIdx < fCopy.moves.length; mIdx++) {
          const move = fCopy.moves[mIdx];
          if (move.img && typeof move.img === 'string' && move.img.startsWith('file://')) {
            const moveFileName = `move_${mIdx}_${move.img.split('/').pop()}`;
            await FileSystem.copyAsync({ from: move.img, to: `${targetDir}${moveFileName}` });
            move.img = moveFileName;
          }
        }

        await FileSystem.writeAsStringAsync(`${targetDir}fighter.json`, JSON.stringify(fCopy));
        return fCopy;
      });

      await Promise.all(exportPromises);

      const manifest = { app: 'iDojo_Fighters', version: 1, count: itemsToShare.length, exportDate: new Date().toISOString() };
      await FileSystem.writeAsStringAsync(`${shareDir}manifest.json`, JSON.stringify(manifest));

      const nakedSource = Platform.OS === 'android' ? shareDir.replace('file://', '').replace(/\/$/, '') : shareDir;
      const nakedTarget = Platform.OS === 'android' ? zipPath.replace('file://', '') : zipPath;

      await zip(nakedSource, nakedTarget);
      await Sharing.shareAsync(zipPath, { dialogTitle: `Share ${itemsToShare.length} Fighter(s)`, mimeType: 'application/zip' });
      shareSuccess = true;
    } catch (e) {
      Alert.alert('Share Error', e.message || 'Compression pipeline breakdown.');
    } finally {
      setLoading(false);
      if (shareSuccess) setSelectedIds([]);
      if (shareDir) try { await FileSystem.deleteAsync(shareDir, { idempotent: true }); } catch (e) {}
      if (zipPath) try { await FileSystem.deleteAsync(zipPath, { idempotent: true }); } catch (e) {}
    }
  };


  
  const handleImportFighters = async () => {
    let extractDir = null;
    let tempZipPath = null;

    try {
      const res = await DocumentPicker.getDocumentAsync({ 
        type: ['application/zip', 'application/x-zip-compressed'],
        copyToCacheDirectory: true 
      });
      
      if (res.canceled) return;
      setLoading(true);
      
      const asset = res.assets?.[0];
      if (!asset) throw new Error("No file selected");
      if (!asset.uri) throw new Error("Invalid file URI");
      if (!asset.name?.toLowerCase().endsWith('.zip')) {
        throw new Error("Please select a valid .zip export file.");
      }
      
      const importId = Date.now().toString();
      extractDir = `${FileSystem.documentDirectory}imported_fighters_${importId}/`;
      tempZipPath = `${FileSystem.cacheDirectory}import_fighter_temp_${importId}.zip`;
      
      await FileSystem.copyAsync({ from: asset.uri, to: tempZipPath });
      await FileSystem.makeDirectoryAsync(extractDir, { intermediates: true });
      
      const nakedZip = Platform.OS === 'android' ? tempZipPath.replace('file://', '') : tempZipPath;
      const nakedDest = Platform.OS === 'android' ? extractDir.replace('file://', '').replace(/\/$/, '') : extractDir;
      
      await unzip(nakedZip, nakedDest);
      
      let manifest = { count: 1 };
      try {
        const manifestContent = await FileSystem.readAsStringAsync(`${extractDir}manifest.json`);
        manifest = JSON.parse(manifestContent);
      } catch (e) {
        Alert.alert("Error Importing", "Error in manifest file")
      }
      
      const rawFighters = [];
      const fighterDirs = manifest.count > 1 
        ? Array.from({length: manifest.count}, (_, i) => `fighter_${i}/`) 
        : [''];
      
      for (const dir of fighterDirs) {
        const fighterPath = `${extractDir}${dir}fighter.json`;
        const info = await FileSystem.getInfoAsync(fighterPath);
        if (!info.exists) continue;
        
        const content = await FileSystem.readAsStringAsync(fighterPath);
        let fighterItem;
        try {
          fighterItem = JSON.parse(content);
        } catch (parseError) {
          continue;
        }

        if (!fighterItem || typeof fighterItem !== 'object') continue;
        if (!fighterItem.name?.trim() || !fighterItem.style?.trim()) continue;
        
        const fDir = `${extractDir}${dir}`;
        const fixFilePath = (oldPath) => {
          if (!oldPath || typeof oldPath !== 'string' || oldPath.startsWith('http') || !oldPath.includes('/')) {
            if (oldPath && typeof oldPath === 'string' && !oldPath.startsWith('http')) {
              return `${fDir}${oldPath}`;
            }
            return oldPath;
          }
          const fileName = oldPath.split('/').pop();
          return `${fDir}${fileName}`;
        };
        
        fighterItem.avatar = fixFilePath(fighterItem.avatar);
        fighterItem.moves?.forEach((move) => {
          if (!move) return;
          move.img = fixFilePath(move.img);
        });
        
        rawFighters.push(fighterItem);
      }
      
      if (rawFighters.length === 0) {
        throw new Error('No valid fighters found in zip file');
      }
      
      const finalFighters = rawFighters.map((fighter, index) => ({
        ...fighter,
        id: `fighter_${importId}_${index}_${Math.random().toString(36).substring(2, 6)}`,
        isStaticBundle: false
      }));

      const copyImportedMedia = async (fighter) => {
        const permanentDirUri = `${FileSystem.documentDirectory}fighters/${fighter.id}/`;
        await FileSystem.makeDirectoryAsync(permanentDirUri, { intermediates: true });

        const migrateFile = async (sourcePath, destName) => {
          if (!sourcePath || typeof sourcePath !== 'string' || sourcePath.startsWith('http') || sourcePath.startsWith('asset://')) return sourcePath;
          const sourceExt = sourcePath.includes('.') ? `.${sourcePath.split('.').pop().toLowerCase()}` : '.png';
          const destUri = `${permanentDirUri}${destName}${sourceExt}`;
          try {
            await FileSystem.copyAsync({ from: sourcePath, to: destUri });
            return destUri;
          } catch (err) {
            console.log('Import file shift error:', err.message);
            return null;
          }
        };

        if (fighter.avatar) {
          const freshAvatar = await migrateFile(fighter.avatar, 'idojo_avatar');
          if (freshAvatar) fighter.avatar = freshAvatar;
        }

        if (Array.isArray(fighter.moves)) {
          for (const move of fighter.moves) {
            if (!move || !move.img) continue;
            const freshMoveImg = await migrateFile(move.img, `idojo_fighter_move_${move.id}`);
            if (freshMoveImg) move.img = freshMoveImg;
          }
        }
      };

      for (const fighter of finalFighters) {
        await copyImportedMedia(fighter);
      }
      
      const customFightersOnly = allFighters.filter(f => !f.isStaticBundle);
      const staticFightersOnly = allFighters.filter(f => f.isStaticBundle);
      const updatedCustomList = [...customFightersOnly, ...finalFighters];
      const fileUri = `${FileSystem.documentDirectory}fighters_custom.json`;
      const trackingUri = `${FileSystem.documentDirectory}.fighters_user_initialized`;
      await FileSystem.writeAsStringAsync(trackingUri, "true");
      await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(updatedCustomList));
      const nextCombinedMaster = [...staticFightersOnly, ...updatedCustomList];
      setAllFighters(nextCombinedMaster);
      setHFighters(nextCombinedMaster);
      Alert.alert('Success', `${finalFighters.length} fighter(s) imported!`);
    } catch (e) {
      Alert.alert('Import Failed', e.message || 'Failed to extract custom archive package.');
    } finally {
      setLoading(false);
      if (extractDir) try { await FileSystem.deleteAsync(extractDir, { idempotent: true }); } catch (err) {}
      if (tempZipPath) try { await FileSystem.deleteAsync(tempZipPath, { idempotent: true }); } catch (err) {}
    }
  };



  useFocusEffect(
    useCallback(() => {
      if(mode === "list") loadFighters();
    }, [mode])
  );



  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (mode === 'add') {
        if (isPickingRef.current || isPicking) return true;
        if (isLoadingRef.current) return true;
        setMode('list');
        return true;
      }

      if (mode === 'view') {
        if (isPickingRef.current || isPicking) return true;
        if (isLoadingRef.current) return true;
        setCurrentFighter(null);
        setMode('list');
        return true;
      }
    
      setSelectedIds([]);
      setMode('list');
      return false;
    });
    return () => backHandler.remove();
  }, [mode, isPicking, loading]);



  const handleSaveFighterData = async (newFighterPayload) => {
    try {
      if (isLoadingRef.current) return;
      isLoadingRef.current = true;
      if (!loading) setLoading(true);

      const incomingFighters = Array.isArray(newFighterPayload) ? newFighterPayload : [newFighterPayload];
      const currentCustomFighters = allFighters.filter(f => !f.isStaticBundle);
      const staticBundleItems = allFighters.filter(f => f.isStaticBundle);
      
      incomingFighters.forEach(itemData => {
        const index = currentCustomFighters.findIndex(f => String(f.id).trim() === String(itemData.id).trim());
        if (index > -1) {
          currentCustomFighters[index] = itemData;
        } else {
          currentCustomFighters.push(itemData);
        }
      });

      const nextCombinedMaster = [...staticBundleItems, ...currentCustomFighters];
      const fileUri = `${FileSystem.documentDirectory}fighters_custom.json`;
      const trackingUri = `${FileSystem.documentDirectory}.fighters_user_initialized`;
      await FileSystem.writeAsStringAsync(trackingUri, "true");
      await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(currentCustomFighters));
      setAllFighters(nextCombinedMaster);
      setHFighters(nextCombinedMaster);
      setMode('list');
    } catch (e) {
      Alert.alert('Save Failed', e.message);
    } finally {
      isLoadingRef.current = false;
      setLoading(false);
    }
  };


  const getMediaFileExtension = (uri) => {
    if (!uri || typeof uri !== 'string') return '.png';
    const extMatch = uri.match(/\.[0-9a-z]+$/i);
    if (extMatch) return extMatch[0].toLowerCase();
    return '.png';
  };


  const addDescLine = () => setFighterDescList([...fighterDescList, ""]);
  const removeDescLine = (idx) => setFighterDescList(fighterDescList.filter((_, i) => i !== idx));
  const updateDescLine = (idx, val) => setFighterDescList(fighterDescList.map((d, i) => i === idx ? val : d));
  const addMoveItem = () => { setFighterMoves([...fighterMoves, { id: Date.now().toString() + Math.random().toString(36).substring(2, 5), title: "", img: null, desc: "" }]); };
  const removeMoveItem = (id) => setFighterMoves(fighterMoves.filter(m => m.id !== id));
  const updateMoveItem = (id, field, val) => setFighterMoves(fighterMoves.map(m => m.id === id ? { ...m, [field]: val } : m));
  const toggleSelect = (id) => { setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]); };
  

  const pickFighterMedia = async (target, moveId = null) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Gallery access is required!");
      return;
    }

    try {
      isPickingRef.current = true;
      setIsPicking(true);
      const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: false, quality: 1.0 });
      if (res.canceled || !res.assets?.[0]?.uri) return;
      const pickedUri = res.assets[0].uri;
      const ext = getMediaFileExtension(pickedUri);
      const cacheDir = `${FileSystem.cacheDirectory}fighter-cache/`;
      await FileSystem.makeDirectoryAsync(cacheDir, { intermediates: true });
      const cachedUri = `${cacheDir}${Date.now()}${ext}`;
      await FileSystem.copyAsync({ from: pickedUri, to: cachedUri });

      if (target === 'avatar') {
        setActiveAvatarUri(cachedUri);
      } else if (target === 'move' && moveId) {
        updateMoveItem(moveId, 'img', cachedUri);
      }
    } catch (err) {
      Alert.alert("Picker Error", "Could not copy selected asset.");
    } finally {
      isPickingRef.current = false;
      setIsPicking(false);
    }
  };


  
  const renderMoveFormItem = (move) => (
    <View key={move.id} style={styles.sectionContainerBlock}>
      <Text style={styles.label}>Signature Move Title</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter Move Name..."
        placeholderTextColor="#726b6b"
        value={move.title}
        onChangeText={(text) => updateMoveItem(move.id, 'title', text)}
      />

      <Text style={styles.label}>Signature Move Image</Text>
      <View style={styles.mediaPickerRow}>
        <TouchableOpacity onPress={() => pickFighterMedia('move', move.id)} style={styles.stepImgContainer}>
          {move.img ? <Image source={{ uri: move.img }} style={styles.stepImg} /> : <ImageBackground style={{ alignSelf: 'center', height: 77, width: 77, }} resizeMode='contain' source={require('../assets/uploadfighterimagebg.png')} />}
        </TouchableOpacity>
        { move.img && <Text style={styles.fileLoadedIndicator}>✅ Image Uploaded</Text> }
      </View>

      <Text style={styles.label}>Move Breakdowns / Technical Details</Text>
      <TextInput
        style={[styles.input, styles.descInput]}
        placeholder="Explain technical details or stance secrets..."
        placeholderTextColor="#726b6b"
        value={move.desc}
        onChangeText={(text) => updateMoveItem(move.id, 'desc', text)}
        multiline
        numberOfLines={3}
      />

      <TouchableOpacity onPress={() => removeMoveItem(move.id)} style={styles.removeSignatureMoveBtn}>
        <ImageBackground style={{ height: 67, width: "100%", opacity: 1, borderRadius: 15 }} imageStyle={{ opacity: 1, borderRadius:15 }} resizeMode='cover' source={require('../assets/addsignaturemovebtn.png')} />
      </TouchableOpacity>
    </View>
  );



  if ( mode === "view" ) {
    return <Fighter fighter={currentFighter} offset={0} />;
  }



  if (mode === 'add') {
    return (
      <ImageBackground source={require('../assets/fightersbackground.jpeg')} style={styles.imgBackground} resizeMode='cover' >
        <StatusBar barStyle="light-content" />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.formHeaderTitleRow}>
              <ImageBackground style={styles.iconAM} resizeMode='contain' source={currentFighter ? require('../assets/editchaptericon.png') : require('../assets/addchaptericon.png')} /> 
            </View>

            <TouchableOpacity onPress={() => { if (isPicking || isPickingRef.current) return; setCurrentFighter(null); setSelectedIds([]); setFighterName(""); setFighterConc(""); setActiveAvatarUri(null); setFighterStyle(""); setFighterDescList([""]); setFighterMoves([]); setMode('list'); }} style={styles.discardBtn}>
              <ImageBackground style={{ alignSelf:'center', height:67, width:"100%", opacity: 1}} imageStyle={{ opacity: 1 }} resizeMode='contain' source={require('../assets/discardicon.png')}/>
              <Text style={styles.discardText}>❌ CANCEL</Text>
            </TouchableOpacity>

            <ScrollView style={styles.formScroller} contentContainerStyle={{ paddingBottom: 120 }}>
              <Text style={styles.label}>Fighter Name</Text>
              <TextInput style={styles.input} placeholder="e.g. Fedor Emelianenko" placeholderTextColor="#726b6b" value={fighterName} onChangeText={setFighterName} />

              <Text style={styles.label}>Fighting Style / Martial Art Class</Text>
              <TextInput style={styles.input} placeholder="e.g. Sambo" placeholderTextColor="#726b6b" value={fighterStyle} onChangeText={setFighterStyle} />

              <Text style={styles.label}>Fighter Avatar Profile Image</Text>
              <View style={styles.mediaPickerRow}>
                <TouchableOpacity onPress={() => pickFighterMedia('avatar')} style={styles.stepImgContainer}>
                  {activeAvatarUri ? <Image source={{ uri: move.avatar }} style={styles.stepImg} /> : <ImageBackground style={{ alignSelf: 'center', height: 77, width: 77, }} resizeMode='contain' source={require('../assets/uploadfighterimagebg.png')} />}
                </TouchableOpacity>
                {activeAvatarUri && <Text style={styles.fileLoadedIndicator}>✅ Profile Photo Loaded</Text>}
              </View>

              <Text style={styles.label}>Legendary Quotes & Wisdom lines</Text>
              { fighterDescList.map((descLine, dIdx) => (
                <View key={dIdx} style={styles.dynamicLineRow}>
                  <TextInput
                    style={[styles.input, { flex: 1, marginBottom: 0 }]}
                    placeholder={`Quote / Descriptor Line #${dIdx + 1}`}
                    placeholderTextColor="#726b6b"
                    value={descLine}
                    onChangeText={(text) => updateDescLine(dIdx, text)}
                  />
                  {fighterDescList.length > 1 && (
                    <TouchableOpacity onPress={() => removeDescLine(dIdx)} style={styles.miniLineRemoveBtn}>
                      <Text style={styles.miniLineRemoveText}>✕</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
              <TouchableOpacity onPress={addDescLine} style={styles.addMoreRowBtn}>
                <Text style={styles.addMoreRowText}>+ ADD MORE QUOTE LINES</Text>
              </TouchableOpacity>

              <Text style={styles.label}>Strategic Conclusions / Stance secrets</Text>
              <TextInput style={styles.input} placeholder="e.g. Leaning back into ropes avoids heavy blows..." placeholderTextColor="#726b6b" value={fighterConc} onChangeText={setFighterConc} />

              <Text style={styles.formStreamSectionDivider}>⚡ SIGNATURE MOVES</Text>

              {fighterMoves.map((move) => renderMoveFormItem(move))}

              <TouchableOpacity onPress={addMoveItem} style={styles.addSignatureMoveBtn}>
                <ImageBackground style={{ height: 57, width: "100%", opacity: 1, borderRadius: 15 }} imageStyle={{ opacity: 1, borderRadius:15 }} resizeMode='cover' source={require('../assets/addsignaturemovebtn.png')} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.saveBtn} onPress={saveFighterProfile}>
                <ImageBackground style={{ height: 76, width: "100%", opacity: 1, borderRadius: 12 }} imageStyle={{ opacity: 1, borderRadius:12 }} resizeMode='cover' source={require('../assets/savechapterbtn.png')} />
              </TouchableOpacity> 
            </ScrollView>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </ImageBackground>
    );
  }



  return (
    <ImageBackground style={ styles.imgBackground } imageStyle={{ opacity: 1 }} resizeMode='cover' source={require('../assets/fightersbackground.jpeg')}>
      <StatusBar barStyle="light-content"/>
      <SafeAreaView style={{ flex: 1, height: "100%", marginTop: 7}}>

        <View style={{marginBottom:19, paddingTop:-10, paddingBottom: 10}}>
          <ImageBackground style={ styles.icon } imageStyle={{ opacity: 1 }} resizeMode='contain' source={require('../assets/fighterslisttitle.png')} /> 
        </View>  

        <View style={styles.header}>
          <View style={styles.searchRow}>
            <TextInput style={styles.searchInput} placeholder="Search Martial Artists..." placeholderTextColor="rgba(255,255,255,0.5)" value={searchQuery} onChangeText={setSearchQuery} />
            <TouchableOpacity onPress={() => parseStyles(allFighters, searchQuery)} style={styles.searchBtn}>
              <ImageBackground style={{ height:"100%", width:"100%"}} resizeMode='contain' source={require('../assets/binocularsicon.png')}/>         
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setSearchQuery(''); parseStyles(allFighters, null); }} style={styles.clearBtn}>
              <ImageBackground style={{ height:"100%", width:"100%"}} resizeMode='contain' source={require('../assets/reloadicon.png')}/>         
            </TouchableOpacity>
          </View>

          <View style={styles.dashboardIconsControlsRow}>
            <TouchableOpacity onPress={() => populateForEdit(null, "allstyles")} style={styles.plusIcon}>
              <ImageBackground style={{ height:"100%", width:"100%"}} resizeMode='contain' source={require('../assets/addchaptericon.png')}/>         
            </TouchableOpacity> 
            <TouchableOpacity onPress={handleImportFighters} style={styles.importIcon}>
              <ImageBackground style={{ height:"100%", width:"100%"}} resizeMode='contain' source={require('../assets/importmoveicon.png')}/>         
            </TouchableOpacity>
          </View>
        </View>  
        
        { loading ? (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#caaf38" />
            <Text style={styles.loadingText}>Synchronizing Fighters Roster...</Text>
          </View> )
        : ( <FlatList
          data={hFighters || []}
          extraData={selectedIds, allFighters}
          numColumns={2}
          contentContainerStyle={{ paddingBottom: 57 }}
          keyExtractor={(item, index) => item.name || index.toString()}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={{ flex: 1, flexDirection: "row", alignItems: "center", marginTop: 2, marginLeft: 7, marginRight: 7, width: "50%", borderWidth: 0 }}>
              { selectedIds.includes(item.id) && selectedIds.length === 1 ? ( <View> <Pressable onLongPress={() => !item.isStaticBundle && toggleSelect(item.id)}
                onPress={() => { if (selectedIds.length > 0) { if (!item.isStaticBundle) toggleSelect(item.id); } else { navKSound(item); }}}  
                style={[styles.mainCardView, selectedIds.includes(item.id) && styles.selectedCard]} >
                  <View style={styles.subCardView}>
                    <Image source={typeof item.avatar === 'number' ? item.avatar : { uri: item.avatar }} resizeMode="contain" style={{ borderRadius: 12, alignSelf: 'flex-start', margin: 0, height: 133, width: "100%" }} />
                  </View>
                </Pressable>
                <View style={styles.chapterCardFooter}>
                  <TouchableOpacity style={styles.editBtnCard} onPress={() => populateForEdit(item, item.style)}>
                    <Text style={styles.editBtnText}>EDIT</Text>
                  </TouchableOpacity>
                </View> 
                </View> ) : ( <Pressable onLongPress={() => !item.isStaticBundle && toggleSelect(item.id)}
                  onPress={() => { if (selectedIds.length > 0) { if (!item.isStaticBundle) toggleSelect(item.id); } else { navKSound(item); }}}  
                  style={[styles.mainCardView, selectedIds.includes(item.id) && styles.selectedCard]} >
                    <View style={styles.subCardView}>
                      <Image source={ item.isStaticBundle ? item.avatar : { uri: item.avatar }} resizeMode="contain" style={{ borderRadius: 12, alignSelf: 'flex-start', margin: 0, height: 133, width: "100%" }} />
                      <View style={{marginLeft: 12, marginBottom: 7}}>
                        <Text style={{ fontSize: 14, color: "gold", fontWeight: 'bold', textTransform: 'capitalize' }}>{item.name}</Text>  
                        <View style={styles.styleTextView}>
                          <Text style={{ color: '#9a9aa1', fontSize: 12 }}>{item.style}</Text>
                        </View>
                      </View>
                    </View>
                </Pressable> ) 
              }
            </View>)}
          /> ) }

          { selectedIds.length > 0 && (
            <View style={styles.batchBar}>
              <Text style={styles.batchText}>{`${selectedIds.length} Selected`}</Text>
              <TouchableOpacity onPress={() => shareFighters(selectedIds)} style={styles.shareIcon}>
                <ImageBackground style={{height: "100%", width: "100%"}} resizeMode='contain' source={require('../assets/sharechaptericon.png')}/>         
              </TouchableOpacity>
              { selectedIds.length == 1 && ( <TouchableOpacity onPress={() => populateForEdit(item, item.style)} style={styles.editBtnCard}>
                <ImageBackground style={{height: "100%", width: "100%"}} resizeMode='contain' source={require('../assets/sharechaptericon.png')}/>         
              </TouchableOpacity> ) }
              <TouchableOpacity onPress={() => deleteFighters(selectedIds)} style={styles.myDojoDiscardIcon}>
                <ImageBackground style={{height: "100%", width: "100%"}} resizeMode='contain' source={require('../assets/discardicon.png')}/> 
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setSelectedIds([])} style={styles.myDojoDeleteIcon}>
                <ImageBackground style={{height: "100%", width: "100%"}} resizeMode='contain' source={require('../assets/deletechaptericon.png')}/>         
              </TouchableOpacity>
            </View>
          ) }
      </SafeAreaView>
    </ImageBackground>
  )
}


const styles = StyleSheet.create({
  dashboardIconsControlsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 1, minHeight: 50, width: '100%', gap: 15 },
  imgBackground: { minWidth: '100%', minHeight: '100%', height: Dimensions.get('window').height, flex: 1 },
  icon: { height: 57, opacity: 1, marginTop: 38, textAlign: "center"},
  mainCardView: { minHeight: 228, width: "100%", backgroundColor: "#2f4f4f", borderRadius: 15, shadowColor: "#000", shadowOffset: {width: 0, height: 0}, shadowOpacity: 1, shadowRadius: 5, elevation: 8, justifyContent: 'center', padding: 5,marginTop: 12, marginBottom: 12, marginLeft: 1, marginRight: 5, borderColor: "#caaf38", borderWidth: 2, flexDirection: 'column', alignItems: 'flex-start'},
  subCardView: { minHeight: 207, width: "100%", marginLeft: 7, borderRadius: 8, backgroundColor: "slategray", color: 'crimson', borderWidth: 0, alignSelf: 'center', justifyContent: 'center', marginRight: 7, padding:0},
  plusIcon: { width: 45, height: 45 },
  iconAM: { height: 60, width: width * 0.8 },
  header: { paddingHorizontal: 16, marginBottom: 10, width: '100%' },
  searchRow: { flexDirection: 'row', paddingHorizontal: 9, paddingVertical: 4, gap: 8, marginBottom: 7, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 9, alignItems: 'center', justifyContent: 'center', width: '100%', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  searchInput: { height: 38, width: '70%', backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 8, paddingHorizontal: 8, color: 'white', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', fontSize: 11 },
  searchBtn: { width: 39, height: 37, backgroundColor: '#e7f5ed4f', borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  clearBtn: { width: 32, height: 32, backgroundColor: '#31303080', borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  plusIconAM: { width: 40, height: 40, marginRight: 10 },
  importIcon: { width: 45, height: 45 },
  chapterCardFooter: { flexDirection: 'row', justifyContent: 'center', width: '100%' },
  editBtnCard: { backgroundColor: '#caaf38', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 6 },
  editBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 11 },
  batchBar: { position: 'absolute', bottom: 20, left: '5%', right: '5%', height: 55, backgroundColor: '#1e293b', borderRadius: 25, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, borderWidth: 1.5, borderColor: '#caaf38', elevation: 10 },
  batchText: { color: '#caaf38', fontWeight: 'bold', fontSize: 13 },
  shareIcon: { width: 35, height: 35 },
  myDojoDiscardIcon: { width: 35, height: 35 },
  myDojoDeleteIcon: { width: 35, height: 35 },
  formHeaderTitleRow: { width: '100%', alignItems: 'center', marginVertical: 10 },
  discardBtn: { alignSelf: 'center', backgroundColor: 'rgba(220, 38, 38, 0.15)', borderWidth: 1, borderColor: '#dc2626', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, marginBottom: 12 },
  discardText: { color: '#ef4444', fontWeight: 'bold', fontSize: 11 },
  formScroller: { flex: 1, paddingHorizontal: 16 },
  label: { color: '#caaf38', fontSize: 12, fontWeight: 'bold', marginTop: 10, marginBottom: 4, textTransform: 'uppercase' },
  input: { height: 40, backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 12, color: '#000', borderWidth: 1, borderColor: '#cbd5e1', marginBottom: 6 },
  descInput: { height: 70, textAlignVertical: 'top', paddingVertical: 8 },
  dynamicLineRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  selectedCard: { borderColor: '#dc2626', backgroundColor: '#fef2f2', borderWidth: 2 },
  styleTextView: { marginTop: 3, borderWidth: .5, borderRadius: 12, borderColor:'#caaf38', flexDirection:'row', backgroundColor:'#323232', justifyContent: 'flex-start', alignItems: 'flex-start', paddingHorizontal: 4, paddingVertical: 2},
  loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0, 0, 0, 0.75)', justifyContent: 'center', alignItems: 'center', zIndex: 999 },
  loadingText: { color: '#caaf38', fontWeight: 'bold', fontSize: 12, marginTop: 10, letterSpacing: 0.5 },
  saveBtn: { width: 133, height: 114, borderRadius: 15, marginTop: -12, alignSelf:'center' },
  addSignatureMoveBtn: { width: 190, height: 57, borderRadius: 15, marginTop: 7, alignSelf:'center' },
  removeSignatureMoveBtn: { width: 228, height: 67, borderRadius: 15, marginTop: 7, alignSelf:'center' },
  formStreamSectionDivider: { color: '#caaf38', fontSize: 13, fontWeight: 'bold', marginTop: 22, marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#caaf38', paddingBottom: 4 },
  sectionContainerBlock: { backgroundColor: 'rgba(255, 255, 255, 0.06)', borderRadius: 10, padding: 12, marginVertical: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  mediaPickerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 6, gap: 10 },
  fileLoadedIndicator: { color: '#4ade80', fontSize: 11, fontWeight: '600' },
  addMoreRowBtn: { paddingVertical: 8, paddingHorizontal: 12, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 8, marginVertical: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', alignItems: 'center' },
  addMoreRowText: { color: '#caaf38', fontWeight: 'bold', fontSize: 11 },
  miniLineRemoveBtn: { width: 36, height: 40, backgroundColor: 'rgba(220,38,38,0.1)', borderWidth: 1, borderColor: '#dc2626', borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  miniLineRemoveText: { color: '#dc2626', fontWeight: 'bold' },
  stepImg: { width: '100%', height: '100%' },
  stepImgContainer: { width: 77, height: 77, justifyContent: 'center', alignItems: 'center', borderRadius: 12, borderWidth: 0, opacity: 1},
});