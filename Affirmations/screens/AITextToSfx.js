import React, { useContext, useState, useEffect } from "react";
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, ScrollView, Image } from "react-native";
import { colors } from "../config/theme";
import { ThemeContext } from "../context/ThemeContext";
import { Audio } from 'expo-av';
import ComboBox from 'react-native-combobox';
import Slider from '@react-native-community/slider';

const AITextToSfx = () => {
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
  const values = ['5 s', '10 s', '20 s'];

  const handleConvert = async () => {
    try {
      const response = await fetch('https://0f54-188-43-253-77.ngrok-free.app/textsfx', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, time: selectedVoice }),
      });
      const data = await response.json();
      if (data.audio_url) {
        // await playSound(data.audio_url);
        await playSound('https://0f54-188-43-253-77.ngrok-free.app/static/sfx.mp3');
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
    const aduio_link = 'https://0f54-188-43-253-77.ngrok-free.app/static/sfx.mp3'
    if (!isPlaying) {
      try {
        const { sound } = await Audio.Sound.createAsync({ uri: aduio_link });
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
      // sounds[0]?.playAsync();
      setIsPlaying(true);
    }
  };

  const handleRepeatToggle = () => {
    setIsRepeating(!isRepeating);
  };

  useEffect(() => {
    return () => {
      sounds.forEach(sound => sound && sound.unloadAsync());
    };
  }, [sounds]);

  return (
    <ScrollView style={[styles.container, { backgroundColor: activeColors.primary }]}>
      <Text style={[styles.label, { color: activeColors.text }]}>Enter the description:</Text>
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
      <Text style={[styles.label, { color: activeColors.text }]}>Select time:</Text>
      <View style={styles.comboBoxContainer}>
        <ComboBox
          values={values}
          selectedValue={selectedVoice}
          onValueSelect={setSelectedVoice}
        />
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
          <Image source={ !isRepeating ? require('../assets/repeat.png'): require('../assets/loopoff.png')} style={styles.image} />
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
    fontSize: 18,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  comboBoxContainer: {
    marginBottom: 20,
  },
  sliderContainer: {
    marginVertical: 10,
  },
  
  imageButton: {
    marginTop: 20,
    alignItems: 'center',
    borderRadius: 5,
  },
  image: {
    width: 50,
    height: 50,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 20,
    marginHorizontal: 80,
    marginBottom: 50,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabel: {
    fontSize: 16,
    marginBottom: 5,
  },
  audioContainer: {
    marginBottom: 30,
  },
  playbackContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 20,
  },
  playbackSlider: {
    width: '80%',
    height: 40,
  },
  playbackTime: {
    fontSize: 16,
  },
});

export default AITextToSfx;


