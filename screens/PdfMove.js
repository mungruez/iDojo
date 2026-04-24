import { View, ScrollView, Text, StyleSheet, Dimensions, TouchableOpacity, Alert, StatusBar } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { useState } from 'react';

const { height, width } = Dimensions.get('window');

const PdfMove = ({ route, navigation }) => {

  if (!route?.params?.pdf) {
    return (
      <SafeAreaView style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a2e'}}>
        <StatusBar barStyle="dark-content"/>
        <Text style={{color: 'white', fontSize: 16}}>Error: No PDF data</Text>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={{marginTop: 20, padding: 10, backgroundColor: '#3b82f6', borderRadius: 5}}
        >
          <Text style={{color: 'white'}}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const { pdf } = route.params;
  const [key, setKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [useDirectLink, setUseDirectLink] = useState(false);
  const [pdfDropdownVisible, setPdfDropdownVisible] = useState(true);
  const [lastClickTime, setLastClickTime] = useState(0);
  
  const COOLDOWN_MS = 1500; 

  const canClick = () => {
    const now = Date.now();
    if (now - lastClickTime < COOLDOWN_MS) {
      return false;
    }
    setLastClickTime(now);
    return true;
  };

  const toggleViewer = () => {
    if (!canClick()) return;
    setUseDirectLink(prev => !prev);
  };

  const handleRetry = () => {
    if (!canClick()) return;
    setLoading(true);
    setKey(prev => prev + 1);
  };


  const getPdfUrl = () => {
    if (useDirectLink) {
      return pdf.videoUrl;
    }
    return pdf.vid;
  };


  const toggleViewer = () => {
    setUseDirectLink(prev => !prev);
  };


  const handleRetry = () => {
    setLoading(true);
    setKey(prev => prev + 1); 
  };
  
  
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#323232',width: '100%', height:'100%', marginTop: 12 }}>
      <StatusBar barStyle="dark-content"/>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {pdf.title}
        </Text>
        <TouchableOpacity onPress={() => setPdfDropdownVisible(!pdfDropdownVisible)} style={styles.toggleBtn}>
          <Text style={styles.toggleText}>
            {!pdfDropdownVisible ? '▼' : '▲'}
          </Text>
        </TouchableOpacity>
      </View>

      { pdfDropdownVisible && (
        <View style={styles.dropdownContainer}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Style:</Text>
            <Text style={styles.infoValue}>{pdf.style || 'Self-Defence'}</Text>
            <TouchableOpacity onPress={toggleViewer} style={[styles.toggleBadge, useDirectLink ? styles.directBadge : styles.googleBadge, Date.now() - lastClickTime < COOLDOWN_MS && {opacity: 0.5} ]}>
              <Text style={styles.toggleText}>
                {useDirectLink ? 'D' : 'G'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleRetry} style={styles.typeBadge, Date.now() - lastClickTime < COOLDOWN_MS && {opacity: 0.5}}>
              <Text style={{fontSize: 14}}>🔄</Text>
              <Text style={styles.typeText}>PDF</Text>
            </TouchableOpacity>
          </View>

          { pdf.desc && (
            <View style={styles.descSection}>
              <Text style={styles.descLabel}>Description:</Text>
              <ScrollView style={styles.descScroll}>
                <Text style={styles.descText}>{pdf.desc}</Text>
              </ScrollView>
            </View>
          )}
        </View>
      ) }

      <View style={styles.pdfContainer}>
        {loading && (
          <View style={styles.loadingOverlay}>
            <Text style={styles.loadingText}>Loading PDF...</Text>
          </View>
        )}
        <WebView 
          key={key}
          source={{ uri: getPdfUrl() }}
          style={styles.webview}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          onError={() => {
            Alert.alert("PDF Error", "Could not load PDF");
          }}
          onHttpError={() => { 
            Alert.alert("PDF Error", "Failed to load. Try D/G toggle or reload PDF");
          }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          cacheEnabled={false}
          incognito={true}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e27', 
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1d377e91',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#3b82f6',
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 18,
    backgroundColor: '#dc2626',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  toggleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerTitle: {
    flex: 1,
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginHorizontal: 10,
  },
  dropdownContainer: {
    width: '96%',
    maxHeight: height * 0.21,
    alignSelf: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 10,
    padding: 3,
    marginTop: 5,
    borderWidth: 1,
    borderColor: '#3b82f6',
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoLabel: {
    color: '#67a1e7', 
    fontSize: 12,
    fontWeight: 'bold',
    width: 50,
  },
  infoValue: {
    color: 'white',
    fontSize: 12,
    flex: 1,
  },
  typeBadge: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
  },
  typeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
  },
  descSection: {
    backgroundColor: '#1e293b',
    padding: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  descLabel: {
    color: '#60a5fa',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 1,
  },
  descScroll: {
    maxHeight: height * 0.03
  },
  descText: {
    color: 'honeydew',
    fontSize: 12,
    lineHeight: 16,
    marginVertical: 2,
  },
  pdfContainer: {
    flex: 1,
    margin: 7,
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#3b82f6',
  },
  webview: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loadingText: {
    color: '#60a5fa',
    fontSize: 16,
    fontWeight: 'bold',
  },
  toggleBadge: {
  width: 30,
  height: 30,
  borderRadius: 15,
  justifyContent: 'center',
  alignItems: 'center',
  marginRight: 8,
  borderWidth: 1,
},
directBadge: {
  backgroundColor: '#2f9b8c', 
  borderColor: '#9fb8af',
},
googleBadge: {
  backgroundColor: '#3065b9', 
  borderColor: '#b8c9ce',
},
toggleText: {
  color: 'white',
  fontSize: 11,
  fontWeight: 'bold',
},
});

export default PdfMove;