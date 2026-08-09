import { View, Text, TouchableOpacity, FlatList, Alert, StyleSheet, ActivityIndicator, ImageBackground, Image, Dimensions, AppState, Platform, StatusBar, ScrollView, TextInput, KeyboardAvoidingView, BackHandler } from 'react-native';
import { useNavigation, useFocusEffect, useIsFocused } from '@react-navigation/native';
import React, { useState, useCallback, useEffect  } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNetInfo } from "@react-native-community/netinfo";
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { zip, unzip } from 'react-native-zip-archive';
import * as ImagePicker from 'expo-image-picker';
import * as Sharing from 'expo-sharing';
import VideoPlayer from './VideoPlayer';
import PdfMove from './PdfMove';

const { width } = Dimensions.get('window');
    
export default function MyDojoStyles({route}) {
    const [loading, setLoading] = useState(true);
    const [moves, setMoves] = useState([]); 
    const [smoves, setSMoves] = useState([]);
    const navigation = useNavigation();

    const [listmode, setListMode] = useState(false);
    const [hmoves, setHMoves] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [selectedSingles, setSelectedSingles] = useState([]);

    const [ftype, setType] = useState('select move type');
    const [fstyle, setFStyle] = useState('Enter List Title');

    const [addmode, setAddMode] = useState(false);
    const [move, setMove] = useState(null);
    const [title, setTitle] = useState(move?.title || "");
    const [typeAM, setTypeAM] = useState(move?.type || "select mode");
    const [fstyleAM, setFStyleAM] = useState(move?.style || "");
    const [vid, setVid] = useState(move?.vid || null);
    const [desc, setDesc] = useState(move?.desc || "");
    const [videoUrl, setVideoUrl] = useState(move?.videoUrl || "");
    const [steps, setSteps] = useState(move?.steps || [{ id: Date.now().toString(), title:"", img: null, desc: "" }]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isPicking, setIsPicking] = useState(false);
    const [viewmode, setViewMode] = useState(0);

    const isOffline = useNetInfo().isConnected === false;
    const isLoadingRef = React.useRef(false);
    const isPickingRef = React.useRef(false);

    const bgColor = ['khaki', 'sandybrown', 'bisque', 'honeydew', 'darkkhaki', 'oldlace', 'papayawhip', 'lavender', 'wheat', 'mintcream', 'aliceblue', 'goldenrod', 'tan', 'lightsteelblue', 'burlywood', 'palegoldenrod', 'beige', 'azure'];


    const showInstructions = () => {
        Alert.alert(
          "My Dojo Moves List",
          "Intructions: Save, Edit, View, Share, Delete and Import Moves using iDojo. You may add any number of Moves your phone memory allows. Click the binoculars icon in the top menu bar to search Moves or type video/steps/pdf to filter by type.\n(1) Use the red, green and blue, plus(+) icons in the top menu bar to add Moves. You can either add Video/PDF Moves or, Step Moves with an image in each step, a title and description is required for all Moves. The default list title is Enter List Title will be used when no list title is entered on Adding or Editing a Move.\n(2) Click on one of the red, green or blue rectanglular buttons in the My Dojo Moves List to see all moves with the same Move list title. The first list title button for each type will have All Lists in silver. Video Moves can contain an online video link or a video file from the phone. Steps Moves,also called Manuals must contain an image added from the phone. PDF moves can contain an online link to a PDF or a PDF file uploaded from the phone. A reload🔄 button is provided in the dropdown at the top when viewing online PDFs.\n(3) On the Moves List/Manuals screen press and hold a Move card to see the batch bar appear then, select all moves to share or delete and click on the share or delete button in the batch bar to share or delete Moves. Use the Edit button at the bottom of each Move card in the list to edit a Move, and to view any move just click on the move card. When viewing a video move click the red arrow to the right of the video title to share the individual video. When viewing a Steps Move press and hold on any image to see the batch bar appear, then select the images to share and click the green arrow icon in the batch bar to share image or images, a single image can be shared as an image, a batch must be shared as a zip file. Moves can only be shared and imported with the iDojo App, only single videos, images and PDFs can be shared externally.\n(4) Scroll horizontally and vertically on the All Lists screen to view all your Moves. On the Add Move screen click the Save button to save Moves. When adding Steps Moves with the Add Move screen click the green +step button to add a new step to the Move and click the -step icon to remove a step.",
          [ { text: "OK",
              onPress: () => setListMode(false),
              style: "cancel" 
            }
          ],
          { cancelable: false } 
        );
    };


    const clearAppCache = async () => {
      try {
        const cacheDir = FileSystem.cacheDirectory;
        if (cacheDir) {
          const cachedItems = await FileSystem.readDirectoryAsync(cacheDir);
          for (const item of cachedItems) {
            const itemPath = `${cacheDir}${item}`;
            await FileSystem.deleteAsync(itemPath, { idempotent: true });
          }
        }
      } catch (error) {
      
      }
    };


    const parseStyles = (list, query) => {
      if (!Array.isArray(list)) {
        Alert.alert("Data Error", "Data is not an array, skipping loading.");
        return;
      }

      let videoStyles = [], stepStyles = [], pdfStyles = [];
      let sMoves = [{ id: "v-all", type: "video", style: "allstyles" }];
      let bMoves = [{ id: "s-all", type: "steps", style: "allstyles" }];
      let pMoves = [{ id: "p-all", type: "pdf", style: "allstyles" }];

      try {
        const validList = list.filter(m => m && m.id && m.title && m.type);
        
        const q = query?.trim()?.toLowerCase();
        const typeFilter = ['video', "steps", 'pdf'].includes(q) ? q : null;

        validList?.forEach(m => {
          const currentStyle = m.style || "Enter Move Title";
          const mType = m.type.trim().toLowerCase();

          if (typeFilter && m.type.trim().toLowerCase() !== typeFilter) return;
          const isCategorySearch = ['video', 'steps', 'pdf'].includes(q);
          let matches = false;

          if (isCategorySearch) {
            matches = mType.includes(q);
          } else if (mType === "steps" && q) {
            const mainMatch = m.title?.toLowerCase().includes(q) || m.desc?.toLowerCase().includes(q) || m.style?.toLowerCase().includes(q);
            const nestedMatch = m.steps?.some(step => 
              step.title?.toLowerCase().includes(q) || 
              step.desc?.toLowerCase().includes(q)
            );

            matches = mainMatch || nestedMatch;
          } else {
            matches = !q || 
              m.title?.toLowerCase().includes(q) ||
              m.style?.toLowerCase().includes(q) ||
              m.desc?.toLowerCase().includes(q);
          }
        
          if (!matches) return;

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
      } catch (e) {
        Alert.alert("Parse Error", e.message || "An error occurred while parsing Move styles: ");
      }
    };
    

    const parseHMoves = (movesList) => {
      let hMoves = [];
      let stylesSeen = [];
      for (let mNum = 0; mNum < movesList.length; mNum++) {
        const move = movesList[mNum];
        const currentStyle = move.style || "Enter List Title";
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


    const getMoves = (mstyle, mtype, movesList) => {
      if( !mstyle || mstyle.trim() === "" || !mtype || mtype.trim() === "" || !movesList) return [];
      if( mtype !== "video" && mtype !== "steps" && mtype !== "pdf" ) return [];
      
      let sMoves = movesList.filter(m => m.type === mtype && (mstyle === "allstyles" || m.style === mstyle));
      if(mstyle === "allstyles") return parseHMoves(sMoves);

      return sMoves;
    }



    const loadMoves = async () => {
      try {
        if (isLoadingRef.current) return; 
        isLoadingRef.current = true;
        setLoading(true);
        
        const fileUri = `${FileSystem.documentDirectory}moves.json`;
        const info = await FileSystem.getInfoAsync(fileUri);
        const trackingUri = `${FileSystem.documentDirectory}.moves_user_initialized`;
        const trackingInfo = await FileSystem.getInfoAsync(trackingUri);
        if (!info.exists && !trackingInfo.exists) {
          await FileSystem.writeAsStringAsync(fileUri, JSON.stringify([]));
          await FileSystem.writeAsStringAsync(trackingUri, "true");
        }

        const currentInfo = await FileSystem.getInfoAsync(fileUri);
        if (currentInfo.exists) {
          const content = await FileSystem.readAsStringAsync(fileUri);
          let movesList = JSON.parse(content);
          movesList = movesList.filter(m => 
            m && 
            m.id && 
            m.title &&
            m.type && 
            m.title.trim() !== "" &&
            (m.type === 'video' || m.type === "pdf" || (m.type === "steps" && m.steps && m.steps.length > 0))
          );

          setMoves(movesList);
          parseStyles(movesList, null);

          if (movesList.length === 0) {
            setListMode(false);
            setFStyle('Enter Move List Title');
            setType('select move type');
            setHMoves([]);
          } else {
            const filtered = getMoves(fstyle, ftype, movesList);
            if (filtered.length === 0 && listmode) {
              setHMoves([]);
              setListMode(false);
              setFStyle('Enter Move Title');
              setType('select move type');
            } else {
              setHMoves(filtered);
            }

            setTimeout(async () => {
              try {
                const baseMovesDir = `${FileSystem.documentDirectory}moves/`;
                const dirInfo = await FileSystem.getInfoAsync(baseMovesDir);
                  
                if (dirInfo.exists) {
                  const localFolders = await FileSystem.readDirectoryAsync(baseMovesDir);
                  const validIds = movesList.map(m => String(m.id).trim());

                  for (const folderId of localFolders) {
                    if (!validIds.includes(String(folderId).trim())) {
                      const pathToDelete = `${baseMovesDir}${folderId}/`;
                      await FileSystem.deleteAsync(pathToDelete, { idempotent: true });
                    }
                  }
                }
              } catch (gcError) {

              }
            }, 1500);
          }
        } else {
          setMoves([]);
          setHMoves([]);
          setListMode(false);
          setFStyle('Enter Move List Title');
          setType('select move type');    
        }
      } catch (e) {
        Alert.alert("Load Failed", e.message || "Failed to load Move list.");
      } finally {
        isLoadingRef.current = false;
        setLoading(false);
      }
    };



    const saveToStorage = async (list) => {
      try {
        const fileUri = `${FileSystem.documentDirectory}moves.json`;
        const trackingUri = `${FileSystem.documentDirectory}.moves_user_initialized`;
        await FileSystem.writeAsStringAsync(trackingUri, "true");
        await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(list));
        parseStyles(list, null);
        setHMoves(getMoves(fstyle, ftype, list)); 
      } catch (e) {
        Alert.alert("Save Error", e.message || "Could not save Move list to file.");
      }
    };


    const handleSave = async (newData) => { 
      try {
        if (isLoadingRef.current) return; 
        isLoadingRef.current = true;
        
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
      } catch (e) {
        Alert.alert("Save Failed", e.message || "Failed to save Move data.");
      } finally {
        isLoadingRef.current = false;
        setLoading(false);
      }
    };



    const myDojoHandleDelete = async (idsFromArg = []) => {
      const actualIds = Array.isArray(idsFromArg) && idsFromArg.length > 0 ? idsFromArg : selectedIds;
      const cleanIdsToDelete = actualIds.map(id => String(id).trim());
      if (cleanIdsToDelete.length === 0) return;

      const isDeletingAll = actualIds.length === hmoves.length;
      Alert.alert(
        isDeletingAll ? "Delete All Moves" : "Delete Moves",
        isDeletingAll ? "Remove all Moves in this list?" : `Remove ${cleanIdsToDelete.length} selected Move(s)?`,

        [{ text: "Cancel", style: "cancel" },
          {text: "Delete", style: "destructive",
           onPress: async () => {
            try {
              const movesToDelete = moves.filter(m => cleanIdsToDelete.includes(String(m.id)));
              let errfound = false;

              for (const moveItem of movesToDelete) {
                const folderUri = `${FileSystem.documentDirectory}moves/${moveItem.id}/`;
                try {
                  await FileSystem.deleteAsync(folderUri, { idempotent: true });
                } catch (err) {
                  if (!errfound) {
                    errfound = true;
                    Alert.alert("Delete Error", err.message || "Could not delete file from storage.");
                  }
                }
              }

              const updatedList = moves.filter(m => !cleanIdsToDelete.includes(String(m.id)));
              const fileUri = `${FileSystem.documentDirectory}moves.json`;
              await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(updatedList));
              
              if (updatedList.length === 0) {
                const trackingUri = `${FileSystem.documentDirectory}.moves_user_initialized`;
                await FileSystem.writeAsStringAsync(trackingUri, "true");
              }

              setMoves(updatedList);
              parseStyles(updatedList, null);
              setSelectedIds([]);
              
              if (isDeletingAll || updatedList.filter(m => m.type === ftype && (fstyle === "allstyles" || m.style === fstyle)).length < 1) {
                setListMode(false);
                setFStyle('Enter List Title');
                setType('select Move type');
              } else {
                setHMoves(getMoves(fstyle, ftype, updatedList));
              }
              
            } catch (error) {
              Alert.alert("Delete Error", error.message || "Could not delete files from storage.");
            }
          }
        }
        ]);
    };



    const handleShare = async (selectedids) => {
      if (isOffline) {
        Alert.alert("No Internet", "You need an internet connection to share Moves.");
        return;
      }

      try {
        if (!selectedids?.length) return;
        setLoading(true);

        const selectedMoves = fstyle === "allstyles" 
          ? hmoves.flatMap(g => g.data.filter(m => selectedids.includes(m.id)))
          : hmoves.filter(m => selectedids.includes(m.id));

        const shareDirUri = `${FileSystem.cacheDirectory}share_batch/`;
        const zipPathUri = `${FileSystem.cacheDirectory}iDojo_Moves_Export.zip`;
        await FileSystem.deleteAsync(shareDirUri, { idempotent: true });
        await FileSystem.makeDirectoryAsync(shareDirUri, { intermediates: true });

        const processedMoves = await Promise.all(selectedMoves.map(async (move, idx) => {
          const updatedMove = { ...move };
          const copyToStaging = async (uri) => {
            if (!uri || typeof uri !== 'string') return null;
            const normalizeSource = (sourceUri) => {
              if (!sourceUri || typeof sourceUri !== 'string') return null;
              if (sourceUri.startsWith('/') && !sourceUri.startsWith('file://')) {
                return `file://${sourceUri}`;
              }
              return sourceUri;
            };
            const normalizedSource = normalizeSource(uri);
            if (!normalizedSource) return null;

            const fileName = `${idx}_${uri.split('/').pop()}`;
            const dest = `${shareDirUri}${fileName}`;
            try {
              await FileSystem.copyAsync({ from: normalizedSource, to: dest });
              const destInfo = await FileSystem.getInfoAsync(dest);
              if (!destInfo.exists) {
                throw new Error(`Copy verification failed: ${fileName} not found after copy`);
              }
              return fileName;
            } catch (e) {
              return null;
            }
          };

          if (move.vid) updatedMove.vid = await copyToStaging(move.vid);
          if (move.videoUrl) updatedMove.videoUrl = await copyToStaging(move.videoUrl);
          if (Array.isArray(move.steps)) {
            updatedMove.steps = await Promise.all(move.steps.map(async (s, sIdx) => {
              const originalName = s.img.split('/').pop();
              const uniqueFakeUri = s.img.replace(originalName, `step_${sIdx}_${originalName}`);
              const imgFileName = await copyToStaging(uniqueFakeUri);
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
        await Sharing.shareAsync(zipPathUri, {
          mimeType: 'application/zip',
          dialogTitle: 'Share iDojo Zip'
        }); 
               
        setSelectedIds([]);
        await FileSystem.deleteAsync(shareDirUri, { idempotent: true });
        await FileSystem.deleteAsync(zipPathUri, { idempotent: true });
        
      } catch (e) {
        Alert.alert("Unknown Share Error", e.message || "Unknown error, You can retry sharing the Moves.");
      } finally {
        setLoading(false);
      }
    };



    const handleImport = async () => {
      let permanentDirUri = null; 
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
        permanentDirUri = `${FileSystem.documentDirectory}imported_${importId}/`;
        tempZipPath = `${FileSystem.cacheDirectory}import_temp_${importId}.zip`;

        await FileSystem.copyAsync({ from: asset.uri, to: tempZipPath });
        await FileSystem.makeDirectoryAsync(permanentDirUri, { intermediates: true });

        const nakedZip = Platform.OS === 'android' ? tempZipPath.replace('file://', '') : tempZipPath;
        const nakedDest = Platform.OS === 'android' ? permanentDirUri.replace('file://', '').replace(/\/$/, '') : permanentDirUri;

        await unzip(nakedZip, nakedDest);
        
        const dataFilePath = `${permanentDirUri}data.json`;
        const exists = await FileSystem.getInfoAsync(dataFilePath);
        if (!exists.exists) throw new Error("Manifest not found in zip");

        const content = await FileSystem.readAsStringAsync(dataFilePath);
        let importedMoves;
        try {
          importedMoves = JSON.parse(content);
        } catch (parseError) {
          throw new Error("Invalid data file in zip");
        }

        if (!Array.isArray(importedMoves) || importedMoves.length === 0) {
          throw new Error("No moves found in zip file");
        }

        importedMoves = importedMoves.filter(m => {
          if (!m || typeof m !== 'object') return false;
          if (!m.id || typeof m.title !== 'string' || m.title.trim() === "") return false;
          if (!['video', 'pdf', 'steps'].includes(m.type)) return false;
          if (m.type === 'steps' && (!Array.isArray(m.steps) || m.steps.length === 0)) return false;
          return true;
        });

        const finalMoves = importedMoves.map((move, index) => {
          const fixPath = (oldPath) => {
            if (!oldPath || typeof oldPath !== 'string' || oldPath.startsWith('http')) return oldPath;
            const fileName = oldPath.split('/').pop(); 
            return `${permanentDirUri}${fileName}`;
          };

          const fixedVid = (move.type === 'video' || move.type === "pdf") 
            ? fixPath(move.vid) 
            : null;
            
          const fixedVideoUrl = (move.type === 'video' || move.type === "pdf") 
            ? fixPath(move.videoUrl) 
            : '';

          const restored = {
            ...move,
            id: `move_${importId}_${index}_${Math.random().toString(36).substr(2, 4)}`,
            vid: fixedVid,
            videoUrl: fixedVideoUrl,
            thumb: fixedVid || fixedVideoUrl, 
          };

          if (move.type === 'steps' && Array.isArray(move.steps)) {
            restored.steps = move.steps.map((step, stepIdx) => ({
              ...step, 
              img: fixPath(step?.img),
              id: step.id || `idojo_step_${index}_${stepIdx}`
            }));
            restored.thumb = restored.steps?.[0]?.img || null;
          }
          
          return restored;
        }).filter(m => m && m.id);

        if (finalMoves.length === 0) {
          throw new Error("No valid Moves to import");
        }

        await handleSave(finalMoves);
        Alert.alert("Success", `${finalMoves.length} Moves added!`);

      } catch (e) {
        Alert.alert("Import Failed", e.message);
        if (permanentDirUri) {
          try {
            await FileSystem.deleteAsync(permanentDirUri, { idempotent: true });
          } catch (cleanupError) {}
        }
      } finally {
        setLoading(false);
        if (tempZipPath) {
          try { 
            await FileSystem.deleteAsync(tempZipPath, { idempotent: true }); 
          } catch (err) {}
        }
      }
    };



    const viewPdf = async (move) => {
      if ( isOffline && !move.vid ) {
        Alert.alert("No Internet", "You need an internet connection to view PDF Moves.");
        return;
      }

      if ( !move ) {
        Alert.alert("Unable To Open PDF", "No PDF Move data.");
        return;
      }

      try {
        const pdfData = {
          id: move.id,
          title: move.title || 'PDF Document',
          style: move.style || 'Move Title',
          desc: move.desc || '',
          vid: move.vid || null,
          videoUrl: move.videoUrl || "",
          type: 'pdf'
        };

        setViewMode(4);  
        setMove(pdfData);
        
      } catch (err) {
        Alert.alert("Unable To Open PDF", "Failed to open PDF: " + err.message);
      }
    };


    useFocusEffect(useCallback(() => { clearAppCache(); loadMoves(); }, []));


    const toggleSelect = (id) => {
      setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };


    const toggleAddMode = (mv, mvtype, mvstyle) => {
      if(mv === null) {
        setSelectedIds([]);
        setTypeAM(mvtype);
        setVideoUrl("");
        setMove(null);
        setTitle("");
        setDesc("");
        setVid("");
        
        if(mvstyle === "allstyles" || mvstyle === "all styles") {
          setFStyleAM("");
        } else {
          setFStyleAM(mvstyle);
        }

        if(mvtype === "steps") setSteps([{ id: Date.now().toString(), title:"", img: null, desc: "" }]);
        setAddMode(true);

      } else {
        setDesc(mv.desc || "");
        setFStyleAM(mvstyle);
        setSelectedIds([]);
        setTitle(mv.title);
        setTypeAM(mvtype);
        setMove(mv);

        if(mvtype !== "steps") {
          setVid(mv.vid);
          setVideoUrl(mv.videoUrl || "");
        } else {
          setSteps((mv.steps || [{ id: Date.now().toString(), title: "", img: null, desc: "" }]).map(step => ({
            ...step,
            img: normalizeMediaUri(step.img)
          })));
        }
        setAddMode(true);
      }
    };


    const getYouTubeId = (url) => {
      try {
        if (!url || typeof url !== 'string') return "";
        if (url.length < 19) return "";
        if (!url.includes('/') && !url.includes('.')) return "";
        
        const regExp = /^.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
        const match = url.match(regExp);
        
        return (match && match[1]) ? match[1] : "";
        
      } catch (e) {
        return "";
      }
    };


    const checkVideo = (mv) => {
      try {
        if(mv.videoUrl && (mv.videoUrl.includes("youtube.com") || mv.videoUrl.includes("youtu.be"))) {
          const mvData = {
            id: mv.id,
            title: mv.title || "Video Move",
            style: mv.style || "Enter List Title",
            desc: mv.desc || "",
            vid: "",
            videoUrl: getYouTubeId(mv.videoUrl),
            type: "video",
          };
          setMove(mvData);
          setViewMode(1);

        } else {
          setMove(mv);
          setViewMode(1);
        }
      } catch (e) {
        Alert.alert("Error", "Could not open video");
      }
    };


    const viewManual = (mv) => {
      setMove(mv);
      setViewMode(3);
    };


    const checkFStyle = (text) => {
      const trimmed = text.trim().toLowerCase();
      if (trimmed === "allstyles" || trimmed === "all styles") {
        setFStyleAM("All Styles");
        return;
      }
      setFStyleAM(text);
    };
    

    const isValidPdfUrl = (url) => {
      if (!url || typeof url !== 'string') return false;
      const trimmed = url.trim().toLowerCase();
      return (
        (trimmed.startsWith('http://') || trimmed.startsWith('https://')) &&
        trimmed.includes('.pdf')
      );
    };


    const getMediaFileExtension = (uri, type) => {
      if (typeof uri === 'string') {
        const nameFromUri = uri.split('/').pop()?.split('?')[0] || '';
        const extFromName = nameFromUri.includes('.')
          ? `.${nameFromUri.split('.').pop().toLowerCase()}`
          : '';

        const supportedExts = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.mp4', '.mov', '.avi', '.m4a', '.mp3', '.wav', '.pdf', '.aac', '.ogg'];
        if (supportedExts.includes(extFromName)) {
          return extFromName;
        }
      }

      if (type === "pdf") return '.pdf';
      if (type === "audio") return '.wav';
      if (type === "steps") return '.jpg';
      return '.mp4';
    };
  

    const copyPickedMediaToCache = async (sourceUri, fileName, retries = 2) => {
      const cacheDir = `${FileSystem.cacheDirectory}move-media/`;
      await FileSystem.makeDirectoryAsync(cacheDir, { intermediates: true });
      const destinationUri = `${cacheDir}${fileName}`;

      let lastError = null;

      for (let attempt = 1; attempt < retries; attempt += 1) {
        try {
          const sourceInfo = await FileSystem.getInfoAsync(sourceUri);
          if (!sourceInfo.exists) {
            throw new Error('Selected file is not available yet.');
          }

          await FileSystem.copyAsync({ from: sourceUri, to: destinationUri });
          const destinationInfo = await FileSystem.getInfoAsync(destinationUri);

          if (destinationInfo.exists && destinationInfo.size > 0) {
            return destinationUri;
          }

          lastError = new Error('Copied file is empty.');
        } catch (error) {
          lastError = error;
          if (attempt < retries) {
            await new Promise((resolve) => setTimeout(resolve, 760 * attempt));
          }
        }
      }

      throw lastError || new Error('Unable to copy selected media.');
    };


    const isValidMediaUri = async (uri) => {
      if (!uri || typeof uri !== 'string') return false;
      if (
        !uri.startsWith('file://') &&
        !uri.startsWith('http') &&
        !uri.startsWith('content://') &&
        !uri.startsWith('ph://') &&
        !uri.startsWith('/')
      ) return false;
    
      try {
        const info = await FileSystem.getInfoAsync(uri.startsWith('file://') ? uri : uri.startsWith('/') ? `file://${uri}` : uri);
        return info.exists && info.size > 0;
      } catch {
        return false;
      }
    };

    
    const normalizeMediaUri = (uri) => {
      if (!uri || typeof uri !== 'string') return uri;
      if (
        uri.startsWith('http://') ||
        uri.startsWith('https://') ||
        uri.startsWith('file://') ||
        uri.startsWith('content://') ||
        uri.startsWith('ph://')
      ) {
        return uri;
      }
      if (uri.startsWith('/')) {
        return `file://${uri}`;
      }
      return uri;
    };


    const pickMedia = async (index = null) => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Gallery access is needed to add moves!");
        return;
      }
      
      const isVideo = (typeAM === "video" && index === null);
      const mediaType = isVideo ? 'videos' : 'images';
      
      try {
        let pickedUri = "";
        isPickingRef.current = true;
        setIsPicking(true);

        if (typeAM === "pdf") {
          const result = await DocumentPicker.getDocumentAsync({
            type: 'application/pdf',
          });

          if (!result.canceled && result.assets && result.assets.length > 0) {
            pickedUri = result.assets[0].uri;
          }

        } else {
          const res = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: [mediaType],
            allowsEditing: false,
            quality: 1.0,
          });

          if (!res.canceled && res.assets && res.assets.length > 0) {
            pickedUri = res.assets[0].uri; 
          }
        }
        
        if (!pickedUri || !(await isValidMediaUri(pickedUri))) {
          Alert.alert(
            "Selected Media Failed",
            "This file could not be used. Please try again or choose a different file. Your device may be running out of space."
          );
          return;
        }

        if (pickedUri === "") {
          return; 
        }

        const ext = getMediaFileExtension(pickedUri, typeAM);
        const mediaFileName = `${Date.now()}${ext}`;
        const cachedUri = await copyPickedMediaToCache(pickedUri, mediaFileName);

        if (typeAM === "pdf") {
          setVid(cachedUri);
        } else if (isVideo) {
          setVid(cachedUri);
          if (videoUrl && videoUrl.trim().length > 1) {
            setVideoUrl("");
          }
        } else {
          const s = [...steps];
          s[index].img = cachedUri;
          setSteps(s);
        }

      } catch (err) {
        Alert.alert("Copy Media Failed", "Please try again. The file is large and your device may be running out of space.");
      } finally {
        isPickingRef.current = false;
        setIsPicking(false);
      }
    };
  

  
    const save = async () => {
      let validatedSteps = []; 
      if(isPicking) { 
        return;
      }
      if(isPickingRef.current) { 
        return;
      }

      if (!title.trim()) {
        Alert.alert("Required", "Please enter a Move Title.");
        return;
      }
  
      if (typeAM === "steps") {
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
  
      } else if (typeAM === "video" || typeAM === "pdf") {
        if (!vid && !videoUrl.trim()) {
          if(typeAM === "video") Alert.alert("Required", "Please upload a video or provide a link.");
          if(typeAM === "pdf") Alert.alert("Required", "Please upload a pdf or provide a link.");
          return;
        }
  
        if (typeAM ==="pdf" && videoUrl && videoUrl.trim().length > 0 && !isValidPdfUrl(videoUrl)) {
          Alert.alert("Invalid PDF URL", "URL must start with http/https and include .pdf");
          return;
        }
  
        if(!desc || !desc.trim()) {
          Alert.alert("Required", "Please provide a description.");
          return;
        }
  
      }
  
      try {
        setLoading(true);
        let copyfailed = false;
        const moveId = move?.id || Date.now().toString();
        const permanentDirUri = `${FileSystem.documentDirectory}moves/${moveId}/`;
  
        const videoChanged = move && (typeAM === "video" || typeAM === "pdf") && vid && vid !== move?.vid;
        if (videoChanged) {
          await FileSystem.deleteAsync(permanentDirUri, { idempotent: true });
        } else if( !move ) {
          await FileSystem.deleteAsync(permanentDirUri, { idempotent: true });
        }
  
        const activeSavedFilenames = [];
        await FileSystem.makeDirectoryAsync(permanentDirUri, { intermediates: true });
        const ensurePermanent = async (uri, fileName) => {
          if (!isLocalMediaUri(uri)) return uri;
          const normalizedUri = normalizeMediaUri(uri);
          const normalizedPermanentDir = normalizeMediaUri(permanentDirUri);

          if (normalizedUri.startsWith(normalizedPermanentDir)) {
            const existingName = normalizedUri.split('/').pop();
            activeSavedFilenames.push(existingName);
            return normalizedUri;
          }
          
          const destUri = `${permanentDirUri}${fileName}`;

          try {
            await FileSystem.copyAsync({ from: uri, to: destUri });
            activeSavedFilenames.push(fileName);
            return normalizeMediaUri(destUri);
          } catch (e) {
            try {
              const rawSource = uri.replace('file://', '');
              await FileSystem.copyAsync({ from: rawSource, to: destUri });
              activeSavedFilenames.push(fileName);
              return normalizeMediaUri(destUri);
            } catch (fallbackError) {

            }
          }

          Alert.alert("Copy Media Failed", "Please try again. The file is large and your device may be running out of space. You may need to free some memory.");
          return "COPYFAILED";
        };
  
        let finalVid = vid; 
        let finalSteps = [...steps];
        if ((typeAM === "video" || typeAM === "pdf") && vid) {
          const ext = getMediaFileExtension(vid, typeAM);
          finalVid = await ensurePermanent(vid, `idojo_file${ext}`);
          if ( finalVid === "COPYFAILED") copyfailed = true;
        }
        
        if (typeAM === 'steps') {
          finalSteps = [];
          for (let i = 0; i < validatedSteps.length; i++) {
            const step = validatedSteps[i];
            const isAlreadySaved = step.img && normalizeMediaUri(step.img).startsWith(normalizeMediaUri(permanentDirUri));
            if (isAlreadySaved) {
              const existingName = normalizeMediaUri(step.img).split('/').pop();
              if (existingName) activeSavedFilenames.push(existingName);
            }

            let img = step.img;
            if (step.img && isLocalMediaUri(step.img) && !isAlreadySaved) {
              const uniqueStepId = step.id ? `${step.id}_${Date.now()}` : `new_${i}_${Date.now()}`;
              const fileExt = getMediaFileExtension(step.img, 'image') || '.jpg';
              const distinctFileName = `idojo_step_${uniqueStepId}${fileExt}`;
              
              img = await ensurePermanent(step.img, distinctFileName);
            }

            if (img === 'COPYFAILED') copyfailed = true;

            finalSteps.push({
              ...step,
              img
            });
          }
        }

      
        if (copyfailed) {
          Alert.alert("Save Failed", "Unable to copy step image. Please try again.");
          setLoading(false);
          return;
        }

        const finalData = {
          id: moveId,
          title: title.trim(),
          type: typeAM,
          style: fstyleAM.trim() || "Enter List Title",
          steps: typeAM === "steps" ? finalSteps : [],
          vid: typeAM === "video" || typeAM === "pdf" ? finalVid : null,
          videoUrl: typeAM === "video" || typeAM === "pdf" ? videoUrl : '',
          thumb: typeAM === "video" || typeAM === "pdf" ? (finalVid || videoUrl) : (finalSteps[0]?.img || null),
          desc: desc 
        };
        
        try {
          const existingFiles = await FileSystem.readDirectoryAsync(permanentDirUri);
          for (const file of existingFiles) {
            if (!activeSavedFilenames.includes(file)) {
              const fullPathToDelete = `${permanentDirUri}${file}`;
              await FileSystem.deleteAsync(fullPathToDelete, { idempotent: true });
            }
          }
        } catch (cleanupErr) {

        }

        handleSave(finalData);
        setAddMode(false);
      } catch (err) {
        Alert.alert("Save Error", err.message || "An unknown error occurred.");
      } finally {
        setLoading(false);
      }
    };
    


    useEffect(() => {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
        if (viewmode > 0) {
          setViewMode(0);
          if(addmode) setAddMode(false);
          if(selectedSingles.length > 0) setSelectedSingles([]);
          return true;
        }

        if (addmode) {
          if(isPicking) return true;
          if(isPickingRef.current) return true;
          if (isLoadingRef.current) return true;
          setAddMode(false);
          return true;
        }

        if (listmode) {
          if(addmode) setAddMode(false);
          setListMode(false);
          setSelectedIds([]);
          return true;
        } else if (isLoadingRef.current) {
          return true;
        }
        return false;
      });

      return () => backHandler.remove();
    }, [viewmode, addmode, listmode]);


    const toggleSelectSingle = (index) => {
      setSelectedSingles(prev => prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]);
    };
  

    const handleShareSingles = async (selectedids) => {
      if (!selectedids?.length) return;
      
      try {
        const images = selectedids
          .map(i => move.steps[i]?.img)
          .filter(img => img);
        
        if (images.length === 0) return;

        if (images.length === 1) {
          const normalizedImageUri = normalizeMediaUri(images[0]);
          if (!normalizedImageUri) return;
          await Sharing.shareAsync(normalizedImageUri);
        } else {
          const shareDir = `${FileSystem.cacheDirectory}images/`;
          await FileSystem.deleteAsync(shareDir, { idempotent: true });
          await FileSystem.makeDirectoryAsync(shareDir, { intermediates: true });
          
          for (let i = 0; i < images.length; i++) {
            const normalizedImageUri = normalizeMediaUri(images[i]);
            if (!normalizedImageUri) continue;
            const dest = `${shareDir}image_${i}.jpg`;
            await FileSystem.copyAsync({ from: normalizedImageUri, to: dest });
          }
          
          const zipPath = `${FileSystem.cacheDirectory}images.zip`;
          await FileSystem.deleteAsync(zipPath, { idempotent: true });
          const cleanSrcDir = shareDir.replace('file://', '').replace(/\/$/, '');
          const cleanZipPath = zipPath.replace('file://', '');
          await zip(cleanSrcDir, cleanZipPath);
          await Sharing.shareAsync(zipPath);
          await FileSystem.deleteAsync(shareDir, { idempotent: true });
          await FileSystem.deleteAsync(zipPath, { idempotent: true });
        }
      } catch (e) {
        Alert.alert('Share Error', e.message || 'Unable to share selected image(s).');
      } finally {
          setSelectedSingles([]);
          setLoading(false);
        }
    };
      


    const MoveCard = ({ item }) => (
      <TouchableOpacity 
        onLongPress={() => toggleSelect(item.id)}
        onPress={() => selectedIds.length > 0 ? toggleSelect(item.id) : ftype === "video" ? checkVideo(item) : ftype === "pdf" ? viewPdf(item) : viewManual(item)}
        style={[styles.itemContainer, selectedIds.includes(item.id) && (ftype === "steps" ? styles.selectedItem : ftype === "video" ? styles.selectedItemVideo : styles.selectedItemPdf)]}>
        <View style={styles.card}>

          <View style={styles.titleBanner}>
            <Text numberOfLines={1} ellipsizeMode="clip" style={ftype === 'video' ? styles.titleTextVideo : ftype === "pdf" ? styles.titleTextPdf : styles.titleText}>{item.title}</Text>
          </View>

          <Image style={ftype === "pdf" ? styles.thumbPdf : styles.thumbImage}
            source={(() => {
              if (ftype === "pdf") {
                return require('../assets/pdfplaceholder.png');
              }

              if (ftype === 'video') {
                if (item.videoUrl && (item.videoUrl.includes("youtube.com") || item.videoUrl.includes("youtu.be"))) {
                  const youtubeId = getYouTubeId(item.videoUrl);
                  if (isOffline || youtubeId === "") {
                    return require('../assets/onlinevideoicon.png');
                  } else {
                    return { uri: `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg` };
                  }
                } else if (item.videoUrl && item.videoUrl.length > 7) {
                  return require('../assets/onlinevideoicon.png');
                }

                if (item.vid && (item.vid.startsWith('file://') || item.vid.includes('file') || item.vid.includes('idojo'))) {
                  return { uri: item.vid };
                }
                
                return require('../assets/onlinevideoicon.png');
              }
  
              if (ftype === 'steps') {
                if (item.thumb) return { uri: item.thumb };
                if (item.steps?.[0]?.img) return { uri: item.steps[0].img };
              }
              return require('../assets/onlinevideoicon.png');
            })()} />

          <View style = {ftype === "steps" ? styles.pillRow : ftype === "pdf" ? styles.pillRowPdf : styles.pillRowVideo}>
            <Text style = {ftype === 'video' ? styles.typePillVideo : ftype === "pdf" ? styles.typePillPdf : styles.typePill}>{item.type}</Text>
            <TouchableOpacity onPress={() => toggleAddMode(item, ftype, item.style)} style={styles.editIcon}>
              <ImageBackground style = {{ height: "100%", width: "100%", }} resizeMode = 'contain' source = { ftype === 'steps' ? require('../assets/editmanualicon.png') : ftype  === "video" ? require('../assets/editmoveicon.png') : require('../assets/editpdficon.png')}/>         
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


    if (loading && ftype === 'video') return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fcf1ec', width: "100%", height: "93%" }}>
        <ImageBackground style={{ height: 57, width: 76, elevation: 4, marginTop: -12, opacity: 1 } } imageStyle={{ opacity: 1 }} resizeMode='contain' source={require('../assets/icon.png')} />
        <ActivityIndicator size="large" color="#f30707" style={{ marginTop: 12, transform: [{ scale: 1.7 }] }} />
        <Text style={{ marginTop: 12, color: '#420105', fontWeight: '700', fontSize: 11, letterSpacing: 0.8, textTransform: 'uppercase' }}>Please Wait</Text>
      </View>
    );


    if (loading && ftype === 'steps') return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#d9eec4', width: "100%", height: "93%" }}>
        <ImageBackground style={{ height: 57, width: 76, elevation: 4, marginTop: -12, opacity: 1 } } imageStyle={{ opacity: 1 }} resizeMode='contain' source={require('../assets/icon.png')} />
        <ActivityIndicator size="large" color="#0e6415" style={{ marginTop: 12, transform: [{ scale: 1.7 }] }} />
        <Text style={{ marginTop: 12, color: '#044421', fontWeight: '700', fontSize: 11, letterSpacing: 0.8, textTransform: 'uppercase' }}>Please Wait</Text>
      </View>
    );


    if (loading && ftype === 'pdf') return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#c4d9ee', width: "100%", height: "93%" }}>
        <ImageBackground style={{ height: 57, width: 76, elevation: 4, marginTop: -12, opacity: 1 } } imageStyle={{ opacity: 1 }} resizeMode='contain' source={require('../assets/icon.png')} />
        <ActivityIndicator size="large" color="#0d1879" style={{ marginTop: 12, transform: [{ scale: 1.7 }] }} />
        <Text style={{ marginTop: 12, color: '#0b0142', fontWeight: '700', fontSize: 11, letterSpacing: 0.8, textTransform: 'uppercase' }}>Please Wait</Text>
      </View>
    );

    
    if ( viewmode === 1 || viewmode === 2 ) {
      return <VideoPlayer video={move} isActive={true} />;
    }


    if(viewmode == 3) return (
      <View style={{flex: 1, paddingTop: 40, backgroundColor:"#0ba156", opacity: 1}}> 
       <StatusBar barStyle="light-content"/>
       <SafeAreaView style={{ backgroundColor:'black', flex: 1}}>
        <Text style={{ backgroundColor: '#2f4f4f', color: "crimson", textAlign: "center", fontSize: 21, marginBottom: 19, marginTop: 38 }}>
          {move.title}
        </Text>
    
        <View style={{backgroundColor: "black", paddingBottom: 19, flex: 1}}>
          <FlatList
            data={move?.steps || []}
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: 57 }}
            keyExtractor={ (item, index) => index.toString() }
            showsVerticalScrollIndicator={false}
            initialNumToRender={Array.isArray(move?.steps) ? move.steps.length : 1}
            renderItem={ ({ item: step, index }) => (
              <View style={{backgroundColor: "black", marginBottom: 19}}>
                <View style={{backgroundColor: bgColor[Math.floor(Math.random()*bgColor.length)], marginBottom: 3, fontSize: 19, borderColor:"silver", borderWidth: 1, borderRadius: 5,}}>
                  <Text style={styles.titletextManual}>{step.title}</Text>
                </View>
          
                <View>
                  <TouchableOpacity 
                    onLongPress={() => toggleSelectSingle(index) }
                    onPress={() => selectedSingles.length > 0 && toggleSelectSingle(index)}
                    style={[styles.itemContainerVM, selectedSingles.includes(index) && styles.selectedItem ]}>
                      <Image source = {{uri: normalizeMediaUri(step.img)}} resizeMode="contain" style={{ borderRadius: 19, alignSelf: 'center', margin: 0, height: 490, width: 380 }} />
                  </TouchableOpacity> 

                  <View style={{backgroundColor: "#0c3312", marginTop: 5, marginBottom: 1, flex: 1, padding: 3, borderColor: "silver", borderWidth: 1, borderRadius: 6, borderBottomWidth: 2}}>
                    <View style={styles.imgBackgroundManual}>
                      <Text style={styles.desctextManual}> {step.desc} </Text>
                    </View>
                  </View>
                          
                  {index < move.steps.length - 1  && ( <View style={{marginTop: -7, marginBottom: 3, flex: 1 }}> 
                    <Image source={require('../assets/silverdivider.png')} style={styles.silverDivider} resizeMode='contain'/>
                  </View> ) } 
                </View>
              </View>
            ) }
          />
        </View>

        { selectedSingles.length > 0 && (
          <View style={styles.batchBar}>
            <Text style={ styles.batchText }>{selectedSingles.length} Selected</Text>
            <TouchableOpacity onPress={() => handleShareSingles(selectedSingles)} style={styles.shareIcon}>
              <ImageBackground style={{height: "100%", width: "100%", borderRadius: 4}} imageStyle={{ opacity: 1 }} resizeMode='contain' source={ require('../assets/greensharearrow.png') }/>         
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setSelectedSingles([])} style={styles.myDojoDeleteIcon}>
              <ImageBackground style={{height: "100%", width: "100%", }} imageStyle={{ opacity: 1 }} resizeMode='contain' source={ require('../assets/deletemanualicon.png') }/>         
            </TouchableOpacity>
          </View> )
        }
       </SafeAreaView>
      </View>
    );


    if( viewmode === 4 ) return (
      <PdfMove pdf={move} onClosePdf={() => setViewMode(0)} isActive={true} />
    )


    if (addmode) return (
      <ImageBackground style={ styles.imgBackgroundAM } imageStyle={{ opacity: 0.7 }} resizeMode='cover' source={require('../assets/addmovebg.jpg')}>
       <StatusBar barStyle="light-content" />
       <KeyboardAvoidingView
         style={{ flex: 1 }}
         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
         keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 19}
       >
       <View style={{ marginBottom: 12, paddingLeft: 5, paddingRight:5, marginTop: 25, opacity : 1}}>
         <ImageBackground style={ styles.iconAM } resizeMode='contain' imageStyle={{ opacity: 1 }} source={typeAM ==='video' && !move ? require('../assets/addmovetitle.png') : typeAM ==='video' && move ? require('../assets/editmovetitle.png') : typeAM ==='steps' && !move ? require('../assets/addmanualtitle.png') : typeAM ==='steps' && move ? require('../assets/editmanualtitle.png') : typeAM ==="pdf" && move ? require('../assets/editpdfmovetitle.png') : require('../assets/addpdfmovetitle.png') } /> 
       </View>
       <TouchableOpacity onPress={() => { if (isPicking || isPickingRef.current) return; setAddMode(false) }} style={styles.discardBtn}>
         <ImageBackground style={{ alignSelf: 'center', height: 67, width: "100%", opacity: 1}} imageStyle={{ opacity: 1 }} resizeMode='contain' source={require('../assets/discardicon.png')}/>
         <Text style={styles.discardText}>CANCEL</Text>
       </TouchableOpacity>
   
       <ScrollView style={styles.containerAM} contentContainerStyle={{ paddingBottom: 100 }}>
         <Text style={ typeAM === "steps" ? styles.headerTitle : typeAM === "video" ? styles.headerTitleVideo : styles.headerTitlePdf }>{move ? "EDIT" : "ADD"} YOUR DOJO MOVE</Text>
         <Text style={styles.label}>Move Title</Text>
         <TextInput style={typeAM ==='video' ? styles.input : typeAM === "pdf" ? styles.pdfinput : styles.stepInput} underlineColorAndroid="transparent" placeholder="Enter Move Title" value={title} onChangeText={setTitle} />
         
         <Text style={styles.label}>Moves List Title</Text>
         <TextInput style={typeAM ==='video' ? styles.input : typeAM === "pdf" ? styles.pdfinput : styles.stepInput} underlineColorAndroid="transparent" placeholder="Enter Moves List Title" value={fstyleAM} onChangeText={checkFStyle} />
   
         { typeAM === "video" ? (
           <View>
            { isPicking ? (
              <View style={{ marginTop: 19, marginBottom: 19, marginLeft: 12, alignItems: 'flex-start', justifyContent: 'center' }}>
                <ActivityIndicator size="small" color="#f30707" style={{ transform: [{ scale: 1.5 }] }} />
                <Text style={{ marginTop: 8, color: '#420105', fontWeight: '700', fontSize: 11, letterSpacing: 0.8, textTransform: 'uppercase' }}>Loading</Text>
              </View>
            ) : vid && !videoUrl && vid.length > 7 ? ( <TouchableOpacity onPress={() => {if (isPicking) return; pickMedia(); }} style={vid || videoUrl ? styles.videoIconUploaded : styles.videoIcon}> 
              <ImageBackground style={{ alignSelf:'center', height: 57, width: 57 }} resizeMode='contain' source={require('../assets/fileuploadedicon.png')}/> 
              </TouchableOpacity> )
              : !videoUrl && ( 
              <TouchableOpacity onPress={() => {if (isPicking) return; pickMedia();}} style={vid || videoUrl ? styles.videoIconUploaded : styles.videoIcon}> 
                <ImageBackground style={{ alignSelf: 'center', height: 67, width: 76, }} resizeMode='contain' source={require('../assets/uploadvideobg.png')} /> 
              </TouchableOpacity> )
            }

            { vid && !isPicking && (
              <TouchableOpacity style={[styles.toggleModeBtn, {marginTop: 5, alignSelf: "flex-start", marginLeft: 12}]} onPress={() => { setVid(''); }}>
                <Text style={{fontSize: 22, marginTop: -7}}>🔗</Text>
                <Text style={styles.toggleModeText}>Or Link</Text>
              </TouchableOpacity>
            ) }

            { !vid && !videoUrl && !isPicking &&(
              <Text style={styles.orText}>— OR —</Text>
            ) }
                
            { !vid && !isPicking && ( <Text style={styles.label}>Video URL of Move</Text> ) }
            { !vid && !isPicking && ( <TextInput placeholder="Enter Video Link" value={videoUrl} onChangeText={ (text) => { setVideoUrl(text); if(vid && text.length > 0) { setVid(''); } } } style={styles.input} /> ) }

            { videoUrl && !isPicking && (
              <TouchableOpacity style={[styles.toggleModeBtn, {marginTop: 7}]} onPress={() => { setVideoUrl(''); }}>
                <Text style={{fontSize: 22, marginTop: -2}}>📁</Text>
                <Text style={styles.toggleModeText}> Or Upload</Text>
              </TouchableOpacity>
            ) }

            <Text style={styles.label}>Move Description</Text>
            <TextInput style={styles.input} multiline={true} textAlignVertical="top" underlineColorAndroid="transparent" placeholder="Enter Description" value={desc} onChangeText={setDesc} />
           </View>
           ) : typeAM === "pdf" ? (
             <View>
               { isPicking ? (
                 <View style={{ marginTop: 5, marginBottom: 19, marginLeft: 12, alignItems: 'flex-start', justifyContent: 'center' }}>
                   <ActivityIndicator size="small" color="#0b07f3" style={{ transform: [{ scale: 1.5 }] }} />
                   <Text style={{ marginTop: 8, color: '#141238', fontWeight: '700', fontSize: 11, letterSpacing: 0.8, textAlign: 'center', textTransform: 'uppercase' }}>Loading</Text>
                 </View>
               ) : vid && !videoUrl && vid.length > 7 ? ( <TouchableOpacity onPress={() => {if (isPicking) return; pickMedia(); }} style={vid || videoUrl ? styles.videoIconUploaded : styles.pdfIcon}> 
                   <ImageBackground style={{ alignSelf:'center', height: 57, width: 57 }} resizeMode='contain' source={require('../assets/fileuploadedicon.png')}/> 
                 </TouchableOpacity> )
               : !videoUrl && ( <TouchableOpacity onPress={() => {if (isPicking) return; pickMedia(); }} style={vid || videoUrl ? styles.videoIconUploaded : styles.pdfIcon}> 
                   <ImageBackground style={{ alignSelf: 'center', height: 67, width: 76, }} resizeMode='contain' source={require('../assets/uploadpdfbg.png')} /> 
                </TouchableOpacity> )
              }

              { vid &&  !isPicking && (
                <TouchableOpacity style={[styles.toggleModePdfBtn, {marginTop: 5, alignSelf: "flex-start", marginLeft: 12}]} onPress={() => { setVid(''); }}>
                  <Text style={{fontSize: 22, marginTop: -7}}>🔗</Text>
                  <Text style={styles.toggleModeText}>Or Link</Text>
                </TouchableOpacity>
              ) }

              { !vid && !videoUrl &&  !isPicking && (
                <Text style={styles.orText}>— OR —</Text>
              ) } 

              { !vid &&  !isPicking && ( <Text style={styles.label}>PDF URL of Move</Text> ) }
              { !vid &&  !isPicking && ( <TextInput placeholder="Enter PDF Link" value={videoUrl} onChangeText={ (text) => { setVideoUrl(text); if(vid && text.length > 0) { setVid(''); } } } style={styles.pdfinput} /> ) }

              { videoUrl &&  !isPicking && (
                <TouchableOpacity style={[styles.toggleModePdfBtn, {marginTop: 7}]} onPress={() => { setVideoUrl(''); }}>
                  <Text style={{fontSize: 22, marginTop: -2}}>📁</Text>
                  <Text style={styles.toggleModeText}> Or Upload</Text>
                </TouchableOpacity>
              ) }

              <Text style={styles.label}>Move Description</Text>
              <TextInput style={styles.pdfinput} multiline={true} textAlignVertical="top" underlineColorAndroid="transparent" placeholder="Enter Description" value={desc} onChangeText={setDesc} />
             </View>
           ) : (
           <View style={{ marginTop: 3 }}>
             { steps.map((s, i) => (
               <View key={s.id} style={styles.stepRow}>
                 <Text style={styles.label}>Step Title</Text>
                 <TextInput style={styles.stepInput} underlineColorAndroid="transparent" placeholder={`Enter Step ${i+1} Title`} value={s.title} onChangeText={(t)=>{const ns=[...steps];ns[i].title=t;setSteps(ns)}} />
                 <Text style={styles.label}>Step Image</Text>
                 <TouchableOpacity onPress={() => {if (isPicking) return; pickMedia(i);}} style={styles.stepImgContainer}>
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
                   { steps.length > 1 && (
                     <TouchableOpacity onPress={() => setSteps(steps.filter(st => st.id !== s.id))} style={styles.removeStepIcon}>
                       <ImageBackground style={{ height: 91, width: "100%", }} imageStyle={{ opacity: 1 }} resizeMode='contain' source={require('../assets/removeimgicon.png')}/>
                       <Text style={styles.removeText}> <Text style={{color: '#ff4444'}}>➖</Text> STEP</Text>
                     </TouchableOpacity>
                   ) }
                 </View>
               </View>
             ))}
             <TouchableOpacity style={styles.addStepBtn} onPress={() => setSteps([...steps, { id: Date.now().toString(), title: '',img: null, desc: '' }])}>
               <ImageBackground style={{width: '100%', height: 38, justifyContent: 'center',}} imageStyle={{ opacity: 1 }} resizeMode='contain' source={require('../assets/addstepbtn.png')} />
             </TouchableOpacity>
           </View>
         ) }
   
         <TouchableOpacity style={styles.saveBtn} onPress={() => save()}>
           { typeAM === "pdf" ? ( <ImageBackground style={{ height: 43, width: "100%",justifyContent: 'center', opacity: 1, borderRadius: 12 }} imageStyle={{ opacity: 1, borderRadius:12 }} resizeMode='stretch' source={require('../assets/bluebtnbg.png')}>
             <Image
               resizeMode = "contain"
               style={{height: 38, width: 172, alignSelf:"center", opacity: 1}}
               source={require('../assets/save.png')}
             />
           </ImageBackground> ) 
           : typeAM === "video" ? ( <ImageBackground style={{ height: 57, width: "100%",justifyContent: 'center', opacity: 1, borderRadius: 12 }} imageStyle={{ opacity: 1, borderRadius:12 }} resizeMode='contain' source={require('../assets/savevideobtn.png')} />
            ) 
           : ( <ImageBackground style={{ height: 47, width: "100%",justifyContent: 'center', opacity: 1, borderRadius: 12 }} imageStyle={{ opacity: 1, borderRadius:12 }} resizeMode='contain' source={require('../assets/savemanualbtn.png')} />
            ) }
         </TouchableOpacity>
       </ScrollView>
      </KeyboardAvoidingView>
      </ImageBackground> );   


    if (listmode) return (
      <ImageBackground style={{flex: 1, width: '100%', height: '100%', opacity: 1}} resizeMode='cover' source={require('../assets/mydojobg.jpg')}>
        <StatusBar barStyle="light-content"/>
        <SafeAreaView style={{ flex: 1}}>
          <View style={{marginBottom: 12, paddingHorizontal: 5, justifyContent: 'center', alignItems: 'center', opacity: 1}}>
            <ImageBackground style={ styles.icon } resizeMode='contain' imageStyle={{ opacity: 1 }} source={ftype === "video" ? require('../assets/moveslisttitle.png') : ftype === "pdf" ? require('../assets/pdfmoveslisttitle.png') : require('../assets/manualstitle.png')} /> 
          </View>

          <View style={styles.myDojoHeader}>
            {ftype === "video" ? ( <Text style={{ color: '#ff8d8d', fontSize: 12, flex: 1, textTransform: 'uppercase' }}>{fstyle === "allstyles" ? `ALL ${ftype.toUpperCase()} MOVES` : "MOVE LIST TITLE: "+fstyle} </Text> )
              : ftype === "pdf" ? ( <Text style={{ color: '#9afff7', fontSize: 12, flex: 1, textTransform: 'uppercase' }}>{fstyle === "allstyles" ? `ALL ${ftype.toUpperCase()} MOVES` : "MOVE LIST TITLE: "+fstyle} </Text> ) 
              : ( <Text style={{ color: '#51ff00', fontSize: 12, flex: 1, textTransform: 'uppercase' }}>{fstyle === "allstyles" ? `ALL ${ftype.toUpperCase()} MOVES` : "MOVE LIST TITLE: "+fstyle} </Text> ) }
            
            <View style={{flexDirection:'row'}}>
              <TouchableOpacity onPress={() => {setListMode(false); setSelectedIds([]);} } style={styles.plusIconAM}>
                <ImageBackground style={{ height: "100%", width: "100%", }} resizeMode='contain' source={ftype === "steps" ? require('../assets/greenbackicon.png') : ftype === "pdf" ? require('../assets/bluebackicon.png') : require('../assets/redbackicon.png') }/>
              </TouchableOpacity>
    
              <TouchableOpacity onPress={() => toggleAddMode(null, ftype, fstyle)} style={ftype === "steps" ? styles.plusIcon : styles.plusIcon}>
                <ImageBackground style={{ height: "100%", width: "100%", }} resizeMode='contain' source={ftype === "steps" ? require('../assets/addmanualicon.png') : ftype === "pdf" ? require('../assets/addpdfmoveicon.png') : require('../assets/addmoveicon.png') }/>         
              </TouchableOpacity>
            </View>
          </View>
           
          <View style = {styles.flatlistContainer}> 
           <FlatList
            data = {hmoves || []}
            extraData = {[selectedIds, moves]}
            keyExtractor = {(item, index) => item.id || index.toString()}
            style = {{ flex: 1 }}
            contentContainerStyle = {{ paddingBottom: 57, flexGrow: 1, minHeight: 200 * Math.max((hmoves || []).length, 1) }}
            ListEmptyComponent = {() => {
              return (
                <View style={{padding: 19, alignItems: 'center'}}>
                  <Text style={{color: 'white', marginBottom: 10, fontWeight: 'bold', fontSize: 15}}>Please Reload</Text>
                  <TouchableOpacity 
                    onPress={() => {
                      if (!loading && !isLoadingRef.current) loadMoves();
                    }}
                    style={{padding: 5, backgroundColor: 'rgba(182, 207, 136, 0.2)', borderRadius: 8}}
                  >
                    <ImageBackground style={{ height: 76, width: 76,}} resizeMode='contain' source={require('../assets/reloadicon.png')}/>         
                  </TouchableOpacity>
                </View>
              );
            }}
            renderItem={({ item }) => (
              fstyle === "allstyles" ? (
                <View style={ftype === "steps" ? styles.sectionContainer : ftype === "pdf" ? styles.sectionContainerPdf : styles.sectionContainerVideo}>
                  <Text style={ftype === "steps" ? styles.sectionHeader : ftype === "pdf" ? styles.sectionHeaderPdf : styles.sectionHeaderVideo}>{item.style}</Text>
                    <FlatList
                      horizontal
                      data={item?.data || []}
                      extraData={[selectedIds, moves]}
                      getItemLayout={(data, index) => {
                        const itemWidth = Dimensions.get('window').width * 0.7;
                        return {
                          length: itemWidth,
                          offset: itemWidth * index,
                          index,
                        };
                      }}
                      windowSize = {38}
                      initialNumToRender={Array.isArray(item?.data) ? item.data.length : 1}
                      showsHorizontalScrollIndicator = {false}
                      keyExtractor = {(item, index) => item?.id?.toString() || `index-${index}` }
                      contentContainerStyle = {{ paddingRight: 38, paddingLeft: 12, minWidth: (Dimensions.get('window').width * (item.data?.length || 1)) * 0.7, flexGrow: 1 }}
                      renderItem = {({ item: move }) => <MoveCard item={move} />}
                    />
                 </View>
               ) : (<View style={styles.verticalWrapper}><MoveCard item={item} /></View>)
             )}
            />
           </View>
     
           {selectedIds.length > 0 && (
             <View style={ftype === "steps" ? styles.batchBar  : ftype === "pdf" ? styles.batchBarPdf : styles.batchBarVideo}>
               <Text style={ftype === "steps" ? styles.batchText : ftype === "pdf" ? styles.batchTextPdf : styles.batchTextVideo}>{selectedIds.length} Selected</Text>
               <TouchableOpacity onPress={() => handleShare(selectedIds)} style={styles.shareIcon}>
                 <ImageBackground style={{height: "100%", width: "100%", borderRadius: 4}} imageStyle={{ opacity: 1 }} resizeMode='contain' source={ftype === "steps" ? require('../assets/sharemanualicon.png') : ftype === "pdf" ? require('../assets/sharepdfmoveicon.png') : require('../assets/sharemoveicon.png') }/>         
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
        <StatusBar barStyle="dark-content"/>
        <SafeAreaView style={{flex: 1}}>
          <View style={{ marginBottom: 5, marginTop: -19, paddingHorizontal: 4, opacity: 1, justifyContent: "center", alignItems: 'center'}}>
            <ImageBackground style={styles.icon} imageStyle={{ opacity: 1 }} resizeMode='contain' source={require('../assets/mydojostylestitle.png')} /> 
          </View>

          <View style={styles.header}>
            <View style={styles.searchRow}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search or type video/steps/pdf"
                placeholderTextColor="rgba(88, 79, 79, 0.62)"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              <TouchableOpacity onPress={() => parseStyles(moves, searchQuery)} style={styles.searchBtn}>
                <ImageBackground style={{ height:"100%", width:"100%",}} resizeMode='contain' source={require('../assets/binocularsicon.png')}/>         
              </TouchableOpacity>
              <TouchableOpacity onPress={() => {setSearchQuery(''); parseStyles(moves, null);}} style={styles.clearBtn}>
                <ImageBackground style={{ height:"100%", width:"100%",}} resizeMode='contain' source={require('../assets/reloadicon.png')}/>         
              </TouchableOpacity>
            </View>

            <View style={{flexDirection:'row', alignItems:'center', justifyContent: 'center', marginBottom: 1, minHeight: 49, width:"100%"}}>
              <TouchableOpacity onPress={() => { setMove(null); setTitle(""); setTypeAM("video"); setFStyleAM(""); setDesc(""); setVid(""); setVideoUrl("");  setSelectedIds([]); setAddMode(true);} } style={styles.plusIcon}>
                <ImageBackground style={{ height:"100%", width:"100%", }} resizeMode='contain' source={require('../assets/addmoveicon.png')}/>         
              </TouchableOpacity> 
              <TouchableOpacity onPress={() => { setMove(null); setTitle(""); setTypeAM("steps"); setFStyleAM(""); setDesc(""); setSelectedIds([]); setSteps([{ id: Date.now().toString(), title:"", img: null, desc: "" }]); setAddMode(true);}} style={styles.plusIcon}>
                <ImageBackground style={{ height:"100%", width:"100%", }} resizeMode='contain' source={require('../assets/addmanualicon.png')}/>         
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setMove(null); setTitle(""); setTypeAM("pdf"); setFStyleAM(""); setDesc(""); setVid(""); setVideoUrl("");  setSelectedIds([]); setAddMode(true);}} style={styles.plusIcon}>
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
           style={{flex:1}}
           keyExtractor={item => item.id}
           ListHeaderComponent={MyHeader}
           contentContainerStyle = {{ paddingBottom: 30, flexGrow: 1, }}
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
                          style={{ height:"57%", width:"63%", alignSelf:"center",}}
                          source={require('../assets/allstyles.png')}
                        /> ) : (
                          <Text numberOfLines={1} ellipsizeMode="clip" style={styles.cardText}>{item.style}</Text> 
                      )}
                  </ImageBackground>
                  </TouchableOpacity>) 
                  : item && item.style && item.type === "steps" ? ( <TouchableOpacity
                    style={{ width: '79%', height: 43 }}
                    onPress={() => { setType(item.type); setFStyle(item.style); setHMoves(getMoves(item.style, item.type, moves)); setListMode(true); }}>
                    <ImageBackground style={{flex: 1, justifyContent: 'center', alignItems: 'center'}} resizeMode='stretch' source={require('../assets/greenbtnbg.png')}>
                      {item.id === 's-all' ? 
                        ( <Image
                          resizeMode="contain"
                          style={{height:"57%", width:"63%", alignSelf:"center",}}
                          source={require('../assets/allstyles.png')}
                        /> ) : (
                          <Text numberOfLines={1} ellipsizeMode="clip" style={styles.cardText}>{item.style}</Text> 
                      )}
                    </ImageBackground>
                  </TouchableOpacity> )
                  : item && item.style && item.type === "pdf" && ( <TouchableOpacity
                    style={{ width: "79%", height: 43 }}
                    onPress={() => { setType(item.type); setFStyle(item.style); setHMoves(getMoves(item.style, item.type, moves)); setListMode(true); }}>
                    <ImageBackground style={{flex: 1, justifyContent: 'center', alignItems: 'center'}} resizeMode='stretch' source={require('../assets/bluebtnbg.png')}>
                      {item.id === 'p-all' ? 
                        ( <Image
                          resizeMode="contain"
                          style={{height: "57%", width: "63%", alignSelf: "center",}}
                          source={require('../assets/allstyles.png')}
                        /> ) : (
                          <Text numberOfLines={1} ellipsizeMode="clip" style={styles.cardText}>{item.style}</Text> 
                      )}
                    </ImageBackground>
                  </TouchableOpacity> )
                }
            </View>
           )}
         />) : (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={styles.infoText}>Click one of the 3 + icons to add moves or use the red folder, import icon to import moves. You can share moves after adding or importing.</Text>
          </View>
        )}
      </SafeAreaView>
     </ImageBackground>
    );
}


const styles = StyleSheet.create({
flatlistContainer: { minWidth: "100%", flex: 1, paddingBottom: 5 },
imgBackground: { flex: 1, opacity: 1, maxHeight: "91%", minWidth: "100%", height: Dimensions.get('window').height, marginTop: "7%",},
sectionContainer: { marginBottom: 25, paddingLeft: 10, backgroundColor: 'rgba(0, 255, 65, 0.1)', opacity: 1 },
sectionContainerVideo: { marginBottom: 25, paddingLeft: 10, backgroundColor: 'rgba(255, 0, 0, 0.1)', opacity: 1 },
sectionContainerPdf: { marginBottom: 25, paddingLeft: 10, backgroundColor: 'rgba(0, 0, 255, 0.1)', opacity: 1 },
sectionHeader: { color: '#33fc4d', fontSize: 13, fontWeight: 'bold', marginBottom: 9, textTransform: 'uppercase', letterSpacing: 1, backgroundColor: 'rgba(37, 37, 37, 0.76)', alignSelf: "flex-start", opacity: 1, borderRadius: 7, paddingHorizontal: 4,},
sectionHeaderVideo: { color: '#7e1311', fontSize: 13, fontWeight: 'bold', marginBottom: 9, textTransform: 'uppercase', letterSpacing: 1, backgroundColor: 'rgba(255, 255, 253, 0.91)', alignSelf: "flex-start", opacity: 1, borderRadius: 7, paddingHorizontal: 4,},
sectionHeaderPdf: { color: '#181885', fontSize: 13, fontWeight: 'bold', marginBottom: 9, textTransform: 'uppercase', letterSpacing: 1, backgroundColor: 'rgba(247, 247, 223, 0.9)', alignSelf: "flex-start", opacity: 1, borderRadius: 7, paddingHorizontal: 4,},
itemContainerVM: { width: width * 0.98, backgroundColor: 'rgba(0,0,0,0.8)', borderRadius: 15, borderWidth: 1, borderColor: '#333', overflow: 'hidden', marginBottom:12, opacity: 1},
itemContainer: { width: width * 0.7, marginRight: 15, backgroundColor: 'rgba(0,0,0,0.8)', borderRadius: 15, borderWidth: 1, borderColor: '#333', overflow: 'hidden', marginBottom:12, opacity: 1},
verticalWrapper: { width: width * 0.9, alignSelf: 'center', marginBottom: 5 },
myDojoDiscardIcon: {height: 49, width: 49, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
selectedItem: { borderColor: '#8efaa9', borderWidth: 2, backgroundColor: 'rgba(31, 221, 79, 0.6)' },
selectedItemVideo: { borderColor: '#eb2121', borderWidth: 2, backgroundColor: 'rgba(250, 85, 85, 0.6)' },
selectedItemPdf: { borderWidth: 2, borderColor: '#1e0899', backgroundColor: 'rgba(97, 71, 245, 0.6)' },
titleBanner: {width: '100%', padding: 5, borderRadius: 5, marginTop: 2 },
titleText: { textAlign: 'center', fontSize: 13, fontWeight: 'bold', color: '#51fc42', alignSelf: "flex-start", overflow: "hidden" },
titleTextVideo: { textAlign: 'center', fontSize: 13, fontWeight: 'bold', color: '#fcd1d1', alignSelf: "flex-start", overflow: "hidden"},
titleTextPdf: { color: '#6b8cff', fontWeight: 'bold', fontSize: 13, textAlign: "center", alignSelf: "flex-start", overflow: "hidden" },
thumbImage: { width: "100%", height: 152, backgroundColor: '#1a1a1a', justifyContent: 'center', alignItems: 'center' },
thumbPdf: { width: "100%", height: 76, resizeMode: 'contain', backgroundColor: '#1a1a1a', justifyContent: 'center', alignItems: 'center' },
myDojoDeleteIcon: {height: 49, width: 49, borderRadius: 0,  alignItems: 'center', justifyContent: 'center' },
pillRow: { backgroundColor: 'rgba(0, 43, 0, 0.5)',flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 3, marginTop: 8, borderRadius: 9, opacity: 1 },
pillRowVideo: { backgroundColor: 'rgba(43, 0, 0, 0.5)', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 3, marginTop: 7, borderRadius: 9, opacity: 1},
pillRowPdf: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 5, backgroundColor: 'rgba(8, 35, 153, 0.3)', paddingHorizontal: 3, borderRadius: 9, marginTop: 8, opacity: 1 },
typePill: { backgroundColor: 'rgba(203, 212, 206, 0.38)', color: '#29fd5e', fontSize: 10, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 5 },
typePillVideo: { backgroundColor: 'rgba(247, 190, 170, 0.38)', color: '#d8414d', fontSize: 10, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 5 },
typePillPdf: { color: '#6b8cff', fontSize: 10, fontWeight: 'bold' },
batchBar: { position: 'absolute', bottom: 57, left: 20, right: 20, flexDirection: 'row', backgroundColor: '#1a1a1a', padding: 15, borderRadius: 30, alignItems: 'center', justifyContent: 'space-around', borderWidth: 1, borderColor: '#00FF41', elevation: 10 },
batchBarVideo: { position: 'absolute', bottom: 57, left: 20, right: 20, flexDirection: 'row', backgroundColor: '#1a1a1a', padding: 15, borderRadius: 30, alignItems: 'center', justifyContent: 'space-around', borderWidth: 1, borderColor: '#b30000', elevation: 10 },
batchBarPdf: { position: 'absolute', bottom: 57, left: 20, right: 20, flexDirection: 'row', backgroundColor: '#1a1a1a', padding: 15, borderRadius: 30, alignItems: 'center', justifyContent: 'space-around', borderWidth: 1, borderColor: '#0505c2', elevation: 10 },
batchText: { color: '#00FF41', fontWeight: 'bold'},
batchTextVideo: { color: '#fa3030', fontWeight: 'bold'},
batchTextPdf: { color: '#2f2ff8', fontWeight: 'bold'},
shareIcon: { height: 49, width: 49, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
container: { flex: 1, backgroundColor: '#c2cdd4' },
banner: { width: '100%', height: 57, borderRadius: 12, marginBottom: 10 },
header: { flexDirection: 'column', width: "95%", minHeight: 76, backgroundColor: 'rgba(195, 209, 223, 0.4)', borderWidth: 1, borderColor: '#c2cdd4',justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginBottom: 5, borderRadius: 9},
myDojoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, backgroundColor: 'rgba(0,0,0,0.76)', opacity: 1 },
title: { fontSize: 17, fontWeight: 'bold', color: '#420105', height: 38, width: '100%', textAlign: 'center', marginBottom: 2 },
infoText: { fontSize: 14, fontWeight: 'bold', color: '#fc2626', minHeight: 76, width: '94%', textAlign: 'center', marginTop: -95, paddingHorizontal: 19, backgroundColor: 'rgba(0,0,0,0.5)' },
icon: { height: 57, width: '89%', alignSelf: 'center' },
card: { marginHorizontal: 12, marginVertical: 5, alignItems: 'center', borderRadius: 10, width: "100%", opacity: 1 },
cardText: { fontSize: 16, fontWeight: 'bold', color: '#bddff3', paddingHorizontal: 5,},
greenDivider: {width: '90%', height: 43, alignSelf: 'center',marginVertical: 15,shadowColor: '#c9f5d5', shadowOffset: { width: 0, height: 0 },shadowOpacity: 0.5,shadowRadius: 10, backgroundColor: 'rgba(195, 209, 223, 0.4)', opacity: 1},
redDivider: {width: '90%',height: 43, alignSelf: 'center', marginVertical: 15, shadowColor: '#f8d7d7', shadowOffset: { width: 0, height: 0 },shadowOpacity: 0.5,shadowRadius: 10, backgroundColor: 'rgba(195, 209, 223, 0.4)', opacity: 1},
blueDivider: { width: '90%', height: 43, alignSelf: "center", marginVertical: 15, shadowColor: '#6b8cff', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 10, backgroundColor: 'rgba(195, 209, 223, 0.4)', opacity: 1 },
smallGap: {height: 12,},
cardInternal:{ padding: 10, backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 10 },
plusIcon: { height: 47, width: 45, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 7, marginLeft: 15, marginBottom: 2, opacity: 1},
editIcon: { height: 47, width: 47, borderRadius: 4, marginLeft: 12, marginBottom: 4, opacity: 1},
infoIcon: { height: 43, width: 43, marginLeft: 16, marginBottom: 5, opacity: 1, },
importIcon: {height: 61, width: 57, borderRadius: 9, marginLeft: 12, marginBottom: 3},
imgBackgroundAM: {  ...StyleSheet.absoluteFillObject, flex: 1, },
iconAM: { height: 57, width: '90%', alignSelf: 'center' },
videoIcon: { height: 76, width: 76, marginLeft: 12, backgroundColor: 'rgba(212, 29, 54, 0.1)', borderRadius: 2, marginTop: 5, justifyContent: 'center', alignItems: 'center'},
videoIconUploaded: { height: 76, width: 76, marginLeft: 12, backgroundColor: 'rgba(72, 243, 163, 0.4)', borderRadius: 10, marginTop: 5, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#f84444', borderStyle: 'dashed'},
pdfIcon: { height: 76, width:76, backgroundColor: 'hsla(204, 77%, 48%, 0.17)', borderRadius: 2, marginTop: 5, justifyContent: 'center', alignItems: 'center', marginLeft: 12},
pdfIconText: { color: '#020142', fontWeight: 'bold', fontSize: 12, marginLeft: 4 },
videoIconText: { color: '#420105', fontWeight: 'bold', fontSize: 12 },
plusIconAM: { height: 51, width: 46, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 7, marginRight: 19, marginBottom: 2, opacity: 1},
plusIconText: { color: '#420105', fontWeight: 'bold', fontSize: 10 },
containerAM: { flex: 1, opacity: 1 },
headerTitle: { fontSize: 17, fontWeight: 'bold', color: '#023010', marginTop:7, marginBottom: 3, marginLeft: 43, backgroundColor: 'rgba(61, 170, 91, 0.2)', textDecorationLine: 'underline', textDecorationColor: '#014211', textDecorationStyle: 'solid', borderRadius: 7, alignSelf: "flex-start", paddingHorizontal: 4, paddingVertical: 1,},
headerTitleVideo: { fontSize: 17, fontWeight: 'bold', color: '#420105', marginTop:7, marginBottom: 3, marginLeft: 43, backgroundColor: 'rgba(167, 38, 57, 0.2)', textDecorationLine: 'underline', textDecorationColor: '#420105', textDecorationStyle: 'solid', borderRadius: 7, alignSelf: "flex-start", paddingHorizontal: 4, paddingVertical: 1,},
headerTitlePdf: { fontSize: 17, fontWeight: 'bold', color: '#010242', marginTop:7, marginBottom: 3, marginLeft: 43, backgroundColor: 'rgba(45, 43, 158, 0.2)', textDecorationLine: 'underline', textDecorationColor: '#020142', textDecorationStyle: 'solid', borderRadius: 7, alignSelf: "flex-start", paddingHorizontal: 4, paddingVertical: 1,},
label: { fontWeight: 'bold', color: '#420105', marginTop: 12, fontSize: 13, marginLeft: 12 },
input: { borderWidth: 1, borderColor: '#990808', borderRadius: 12, padding: 8, marginTop: 7, backgroundColor: 'rgba(212, 29, 54, 0.1)', opacity: 1, fontWeight: "semibold" },
pdfinput: { borderWidth: 1, borderColor: '#436fff', borderRadius: 12, padding: 8, marginTop: 7, backgroundColor: 'rgba(28, 142, 218, 0.17)', opacity: 1, fontWeight: "semibold" },
stepRow: { flexDirection: 'column', marginTop: 7, alignItems: 'center', padding: 10, borderRadius: 10, elevation: 1 },
stepImg: { width: '100%', height: '100%' },
stepInput: { borderWidth: 1, borderColor: '#083a1d', padding: 8, marginTop: 7, backgroundColor: 'rgba(80, 214, 145, 0.41)', borderRadius: 12, opacity: 1, fontWeight: "semibold"},
removeText: { color: '#dc2626', fontSize: 10, textAlign:'center', marginTop: 1, fontWeight: 'bold', width: '100%' },
removeStepIcon:{alignItems: 'center', justifyContent: 'center', marginTop:5, height:107, width:95, flexDirection: 'column', backgroundColor: 'rgba(255, 0, 0, 0.1)', borderRadius: 20, borderWidth: 1, borderColor: '#ff4d4d', opacity: 1},
addStepBtn: {marginTop: 5, height: 41 ,width: 114, alignSelf:'center', alignItems: 'center',justifyContent:'center'},
saveBtn: { width: 125, height: 97, borderRadius: 15, marginTop: 7, alignSelf:'center', alignItems: 'center', justifyContent:'center', },
discardBtn: { marginBottom: 9, marginLeft: 12, height: 70, width: 67, borderRadius: 10, justifyContent: 'center', alignItems: 'center', opacity: 1},
discardText: { textAlign: 'center', color: '#dc2626', fontWeight: 'bold', fontSize: 10, marginTop: 1, height: 15, width: '100%' },
stepImgContainer: { width: 77, height: 77, justifyContent: 'center', alignItems: 'center', borderRadius: 12, borderWidth: 0, opacity: 1},
searchRow: { flexDirection: 'row', paddingHorizontal: 9, paddingVertical: 4,  gap: 8, marginBottom: 7, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 9, alignItems: 'center', justifyContent: 'center', width: "100%", borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
searchInput: { height: 38, width: "70%", backgroundColor: 'rgba(255, 255, 255, 0.79)', borderRadius: 8, paddingHorizontal: 8, color: 'black', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', fontSize: 11},
searchBtn: { width: 39, height: 37, backgroundColor: '#e7f5ed4f', borderRadius: 8, justifyContent: 'center', alignItems: 'center', opacity: 1, paddingHorizontal: 2},
silverDivider: { width: '99%', height: 49, alignSelf: "center", paddingVertical: 1, opacity: 1 },
clearBtn: { width: 32, height: 32, backgroundColor: '#31303080', borderRadius: 8, justifyContent: 'center', alignItems: 'center',},
imgBackgroundManual: { minWidth: "100%", backgroundColor: "#233535", flex: 1, opacity: 1, margin: 0, padding: 3, borderRadius: 7, borderColor: 'silver', borderWidth: 1, borderBottomWidth: 1},
desctextManual: { fontSize: 15, lineHeight: 21, fontWeight: '500', letterSpacing: 0.25, marginTop: 2, color: 'white', padding: 5, borderRadius: 7, opacity: 1 },
titletextManual: {fontSize: 17, lineHeight: 21, fontWeight: '600', letterSpacing: 0.25, marginLeft: 7, color: 'black', opacity: 1, },
orText: { color: '#420105', fontWeight: 'bold', fontSize: 15, marginTop: 12, marginBottom: -7, marginLeft: 38 },
toggleModeBtn: { alignSelf: 'center', marginTop: 45, marginBottom: 19, paddingVertical: 5, paddingHorizontal: 5, backgroundColor: 'rgba(212, 29, 54, 0.1)', borderRadius: 6, borderWidth: 1,  borderColor: '#990808', flexDirection: "row" },
toggleModePdfBtn: { alignSelf: 'center', marginTop: 45, marginBottom: 19, paddingVertical: 5, paddingHorizontal: 5,  backgroundColor: 'rgba(28, 142, 218, 0.17)', borderRadius: 6, borderWidth: 1, borderColor: '#436fff', flexDirection: "row" },
toggleModeText: { color: '#420105', fontSize: 14, fontWeight: '600', marginLeft: 4 },
});