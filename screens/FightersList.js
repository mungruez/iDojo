import { StyleSheet, Text, View, ImageBackground } from 'react-native'
import fighters from '../data/fighters'
import React from 'react'
import { useNavigation } from '@react-navigation/native'

const images = require.context('../assets/avatars', true, /\.png$/);
const imageSources = images.keys().map((key) => images(key));
const navigation = useNavigation();

function handleNavigation(item) {
  let s=0;
  fighters.forEach((f) => {
    s = s + f.moves.length;
   });
  navigation.navigate('Fighter', {fighter: item, offset: s});
}

export default function FightersList() {
  return (
    <View style={{backgroundColor: '#9a9aa1', color:"#dc143c", marginBottom:20, paddingBottom:10, opacity: .7}}>
      <ImageBackground style={ styles.icon } resizeMode='contain' source={require('../assets/fighterslisttitle.png')} /> 
      <View style={{flex:1}}>
          <FlatList
            data={fighters}
            numColumns={2}
            contentContainerStyle={{ paddingBottom: 57 }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item, index }) => (
              <View
                key={item.name}
                style={{
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexDirection: "column",
                  alignItems: "top",
                  marginTop:7,
                  marginLeft:"1",
                  marginRight:"1",
                  width:"50%",
                  height:"auto",
                  borderColor:"transparent",
                  borderWidth:0,
                  backgroundColor:'#2f4f4f'
                }}
              >
              
                <Pressable
                  onPress={() => handleNavigation(item)}>
                    <View style={styles.mainCardView}>
                        <View style={{flexDirection: 'column', alignItems: 'flex-start', marginTop:0}}>
                            <View style={styles.subCardView}>
                                <Image
                                  source={imageSources[index]}
                                  resizeMode="cover"
                                  style={{
                                    borderRadius: 12,
                                    alignSelf: 'flex-start',
                                    marginTop:0,
                                    marginLeft:0,
                                    height: 130,
                                    width: 180,
                                  }}
                                />
                            

                        <View style={{marginLeft: 12}}>
                            <Text
                              style={{
                                fontSize: 14,
                                color: "crimson",
                                fontWeight: 'bold',
                                textTransform: 'capitalize',
                              }}>
                                {item.desc}
                            </Text>
                            
                            <View
                              style={{
                                marginTop: 3,
                                borderWidth: .5,
                                borderColor:'#228b22',
                                flexDirection:'row',
                                backgroundColor:'#323232',
                                justifyContent:'space-between'
                              }}>
                                <Text
                                    style={{
                                       color: '#9a9aa1',
                                       fontSize: 12,
                                    }}>
                                    {item.style}
                                </Text>
                            </View>
                            </View>
                        </View>
                    </View>
                </View>
            </Pressable>
    </View>)}
  />

  </View> 

    </View>
  
  )
}

const styles = StyleSheet.create({
      icon: {
        height: 57,
        opacity: 1,
        textAlign: "center" 
      },
      mainCardView: {
        height: 190,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: "#2f4f4f",
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: {width: 0, height: 0},
        shadowOpacity: 1,
        shadowRadius: 5,
        elevation: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingLeft: 16,
        paddingRight: 14,
        marginTop: 1,
        marginBottom: 1,
        marginLeft: 1,
        marginRight: 5,
        borderColor: "#228b22",
        borderWidth:1,
      },
      subCardView: {
        height: 186,
        width: 180,
        marginLeft:-15,
        borderRadius: 8,
        backgroundColor: "slategray",
        borderColor: "transparent",
        color: 'crimson',
        borderWidth: 0,
        borderStyle: 'solid',
        alignSelf: 'center',
        justifyContent: 'center',
        marginRight:9,
        padding:0,
      },
})