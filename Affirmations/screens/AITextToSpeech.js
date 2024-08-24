
import React, { useContext, useState, useEffect } from "react";
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, ScrollView, Image } from "react-native";
import { colors } from "../config/theme";
import { ThemeContext } from "../context/ThemeContext";
import { Audio } from 'expo-av';
import ModalDropdown from 'react-native-modal-dropdown';
import Slider from '@react-native-community/slider';
import * as DocumentPicker from 'expo-document-picker';

const CustomComboBox = ({ options, selectedValue, onSelect }) => {
  return (
    <ModalDropdown
      options={options}
      onSelect={(index, value) => onSelect(value.value)}
      renderRow={(option) => (
        <View style={styles.dropdownRow}>
          <Image source={option.icon} style={styles.dropdownIcon} />
          <Text style={styles.dropdownText}>{option.label}</Text>
        </View>
      )}
      renderButtonText={(option) => option.label}
      style={styles.dropdownButton}
      textStyle={styles.dropdownButtonText}
    />
  );
};

const AITextToSpeech = () => {
  const { theme } = useContext(ThemeContext);
  const activeColors = colors[theme.mode];

  const [text, setText] = useState("");
  const [selectedVoice, setSelectedVoice] = useState("female");
  const [vol1, setVol1] = useState(0.1);
  const [vol2, setVol2] = useState(0.05);
  const [vol3, setVol3] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [sounds, setSounds] = useState([null, null, null]);
  const [isRepeating, setIsRepeating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackStatus, setPlaybackStatus] = useState(null);
  const options = [
    { label: 'Davis', value: 'davis', icon: require('../assets/male1.png') },
    { label: 'Jane', value: 'jane', icon: require('../assets/female1.png') },
    { label: 'Tony', value: 'tony', icon: require('../assets/male2.jpg') },
    { label: 'Sara', value: 'sara', icon: require('../assets/female2.jpg') },
    { label: 'Eric', value: 'eric', icon: require('../assets/male3.jpg') },
    { label: 'Emma', value: 'emma', icon: require('../assets/female3.jpg') }
  ];

  const handleConvert = async () => {
    try {
      const response = await fetch('https://0f54-188-43-253-77.ngrok-free.app/textspeech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, voice: selectedVoice, vol1, vol2, vol3, speed }),
      });
      const data = await response.json();
      if (data.audio_url) {
        await playSound('https://0f54-188-43-253-77.ngrok-free.app/static/out.mp3');
      } else {
        console.error('Error fetching audio URL:', data.error);
      }
    } catch (error) {
      console.error('Error during text-to-speech conversion:', error);
    }
  };

  const playSound = async (url) => {
    try {
      const { sound } = await Audio.Sound.createAsync({ uri: url });
      setSounds([sound]);
      sound.setOnPlaybackStatusUpdate(status => {
        setPlaybackStatus(status);
        console.log("sefefsefsefsef", playbackStatus)
        if (status.didJustFinish) {
          setIsPlaying(false);
          if (isRepeating) {
            sound.replayAsync();
          }
        }
      });
      await sound.playAsync();
      setIsPlaying(true);
    } catch (error) {
      console.error("Error playing sound:", error);
    }
  };

  const play_audio = async () => {
    const audio_link = 'https://0f54-188-43-253-77.ngrok-free.app/static/out.mp3';
    if (!isPlaying) {
      try {
        const { sound } = await Audio.Sound.createAsync({ uri: audio_link });
        setSounds([sound]);
        sound.setOnPlaybackStatusUpdate(status => {
          setPlaybackStatus(status);
          if (status.didJustFinish) {
            setIsPlaying(false);
            if (isRepeating) {
              sound.replayAsync();
            }
          }
        });
        await sound.playAsync();
        setIsPlaying(true);
      } catch (error) {
        console.error("Error playing sound:", error);
      }
    } else {
      setIsPlaying(true);
    }
  };

  const handleVolumeChange = (index, value) => {
    if (index === 0) {
      setVol1(value);
    } else if (index === 1) {
      setVol2(value);
    } else if (index === 2) {
      setVol3(value);
    } else if (index === 3) {
      setSpeed(value);
    }
    if (sounds[index]) {
      sounds[index].setVolumeAsync(value);
    }
  };

  const handleRepeatToggle = () => {
    setIsRepeating(!isRepeating);
  };

  const handleFileUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
      });
      if (result.type === 'success') {
        const { uri } = result;
        await playSound(uri);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  useEffect(() => {
    return () => {
      sounds.forEach(sound => sound && sound.unloadAsync());
    };
  }, [sounds]);

  return (
    <ScrollView style={[styles.container, { backgroundColor: activeColors.primary }]}>
      <Text style={[styles.label, { color: activeColors.text }]}>Enter Text:</Text>
      <TextInput
        style={[
          styles.input,
          { color: activeColors.text, borderColor: activeColors.accent, height: 5 * 20 }
        ]}
        value={text}
        onChangeText={setText}
        placeholder="Type here..."
        placeholderTextColor={activeColors.secondary}
        multiline={true}
        numberOfLines={5}
      />
      <Text style={[styles.label, { color: activeColors.text }]}>Select Voice:</Text>
      <CustomComboBox
        options={options}
        selectedValue={selectedVoice}
        onSelect={setSelectedVoice}
      />
      <View style={styles.audioContainer}>

        {/* <View style={styles.sliderContainer}>
          <Text style={[styles.sliderLabel, { color: activeColors.text }]}>Background Volume: {Math.round(vol2 * 100)}</Text>
          <Slider
            style={styles.slider}
            minimumValue={-1}
            maximumValue={1}
            step={0.01}
            value={vol2}
            onValueChange={(value) => handleVolumeChange(1, value)}
          />
        </View> */}
        <View style={styles.sliderContainerWithButton}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.sliderLabel, { color: activeColors.text }]}>Background Volume: {Math.round(vol2 * 100)}</Text>
            <Slider
              style={styles.slider}
              minimumValue={-1}
              maximumValue={1}
              step={0.01}
              value={vol2}
              onValueChange={(value) => handleVolumeChange(1, value)}
            />
          </View>
          {/* <TouchableOpacity onPress={handleFileUpload} style={styles.uploadButton}>
            <Text style={styles.uploadButtonText}>Upload</Text>
          </TouchableOpacity> */}
          <TouchableOpacity onPress={handleFileUpload} style={styles.imageButton}>
            <Image source={require('../assets/upload_music.png')} style={styles.image} />
          </TouchableOpacity>
        </View>
        <View style={styles.sliderContainerWithButton}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.sliderLabel, { color: activeColors.text }]}>SFX Volume: {Math.round(vol3 * 100)}</Text>
            <Slider
              style={styles.slider}
              minimumValue={-1}
              maximumValue={1}
              step={0.01}
              value={vol3}
              onValueChange={(value) => handleVolumeChange(2, value)}
            />
          </View>
          <TouchableOpacity onPress={handleFileUpload} style={styles.imageButton}>
            <Image source={require('../assets/upload_music.png')} style={styles.image} />
          </TouchableOpacity>
        </View>



        {/* <View style={styles.sliderContainer}>
          <Text style={[styles.sliderLabel, { color: activeColors.text }]}>SFX Volume: {Math.round(vol3 * 100)}</Text>
          <Slider
            style={styles.slider}
            minimumValue={-1}
            maximumValue={1}
            step={0.01}
            value={vol3}
            onValueChange={(value) => handleVolumeChange(2, value)}
          />
        </View> */}
        <View style={styles.sliderContainer}>
          <Text style={[styles.sliderLabel, { color: activeColors.text }]}>TTS Volume: {Math.round(vol1 * 100)}</Text>
          <Slider
            style={styles.speed_slider}
            minimumValue={-1}
            maximumValue={1}
            step={0.01}
            value={vol1}
            onValueChange={(value) => handleVolumeChange(0, value)}
          />
        </View>
        <View style={styles.sliderContainer}>
          <Text style={[styles.sliderLabel, { color: activeColors.text }]}>TTS speed: {Math.round(speed)}</Text>
          <Slider
            style={styles.speed_slider}
            minimumValue={0}
            maximumValue={5}
            step={1}
            value={speed}
            onValueChange={(value) => handleVolumeChange(3, value)}
          />
        </View>
      </View>
      <Button title="Generate" onPress={handleConvert} color={activeColors.accent} />

      {playbackStatus && (
        <View style={styles.playbackContainer}>
          <Slider
            style={styles.playbackSlider}
            minimumValue={0}
            maximumValue={playbackStatus.durationMillis}
            value={playbackStatus.positionMillis}
            onSlidingComplete={async value => {
              await sounds[0]?.setPositionAsync(value);
            }}
          />
          <Text style={styles.playbackTime}>{`${formatTime(playbackStatus.positionMillis)} / ${formatTime(playbackStatus.durationMillis)}`}</Text>
        </View>
      )}
      <View style={styles.buttonRow}>
        <TouchableOpacity onPress={play_audio} style={styles.imageButton}>
          <Image source={isPlaying ? require('../assets/stop.png') : require('../assets/start.png')} style={styles.image} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleRepeatToggle} style={styles.imageButton}>
          <Image source={!isRepeating ? require('../assets/repeat.png') : require('../assets/loopoff.png')} style={styles.image} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const formatTime = millis => {
  const minutes = Math.floor(millis / 60000);
  const seconds = ((millis % 60000) / 1000).toFixed(0);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    textAlignVertical: "top",
  },
  dropdownButton: {
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    borderColor: '#ccc',
    backgroundColor: '#fff',
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#000',
  },
  dropdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width:400,
    padding: 10,
  },
  dropdownIcon: {
    width: 30,
    height: 30,
    marginRight: 20,
    borderRadius: 30,
  },
  dropdownText: {
    fontSize: 16,
  },
  audioContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  sliderContainer: {
    marginBottom: 20,
  },
  sliderContainerWithButton: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sliderLabel: {
    fontSize: 16,
    marginBottom: 10,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  speed_slider: {
    width: '86%',
    height: 40,
  },
  uploadButton: {
    backgroundColor: "#2196F3",
    padding: 5,
    borderRadius: 4,
    marginLeft: 5,
  },
  uploadButtonText: {
    color: "#fff",
    fontSize: 16,
  },

  playbackContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  playbackSlider: {
    width: '100%',
    height: 40,
  },
  playbackTime: {
    fontSize: 16,
    marginTop: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 30
  },
  imageButton: {
    padding: 10,
  },
  image: {
    width: 40,
    height: 40,
  },
});

export default AITextToSpeech;



















// import React, { useContext, useState, useEffect } from "react";
// import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, ScrollView, Image } from "react-native";
// import { colors } from "../config/theme";
// import { ThemeContext } from "../context/ThemeContext";
// import { Audio } from 'expo-av';
// import ModalDropdown from 'react-native-modal-dropdown';
// import Slider from '@react-native-community/slider';
// import * as DocumentPicker from 'expo-document-picker';

// const CustomComboBox = ({ options, selectedValue, onSelect }) => {
//   return (
//     <ModalDropdown
//       options={options}
//       onSelect={(index, value) => onSelect(value.value)}
//       renderRow={(option) => (
//         <View style={styles.dropdownRow}>
//           <Image source={option.icon} style={styles.dropdownIcon} />
//           <Text style={styles.dropdownText}>{option.label}</Text>
//         </View>
//       )}
//       renderButtonText={(option) => option.label}
//       style={styles.dropdownButton}
//       textStyle={styles.dropdownButtonText}
//     />
//   );
// };

// const AITextToSpeech = () => {
//   const { theme } = useContext(ThemeContext);
//   const activeColors = colors[theme.mode];

//   const [text, setText] = useState("");
//   const [selectedVoice, setSelectedVoice] = useState("female");
//   const [vol1, setVol1] = useState(0.1);
//   const [vol2, setVol2] = useState(0.05);
//   const [vol3, setVol3] = useState(0);
//   const [speed, setSpeed] = useState(0);
//   const [sounds, setSounds] = useState([null, null, null]);
//   const [isRepeating, setIsRepeating] = useState(false);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [playbackStatus, setPlaybackStatus] = useState(null);
//   const options = [
//     { label: 'Davis', value: 'davis', icon: require('../assets/male1.png') },
//     { label: 'Jane', value: 'jane', icon: require('../assets/female1.png') },
//     { label: 'Tony', value: 'tony', icon: require('../assets/male2.jpg') },
//     { label: 'Sara', value: 'sara', icon: require('../assets/female2.jpg') },
//     { label: 'Eric', value: 'eric', icon: require('../assets/male3.jpg') },
//     { label: 'Emma', value: 'emma', icon: require('../assets/female3.jpg') }
//   ];

//   const handleConvert = async () => {
//     try {
//       const response = await fetch('https://9bed-188-43-253-77.ngrok-free.app/textspeech', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ text, voice: selectedVoice, vol1, vol2, vol3, speed }),
//       });
//       const data = await response.json();
//       if (data.audio_url) {
//         await playSound('https://9bed-188-43-253-77.ngrok-free.app/static/out.mp3');
//       } else {
//         console.error('Error fetching audio URL:', data.error);
//       }
//     } catch (error) {
//       console.error('Error during text-to-speech conversion:', error);
//     }
//   };

//   const playSound = async (url) => {
//     try {
//       const { sound } = await Audio.Sound.createAsync({ uri: url });
//       setSounds([sound]);
//       sound.setOnPlaybackStatusUpdate(status => {
//         setPlaybackStatus(status);
//         if (status.didJustFinish) {
//           setIsPlaying(false);
//           if (isRepeating) {
//             sound.replayAsync();
//           }
//         }
//       });
//       await sound.playAsync();
//       setIsPlaying(true);
//     } catch (error) {
//       console.error("Error playing sound:", error);
//     }
//   };

//   const play_audio = async () => {
//     const audio_link = 'https://9bed-188-43-253-77.ngrok-free.app/static/out.mp3';
//     if (!isPlaying) {
//       try {
//         const { sound } = await Audio.Sound.createAsync({ uri: audio_link });
//         setSounds([sound]);
//         sound.setOnPlaybackStatusUpdate(status => {
//           setPlaybackStatus(status);
//           if (status.didJustFinish) {
//             setIsPlaying(false);
//             if (isRepeating) {
//               sound.replayAsync();
//             }
//           }
//         });
//         await sound.playAsync();
//         setIsPlaying(true);
//       } catch (error) {
//         console.error("Error playing sound:", error);
//       }
//     } else {
//       setIsPlaying(true);
//     }
//   };

//   const handleVolumeChange = (index, value) => {
//     if (index === 0) {
//       setVol1(value);
//     } else if (index === 1) {
//       setVol2(value);
//     } else if (index === 2) {
//       setVol3(value);
//     } else if (index === 3) {
//       setSpeed(value);
//     }
//     if (sounds[index]) {
//       sounds[index].setVolumeAsync(value);
//     }
//   };

//   const handleRepeatToggle = () => {
//     setIsRepeating(!isRepeating);
//   };

  // const handleFileUpload = async () => {
  //   try {
  //     const result = await DocumentPicker.getDocumentAsync({
  //       type: 'audio/*',
  //     });
  //     if (result.type === 'success') {
  //       const { uri } = result;
  //       await playSound(uri);
  //     }
  //   } catch (error) {
  //     console.error("Error uploading file:", error);
  //   }
  // };

//   useEffect(() => {
//     return () => {
//       sounds.forEach(sound => sound && sound.unloadAsync());
//     };
//   }, [sounds]);

//   return (
//     <ScrollView style={[styles.container, { backgroundColor: activeColors.primary }]}>
//       <Text style={[styles.label, { color: activeColors.text }]}>Enter Text:</Text>
//       <TextInput
//         style={[
//           styles.input,
//           { color: activeColors.text, borderColor: activeColors.accent, height: 5 * 20 }
//         ]}
//         value={text}
//         onChangeText={setText}
//         placeholder="Type here..."
//         placeholderTextColor={activeColors.secondary}
//         multiline={true}
//         numberOfLines={5}
//       />
//       <Text style={[styles.label, { color: activeColors.text }]}>Select Voice:</Text>
//       <CustomComboBox
//         options={options}
//         selectedValue={selectedVoice}
//         onSelect={setSelectedVoice}
//       />
//       <View style={styles.audioContainer}>
//         <View style={styles.sliderContainer}>
//           <Text style={[styles.sliderLabel, { color: activeColors.text }]}>Volume: {Math.round(vol1 * 100)}</Text>
//           <Slider
//             style={styles.slider}
//             minimumValue={-1}
//             maximumValue={1}
//             step={0.01}
//             value={vol1}
//             onValueChange={(value) => handleVolumeChange(0, value)}
//           />
//         </View>
        // <View style={styles.sliderContainerWithButton}>
        //   <View style={{ flex: 1 }}>
        //     <Text style={[styles.sliderLabel, { color: activeColors.text }]}>Background Volume: {Math.round(vol2 * 100)}</Text>
        //     <Slider
        //       style={styles.slider}
        //       minimumValue={-1}
        //       maximumValue={1}
        //       step={0.01}
        //       value={vol2}
        //       onValueChange={(value) => handleVolumeChange(1, value)}
        //     />
        //   </View>
        //   <TouchableOpacity onPress={handleFileUpload} style={styles.uploadButton}>
        //     <Text style={styles.uploadButtonText}>Upload</Text>
        //   </TouchableOpacity>
        // </View>
//         <View style={styles.sliderContainer}>
//           <Text style={[styles.sliderLabel, { color: activeColors.text }]}>SFX Volume: {Math.round(vol3 * 100)}</Text>
//           <Slider
//             style={styles.slider}
//             minimumValue={-1}
//             maximumValue={1}
//             step={0.01}
//             value={vol3}
//             onValueChange={(value) => handleVolumeChange(2, value)}
//           />
//         </View>
//         <View style={styles.sliderContainer}>
//           <Text style={[styles.sliderLabel, { color: activeColors.text }]}>TTS speed: {Math.round(speed)}</Text>
//           <Slider
//             style={styles.slider}
//             minimumValue={0}
//             maximumValue={5}
//             step={1}
//             value={speed}
//             onValueChange={(value) => handleVolumeChange(3, value)}
//           />
//         </View>
//       </View>
//       <Button title="Generate" onPress={handleConvert} color={activeColors.accent} />

//       {playbackStatus && (
//         <View style={styles.playbackContainer}>
//           <Slider
//             style={styles.playbackSlider}
//             minimumValue={0}
//             maximumValue={playbackStatus.durationMillis}
//             value={playbackStatus.positionMillis}
//             onValueChange={(value) => {
//               if (sounds[0]) {
//                 sounds[0].setPositionAsync(value);
//               }
//             }}
//           />
//         </View>
//       )}
//       <View style={styles.audioButtonContainer}>
//         <Button title={isPlaying ? "Pause" : "Play"} onPress={play_audio} color={activeColors.accent} />
//         <Button title="Repeat" onPress={handleRepeatToggle} color={isRepeating ? activeColors.accent : activeColors.secondary} />
//       </View>
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 16,
//   },
//   label: {
//     fontSize: 16,
//     fontWeight: "bold",
//     marginBottom: 8,
//   },
//   input: {
//     borderWidth: 1,
//     borderRadius: 8,
//     padding: 8,
//     fontSize: 16,
//     marginBottom: 16,
//   },
//   audioContainer: {
//     flexDirection: "column",
//     alignItems: "center",
//     marginVertical: 16,
//   },
//   sliderContainer: {
//     width: "100%",
//     alignItems: "center",
//     marginBottom: 16,
//   },
  // sliderContainerWithButton: {
  //   width: "100%",
  //   flexDirection: "row",
  //   alignItems: "center",
  //   marginBottom: 16,
  // },
//   sliderLabel: {
//     fontSize: 16,
//     marginBottom: 8,
//   },
//   slider: {
//     width: "100%",
//     height: 40,
//   },
  // uploadButton: {
  //   backgroundColor: "#2196F3",
  //   padding: 5,
  //   borderRadius: 4,
  //   marginLeft: 5,
  // },
  // uploadButtonText: {
  //   color: "#fff",
  //   fontSize: 16,
  // },
//   dropdownRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     padding: 10,
//   },
//   dropdownIcon: {
//     width: 30,
//     height: 30,
//     marginRight: 10,
//   },
//   dropdownText: {
//     fontSize: 16,
//   },
//   dropdownButton: {
//     borderWidth: 1,
//     borderRadius: 8,
//     padding: 8,
//     fontSize: 16,
//   },
//   dropdownButtonText: {
//     fontSize: 16,
//   },
//   playbackContainer: {
//     width: "100%",
//     alignItems: "center",
//     marginVertical: 16,
//   },
//   playbackSlider: {
//     width: "100%",
//     height: 40,
//   },
//   audioButtonContainer: {
//     flexDirection: "row",
//     justifyContent: "space-around",
//     marginVertical: 16,
//   },
// });

// export default AITextToSpeech;











// import React, { useContext, useState, useEffect } from "react";
// import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, ScrollView, Image } from "react-native";
// import { colors } from "../config/theme";
// import { ThemeContext } from "../context/ThemeContext";
// import { Audio } from 'expo-av';
// import ModalDropdown from 'react-native-modal-dropdown';
// import Slider from '@react-native-community/slider';

// const CustomComboBox = ({ options, selectedValue, onSelect }) => {
//   return (
//     <ModalDropdown
//       options={options}
//       onSelect={(index, value) => onSelect(value.value)}
//       renderRow={(option) => (
//         <View style={styles.dropdownRow}>
//           <Image source={option.icon} style={styles.dropdownIcon} />
//           <Text style={styles.dropdownText}>{option.label}</Text>
//         </View>
//       )}
//       renderButtonText={(option) => option.label}
//       style={styles.dropdownButton}
//       textStyle={styles.dropdownButtonText}
//     />
//   );
// };

// const AITextToSpeech = () => {
//   const { theme } = useContext(ThemeContext);
//   const activeColors = colors[theme.mode];

//   const [text, setText] = useState("");
//   const [selectedVoice, setSelectedVoice] = useState("female");
//   const [vol1, setVol1] = useState(0.1);
//   const [vol2, setVol2] = useState(0.05);
//   const [vol3, setVol3] = useState(0);
//   const [speed, setSpeed] = useState(0);
//   const [sounds, setSounds] = useState([null, null, null]);
//   const [isRepeating, setIsRepeating] = useState(false);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [playbackStatus, setPlaybackStatus] = useState(null);
//   const options = [
//     { label: 'Davis', value: 'davis', icon: require('../assets/male1.png') },
//     { label: 'Jane', value: 'jane', icon: require('../assets/female1.png') },
//     { label: 'Tony', value: 'tony', icon: require('../assets/male2.jpg') },
//     { label: 'Sara', value: 'sara', icon: require('../assets/female2.jpg') },
//     { label: 'Eric', value: 'eric', icon: require('../assets/male3.jpg') },
//     { label: 'Emma', value: 'emma', icon: require('../assets/female3.jpg') }
//   ];

//   const handleConvert = async () => {
//     try {
//       const response = await fetch('https://9bed-188-43-253-77.ngrok-free.app/textspeech', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ text, voice: selectedVoice, vol1, vol2, vol3, speed }),
//       });
//       const data = await response.json();
//       if (data.audio_url) {
//         await playSound('https://9bed-188-43-253-77.ngrok-free.app/static/out.mp3');
//       } else {
//         console.error('Error fetching audio URL:', data.error);
//       }
//     } catch (error) {
//       console.error('Error during text-to-speech conversion:', error);
//     }
//   };

//   const playSound = async (url) => {
//     try {
//       const { sound } = await Audio.Sound.createAsync({ uri: url });
//       setSounds([sound]);
//       sound.setOnPlaybackStatusUpdate(status => {
//         setPlaybackStatus(status);
//         if (status.didJustFinish) {
//           setIsPlaying(false);
//           if (isRepeating) {
//             sound.replayAsync();
//           }
//         }
//       });
//       await sound.playAsync();
//       setIsPlaying(true);
//     } catch (error) {
//       console.error("Error playing sound:", error);
//     }
//   };

//   const play_audio = async () => {
//     const audio_link = 'https://9bed-188-43-253-77.ngrok-free.app/static/out.mp3';
//     if (!isPlaying) {
//       try {
//         const { sound } = await Audio.Sound.createAsync({ uri: audio_link });
//         setSounds([sound]);
//         sound.setOnPlaybackStatusUpdate(status => {
//           setPlaybackStatus(status);
//           if (status.didJustFinish) {
//             setIsPlaying(false);
//             if (isRepeating) {
//               sound.replayAsync();
//             }
//           }
//         });
//         await sound.playAsync();
//         setIsPlaying(true);
//       } catch (error) {
//         console.error("Error playing sound:", error);
//       }
//     } else {
//       setIsPlaying(true);
//     }
//   };

//   const handleVolumeChange = (index, value) => {
//     if (index === 0) {
//       setVol1(value);
//     } else if (index === 1) {
//       setVol2(value);
//     } else if (index === 2) {
//       setVol3(value);
//     } else if (index === 3) {
//       setSpeed(value);
//     }
//     if (sounds[index]) {
//       sounds[index].setVolumeAsync(value);
//     }
//   };

//   const handleRepeatToggle = () => {
//     setIsRepeating(!isRepeating);
//   };

//   useEffect(() => {
//     return () => {
//       sounds.forEach(sound => sound && sound.unloadAsync());
//     };
//   }, [sounds]);

//   return (
//     <ScrollView style={[styles.container, { backgroundColor: activeColors.primary }]}>
//       <Text style={[styles.label, { color: activeColors.text }]}>Enter Text:</Text>
//       <TextInput
//         style={[
//           styles.input,
//           { color: activeColors.text, borderColor: activeColors.accent, height: 5 * 20 }
//         ]}
//         value={text}
//         onChangeText={setText}
//         placeholder="Type here..."
//         placeholderTextColor={activeColors.secondary}
//         multiline={true}
//         numberOfLines={5}
//       />
//       <Text style={[styles.label, { color: activeColors.text }]}>Select Voice:</Text>
//       <CustomComboBox
//         options={options}
//         selectedValue={selectedVoice}
//         onSelect={setSelectedVoice}
//       />
//       <View style={styles.audioContainer}>
//         <View style={styles.sliderContainer}>
//           <Text style={[styles.sliderLabel, { color: activeColors.text }]}>Volume: {Math.round(vol1 * 100)}</Text>
//           <Slider
//             style={styles.slider}
//             minimumValue={-1}
//             maximumValue={1}
//             step={0.01}
//             value={vol1}
//             onValueChange={(value) => handleVolumeChange(0, value)}
//           />
//         </View>
//         <View style={styles.sliderContainer}>
//           <Text style={[styles.sliderLabel, { color: activeColors.text }]}>Background Volume: {Math.round(vol2 * 100)}</Text>
//           <Slider
//             style={styles.slider}
//             minimumValue={-1}
//             maximumValue={1}
//             step={0.01}
//             value={vol2}
//             onValueChange={(value) => handleVolumeChange(1, value)}
//           />
//         </View>
//         <View style={styles.sliderContainer}>
//           <Text style={[styles.sliderLabel, { color: activeColors.text }]}>SFX Volume: {Math.round(vol3 * 100)}</Text>
//           <Slider
//             style={styles.slider}
//             minimumValue={-1}
//             maximumValue={1}
//             step={0.01}
//             value={vol3}
//             onValueChange={(value) => handleVolumeChange(2, value)}
//           />
//         </View>
//         <View style={styles.sliderContainer}>
//           <Text style={[styles.sliderLabel, { color: activeColors.text }]}>TTS speed: {Math.round(speed)}</Text>
//           <Slider
//             style={styles.slider}
//             minimumValue={0}
//             maximumValue={5}
//             step={1}
//             value={speed}
//             onValueChange={(value) => handleVolumeChange(3, value)}
//           />
//         </View>
//       </View>
//       <Button title="Generate" onPress={handleConvert} color={activeColors.accent} />

//       {playbackStatus && (
//         <View style={styles.playbackContainer}>
//           <Slider
//             style={styles.playbackSlider}
//             minimumValue={0}
//             maximumValue={playbackStatus.durationMillis}
//             value={playbackStatus.positionMillis}
//             onSlidingComplete={async value => {
//               await sounds[0]?.setPositionAsync(value);
//             }}
//           />
//           <Text style={styles.playbackTime}>{`${formatTime(playbackStatus.positionMillis)} / ${formatTime(playbackStatus.durationMillis)}`}</Text>
//         </View>
//       )}
//       <View style={styles.buttonRow}>
//         <TouchableOpacity onPress={play_audio} style={styles.imageButton}>
//           <Image source={isPlaying ? require('../assets/stop.png') : require('../assets/start.png')} style={styles.image} />
//         </TouchableOpacity>
//         <TouchableOpacity onPress={handleRepeatToggle} style={styles.imageButton}>
//           <Image source={!isRepeating ? require('../assets/repeat.png') : require('../assets/loopoff.png')} style={styles.image} />
//         </TouchableOpacity>
//       </View>
//     </ScrollView>
//   );
// };

// const formatTime = millis => {
//   const minutes = Math.floor(millis / 60000);
//   const seconds = ((millis % 60000) / 1000).toFixed(0);
//   return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//   },
//   label: {
//     fontSize: 16,
//     marginBottom: 10,
//   },
//   input: {
//     borderWidth: 1,
//     borderRadius: 5,
//     padding: 10,
//     marginBottom: 20,
//     textAlignVertical: "top",
//   },
//   dropdownButton: {
//     borderWidth: 1,
//     borderRadius: 5,
//     padding: 10,
//     borderColor: '#ccc',
//     backgroundColor: '#fff',
//   },
//   dropdownButtonText: {
//     fontSize: 16,
//     color: '#000',
//   },
//   dropdownRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     width:400,
//     padding: 10,
//   },
//   dropdownIcon: {
//     width: 30,
//     height: 30,
//     marginRight: 20,
//     borderRadius: 30,
//   },
//   dropdownText: {
//     fontSize: 16,
//   },
//   audioContainer: {
//     marginTop: 20,
//     marginBottom: 20,
//   },
//   sliderContainer: {
//     marginBottom: 20,
//   },
//   sliderLabel: {
//     fontSize: 16,
//     marginBottom: 10,
//   },
//   slider: {
//     width: '100%',
//     height: 40,
//   },
//   playbackContainer: {
//     marginTop: 20,
//     alignItems: 'center',
//   },
//   playbackSlider: {
//     width: '100%',
//     height: 40,
//   },
//   playbackTime: {
//     fontSize: 16,
//     marginTop: 10,
//   },
//   buttonRow: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     marginTop: 20,
//   },
//   imageButton: {
//     padding: 10,
//   },
//   image: {
//     width: 40,
//     height: 40,
//   },
// });

// export default AITextToSpeech;






// import React, { useContext, useState, useEffect } from "react";
// import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, ScrollView, Image } from "react-native";
// import { colors } from "../config/theme";
// import { ThemeContext } from "../context/ThemeContext";
// import { Audio } from 'expo-av';
// import ComboBox from 'react-native-combobox';
// import Slider from '@react-native-community/slider';

// const AITextToSpeech = () => {
//   const { theme } = useContext(ThemeContext);
//   const activeColors = colors[theme.mode];

//   const [text, setText] = useState("");
//   const [selectedVoice, setSelectedVoice] = useState("female");
//   const [vol1, setVol1] = useState(0.1);
//   const [vol2, setVol2] = useState(0.05);
//   const [vol3, setVol3] = useState(0);
//   const [speed, setSpeed] = useState(0);
//   const [sounds, setSounds] = useState([null, null, null]);
//   const [isRepeating, setIsRepeating] = useState(false);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [playbackStatus, setPlaybackStatus] = useState(null);
//   const values = ['male', 'female'];

//   const handleConvert = async () => {
//     try {
//       const response = await fetch('https://30da-188-43-253-77.ngrok-free.app/textspeech', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ text, voice: selectedVoice, vol1, vol2, vol3, speed }),
//       });
//       const data = await response.json();
//       if (data.audio_url) {
//         // await playSound(data.audio_url);
//         await playSound('https://30da-188-43-253-77.ngrok-free.app/static/out.mp3');
//       } else {
//         console.error('Error fetching audio URL:', data.error);
//       }
//     } catch (error) {
//       console.error('Error during text-to-speech conversion:', error);
//     }
//   };

//   const playSound = async (url) => {
//     try {
//       const { sound } = await Audio.Sound.createAsync({ uri: url });
//       setSounds([sound]);
//       sound.setOnPlaybackStatusUpdate(status => {
//         setPlaybackStatus(status);
//         if (status.didJustFinish) {
//           setIsPlaying(false);
//           if (isRepeating) {
//             sound.replayAsync();
//           }
//         }
//       });
//       await sound.playAsync();
//       setIsPlaying(true);
//     } catch (error) {
//       console.error("Error playing sound:", error);
//     }
//   };

//   // const play_audio = () => {
//   //   if (isPlaying) {
//   //     sounds[0]?.pauseAsync();
//   //     setIsPlaying(false);
//   //   } else {
//   //     sounds[0]?.playAsync();
//   //     setIsPlaying(true);
//   //   }
//   // };
//   const play_audio = async () => {
//     const aduio_link = 'https://30da-188-43-253-77.ngrok-free.app/static/out.mp3'
//     if (!isPlaying) {
//       try {
//         const { sound } = await Audio.Sound.createAsync({ uri: aduio_link });
//         setSounds([sound]);
//         sound.setOnPlaybackStatusUpdate(status => {
//           setPlaybackStatus(status);
//           if (status.didJustFinish) {
//             setIsPlaying(false);
//             if (isRepeating) {
//               sound.replayAsync();
//             }
//           }
//         });
//         await sound.playAsync();
//         setIsPlaying(true);
//       } catch (error) {
//         console.error("Error playing sound:", error);
//       }

//     } else {
//       // sounds[0]?.playAsync();
//       setIsPlaying(true);
//     }
//   };

//   const handleVolumeChange = (index, value) => {
//     if (index === 0) {
//       setVol1(value);
//     } else if (index === 1) {
//       setVol2(value);
//     } else if (index === 2) {
//       setVol3(value);
//     }
//     else if (index === 3) {
//       setSpeed(value);
//     }
//     if (sounds[index]) {
//       sounds[index].setVolumeAsync(value);
//     }
//   };

//   const handleRepeatToggle = () => {
//     setIsRepeating(!isRepeating);
//   };

//   useEffect(() => {
//     return () => {
//       sounds.forEach(sound => sound && sound.unloadAsync());
//     };
//   }, [sounds]);

//   return (
//     <ScrollView style={[styles.container, { backgroundColor: activeColors.primary }]}>
//       <Text style={[styles.label, { color: activeColors.text }]}>Enter Text:</Text>
//       <TextInput
//         style={[
//           styles.input,
//           { color: activeColors.text, borderColor: activeColors.accent, height: 5 * 20 }
//         ]}
//         value={text}
//         onChangeText={setText}
//         placeholder="Type here..."
//         placeholderTextColor={activeColors.secondary}
//         multiline={true}
//         numberOfLines={5}
//       />
//       <Text style={[styles.label, { color: activeColors.text }]}>Select Voice:</Text>
//       <View style={styles.comboBoxContainer}>
//         <ComboBox
//           values={values}
//           selectedValue={selectedVoice}
//           onValueSelect={setSelectedVoice}
//         />
//       </View>
//       <View style={styles.audioContainer}>
//         <View style={styles.sliderContainer}>
//           <Text style={[styles.sliderLabel, { color: activeColors.text }]}>Volume: {Math.round(vol1 * 100)}</Text>
//           <Slider
//             style={styles.slider}
//             minimumValue={-1}
//             maximumValue={1}
//             step={0.01}
//             value={vol1}
//             onValueChange={(value) => handleVolumeChange(0, value)}
//           />
//         </View>
//         <View style={styles.sliderContainer}>
//           <Text style={[styles.sliderLabel, { color: activeColors.text }]}>Background Volume: {Math.round(vol2 * 100)}</Text>
//           <Slider
//             style={styles.slider}
//             minimumValue={-1}
//             maximumValue={1}
//             step={0.01}
//             value={vol2}
//             onValueChange={(value) => handleVolumeChange(1, value)}
//           />
//         </View>
//         <View style={styles.sliderContainer}>
//           <Text style={[styles.sliderLabel, { color: activeColors.text }]}>SFX Volume: {Math.round(vol3 * 100)}</Text>
//           <Slider
//             style={styles.slider}
//             minimumValue={-1}
//             maximumValue={1}
//             step={0.01}
//             value={vol3}
//             onValueChange={(value) => handleVolumeChange(2, value)}
//           />
//         </View>
//         <View style={styles.sliderContainer}>
//           <Text style={[styles.sliderLabel, { color: activeColors.text }]}>TTS speed: {Math.round(speed)}</Text>
//           <Slider
//             style={styles.slider}
//             minimumValue={0}
//             maximumValue={5}
//             step={1}
//             value={speed}
//             onValueChange={(value) => handleVolumeChange(3, value)}
//           />
//         </View>
//       </View>
//       <Button title="Generate" onPress={handleConvert} color={activeColors.accent} />



//       {playbackStatus && (
//         <View style={styles.playbackContainer}>
//           <Slider
//             style={styles.playbackSlider}
//             minimumValue={0}
//             maximumValue={playbackStatus.durationMillis}
//             value={playbackStatus.positionMillis}
//             onSlidingComplete={async value => {
//               await sounds[0]?.setPositionAsync(value);
//             }}
//           />
//           <Text style={styles.playbackTime}>{`${formatTime(playbackStatus.positionMillis)} / ${formatTime(playbackStatus.durationMillis)}`}</Text>
//         </View>
//       )}
//       <View style={styles.buttonRow}>
//         <TouchableOpacity onPress={play_audio} style={styles.imageButton}>
//           <Image source={isPlaying ? require('../assets/stop.png') : require('../assets/start.png')} style={styles.image} />
//         </TouchableOpacity>
//         <TouchableOpacity onPress={handleRepeatToggle} style={styles.imageButton}>
//           <Image source={ !isRepeating ? require('../assets/repeat.png'): require('../assets/loopoff.png')} style={styles.image} />
//         </TouchableOpacity>
//       </View>
//     </ScrollView>
//   );
// };

// const formatTime = millis => {
//   const minutes = Math.floor(millis / 60000);
//   const seconds = ((millis % 60000) / 1000).toFixed(0);
//   return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//   },
//   label: {
//     fontSize: 18,
//     marginBottom: 10,
//   },
//   input: {
//     borderWidth: 1,
//     marginBottom: 10,
//     paddingHorizontal: 10,
//   },
//   comboBoxContainer: {
//     marginBottom: 20,
//   },
//   sliderContainer: {
//     marginVertical: 10,
//   },
  
//   imageButton: {
//     marginTop: 20,
//     alignItems: 'center',
//     borderRadius: 5,
//   },
//   image: {
//     width: 50,
//     height: 50,
//   },
//   buttonRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginVertical: 20,
//     marginHorizontal: 80,
//     marginBottom: 50,
//   },
//   slider: {
//     width: '100%',
//     height: 40,
//   },
//   sliderLabel: {
//     fontSize: 16,
//     marginBottom: 5,
//   },
//   audioContainer: {
//     marginBottom: 30,
//   },
//   playbackContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginVertical: 20,
//   },
//   playbackSlider: {
//     width: '80%',
//     height: 40,
//   },
//   playbackTime: {
//     fontSize: 16,
//   },
// });

// export default AITextToSpeech;






// import React, { useContext, useState, useEffect } from "react";
// import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, ScrollView, Image  } from "react-native";
// import { colors } from "../config/theme";
// import { ThemeContext } from "../context/ThemeContext";
// import { Audio } from 'expo-av';
// import ComboBox from 'react-native-combobox';
// import Slider from '@react-native-community/slider';
// import MusicPlayer from "./MusicPlayer";

// const AITextToSpeech = () => {
//   const { theme } = useContext(ThemeContext);
//   const activeColors = colors[theme.mode];

//   const [text, setText] = useState("");
//   const [selectedVoice, setSelectedVoice] = useState("female");
//   const [vol1, setVol1] = useState(0.1);
//   const [vol2, setVol2] = useState(0.05);
//   const [vol3, setVol3] = useState(0);
//   const [sounds, setSounds] = useState([null, null, null]);
//   const [isRepeating, setIsRepeating] = useState(false);

//   const values = ['male', 'female'];

//   const handleConvert = async () => {
//     try {
//       const response = await fetch('https://33d2-188-43-253-77.ngrok-free.app/textspeech', { // Replace with your public URL
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ text, voice: selectedVoice, vol1, vol2, vol3 }),
//       });
//       const data = await response.json();
//       if (data.audio_url) {
//         // await playSound(data.audio_url);
//         await playSound("https://33d2-188-43-253-77.ngrok-free.app/static/out.mp3");
//       } else {
//         console.error('Error fetching audio URL:', data.error);
//       }
//     } catch (error) {
//       console.error('Error during text-to-speech conversion:', error);
//     }
//   };

//   const playSound = async (url) => {
//     try {
//       const out_url = "https://33d2-188-43-253-77.ngrok-free.app/static/out.mp3"
//       // const { sound } = await Audio.Sound.createAsync({ uri: url });
//       const { sound } = await Audio.Sound.createAsync({ uri: out_url });
//       setSounds([sound]);
//       sound.setOnPlaybackStatusUpdate(status => {
//         if (isRepeating && status.didJustFinish) {
//           sound.playAsync();
//         }
//       });
//       await sound.playAsync();
//     } catch (error) {
//       console.error("Error playing sound:", error);
//     }
//   };

//   const handleVolumeChange = (index, value) => {
//     if (index === 0) {
//       setVol1(value);
//     } else if (index === 1) {
//       setVol2(value);
//     } else if (index === 2) {
//       setVol3(value);
//     }
//     if (sounds[index]) {
//       sounds[index].setVolumeAsync(value);
//     }
//   };

//   const handleRepeatToggle = () => {
//     setIsRepeating(!isRepeating);
//     sounds.forEach(sound => {
//       if (sound) {
//         sound.setOnPlaybackStatusUpdate(status => {
//           if (isRepeating && status.didJustFinish) {
//             sound.playAsync();
//           }
//         });
//       }
//     });
//   };

//   useEffect(() => {
//     return () => {
//       sounds.forEach(sound => sound && sound.unloadAsync());
//     };
//   }, [sounds]);

//   return (
//     <ScrollView style={[styles.container, { backgroundColor: activeColors.primary }]}>
//       <Text style={[styles.label, { color: activeColors.text }]}>Enter Text:</Text>
//       <TextInput
//         style={[
//           styles.input,
//           { color: activeColors.text, borderColor: activeColors.accent, height: 5 * 20 }
//         ]}
//         value={text}
//         onChangeText={setText}
//         placeholder="Type here..."
//         placeholderTextColor={activeColors.secondary}
//         multiline={true}
//         numberOfLines={5}
//       />
//       <Text style={[styles.label, { color: activeColors.text }]}>Select Voice:</Text>
//       <View style={styles.comboBoxContainer}>
//         <ComboBox
//           values={values}
//           selectedValue={selectedVoice}
//           onValueSelect={setSelectedVoice}
//         />
//       </View>
//       <View style={styles.audioContainer}>
//         <View style={styles.sliderContainer}>
//           <Text style={[styles.sliderLabel, { color: activeColors.text }]}>Volume: {Math.round(vol1 * 100)}</Text>
//           <Slider
//             style={styles.slider}
//             minimumValue={-1}
//             maximumValue={1}
//             step={0.01}
//             value={vol1}
//             onValueChange={(value) => handleVolumeChange(0, value)}
//           />
//         </View>
//         <View style={styles.sliderContainer}>
//           <Text style={[styles.sliderLabel, { color: activeColors.text }]}>Background Volume: {Math.round(vol2 * 100)}</Text>
//           <Slider
//             style={styles.slider}
//             minimumValue={-1}
//             maximumValue={1}
//             step={0.01}
//             value={vol2}
//             onValueChange={(value) => handleVolumeChange(1, value)}
//           />
//         </View>
//         <View style={styles.sliderContainer}>
//           <Text style={[styles.sliderLabel, { color: activeColors.text }]}>SFX Volume: {Math.round(vol3 * 100)}</Text>
//           <Slider
//             style={styles.slider}
//             minimumValue={-1}
//             maximumValue={1}
//             step={0.01}
//             value={vol3}
//             onValueChange={(value) => handleVolumeChange(2, value)}
//           />
//         </View>
//       </View>

//       <Button title="Generate" onPress={handleConvert} color={activeColors.accent} />

//       {/* <TouchableOpacity onPress={handleRepeatToggle} style={[styles.repeatButton, { backgroundColor: activeColors.accent }]}>
//         <Text style={[styles.repeatButtonText, { color: activeColors.text }]}>
//           {isRepeating ? "Stop Repeating" : "Repeat Audio"}
//         </Text>
//       </TouchableOpacity> */}
//       {/* <TouchableOpacity onPress={handleConvert} style={styles.imageButton}>
//         <Image source={require('../assets/play.png')} style={styles.image} />
//       </TouchableOpacity> */}
//       <View style={styles.buttonRow}>
//         <TouchableOpacity  style={styles.imageButton}>
//           <Image source={require('../assets/repeat.png')} style={styles.image} />
//         </TouchableOpacity>
//         <TouchableOpacity onPress={handleConvert} style={styles.imageButton}>
//           <Image source={require('../assets/stop.png')} style={styles.image} />
//         </TouchableOpacity>
//         <TouchableOpacity  style={styles.imageButton}>
//           <Image source={require('../assets/download1.png')} style={styles.downloadimage} />
//         </TouchableOpacity>
//       </View>
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//   },
//   label: {
//     fontSize: 18,
//     marginBottom: 10,
//   },
//   input: {
//     borderWidth: 1,
//     marginBottom: 10,
//     paddingHorizontal: 10,
//   },
//   comboBoxContainer: {
//     marginBottom: 20,
//   },
//   sliderContainer: {
//     marginVertical: 10,
//   },
//   imageButton: {
//     marginTop: 20,
//     alignItems: 'center',
//     borderRadius: 5,
//   },
//   image: {
//     width: 50,
//     height: 50,
//   },
//   downloadimage: {
//     width: 40,
//     height: 40,
//   },
//   buttonRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginVertical: 20,
//     marginHorizontal: 80,
//     marginBottom: 50,
//   },
//   slider: {
//     width: '100%',
//     height: 40,
//   },
//   sliderLabel: {
//     fontSize: 16,
//     marginBottom: 5,
//   },
//   audioContainer: {
//     marginBottom: 30,
//   },
//   repeatButton: {
//     marginTop: 20,
//     padding: 10,
//     alignItems: 'center',
//     borderRadius: 5,
//   },
//   repeatButtonText: {
//     fontSize: 18,
//   },
// });

// export default AITextToSpeech;






// import React, { useContext, useState, useEffect } from "react";
// import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
// import { colors } from "../config/theme";
// import { ThemeContext } from "../context/ThemeContext";
// import { Audio } from 'expo-av';
// import ComboBox from 'react-native-combobox';
// import Slider from '@react-native-community/slider';

// const AITextToSpeech = () => {
//   const { theme } = useContext(ThemeContext);
//   const activeColors = colors[theme.mode];

//   const [text, setText] = useState("");
//   const [selectedVoice, setSelectedVoice] = useState("female");
//   const [vol1, setVol1] = useState(0.1);
//   const [vol2, setVol2] = useState(0.05);
//   const [vol3, setVol3] = useState(0);
//   const [sounds, setSounds] = useState([null, null, null]);
//   const [isRepeating, setIsRepeating] = useState(false);

//   const values = ['male', 'female'];

//   const handleConvert = async () => {
//     try {
//       const response = await fetch('https://your_ngrok_url/textspeech', { // Replace with your public URL
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ text, voice: selectedVoice, vol1, vol2, vol3 }),
//       });
//       const data = await response.json();
//       if (data.audio_url) {
//         await playSound(data.audio_url);
//       } else {
//         console.error('Error fetching audio URL:', data.error);
//       }
//     } catch (error) {
//       console.error('Error during text-to-speech conversion:', error);
//     }
//   };

//   const playSound = async (url) => {
//     try {
//       const { sound } = await Audio.Sound.createAsync({ uri: url });
//       setSounds([sound]);
//       sound.setOnPlaybackStatusUpdate(status => {
//         if (isRepeating && status.didJustFinish) {
//           sound.playAsync();
//         }
//       });
//       await sound.playAsync();
//     } catch (error) {
//       console.error("Error playing sound:", error);
//     }
//   };

//   const handleVolumeChange = (index, value) => {
//     if (index === 0) {
//       setVol1(value);
//     } else if (index === 1) {
//       setVol2(value);
//     } else if (index === 2) {
//       setVol3(value);
//     }
//     if (sounds[index]) {
//       sounds[index].setVolumeAsync(value);
//     }
//   };

//   const handleRepeatToggle = () => {
//     setIsRepeating(!isRepeating);
//     sounds.forEach(sound => {
//       if (sound) {
//         sound.setOnPlaybackStatusUpdate(status => {
//           if (isRepeating && status.didJustFinish) {
//             sound.playAsync();
//           }
//         });
//       }
//     });
//   };

//   useEffect(() => {
//     return () => {
//       sounds.forEach(sound => sound && sound.unloadAsync());
//     };
//   }, [sounds]);

//   return (
//     <ScrollView style={[styles.container, { backgroundColor: activeColors.primary }]}>
//       <Text style={[styles.label, { color: activeColors.text }]}>Enter Text:</Text>
//       <TextInput
//         style={[
//           styles.input,
//           { color: activeColors.text, borderColor: activeColors.accent, height: 5 * 20 }
//         ]}
//         value={text}
//         onChangeText={setText}
//         placeholder="Type here..."
//         placeholderTextColor={activeColors.secondary}
//         multiline={true}
//         numberOfLines={5}
//       />
//       <Text style={[styles.label, { color: activeColors.text }]}>Select Voice:</Text>
//       <View style={styles.comboBoxContainer}>
//         <ComboBox
//           values={values}
//           selectedValue={selectedVoice}
//           onValueSelect={setSelectedVoice}
//         />
//       </View>
//       <View style={styles.audioContainer}>
//         <View style={styles.sliderContainer}>
//           <Text style={[styles.sliderLabel, { color: activeColors.text }]}>Volume: {Math.round(vol1 * 100)}</Text>
//           <Slider
//             style={styles.slider}
//             minimumValue={0}
//             maximumValue={1}
//             step={0.01}
//             value={vol1}
//             onValueChange={(value) => handleVolumeChange(0, value)}
//           />
//         </View>
//         <View style={styles.sliderContainer}>
//           <Text style={[styles.sliderLabel, { color: activeColors.text }]}>Background Volume: {Math.round(vol2 * 100)}</Text>
//           <Slider
//             style={styles.slider}
//             minimumValue={0}
//             maximumValue={1}
//             step={0.01}
//             value={vol2}
//             onValueChange={(value) => handleVolumeChange(1, value)}
//           />
//         </View>
//         <View style={styles.sliderContainer}>
//           <Text style={[styles.sliderLabel, { color: activeColors.text }]}>SFX Volume: {Math.round(vol3 * 100)}</Text>
//           <Slider
//             style={styles.slider}
//             minimumValue={0}
//             maximumValue={1}
//             step={0.01}
//             value={vol3}
//             onValueChange={(value) => handleVolumeChange(2, value)}
//           />
//         </View>
//       </View>

//       <Button title="Generate" onPress={handleConvert} color={activeColors.accent} />

//       <TouchableOpacity onPress={handleRepeatToggle} style={[styles.repeatButton, { backgroundColor: activeColors.accent }]}>
//         <Text style={[styles.repeatButtonText, { color: activeColors.text }]}>
//           {isRepeating ? "Stop Repeating" : "Repeat Audio"}
//         </Text>
//       </TouchableOpacity>
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//   },
//   label: {
//     fontSize: 18,
//     marginBottom: 10,
//   },
//   input: {
//     borderWidth: 1,
//     marginBottom: 10,
//     paddingHorizontal: 10,
//   },
//   comboBoxContainer: {
//     marginBottom: 20,
//   },
//   sliderContainer: {
//     marginVertical: 10,
//   },
//   slider: {
//     width: '100%',
//     height: 40,
//   },
//   sliderLabel: {
//     fontSize: 16,
//     marginBottom: 5,
//   },
//   audioContainer: {
//     marginBottom: 30,
//   },
//   repeatButton: {
//     marginTop: 20,
//     padding: 10,
//     alignItems: 'center',
//     borderRadius: 5,
//   },
//   repeatButtonText: {
//     fontSize: 18,
//   },
// });

// export default AITextToSpeech;







// import React, { useContext, useState, useEffect } from "react";
// import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
// import { colors } from "../config/theme";
// import { ThemeContext } from "../context/ThemeContext";
// import { Audio } from 'expo-av';
// import ComboBox from 'react-native-combobox';
// import Slider from '@react-native-community/slider';

// const AITextToSpeech = () => {
//   const { theme } = useContext(ThemeContext);
//   const activeColors = colors[theme.mode];

//   const [texts, setTexts] = useState([""]);
//   const [selectedVoice, setSelectedVoice] = useState("male");
//   const [selectedSpeed, setSelectedSpeed] = useState("normal");
//   const [sounds, setSounds] = useState([null, null, null]);
//   const [audioUrls, setAudioUrls] = useState(["", "", ""]);
//   const [vol1, setVol1] = useState(0.1);
//   const [vol2, setVol2] = useState(0.05);
//   const [vol3, setVol3] = useState(0);
//   const [isRepeating, setIsRepeating] = useState(false);
//   const [text, setText] = useState("");

//   const values = ['Male', 'Female'];

//   const handleConvert = async () => {
//     try {
//       const response = await fetch('https://d04a-188-43-253-77.ngrok-free.app/textspeech', { // Replace with your public URL
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ texts }),
//       });
//       const data = await response.json();
//       if (data.audio_urls && data.audio_urls.length >= 3) {
//         setAudioUrls(data.audio_urls);
//         await playSounds(data.audio_urls);
//       } else {
//         console.error('Error fetching audio URLs:', data.error);
//       }
//     } catch (error) {
//       console.error('Error during text-to-speech conversion:', error);
//     }
//   };

//   const playSounds = async (urls) => {
//     const newSounds = [];
//     for (let i = 0; i < urls.length; i++) {
//       try {
//         const { sound } = await Audio.Sound.createAsync({ uri: urls[i] });
//         newSounds.push(sound);
//         sound.setOnPlaybackStatusUpdate(status => {
//           if (isRepeating && status.didJustFinish) {
//             sound.playAsync();
//           }
//         });
//         await sound.playAsync();
//       } catch (error) {
//         console.error("Error playing sound:", error);
//       }
//     }
//     setSounds(newSounds);
//   };

//   const handleVolumeChange = (index, value) => {
//     console.log(vol1, vol2, vol3)
//     if (index === 0) {
//       setVol1(value);
//     } else if (index === 1) {
//       setVol2(value);
//     } else if (index === 2) {
//       setVol3(value);
//     }
//     if (sounds[index]) {
//       sounds[index].setVolumeAsync(value);
//     }
//   };

//   const handleRepeatToggle = () => {
//     setIsRepeating(!isRepeating);
//     sounds.forEach(sound => {
//       if (sound) {
//         sound.setOnPlaybackStatusUpdate(status => {
//           if (isRepeating && status.didJustFinish) {
//             sound.playAsync();
//           }
//         });
//       }
//     });
//   };

//   useEffect(() => {
//     return () => {
//       sounds.forEach(sound => sound && sound.unloadAsync());
//     };
//   }, [sounds]);

//   return (
//     <ScrollView style={[styles.container, { backgroundColor: activeColors.primary }]}>
//       <Text style={[styles.label, { color: activeColors.text }]}>Enter Text:</Text>
//       {/* <TextInput
//         style={[styles.input, { color: activeColors.text, borderColor: activeColors.accent }]}
//         value={text}
//         onChangeText={setText}
//         placeholder="Type here..."
//         placeholderTextColor={activeColors.secondary}
//       /> */}
//       <TextInput
//         style={[
//           styles.input,
//           { color: activeColors.text, borderColor: activeColors.accent, height: 5 * 20 } // Assuming each line is approximately 20px high
//         ]}
//         value={text}
//         onChangeText={setText}
//         placeholder="Type here..."
//         placeholderTextColor={activeColors.secondary}
//         multiline={true}
//         numberOfLines={5}
//       />
//       <Text style={[styles.label, { color: activeColors.text }]}>Select Voice:</Text>
//       <View style={styles.comboBoxContainer}>
//         <ComboBox
//           values={values}
//           onValueSelect={setSelectedVoice}
//         />
//       </View>
//       <View style={styles.audioContainer}>
//         <View style={styles.sliderContainer}>
//           <Text style={[styles.sliderLabel, { color: activeColors.text }]}>Volume: {Math.round(vol1 * 100)}</Text>
//           <Slider
//             style={styles.slider}
//             minimumValue={-0.5}
//             maximumValue={0.5}
//             step={0.01}
//             value={vol1}
//             onValueChange={(value) => handleVolumeChange(0, value)}
//           />
//         </View>
//       </View>
      
//       <View style={styles.audioContainer}>
//         <View style={styles.sliderContainer}>
//           <Text style={[styles.sliderLabel, { color: activeColors.text }]}>Background Volume: {Math.round(vol2 * 100)}</Text>
//           <Slider
//             style={styles.slider}
//             minimumValue={-0.5}
//             maximumValue={0.5}
//             step={0.01}
//             value={vol2}
//             onValueChange={(value) => handleVolumeChange(1, value)}
//           />
//         </View>
//       </View>
//       <View style={styles.audioContainer}>
//         <View style={styles.sliderContainer}>
//           <Text style={[styles.sliderLabel, { color: activeColors.text }]}> SFX Volume: {Math.round(vol3 * 100)}</Text>
//           <Slider
//             style={styles.slider}
//             minimumValue={-0.5}
//             maximumValue={0.5}
//             step={0.01}
//             value={vol3}
//             onValueChange={(value) => handleVolumeChange(2, value)}
//           />
//         </View>
//       </View>

//       <Button title="Generate" onPress={handleConvert} color={activeColors.accent} />

//       <TouchableOpacity onPress={handleRepeatToggle} style={[styles.repeatButton, { backgroundColor: activeColors.accent }]}>
//         <Text style={[styles.repeatButtonText, { color: activeColors.text }]}>
//           {isRepeating ? "Stop Repeating" : "Repeat Audio"}
//         </Text>
//       </TouchableOpacity>
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//   },
//   label: {
//     fontSize: 18,
//     marginBottom: 10,
//   },
//   input: {
//     height: 40,
//     borderWidth: 1,
//     marginBottom: 10,
//     paddingHorizontal: 10,
//   },
//   comboBoxContainer: {
//     marginBottom: 20,
//   },
//   addButton: {
//     marginBottom: 20,
//     padding: 10,
//     alignItems: 'center',
//     borderRadius: 5,
//   },
//   addButtonText: {
//     fontSize: 18,
//   },
//   radioContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 10,
//   },
//   radioLabel: {
//     marginLeft: 5,
//   },
//   playButton: {
//     marginTop: 20,
//     padding: 10,
//     alignItems: 'center',
//     borderRadius: 5,
//   },
//   playButtonText: {
//     fontSize: 18,
//   },
//   sliderContainer: {
//     marginVertical: 10,
//   },
//   slider: {
//     width: '100%',
//     height: 40,
//   },
//   sliderLabel: {
//     fontSize: 16,
//     marginBottom: 5,
//   },
//   audioContainer: {
//     marginBottom: 30,
//   },
//   repeatButton: {
//     marginTop: 20,
//     padding: 10,
//     alignItems: 'center',
//     borderRadius: 5,
//   },
//   repeatButtonText: {
//     fontSize: 18,
//   },
// });

// export default AITextToSpeech;







// import React, { useContext, useState, useEffect } from "react";
// import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, ScrollView, Slider } from "react-native";
// import { colors } from "../config/theme";
// import { ThemeContext } from "../context/ThemeContext";
// import { Audio } from 'expo-av';
// import ComboBox from 'react-native-combobox';

// const AITextToSpeech = () => {
//   const { theme } = useContext(ThemeContext);
//   const activeColors = colors[theme.mode];

//   const [texts, setTexts] = useState([""]);
//   const [selectedVoice, setSelectedVoice] = useState("male");
//   const [selectedSpeed, setSelectedSpeed] = useState("normal");
//   const [sounds, setSounds] = useState([null, null, null]);
//   const [audioUrls, setAudioUrls] = useState(["", "", ""]);
//   const [vol1, setvol1] = useState(0.2);
//   const [vol2, setvol2] = useState(0.1);
//   const [vol3, setvol3] = useState(0.5);
//   const [isRepeating, setIsRepeating] = useState(false);
//   const [text, setText] = useState("");

//   const values = ['Male', 'Female'];

//   const handleConvert = async () => {
//     try {
//       const response = await fetch('https://d04a-188-43-253-77.ngrok-free.app/textspeech', { // Replace with your public URL
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ texts }),
//       });
//       const data = await response.json();
//       if (data.audio_urls && data.audio_urls.length >= 3) {
//         setAudioUrls(data.audio_urls);
//         await playSounds(data.audio_urls);
//       } else {
//         console.error('Error fetching audio URLs:', data.error);
//       }
//     } catch (error) {
//       console.error('Error during text-to-speech conversion:', error);
//     }
//   };

//   const playSounds = async (urls) => {
//     const newSounds = [];
//     for (let i = 0; i < urls.length; i++) {
//       try {
//         const { sound } = await Audio.Sound.createAsync({ uri: urls[i] });
//         newSounds.push(sound);
//         sound.setOnPlaybackStatusUpdate(status => {
//           if (isRepeating && status.didJustFinish) {
//             sound.playAsync();
//           }
//         });
//         await sound.playAsync();
//       } catch (error) {
//         console.error("Error playing sound:", error);
//       }
//     }
//     setSounds(newSounds);
//   };

//   const handleVolume1Change = (value) => {
//     setvol1(value);
//   };

//   const handleVolume2Change = (value) => {
//     setvol2(value);
//   };

//   const handleVolume3Change = (value) => {
//     setvol3(value);
//   };

//   const handleRepeatToggle = () => {
//     setIsRepeating(!isRepeating);
//     sounds.forEach(sound => {
//       if (sound) {
//         sound.setOnPlaybackStatusUpdate(status => {
//           if (isRepeating && status.didJustFinish) {
//             sound.playAsync();
//           }
//         });
//       }
//     });
//   };

//   useEffect(() => {
//     return () => {
//       sounds.forEach(sound => sound && sound.unloadAsync());
//     };
//   }, [sounds]);

//   return (
//     <ScrollView style={[styles.container, { backgroundColor: activeColors.primary }]}>
//       <Text style={[styles.label, { color: activeColors.text }]}>Enter Text:</Text>
//       <TextInput
//         style={[styles.input, { color: activeColors.text, borderColor: activeColors.accent }]}
//         value={text}
//         onChangeText={setText}
//         placeholder="Type here..."
//         placeholderTextColor={activeColors.secondary}
//       />
//       <Text style={[styles.label, { color: activeColors.text }]}>Select Voice:</Text>
//       <View style={styles.comboBoxContainer}>
//         <ComboBox
//           values={values}
//           onValueSelect={setSelectedVoice}
//         />
//       </View>
//       <Button title="Generate" onPress={handleConvert} color={activeColors.accent} />
//       <View style={styles.audioContainer}>
//         <TouchableOpacity onPress={() => playSounds([audioUrls[0]])} style={[styles.playButton, { backgroundColor: activeColors.accent }]}>
//           <Text style={[styles.playButtonText, { color: activeColors.text }]}>Play Audio 1</Text>
//         </TouchableOpacity>
//         <View style={styles.sliderContainer}>
//           <Text style={[styles.sliderLabel, { color: activeColors.text }]}>Volume 1: {Math.round(vol1 * 100)}</Text>
//           <Slider
//             style={styles.slider}
//             minimumValue={-0.5}
//             maximumValue={0.5}
//             step={0.01}
//             value={vol1}
//             onValueChange={(value) => handleVolume1Change(value)}
//           />
//         </View>
//       </View>
//       <View style={styles.audioContainer}>
//         <TouchableOpacity onPress={() => playSounds([audioUrls[1]])} style={[styles.playButton, { backgroundColor: activeColors.accent }]}>
//           <Text style={[styles.playButtonText, { color: activeColors.text }]}>Play Audio 2</Text>
//         </TouchableOpacity>
//         <View style={styles.sliderContainer}>
//           <Text style={[styles.sliderLabel, { color: activeColors.text }]}>Volume 2: {Math.round(vol2 * 100)}</Text>
//           <Slider
//             style={styles.slider}
//             minimumValue={-0.5}
//             maximumValue={0.5}
//             step={0.01}
//             value={vol2}
//             onValueChange={(value) => handleVolume2Change(value)}
//           />
//         </View>
//       </View>
//       <View style={styles.audioContainer}>
//         <TouchableOpacity onPress={() => playSounds([audioUrls[2]])} style={[styles.playButton, { backgroundColor: activeColors.accent }]}>
//           <Text style={[styles.playButtonText, { color: activeColors.text }]}>Play Audio 3</Text>
//         </TouchableOpacity>
//         <View style={styles.sliderContainer}>
//           <Text style={[styles.sliderLabel, { color: activeColors.text }]}>Volume 3: {Math.round(vol3 * 100)}</Text>
//           <Slider
//             style={styles.slider}
//             minimumValue={-0.5}
//             maximumValue={0.5}
//             step={0.01}
//             value={vol3}
//             onValueChange={(value) => handleVolume3Change(value)}
//           />
//         </View>
//       </View>
//       <TouchableOpacity onPress={handleRepeatToggle} style={[styles.repeatButton, { backgroundColor: activeColors.accent }]}>
//         <Text style={[styles.repeatButtonText, { color: activeColors.text }]}>
//           {isRepeating ? "Stop Repeating" : "Repeat Audio"}
//         </Text>
//       </TouchableOpacity>
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//   },
//   label: {
//     fontSize: 18,
//     marginBottom: 10,
//   },
//   input: {
//     height: 40,
//     borderWidth: 1,
//     marginBottom: 10,
//     paddingHorizontal: 10,
//   },
//   comboBoxContainer: {
//     marginBottom: 20,
//   },
//   addButton: {
//     marginBottom: 20,
//     padding: 10,
//     alignItems: 'center',
//     borderRadius: 5,
//   },
//   addButtonText: {
//     fontSize: 18,
//   },
//   radioContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 10,
//   },
//   radioLabel: {
//     marginLeft: 5,
//   },
//   playButton: {
//     marginTop: 20,
//     padding: 10,
//     alignItems: 'center',
//     borderRadius: 5,
//   },
//   playButtonText: {
//     fontSize: 18,
//   },
//   sliderContainer: {
//     marginVertical: 10,
//   },
//   slider: {
//     width: '100%',
//     height: 40,
//   },
//   sliderLabel: {
//     fontSize: 16,
//     marginBottom: 5,
//   },
//   audioContainer: {
//     marginBottom: 30,
//   },
//   repeatButton: {
//     marginTop: 20,
//     padding: 10,
//     alignItems: 'center',
//     borderRadius: 5,
//   },
//   repeatButtonText: {
//     fontSize: 18,
//   },
// });

// export default AITextToSpeech;





// import React, { useContext, useState, useEffect } from "react";
// import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, ScrollView, Slider } from "react-native";
// import { colors } from "../config/theme";
// import { ThemeContext } from "../context/ThemeContext";
// import { RadioButton } from 'react-native-paper';
// import { Audio } from 'expo-av';
// import ComboBox from 'react-native-combobox';

// const AITextToSpeech = () => {
//   const { theme } = useContext(ThemeContext);
//   const activeColors = colors[theme.mode];

//   const [texts, setTexts] = useState([""]);
//   const [selectedVoice, setSelectedVoice] = useState("male");
//   const [selectedSpeed, setSelectedSpeed] = useState("normal");
//   const [sounds, setSounds] = useState([null, null, null]);
//   const [audioUrls, setAudioUrls] = useState(["", "", ""]);
//   const [volumes, setVolumes] = useState([0.5, 0.2, 0.7]);
//   const [vol1, setvol1] = useState(0.5)
//   const [vol2, setvol2] = useState(0.5)
//   const [vol3, setvol3] = useState(0.5)
//   const [isRepeating, setIsRepeating] = useState(false);

//   const values = ['Male', 'Female'];


//   const handleConvert = async () => {
//     try {
//       const response = await fetch('https://d04a-188-43-253-77.ngrok-free.app/textspeech', { // Replace with your public URL
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ texts }),
//       });
//       const data = await response.json();
//       if (data.audio_urls && data.audio_urls.length >= 3) {
//         setAudioUrls(data.audio_urls);
//         await playSounds(data.audio_urls);
//       } else {
//         console.error('Error fetching audio URLs:', data.error);
//       }
//     } catch (error) {
//       console.error('Error during text-to-speech conversion:', error);
//     }
//   };

//   const playSounds = async (urls) => {
//     const newSounds = [];
//     for (let i = 0; i < urls.length; i++) {
//       try {
//         const { sound } = await Audio.Sound.createAsync({ uri: urls[i] });
//         newSounds.push(sound);
//         sound.setOnPlaybackStatusUpdate(status => {
//           if (isRepeating && status.didJustFinish) {
//             sound.playAsync();
//           }
//         });
//         await sound.playAsync();
//       } catch (error) {
//         console.error("Error playing sound:", error);
//       }
//     }
//     setSounds(newSounds);
//   };

//   // const handleVolumeChange = (index, value) => {
//   //   const newVolumes = [...volumes];
//   //   newVolumes[index] = value;
//   //   setVolumes(newVolumes);
//   //   if (sounds[index]) {
//   //     sounds[index].setVolumeAsync(value);
//   //   }
//   // };
//   const handleVolume1Change = (value) =>{
//     setvol1(value)
//   }
//   const handleVolume2Change = (value) =>{
//     setvol1(value)
//   }
//   const handleVolume3Change = (value) =>{
//     setvol1(value)
//   }

//   const handleRepeatToggle = () => {
//     setIsRepeating(!isRepeating);
//     sounds.forEach(sound => {
//       if (sound) {
//         sound.setOnPlaybackStatusUpdate(status => {
//           if (isRepeating && status.didJustFinish) {
//             sound.playAsync();
//           }
//         });
//       }
//     });
//   };

//   useEffect(() => {
//     return () => {
//       sounds.forEach(sound => sound && sound.unloadAsync());
//     };
//   }, [sounds]);

//   return (
//     <ScrollView style={[styles.container, { backgroundColor: activeColors.primary }]}>
//       <Text style={[styles.label, { color: activeColors.text }]}>Enter Text:</Text>
//       <TextInput
//         style={[styles.input, { color: activeColors.text, borderColor: activeColors.accent }]}
//         value={text}
//         onChangeText={setText}
//         placeholder="Type here..."
//         placeholderTextColor={activeColors.secondary}
//       />
//       <Text style={[styles.label, { color: activeColors.text }]}>Select Voice:</Text>
//       <View style={styles.comboBoxContainer}>
//         <ComboBox
//           values={values}
//           onValueSelect={setSelectedVoice}
//         />
//       </View>
//       <Button title="Generate" onPress={handleConvert} color={activeColors.accent} />
//       {/* {audioUrls.map((url, index) => (
//         <View key={index} style={styles.audioContainer}>
//           <TouchableOpacity onPress={() => playSounds([url])} style={[styles.playButton, { backgroundColor: activeColors.accent }]}>
//             <Text style={[styles.playButtonText, { color: activeColors.text }]}>Play Audio {index + 1}</Text>
//           </TouchableOpacity>
//           <View style={styles.sliderContainer}>
//             <Text style={[styles.sliderLabel, { color: activeColors.text }]}>Volume {index + 1}: {Math.round(volumes[index] * 100)}</Text>
//             <Slider
//               style={styles.slider}
//               minimumValue={0}
//               maximumValue={1}
//               step={0.01}
//               value={volumes[index]}
//               onValueChange={(value) => handleVolumeChange(index, value)}
//             />
//           </View>
//         </View>
//       ))} */}
//         <View style={styles.audioContainer}>
//           <TouchableOpacity onPress={() => playSounds([url])} style={[styles.playButton, { backgroundColor: activeColors.accent }]}>
//             <Text style={[styles.playButtonText, { color: activeColors.text }]}>Play Audio 1</Text>
//           </TouchableOpacity>
//           <View style={styles.sliderContainer}>
//             <Text style={[styles.sliderLabel, { color: activeColors.text }]}>Volume 1: {Math.round(volumes[index] * 100)}</Text>
//             <Slider
//               style={styles.slider}
//               minimumValue={0}
//               maximumValue={1}
//               step={0.01}
//               value={vol1}
//               onValueChange={(value) => handleVolume1Change(value)}
//             />
//           </View>
//         </View>
//       <TouchableOpacity onPress={handleRepeatToggle} style={[styles.repeatButton, { backgroundColor: activeColors.accent }]}>
//         <Text style={[styles.repeatButtonText, { color: activeColors.text }]}>
//           {isRepeating ? "Stop Repeating" : "Repeat Audio"}
//         </Text>
//       </TouchableOpacity>
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//   },
//   label: {
//     fontSize: 18,
//     marginBottom: 10,
//   },
//   input: {
//     height: 40,
//     borderWidth: 1,
//     marginBottom: 10,
//     paddingHorizontal: 10,
//   },
//   comboBoxContainer: {
//     marginBottom: 20,
//   },
//   addButton: {
//     marginBottom: 20,
//     padding: 10,
//     alignItems: 'center',
//     borderRadius: 5,
//   },
//   addButtonText: {
//     fontSize: 18,
//   },
//   radioContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 10,
//   },
//   radioLabel: {
//     marginLeft: 5,
//   },
//   playButton: {
//     marginTop: 20,
//     padding: 10,
//     alignItems: 'center',
//     borderRadius: 5,
//   },
//   playButtonText: {
//     fontSize: 18,
//   },
//   sliderContainer: {
//     marginVertical: 10,
//   },
//   slider: {
//     width: '100%',
//     height: 40,
//   },
//   sliderLabel: {
//     fontSize: 16,
//     marginBottom: 5,
//   },
//   audioContainer: {
//     marginBottom: 30,
//   },
//   repeatButton: {
//     marginTop: 20,
//     padding: 10,
//     alignItems: 'center',
//     borderRadius: 5,
//   },
//   repeatButtonText: {
//     fontSize: 18,
//   },
// });

// export default AITextToSpeech;



// import React, { useContext, useState, useEffect } from "react";
// import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
// import { colors } from "../config/theme";
// import { ThemeContext } from "../context/ThemeContext";
// import { RadioButton } from 'react-native-paper';
// import { Audio } from 'expo-av';
// import ComboBox from 'react-native-combobox';

// const AITextToSpeech = () => {
//   const { theme } = useContext(ThemeContext);
//   const activeColors = colors[theme.mode];

//   const [text, setText] = useState("");
//   const [selectedVoice, setSelectedVoice] = useState("male");
//   const [selectedSpeed, setSelectedSpeed] = useState("normal");
//   const [sound, setSound] = useState();
//   const [audioUrl, setAudioUrl] = useState("");
//   const [selectedValue, setSelectedValue] = useState('');
//   const values = [
//     'Male',
//     'Female',
//   ];

//   const handleConvert = async () => {
//     try {
//       const response = await fetch('https://d04a-188-43-253-77.ngrok-free.app/textspeech', { // Replace with your public URL
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ text }),
//       });
//       const data = await response.json();
//       if (data.audio_url) {
//         setAudioUrl('https://d04a-188-43-253-77.ngrok-free.app/static/1.mp3');
//         playSound('https://d04a-188-43-253-77.ngrok-free.app/static/1.mp3');
//       } else {
//         console.error('Error fetching audio URL:', data.error);
//       }
//     } catch (error) {
//       console.error('Error during text-to-speech conversion:', error);
//     }
//   };

//   const playSound = async (url) => {
//     try {
//       const { sound } = await Audio.Sound.createAsync({ uri: url });
//       setSound(sound);
//       await sound.playAsync();
//     } catch (error) {
//       console.error("Error playing sound:", error);
//     }
//   };

//   useEffect(() => {
//     return sound
//       ? () => {
//           sound.unloadAsync();
//         }
//       : undefined;
//   }, [sound]);

//   return (
//     <ScrollView style={[styles.container, { backgroundColor: activeColors.primary }]}>
      // <Text style={[styles.label, { color: activeColors.text }]}>Enter Text:</Text>
      // <TextInput
      //   style={[styles.input, { color: activeColors.text, borderColor: activeColors.accent }]}
      //   value={text}
      //   onChangeText={setText}
      //   placeholder="Type here..."
      //   placeholderTextColor={activeColors.secondary}
      // />
//       <Text style={[styles.label, { color: activeColors.text }]}>Select Voice:</Text>
//       <View style={styles.comboBoxContainer}>
//         <ComboBox
//           values={values}
//           onValueSelect={setSelectedValue}
//         />
//         <Text style={[styles.selectedValueText, { color: activeColors.text }]}>Selected value: {values[selectedValue]}</Text>
//       </View>
//       <Text style={[styles.label, { color: activeColors.text }]}>Select Speed:</Text>
//       <RadioButton.Group
//         onValueChange={newValue => setSelectedSpeed(newValue)}
//         value={selectedSpeed}
//       >
//         <View style={styles.radioContainer}>
//           <RadioButton value="slow" />
//           <Text style={[styles.radioLabel, { color: activeColors.text }]}>Slow</Text>
//         </View>
//         <View style={styles.radioContainer}>
//           <RadioButton value="normal" />
//           <Text style={[styles.radioLabel, { color: activeColors.text }]}>Normal</Text>
//         </View>
//         <View style={styles.radioContainer}>
//           <RadioButton value="fast" />
//           <Text style={[styles.radioLabel, { color: activeColors.text }]}>Fast</Text>
//         </View>
//       </RadioButton.Group>
//       <Button title="Generate" onPress={handleConvert} color={activeColors.accent} />
//       <TouchableOpacity onPress={() => playSound(audioUrl)} style={[styles.playButton, { backgroundColor: activeColors.accent }]}>
//         <Text style={[styles.playButtonText, { color: activeColors.text }]}>Play Audio</Text>
//       </TouchableOpacity>
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//   },
//   label: {
//     fontSize: 18,
//     marginBottom: 10,
//   },
//   input: {
//     height: 40,
//     borderWidth: 1,
//     marginBottom: 20,
//     paddingHorizontal: 10,
//   },
//   comboBoxContainer: {
//     margin: 1,
//     marginBottom: 20,
//   },
//   selectedValueText: {
//     marginTop: 10,
//   },
//   radioContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 10,
//   },
//   radioLabel: {
//     marginLeft: 5,
//   },
//   playButton: {
//     marginTop: 20,
//     padding: 10,
//     alignItems: 'center',
//     borderRadius: 5,
//   },
//   playButtonText: {
//     fontSize: 18,
//   },
// });

// export default AITextToSpeech;



// import React, { useContext, useState, useEffect } from "react";
// import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity } from "react-native";
// import { colors } from "../config/theme";
// import { ThemeContext } from "../context/ThemeContext";
// import { Picker } from '@react-native-picker/picker';
// import { RadioButton } from 'react-native-paper';
// import { Audio } from 'expo-av';
// import ComboBox from 'react-native-combobox';

// const AITextToSpeech = () => {
//   const { theme } = useContext(ThemeContext);
//   const activeColors = colors[theme.mode];

//   const [text, setText] = useState("");
//   const [selectedVoice, setSelectedVoice] = useState("male");
//   const [selectedSpeed, setSelectedSpeed] = useState("normal");
//   const [sound, setSound] = useState();
//   const [audioUrl, setAudioUrl] = useState("");
//   const [selectedValue, setSelectedValue] = useState('');
//   const values = [
//     'option 1',
//     'option 2',
//     'option 3',
//     'option 4',
//     'option 5'
// ];

//   const handleConvert = async () => {
//     try {
//       const response = await fetch('https://83cb-188-43-253-77.ngrok-free.app/textspeech', { // Replace with your public URL
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ text }),
//       });
//       const data = await response.json();
//       if (data.audio_url) {
//         // setAudioUrl(data.audio_url);
//         setAudioUrl('https://83cb-188-43-253-77.ngrok-free.app/static/1.mp3');
//         // playSound(data.audio_url);
//         playSound('https://83cb-188-43-253-77.ngrok-free.app/static/1.mp3');
//       } else {
//         console.error('Error fetching audio URL:', data.error);
//       }
//     } catch (error) {
//       console.error('Error during text-to-speech conversion:', error);
//     }
//   };

//   const playSound = async (url) => {
//     try {
//       const { sound } = await Audio.Sound.createAsync({ uri: url });
//       setSound(sound);
//       await sound.playAsync();
//     } catch (error) {
//       console.error("Error playing sound:", error);
//     }
//   };

//   useEffect(() => {
//     return sound
//       ? () => {
//           sound.unloadAsync();
//         }
//       : undefined;
//   }, [sound]);

//   return (
//     <View style={[styles.container, { backgroundColor: activeColors.primary }]}>
//       <Text style={[styles.label, { color: activeColors.text }]}>Enter Text:</Text>
//       <TextInput
//         style={[styles.input, { color: activeColors.text, borderColor: activeColors.accent }]}
//         value={text}
//         onChangeText={setText}
//         placeholder="Type here..."
//         placeholderTextColor={activeColors.secondary}
//       />
//       <Text style={[styles.label, { color: activeColors.text }]}>Select Voice:</Text>
//       {/* <View style={styles.pickerContainer}> */}
//       <View style = {{margin: 1, marginBottom:100}}>
//         {/* <Picker
//           selectedValue={selectedVoice}
//           onValueChange={(itemValue) => setSelectedVoice(itemValue)}
//           style={{ color: activeColors.text, backgroundColor: activeColors.primary }}
//           dropdownIconColor={activeColors.text}
//         >
//           <Picker.Item label="Male" value="male" />
//           <Picker.Item label="Female" value="female" />
//         </Picker> */}
//         <View style={{ flex: 1, paddingVertical: 50, paddingHorizontal: 10, justifyContent: 'space-between' }}>
//             <ComboBox
//                 values={values}
//                 onValueSelect={setSelectedValue}
//             />
//             <Text>selected value:          {values[selectedValue]}</Text>
//         </View>
//       </View>
//       <Text style={[styles.label, { color: activeColors.text }]}>Select Speed:</Text>
//       <RadioButton.Group
//         onValueChange={newValue => setSelectedSpeed(newValue)}
//         value={selectedSpeed}
//       >
//         <View style={styles.radioContainer}>
//           <RadioButton value="slow" />
//           <Text style={[styles.radioLabel, { color: activeColors.text }]}>Slow</Text>
//         </View>
//         <View style={styles.radioContainer}>
//           <RadioButton value="normal" />
//           <Text style={[styles.radioLabel, { color: activeColors.text }]}>Normal</Text>
//         </View>
//         <View style={styles.radioContainer}>
//           <RadioButton value="fast" />
//           <Text style={[styles.radioLabel, { color: activeColors.text }]}>Fast</Text>
//         </View>
//       </RadioButton.Group>
//       <Button title="Generate" onPress={handleConvert} color={activeColors.accent} />
//       <TouchableOpacity onPress={() => playSound(audioUrl)} style={[styles.playButton, { backgroundColor: activeColors.accent }]}>
//         <Text style={[styles.playButtonText, { color: activeColors.text }]}>Play Audio</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//   },
//   label: {
//     fontSize: 18,
//     marginBottom: 10,
//   },
//   input: {
//     height: 40,
//     borderWidth: 1,
//     marginBottom: 20,
//     paddingHorizontal: 10,
//   },
//   pickerContainer: {
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 5,
//     marginBottom: 20,
//     overflow: 'hidden',
//   },
//   radioContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 10,
//   },
//   radioLabel: {
//     marginLeft: 5,
//   },
//   playButton: {
//     marginTop: 20,
//     padding: 10,
//     alignItems: 'center',
//     borderRadius: 5,
//   },
//   playButtonText: {
//     fontSize: 18,
//   },
// });

// export default AITextToSpeech;









// import React, { useContext, useState, useEffect } from "react";
// import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity } from "react-native";
// import { colors } from "../config/theme";
// import { ThemeContext } from "../context/ThemeContext";
// import { Picker } from '@react-native-picker/picker';
// import { RadioButton } from 'react-native-paper';
// import { Audio } from 'expo-av';

// const AITextToSpeech = () => {
//   const { theme } = useContext(ThemeContext);
//   const activeColors = colors[theme.mode];

//   const [text, setText] = useState("");
//   const [selectedVoice, setSelectedVoice] = useState("male");
//   const [selectedSpeed, setSelectedSpeed] = useState("normal");
//   const [sound, setSound] = useState();

//   const handleConvert = () => {
//     // Handle the convert button press
//   };

//   const playSound = async () => {
//     try {
//       const { sound } = await Audio.Sound.createAsync(
//         // { uri: 'http://127.0.0.1:3000/static/1.mp3' }
//         { uri: 'https://7f69-188-43-253-77.ngrok-free.app/static/1.mp3' }
//       );
//       setSound(sound);
//       await sound.playAsync();
//     } catch (error) {
//       console.error("Error playing sound:", error);
//     }
//   };

//   // Unload the sound to free up resources
//   useEffect(() => {
//     return sound
//       ? () => {
//           sound.unloadAsync();
//         }
//       : undefined;
//   }, [sound]);

//   return (
//     <View style={[styles.container, { backgroundColor: activeColors.primary }]}>
//       <Text style={[styles.label, { color: activeColors.text }]}>Enter Text:</Text>
//       <TextInput
//         style={[styles.input, { color: activeColors.text, borderColor: activeColors.accent }]}
//         value={text}
//         onChangeText={setText}
//         placeholder="Type here..."
//         placeholderTextColor={activeColors.secondary}
//       />
//       <Text style={[styles.label, { color: activeColors.text }]}>Select Voice:</Text>
//       <View style={styles.pickerContainer}>
//         <Picker
//           selectedValue={selectedVoice}
//           onValueChange={(itemValue) => setSelectedVoice(itemValue)}
//           style={{ color: activeColors.text, backgroundColor: activeColors.primary }}
//           dropdownIconColor={activeColors.text}
//         >
//           <Picker.Item label="Male" value="male" />
//           <Picker.Item label="Female" value="female" />
//         </Picker>
//       </View>
//       <Text style={[styles.label, { color: activeColors.text }]}>Select Speed:</Text>
//       <RadioButton.Group
//         onValueChange={newValue => setSelectedSpeed(newValue)}
//         value={selectedSpeed}
//       >
//         <View style={styles.radioContainer}>
//           <RadioButton value="slow" />
//           <Text style={[styles.radioLabel, { color: activeColors.text }]}>Slow</Text>
//         </View>
//         <View style={styles.radioContainer}>
//           <RadioButton value="normal" />
//           <Text style={[styles.radioLabel, { color: activeColors.text }]}>Normal</Text>
//         </View>
//         <View style={styles.radioContainer}>
//           <RadioButton value="fast" />
//           <Text style={[styles.radioLabel, { color: activeColors.text }]}>Fast</Text>
//         </View>
//       </RadioButton.Group>
//       <Button title="Generate" onPress={handleConvert} color={activeColors.accent} />
//       <TouchableOpacity onPress={playSound} style={[styles.playButton, { backgroundColor: activeColors.accent }]}>
//         <Text style={[styles.playButtonText, { color: activeColors.text }]}>Play Audio</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//   },
//   label: {
//     fontSize: 18,
//     marginBottom: 10,
//   },
//   input: {
//     height: 40,
//     borderWidth: 1,
//     marginBottom: 20,
//     paddingHorizontal: 10,
//   },
//   pickerContainer: {
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 5,
//     marginBottom: 20,
//     overflow: 'hidden',
//   },
//   radioContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 10,
//   },
//   radioLabel: {
//     marginLeft: 5,
//   },
//   playButton: {
//     marginTop: 20,
//     padding: 10,
//     alignItems: 'center',
//     borderRadius: 5,
//   },
//   playButtonText: {
//     fontSize: 18,
//   },
// });

// export default AITextToSpeech;








// import React, { useContext, useState } from "react";
// import { View, Text, TextInput, Button, StyleSheet } from "react-native";
// import { colors } from "../config/theme";
// import { ThemeContext } from "../context/ThemeContext";
// import { Picker } from '@react-native-picker/picker';
// import { RadioButton } from 'react-native-paper';

// const AITextToSpeech = () => {
//   const { theme } = useContext(ThemeContext);
//   const activeColors = colors[theme.mode];

//   const [text, setText] = useState("");
//   const [selectedVoice, setSelectedVoice] = useState("male");
//   const [selectedSpeed, setSelectedSpeed] = useState("normal");

//   const handleConvert = () => {
//     // Handle the convert button press
//   };

//   return (
//     <View style={[styles.container, { backgroundColor: activeColors.primary }]}>
//       <Text style={[styles.label, { color: activeColors.text }]}>Enter Text:</Text>
//       <TextInput
//         style={[styles.input, { color: activeColors.text, borderColor: activeColors.accent }]}
//         value={text}
//         onChangeText={setText}
//         placeholder="Type here..."
//         placeholderTextColor={activeColors.secondary}
//       />
//       <Text style={[styles.label, { color: activeColors.text }]}>Select Voice:</Text>
//       <View style={styles.pickerContainer}>
//         <Picker
//           selectedValue={selectedVoice}
//           onValueChange={(itemValue) => setSelectedVoice(itemValue)}
//           style={{ color: activeColors.text, backgroundColor: activeColors.primary }}
//           dropdownIconColor={activeColors.text}
//         >
//           <Picker.Item label="Male" value="male" />
//           <Picker.Item label="Female" value="female" />
//         </Picker>
//       </View>
//       <Text style={[styles.label, { color: activeColors.text }]}>Select Speed:</Text>
//       <RadioButton.Group
//         onValueChange={newValue => setSelectedSpeed(newValue)}
//         value={selectedSpeed}
//       >
//         <View style={styles.radioContainer}>
//           <RadioButton value="slow" />
//           <Text style={[styles.radioLabel, { color: activeColors.text }]}>Slow</Text>
//         </View>
//         <View style={styles.radioContainer}>
//           <RadioButton value="normal" />
//           <Text style={[styles.radioLabel, { color: activeColors.text }]}>Normal</Text>
//         </View>
//         <View style={styles.radioContainer}>
//           <RadioButton value="fast" />
//           <Text style={[styles.radioLabel, { color: activeColors.text }]}>Fast</Text>
//         </View>
//       </RadioButton.Group>
//       <Button title="Generate" onPress={handleConvert} color={activeColors.accent} />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//   },
//   label: {
//     fontSize: 18,
//     marginBottom: 10,
//   },
//   input: {
//     height: 40,
//     borderWidth: 1,
//     marginBottom: 20,
//     paddingHorizontal: 10,
//   },
//   pickerContainer: {
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 5,
//     marginBottom: 20,
//     overflow: 'hidden',
//   },
//   radioContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 10,
//   },
//   radioLabel: {
//     marginLeft: 5,
//   },
// });

// export default AITextToSpeech;
