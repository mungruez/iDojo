import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert, StyleSheet , Dimensions, ImageBackground, Image, ActivityIndicator} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { File, Directory, Paths } from 'expo-file-system';
import { useNavigation } from '@react-navigation/native'
import { zip } from 'react-native-zip-archive';
import * as Sharing from 'expo-sharing';

const { width } = Dimensions.get('window');

export default function MyDojo({route}) { 
  const navigation = useNavigation();
  const { hmoves, ftype, fstyle, isOffline } = route.params;
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleUpdate = (updatedMove) => {
    let newList = [...hmoves];
    setLoading(true);
    if (fstyle === "allstyles") {
      const styleIndex = newList.findIndex(g => g.style === updatedMove.style);
      if (styleIndex > -1) {
        const moveIndex = newList[styleIndex].data.findIndex(m => m.id === updatedMove.id);
        if (moveIndex > -1) newList[styleIndex].data[moveIndex] = updatedMove;
        else newList[styleIndex].data.push(updatedMove);
      } else {
        newList.push({ style: updatedMove.style, data: [updatedMove] });
      }
    } else {
      const index = newList.findIndex(m => m.id === updatedMove.id);
      if (index > -1) newList[index] = updatedMove;
      else newList.push(updatedMove);
    }
    setLoading(false);
    navigation.navigate('MyDojoStyles', { savedMove: finalData });
  };

  const handleDelete = () => {
    Alert.alert("Delete Moves", `Remove ${selectedIds.length} selected moves?`, [
      { text: "Cancel" },
      { text: "Delete", style: 'destructive', onPress: () => {
          navigation.navigate('MyDojoStyles', { deletedIds: selectedIds });
          setSelectedIds([]); 
      }}
    ]);
  };


const handleShare = async () => {
  try {
    if (isOffline) return Alert.alert("Offline", "Internet required to share.");
    if (selectedIds.length === 0) return;

    // 1. Filter moves from state
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

    // 2. Setup temporary share directory in Cache (better for permissions)
    const shareDir = `${FileSystem.cacheDirectory}batch_share/`;
    await FileSystem.deleteAsync(shareDir, { idempotent: true });
    await FileSystem.makeDirectoryAsync(shareDir, { intermediates: true });

    // 3. Process and Copy Assets
    const processedMoves = await Promise.all(selectedMoves.map(async (move) => {
      let updatedMove = { ...move };
      const ensureUri = (path) => path.startsWith('file://') ? path : `file://${path}`;

      // Handle Video Assets
      if (move.type === 'video' && move.vid) {
        const fileName = move.vid.split('/').pop();
        const destPath = `${shareDir}${fileName}`;
        await FileSystem.copyAsync({ from: ensureUri(move.vid), to: ensureUri(destPath) });
        updatedMove.vid = fileName; // Store only filename in JSON
      }

      // Handle Step Image Assets
      if (move.type === 'steps' && move.steps) {
        updatedMove.steps = await Promise.all(move.steps.map(async (step) => {
          if (step.img) {
            const fileName = step.img.split('/').pop();
            const destPath = `${shareDir}${fileName}`;
            await FileSystem.copyAsync({ from: ensureUri(step.img), to: ensureUri(destPath) });
            return { ...step, img: fileName }; // Store only filename
          }
          return step;
        }));
      }
      return updatedMove;
    }));

    // 4. Save the normalized JSON
    await FileSystem.writeAsStringAsync(`${shareDir}shared_moves.json`, JSON.stringify(processedMoves));

    // 5. ZIP and Share
    const zipName = `Dojo_Batch_${Date.now()}.zip`;
    const zipPath = `${FileSystem.cacheDirectory}${zipName}`;
    await zip(shareDir, zipPath);

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(zipPath, {
        mimeType: 'application/zip',
        dialogTitle: 'Share your Dojo Moves',
        UTI: 'com.pkware.zip-archive',
      });
    }

    setSelectedIds([]); // Reset selection
  } catch (e) {
    console.error("Batch share error:", e);
    Alert.alert("Error", "Sharing failed. Check permissions or file paths.");
  } finally {
    setLoading(false);
  }
};


const handleShare = async () => {
  try {
    // 1. Pre-flight checks
    if (isOffline) return Alert.alert("Offline", "You need an internet connection to share.");
    if (selectedIds.length === 0) return;

    setLoading(true);

    // 2. Identify the selected moves from state (handling both grouped and flat arrays)
    let selectedMoves = [];
    if (fstyle === "allstyles") {
      hmoves.forEach(group => {
        const found = group.data.filter(m => selectedIds.includes(m.id));
        selectedMoves = [...selectedMoves, ...found];
      });
    } else {
      selectedMoves = hmoves.filter(m => selectedIds.includes(m.id));
    }

    // 3. Setup temporary directories in Cache (Cache has better sharing permissions on Android)
    const shareDir = `${FileSystem.cacheDirectory}batch_share/`;
    const zipName = `Dojo_Batch_${Date.now()}.zip`;
    const zipPath = `${FileSystem.cacheDirectory}${zipName}`;

    // Clean up any old data
    await FileSystem.deleteAsync(shareDir, { idempotent: true });
    await FileSystem.deleteAsync(zipPath, { idempotent: true });
    await FileSystem.makeDirectoryAsync(shareDir, { intermediates: true });

    // 4. Process moves and copy assets with UNIQUE filenames to prevent overwrites
    const processedMoves = await Promise.all(selectedMoves.map(async (move) => {
      let updatedMove = { ...move };
      
      // Helper to ensure path is valid for FileSystem
      const ensureUri = (path) => path.startsWith('file://') ? path : `file://${path}`;

      // Handle Video
      if (move.type === 'video' && move.vid) {
        const extension = move.vid.split('.').pop();
        const uniqueFileName = `${move.id}_video.${extension}`;
        const destPath = `${shareDir}${uniqueFileName}`;
        
        await FileSystem.copyAsync({ 
          from: ensureUri(move.vid), 
          to: ensureUri(destPath) 
        });
        updatedMove.vid = uniqueFileName; // Save relative name for receiver
      }

      // Handle Step Images
      if (move.type === 'steps' && move.steps) {
        updatedMove.steps = await Promise.all(move.steps.map(async (step, index) => {
          if (step.img) {
            const extension = step.img.split('.').pop();
            const uniqueFileName = `${move.id}_step_${index}.${extension}`;
            const destPath = `${shareDir}${uniqueFileName}`;
            
            await FileSystem.copyAsync({ 
              from: ensureUri(step.img), 
              to: ensureUri(destPath) 
            });
            return { ...step, img: uniqueFileName };
          }
          return step;
        }));
      }
      return updatedMove;
    }));

    // 5. Save the "Mini-JSON" inside the folder
    const dataFilePath = `${shareDir}shared_moves.json`;
    await FileSystem.writeAsStringAsync(dataFilePath, JSON.stringify(processedMoves));

    // 6. Create the ZIP archive
    await zip(shareDir, zipPath);

    // 7. Execute Native Share
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(zipPath, {
        mimeType: 'application/zip',
        dialogTitle: 'Share your Dojo Moves',
        UTI: 'com.pkware.zip-archive', // Required for iOS to recognize ZIPs
      });
    } else {
      Alert.alert("Error", "Sharing is not available on this device.");
    }

    // 8. Cleanup and Reset UI
    setSelectedIds([]); 
    await FileSystem.deleteAsync(shareDir, { idempotent: true });

    // Delay deletion of the ZIP to ensure the share-sheet has finished reading it
    setTimeout(async () => {
      try {
        await FileSystem.deleteAsync(zipPath, { idempotent: true });
      } catch (err) { /* Silent fail if already gone */ }
    }, 20000);

  } catch (e) {
    console.error("Batch share error:", e);
    // On Android 13+, this usually fails if source files aren't in the app's document folder
    Alert.alert("Sharing Failed", "Ensure the app has media permissions and the files exist.");
  } finally {
    setLoading(false);
  }
};



  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener('MOVE_SAVED_EVENT', (newMove) => {
      setHMoves(prev => {
        const exists = prev.find(m => m.id === newMove.id);
        if (exists) {
          return prev.map(m => m.id === newMove.id ? newMove : m);
        }
        return [newMove, ...prev];
      });
    });

    return () => subscription.remove();
  }, [hmoves]);

  const MoveCard = ({ item }) => (
    <TouchableOpacity
      onLongPress={() => toggleSelect(item.id)}
      onPress={() => selectedIds.length > 0 ? toggleSelect(item.id) : ftype === "video" ? navigation.navigate('Move', { video: item }) :  navigation.navigate('Manual', { manual: item })}
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
  
  return (
   <ImageBackground style={ styles.imgBackground } resizeMode='cover' source={require('../assets/mydojobg.jpg')}>
    <SafeAreaView style={styles.container}>
      <View style={{backgroundColor: 'transparent', marginBottom:30, paddingLeft:5, paddingRight:5}}>
        <ImageBackground style={ styles.icon } resizeMode='contain' source={ftype=== 'video' ? require('../assets/moveslisttitle.png') : require('../assets/manualstitle.png')} /> 
      </View>
      <View style={styles.header}>
        <Text style={styles.title}>{fstyle === 'allstyles' ? `ALL ${ftype.toUpperCase()} FIGHTING STYLES` : "FIGHTING STYLE: "+fstyle}</Text>
        <View style={{flexDirection:'row'}}>
          <TouchableOpacity onPress={() => navigation.navigate('AddMove', { move: null, mtype: ftype, mstyle: fstyle !== 'allstyles' ? fstyle : 'Self Defense' })} style={styles.plusIcon}>
            <ImageBackground style={{ flex:1, height:"auto", width:"auto", }} resizeMode='contain' source={ftype === 'steps' ? require('../assets/addmanualicon.png') : require('../assets/addmoveicon.png') }/>         
          </TouchableOpacity>
        </View>
      </View>
      
      <FlatList
        data={hmoves}
        keyExtractor={(item, index) => item.id || index.toString()}
        renderItem={({ item }) => (
          fstyle === "allstyles" ? (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionHeader}>{item.style}</Text>
                <FlatList
                  horizontal
                  data={item.data}
                  keyExtractor={m => m.id}
                  renderItem={({ item }) => <MoveCard item={item} />}
                  contentContainerStyle={{ paddingRight: 19 }}
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
          <TouchableOpacity onPress={handleDelete} style={styles.deleteIcon}>
            <ImageBackground style={{height:"100%", width:"100%", }} resizeMode='contain' source={ftype === 'steps' ? require('../assets/deletemanualicon.png') : require('../assets/deletemoveicon.png') }/>         
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSelectedIds([])} style={styles.discardIcon}>
            <ImageBackground style={{height:"100%", width:"100%", }} resizeMode='contain' source={require('../assets/discardicon.png') }/> 
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
   </ImageBackground>
  );
}

const styles = StyleSheet.create({
  imgBackground: { flex: 1, width: '100%', height: '100%' },
  icon: { height: 60, width: '90%', alignSelf: 'center' },
  btnGroup: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  container: { flex: 1, margingTop:25},
  card: {flex:1, height:76, width:76, backgroundColor: 'rgba(0, 255, 65, 0.1)', borderRadius: 9, borderWidth: 1, borderColor: '#117a2c', alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, backgroundColor: 'rgba(0,0,0,0.5)' },
  title: { color: '#00FF41', fontSize: 12, flex: 1, textTransform: 'uppercase' },
  sectionContainer: { marginBottom: 25, paddingLeft: 10, backgroundColor: 'rgba(0, 255, 65, 0.1)' },
  sectionHeader: { color: '#00FF41', fontSize: 18, fontWeight: 'bold', marginBottom: 9, textTransform: 'uppercase', letterSpacing: 1 },
  itemContainer: { width: width * 0.7, marginRight: 15, backgroundColor: 'rgba(0,0,0,0.8)', borderRadius: 15, borderWidth: 1, borderColor: '#333', overflow: 'hidden', marginBottom:12, },
  verticalWrapper: { width: width * 0.9, alignSelf: 'center', marginBottom: 15 },
  selectedItem: { borderColor: '#8efaa9', borderWidth: 2, backgroundColor: 'rgba(16, 212, 65, 0.6)' },
  titleBanner: {width: '90%', padding: 5, borderRadius: 5, marginTop: 3 },
  titleText: { textAlign: 'center', fontSize: 11, fontWeight: 'bold', color: '#0FF41' },
  thumbImage: { width: '100%', height: 150, backgroundColor: '#1a1a1a' },
  pillRow: { backgroundColor: 'rgba(0, 255, 65, 0.3)',flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 3, marginTop: 8 },
  typePill: { backgroundColor: 'rgba(0, 255, 65, 0.1)', color: '#00FF41', fontSize: 10, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 5 },
  editIcon: { fontSize: 16 },
  batchBar: { position: 'absolute', bottom: 49, left: 20, right: 20, flexDirection: 'row', backgroundColor: '#1a1a1a', padding: 15, borderRadius: 30, alignItems: 'center', justifyContent: 'space-around', borderWidth: 1, borderColor: '#00FF41', elevation: 10 },
  batchText: { color: '#00FF41', fontWeight: 'bold' },
  batchIcon: { fontSize: 22, color: '#fff' },
  plusIcon:{height: 38, width: 43, borderRadius: 9, marginLeft:5, backgroundColor:'#d7dae6'},
  importIcon: {height: 43,width: 43,borderRadius: 9, marginLeft: 5 },
  shareIcon: {height: 43, width: 43, borderRadius: 9, backgroundColor: '#daf1dc', alignItems: 'center', justifyContent: 'center' },
  deleteIcon: {height: 43, width: 43, borderRadius: 9, backgroundColor: '#d9d6e4', alignItems: 'center', justifyContent: 'center' },
  discardIcon: {height: 43, width: 43, borderRadius: 9, backgroundColor: '#d1deeb', alignItems: 'center', justifyContent: 'center' },
});
//FUTURE UPDATES: (1) AI COACH - How it makes money: Users record themselves doing a strike. The API compares their skeletal movement to a "Master" video. You charge a premium subscription for this "AI Private Lesson" feature
//(2) PDF parsing Use a PDF Parsing API to let users upload their federation’s manual. The Tech: Your app scans the PDF for text and images (using the code we discussed), identifies specific techniques (e.g., "Wrist Release"), and automatically generates a digital checklist or interactive training plan
//(3) ez FIGHTERS VAULT- present day best fighters and those with traing to sell could have a marketplace 30% cut
//(4)  ez Use a Product API to suggest specific gear (pepper spray, tactical flashlights, Gi brands) based on the "moves" the user is learning.
//(5) ez In-app video recording and analysis: Allow users to record themselves performing techniques and use a video analysis API to provide feedback on their form, timing, and execution. This could be a premium feature that offers personalized coaching tips based on the user's performance.
// (6) Use the Google Maps API and a Real-time Notification API (like Ably or PubNub) to alert users when they enter a "high-alert" zone marked by the community.
//(7) vez Implement a "Move of the Day" feature using a Content Management API to rotate featured techniques, keeping users engaged and encouraging daily practice.
//(8) vez Create a "Dojo Challenges" system where users can complete specific training challenges (e.g., "Practice 10 wrist releases this week") and earn badges or rewards. Use a Gamification API to manage challenges, track progress, and distribute rewards.
//(9) vez Social sharing for individual self defense stories. track progress, etc, help remember all self training, catas, moves etc 
//(10) Implement a "Move of the Day" feature using a Content Management API to rotate featured techniques, keeping users engaged and encouraging daily practice.
//(11) Create a "Dojo Challenges" system where users can complete specific training challenges (e.g., "Practice 10 wrist releases this week") and earn badges or rewards. Use a Gamification API to manage challenges, track progress, and distribute rewards.
//(12) Integrate a "Move Library" feature that allows users to browse and search a comprehensive database of techniques, categorized by type, style, and difficulty. Use a Search API to enable advanced filtering and sorting options, making it easy for users to find specific moves or discover new ones based on their interests and skill level.
//(13) hard Implement a "Move Comparison" tool that allows users to compare their execution of a technique against a reference video. Use a Video Analysis API to break down the user's performance and provide side-by-side feedback on key elements like form, timing, and power.
//(14) Develop a "Move Customization" feature that lets users modify existing techniques or create their own variations. Use a Drag-and-Drop API to enable users to rearrange steps, add annotations, and personalize their training regimen. This could
//(15) Integrate a "Move Sharing" platform where users can upload and share their own techniques with the community. Use a Cloud Storage API to handle media uploads and a Social API to facilitate sharing, commenting, and rating of user-generated content. This would foster a sense of community and encourage knowledge exchange among practitioners. 
//(16) Implement a "Move History" feature that tracks the user's training progress over time. Use a Database API to store and retrieve historical data on techniques practiced, improvements made, and milestones achieved. This would allow users to reflect on their journey and set future goals based on their past performance.
//(17) Use Blazepose and MediPipe to covert video to timestamps with body angles for comparing to other users move videos. Matching algorihtm needed.

//Code for parent screen whith one list, A list all moves grouped first by move.type=(video or steps) then grouped by move.style(user entered or Self-Defence by default) 
//depending on which group (a specific moves style button or all styles button) is clicked on navigate and show list of moves filtered by type and style clicked on all style button but no all types button 
//this means no screen will show all video and steps moves in one list. So the child MyDojo screen will only have lists with either (1) a type with all styles, OR (2) a type and one style    
//only when rendering moves with all styles from a type MyDojo will need to render a vertical list (for each style) and horizontal list(for each move with same style) in the manager, instead of one vertical list that will be rendered when hmoves=one type and one style. 
// A horizontal divider needed in flatList when type changes to type=='steps',
//use matrix dojo in bg, try use red/blue pills buttons (each style,allstyles) , 
// Added Move title - subtitle add,share,import moves, Edit Move title, My Dojo Move Styles, MyDojo
//Added-> share btn, import btn, plus btn, edit btn, del btn, add step btn, save move btn, info btn 
// added cool fonts, and a prieview for the video(or Thumbnail) and images in the steps, and an import/share many option.