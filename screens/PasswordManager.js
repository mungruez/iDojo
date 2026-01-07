import React, { useState, useEffect } from "react";
import {  View,  Text, TextInput, TouchableOpacity,  ScrollView, StyleSheet, ImageBackground, Image, Alert, TouchableWithoutFeedback} from "react-native";
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function PasswordManager() {
    const navigation = useNavigation();
    const [website, setWebsite] = useState(""); 
    const [username, setUsername] = useState(""); 
    const [password, setPassword] = useState(""); 
    const [passwordNum, setPasswordNum] = useState(0);
    const [passwordNumTemp, setPasswordNumTemp] = useState(0);
    const [isOverlayVisible, setOverlayVisible] = useState(-1);
    const [passwords, setPasswords] = useState([]); 
    const [editing, setEditing] = useState(false);    //State for tracking if editing mode is active
    const [editIndex, setEditIndex] = useState(null); //State for tracking index of the password being edited
    ref = React.createRef();

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
        // Validate inputs
        //if (typeof str !== 'string') throw new TypeError("First argument must be a string");
        //if (!Number.isInteger(index) || index < 0 || index >= str.length) {
            //throw new RangeError("Index out of range");
        //}
        //if (typeof replacement !== 'string') throw new TypeError("Replacement must be a string");
        if(index >= str.length && replacement =='o') {
            return {ans:str, placed: str.length};
        }

        if(index >= str.length && replacement =='x') {
            return {ans: (str+"x"), placed: str.length};
        }

        // Perform replacement
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
            //console.log("x in replaceChar ANS :"+ans+" so far placed is:"+placed);
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
            //console.log("o in replaceChar ANS :"+ans+" so far placed is:"+placed);
            if(placed==index) {
                return {ans: ans, placed: index}
            }

            if(placed<0) {
                return {ans: ans, placed: ans.length};
            }    
        }
        return {ans: str, placed: -1};
    }
    

    //useEffect Hook: initializes password list when component mounts
    useEffect(() => {
        //AsyncStorage.clear();
        //TwoLetterDecStartIndex=52 primes.length: 777 encArr.length: 91
        fetchPasswords();
        showPasswords();
    }, []);


    const closeOverlay = () => {
        setOverlayVisible(-1);
    };

    const openOverlay = (passNum) => {
        setOverlayVisible(passNum);
    };

    const resetPin = async () => {
        await AsyncStorage.removeItem('xx7771xxiDojoPIN');
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
        //console.log('***Password Encryption as :'+enc);
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

        //***Duplicate Letters Decrypted Above***
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
                        //console.log('Decrypting letter:'+encpass[i]+' Prime:'+primes[primesI]+' To decLetter:'+encArr[encPrime].letter+" encPrime: "+encPrime);
                        count[i+1]++;
                        count[i]++;
                        i++;
                        break;
                    }
                }
            } 

            //console.log("Current Decrypted password :"+dec);
            if(i < count.length && count[i] == 0) {
                dec += encpass[i];
            }
        }

        //console.log('Password Decrypted as: '+dec);
        return dec+"";
    };


    // Function to save or update a password
    const savePassword = async () => {
        // Check if any of the input fields is empty
        if (!website || !username || !password) {
            alert("Please fill in all fields."); // Show alert if fields are empty
            return;
        }

        if (editing && editIndex !== null) {
            // If editing, update the existing password
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
                encryptPassword(password, passwordNum);  //Encrypt and sync password
            } catch(error) {
                alert("Unable to Save Passwords !");
            }

            setPasswordNum(passwordNumTemp);
            setPasswords(updatedPasswords); // Update the password list
            setEditing(false); // Exit editing mode
            setEditIndex(null); // Clear edit index

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
                //console.log("Updated passKey:"+passKey+" for passwordNum:"+passwordNum+" placed :"+placed+" Next passNum :"+passNum+" newpassNum :"+newPassNum);
                
            } catch(error) {
                alert("Unable to Save Passwords !"+error);
            }
            
            //Not editing, add a new password
            const newPassword = {
                website,
                username,
                password,
                passwordNum: newPassNum,
            };
            setPasswords([...passwords, newPassword]); 
            setPasswordNum(passNum); 
        }

        setWebsite(""); // Reset website input
        setUsername(""); // Reset username input
        setPassword("");
    };



    // Function to enable editing mode for a specific password
    const editPassword = (index) => {
        setEditing(true); // Enable editing mode
        setEditIndex(index); // Set the index of the password being edited
        setWebsite(passwords[index].website); // Populate website input with existing value
        setUsername(passwords[index].username); // Populate username input with existing value
        setPassword(passwords[index].password); // Populate password input with existing value
        setPasswordNumTemp(passwordNum);
        setPasswordNum(passwords[index].passwordNum);
    };



    const showConfirmDialog = () => {
        Alert.alert(
          "Confirm PIN Reset!",
          "Are you sure you want to: Reset Your PIN?",
          [
            {
              text: "CANCEL",
              onPress: () => setPasswordNumTemp(passwordNum),
              style: "cancel" // Applies 'cancel' style for iOS (places it correctly)
            },
            {
              text: "CONFIRM",
              onPress: () => resetPin()
            }
          ],
          { cancelable: false } // Prevents closing the alert by tapping outside
        );
      };



    // Function to delete a password by passwordNum name
    const deletePassword = async (passNum) => {
        let webst = "";
        for( let upPn=0; upPn < passwords.length; upPn++) {
            if(passwords[upPn].passwordNum == passNum) {
                webst = passwords[upPn].website;
            }
        }

        const updatedPasswords = passwords.filter(
            (e) => e.passwordNum !== passNum // Filter out the password with the given website
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

        setPasswords(updatedPasswords); //Update the password list
        setPasswordNum(numPasswords);
        alert("Deleted password for Website: "+webst); //Show success message
    };


    // Function to reset the password list and input fields
    const showPasswords = () => {
        setPasswords([]); // Update the password list
        setWebsite(""); // Reset website input
        setUsername(""); // Reset username input
        setPassword(""); 
        setPasswordNumTemp(passwordNum);
        setPasswordNum(passwordNum);
        setEditing(false); // Exit editing mode
        setEditIndex(null); // Clear edit index
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


    const renderPasswordList = () => {
        return passwords.map((item, index) => (
            <View style={styles.passwordItem} key={index}>
                <View style={styles.listItem}>
                    <Text style={styles.listLabel}>
                        Website:
                    </Text>
                    <Text style={styles.listValue}>
                        {item.website + " "}
                    </Text>
                </View>

                <View style={styles.listItem}>
                    <Text style={styles.listLabel}>
                        Username:
                    </Text>
                    <Text style={styles.listValue}>
                        {item.username + " "}
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

                <View style={styles.buttonsContainer}
                  onStartShouldSetResponder={(evt) => {
                    evt.persist()
                    if (this.childrenIds && this.childrenIds.length) {
                        if (this.childrenIds.includes(evt.target)) {
                            return
                        }
                        console.log("Tapped outside")
                    }
                }}>
                    <TouchableOpacity onPress={() => editPassword(index)} style={ styles.editButton }>
                        <ImageBackground style={{ flex:1, height:"auto", width:"auto" }} resizeMode='contain' source={require('../assets/editicongold.png')}/>         
                    </TouchableOpacity>

                    { isOverlayVisible===item.passwordNum ? (
        
                        <TouchableWithoutFeedback onPress={closeOverlay}>
                            
                            <View style={{flexDirection:'column', margin:0, padding:0,}}>
                                
                                    <TouchableOpacity onPress={() => deletePassword(item.passwordNum)} style={ styles.confirmButton }>
                                        <ImageBackground style={{ flex:1, height:"auto", width:"auto" }} resizeMode='contain' source={require('../assets/deletebutton.png')}/>         
                                    </TouchableOpacity>
                            
                                    <TouchableOpacity onPress={() => closeOverlay()} style={ styles.cancelButton }>
                                        <ImageBackground style={{ flex:1, height:34, width:"auto" }} resizeMode='contain' source={require('../assets/cancelbutton.png')}/>         
                                    </TouchableOpacity>
                
                            </View>
                        </TouchableWithoutFeedback>

                    ) : (
                        <TouchableOpacity onPress={() => openOverlay(item.passwordNum)} style={ styles.deleteButton }>
                            <ImageBackground style={{ flex:1, height:"auto", width:"auto" }} resizeMode='contain' source={require('../assets/deletebuttongold.png')}/>         
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        ));
    };


    const fetchPasswords = async () => {
        let errorFlag = 0;
        try {
            let passKey = await AsyncStorage.getItem('xx7771xxiDojoAESpassKey');
            if(passKey==null) {
                alert("Welcome to iDojo's Passwords Manager.  No Saved Passwords found. Enter fields and Click Add Password. Click the Blue View icon to edit and copy your stored Passwords. Click the red Trash icon to delete a Password.");
                await AsyncStorage.setItem('xx7771xxiDojoAESpassKey', 'o');
                return errorFlag;
            }
            
            if(passKey == 'o') {
                alert("Welcome to iDojo's Passwords Manager. Enter fields and Click Add Password to add a password.");
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

            if(pwds && pwds.length>0) {
                alert("Found :"+pwds.length+ "Saved Passwords! Do not delete you App Data or you will loose your passwords.");
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
                alert("Loaded "+errorFlag+" Passwords, not All. Total Passwords unkown.");
                return errorFlag;
            }

            alert("Welcome to iDojo's Passwords Manager. No Saved Passwords found. Enter fields and Click Add Password. Click the Blue View icon to edit and copy your stored Passwords. Click the red Trash icon to delete a Password.");
            try {
                await AsyncStorage.setItem('xx7771xxiDojoAESpassKey', 'o');
            } catch(error) {
                alert("Unable to Save Passwords !");
            }
            return errorFlag; 
        }
    }


    return (
      <ImageBackground style={ styles.imgBackground } resizeMode='cover' source={require('../assets/featuredbackground.jpg')}>
        <View style={{backgroundColor: 'transparent', marginBottom:7, paddingLeft:1, paddingRight:1,}}>
          <ImageBackground style={ styles.icon } resizeMode='contain' source={require('../assets/passwordsmanagertitle.png')} /> 
        </View>
        
        <View style={{ flexDirection:'row', alignItems:'left', marginBottom: 1, padding: 0,}}>
            <TouchableOpacity onPress={() => navigation.popToTop()} style={ styles.backButton }>
                <ImageBackground style={{ flex:1, height:"auto", width:"auto", }} resizeMode='contain' source={require('../assets/backicon.png')}/>         
            </TouchableOpacity> 
            <TouchableOpacity onPress={() => showConfirmDialog()} style={ styles.resetpinButton }>
                <ImageBackground style={{ flex:1, height:"auto", width:"auto", }} resizeMode='contain' source={require('../assets/resetpinbutton.png')}/>         
            </TouchableOpacity>
        </View>

        <View style={{ flexDirection:'row', alignItems:'center', marginTop: -27, padding: 0, marginLeft: 12,}}> 
            { passwords.length > 0 ? 
                ( <Image
                    resizeMode="contain"
                    style={{ flex:1, maxHeight:42, maxWidth:190, padding:0, marginBottom:0,}}
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
                    <ScrollView horizontal>
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
                    placeholder="Website"
                    value={website}
                    onChangeText={(text) => setWebsite(text)} />

                <TextInput
                    style={styles.input}
                    placeholder="Username"
                    value={username}
                    onChangeText={(text) => setUsername(text)} />

                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    secureTextEntry={false}
                    value={password}
                    onChangeText={(text) => setPassword(text)} />

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
    );
};

// Defining styles for the password manager using StyleSheet
const styles = StyleSheet.create({
    // Style for the main container
    container: {
        flex: 1, // Take up the full height of the screen
        margin: 4, // Add margin around the container
    },
    // Style for the content inside the container
    content: {
        margin: 5, // Add margin inside the content
    },
  overlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Translucent background
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection:"column",
  },
    // Style for the main heading
    heading: {
        fontSize: 17, // Large font size
        fontWeight: "medium", // Bold text
        marginBottom: 1, // Space below the heading
        color: "goldenrod",
        fontStyle:"italic", 
    },
    // Style for subheadings
    headingPart: {
        fontSize: 29, // Slightly smaller font size than the main heading
        fontWeight: "bold", // Bold text
        color: "#333", // Dark gray color 
    },
    // Style for subheadings
    subHeading: {
        fontSize: 19, // Slightly smaller font size than the main heading
        fontWeight: "bold", // Bold text
        marginBottom: 2, // Space below the subheading
        color: "#333", // Dark gray color
        //color:"red",
    },
    // Style for subheadings
    subHeadingPart: {
        fontSize: 12, // Slightly smaller font size than the main heading
        fontWeight: "bold", // Bold text
        marginBottom: 2, // Space below the subheading
        color: "goldenrod", // Dark gray color
        fontStyle: "italic",
        lineHeight: 1,
    },
    // Style for the "No Data" message
    noData: {
        fontSize: 17, // Medium font size
        fontStyle: "italic", // Italic text
        marginBottom: 19, // Space below the message
        color: "#5e5c5cff", // Light gray color
    },
    // Style for the table containing password items
    table: {
        flexDirection: "row", // Arrange items in a row
        backgroundColor: "transparent", // White background
        borderRadius: 12, // Rounded corners
        elevation: 4, // Add shadow for Android
        marginBottom: 7, // Space below the table
        shadowColor: "grey", // Shadow color for iOS
        shadowOffset: { width: 0, height: 0 }, // Shadow offset for iOS
        shadowRadius: 5, // Shadow radius for iOS
        shadowOpacity: 1, // Shadow opacity for iOS
        borderColor:"#d8aa6aff",
        borderWidth: 2.5,
    },
    // Style for each password item
    passwordItem: {
        flexDirection: "column", // Arrange items in a column
        alignItems: "center", // Center align items
        borderRightWidth: .2, // Add a bottom border
        borderRightColor: "#f5c684ff", // Light gray border color
        padding: 12, // Add padding inside the item
    },
    // Style for each list item (e.g., website, username, password)
    listItem: {
        flexDirection: "row", // Arrange items in a row
        justifyContent: "space-between", // Space out items evenly
        alignItems: "center", // Center align items vertically
        marginRight: 10, // Space to the right of the item
        marginBottom: 10, // Space below the item
    },
    // Style for the label in the list item
    listLabel: {
        fontWeight: "bold", // Bold text
        marginBottom: 5, // Space below the label
        color: "#333", // Dark gray color
        fontSize: 19, // Medium font size
    },
    // Style for the value in the list item
    listValue: {
        flex: 1, // Take up available space
        fontSize: 18, // Medium font size
        color: "#444", // Medium gray color
        paddingLeft: 10, // Space to the left of the value
    },
    // Style for the value in the list item
    passwordlistValue: {
        flex: 1, // Take up available space
        fontSize: 18, // Medium font size
        color: "#bb853aff", // Medium gray color
        paddingLeft: 10, // Space to the left of the value
    },
    // Style for the copy icon in the list item
    copyIcon: {
        marginRight: 10, // Space to the right of the icon
        paddingLeft: 10, // Space to the left of the icon
    },
    // Style for the delete button
    deleteButton: {
        backgroundColor: "transparent", // Red background
        borderRadius: 9, // Slightly rounded corners
        padding: 0, // Add padding inside the button
        marginLeft: 19, // Space to the left of the button
        borderWidth: .8, 
        borderColor: "goldenrod",
        elevation: 2,
        height: 49,
        width: 49,
    },
    confirmButton: {
        backgroundColor: "transparent", // Red background
        borderRadius: 9, // Slightly rounded corners
        padding: 0, // Add padding inside the button
        marginLeft: 12, // Space to the left of the button
        borderWidth: 0, 
        elevation: 0,
        minHeight: 48,
        minWidth: 67,
        marginTop:-16,
    },
    // Style for the delete button
    cancelButton: {
        backgroundColor: "transparent", // Red background
        borderRadius: 9, // Slightly rounded corners
        padding: 0, // Add padding inside the button
        marginLeft: 12, // Space to the left of the button
        borderWidth: 0, 
        elevation: 0,
        minHeight: 48,
        minWidth: 67,
        marginTop: -7,
        marginBottom: -22,
    },
    // Style for the edit button
    editButton: {
        backgroundColor: "transparent", // Blue background
        borderRadius: 5, // Slightly rounded corners
        padding: 0, // Add padding inside the button
        marginLeft: 1, // Space to the right of the button
        marginRight: 19,
        borderWidth: 0, // Border width
        elevation: 0,
        height: 52,
        width: 57,
    },
    // Style for the back button
    backButton: {
        backgroundColor: "transparent", // Red background
        borderRadius: 9, // Slightly rounded corners
        padding: 2, // Add padding inside the button
        marginLeft: 57, // Space to the left of the button
        borderWidth: 0, 
        elevation: 0,
        height: 61,
        width: 67,
    },
    // Style for the back button
    resetpinButton: {
        backgroundColor: "transparent", // Red background
        borderRadius: 4, // Slightly rounded corners
        padding: 0, // Add padding inside the button
        marginLeft: 40, // Space to the left of the button
        borderWidth: 0,
        elevation: 0,
        minHeight: 152,
        minWidth: 76,
        marginTop: -48,
    },
    // Style for the container holding the edit and delete buttons
    buttonsContainer: {
        flexDirection: "row", // Arrange buttons in a row
    },
    // Style for the input fields
    input: {
        borderWidth: 2, // Border width
        borderColor: "#eee", // Light gray border color
        paddingVertical: 10, // Vertical padding inside the input
        paddingHorizontal: 15, // Horizontal padding inside the input
        marginBottom: 12, // Space below the input
        fontSize: 16, // Medium font size
        borderRadius: 10, // Rounded corners
        backgroundColor: "white", // White background
        shadowColor: "grey", // Shadow color for iOS
        shadowOffset: { width: 0, height: 0 }, // Shadow offset for iOS
        shadowRadius: 10, // Shadow radius for iOS
        shadowOpacity: 1, // Shadow opacity for iOS
        elevation: 4, // Add shadow for Android
    },
    // Style for the submit button
    submitButton: {
        backgroundColor: "green", // Green background
        color: "white", // White text color
        fontWeight: "bold", // Bold text
        borderRadius: 17, // Rounded corners
        paddingVertical: 15, // Vertical padding inside the button
        paddingHorizontal: 30, // Horizontal padding inside the button
        shadowColor: "black", // Shadow color for iOS
        shadowOffset: { width: 2, height: 2 }, // Shadow offset for iOS
        shadowRadius: 15, // Shadow radius for iOS
        shadowOpacity: 1, // Shadow opacity for iOS
        elevation: 4, // Add shadow for Android
    },
    // Style for the text inside the submit button
    submitButtonText: {
        color: "#c58c3dff", // White text color
        textAlign: "center", // Center align the text
        fontSize: 18, // Medium font size
        fontWeight:"bold",
    },
    imgBackground: {
      height: "100%",
      width: "100%",
      flex: 1,
      opacity: .9, 
    },
      icon: {
        marginTop:40,
        height: 76,
        opacity: 1,
        textAlign: "center" 
      },
});