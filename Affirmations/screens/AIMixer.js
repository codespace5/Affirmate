import React, { useContext, useState, useRef } from 'react';
import { View, Text, Slider, Switch, Button, StyleSheet } from 'react-native';
import { colors } from '../config/theme';
import { ThemeContext } from '../context/ThemeContext';
import { Audio } from 'expo-av';

const AIMixer = () => {
  const { theme } = useContext(ThemeContext);
  const activeColors = colors[theme.mode];

  const [voiceVolume, setVoiceVolume] = useState(1);
  const [musicVolume, setMusicVolume] = useState(1);
  const [sfxVolume, setSfxVolume] = useState(1);
  const [voiceSpeed, setVoiceSpeed] = useState(1);
  const [isMusicLooping, setIsMusicLooping] = useState(false);
  const [isSfxLooping, setIsSfxLooping] = useState(false);

  const voiceRef = useRef(new Audio.Sound());
  const musicRef = useRef(new Audio.Sound());
  const sfxRef = useRef(new Audio.Sound());

  const loadAudio = async () => {
    try {
      await voiceRef.current.loadAsync(require('../assets/voice.mp3'));
      await musicRef.current.loadAsync(require('../assets/music.mp3'));
      await sfxRef.current.loadAsync(require('../assets/sfx.mp3'));

      await voiceRef.current.setVolumeAsync(voiceVolume);
      await musicRef.current.setVolumeAsync(musicVolume);
      await sfxRef.current.setVolumeAsync(sfxVolume);

      await voiceRef.current.setRateAsync(voiceSpeed, true);
    } catch (error) {
      console.log('Error loading audio', error);
    }
  };

  const handlePlay = async () => {
    await loadAudio();
    await voiceRef.current.playAsync();
    await musicRef.current.playAsync();
    await sfxRef.current.playAsync();
  };

  const handleStop = async () => {
    await voiceRef.current.stopAsync();
    await musicRef.current.stopAsync();
    await sfxRef.current.stopAsync();
  };

  const handleLoopMusic = async (value) => {
    setIsMusicLooping(value);
    await musicRef.current.setIsLoopingAsync(value);
  };

  const handleLoopSfx = async (value) => {
    setIsSfxLooping(value);
    await sfxRef.current.setIsLoopingAsync(value);
  };

  return (
    <View style={[styles.container, { backgroundColor: activeColors.primary }]}>
      <Text style={[styles.label, { color: activeColors.text }]}>Voice Volume</Text>
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={1}
        value={voiceVolume}
        onValueChange={(value) => setVoiceVolume(value)}
      />
      <Text style={[styles.label, { color: activeColors.text }]}>Music Volume</Text>
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={1}
        value={musicVolume}
        onValueChange={(value) => setMusicVolume(value)}
      />
      <Text style={[styles.label, { color: activeColors.text }]}>SFX Volume</Text>
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={1}
        value={sfxVolume}
        onValueChange={(value) => setSfxVolume(value)}
      />
      <Text style={[styles.label, { color: activeColors.text }]}>Voice Speed</Text>
      <Slider
        style={styles.slider}
        minimumValue={0.5}
        maximumValue={4}
        value={voiceSpeed}
        onValueChange={(value) => setVoiceSpeed(value)}
      />
      <View style={styles.switchContainer}>
        <Text style={[styles.label, { color: activeColors.text }]}>Loop Music</Text>
        <Switch
          value={isMusicLooping}
          onValueChange={handleLoopMusic}
          thumbColor={isMusicLooping ? activeColors.accent : activeColors.secondary}
        />
      </View>
      <View style={styles.switchContainer}>
        <Text style={[styles.label, { color: activeColors.text }]}>Loop SFX</Text>
        <Switch
          value={isSfxLooping}
          onValueChange={handleLoopSfx}
          thumbColor={isSfxLooping ? activeColors.accent : activeColors.secondary}
        />
      </View>
      <Button title="Play" onPress={handlePlay} color={activeColors.accent} />
      <Button title="Stop" onPress={handleStop} color={activeColors.secondary} />
    </View>
  );
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
  slider: {
    width: '100%',
    height: 40,
    marginBottom: 20,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
});

export default AIMixer;
