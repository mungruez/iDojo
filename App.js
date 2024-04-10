import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import MoveListScreen from './screens/MoveListScreen'
import MoveScreen from './screens/MoveScreen';
import Resources from './screens/Resources';
import FightersList from './screens/FightersList';
import Fighter from './screens/Fighter';
import ManualsScreen from './screens/ManualsScreen';


const Stack = createNativeStackNavigator();

export default function App() {
  return (
  
    
     <NavigationContainer>
      <StatusBar style="dark" />
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home"     component={HomeScreen} options={{headerShown:false, animation: 'slide_from_left'}}/>
        <Stack.Screen name="MoveList" component={MoveListScreen} options={{headerShown:false, animation: 'slide_from_right'}}/>
        <Stack.Screen name="Move"     component={MoveScreen} options={{headerShown:false, animation: 'slide_from_bottom'}}/>
        <Stack.Screen name="Manuals" component={ManualsScreen} options={{headerShown:false, animation: 'slide_from_right'}}/>
        <Stack.Screen name="FightersList" component={FightersList} options={{headerShown:false, animation: 'slide_from_right'}}/>
        <Stack.Screen name="FighterScreen" component={Fighter} options={{headerShown:false, animation: 'slide_from_bottom'}}/>
        <Stack.Screen name="Res"     component={Resources} options={{headerShown:false, animation: 'slide_from_right'}}/>
      </Stack.Navigator>
     </NavigationContainer>
  
  );
}


