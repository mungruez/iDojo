import React, { useState } from 'react';
import { View, Text, Image,TouchableOpacity, StyleSheet, Dimensions, ScrollView, Alert, Share } from 'react-native';
import VideoPlayer from './VideoPlayer';
import TrackPlayer from './TrackPlayer';
import PdfMove from './PdfMove';
import * as Sharing from 'expo-sharing';

const { width, height } = Dimensions.get('window');

export default function SectionPlayer({ section, index, isActive, onActivate, onDeactivate}) {
  const [isFullscreen, setIsFullscreen] = useState(false); 

  const getTypeColor = () => {
    switch (section.type) {
      case 'video': return '#d41d36';
      case 'pdf': return '#1d1fb6';
      case 'audio': return '#8f0ae7';
      case 'image': return '#106e17';
      default: return '#4b4141';
    }
  };


  const getTypeIcon = () => {
    switch (section.type) {
      case 'video': return '📹';
      case 'pdf': return '📄';
      case 'audio': return '🎵';
      case 'image': return '🖼️';
      default: return '📎';
    }
  };


  const handleShareSection = async (selectedsection) => {
    if (!selectedsection) return;
    try {
      const image = selectedsection.mediaUri ? selectedsection.mediaUri : selectedsection.mediaUrl ? selectedsection.mediaUrl : "";
      if (!image || image.length === 0) {
        Alert.alert('No Media to Share', 'This section does not have a valid media URL or URI to share.');
        return;
      }

      if(selectedsection.mediaUri) {
        if (await Sharing.isAvailableAsync()) {
          if( selectedsection.type === 'audio' ) {
            await Sharing.shareAsync(image, {
              mimeType: 'audio/*',
              dialogTitle: `Share ${selectedsection.title}`,
            });
          } else if (selectedsection.type === 'pdf') {
            await Sharing.shareAsync(image, {
              mimeType: 'application/pdf',
              dialogTitle: `Share ${selectedsection.title}`,
            });
          } else if (selectedsection.type === 'image') {
            await Sharing.shareAsync(image, {
              mimeType: 'image/*',
              dialogTitle: `Share ${selectedsection.title}`,
            });
          } else {
            Alert.alert('Share Error', 'Unknown File type. Section must be an image, audio, or pdf to share. Videos can be shared using the red arrow next to the title.');
          }
        } else {
            Alert.alert('Share Error', 'Sharing is not available on this device.');
        }
      } else {
         await Share.share({ title: selectedsection.title, message: image, url: image });
      }

    } catch (e) {
      Alert.alert('Sharing Failed', 'An error occurred while trying to share the media: '+e.message);
    }
  };



  const getThumbnail = () => {
    if (section.type === 'image') {
      return section.mediaUri || section.mediaUrl;
    }
    if (section.type === 'video') {
      if (
        section.mediaUrl?.includes('youtube.com') ||
        section.mediaUrl?.includes('youtu.be')
      ) {
        const id = section.mediaUrl.match(
          /(?:youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
        )?.[1];
        return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
      }
      return section.mediaUri;
    }
    return null;
  };


  
  if (isActive) {
    return (
      <View style={[styles.activeCard, { borderColor: getTypeColor() }, isFullscreen && styles.fullscreenCard]}>
        <View style={styles.activeHeader}>
          { isFullscreen && section.type !== 'video' ? (
            <TouchableOpacity onPress={() => handleShareSection(section)} style={styles.iconBtn}>
              <Image source={section.type === 'pdf' ? require('../assets/bluesharearrow.png') : section.type === 'image' ? require('../assets/grnsharearrow.png') : require('../assets/purplesharearrow.png')} style={{ width: 35, height: 38 }} resizeMode='contain' />
            </TouchableOpacity>
            )  : ( <Text style={styles.activeSectionLabel}>Section {index + 1}: {section.type.toUpperCase()}</Text> ) 
          }
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity onPress={() => setIsFullscreen(!isFullscreen)} style={styles.iconBtn}>
              <Text style={styles.iconText}>{isFullscreen ? '⛶ Exit' : ' ⛶ '}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onDeactivate} style={styles.iconBtn}>
              <Text style={styles.iconText}> ✕</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.activeTitle}>{section.title}</Text>

        { section.type === 'video' && (
          <View style={[ styles.videoContainer, isFullscreen && { height: height * 0.83 } ]}>
            <VideoPlayer
              video={{
                title: section.title,
                desc: section.description,
                videoUrl: section.mediaUrl?.length > 7 ? section.mediaUrl : '',
                vid: section.mediaUri || section.mediaUrl,
              }}
              isActive = {isActive}
            />
          </View>
        )}

        { section.type === 'pdf' && (
          <View style={[styles.pdfContainer, isFullscreen && { height: height * 0.83 }]}>
            <PdfMove
              pdf={{
                title: section.title,
                style: 'Chapter',
                desc: section.description,
                videoUrl: section.mediaUrl,
                vid: section.mediaUri,
              }}
              isActive={isActive}
              onClosePdf={() => {onDeactivate();}} 
            />
          </View>
        )}

        { section.type === 'audio' && (
          <View style={[styles.audioContainer, isFullscreen && { height: height * 0.83 } ]}>
            <Text style={styles.audioLabel}>🎵 {section.title}</Text>
            <TrackPlayer
              track={{
                id: index + 12,
                uri: section.mediaUri || section.mediaUrl,
                ispaused: !isActive,
              }}
            />
          </View>
        )}

        { section.type === 'image' && (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: section.mediaUri || section.mediaUrl }}
              style={[ styles.inlineImage, isFullscreen && { height: height * 0.83 } ]}
              resizeMode="contain"
            />
          </View>
        )}

        { section.description && (section.type === 'image' || section.type === 'audio') && (
          <View style={styles.spDescSection}>
            <Text style={styles.spDescLabel}>Description:</Text>
              <ScrollView style={styles.spDescScroll}>
                <Text style={styles.spDescText}>{section.description}</Text>
              </ScrollView>
          </View>
        ) }

      </View>
    );
  }


  return (
    <TouchableOpacity
      style={[styles.thumbnailCard, { borderLeftColor: getTypeColor() }]}
      onPress={onActivate}
      activeOpacity={0.8}
    >
      <View style={styles.thumbnailRow}>
        
        <View style={styles.visualBox}>
          {getThumbnail() ? (
            <Image source={{ uri: getThumbnail() }} style={styles.thumbImg} />
          ) : (
            <View style={[ styles.thumbPlaceholder, { backgroundColor: getTypeColor() } ]} >
              <Text style={styles.thumbIcon}>{getTypeIcon()}</Text>
            </View>
          )}
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.sectionNum}>SECTION {index + 1}</Text>
          <Text style={styles.sectionTitle} numberOfLines={2}>{section.title}</Text>
          <View style={[styles.typeBadge, { backgroundColor: getTypeColor() }]}>
            <Text style={styles.typeText}>{section.type.toUpperCase()}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  activeCard: {
    backgroundColor: 'rgba(0,0,0,0.95)',
    marginHorizontal: 12,
    marginVertical: 8,
    borderRadius: 16,
    borderWidth: 2,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
  },
  activeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  activeSectionLabel: { color: '#87940e', fontWeight: 'bold', fontSize: 12 },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  iconText: { color: 'white', fontSize: 18 },
  activeTitle: { color: 'white', fontSize: 18, fontWeight: 'bold', padding: 12, paddingTop: 8 },
  activeDesc: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    padding: 12,
    paddingTop: 0,
    lineHeight: 20,
  },
  videoContainer: {
    height: 380,
    backgroundColor: '#7a2b2b4f',
  },
  pdfContainer: {
    height: 411,
    backgroundColor: '#1a1a2e',
  },
  audioContainer: {
    backgroundColor: 'rgba(225, 0, 255, 0.1)',
    padding: 20,
    margin: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  audioLabel: {
    color: 'white',
    fontSize: 16,
    marginBottom: 12,
    fontWeight: 'bold',
  },
  imageContainer: {
    backgroundColor: '#237c2a5d',
    alignItems: 'center',
    padding: 12,
    opacity: 1
  },
  inlineImage: {
    width: '100%',
    height: 266,
    borderRadius: 8,
  },
  fullscreenCard: {
    marginHorizontal: 0,
    height: height * 0.92,  
  },
  fullscreenText: {
    color: 'white',
    fontWeight: 'bold',
  },
  thumbnailCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    marginHorizontal: 12,
    marginVertical: 6,
    borderRadius: 12,
    borderLeftWidth: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    overflow: 'hidden',
  },
  thumbnailRow: {
    flexDirection: 'row',
    height: 133,
  },
  visualBox: {
    width: 140,
    position: 'relative',
  },
  thumbImg: {
    width: '100%',
    height: '100%',
  },
  thumbPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbIcon: {
    fontSize: 40,
    opacity: 0.4,
  },
  infoBox: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  sectionNum: {
    color: '#87940e',
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  sectionTitle: {
    color: '#1a1a2e',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  typeText: { color: 'white', fontSize: 9, fontWeight: 'bold' },
  sectionDesc: { color: '#b6b9c0', fontSize: 12, lineHeight: 16 },
  spDescSection: { backgroundColor: '#1e293b', padding: 3, borderRadius: 12, borderWidth: 1, borderColor: '#99840f' },
  spDescLabel: { color: '#8d7f30', fontSize: 12, fontWeight: 'bold', marginBottom: 1 },
  spDescScroll: { maxHeight: height * 0.09 },
  spDescText: { color: 'honeydew', fontSize: 12, lineHeight: 15, marginVertical: 1 },
});