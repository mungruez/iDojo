import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import MoveListScreen from './screens/MoveListScreen'
import MoveScreen from './screens/MoveScreen';
import Chapters from './screens/Chapters';
import Resources from './screens/Resources';


const Stack = createNativeStackNavigator();

export default function App() {
  return (
  
    
     <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home"     component={HomeScreen} options={{headerShown:false, animation: 'slide_from_left'}}/>
        <Stack.Screen name="MoveList" component={MoveListScreen}/>
        <Stack.Screen name="Move"     component={MoveScreen} />
        <Stack.Screen name="Chapters" component={Chapters} options={{headerShown:false, animation: 'slide_from_right'}}/>
        <Stack.Screen name="Res"     component={Resources} options={{headerShown:false, animation: 'slide_from_right'}}/>
      </Stack.Navigator>
     </NavigationContainer>
  
  );
}


