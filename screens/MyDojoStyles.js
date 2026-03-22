import { View, Text, TouchableOpacity, FlatList, Alert, StyleSheet, ActivityIndicator, ImageBackground, Image } from 'react-native';
import { useNavigation, useFocusEffect  } from '@react-navigation/native'
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNetInfo } from "@react-native-community/netinfo"; 
import { File, Directory, Paths } from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import React, { useState, useCallback  } from 'react';
import { unzip } from 'react-native-zip-archive';
//Code for a screen whith one list, A list all moves grouped first by move.type=(video or steps) then grouped by move.style(user entered or Self-Defence by default) 
//depending on which group (a specific moves style button or all styles button) is clicked on navigate and show list of moves filtered by type and style clicked on all style button but no all types button 
//this means no screen will show all video and steps moves in one list. So the MyDojo screen will only have lists with either (1) a type with all styles, OR (2) a type and one style    
//only when rendering moves with all styles from a type MyDojo will need to render a vertical list (for each style) and horizontal list(for each move with same style) in the manager, instead of one vertical list that will be rendered when hmoves=one type and one style. 
// A horizontal divider needed in flatList when type changes to type=='steps',
//use matrix dojo in bg, try use red/blue pills buttons (each style,allstyles) , 
// Added Move title - subtitle add,share,import moves, Edit Move title, My Dojo Move Styles, MyDojo
//Added-> share btn, import btn, plus btn, edit btn, del btn, add step btn, save move btn, info btn 
// added cool fonts, and a prieview for the video(or Thumbnail) and images in the steps, and an import/share many option.    
export default function MyDojoStyles() {
    const [moves, setMoves] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [smoves, setSMoves] = useState([]);
    const navigation = useNavigation();

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

    const handleDelete = (id) => {
      const updatedList = moves.filter(m => m.id !== id);
      const file = new File(Paths.document, 'moves.json');
      file.write(JSON.stringify(updatedList));
      setMoves(updatedList);
      parseStyles(updatedList);
    };

    const handleImport = async () => {
      try {
        if (isOffline) {
          Alert.alert("Offline", "Internet required.");
          return;
        }

        const res = await DocumentPicker.getDocumentAsync({ type: 'application/zip' });
        if (res.canceled) return;
        setLoading(true);
        const tempDir = new Directory(Paths.document, 'temp_import');
        if (!tempDir.exists) {
          tempDir.create();
        }

        await unzip(res.assets[0].uri, tempDir.uri);
        const dataFile = new File(tempDir, 'data.json');
        if (dataFile.exists) {
          const content = await dataFile.text();
          const parsedData = JSON.parse(content);
          handleSave(parsedData);
        }
        tempDir.delete();

      } catch (e) {
        console.error(e);
        Alert.alert("Error", "Import failed.");
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
          sMoves.push({ ...m, style: currentStyle }); // Ensure it has the default style
        } else if (m.type === 'steps' && !stepStyles.includes(currentStyle)) {
          stepStyles.push(currentStyle); 
          bMoves.push({ ...m, style: currentStyle });
        }
      });
      setSMoves([...sMoves, ...bMoves]);
    };
    

    const parseHMoves = (movesList) => {
      let hMoves = [];
      let stylesSeen = [];
      for (let mNum = 0; mNum < movesList.length; mNum++) {
        const move = movesList[mNum];
        const currentStyle = move.style || 'Self-Defence'; // Match your parseStyles logic
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

    if (loading) return <ActivityIndicator size="large" color="#f30707" style={{flex:1, transform: [{scale: 2.0}]}} />;

    return (
     <ImageBackground style={ styles.imgBackground } resizeMode='cover' source={require('../assets/mydojostylesbg.jpg')}>
      <SafeAreaView style={{flex:1}}>
        <View style={{backgroundColor: 'transparent', marginBottom:30, paddingLeft:5, paddingRight:5}}>
          <ImageBackground style={ styles.icon } resizeMode='contain' source={require('../assets/mydojostylestitle.png')} /> 
        </View>
        <View style={styles.header}>
           <Text style={styles.title}>MY DOJO FIGHTING STYLES LIST</Text>
            <View style={{ flex:1, flexDirection:'row', alignItems:'left', marginBottom: 1, padding: 0,}}>
              <TouchableOpacity onPress={() => navigation.navigate('AddMove', { move: null, mtype: 'video', mstyle: null, onSync: handleSave })} style={styles.plusIcon}>
                <ImageBackground style={{ flex:1, height:"auto", width:"auto", }} resizeMode='contain' source={require('../assets/addmoveicon.png')}/>         
              </TouchableOpacity> 
              <TouchableOpacity onPress={() => navigation.navigate('AddMove', { move: null, mtype: 'steps', mstyle: null, onSync: handleSave })} style={styles.plusIcon}>
                <ImageBackground style={{ flex:1, height:"auto", width:"auto", }} resizeMode='contain' source={require('../assets/addmanualicon.png')}/>         
              </TouchableOpacity>
              <TouchableOpacity onPress={handleImport} style={styles.importIcon}>
                <ImageBackground style={{ flex:1,}} resizeMode='contain' source={require('../assets/importmoveicon.png')}/>         
              </TouchableOpacity>
            </View>
        </View>

        <FlatList
          data={smoves}
          keyExtractor={item => item.id}
          ItemSeparatorComponent={({ leadingItem }) => {
            const index = smoves.findIndex(m => m.id === leadingItem.id);
            if (smoves[index + 1]?.id === 's-all') {
              return <Image source={require('../assets/manualsdivider.png')} style={styles.greenDivider} resizeMode='contain'/>;
            } else if (smoves[index + 1]?.id === 'v-all') {
              return <Image source={require('../assets/movesdivider.png')} style={styles.redDivider} resizeMode='contain'/>;
            }
            return <View style={styles.smallGap} />;
          }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.btnGroup}>
                {item.type === 'video' ? 
                  ( <TouchableOpacity
                  style={styles.card}
                  onPress={() => navigation.navigate('MyDojo', { rmoves: getMoves(item.style, item.type), fstyle: item.style, ftype: item.type, onSync: handleSave, onDelete: handleDelete, isOffline: isOffline, 
                  })}>
                  <ImageBackground style={{flex:1, height:"auto", width:"98.5%",}} resizeMode='contain' source={require('../assets/redbtnbg.png')}>
                    {item.style === 'allstyles' ? 
                      ( <Image
                          resizeMode="contain"
                          style={{ flex:1, height:"auto", width:"83%", alignSelf:"center",}}
                          source={require('../assets/allstyles.png')}
                        /> ) : (
                          <Text style={styles.cardText}>{item.style}</Text> 
                      )}
                  </ImageBackground>
                  </TouchableOpacity>) 
                  : ( <TouchableOpacity
                    style={styles.card}
                    onPress={() => navigation.navigate('MyDojo', { rmoves: getMoves(item.style, item.type), fstyle: item.style, ftype: item.type, onSync: handleSave, onDelete: handleDelete, isOffline: isOffline})}>
                    <ImageBackground style={{flex:1, height:"auto", width:"98.5%",}} resizeMode='contain' source={require('../assets/greenbtnbg.png')}>
                      {item.style === 'allstyles' ? 
                        ( <Image
                          resizeMode="contain"
                          style={{ flex:1, height:"auto", width:"83%", alignSelf:"center",}}
                          source={require('../assets/allstyles.png')}
                        /> ) : (
                          <Text style={styles.cardText}>{item.style}</Text> 
                      )}
                    </ImageBackground>
                  </TouchableOpacity> )
                }
              </View>
            </View>
          )}
        />
      </SafeAreaView>
     </ImageBackground>
    );
}

const styles = StyleSheet.create({
imgBackground: { flex: 1, width: '100%', height: '100%' },
container: { flex: 1, backgroundColor: '#f8f9fa' },
banner: { width: '100%', height: 57, borderRadius: 12, marginBottom: 10 },
header: { flex:1, flexDirection: 'column', width:"98%", padding: 1, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#eee' },
title: { fontSize: 18, fontWeight: 'bold', color: '#420105' },
topBtn: { marginLeft: 15 },
icon: { height: 60, width: '90%', alignSelf: 'center' },
card: { backgroundColor: 'transparent', marginHorizontal: 10, marginVertical: 5,alignItems: 'center'},
cardText: { fontSize: 18, fontWeight: 'bold', color: '#fff',},
divider: {width: '90%', height: 50, alignSelf: 'center', marginVertical: 20 },
greenDivider: {width: '90%',height: 40, alignSelf: 'center',marginVertical: 15,shadowColor: '#c9f5d5', shadowOffset: { width: 0, height: 0 },shadowOpacity: 0.5,shadowRadius: 10,},
redDivider: {width: '90%',height: 40, alignSelf: 'center',marginVertical: 15,shadowColor: '#f8d9de', shadowOffset: { width: 0, height: 0 },shadowOpacity: 0.5,shadowRadius: 10,},
smallGap: {height: 12,},
cardInternal: { padding: 10, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 10 },
deleteIcon: { height: 35, width: 35 },
discardIcon: { height: 35, width: 35 },
redPill: {backgroundColor: 'rgba(211, 47, 47, 0.8)', borderRadius: 25,borderWidth: 1,borderColor: '#ff4444',},
bluePill: {backgroundColor: 'rgba(25, 118, 210, 0.8)', borderRadius: 25,borderWidth: 1,borderColor: '#44aaff',},
plusIcon:{height:38, width:38, borderRadius:9, marginLeft:5},
importIcon:{height:38, width:38, borderRadius:9, marginLeft:5},
pillButton: {paddingVertical: 15, paddingHorizontal: 25, borderRadius: 30, marginVertical: 10, marginHorizontal: 20, borderWidth: 1,borderColor: 'rgba(255,255,255,0.3)',elevation: 5, 
  shadowColor: '#000', shadowOffset: { width: 0, height: 2 },shadowOpacity: 0.8,shadowRadius: 2,},
});