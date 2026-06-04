import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, StyleSheet, Alert, ImageBackground, KeyboardAvoidingView, Platform, StatusBar, FlatList, Dimensions, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNetInfo } from "@react-native-community/netinfo";
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { zip, unzip } from 'react-native-zip-archive';
import SectionPlayer from './SectionPlayer';

const { height, width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.76;

const SECTION_TYPES = {
  VIDEO: "video",
  PDF: "pdf",
  IMAGE: "image",
  AUDIO: "audio",
};

export default function Chapters() {
  const [mode, setMode] = useState("main");
  const [prevMode, setPrevMode] = useState("main");
  const [chapters, setChapters] = useState([]);
  const [currentChapter, setCurrentChapter] = useState(null);
  const navigation = useNavigation();

  const [schapters, setSchapters] = useState([]); 
  const [hchapters, setHchapters] = useState([]); 
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedSingles, setSelectedSingles] = useState([]);
  
  const [chapterId, setChapterId] = useState(null);
  const [chapterTitle, setChapterTitle] = useState("");
  const [chapterCategory, setChapterCategory] = useState("");
  const [chapterDesc, setChapterDesc] = useState("");
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [playingAudio, setPlayingAudio] = useState(null);
  const [activeSectionId, setActiveSectionId] = useState(null);
  const [vcDropdownVisible, setVcDropdownVisible] = useState(true);

  const isOffline = useNetInfo().isConnected === false;
  const isLoadingRef = useRef(false);


  const showInstructions = () => {
    Alert.alert(
      "My Dojo Moves List",
      "Intructions: Save, Edit, View, Share, Delete and Import Chapters using iDojo. You may add any number of Chapters your phone memory allows. Click the binoculars icon to search Chapters by the search term entered. After a search another search can be done by using backspace to remove the search term instead of the silver reload icon.\n(1) Use the gold, plus(+) icon in the top menu bar to Add Chapters. Every Chapter must contain at least one Section. You can add a Video, Audio, PDF or Image to a Section. A title and media is required for all Sections of a Chapter. The default allcategories, will be used when a Chapter Category is not entered.\n(2) Click on one of the gold and white buttons on the Chapters Screen to see all Chapters with the same Category. The first Category button in the list is All Categories in gold. Media in Setions can contain online links or a file uploaded from the phone, not both.\n(3) On the list screen press and hold a move card to see the batch bar appear, after select all Chapters to share or delete and click on the share or delete button in the batch bar to share or delete Chapters. Use the Edit button at the bottom of each Chapter card in the list to edit a Chapter, and to view any Chapter just click on its Chapter card. When viewing a video Section of a Chapter, click the red arrow to the right to the title to share the individual video. When viewing a Chapters press the square to see fullscreen mode appear, then click the red, green or blue share arrow to share a Section. Chapters can be shared and imported with the iDojo App and the wheeShare App, only single videos, images and PDFs can be shared externally.\n(4) Scroll horizontally and vertically on the All categories list screen to view all your Chapters. On the Add Chapters screen fill out the form and click the save button to save Chapters . When adding Sections on the Add Chapter screen click one of the 4 buttons above the gold save button, to add a Scetion. The -section icon is provided for removing Sections. Thank you for using our App.",
      [ { text: "OK",
        onPress: () => setMode("main"),
          style: "cancel" 
      }],
      { cancelable: false } 
    );
  };

  const parseCategories = (list, query) => {
    if ( !Array.isArray(list) ) {
      Alert.alert("Data Error", "Data is not an array, skipping parse.");
      return;
    }
  
    let chapterCategories = [];
    let cCategories = [{ id: "c-all", category: "allcategories" }];
  
    try {
      let validList = list.filter(m => m && m.id && m.title && m.category);    
      const q = query?.trim()?.toLowerCase();

      validList?.forEach(m => {
        const currentStyle = m.category || "Enter Category";
        const mType = m.category.trim().toLowerCase();
  
        let matches = false;
        const nestedMatch = m.sections?.some(s => 
          s.title?.toLowerCase().includes(q) || 
          s.description?.toLowerCase().includes(q)
        );

        const mainMatch = !q || 
          m.title?.toLowerCase().includes(q) ||
          m.category?.toLowerCase().includes(q) ||
          m.description?.toLowerCase().includes(q);
            
        matches = mainMatch || nestedMatch;
        if (!matches) return;
  
        if ( !chapterCategories.includes(currentStyle) ) {
          chapterCategories.push(currentStyle); 
          cCategories.push({ ...m, category: currentStyle }); 
        } 
      });
  
      if(cCategories.length > 1) {
        setSchapters(cCategories);
      } 
    } catch (e) {
      Alert.alert("Parse Error", "An error occurred while grouping chapter category: " + e.message);
    }
  };
      
  const parseHChapters = (chaptersList) => {
    let hChapters = [];
    let categoriesSeen = [];
    for (let mNum = 0; mNum < chaptersList.length; mNum++) {
      const chapter = chaptersList[mNum];
      const currentCategory = chapter.category || "Enter Chapter Category";
      let mIndex = categoriesSeen.indexOf(currentCategory);
  
      if (mIndex < 0) {
        categoriesSeen.push(currentCategory);
        hChapters.push({
          category: currentCategory,
          data: [chapter],
        });
      } else {
        hChapters[mIndex].data.push(chapter);
      }
    }
    return hChapters;
  };
  
  const getChapters = (cat, chaptersList) => {
    if( !cat || !chaptersList ) return [];
    let sChapters = chaptersList.filter(m => (cat === "allcategories" || m.category === cat));
    if(cat === "allcategories") return parseHChapters(sChapters);
    return sChapters;
  }

  const loadChapters = async () => {
    try {
      if (isLoadingRef.current) return; 
      isLoadingRef.current = true;
      setLoading(true);

      const fileUri = `${FileSystem.documentDirectory}chapters.json`;
      const info = await FileSystem.getInfoAsync(fileUri);
      
      if (info.exists) {
        const content = await FileSystem.readAsStringAsync(fileUri);
        let loadedChapters = JSON.parse(content);
        loadedChapters = loadedChapters.filter(m => 
          m && 
          m.id && 
          m.title &&
          m.category &&
          m.title.trim() !== "" &&
          (m.sections && m.sections.length > 0)
        );

        if (loadedChapters.length === 0) {
          setMode("main");
          setHchapters([]);
        } else {
          setChapters(loadedChapters || []);
          parseCategories(loadedChapters, null);

          const filtered = getChapters(chapterCategory, loadedChapters);
          if (filtered.length === 0 && mode === "list") {
            setHchapters([]);
            setMode("main");
          } else {
            setHchapters(filtered);
          }
        }

      } else {
        setChapters([]);
        setHchapters([]);
        setMode("main");
        setChapterCategory("");
      }
    } catch (e) {
      Alert.alert("Load Failed", e.message);
      setChapters([]);
    } finally {
      isLoadingRef.current = false;
      setLoading(false);
    }
  };

  
  const saveChaptersToStorage = async (chaptersData) => {
    try {
      const fileUri = `${FileSystem.documentDirectory}chapters.json`;
      await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(chaptersData));
      setChapters(chaptersData);
      parseCategories(chaptersData, null);
      setHchapters(getChapters(chapterCategory, chaptersData)); 
    } catch (e) {
      Alert.alert("Save Error", e.message || "Could not save move list to disk.");
      throw e;
    }
  };


  const handleSaveChapter = async (newData) => {
    try {
      if (isLoadingRef.current) return;
      isLoadingRef.current = true;
      setLoading(true);

      const incomingChapters = Array.isArray(newData) ? newData : [newData];
      const updatedList = [...chapters];
      incomingChapters.forEach(chapter => {
        const index = updatedList.findIndex(c => c.id === chapter.id);
        if (index > -1) {
          updatedList[index] = chapter;
        } else {
          updatedList.push(chapter);
        }
      });

      await saveChaptersToStorage(updatedList);
      resetForm();
      setMode('list');
    } catch (e) {
      Alert.alert('Save Failed', e.message);
    } finally {
      isLoadingRef.current = false;
      setLoading(false);
    }
  };

  
  const deleteChapters = async (idsFromArg = []) => {
    const actualIds = Array.isArray(idsFromArg) && idsFromArg.length > 0 ? idsFromArg : (selectedIds || []);
    const cleanIdsToDelete = actualIds.map(id => String(id).trim());
    if (cleanIdsToDelete.length === 0) return;
    
    const isDeletingAll = actualIds.length === hchapters.length;
    Alert.alert(
      isDeletingAll ? "Delete All Chapters" : "Delete Chapters",
      isDeletingAll ? "Remove all Chapters in this Category?" : `Remove ${cleanIdsToDelete.length} selected Chapter(s)?`,

      [{ text: 'Cancel', style: 'cancel' },
        {text: 'Delete', style: 'destructive',
          onPress: async () => {
            try {
              const chaptersToDelete = chapters.filter(m => cleanIdsToDelete.includes(String(m.id)));
              for (const chapter of chaptersToDelete) {
                const folderUri = `${FileSystem.documentDirectory}chapters/${chapter.id}/`;
                try {
                  await FileSystem.deleteAsync(folderUri, { idempotent: true });
                } catch (err) {
                    Alert.alert("Delete Error", e.message || "Could not delete file from storage.");
                }
              }
              const updatedList = chapters.filter(m => !cleanIdsToDelete.includes(String(m.id)));
              const fileUri = `${FileSystem.documentDirectory}chapters.json`;
              await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(updatedList));
              setChapters(updatedList);
              parseCategories(updatedList, null);
              setSelectedIds([]);
                            
              if (isDeletingAll || updatedList.filter(m => (chapterCategory === "allcategories" || m.category === chapterCategory)).length < 1) {
                setMode('main');
                setChapterCategory('Enter Category');
              } else {
                setHchapters(getChapters(chapterCategory, updatedList));
              }

            } catch (e) {
              Alert.alert("Delete Error", e.message || "Could not delete files from storage.");
            }
          }
        }
      ]
    );
  };



  const shareChapters = async (chapterIds) => {
    if (isOffline) {
      Alert.alert("No Internet", "You need an internet connection to share chapters.");
      return;
    }

    if (!chapterIds?.length) return;
    
    let shareDir = null;
    let zipPath = null;
    let shareSuccess = false;
    
    try {
      setLoading(true);
      
      shareDir = `${FileSystem.cacheDirectory}chapters_export_${Date.now()}/`;
      zipPath = `${FileSystem.cacheDirectory}iDojo_Chapters_${Date.now()}.zip`;
      
      await FileSystem.deleteAsync(shareDir, { idempotent: true });
      await FileSystem.makeDirectoryAsync(shareDir, { intermediates: true });
      
      const chaptersToShare = chapters.filter(c => chapterIds.includes(c.id));
      for (let i = 0; i < chaptersToShare.length; i++) {
        await FileSystem.makeDirectoryAsync(`${shareDir}chapter_${i}/`, { intermediates: true });
      }

      const exportPromises = chaptersToShare.map(async (chapter, chapterIdx) => {
        const chapterCopy = { 
          ...chapter, 
          sections: chapter.sections.map(s => ({...s}))
        };
        
        const chapterDir = `${shareDir}chapter_${chapterIdx}/`;
        const sectionPromises = chapter.sections.map(async (section, sectionIdx) => {
          const sectionCopy = { ...section };
          
          if (section.mediaUri && section.mediaUri.startsWith('file://')) {
            const info = await FileSystem.getInfoAsync(section.mediaUri);
            if (!info.exists) {
              console.log(`File missing: ${section.mediaUri}`);
              sectionCopy.mediaUri = null; 
            } else {
              const fileName = `${chapterIdx}_${sectionIdx}_${section.mediaUri.split('/').pop()}`;
              const dest = `${chapterDir}${fileName}`;
              
              try {
                await FileSystem.copyAsync({ from: section.mediaUri, to: dest });
                const destInfo = await FileSystem.getInfoAsync(dest);
                if (!destInfo.exists) {
                  throw new Error(`Copy failed: ${fileName}`);
                }
                sectionCopy.mediaUri = fileName;
              } catch (e) {
                console.log(`Copy error: ${e.message}`);
                sectionCopy.mediaUri = null;
              }
            }
          }
          
          return sectionCopy; 
        });
        
        chapterCopy.sections = await Promise.all(sectionPromises); 
        
        await FileSystem.writeAsStringAsync(
          `${chapterDir}chapter.json`, 
          JSON.stringify(chapterCopy)
        );
        
        return chapterCopy;
      });
      
      await Promise.all(exportPromises);
      
      const manifest = {
        app: 'iDojo',
        version: 1,
        count: chaptersToShare.length,
        exportDate: new Date().toISOString()
      };
      
      await FileSystem.writeAsStringAsync(
        `${shareDir}manifest.json`, 
        JSON.stringify(manifest)
      );
      
      const nakedSource = Platform.OS === 'android' 
        ? shareDir.replace('file://', '').replace(/\/$/, '') 
        : shareDir;
      const nakedTarget = Platform.OS === 'android' 
        ? zipPath.replace('file://', '') 
        : zipPath;
        
      await zip(nakedSource, nakedTarget);
      
      await Sharing.shareAsync(zipPath, {
        dialogTitle: `Share ${chaptersToShare.length} Chapter(s)`,
        mimeType: 'application/zip'
      });
      
      shareSuccess = true;
      
    } catch (e) {
      Alert.alert('Share Error', e.message || 'Failed to share chapters');
    } finally {
      setLoading(false);
      if (shareSuccess) setSelectedIds([]);
      if (shareDir) {
        try { await FileSystem.deleteAsync(shareDir, { idempotent: true }); } catch (e) {}
      }
      if (zipPath) {
        try { await FileSystem.deleteAsync(zipPath, { idempotent: true }); } catch (e) {}
      }
    }
  };


  const handleImportChapters = async () => {
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
      extractDir = `${FileSystem.documentDirectory}imported_chapters_${importId}/`;
      tempZipPath = `${FileSystem.cacheDirectory}import_chapter_temp_${importId}.zip`;
      
      await FileSystem.copyAsync({ from: asset.uri, to: tempZipPath });
      await FileSystem.makeDirectoryAsync(extractDir, { intermediates: true });
      
      const nakedZip = Platform.OS === 'android' ? tempZipPath.replace('file://', '') : tempZipPath;
      const nakedDest = Platform.OS === 'android' ? extractDir.replace('file://', '').replace(/\/$/, '') : extractDir;
      
      await unzip(nakedZip, nakedDest);
      const fixPath = (oldPath) => {
        if (!oldPath || typeof oldPath !== 'string' || oldPath.startsWith('http')) return oldPath;
        const fileName = oldPath.split('/').pop();
        return `${extractDir}${fileName}`;
      };
      
      let manifest = { count: 1 };
      try {
        const manifestContent = await FileSystem.readAsStringAsync(`${extractDir}manifest.json`);
        manifest = JSON.parse(manifestContent);
      } catch (e) {
        
      }
      
      const rawChapters = [];
      const chapterDirs = manifest.count > 1 
        ? Array.from({length: manifest.count}, (_, i) => `chapter_${i}/`) 
        : [''];
      
      for (const dir of chapterDirs) {
        const chapterPath = `${extractDir}${dir}chapter.json`;
        const info = await FileSystem.getInfoAsync(chapterPath);
        if (!info.exists) continue;
        
        const content = await FileSystem.readAsStringAsync(chapterPath);
        let chapter;
        try {
          chapter = JSON.parse(content);
        } catch (parseError) {
          continue;
        }

        if (!chapter || typeof chapter !== 'object') continue;
        if (!chapter.title?.trim()) continue;
        if (!Array.isArray(chapter.sections)) continue;
        const chapterDir = `${extractDir}${dir}`;
        const fixChapterPath = (oldPath) => {
          if (!oldPath || typeof oldPath !== 'string' || oldPath.startsWith('http')) return oldPath;
          const fileName = oldPath.split('/').pop();
          return `${chapterDir}${fileName}`;
        };
        
        chapter.sections.forEach((section) => {
          if (!section) return;
          section.mediaUri = fixChapterPath(section.mediaUri);
          section.mediaUrl = fixChapterPath(section.mediaUrl);
          if (section.mediaUri && section.mediaUrl && !section.mediaUrl.startsWith('http')) {
            section.mediaUrl = '';
          }
        });
        
        rawChapters.push(chapter);
      }
      
      if (rawChapters.length === 0) {
        throw new Error('No valid chapters found in zip file');
      }
      
      const finalChapters = rawChapters.map((chapter, index) => ({
        ...chapter,
        id: `chapter_${importId}_${index}_${Math.random().toString(36).substring(2, 6)}`,
        updatedAt: new Date().toISOString()
      })).filter(c => c.sections.length > 0);
      
      if (finalChapters.length === 0) {
        throw new Error("No valid chapters to import");
      }
      
      const updatedList = [...chapters, ...finalChapters];
      await handleSaveChapter(updatedList);
      setChapters(updatedList);
      parseCategories(updatedList, null);
      setHchapters(getChapters(chapterCategory, updatedList));  
      
      Alert.alert('Success', `${finalChapters.length} chapter(s) imported!`);
      
    } catch (e) {
      Alert.alert('Import Failed', e.message || 'Failed to import chapters');
      if (extractDir) {
        try { await FileSystem.deleteAsync(extractDir, { idempotent: true }); } catch (e) {}
      }
    } finally {
      setLoading(false);
      if (tempZipPath) {
        try { await FileSystem.deleteAsync(tempZipPath, { idempotent: true }); } catch (e) {}
      }
    }
  };


  const populateForEdit = (chapter, mvcat ) => {
    if(chapter === null) {
      setSelectedIds([]);
      setChapterTitle("");
      setChapterDesc("");
      setCurrentChapter(null);
      setChapterId(Date.now().toString());

      if(mvcat === "allcategories") {
        setChapterCategory("");
      } else {
        setChapterCategory(mvcat);
      }

      setSections([]);
      setPrevMode("list");
      setMode("add");

    } else {
      setChapterId(chapter.id);
      setChapterTitle(chapter.title);
      setChapterCategory(mvcat);
      setChapterDesc(chapter.description || "");
      setSections(chapter.sections || []);
      setPrevMode("list");
      setMode("add");
    }
  };


  const resetForm = () => {
    setChapterId(Date.now().toString());
    setChapterTitle('');
    setChapterCategory(chapterCategory || "");
    setChapterDesc('');
    setSections([]);
  };


  const addSection = (type) => {
    const newSection = {
      id: Date.now().toString(),
      type: type,
      title: "",
      description: "",
      mediaUri: null,
      mediaUrl: '',
    };
    setSections([...sections, newSection]);
  };


  const removeSection = (id) => {
    setSections(sections.filter(s => s.id !== id));
  };


  const updateSection = (id, field, value) => {
    setSections(sections.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  
   const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };


  const viewChapter = (chapter) => {
    setCurrentChapter(chapter);
    setVcDropdownVisible(false);  
    setMode("view");
  };


  const pickMedia = async (sectionId, type) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Gallery access is needed to add Chapters!");
      return;
    }

    try {
      if (type === SECTION_TYPES.PDF) {
        const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' });
        if (!result.canceled && result.assets?.length > 0) {
          updateSection(sectionId, 'mediaUri', result.assets[0].uri);
        }
      } else if (type === SECTION_TYPES.AUDIO) {
        const result = await DocumentPicker.getDocumentAsync({ 
          type: ['audio/*', 'audio/mpeg', 'audio/mp3', 'audio/wav'] 
        });
        if (!result.canceled && result.assets?.length > 0) {
          updateSection(sectionId, 'mediaUri', result.assets[0].uri);
        }
      } else {
        const mediaType = type === SECTION_TYPES.VIDEO ? 'videos' : 'images';
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: [mediaType],
          allowsEditing: false,
          quality: 1,
        });
        if (!result.canceled && result.assets?.length > 0) {
          updateSection(sectionId, 'mediaUri', result.assets[0].uri);
        }
      }
    } catch (err) {
      Alert.alert('Error', 'Could not open media');
    }
  };


  const saveChapter = async () => {
    if (!chapterTitle.trim()) {
      Alert.alert('Required', 'Please enter a Chapter Title');
      return;
    }

    if (sections.length === 0) {
      Alert.alert('Required', 'Add at least one Section');
      return;
    }

    for (const section of sections) {
      if (!section.title.trim()) {
        Alert.alert('Required', 'All Sections need a Title');
        return;
      }
      if (!section.mediaUri && !section.mediaUrl.trim()) {
        Alert.alert('Required', `Section "${section.title}" needs Media`);
        return;
      }
    }

    try {
      const chaptId = currentChapter?.id || Date.now().toString();
      const permanentDirUri = `${FileSystem.documentDirectory}chapters/${chaptId}/`;

      if (currentChapter) {
        await FileSystem.deleteAsync(permanentDirUri, { idempotent: true });
      }
      
      await FileSystem.makeDirectoryAsync(permanentDirUri, { intermediates: true });
      const ensurePermanent = async (uri, fileName) => {
        if (!uri || !uri.startsWith('file://') || uri.includes('/chapters/')) return uri;
        const destUri = `${permanentDirUri}${fileName}`;
        try {
          await FileSystem.copyAsync({ from: uri, to: destUri });
          return destUri;
        } catch (e) {
          Alert.alert("Copy Failed", `File: ${fileName}\nError: ${e.message}`);
          return uri;
        }
      };

      const processedSections = await Promise.all(
        sections.map(async (section) => {
          const newSection = { ...section };
          
          if (section.mediaUri) {
            const ext = section.type === 'pdf' ? '.pdf' : section.type === 'audio' ? '.m4a' : section.type === 'image' ? '.jpg' : '.mp4';
            newSection.mediaUri = await ensurePermanent(section.mediaUri, `section_${section.id}_${Date.now()}${ext}`);
          }
          
          return newSection;
        })
      );
    
      const chapterData = {
        id: chapterId || Date.now().toString(),
        title: chapterTitle.trim(),
        category: chapterCategory.trim(),
        description: chapterDesc,
        sections: sections,
        updatedAt: new Date().toISOString(),
      };

      await handleSaveChapter(chapterData);
      resetForm();
      setMode(prevMode);

    } catch (err) {
      Alert.alert("Save Error", err.message || "Failed to save Chapter");
    }
  };


  const getChapterThumbnail = (chapter) => {
    if (!chapter || !chapter.sections ) return require('../assets/chapterplaceholder.png');

    for (const section of chapter.sections) {
      if (section.type === 'image' && (section.mediaUri || section.mediaUrl)) {
        if(section.mediaUri) return section.mediaUri 
        if(!isOffline && section.mediaUrl) return section.mediaUrl;
      }

      if (section.type === 'video') {
        if (section.mediaUri) return section.mediaUri;

        if( isOffline ) return require('../assets/chapterplaceholder.png');;

        if (section.mediaUrl?.includes('youtube.com') || section.mediaUrl?.includes('youtu.be')) {
          const id = section.mediaUrl.match(/(?:youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/)?.[1];
          if (id) return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
        }
      }
    }
    return require('../assets/chapterplaceholder.png');
  };

  useFocusEffect(
    useCallback(() => {
      loadChapters();
    }, [])
  );

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (mode === "view") {
        setMode("list");
        return true;
      }

      if (mode === "add") {
        if(prevMode === "list") setMode("list");
        else setMode("main");
        return true;
      }

      if (mode === "list") {
        setMode("main");
        setChapterCategory("");
        setSelectedIds([]);
        return true;
      }
      return false;
    });

    return () => backHandler.remove();
  }, [mode]);



  const ChapterCard = ({ item }) => (
    <TouchableOpacity 
      onLongPress={() => toggleSelect(item.id)}
      onPress={() => selectedIds.length > 0 ? toggleSelect(item.id) : viewChapter(item)}
      style={[styles.itemContainer, selectedIds.includes(item.id) && styles.selectedItem]}>
        <View style={styles.card}>
  
          <View style={styles.titleBanner}>
            <Text numberOfLines={1} ellipsizeMode="clip" style={styles.titleText}>{item.title}</Text>
          </View>
  
          <Image style={styles.thumbImage}
            resizeMode='contain'
            source={ (() => { return getChapterThumbnail(item); })() } />
  
          <View style = {styles.pillRow}>
            <Text style = {styles.typePill}>Chapter</Text>
            <TouchableOpacity onPress={() => populateForEdit(item, item.category)} style={styles.editIcon}>
              <ImageBackground style = {{ height: "100%", width: "100%", }} resizeMode = 'contain' source = { require('../assets/editicongold.png') }/>         
            </TouchableOpacity>             
          </View>
        </View>
    </TouchableOpacity>
  );
  
      
  const MyHeader = () => {
    if (schapters.length === 0) return null;
    if (!schapters[0]) return null;
    const firstId = schapters[0].id;
    if (firstId === "c-all") return <Image source={require('../assets/chaptersdivider.png')} style={styles.goldDivider} resizeMode='contain'/>;
    return null;
  };


  if (mode === 'view' && currentChapter) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#323232', width: '100%', height:'100%', marginTop: 0 }}>
        <StatusBar barStyle="dark-content"/>
        <View style={styles.vcHeader}>

          <Text style={styles.vcTitle} numberOfLines={1} ellipsizeMode="clip">{currentChapter.title}</Text>
          <TouchableOpacity onPress={() => setVcDropdownVisible(!vcDropdownVisible)} style={styles.vcToggleBtn}>
            <Text style={styles.vcToggleText}>
              {!vcDropdownVisible ? '▼' : '▲'}
            </Text>
          </TouchableOpacity>
        </View>

        { vcDropdownVisible && (
          <View style={styles.vcDropdownContainer}>
            <View style={styles.vcInfoRow}>
              <Text style={styles.vcInfoLabel}>{`Content: ${currentChapter.sections.length} Sections`}</Text>
            </View>
              { currentChapter.description && (
                <View style={styles.vcDescSection}>
                  <Text style={styles.vcDescLabel}>Description:</Text>
                  <ScrollView style={styles.vcDescScroll}>
                    <Text style={styles.vcDescText}>{currentChapter.description}</Text>
                  </ScrollView>
                </View>
              ) }
          </View>
        ) }

        <FlatList
          data={currentChapter.sections}
          keyExtractor={(item) => item.id}
          style = {{ flex: 1 }}
          nestedScrollEnabled={true}
          contentContainerStyle={{ paddingBottom: 30 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <SectionPlayer
              section={item}
              index={index}
              isActive={activeSectionId === item.id}
              onActivate={() => setActiveSectionId(item.id)}
              onDeactivate={() => setActiveSectionId(null)}
              navigation={navigation}
              isOffline={isOffline}
            />
          )}
        />
      </SafeAreaView>
    );
  }



  if (mode === 'list') {
    return (
      <ImageBackground style={{flex: 1, width: '100%', height: '100%', opacity: 1}} resizeMode='cover' imageStyle={{ opacity: 0.9 }} source={require('../assets/chapterslistbg.png')}>
        <StatusBar barStyle="light-content"/>
        <SafeAreaView style={{ flex: 1}}>
          <View style={{marginBottom: 12, paddingHorizontal: 5, justifyContent: 'center', alignItems: 'center', opacity: 1}}>
            <ImageBackground style={ styles.icon } resizeMode='contain' imageStyle={{ opacity: 1 }} source={ require('../assets/chapterstitle.png') } /> 
          </View>
    
            <View style={styles.myDojoHeader}>
              <Text style={{ color: '#caaf38', fontSize: 12, flex: 1, textTransform: 'uppercase', fontWeight: "500" }}>{ chapterCategory === "allcategories" ? "ALL CATEGORIES" : "CATEGORY: "+chapterCategory}</Text>
                
              <View style={{flexDirection:'row'}}>
                <TouchableOpacity onPress={() => { setSelectedIds([]); setPrevMode("main"); setMode("main");} } style={styles.plusIconAM}>
                  <ImageBackground style={{ height: "100%", width: "100%", }} resizeMode='contain' source={ require('../assets/backgold.png') }/>
                </TouchableOpacity>
        
                <TouchableOpacity onPress={() => populateForEdit(null, chapterCategory)} style={ styles.plusIcon }>
                  <ImageBackground style={{ height: "100%", width: "100%", }} resizeMode='contain' source={ require('../assets/addchaptericon.png') }/>         
                </TouchableOpacity>
              </View>
            </View>
               
            <View style = {styles.flatlistContainer}> 
             <FlatList
              data = {hchapters}
              extraData = {[selectedIds, chapters]}
              keyExtractor = {(item, index) => item.id || index.toString()}
              style = {{ flex: 1 }}
              contentContainerStyle = {{ paddingBottom: 38, flexGrow: 1, minHeight: 200 * Math.max(hchapters.length, 1) }}
              ListEmptyComponent = {() => {
                return (
                  <View style={{padding: 19, alignItems: 'center'}}>
                    <Text style = {{ color: '#f3efbd', marginBottom: 19, fontWeight: 'bold', fontSize: 16 }}>Please Reload</Text>
                    <TouchableOpacity 
                      onPress={() => {
                        if (!loading && !isLoadingRef.current) loadChapters();
                      }}
                      style={{padding: 5, backgroundColor: 'rgba(182, 207, 136, 0.2)', borderRadius: 8}}
                    >
                      <ImageBackground style={{ height: 76, width: 76,}} resizeMode='contain' source={require('../assets/reloadicon.png')}/>         
                    </TouchableOpacity>
                  </View>
                );
              }}
              renderItem={({ item }) => (
                chapterCategory === "allcategories" ? (
                  <View style={styles.sectionContainer}>
                    <Text style={ styles.sectionHeader }>{item.category}</Text>
                      <FlatList
                        horizontal
                        data={item.data}
                        extraData={[selectedIds, chapters]}
                        getItemLayout={(data, index) => {
                          const itemWidth = Dimensions.get('window').width * 0.7;
                          return {
                            length: itemWidth,
                            offset: itemWidth * index,
                            index,
                          };
                        }}
                        windowSize = {38}
                        initialNumToRender = {item.data.length}
                        showsHorizontalScrollIndicator = {false}
                        keyExtractor = {(item, index) => item?.id?.toString() || `index-${index}` }
                        contentContainerStyle = {{ paddingRight: 38, paddingLeft: 12, minWidth: (Dimensions.get('window').width * (item.data?.length || 1)) * 0.7, flexGrow: 1 }}
                        renderItem = {({ item: chapter }) => <ChapterCard item={chapter} />}
                      />
                   </View>
                 ) : (<View style={styles.verticalWrapper}><ChapterCard item={item} /></View>)
               )}
             />
            </View>
         
            {selectedIds.length > 0 && (
              <View style={styles.batchBar}>
                <Text style={styles.batchText}>{selectedIds.length} Selected</Text>
                <TouchableOpacity onPress={() => shareChapters(selectedIds)} style={styles.shareIcon}>
                  <ImageBackground style={{height: "100%", width: "100%", borderRadius: 4}} imageStyle={{ opacity: 1 }} resizeMode='contain' source={ require('../assets/sharechaptericon.png') }/>         
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteChapters(selectedIds)} style={styles.myDojoDiscardIcon}>
                  <ImageBackground style={{height: "100%", width: "100%", }} imageStyle={{ opacity: 1 }} resizeMode='contain' source={require('../assets/discardicon.png') }/> 
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setSelectedIds([])} style={styles.myDojoDeleteIcon}>
                  <ImageBackground style={{height: "100%", width: "100%", }} imageStyle={{ opacity: 1 }} resizeMode='contain' source={require('../assets/deletechaptericon.png') }/>         
                </TouchableOpacity>
              </View> ) }
        </SafeAreaView>
      </ImageBackground>
    );
  }

 
  if (mode === 'add') {
   return (
    <ImageBackground source={require('../assets/chaptersbg.png')} style={styles.imgBackground} imageStyle={{ opacity: 1.0 }} resizeMode='cover' >
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1 , opacity: 1}}>

          <View style={{ marginBottom: 12, marginTop: -19, opacity : 1, justifyContent: 'center', alignItems: 'center',}}>
            <ImageBackground style={ styles.iconAM } resizeMode='contain' imageStyle={{ opacity: 1 }} source={currentChapter ? require('../assets/editchaptertitle.png') : require('../assets/addchaptertitle.png') } /> 
          </View>

          <TouchableOpacity onPress={() => { resetForm(); setMode(prevMode); }} style={styles.discardBtn}>
            <ImageBackground style={{ alignSelf:'center', height:67, width:"100%", opacity: 1}} imageStyle={{ opacity: 1 }} resizeMode='contain' source={require('../assets/discardicon.png')}/>
            <Text style={styles.discardText}>CANCEL</Text>
          </TouchableOpacity>

          <ScrollView style={styles.containerAM} contentContainerStyle={{ alignItems: "center", justifyContent: "center", paddingBottom: 100 }}>
            <Text style={styles.label}>Chapter Category</Text>
            <TextInput
              style={[styles.input, styles.chapterInput]}
              placeholder="Enter Chapter Category"
              placeholderTextColor="rgba(190, 190, 114, 0.76)"
              value={chapterCategory}
              onChangeText={setChapterCategory}
            />

            <Text style={styles.label}>Chapter Title</Text>
            <TextInput
              style={[styles.input, styles.chapterInput]}
              placeholder="Enter Chapter Title"
              placeholderTextColor="rgba(190, 190, 114, 0.76)"
              value={chapterTitle}
              onChangeText={setChapterTitle}
            />
            
            <Text style={styles.label}>Chapter Description</Text>
            <TextInput
              style={[styles.input, styles.chapterInput]}
              placeholder="Enter Chapter Description"
              placeholderTextColor="rgba(190, 190, 114, 0.76)"
              value={chapterDesc}
              onChangeText={setChapterDesc}
              multiline={true}
            />

            {sections.map((section, index) => (
              <View key={section.id} style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionHeaderText}>Section {index + 1}</Text>
                  <TouchableOpacity
                      style={styles.typeBtn}
                      onPress={() => updateSection(section.id, 'type', section.type)} >
                        
                      <Text style={styles.typeBtnText}>
                        {section.type === 'video' ? '📹' : section.type === 'pdf' ? '📄' : section.type === 'audio' ? '🎵' : '🖼️'}
                      </Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.label}>Section Title</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter Section Title"
                  placeholderTextColor="#726b6b"
                  value={section.title}
                  onChangeText={(text) => updateSection(section.id, 'title', text)}
                />

                <TouchableOpacity 
                  style={styles.stepImgContainer}
                  onPress={() => pickMedia(section.id, section.type)}
                >
                  {section.mediaUri ? (
                    <View style={styles.videoIconUploaded}>
                      {section.type === SECTION_TYPES.IMAGE ? (
                          <Image source={{ uri: section.mediaUri }} style={styles.stepImg} />
                        ) : section.type === SECTION_TYPES.VIDEO && section.mediaUri ? (
                          <Image source={{ uri: section.mediaUri }} style={styles.stepImg} />
                        ) : (
                        <View style={styles.filePreview}>
                          <Text style={styles.fileIcon}>
                            {section.type === SECTION_TYPES.VIDEO ? '🎬' : 
                             section.type === SECTION_TYPES.AUDIO ? '🎵' : '📄'}
                          </Text>
                          <Text style={styles.fileName} numberOfLines={1}>
                            {section.mediaUri.split('/').pop()}
                          </Text>
                        </View>
                      )}
                      <Text style={{alignSelf: "center", fontSize: 10, color: "#f3efbd", marginTop: -12, fontWeight: "bold", backgroundColor: 'rgba(212, 175, 55, 0.12)', }}>CHANGE</Text>
                    </View>
                  ) : !section.mediaUrl && (
                    <View style={styles.videoIcon}>
                      <ImageBackground 
                        style={{ alignSelf: 'center', height: 95, width: 114, opacity: 1 }} 
                        resizeMode='contain'
                        source={section.type === SECTION_TYPES.VIDEO ? require('../assets/uploadvideobg.png') : section.type === SECTION_TYPES.PDF ? require('../assets/uploadpdfbg.png') : section.type === SECTION_TYPES.AUDIO ? require('../assets/uploadaudiobg.png') : require('../assets/uploadimagebg.png')} />
                    </View>
                  )}
                </TouchableOpacity>

                {section.mediaUri && (
                  <TouchableOpacity style={styles.toggleModeBtn} onPress={() => { updateSection(section.id, 'mediaUri', null); }}>
                    <Text style={{fontSize: 23, marginTop: -7}}>🔗</Text>
                    <Text style={styles.toggleModeText}>Or Link</Text>
                  </TouchableOpacity>
                )}

                {!section.mediaUri && !section.mediaUrl && (
                  <Text style={styles.orText}>— OR —</Text>
                )}
                
                {!section.mediaUri && (
                  <>
                    <Text style={styles.label}>{`Section ${section.type} URL`}</Text>
                    <TextInput
                      style={styles.input}
                      placeholder={`Enter ${section.type} URL`}
                      placeholderTextColor="#726b6b"
                      value={section.mediaUrl}
                      onChangeText={(text) => updateSection(section.id, 'mediaUrl', text)}
                      autoCapitalize="none"
                    />
                  </>
                )}

                {section.mediaUrl && (
                  <TouchableOpacity style={[styles.toggleModeBtn, {marginTop: 7}]} onPress={() => { updateSection(section.id, 'mediaUrl', ''); }}>
                    <Text style={{fontSize: 22, marginTop: -2}}>📁</Text>
                    <Text style={styles.toggleModeText}> Or Upload</Text>
                  </TouchableOpacity>
                )}

                <Text style={styles.label}>Section Description</Text>
                <TextInput
                  style={[styles.input, styles.descInput]}
                  placeholder="Enter Section Description"
                  placeholderTextColor="#726b6b"
                  value={section.description}
                  onChangeText={(text) => updateSection(section.id, 'description', text)}
                  multiline
                  numberOfLines={3}
                />

                <TouchableOpacity onPress={() => removeSection(section.id)} style={styles.removeStepIcon}>
                  <ImageBackground style={{ height: 76, width: "90%", }} imageStyle={{ opacity: 1 }} resizeMode='contain' source={require('../assets/removesectionicon.png')}/>
                </TouchableOpacity>
              </View>
            ))}

            <View style={styles.addSectionContainer}>
              <View style={styles.addSectionButtons}>
                <TouchableOpacity style={styles.addSectionBtn} onPress={() => addSection(SECTION_TYPES.VIDEO)}>
                  <ImageBackground style={{ height: 38, width: "100%", justifyContent: 'center', opacity: 1, borderRadius: 12 }} imageStyle={{ opacity: 1, borderRadius:12 }} resizeMode='contain' source={require('../assets/addvideobtn.png')} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.addPdfSectionBtn} onPress={() => addSection(SECTION_TYPES.PDF)}>
                  <ImageBackground style={{ height: 38, width: "100%", justifyContent: 'center', opacity: 1, borderRadius: 12 }} imageStyle={{ opacity: 1, borderRadius:12 }} resizeMode='contain' source={require('../assets/addpdfbtn.png')} />
                </TouchableOpacity>
              </View>

              <View style={styles.addSectionButtons}>
                <TouchableOpacity style={styles.addAudioSectionBtn} onPress={() => addSection(SECTION_TYPES.AUDIO)}>
                  <ImageBackground style={{ height: 38, width: "100%", justifyContent: 'center', opacity: 1, borderRadius: 12 }} imageStyle={{ opacity: 1, borderRadius:12 }} resizeMode='contain' source={require('../assets/addaudiobtn.png')} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.addImgSectionBtn} onPress={() => addSection(SECTION_TYPES.IMAGE)}>
                  <ImageBackground style={{ height: 38, width: "100%", justifyContent: 'center', opacity: 1, borderRadius: 12 }} imageStyle={{ opacity: 1, borderRadius:12 }} resizeMode='contain' source={require('../assets/addimagebtn.png')} />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={saveChapter}>
              <ImageBackground style={{ height: 76, width: "100%", opacity: 1, borderRadius: 12 }} imageStyle={{ opacity: 1, borderRadius:12 }} resizeMode='cover' source={require('../assets/savechapterbtn.png')} />
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </ImageBackground>
   );
  }


  return (
    <ImageBackground style={styles.imgBackground } imageStyle={{ opacity: 1 }} resizeMode='cover' source={require('../assets/chaptersbg.png')}>
      <StatusBar barStyle="dark-content"/>
      <SafeAreaView style={{flex: 1}}>
        <View style={{ marginBottom: 5, marginTop: -19, opacity: 1, justifyContent: "center", alignItems: 'center', textAlign: 'center' }}>
          <ImageBackground style={styles.icon} imageStyle={{ opacity: 1 }} resizeMode='contain' source={require('../assets/chapterstitle.png')} /> 
        </View>

        <View style={styles.header}>
          <View style={styles.searchRow}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search Chapters"
              placeholderTextColor="rgba(88, 79, 79, 0.62)"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity onPress={() => parseCategories(chapters, searchQuery)} style={styles.searchBtn}>
              <ImageBackground style={{ height:"100%", width:"100%",}} resizeMode='contain' source={require('../assets/binocularsicon.png')}/>         
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {setSearchQuery(''); parseCategories(chapters, null);}} style={styles.clearBtn}>
              <ImageBackground style={{ height:"100%", width:"100%",}} resizeMode='contain' source={require('../assets/reloadicon.png')}/>         
            </TouchableOpacity>
          </View>

          <View style={{flexDirection:'row', alignItems:'center', justifyContent: 'center', marginBottom: 1, minHeight: 73, width:"100%"}}>
            <TouchableOpacity onPress={() => { setCurrentChapter(null); setChapterTitle(""); setChapterCategory(""); setChapterDesc(""); setSelectedIds([]); setSections([]); setPrevMode("main"); setMode("add"); } } style={styles.plusIcon}>
              <ImageBackground style={{ height:"100%", width:"100%"}} resizeMode='contain' source={require('../assets/addchaptericon.png')}/>         
            </TouchableOpacity> 
            <TouchableOpacity onPress={handleImportChapters} style={styles.importIcon}>
              <ImageBackground style={{ height:"100%", width:"100%",}} resizeMode='contain' source={require('../assets/importmoveicon.png')}/>         
            </TouchableOpacity>
            <TouchableOpacity onPress={showInstructions} style={styles.infoIcon}>
              <ImageBackground style={{ height:"100%", width:"100%",}} resizeMode='contain' source={require('../assets/mydojostylesinfoicon.png')}/>         
            </TouchableOpacity>
          </View>
        </View>

        {schapters.length > 0 ? (
          <FlatList
           data={schapters}
           extraData={chapters}
           style={{flex: 1}}
           keyExtractor={item => item.id}
           ListHeaderComponent={MyHeader}
           contentContainerStyle = {{ paddingBottom: 30, flexGrow: 1, }}
           ItemSeparatorComponent={({ leadingItem }) => {
            return <View style={styles.smallGap} />;
           }}
           renderItem={({ item }) => (
            <View style={styles.card}>
              { item && item.category && 
                ( <TouchableOpacity
                  style={{ width: '77.7%', height: 57 }}
                  onPress={() => { setHchapters(getChapters(item.category, chapters)); setChapterCategory(item.category); setMode("list"); }}>
                  {item.id === 'c-all' ? 
                    ( <ImageBackground style={{flex: 1, justifyContent: 'center', alignItems: 'center'}} resizeMode='contain' source={require('../assets/allcategoriesbtn.png')} />
                    ) : (
                      <ImageBackground style={{flex: 1, justifyContent: 'center', alignItems: 'center'}} resizeMode='contain' source={require('../assets/goldwhitebtn.png')}>
                        <Text numberOfLines={1} ellipsizeMode="clip" style={styles.cardText}>{item.category}</Text> 
                      </ImageBackground>
                  )}
                </TouchableOpacity>) 
              }
            </View>
           ) }
          /> ) : (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={styles.infoText}>Click on the gold + Chapter icon to add Chapters or use the import icon to import Chapters. You can share Chapters after adding or importing.</Text>
          </View>
        ) }
      </SafeAreaView>
     </ImageBackground>
  );
}


const styles = StyleSheet.create({
container: { flex: 1, backgroundColor: '#c2cdd4' },
flatlistContainer: { minWidth: "100%", flex: 1, paddingBottom: 5 },
imgBackground: {flex: 1, opacity: 1, maxHeight: "91%", minWidth: "100%", height: Dimensions.get('window').height, marginTop: "7%",},
sectionContainer: { marginBottom: 25, paddingLeft: 10, backgroundColor: 'rgba(250, 238, 69, 0.15)', opacity: 1 },
sectionHeader: { marginBottom: 9, flexDirection: 'row', opacity: 1, borderRadius: 7, justifyContent: 'center', alignItems: 'center'},
sectionHeaderText: { color: '#f3efbd', fontSize: 12, fontWeight: 'bold', backgroundColor: 'rgba(0,0,0,0.8)', textTransform: 'uppercase', letterSpacing: 1, alignSelf: "center", opacity: 1, borderRadius: 7, textAlign: 'center'},
typeBtn: { width: 45, height: 45, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginLeft: 12, marginTop: -7},
typeBtnText: {fontSize: 34 },
itemContainer: { width: width * 0.7, marginRight: 15, backgroundColor: 'rgba(0,0,0,0.8)', borderRadius: 15, borderWidth: 1, borderColor: '#333', overflow: 'hidden', marginBottom:12, opacity: 1},
verticalWrapper: { width: width * 0.9, alignSelf: 'center', marginBottom: 5 },
myDojoDiscardIcon: {height: 49, width: 49, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
selectedItem: { borderColor: '#f6f876', borderWidth: 2, backgroundColor: 'rgba(202, 176, 26, 0.6)' },
titleBanner: {width: '100%', padding: 5, borderRadius: 5, marginTop: 2 },
titleText: { textAlign: 'center', fontSize: 13, fontWeight: 'bold', color: '#dabe42', alignSelf: "flex-start", overflow: "hidden" },
thumbImage: { width: "100%", height: 152, backgroundColor: '#1a1a1a', justifyContent: 'center', alignItems: 'center' },
thumbPdf: { width: "100%", height: 76, resizeMode: 'contain', backgroundColor: '#1a1a1a', justifyContent: 'center', alignItems: 'center' },
myDojoDeleteIcon: {height: 49, width: 49, borderRadius: 0,  alignItems: 'center', justifyContent: 'center' },
pillRow: { backgroundColor: 'rgba(43, 37, 0, 0.5)',flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 3, marginTop: 8, borderRadius: 9, opacity: 1 },
typePill: { backgroundColor: 'rgba(190, 190, 190, 0.19)', color: '#e6cc5a', fontSize: 10, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 5 },
batchBar: { position: 'absolute', bottom: 49, left: 20, right: 20, flexDirection: 'row', backgroundColor: '#1a1a1a', padding: 15, borderRadius: 30, alignItems: 'center', justifyContent: 'space-around', borderWidth: 1, borderColor: '#b39514', elevation: 10 },
batchText: { color: '#b39020', fontWeight: 'bold'},
shareIcon: { height: 49, width: 49, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
banner: { width: '100%', height: 57, borderRadius: 12, marginBottom: 10 },
header: { flexDirection: 'column', width: "95%", minHeight: 76, backgroundColor: 'rgba(195, 209, 223, 0.4)', borderWidth: 1, borderColor: '#c2cdd4',justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginBottom: 5, },
myDojoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, backgroundColor: 'rgba(0,0,0,0.76)', opacity: 1 },
title: { fontSize: 17, fontWeight: 'bold', color: '#a08016', height: 38, width: '100%', textAlign: 'center', marginBottom: 2 },
infoText: { fontSize: 14, fontWeight: 'bold', color: '#c29d26', minHeight: 76, width: '94%', textAlign: 'center', marginTop: -95, paddingHorizontal: 19, backgroundColor: 'rgba(0,0,0,0.5)' },
icon: { height: 57, width: '89%', alignSelf: 'center', textAlign: 'center', marginLeft: 19, marginBottom: 3, opacity: 1 },
card: { marginHorizontal: 12, marginVertical: 5, alignItems: 'center', borderRadius: 10, width: "100%", opacity: 1 },
sectionCard: { padding: 12, justifyContent: 'center', alignItems: 'center', alignSelf: "center", backgroundColor: 'rgba(0,0,0,0.76)', borderRadius: 10, width: "95%", opacity: 1, borderBottomWidth: .5, borderBottomColor: '#f3efbd' },
cardText: { fontSize: 16, fontWeight: 'bold', color: '#5a4f0f', paddingHorizontal: 5,},
goldDivider: {width: '57%', height: 43, alignSelf: 'center', marginVertical: 15, shadowColor: '#edf7d6', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 10, opacity: 1},
smallGap: {height: 12,},
cardInternal:{ padding: 10, backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 10 },
plusIcon: { height: 57, width: 76, backgroundColor: 'rgba(0,0,0,0.57)', borderRadius: 12, marginLeft: 15, marginRight: 7, opacity: 1},
editIcon: { height: 57, width: 55, borderRadius: 4, marginLeft: 12, opacity: 1 },
infoIcon: { height: 47, width: 47, marginLeft: 21, marginBottom: 5, opacity: 1 },
importIcon: {height: 76, width: 67, borderRadius: 9, marginLeft: 12 },
imgBackgroundAM: {  ...StyleSheet.absoluteFillObject, flex: 1 },
iconAM: { height: 61, width: '95%', alignSelf: 'center', textAlign: 'center', marginLeft: 25, marginBottom: 3, opacity: 1 },
videoIcon: { height: 95, width: 114, marginLeft: 12, borderRadius: 2, marginTop: 45, justifyContent: 'center', alignItems: 'center'},
videoIconUploaded: { height: 114, width: 95, marginLeft: 12, backgroundColor: 'rgba(72, 243, 163, 0.4)', borderRadius: 10, marginTop: 57, justifyContent: 'center', alignItems: 'center',borderWidth: 1, borderColor: '#f84444',borderStyle: 'dashed'},
pdfIcon: { height: 76, width:76, backgroundColor: 'hsla(204, 77%, 48%, 0.17)', borderRadius: 2, marginTop: 5, justifyContent: 'center', alignItems: 'center', marginLeft: 12},
pdfIconText: { color: '#020142', fontWeight: 'bold', fontSize: 12, marginLeft: 4 },
videoIconText: { color: '#420105', fontWeight: 'bold', fontSize: 12 },
plusIconAM: { height: 51, width: 46, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 7, marginRight: 19, marginBottom: 2, opacity: 1},
plusIconText: { color: '#420105', fontWeight: 'bold', fontSize: 10 },
containerAM: { flex: 1, opacity: 1, width: "100%", paddingHorizontal: 19 },
headerTitle: { fontSize: 17, fontWeight: 'bold', color: '#181503', marginTop:7, marginBottom: 3, marginLeft: 43, backgroundColor: 'rgba(219, 208, 44, 0.67)', textDecorationLine: 'underline', textDecorationColor: '#423c01', textDecorationStyle: 'solid', borderRadius: 7, alignSelf: "flex-start", paddingHorizontal: 4, paddingVertical: 1,},
label: { fontWeight: 'bold', color: '#f3efbd', marginTop: 12, fontSize: 12, marginLeft:12 },
input: { borderWidth: 2.5, borderColor: '#998308', borderRadius: 12, padding: 5, marginTop: 7, backgroundColor: 'rgba(235, 224, 71, 0.62)', opacity: 1, fontWeight: "bold", fontSize: 13 },
pdfinput: { borderWidth: 1, borderColor: '#436fff', borderRadius: 12, padding: 8, marginTop: 7, backgroundColor: 'rgba(28, 142, 218, 0.17)', opacity: 1, fontWeight: "bold" },
stepRow: { flexDirection: 'column', marginTop: 7, alignItems: 'center', padding: 10, borderRadius: 10, elevation: 1 },
stepImg: { width: '100%', height: '100%' },
chapterInput: { borderWidth: 3, borderColor: '#ad9611', padding: 8, marginTop: 7, backgroundColor: 'rgba(241, 243, 227, 0.82)', borderRadius: 12, opacity: 1, fontWeight: "bold", fontSize: 13},
removeText: { color: '#dc2626', fontSize: 10, textAlign:'center', marginTop: 1, fontWeight: 'bold', width: '100%' },
removeStepIcon:{alignItems: 'center', justifyContent: 'center', marginTop: 38, marginBottom: 57, height: 95, width: 76, flexDirection: 'column', backgroundColor: 'rgba(255, 0, 0, 0.1)', borderRadius: 20, borderWidth: 1, borderColor: '#ff4d4d', opacity: 1},
addSectionBtn: {marginTop: 5, height: 47, width: 114, alignSelf:'center', alignItems: 'center', justifyContent:'center', opacity: 1, marginRight: 19},
addPdfSectionBtn: {marginTop: 5, height: 41, width: 114, alignSelf:'center', alignItems: 'center', justifyContent:'center', opacity: 1, marginLeft: 3},
addImgSectionBtn: {marginTop: 24, height: 76, width: 125, opacity: 1, alignSelf:'center', alignItems: 'center', marginLeft: 19},
addAudioSectionBtn: {marginTop: 5, height: 57, width: 140, opacity: 1, marginLeft: 15, alignSelf:'center',},
addSectionButtons: {marginTop: 5, width: "100%", flexDirection: "row", opacity: 1, alignItems: 'center', justifyContent: 'center'},
addSectionContainer: {marginTop: 38, width: "100%", flexDirection: "column", opacity: 1, justifyContent:'center', alignItems: 'center',},
saveBtn: { width: 133, height: 114, borderRadius: 15, marginTop: -12, alignSelf:'center' },
discardBtn: { marginBottom: 9, marginLeft: 12, height: 70, width: 67, borderRadius: 10, justifyContent: 'center', alignItems: 'center', opacity: 1},
discardText: { textAlign: 'center', color: '#dc2626', fontWeight: 'bold', fontSize: 10, marginTop: 1, height: 15, width: '100%' },
orText: { color: '#f3efbd', fontWeight: 'bold', fontSize: 16, marginTop: 19, marginBottom: -7, marginLeft: 38 },
stepImgContainer: { width: 95, height: 95, justifyContent: 'center', alignItems: 'center', borderRadius: 12, borderWidth: 0, opacity: 1},
searchRow: { flexDirection: 'row', paddingHorizontal: 9, paddingVertical: 4,  gap: 8, marginBottom: 7, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 9, alignItems: 'center', justifyContent: 'center', width: "100%", borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
searchInput: { height: 38, width: "70%", backgroundColor: 'rgba(255, 255, 255, 0.79)', borderRadius: 8, paddingHorizontal: 8, color: 'black', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', fontSize: 11},
searchBtn: { width: 39, height: 37, backgroundColor: '#e7f5ed4f', borderRadius: 8, justifyContent: 'center', alignItems: 'center', opacity: 1, paddingHorizontal: 2},
silverDivider: { width: '99%', height: 49, alignSelf: "center", paddingVertical: 1, opacity: 1 },
clearBtn: { width: 32, height: 32, backgroundColor: '#31303080', borderRadius: 8, justifyContent: 'center', alignItems: 'center',},
vcToggleBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#8d7f30', justifyContent: 'center', alignItems: 'center',},
vcToggleText: {color: 'white', fontSize: 16, fontWeight: 'bold'},
vcHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#0c1429a9', paddingHorizontal: 16, paddingVertical: 3, borderBottomWidth: 2, borderBottomColor: '#99840f' },
vcTitle: { flex: 1, color: 'white', fontSize: 14, fontWeight: 'bold', textAlign: 'center', marginHorizontal: 10 },
vcDropdownContainer: {width: '96%', maxHeight: height * 0.21, alignSelf: 'center', backgroundColor: '#1e293b', borderRadius: 10, padding: 3, marginTop: 5, borderWidth: 1, borderColor: '#99840f', overflow: 'hidden', flexDirection: "row"},
vcInfoRow: { alignItems: 'center', marginBottom: 4},
vcInfoLabel: { color: '#8d7f30',  fontSize: 11, fontWeight: 'bold', width: "95%"},
vcInfoText: { color: '#cbd5e1', fontSize: 11, fontWeight: 'bold' },
vcDescSection: { backgroundColor: '#1e293b', padding: 3, borderRadius: 12, borderWidth: 1, borderColor: '#99840f' },
vcDescLabel: { color: '#8d7f30', fontSize: 12, fontWeight: 'bold', marginBottom: 1 },
vcDescScroll: { maxHeight: height * 0.09 },
vcDescText: { color: 'honeydew', fontSize: 12, lineHeight: 15, marginVertical: 1 },
fullscreenClose: { position: 'absolute', top: 50, right: 20, zIndex: 100, backgroundColor: 'rgba(0,0,0,0.7)', padding: 12, borderRadius: 8 },
fullscreenCloseText: { color: 'white', fontWeight: 'bold' },
toggleModeBtn: { alignSelf: 'center', marginTop: 45, marginBottom: 19, paddingVertical: 5, paddingHorizontal: 5, backgroundColor: 'rgba(212, 175, 55, 0.12)', borderRadius: 6, borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.5)', flexDirection: "row" },
toggleModeText: { color: '#f3efbd', fontSize: 14, fontWeight: '600', marginLeft: 4 },
});