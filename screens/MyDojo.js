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
      await shareDir.delete();
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
            <ImageBackground style={{ flex:1, height:"auto", width:"auto", }} resizeMode='contain' source={ ftype === 'steps' ? require('../assets/editmanualicon.png') : require('../assets/editmoveicon.png') }/>         
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
          <TouchableOpacity onPress={() => navigation.navigate('AddMove', { move: null, mtype: ftype, mstyle: fstyle })} style={styles.plusIcon}>
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
            <ImageBackground style={{ flex:1, height:"auto", width:"auto", }} resizeMode='contain' source={ftype === 'steps' ? require('../assets/sharemanualicon.png') : require('../assets/sharemoveicon.png') }/>         
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={styles.deleteIcon}>
            <ImageBackground style={{ flex:1, height:"auto", width:"auto", }} resizeMode='contain' source={ftype === 'steps' ? require('../assets/deletemanualicon.png') : require('../assets/deletemoveicon.png') }/>         
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSelectedIds([])} style={styles.discardIcon}>
            <ImageBackground style={{ flex:1, height:"auto", width:"auto", }} resizeMode='contain' source={require('../assets/discardicon.png') }/> 
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
  container: { flex: 1 },
  card: {flex:1, height:76, width:76, backgroundColor: 'rgba(0, 255, 65, 0.1)', borderRadius: 9, borderWidth: 1, borderColor: '#117a2c', alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, backgroundColor: 'rgba(0,0,0,0.5)' },
  title: { color: '#00FF41', fontSize: 12, flex: 1, textTransform: 'uppercase' },
  sectionContainer: { marginBottom: 25, paddingLeft: 10, backgroundColor: 'rgba(0, 255, 65, 0.1)' },
  sectionHeader: { color: '#00FF41', fontSize: 18, fontWeight: 'bold', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 },
  itemContainer: { width: width * 0.7, marginRight: 15, backgroundColor: 'rgba(0,0,0,0.8)', borderRadius: 15, borderWidth: 1, borderColor: '#333', overflow: 'hidden' },
  verticalWrapper: { width: width * 0.9, alignSelf: 'center', marginBottom: 15 },
  selectedItem: { borderColor: '#8efaa9', borderWidth: 2, backgroundColor: 'rgba(16, 212, 65, 0.6)' },
  titleBanner: { backgroundColor: 'silver', width: '90%', padding: 5, borderRadius: 5, marginTop: 3 },
  titleText: { textAlign: 'center', fontSize: 11, fontWeight: 'bold', color: '#000' },
  thumbImage: { width: '100%', height: 150, backgroundColor: '#1a1a1a' },
  pillRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 3, marginTop: 8 },
  typePill: { backgroundColor: '#323232', color: '#00FF41', fontSize: 10, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 5 },
  editIcon: { fontSize: 16 },
  batchBar: { position: 'absolute', bottom: 30, left: 20, right: 20, flexDirection: 'row', backgroundColor: '#1a1a1a', padding: 15, borderRadius: 30, alignItems: 'center', justifyContent: 'space-around', borderWidth: 1, borderColor: '#00FF41', elevation: 10 },
  batchText: { color: '#00FF41', fontWeight: 'bold' },
  batchIcon: { fontSize: 22, color: '#fff' },
  plusIcon:{height: 38, width: 38, borderRadius: 9, marginLeft:5},
  importIcon: {height: 38,width: 38,borderRadius: 9, marginLeft: 5 },
  shareIcon: {height: 38, width: 38, borderRadius: 9, backgroundColor: '#bbebbf', alignItems: 'center', justifyContent: 'center' },
  deleteIcon: {height: 38, width: 38, borderRadius: 9, backgroundColor: '#f3aaaa', alignItems: 'center', justifyContent: 'center' },
  discardIcon: {height: 38, width: 38, borderRadius: 9, backgroundColor: '#756a6a', alignItems: 'center', justifyContent: 'center' },
});