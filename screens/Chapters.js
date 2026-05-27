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

const { width } = Dimensions.get('window');
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
      "Intructions: Save, Edit, View, Share, Delete and Import Chapters using iDojo. You may add any number of Chapters your phone memory allows. Click the binoculars to search Chapters by the search term entered.\n(1) Use the gold, plus(+) icon in the top menu bar to Add Chapters. Every Chapter must contain at least one Section. You can either add a Video, Audio, PDF or Image to a Section. A title and media is required for all Sections of a Chapter. The default allcategories, will be used when a Chapter Category is not entered.\n(2) Click on one of the gold and white buttons in the Chapters Screen to see all Chapters with the same Category. The first Category button in the list is All Categories in gold. Media in Setions can contain online links or a file uploaded from the phone. A reload🔄 button is provided in the dropdown at the top when viewing online PDFs.\n(3) On the list screen press and hold a move card to see the batch bar appear, after select all Chapters to share or delete and click on the share or delete button in the batch bar to share or delete Chapters. Use the Edit button at the bottom of each Chapter card in the list to edit a Chapter, and to view any Chapter just click on its Chapter card. When viewing a video Chapters click the red arrow to the right to the title to share the individual video. When viewing a Chapters press the square to see fullscreen mode appear, then click the red, green or blue share arrow to share a Section. Chapters can only be shared and imported with the iDojo App, only single videos, images and PDFs can be shared externally.\n(4) Scroll horizontally and vertically on the All categories list screen to view all your Chapters. On the add Chapters screen click the save button to save Chapters. When adding Section with the Add Chapter screen click one of the 4 buttons above the gold save button, to add a Scetion. The -section icon is provided for removing Sections.",
      [ { text: "OK",
        onPress: () => setMode("main"),
          style: "cancel" 
      }],
      { cancelable: false } 
    );
  };



  const parseCategories = (list, query) => {
    if (!Array.isArray(list)) {
      Alert.alert("Data Error", "Data is not an array, skipping parse.");
      return;
    }
  
    let chapterCategories = [];
    let cCategories = [{ id: "c-all", category: "allcategories" }];
  
    try {
      const validList = list.filter(m => m && m.id && m.title && m.category);    
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
    if( !chaptersList ) return [];
    let sChapters = chaptersList.filter(m => (cat === "allcategories" || m.category === cat));
    if(cat === "allcategories") return parseHChapters(sChapters);
    return sChapters;
  }

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



  const loadChapters = async () => {
    try {
      if (isLoadingRef.current) return; 
      isLoadingRef.current = true;
      setLoading(true);

      const fileUri = `${FileSystem.documentDirectory}chapters.json`;
      const info = await FileSystem.getInfoAsync(fileUri);
      
      if (info.exists) {
        const content = await FileSystem.readAsStringAsync(fileUri);
        const loadedChapters = JSON.parse(content);
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
        setChapterCategory('Enter Category');
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
    const actualIds = Array.isArray(idsFromArg) && idsFromArg.length > 0 ? idsFromArg : selectedIds;
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
                await FileSystem.deleteAsync(folderUri, { idempotent: true });
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


  const viewChapter = (chapter) => {
    setCurrentChapter(chapter);
    setMode("view");
  };


  const getChapterThumbnail = (chapter) => {
    if (!chapter.sections?.length) return null;
    for (const section of chapter.sections) {
      if (section.type === 'image' && (section.mediaUri || section.mediaUrl)) {
        return section.mediaUri || section.mediaUrl;
      }
      if (section.type === 'video') {
        if (section.mediaUrl?.includes('youtube.com') || section.mediaUrl?.includes('youtu.be')) {
          const id = section.mediaUrl.match(/(?:youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/)?.[1];
          if (id) return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
        }
        if (section.mediaUri) return section.mediaUri;
      }
    }
    return require('../assets/onlinevideoicon.png');
  };



  const shareChapters = async (chapterIds) => {
    if (!chapterIds?.length) return;
    
    try {
      setLoading(true);
      const shareDir = `${FileSystem.cacheDirectory}chapters_export_${Date.now()}/`;
      await FileSystem.makeDirectoryAsync(shareDir, { intermediates: true });
      const chaptersToShare = chapters.filter(c => chapterIds.includes(c.id));
      for (let i = 0; i < chaptersToShare.length; i++) {
        const chapter = chaptersToShare[i];
        const chapterDir = `${shareDir}chapter_${i}/`;
        await FileSystem.makeDirectoryAsync(chapterDir, { intermediates: true });
        
        for (let j = 0; j < chapter.sections.length; j++) {
          const section = chapter.sections[j];
          if (section.mediaUri && section.mediaUri.startsWith('file://')) {
            const ext = section.mediaUri.split('.').pop();
            const dest = `${chapterDir}section_${j}.${ext}`;
            await FileSystem.copyAsync({ from: section.mediaUri, to: dest });
            section.mediaUri = `section_${j}.${ext}`;
          }
        }
        
        await FileSystem.writeAsStringAsync(
          `${chapterDir}chapter.json`, 
          JSON.stringify(chapter)
        );
      }
      const manifest = {
        app: 'iDojo',
        version: 1,
        count: chaptersToShare.length,
        exportDate: new Date().toISOString()
      };
      await FileSystem.writeAsStringAsync(`${shareDir}manifest.json`, JSON.stringify(manifest));
      const zipPath = `${FileSystem.cacheDirectory}iDojo_Chapters_${Date.now()}.zip`;
      await zip(shareDir.replace('file://', ''), zipPath.replace('file://', ''));
      await Sharing.shareAsync(zipPath, {
        dialogTitle: `Share ${chaptersToShare.length} Chapters`,
        mimeType: 'application/zip'
      });
      await FileSystem.deleteAsync(shareDir, { idempotent: true });
      
    } catch (e) {
      Alert.alert('Share Error', e.message);
    } finally {
      setLoading(false);
      setSelectedIds([]);
    }
  };


  
  const handleImportChapters = async () => {
    let extractDir = null;
    
    try {
      const res = await DocumentPicker.getDocumentAsync({ 
        type: 'application/zip',
        copyToCacheDirectory: true 
      });
      
      if (res.canceled) return;
      setLoading(true);
      
      const zipUri = res.assets[0].uri;
      const importId = Date.now().toString();
      extractDir = `${FileSystem.documentDirectory}imported_chapters_${importId}/`;
      
      await FileSystem.makeDirectoryAsync(extractDir, { intermediates: true });
      await unzip(zipUri.replace('file://', ''), extractDir.replace('file://', ''));
      
      let manifest = { count: 1 };
      try {
        const manifestContent = await FileSystem.readAsStringAsync(`${extractDir}manifest.json`);
        manifest = JSON.parse(manifestContent);
      } catch (e) {
      
      }
      
      const importedChapters = [];
      const chapterDirs = manifest.count > 1 ? Array.from({length: manifest.count}, (_, i) => `chapter_${i}/`) : [''];
      
      for (const dir of chapterDirs) {
        const chapterPath = `${extractDir}${dir}chapter.json`;
        const info = await FileSystem.getInfoAsync(chapterPath);
        if (!info.exists) continue;
        
        const content = await FileSystem.readAsStringAsync(chapterPath);
        const chapter = JSON.parse(content);

        const chapterMediaDir = `${extractDir}${dir}`;
        chapter.sections.forEach((section, idx) => {
          if (section.mediaUri && !section.mediaUri.startsWith('http')) {
            section.mediaUri = `${chapterMediaDir}${section.mediaUri}`;
          }
        });
        
        chapter.id = `chapter_${importId}_${Math.random().toString(36).substr(2, 4)}`;
        importedChapters.push(chapter);
      }
      
      if (importedChapters.length === 0) throw new Error('No valid Chapters found');
      
      const updatedList = [...chapters, ...importedChapters];
      await saveChaptersToStorage(updatedList);
      
      Alert.alert('Success', `${importedChapters.length} Chapters imported!`);
      
    } catch (e) {
      Alert.alert('Import Failed', e.message);
    } finally {
      setLoading(false);
      if (extractDir) {
        try { await FileSystem.deleteAsync(extractDir, { idempotent: true }); } catch (err) {}
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
        setChapterCategory("Enter Chapter Category");
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
    setChapterCategory(chapterCategory || "Enter Chapter Category");
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
      Alert.alert('Required', 'Add at least one section');
      return;
    }
    for (const section of sections) {
      if (!section.title.trim()) {
        Alert.alert('Required', 'All sections need a Title');
        return;
      }
      if (!section.mediaUri && !section.mediaUrl.trim()) {
        Alert.alert('Required', `Section "${section.title}" needs Media`);
        return;
      }
    }

    const chapterData = {
      id: chapterId || Date.now().toString(),
      title: chapterTitle.trim(),
      category: chapterCategory.trim(),
      description: chapterDesc.trim(),
      sections: sections,
      updatedAt: new Date().toISOString(),
    };

    await handleSaveChapter(chapterData);
  };




  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };


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
              source={ (() => {
                return getChapterThumbnail(item);
          })() } />
  
          <View style = {styles.pillRowVideo}>
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
        </View>  

        <FlatList
          data={currentChapter.sections}
          keyExtractor={(item) => item.id}
          style = {{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 30 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <SectionPlayer
              section={item}
              index={index}
              isActive={activeSectionId === item.id}
              onActivate={() => setActiveSectionId(item.id)}
              onDeactivate={() => setActiveSectionId(null)}
            />
          )}
        />
      </SafeAreaView>
    );
  }



  if (mode === 'list') {
    return (
      <ImageBackground style={{flex: 1, width: '100%', height: '100%', opacity: 1}} resizeMode='cover' imageStyle={{ opacity: 0.7 }} source={require('../assets/chapterslistbg.png')}>
        <StatusBar barStyle="light-content"/>
        <SafeAreaView style={{ flex: 1}}>
          <View style={{marginBottom: 12, paddingHorizontal: 5, justifyContent: 'center', alignItems: 'center', opacity: 1}}>
            <ImageBackground style={ styles.icon } resizeMode='contain' imageStyle={{ opacity: 1 }} source={ require('../assets/chapterslistttitle.png') } /> 
          </View>
    
            <View style={styles.myDojoHeader}>
              <Text style={{ color: '#caaf38', fontSize: 12, flex: 1, textTransform: 'uppercase' }}>{ chapterCategory === "allcategories" ? "ALL CATEGORIES" : "CATEGORY TITLE: "+chapterCategory}</Text>
                
              <View style={{flexDirection:'row'}}>
                <TouchableOpacity onPress={() => {setMode("main"); setPrevMode("main"); setSelectedIds([]);} } style={styles.plusIconAM}>
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
                    <Text style={{color: 'white', marginBottom: 10, fontWeight: 'bold', fontSize: 15}}>Please Reload</Text>
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
    <ImageBackground source={require('../assets/chaptersbg.png')} style={styles.imgBackground} imageStyle={{ opacity: 0.7 }} resizeMode='cover' >
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1 , opacity: 1}}>

          <View style={{ marginBottom: 12, paddingLeft: 5, paddingRight:5, marginTop: 25, opacity : 1}}>
            <ImageBackground style={ styles.iconAM } resizeMode='contain' imageStyle={{ opacity: 1 }} source={chapterId ? require('../assets/editchaptertitle.png')  : require('../assets/addchaptertitle.png') } /> 
          </View>

          <TouchableOpacity onPress={() => { resetForm(); setMode('list'); }} style={styles.discardBtn}>
            <ImageBackground style={{ alignSelf:'center', height:67, width:"100%", opacity: 1}} imageStyle={{ opacity: 1 }} resizeMode='contain' source={require('../assets/discardicon.png')}/>
            <Text style={styles.discardText}>CANCEL</Text>
          </TouchableOpacity>

          <ScrollView style={styles.containerAM} contentContainerStyle={{ paddingBottom: 100 }}>
            <Text style={styles.label}>Chapter Title</Text>
            <TextInput
              style={[styles.input, styles.chapterInput]}
              placeholder="Enter Chapter Category"
              placeholderTextColor="rgba(249, 250, 223, 0.6)"
              value={chapterCategory}
              onChangeText={setChapterCategory}
            />

            <Text style={styles.label}>Chapter Category</Text>
            <TextInput
              style={[styles.input, styles.chapterInput]}
              placeholder="Enter Chapter Title"
              placeholderTextColor="rgba(249, 250, 223, 0.6)"
              value={chapterTitle}
              onChangeText={setChapterTitle}
            />
            
            <TextInput
              style={[styles.input, styles.descInput]}
              placeholder="Enter Chapter Description"
              placeholderTextColor="rgba(249, 250, 223, 0.6)"
              value={chapterDesc}
              onChangeText={setChapterDesc}
              multiline={true}
            />

            {sections.map((section, index) => (
              <View key={section.id} style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionNumber}>Section {index + 1}</Text>
                  <TouchableOpacity onPress={() => removeSection(section.id)} style={styles.removeStepIcon}>
                    <ImageBackground style={{ height: 91, width: "100%", }} imageStyle={{ opacity: 1 }} resizeMode='contain' source={require('../assets/removesectionicon.png')}/>
                  </TouchableOpacity>
                </View>

                <View style={styles.typeToggleContainer}>
                  {Object.values(SECTION_TYPES).map(type => (
                    <TouchableOpacity
                      key={type}
                      style={[styles.typeBtn, section.type === type && styles.typeBtnActive]}
                      onPress={() => updateSection(section.id, 'type', type)} >
                        
                      <Text style={[styles.typeBtnText, section.type === type && styles.typeBtnTextActive]}>
                        {type === 'video' ? '📹' : type === 'pdf' ? '📄' : type === 'audio' ? '🎵' : '🖼️'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

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
                      <Text style={styles.changeMediaText}>Change</Text>
                    </View>
                  ) : (
                    <View style={[styles.videoIcon, section.type === "video" ? { backgroundColor: 'rgba(212, 29, 54, 0.1)' } : section.type === "pdf" ? { backgroundColor: 'rgba(8, 169, 153, 0.1)' } : section.type === "audio" ? { backgroundColor: 'rgba(183, 0, 255, 0.1)' } : { backgroundColor: 'rgba(11, 97, 18, 0.1)' }]}>
                      <ImageBackground 
                        style={{ alignSelf: 'center', height: 67, width: 76, opacity: 1 }} 
                        resizeMode='contain'
                        source={section.type === SECTION_TYPES.VIDEO ? require('../assets/uploadvideobg.png') : section.type === SECTION_TYPES.PDF ? require('../assets/uploadpdfbg.png') : section.type === SECTION_TYPES.AUDIO ? require('../assets/uploadaudiobg.png') : require('../assets/uploadimagebg.png')} />
                    </View>
                  )}
                </TouchableOpacity>

                <Text style={styles.orText}>— OR —</Text>
                
                <TextInput
                  style={styles.input}
                  placeholder={`Enter ${section.type} URL`}
                  placeholderTextColor="#726b6b"
                  value={section.mediaUrl}
                  onChangeText={(text) => updateSection(section.id, 'mediaUrl', text)}
                  autoCapitalize="none"
                />

                <TextInput
                  style={[styles.input, styles.descInput]}
                  placeholder="Enter Section Description"
                  placeholderTextColor="#726b6b"
                  value={section.desc}
                  onChangeText={(text) => updateSection(section.id, 'description', text)}
                  multiline
                  numberOfLines={2}
                />
              </View>
            ))}

            <View style={styles.addSectionContainer}>
              <View style={styles.addSectionButtons}>
                <TouchableOpacity style={[styles.addSectionBtn, { backgroundColor: '#ff525248' }]} onPress={() => addSection(SECTION_TYPES.VIDEO)}>
                  <ImageBackground style={{ height: 38, width: "100%", justifyContent: 'center', opacity: 1, borderRadius: 12 }} imageStyle={{ opacity: 1, borderRadius:12 }} resizeMode='contain' source={require('../assets/addvideobtn.png')} />
                </TouchableOpacity>

                <TouchableOpacity style={[styles.addSectionBtn, { backgroundColor: '#082a9967' }]} onPress={() => addSection(SECTION_TYPES.PDF)}>
                  <ImageBackground style={{ height: 38, width: "100%", justifyContent: 'center', opacity: 1, borderRadius: 12 }} imageStyle={{ opacity: 1, borderRadius:12 }} resizeMode='contain' source={require('../assets/addpdfbtn.png')} />
                </TouchableOpacity>
              </View>

              <View style={styles.addSectionButtons}>
                <TouchableOpacity style={[styles.addSectionBtn, { backgroundColor: '#b700ff3b' }]} onPress={() => addSection(SECTION_TYPES.AUDIO)}>
                  <ImageBackground style={{ height: 38, width: "100%", justifyContent: 'center', opacity: 1, borderRadius: 12 }} imageStyle={{ opacity: 1, borderRadius:12 }} resizeMode='contain' source={require('../assets/addaudiobtn.png')} />
                </TouchableOpacity>

                <TouchableOpacity style={[styles.addSectionBtn, { backgroundColor: '#0b611248' }]} onPress={() => addSection(SECTION_TYPES.IMAGE)}>
                  <ImageBackground style={{ height: 38, width: "100%", justifyContent: 'center', opacity: 1, borderRadius: 12 }} imageStyle={{ opacity: 1, borderRadius:12 }} resizeMode='contain' source={require('../assets/addimagebtn.png')} />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={saveChapter}>
              <ImageBackground style={{ height: 47, width: "100%", justifyContent: 'center', opacity: 1, borderRadius: 12 }} imageStyle={{ opacity: 1, borderRadius:12 }} resizeMode='contain' source={require('../assets/savechapterbtn.png')} />
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
        <View style={{ marginBottom: 5, marginTop: -19, paddingHorizontal: 4, opacity: 1, justifyContent: "center", alignItems: 'center'}}>
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
            <TouchableOpacity onPress={() => parseChapters(chapters, searchQuery)} style={styles.searchBtn}>
              <ImageBackground style={{ height:"100%", width:"100%",}} resizeMode='contain' source={require('../assets/binocularsicon.png')}/>         
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {setSearchQuery(''); parseChapters(chapters, null);}} style={styles.clearBtn}>
              <ImageBackground style={{ height:"100%", width:"100%",}} resizeMode='contain' source={require('../assets/reloadicon.png')}/>         
            </TouchableOpacity>
          </View>

          <View style={{flexDirection:'row', alignItems:'center', justifyContent: 'center', marginBottom: 1, minHeight: 51, width:"100%"}}>
            <TouchableOpacity onPress={() => { setCurrentChapter(null); setChapterTitle(""); setChapterCategory(""); setChapterDesc(""); setSelectedIds([]); setSections([]); setPrevMode("main"); setMode("add"); } } style={styles.plusIcon}>
              <ImageBackground style={{ height:"100%", width:"100%", }} resizeMode='contain' source={require('../assets/addchaptericon.png')}/>         
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
                  style={{ width: '79%', height: 43 }}
                  onPress={() => { setHChapters(getChapters(item.category, chapters)); setChapterCategory(item.category); setMode("list"); }}>
                  {item.id === 'c-all' ? 
                    ( <ImageBackground style={{flex: 1, justifyContent: 'center', alignItems: 'center'}} resizeMode='stretch' source={require('../assets/allcategoriesbtn.png')} />
                    ) : (
                      <ImageBackground style={{flex: 1, justifyContent: 'center', alignItems: 'center'}} resizeMode='stretch' source={require('../assets/goldwhitebtn.png')}>
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
imgBackground: { flex: 1, opacity: 1, maxHeight: "91%", minWidth: "100%", height: Dimensions.get('window').height, marginTop: "7%",},
sectionContainer: { marginBottom: 25, paddingLeft: 10, backgroundColor: 'rgba(250, 238, 69, 0.15)', opacity: 1 },
sectionHeader: { color: '#c7a63b', fontSize: 13, fontWeight: 'bold', marginBottom: 9, textTransform: 'uppercase', letterSpacing: 1, backgroundColor: 'rgba(255, 255, 253, 0.91)', alignSelf: "flex-start", opacity: 1, borderRadius: 7, paddingHorizontal: 4,},
itemContainer: { width: width * 0.7, marginRight: 15, backgroundColor: 'rgba(0,0,0,0.8)', borderRadius: 15, borderWidth: 1, borderColor: '#333', overflow: 'hidden', marginBottom:12, opacity: 1},
verticalWrapper: { width: width * 0.9, alignSelf: 'center', marginBottom: 5 },
myDojoDiscardIcon: {height: 49, width: 49, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
selectedItem: { borderColor: '#f6f876', borderWidth: 2, backgroundColor: 'rgba(202, 176, 26, 0.6)' },
titleBanner: {width: '100%', padding: 5, borderRadius: 5, marginTop: 2 },
titleText: { textAlign: 'center', fontSize: 13, fontWeight: 'bold', color: '#8b6e0f', alignSelf: "flex-start", overflow: "hidden" },
thumbImage: { width: "100%", height: 152, backgroundColor: '#1a1a1a', justifyContent: 'center', alignItems: 'center' },
thumbPdf: { width: "100%", height: 76, resizeMode: 'contain', backgroundColor: '#1a1a1a', justifyContent: 'center', alignItems: 'center' },
myDojoDeleteIcon: {height: 49, width: 49, borderRadius: 0,  alignItems: 'center', justifyContent: 'center' },
pillRow: { backgroundColor: 'rgba(43, 37, 0, 0.5)',flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 3, marginTop: 8, borderRadius: 9, opacity: 1 },
typePill: { backgroundColor: 'rgba(203, 212, 206, 0.38)', color: '#8b6e0f', fontSize: 10, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 5 },
batchBar: { position: 'absolute', bottom: 49, left: 20, right: 20, flexDirection: 'row', backgroundColor: '#1a1a1a', padding: 15, borderRadius: 30, alignItems: 'center', justifyContent: 'space-around', borderWidth: 1, borderColor: '#b39514', elevation: 10 },
batchText: { color: '#8b6e0f', fontWeight: 'bold'},
shareIcon: { height: 49, width: 49, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
banner: { width: '100%', height: 57, borderRadius: 12, marginBottom: 10 },
header: { flexDirection: 'column', width: "95%", minHeight: 76, backgroundColor: 'rgba(195, 209, 223, 0.4)', borderWidth: 1, borderColor: '#c2cdd4',justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginBottom: 5, },
myDojoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, backgroundColor: 'rgba(0,0,0,0.76)', opacity: 1 },
title: { fontSize: 17, fontWeight: 'bold', color: '#8b6e0f', height: 38, width: '100%', textAlign: 'center', marginBottom: 2 },
infoText: { fontSize: 14, fontWeight: 'bold', color: '#8b6e0f', minHeight: 76, width: '94%', textAlign: 'center', marginTop: -95, paddingHorizontal: 19, backgroundColor: 'rgba(0,0,0,0.5)' },
icon: { height: 57, width: '89%', alignSelf: 'center' },
card: { marginHorizontal: 12, marginVertical: 5, alignItems: 'center', borderRadius: 10, width: "100%", opacity: 1 },
cardText: { fontSize: 16, fontWeight: 'bold', color: '#ccb42c', paddingHorizontal: 5,},
goldDivider: {width: '57%', height: 43, alignSelf: 'center', marginVertical: 15, shadowColor: '#edf7d6', shadowOffset: { width: 0, height: 0 },shadowOpacity: 0.5, shadowRadius: 10, opacity: 1},
smallGap: {height: 12,},
cardInternal:{ padding: 10, backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 10 },
plusIcon: { height: 49, width: 76, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 7, marginLeft: 15, marginBottom: 2, opacity: 1},
editIcon: { height: 57, width: 55, borderRadius: 4, marginLeft: 12, marginBottom: 4, opacity: 1},
infoIcon: { height: 43, width: 43, marginLeft: 16, marginBottom: 5, opacity: 1, },
importIcon: {height: 61, width: 57, borderRadius: 9, marginLeft: 12, marginBottom: 3},
imgBackgroundAM: {  ...StyleSheet.absoluteFillObject, flex: 1, },
iconAM: { height: 57, width: '90%', alignSelf: 'center' },
videoIcon: { height: 76, width: 76, marginLeft: 12, backgroundColor: 'rgba(212, 29, 54, 0.1)', borderRadius: 2, marginTop: 5, justifyContent: 'center', alignItems: 'center'},
videoIconUploaded: { height: 76, width: 76, marginLeft: 12, backgroundColor: 'rgba(72, 243, 163, 0.4)', borderRadius: 10,marginTop: 5,justifyContent: 'center', alignItems: 'center',borderWidth: 1, borderColor: '#f84444',borderStyle: 'dashed'},
pdfIcon: { height: 76, width:76, backgroundColor: 'hsla(204, 77%, 48%, 0.17)', borderRadius: 2, marginTop: 5, justifyContent: 'center', alignItems: 'center', marginLeft: 12},
pdfIconText: { color: '#020142', fontWeight: 'bold', fontSize: 12, marginLeft: 4 },
videoIconText: { color: '#420105', fontWeight: 'bold', fontSize: 12 },
plusIconAM: { height: 51, width: 46, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 7, marginRight: 19, marginBottom: 2, opacity: 1},
plusIconText: { color: '#420105', fontWeight: 'bold', fontSize: 10 },
containerAM: { flex: 1, opacity: 1 },
headerTitle: { fontSize: 17, fontWeight: 'bold', color: '#181503', marginTop:7, marginBottom: 3, marginLeft: 43, backgroundColor: 'rgba(219, 208, 44, 0.67)', textDecorationLine: 'underline', textDecorationColor: '#423c01', textDecorationStyle: 'solid', borderRadius: 7, alignSelf: "flex-start", paddingHorizontal: 4, paddingVertical: 1,},
label: { fontWeight: 'bold', color: '#3d3806', marginTop: 12, fontSize: 13, marginLeft:12 },
input: { borderWidth: 1, borderColor: '#998308', borderRadius: 12, padding: 8, marginTop: 7, backgroundColor: 'rgba(247, 234, 61, 0.37)', opacity: 1, fontWeight: "semibold" },
pdfinput: { borderWidth: 1, borderColor: '#436fff', borderRadius: 12, padding: 8, marginTop: 7, backgroundColor: 'rgba(28, 142, 218, 0.17)', opacity: 1, fontWeight: "semibold" },
stepRow: { flexDirection: 'column', marginTop: 7, alignItems: 'center', padding: 10, borderRadius: 10, elevation: 1 },
stepImg: { width: '100%', height: '100%' },
stepInput: { borderWidth: 1, borderColor: '#083a1d', padding: 8, marginTop: 7, backgroundColor: 'rgba(80, 214, 145, 0.41)', borderRadius: 12, opacity: 1, fontWeight: "semibold"},
removeText: { color: '#dc2626', fontSize: 10, textAlign:'center', marginTop: 1, fontWeight: 'bold', width: '100%' },
removeStepIcon:{alignItems: 'center', justifyContent: 'center', marginTop:5, height:107, width:95, flexDirection: 'column', backgroundColor: 'rgba(255, 0, 0, 0.1)', borderRadius: 20, borderWidth: 1, borderColor: '#ff4d4d', opacity: 1},
addSectionBtn: {marginTop: 5, height: 41 ,width: 114, alignSelf:'center', alignItems: 'center',justifyContent:'center', opacity: 1},
addSectionButtons: {marginTop: 5, width: "100%", flexDirection: "row", backgroundColor: 'rgba(247, 231, 21, 0.16)', opacity: 1, alignSelf:'center', alignItems: 'center',justifyContent:'center'},
addSectionContainer: {marginTop: 5, width: "100%", flexDirection: "column",  backgroundColor: 'rgba(247, 231, 21, 0.16)', opacity: 1, alignSelf:'center', alignItems: 'center',justifyContent:'space-between'},
saveBtn: { width: 125, height: 97, borderRadius: 15, marginTop: 7, alignSelf:'center', alignItems: 'center', justifyContent:'center', },
discardBtn: { marginBottom: 9, marginLeft: 12, height: 70, width: 67, borderRadius: 10, justifyContent: 'center', alignItems: 'center', opacity: 1},
discardText: { textAlign: 'center', color: '#dc2626', fontWeight: 'bold', fontSize: 10, marginTop: 1, height: 15, width: '100%' },
stepImgContainer: { width: 77, height: 77, justifyContent: 'center', alignItems: 'center', borderRadius: 12, borderWidth: 0, opacity: 1},
searchRow: { flexDirection: 'row', paddingHorizontal: 9, paddingVertical: 4,  gap: 8, marginBottom: 7, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 9, alignItems: 'center', justifyContent: 'center', width: "100%", borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
searchInput: { height: 38, width: "70%", backgroundColor: 'rgba(255, 255, 255, 0.79)', borderRadius: 8, paddingHorizontal: 8, color: 'black', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', fontSize: 11},
searchBtn: { width: 39, height: 37, backgroundColor: '#e7f5ed4f', borderRadius: 8, justifyContent: 'center', alignItems: 'center', opacity: 1, paddingHorizontal: 2},
silverDivider: { width: '99%', height: 49, alignSelf: "center", paddingVertical: 1, opacity: 1 },
clearBtn: { width: 32, height: 32, backgroundColor: '#31303080', borderRadius: 8, justifyContent: 'center', alignItems: 'center',},
vcToggleBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#3b82f6', justifyContent: 'center', alignItems: 'center',},
vcToggleText: {color: 'white', fontSize: 16, fontWeight: 'bold'},
vcHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#0c1429a9', paddingHorizontal: 16, paddingVertical: 3, borderBottomWidth: 2, borderBottomColor: '#99840f' },
vcTitle: { flex: 1, color: 'white', fontSize: 12, fontWeight: 'bold', textAlign: 'center', marginHorizontal: 10 },
vcDropdownContainer: {width: '96%', maxHeight: height * 0.21, alignSelf: 'center', backgroundColor: '#1e293b', borderRadius: 10, padding: 3, marginTop: 5, borderWidth: 1, borderColor: '#99840f', overflow: 'hidden'},
vcInfoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4},
vcInfoLabel: { color: '#8d7f30',  fontSize: 11, fontWeight: 'bold', width: "95%"},
vcInfoText: { color: '#cbd5e1', fontSize: 11, fontWeight: 'bold' },
vcDescSection: { backgroundColor: '#1e293b', padding: 3, borderRadius: 12, borderWidth: 1, borderColor: '#99840f' },
vcDescLabel: { color: '#8d7f30', fontSize: 12, fontWeight: 'bold', marginBottom: 1 },
vcDescScroll: { maxHeight: height * 0.09 },
vcDescText: { color: 'honeydew', fontSize: 12, lineHeight: 15, marginVertical: 1 },
fullscreenClose: { position: 'absolute', top: 50, right: 20, zIndex: 100, backgroundColor: 'rgba(0,0,0,0.7)', padding: 12, borderRadius: 8 },
fullscreenCloseText: { color: 'white', fontWeight: 'bold' },
});