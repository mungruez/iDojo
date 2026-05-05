import React, { useState, useEffect, useCallback } from "react";
import {  View,  Text, TextInput, TouchableOpacity,  ScrollView, StyleSheet, ImageBackground, Image, Alert, Pressable, TouchableWithoutFeedback, UIManager, findNodeHandle, Dimensions, BackHandler, StatusBar, Keyboard, Platform} from "react-native";
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function PasswordManager() {
    const [website, setWebsite] = useState(""); 
    const [username, setUsername] = useState(""); 
    const [password, setPassword] = useState(""); 
    const [passwordNum, setPasswordNum] = useState(0);
    const [passwordNumTemp, setPasswordNumTemp] = useState(0);
    const [isOverlayVisible, setOverlayVisible] = useState(-1);
    const [passwords, setPasswords] = useState([]); 
    const [editing, setEditing] = useState(false);
    const [editIndex, setEditIndex] = useState(null);
    const [isReady, setIsReady] = useState(false);
    const [bottomPadding, setBottomPadding] = useState(0);

    const insideViewRef = React.useRef(null);
    const scrollRef = React.useRef(null);

    const navigation = useNavigation();

    const encArr = [{letter: 'a', encLetter: '*'}, {letter: 'b', encLetter: '9'}, {letter: 'c', encLetter: 's'},{letter: 'd',  encLetter: '$'},{letter: 'e',  encLetter: 'G'},{letter: 'f',  encLetter: 'o'},{letter: 'g',  encLetter: '6'},
        {letter: 'h', encLetter: '#'},{letter: 'i',  encLetter: '!'},{letter: 'j',  encLetter: '7'},{letter: 'k',  encLetter: '5'},{letter: 'l',  encLetter: 'y'},{letter: 'm',  encLetter: '2'},{letter: 'n',  encLetter: '4'},
        {letter: ' ', encLetter: ','},{letter: ',',  encLetter: ':'},{letter: ';',  encLetter: '"'},{letter: ':',  encLetter: '{'},{letter: '[',  encLetter: '|'},{letter: ']',  encLetter: '('},{letter: 'o',  encLetter: '1'},
        {letter: 'p', encLetter: '%'},{letter: 'q',  encLetter: '~'},{letter: 'r',  encLetter: 'e'},{letter: 's',  encLetter: '}'},{letter: 't',  encLetter: '+'},{letter: 'u',  encLetter: ')'},{letter: 'v',  encLetter: 'k'},
        {letter: 'w', encLetter: '='},{letter: 'x',  encLetter: '?'},{letter: 'y',  encLetter: '<'},{letter: 'z',  encLetter: '>'},{letter: '0',  encLetter: 'c'},{letter: '1',  encLetter: 'd'},{letter: '2',  encLetter: '@'},
        {letter: '3', encLetter: '0'},{letter: '4',  encLetter: 'a'},{letter: '5',  encLetter: 'X'},{letter: '6',  encLetter: '.'},{letter: '7',  encLetter: 'w'},{letter: '8',  encLetter: 't'},{letter: '9',  encLetter: 'H'},
        {letter: 'A', encLetter: 'j'},{letter: 'B',  encLetter: 'f'},{letter: 'C',  encLetter: 'i'},{letter: 'D',  encLetter: '&'},{letter: 'E',  encLetter: 'Q'},{letter: 'F',  encLetter: 'r'},{letter: 'G',  encLetter: 'U'},
        {letter: 'H', encLetter: 'n'},{letter: 'I',  encLetter: '_'},{letter: 'J',  encLetter: 'p'},
        {letter: 'K', encLetter: 'bP'},{letter: 'L', encLetter: 'mX'},{letter: 'M', encLetter: 'v_'},{letter: '~', encLetter: 'z!'},{letter: '{', encLetter: 'm['},{letter: '}', encLetter: 'v]'},{letter: '`', encLetter: 'v?'},
        {letter: 'N', encLetter: 'mP'},{letter: 'O', encLetter: 'v1'},{letter: 'P', encLetter: 'z8'},{letter: 'Q', encLetter: 'b,'},{letter: 'R', encLetter: 'z<'},{letter: 'S', encLetter: 'v+'},{letter: 'T', encLetter: 'z('},{letter: '"', encLetter: 'v;'},
        {letter: 'U', encLetter: 'v)'},{letter: 'V', encLetter: 'b6'},{letter: 'W', encLetter: 'm%'},{letter: 'X', encLetter: 'z0'},{letter: 'Y', encLetter: 'v#'},{letter: 'Z', encLetter: 'bG'},{letter: '!', encLetter: 'm7'},{letter: '@', encLetter: 'bF'},
        {letter: '#', encLetter: 'vC'},{letter: '?', encLetter: 'b?'},{letter: '$', encLetter: 'm9'},{letter: '%', encLetter: 'zS'},{letter: '&', encLetter: 'vJ'},{letter: '*', encLetter: 'b2'},{letter: '(', encLetter: 'z4'},{letter: '_', encLetter: 'bD'}, 
        {letter: ')', encLetter: 'zK'},{letter: '-', encLetter: 'vN'},{letter: '+', encLetter: 'm&'},{letter: '<', encLetter: 'zY'},{letter: '>', encLetter: 'vL'},{letter: '.', encLetter: 'b%'},{letter: '=', encLetter: 'm0'},{letter: "'", encLetter: "b:"}];


    const primes = [3109, 5657, 1789, 4957, 4111, 1231, 4217, 5519, 101, 29, 1831, 2437, 4441, 43, 2647, 853, 89, 3691, 3767, 727, 5099, 3779, 83, 2659, 3697, 4397, 3251, 4483, 109, 1913, 4463, 3191, 5147, 139, 1429, 2609, 5869, 3881, 167, 2011, 179, 2663, 191, 2677, 197, 1499, 4517, 227, 907, 1487, 239, 1481, 2111, 257, 5347, 269, 971, 277, 2731, 283, 293, 307, 311, 313, 2203, 331, 337, 347, 349, 353, 359, 367, 373, 379, 383, 389, 397, 401, 409, 419, 421, 431, 433, 439, 443, 449, 457, 461, 463, 467, 479, 487, 491, 499, 503, 509, 
        521, 523, 541, 547, 557, 563, 569, 5717, 577, 587, 593, 599, 601, 607, 613, 617, 619, 631, 641, 643, 647, 653, 659, 661, 673, 677, 683, 691, 701, 709, 23, 3371, 733, 739, 743, 751, 757, 761, 769, 773, 787, 797, 809, 811, 821, 823, 827, 829, 839, 53, 857, 859, 863, 877, 881, 883, 887, 229, 911, 919, 929, 937, 941, 947, 953, 967, 271, 977, 983, 991, 997, 1009, 1013, 1019, 1021, 1031, 1033, 1039, 1049, 1051, 1061, 1063, 1069, 1087, 1091, 1093, 1097, 1103, 1109, 1117, 
        1123, 1129, 1151, 1153, 1163, 1171, 3617, 1187, 1193, 1201, 1213, 1217, 1223, 1229, 13, 1237, 1249, 1259, 1277, 1279, 1283, 1289, 1291, 1297, 1301, 1303, 1307, 1319, 1321, 1327, 1361, 1367, 1373, 1381, 1399, 1409, 1423, 1427, 149, 1433, 1439, 1447, 1451, 1453, 1459, 1471, 241, 1483, 233, 1489, 1493, 199, 1511, 1523, 1531, 1543, 1549, 1553, 1559, 1567, 1571, 1579, 1583, 1597, 1601, 1607, 1609, 1613, 1619, 1621, 1627, 1637, 1657, 1663, 1667, 1669, 1693, 1697, 
        1699, 1709, 1721, 1723, 1733, 1741, 1747, 1753, 1759, 1777, 1783, 1787, 5, 1801, 1811, 1823, 31, 1847, 1861, 1867, 1871, 1873, 1877, 1879, 1889, 1901, 1907, 223, 113, 1933, 1949, 1951, 1973, 1979, 1987, 1993, 1997, 1999, 2003, 173, 2017, 2027, 2029, 2039, 2053, 2063, 2069, 2081, 2083, 2087, 2089, 2099, 251, 2113, 2129, 2131, 2137, 2141, 2143, 2153, 2161, 2179, 317, 2207, 2213, 2221, 2237, 2239, 2243, 2251, 2267, 2269, 2273, 2281, 2287, 2293, 2297, 2309,
        2311, 2333, 2339, 2341, 2347, 2351, 2357, 2371, 2377, 2381, 2383, 2389, 2393, 2399, 2411, 2417, 2423, 37, 2441, 2447, 2459, 2467, 2473, 2477, 2503, 2521, 2531, 2539, 2543, 2549, 2551, 2557, 2579, 2591, 2593, 151, 2617, 2621, 2633, 47, 2657, 59, 181, 2671, 193, 2683, 2687, 2689, 2693, 2699, 2707, 2711, 2713, 2719, 2729, 281, 2741, 2749, 2753, 2767, 2777, 2789, 2791, 2797, 2801, 2803, 2819, 2833, 2837, 2843, 2851, 2857, 2861, 2879, 2887, 2897, 2903, 2909,
        2917, 2927, 2939, 2953, 2957, 2963, 2969, 2971, 2999, 3001, 3011, 3019, 3023, 3037, 3041, 3049, 3061, 3067, 3079, 3083, 3089, 2, 5119, 3121, 3137, 3163, 3167, 3169, 3181, 3187, 131, 3203, 3209, 3217, 3221, 3229, 103, 3253, 3257, 3259, 3271, 3299, 3301, 3307, 3313, 3319, 3323, 3329, 3331, 3343, 3347, 3359, 3361, 71, 73, 3389, 3391, 3407, 3413, 3433, 3449, 3457, 3461, 3463, 3467, 3469, 3491, 3499, 3511, 3517, 3527, 3529, 3533, 3539, 3541, 3547, 3557, 3559, 
        3571, 3581, 3583, 3593, 3607, 3613, 1181, 3623, 3631, 3637, 3643, 3659, 3671, 3673, 3677, 61, 97, 3701, 3709, 3719, 3727, 3733, 3739, 3761, 67, 3769, 79, 3793, 3797, 3803, 3821, 3823, 3833, 3847, 3851, 3853, 3863, 3877, 163, 3889, 3907, 3911, 3917, 3919, 3923, 3929, 3931, 3943, 3947, 3967, 3989, 4001, 4003, 4007, 4013, 4019, 4021, 4027, 4049, 4051, 4057, 4073, 4079, 4091, 4093, 4099, 11, 4127, 4129, 4133, 4139, 4153, 4157, 4159, 4177, 4201, 4211, 17, 
        4219, 4229, 4231, 4241, 4243, 4253, 4259, 4261, 4271, 4273, 4283, 4289, 4297, 4327, 4337, 4339, 4349, 4357, 4363, 4373, 4391, 719, 4409, 4421, 4423, 41, 4447, 4451, 4457, 127, 4481, 107, 4493, 4507, 4513, 211, 4519, 4523, 4547, 4549, 4561, 4567, 4583, 4591, 4597, 4603, 4621, 4637, 4639, 4643, 4649, 4651, 4657, 4673, 4679, 4691, 4703, 4721, 4723, 4729, 4733, 4751, 4759, 4783, 4787, 4789, 4793, 4799, 4801, 4813, 4817, 4831, 4861, 4871, 4877, 4889, 4903, 
        4909, 4919, 4931, 4933, 4937, 4943, 4951, 7, 4967, 4969, 4973, 4987, 4993, 4999, 5003, 5009, 5011, 5021, 5023, 5039, 5051, 5059, 5077, 5081, 5087, 3373, 5101, 5107, 5113, 3119, 137, 5153, 5167, 5171, 5179, 5189, 5197, 5209, 5227, 5231, 5233, 5237, 5261, 5273, 5279, 5281, 5297, 5303, 5309, 5323, 5333, 263, 5351, 5381, 5387, 5393, 5399, 5407, 5413, 5417, 5419, 5431, 5437, 5441, 5443, 5449, 5471, 5477, 5479, 5483, 5501, 5503, 5507, 19, 5521, 5527, 5531, 5557, 
        5563, 5569, 5573, 5581, 5591, 5623, 5639, 5641, 5647, 5651, 5653, 3, 5659, 5669, 5683, 5689, 5693, 5701, 5711, 571, 5737, 5741, 5743, 5749, 5779, 5783, 5791, 5801, 5807, 5813, 5821, 5827, 5839, 5843, 5849, 5851, 5857, 5861, 5867, 157, 5879, 5881, 5897, 5903, 5923, 5927];

    
    const replaceCharAt = (str, index, replacement) => {
        if(index >= str.length && replacement =='o') {
            return {ans:str, placed: str.length};
        }

        if(index >= str.length && replacement =='x') {
            return {ans: (str+"x"), placed: str.length};
        }

        let ans = "";
        let placed = -1;
        if(replacement =='x') {
            for(let i=0; i<str.length; i++) {
                if(i == index && placed<0 && str.charAt(index) == 'o') {
                    ans += "x";
                    placed = index;
                } else {
                    ans += str.charAt(i);
                }
            }
            
            if(placed==index) {
                return {ans: ans, placed: index}
            }

            if(placed < 0) {
                ans += "x";
                return {ans: ans, placed: ans.length-1};
            } 
        } else if(replacement=='o') {
            for(let i=0; i<str.length; i++) {
                if(i == index && placed<0 && str.charAt(index)=='x') {
                        ans+="o";
                        placed=index;
                } else {
                    ans+=str.charAt(i);
                }
            }   
            
            if(placed==index) {
                return {ans: ans, placed: index}
            }

            if(placed<0) {
                return {ans: ans, placed: ans.length};
            }    
        }
        return {ans: str, placed: -1};
    }
    

    useEffect(() => {
        fetchPasswords();
        showPasswords();
    }, []);


    useEffect(() => {
        const onBackPress = () => {
	        if(password || username || website || editing) {
                Alert.alert('You have an unsaved Password !','Are you sure you want to Exit?',
                  [
                    {
                        text: 'NO',
                        onPress: () => {
                          // Do nothing
                        },
                        style: 'cancel',
                    },
                    { text: 'YES', onPress: () => {navigation.popToTop()}, style:'destructive', },
                  ],
                  { cancelable: false }
                );
            } else {
		        navigation.popToTop();
            }
            return true;
        };


        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            onBackPress
        );

        return () => backHandler.remove();
    }, [password]);


    const handleGlobalTouch = (event) => {
        const insideViewNode = findNodeHandle(scrollRef.current);
        const touchedNode = event?.nativeEvent?.target;
        if (insideViewNode && touchedNode !== insideViewNode) {
          UIManager.viewIsDescendantOf(touchedNode, insideViewNode, (isAncestor) => {
            if (!isAncestor) {
              closeOverlay();
            }
          });
        }
    };


    const closeOverlay = () => {
        setOverlayVisible(-1);
    };
      
    const openOverlay = (passNum) => {
        setOverlayVisible(passNum);
    };


    const resetPin = async () => {
        await AsyncStorage.removeItem('xx7771xxiDojoPIN');
        if(isOverlayVisible > -1) {
            setOverlayVisible(-1);
        }
        navigation.popToTop();
    };

   
    

    const encryptPassword = async (pass, passNum) => {
        if(!pass || pass.length < 4) {
            return "";
        }

        let count =[];
        for(let c = 0; c < pass.length; c++) {
            count.push(0);
        }

        let enc = "";
        let primesI = passNum; 
        for(let i = 0; i < pass.length; i++) {
            for(let j = 0; j < 91; j++) {

                if( pass[i] == encArr[j].letter ) {
                    if(primesI > 775) {
                        primesI = primesI % 777;
                    }
                    let encPrime = primes[primesI++];
                    encPrime = j+encPrime;
                    encPrime = encPrime % 91;

                    enc += encArr[encPrime].encLetter;
                    count[i]++;
	                for(let k = i+1; k < pass.length; k++) {
                        if(pass[k] == pass[i]) {
                            count[k]=count[i];  
                        }
                    }
                    break;
                }
            }

            if(count[i]==0) {
                enc+=pass[i];
                primesI++;
            }
        }
        
        await AsyncStorage.setItem('xx7771xxiDojoPassword'+passwordNum, ""+enc);
        return enc;
    };



    const decryptPassword = (encpass, passNum) => {
        if(encpass.length < 1) {
            return encpass;
        }

        let count = [];
        for(let c = 0; c < encpass.length; c++) {
            count.push(0);
        }

        let dec="";
        let primesI=passNum;
        for(let i = 0; i < encpass.length; i++) {
        
            if(encpass[i] !='z' && encpass[i] !='v' && encpass[i] !='m' && encpass[i] !='b') {
                for( let j = 0; j < 52; j++ ) {
                    if(primesI > 775) {
                        primesI = primesI % 777;
                    }
                    if( encpass[i] == encArr[j].encLetter ) {
                        let encPrime = j - primes[primesI++];
                        while(encPrime < 0) {
                            encPrime+=91;
                        }
                        dec += encArr[encPrime].letter;
                        count[i]++;
                        break;
                    }
                }
                
            } else if( (encpass[i]=='z' || encpass[i]=='v' || encpass[i]=='m' || encpass[i] =='b') && i+1<encpass.length) {
                for(let j = 52; j < 91; j++) {
                    if(primesI > 775) {
                        primesI = primesI % 777;
                    }

                    if( encpass[i]+encpass[i+1] == encArr[j].encLetter ) {
                        let encPrime = j - primes[primesI++];
                         while(encPrime<0) {
                            encPrime+=91;
                        }
                        dec+=encArr[encPrime].letter;
                        count[i+1]++;
                        count[i]++;
                        i++;
                        break;
                    }
                }
            } 

            if(i < count.length && count[i] == 0) {
                dec += encpass[i];
            }
        }

        return dec+"";
    };


    const savePassword = async () => {
        if(isOverlayVisible > -1) {
            setOverlayVisible(-1);
        }

        if (!website || !username || !password) {
            alert("Please fill in all fields."); 
            return;
        }

        if (editing && editIndex !== null) {
            const updatedPasswords = [...passwords];
            updatedPasswords[editIndex] = {
                website,
                username,
                password,
                passwordNum,
            };

            try {
                await AsyncStorage.removeItem('xx7771xxiDojoPassword'+passwordNum);
                await AsyncStorage.removeItem('xx7771xxiDojoWebsite' +passwordNum);
                await AsyncStorage.removeItem('xx7771xxiDojoUsername'+passwordNum);
                await AsyncStorage.setItem('xx7771xxiDojoWebsite' +passwordNum, website);
                await AsyncStorage.setItem('xx7771xxiDojoUsername'+passwordNum, username);
                encryptPassword(password, passwordNum); 
            } catch(error) {
                alert("Unable to Save Passwords !");
            }

            setPasswordNum(passwordNumTemp);
            setPasswords(updatedPasswords); 
            setEditing(false); 
            setEditIndex(null); 

        } else {
            let passNum = passwordNum +1;
            let newPassNum = passwordNum;
            try {
                let placed=-1;
                let passKey = await AsyncStorage.getItem('xx7771xxiDojoAESpassKey');
                for(let pki=0; pki < passKey.length; pki++) {
                    
                    if(placed<0 && passKey.charAt(pki) =='o' ) {    
                        let passKeyObj = replaceCharAt(passKey, pki, 'x');
                        placed = passKeyObj.placed;
                        passKey = passKeyObj.ans;
                        
                        if(placed>=0) {
                            await AsyncStorage.setItem('xx7771xxiDojoWebsite' +placed, website);
                            await AsyncStorage.setItem('xx7771xxiDojoUsername'+placed, username);
                            encryptPassword(password, placed);
                            newPassNum = placed;
                        }

                    } else if (placed>=0 && passKey.charAt(pki) =='o' ) {
                        passNum=pki;
                        break;
                    }
                }

                if(passKey && placed<0) {
                    passKey += "x";
                    await AsyncStorage.setItem('xx7771xxiDojoWebsite' +(""+(passKey.length-1)+""), website);
                    await AsyncStorage.setItem('xx7771xxiDojoUsername'+(""+(passKey.length-1)+""), username);
                    encryptPassword(password, passKey.length-1);
                    passNum = passKey.length;
                    newPassNum = passNum-1;
                    
                } else if(passKey && placed>0) {
                    passNum = passKey.length;
                    for(let pki=0; pki < passKey.length; pki++) {
                        if(passKey.charAt(pki) =='o' ) { 
                            passNum = pki;
                            break;
                        }
                    }
                }

                await AsyncStorage.setItem('xx7771xxiDojoAESpassKey',passKey+"");
                
            } catch(error) {
                alert("Unable to Save Passwords !"+error);
            }
            
            const newPassword = {
                website,
                username,
                password,
                passwordNum: newPassNum,
            };
            setPasswords([...passwords, newPassword]); 
            setPasswordNum(passNum); 
        }

        setWebsite(""); 
        setUsername(""); 
        setPassword("");
    };

    const editPassword = (index) => {
        setEditing(true);
        setEditIndex(index); 
        setWebsite(passwords[index].website); 
        setUsername(passwords[index].username); 
        setPassword(passwords[index].password);
        setPasswordNumTemp(passwordNum);
        setPasswordNum(passwords[index].passwordNum);
        if(isOverlayVisible > -1) {
            setOverlayVisible(-1);
        }
    };


    const showConfirmDialog = () => {
        Alert.alert(
          "Confirm PIN Reset!",
          "Are you sure you want to: Reset Your PIN?",
          [
            {
              text: "CANCEL",
              onPress: () => setOverlayVisible(-1),
              style: "cancel" 
            },
            {
              text: "CONFIRM",
              onPress: () => resetPin()
            }
          ],
          { cancelable: false } 
        );
    };

    
    const showInstructions = () => {
        Alert.alert(
          "iDojo Password Manager",
          "Intructions : All passwords are encrytped before saving to the phone only the owner with the PIN/Password can decrypt them for viewing in the App. No data is collected in any way by the iDojo App.\n(1) Passwords may be any length and may contain all charcters available on a normal keyboard except slashes(/).\n(2) You may store as many Passwords as your phone memory allows. Uninstalling the App or Clearing the App Data will delete all your passwords.\n(3) Use the Reset PIN button at the top to reset your PIN/Password.\n(4) Use the gold Edit button to edit the password or view it for, copy and pasting.  No changes are required to edit a password and after editing changes cannot be undone.\n(5) Click gold Trash icon and then confirm to delete a Password.\n(6) Scroll horizontally left and right to view all your passwords.\n(7) Click the golden vault icon to Close the Password Manager. Thank you for purchasing iDojo the invisible button is intended to inovate and its location is kept secret please enjoy.",
          [
            {
              text: "OK",
              onPress: () => setPasswordNumTemp(passwordNum),
              style: "cancel" 
            }
          ],
          { cancelable: false } 
        );
    };


    const deletePassword = async (passNum) => {
        let webst = "";
        for( let upPn=0; upPn < passwords.length; upPn++) {
            if(passwords[upPn].passwordNum == passNum) {
                webst = passwords[upPn].website;
            }
        }

        const updatedPasswords = passwords.filter(
            (e) => e.passwordNum !== passNum
        );

        let numPasswords = passNum;
        try {
            let passKey = await AsyncStorage.getItem('xx7771xxiDojoAESpassKey');

            if(passKey && passNum < passKey.length) {
                await AsyncStorage.removeItem('xx7771xxiDojoPassword'+passNum);
                await AsyncStorage.removeItem('xx7771xxiDojoWebsite' +passNum);
                await AsyncStorage.removeItem('xx7771xxiDojoUsername'+passNum);
            }

            if(passNum == passKey.length-1) { 
                passKey = passKey.substring(0, passKey.length-1);
                numPasswords = passKey.length;
            } else if(passNum < passKey.length-1) {
                let passKeyObj = replaceCharAt(passKey, passNum, 'o');
                passKey = passKeyObj.ans;
                numPasswords = passKeyObj.placed;
            }

            await AsyncStorage.setItem('xx7771xxiDojoAESpassKey', passKey+"");
            for(let pkI=0; pkI < passKey.length; pkI++) {
                if(passKey.charAt(pkI) =='o' ) {
                    numPasswords = pkI;
                    break;
                }
            }
        } catch(error) {
            alert("Error Deleting the Password: "+error); 
        }

        setPasswords(updatedPasswords);
        setPasswordNum(numPasswords);
        setOverlayVisible(-1);
        setEditIndex(null);
        setEditing(false);  
        setWebsite(""); 
        setUsername(""); 
        setPassword("");
        alert("Deleted password for Website: "+webst);
    };


    const showPasswords = () => {
        setPasswords([]); 
        setWebsite(""); 
        setUsername(""); 
        setPassword(""); 
        setPasswordNumTemp(passwordNum);
        setPasswordNum(passwordNum);
        setEditing(false); 
        setEditIndex(null);
    };

    
    const maskPassword = (pass) => {
        let str = "";
        if(pass) {
          let end = pass.length;
          
          if(pass.length > 12) {
            end = 10;
          }
          
          for(let index=0; index < end; index++) {
            str+="*";
          }
        } 
        return str;
    };


    const truncText = (txt) => {
        let str = "";
        if(txt) {
          let end = txt.length;
          
          if(end > 19) {
            end = 19;
          
            for(let index=0; index < end-4; index++) {
              str+=txt[index];
            }
            str+="...";
            return str;
          }
          return txt; 
        } 
        return str;
    };


    const renderPasswordList = () => {
        return passwords.map((item, index) => (
            <View key={index}
              ref={index === isOverlayVisible ? insideViewRef : null}
              style={styles.passwordItem}>
                
                <View style={styles.listItem}>
                    <Text style={styles.listLabel}>
                        Website:
                    </Text>
                    <Text style={styles.listValue}>
                        {truncText(item.website +"")}
                    </Text>
                </View>

                <View style={styles.listItem}>
                    <Text style={styles.listLabel}>
                        Username:
                    </Text>
                    <Text style={styles.listValue}>
                        {truncText(item.username +"")}
                    </Text>
                </View>

                <View style={styles.listItem}>
                    <Text style={styles.listLabel}>
                        Password:
                    </Text>
                    <Text style={styles.passwordlistValue}>
                        {maskPassword(item.password)}
                    </Text>
                </View>

                <View style={styles.buttonsContainer}>
                    <TouchableOpacity onPress={() => editPassword(index)} style={ styles.editButton }>
                        <ImageBackground style={{ height:"100%", width:"100%" }} resizeMode='contain' source={require('../assets/editicongold.png')}/>         
                    </TouchableOpacity>

                    { isOverlayVisible === index ? (
                        <View style={{flexDirection:'column', padding: 0,}}>  
                            <TouchableOpacity onPress={() => deletePassword(item.passwordNum)} style={ styles.confirmButton }>
                                <ImageBackground style={{ height: 35, width:"100%" }} resizeMode='contain' source={require('../assets/deletebutton.png')}/>         
                            </TouchableOpacity>
                            
                            <TouchableOpacity onPress={() => closeOverlay()} style={ styles.cancelButton }>
                                <ImageBackground style={{ height:34, width:"100%" }} resizeMode='contain' source={require('../assets/cancelbutton.png')}/>         
                            </TouchableOpacity>
                        </View> ) 
                        : (
                            <TouchableOpacity onPress={() => openOverlay(index)} style={ styles.deleteButton }>
                                <ImageBackground style={{ height:"100%", width: "100%" }} resizeMode='contain' source={require('../assets/deletebuttongold.png')}/>         
                            </TouchableOpacity> )
                    }
                </View>
            </View>
        ));
    };


    const fetchPasswords = async () => {
        let errorFlag = 0;
        try {
            let passKey = await AsyncStorage.getItem('xx7771xxiDojoAESpassKey');
            if(passKey==null) {
                showInstructions();
                //alert("Welcome to iDojo's Passwords Manager.  No Saved Passwords found. Enter fields and Click Add Password. Click the Blue View icon to edit and copy your stored Passwords. Click the red Trash icon to delete a Password.");
                await AsyncStorage.setItem('xx7771xxiDojoAESpassKey', 'o');
                return errorFlag;
            }
            
            if(passKey == 'o') {
                Alert.alert("Welcome to iDojo's Passwords Manager"," Enter fields and Click Add Password to add a password.");
                return errorFlag;
            }

            let pNum = -1;
            let pwds = [];
            for(let pkI=0; pkI < passKey.length; pkI++) {
                if(passKey.charAt(pkI) =='x' ) {
                    const pd = await AsyncStorage.getItem('xx7771xxiDojoPassword'+pkI);
                    const wb = await AsyncStorage.getItem('xx7771xxiDojoWebsite' +pkI);
                    const un = await AsyncStorage.getItem('xx7771xxiDojoUsername'+pkI);

                    if(wb!==null && un!==null && pd!==null) {
                        const newPassword = {
                            website: wb,
                            username: un,
                            password: decryptPassword(pd, pkI),
                            passwordNum: pkI,
                        };
                        errorFlag++;
                        pwds.push(newPassword);
                    }
                } else if(pNum < 0 && passKey.charAt(pkI) =='o') {
                    pNum = pkI;
                }
            }

            if(pwds && pwds.length > 0) {
                if (pwds.length > 1) Alert.alert("Passwords Found", "Found : "+pwds.length+ " Passwords Saved! Do not delete you App Data or you will loose your passwords.");
                if (pwds.length < 2) Alert.alert("Password Found", "Found : "+pwds.length+ " Password Saved! Do not delete you App Data or you will loose your passwords.");
                
                setPasswords(pwds);
                pNum=pwds.length;
                for(let pkI=0; pkI < passKey.length; pkI++) {
                    if(passKey.charAt(pkI) =='o' ) {
                        pNum = pkI;
                        break;
                    }
                }
                setPasswordNum(pNum);
            }

        } catch(error) {
            if(errorFlag>1) {
                Alert.alert("Loading Error","Loaded "+errorFlag+" Passwords, not All. Total Passwords unkown.");
                return errorFlag;
            }

            Alert.alert("Welcome to iDojo's Passwords Manager"," No Saved Passwords found. Enter fields and Click Add Password. Click the Blue View icon to edit and copy your stored Passwords. Click the red Trash icon to delete a Password.");
            try {
                await AsyncStorage.setItem('xx7771xxiDojoAESpassKey', 'o');
            } catch(error) {
                Alert.alert("Save Error","Unable to Save Passwords !");
            }
            return errorFlag; 
        }
    }

    

    useEffect(() => {
        const showSub = Keyboard.addListener(
        Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
        (e) => {
            setBottomPadding(e.endCoordinates.height);
        }
        );
        const hideSub = Keyboard.addListener(
        Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
        () => {
            setBottomPadding(0);
        }
        );

        return () => {
        showSub.remove();
        hideSub.remove();
        };
    }, []);



    if(isOverlayVisible > -1) return (
      <ImageBackground style={ styles.imgBackground } imageStyle={{ opacity: 1 }} resizeMode='cover' source={require('../assets/featuredbackground.jpg')}>
        <TouchableWithoutFeedback onPress={() => setOverlayVisible(-1)}>
        <View style={{ marginBottom: 19, paddingLeft: 1, paddingRight: 1,}}>
          <ImageBackground style={ styles.icon } resizeMode='contain' source={require('../assets/passwordsmanagertitle.png')} /> 
        </View></TouchableWithoutFeedback>
        
        <View style={{ flexDirection:'row', alignItems:'left', marginBottom: 3, padding: 0,}}>
            <TouchableOpacity onPress={() => navigation.popToTop()} style={ styles.backButton }>
                <ImageBackground style={{ height:"100%", width:"100%", }} resizeMode='contain' source={require('../assets/backiconvault.png')}/>         
            </TouchableOpacity> 
            <TouchableOpacity onPress={() => showConfirmDialog()} style={ styles.resetpinButton }>
                <ImageBackground style={{ height:"100%", width:"100%", }} resizeMode='contain' source={require('../assets/resetpinbutton.png')}/>         
            </TouchableOpacity>
            <TouchableOpacity onPress={() => showInstructions()} style={ styles.infoButton }>
                <ImageBackground style={{  height:"100%", width:"100%",}} resizeMode='contain' source={require('../assets/infobtn.png')}/>         
            </TouchableOpacity>
        </View>

        <TouchableWithoutFeedback onPress={() => setOverlayVisible(-1)}>
        <View style={{ flexDirection:'row', alignItems:'center', marginTop: 4, padding: 0, marginLeft: 4,}}> 
            { passwords.length > 0 ? 
                ( <Image
                    resizeMode="contain"
                    style={{height:42, width:190}}
                    source={require('../assets/yourpwrds.png')}
                /> ) : (
            <></> )}
        </View></TouchableWithoutFeedback>
        
        <ScrollView style={styles.container}>
            <View style={styles.content}>

                {passwords.length === 0 ? (
                    <Text style={styles.noData}>
                        No Passwords To Show
                    </Text> )
                  : (
                    <ScrollView 
                      ref={scrollRef} 
                      horizontal
                      onContentSizeChange={() => setIsReady(true)}>
                        <View style={styles.table}>
                            {renderPasswordList()}
                        </View>
                    </ScrollView> )
                }

                <TouchableWithoutFeedback onPress={() => setOverlayVisible(-1)}>
                <Text style={styles.subHeading}>
                    {editing
                        ? "Edit Password"
                        : "Add a Password"}
                </Text></TouchableWithoutFeedback>
                <TextInput
                    style={styles.input}
                    placeholderTextColor="rgba(160, 128, 80, 0.6)"
                    placeholder="Enter Website"
                    value={website}
                    onFocus={() => setOverlayVisible(-1)}
                    onChangeText={(website) => setOverlayVisible(-1)} />

                <TextInput
                    style={styles.input}
                     placeholderTextColor="rgba(160, 128, 80, 0.6)"
                    placeholder="Enter Username"
                    value={username}
                    onFocus={() => setOverlayVisible(-1)}
                    onChangeText={(username) => setOverlayVisible(-1)} />

                <TextInput
                    style={styles.input}
                    placeholderTextColor="rgba(160, 128, 80, 0.6)"
                    placeholder="Enter Password"
                    secureTextEntry={false}
                    value={password}
                    onFocus={() => setOverlayVisible(-1)}
                    onChangeText={(password) => setOverlayVisible(-1)} />
                
                <TouchableOpacity
                    style={{height:95, width:"99%", alignSelf:"center",}}
                    onPress={savePassword}>
                    <ImageBackground style={{flex:1, height:"auto", width:"98.5%",}} resizeMode='contain' source={require('../assets/pwrdbackground.png')}>
                        <Image
                            resizeMode="contain"
                            style={{ flex:1, height:"auto", width:"83%", alignSelf:"center",}}
                            source={editing ? require('../assets/editpwrd.png') : require('../assets/addpwrd.png')}
                        />
                    </ImageBackground>
                </TouchableOpacity>
            </View>
        </ScrollView>
      </ImageBackground>
    )
     

    
    return ( 
      <ImageBackground style={[styles.imgBackground, { paddingBottom: bottomPadding, backgroundColor: 'silver', }]} resizeMode='cover' source={require('../assets/featuredbackground.jpg')}>
           
        <View style={{backgroundColor: 'transparent', marginBottom: 19, paddingLeft:1, paddingRight:1,}}>
          <ImageBackground style={ styles.icon } resizeMode='contain' source={require('../assets/passwordsmanagertitle.png')} /> 
        </View>
        
        <View style={{ flexDirection:'row', alignItems:'left', marginBottom: 3, padding: 0,}}>
            <TouchableOpacity onPress={() => navigation.popToTop()} style={ styles.backButton }>
                <ImageBackground style={{ height:"100%", width:"100%", }} resizeMode='contain' source={require('../assets/backiconvault.png')}/>         
            </TouchableOpacity> 
            <TouchableOpacity onPress={() => showConfirmDialog()} style={ styles.resetpinButton }>
                <ImageBackground style={{ height:"100%", width:"100%", }} resizeMode='contain' source={require('../assets/resetpinbutton.png')}/>         
            </TouchableOpacity>
            <TouchableOpacity onPress={() => showInstructions()} style={ styles.infoButton }>
                <ImageBackground style={{  height:"100%", width:"100%",}} resizeMode='contain' source={require('../assets/infobtn.png')}/>         
            </TouchableOpacity>
        </View>

        <View style={{ flexDirection:'row', alignItems:'center', marginTop: 4, padding: 0, marginLeft: 4,}}> 
            { passwords.length > 0 ? 
                ( <Image
                    resizeMode="contain"
                    style={{height:42, width:190}}
                    source={require('../assets/yourpwrds.png')}
                /> ) : (
            <></> )}
        </View>
        
        <ScrollView style={styles.container}>
            <View style={styles.content}>

                {passwords.length === 0 ? (
                    <Text style={styles.noData}>
                        No Passwords To Show
                    </Text>
                ) : (
                    <ScrollView 
                      ref={scrollRef}
                      horizontal
                      onContentSizeChange={() => setIsReady(true)}>
                        <View style={styles.table}>
                            {renderPasswordList()}
                        </View>
                    </ScrollView>
                )}
         
                <Text style={styles.subHeading}>
                    {editing
                        ? "Edit Password"
                        : "Add a Password"}
                </Text>
                <TextInput
                    style={styles.input}
                    placeholderTextColor="rgba(160, 128, 80, 0.6)"
                    placeholder="Enter Website"
                    value={website}
                    onChangeText={(website) => setWebsite(website)} />

                <TextInput
                    style={styles.input}
                     placeholderTextColor="rgba(160, 128, 80, 0.6)"
                    placeholder="Enter Username"
                    value={username}
                    onChangeText={(username) => setUsername(username)} />

                <TextInput
                    style={styles.input}
                    placeholderTextColor="rgba(160, 128, 80, 0.6)"
                    placeholder="Enter Password"
                    secureTextEntry={false}
                    value={password}
                    onChangeText={(password) => setPassword(password)} />

                <TouchableOpacity
                    style={{height:95, width:"99%", alignSelf:"center",}}
                    onPress={savePassword}>
                    <ImageBackground style={{flex:1, height:"auto", width:"98.5%",}} resizeMode='contain' source={require('../assets/pwrdbackground.png')}>
                        <Image
                            resizeMode="contain"
                            style={{ flex:1, height:"auto", width:"83%", alignSelf:"center",}}
                            source={editing ? require('../assets/editpwrd.png') : require('../assets/addpwrd.png')}
                        />
                    </ImageBackground>
                </TouchableOpacity>
            </View>
        </ScrollView>
      </ImageBackground> 
    )
};


const styles = StyleSheet.create({
    container: {
        flex: 1, 
        height: "100%",
        margin: 4, 
        marginTop: 0,
    },
    content: {
        margin: 5, 
    },
    overlay: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)', 
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection:"column",
    },
    heading: {
        fontSize: 17, 
        fontWeight: "medium", 
        marginBottom: 1, 
        color: "goldenrod",
        fontStyle:"italic", 
    },
    headingPart: {
        fontSize: 29, 
        fontWeight: "bold", 
        color: "#333", 
    },
    subHeading: {
        fontSize: 19, 
        fontWeight: "bold", 
        marginBottom: 2, 
        color: "#333", 
    },
    subHeadingPart: {
        fontSize: 12, 
        fontWeight: "bold", 
        marginBottom: 2, 
        color: "goldenrod",
        fontStyle: "italic",
        lineHeight: 1,
    },
    noData: {
        fontSize: 17,
        fontStyle: "italic",
        marginBottom: 19, 
        color: "#5e5c5cff",
    },
    table: {
        flexDirection: "row", 
        backgroundColor: "transparent", 
        borderRadius: 12, 
        elevation: 4, 
        marginBottom: 7, 
        shadowColor: "grey", 
        shadowOffset: { width: 0, height: 0 }, 
        shadowRadius: 5, 
        shadowOpacity: 1, 
        borderColor:"#d8aa6aff",
        borderWidth: 2.5,
    },
    passwordItem: {
        flexDirection: "column", 
        alignItems: "center", 
        borderRightWidth: .2, 
        borderRightColor: "#f5c684ff", 
        padding: 12, 
    },
    listItem: {
        flexDirection: "row", 
        justifyContent: "space-between",
        alignItems: "center",
        marginRight: 10, 
        marginBottom: 10,
    },
    listLabel: {
        fontWeight: "bold",
        marginBottom: 5,
        color: "#333",
        fontSize: 19,
    },
    listValue: {
        flex: 1,
        fontSize: 18,
        color: "#444",
        paddingLeft: 10,
    },
    passwordlistValue: {
        flex: 1,
        fontSize: 18,
        color: "#bb853aff",
        paddingLeft: 10, 
    },
    copyIcon: {
        marginRight: 10,
        paddingLeft: 10,
    },
    deleteButton: {
        borderRadius: 9,
        padding: 0,
        marginLeft: 29, 
        borderWidth: .8, 
        borderColor: "goldenrod",
        elevation: 1,
        height: 55,
        width: 55,
    },
    confirmButton: {
        borderRadius: 9,
        padding: 0,
        marginLeft: 17,
        borderWidth: 0, 
        elevation: 0,
        height: 38,
        width: 67,
        marginTop: -7,
    },
    cancelButton: {
        borderRadius: 9,
        padding: 0,
        marginLeft: 17,
        borderWidth: 0, 
        elevation: 0,
        height: 38,
        width: 67,
        marginTop: -7,
        marginBottom: -10,
    },
    editButton: {
        borderRadius: 5,
        padding: 0,
        marginLeft: -7,
        marginRight: 19,
        borderWidth: 0,
        elevation: 0,
        height: 57,
        width: 55,
    },
    backButton: {
        borderRadius: 9,
        padding: 0, 
        marginLeft: 43, 
        borderWidth: 0, 
        elevation: 0,
        height: 70,
        width: 61,
        marginTop: -10,
        marginRight: 5,
    },
    resetpinButton: {
        borderRadius: 4, 
        padding: 0,
        marginLeft: 10,
        borderWidth: 0,
        elevation: 0,
        height: 57,
        width: 176,
        marginTop: -7,
    },
    infoButton: {
        borderRadius: 7,
        padding: 0,
        marginLeft: 7, 
        borderWidth: 0,
        elevation: 0,
        height: 71,
        width: 41,
        marginTop: -9,
        marginRight: 40,
    },
    buttonsContainer: {
        flexDirection: "row", 
    },
    input: {
        borderWidth: 2,
        borderColor: "#8B7021",
        paddingVertical: 10,
        paddingHorizontal: 15, 
        marginBottom: 12, 
        fontSize: 16,
        borderRadius: 10, 
        backgroundColor: "white", 
        shadowColor: "grey", 
        shadowOffset: { width: 0, height: 0 }, 
        shadowRadius: 10, 
        shadowOpacity: 1, 
        elevation: 4, 
        backgroundColor: 'rgba(255, 248, 225, 0.85)', 
        color: '#80671c', 
    },
    submitButton: {
        backgroundColor: "green", 
        color: "white",
        fontWeight: "bold",
        borderRadius: 17,
        paddingVertical: 15,
        paddingHorizontal: 30,
        shadowColor: "black",
        shadowOffset: { width: 2, height: 2 },
        shadowRadius: 15,
        shadowOpacity: 1,
        elevation: 4,
    },
    submitButtonText: {
        color: "#c58c3dff",
        textAlign: "center",
        fontSize: 18, 
        fontWeight:"bold",
    },
    imgBackground: {
      height: "100%",
      width: "100%",
      flex: 1, 
    },
      icon: {
        marginTop:19,
        height: 76,
        opacity: 1,
        textAlign: "center" 
      },
});