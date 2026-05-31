import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Switch,
  Slider,
  Alert,
  ScrollView,
  TouchableOpacity,
  StatusBar
} from 'react-native';
import { Audio } from 'expo-av';

export default function App() {
  const [isAmbientEnabled, setIsAmbientEnabled] = useState(false);
  const [filterStrength, setFilterStrength] = useState(0.6);
  const [gain, setGain] = useState(1.5);
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Microphone access is required for ambient hearing and recording.');
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_MIX_WITH_OTHERS,
      });
    })();
  }, []);

  const toggleAmbientMode = (value) => {
    setIsAmbientEnabled(value);
    if (value) {
      console.log(`Ambient ON – Filter: ${filterStrength}, Gain: ${gain}`);
      // Real implementation would use AVAudioEngine via native module.
    }
  };

  const startRecording = async () => {
    try {
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
    } catch (err) {
      Alert.alert('Error', 'Could not start recording');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    setIsRecording(false);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    setRecording(null);
    Alert.alert('Recording saved', `Saved to: ${uri}`);
  };

  const playRecording = async () => {
    if (!recording) {
      Alert.alert('No recording', 'Please record something first.');
      return;
    }
    const { sound } = await recording.createNewLoadedSoundAsync();
    await sound.playAsync();
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#0a0c16" />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>🎧 Samuel Assist</Text>
          <Text style={styles.subtitle}>Hear. Protect. Record.</Text>
        </View>

        {/* Ambient Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>🌿 Ambient Passthrough</Text>
            <Switch
              value={isAmbientEnabled}
              onValueChange={toggleAmbientMode}
              trackColor={{ false: '#3a3a4a', true: '#34c759' }}
              thumbColor={isAmbientEnabled ? '#ffffff' : '#f4f3f4'}
            />
          </View>

          <View style={styles.sliderGroup}>
            <Text style={styles.label}>🌬️ Wind Reduction</Text>
            <Slider
              style={styles.slider}
              value={filterStrength}
              onValueChange={setFilterStrength}
              minimumValue={0}
              maximumValue={1}
              step={0.01}
              disabled={!isAmbientEnabled}
              minimumTrackTintColor="#34c759"
              maximumTrackTintColor="#3a3a4a"
            />
            <Text style={styles.valueText}>{Math.round(filterStrength * 100)}%</Text>
          </View>

          <View style={styles.sliderGroup}>
            <Text style={styles.label}>🔊 Hearing Boost</Text>
            <Slider
              style={styles.slider}
              value={gain}
              onValueChange={setGain}
              minimumValue={0.5}
              maximumValue={3.0}
              step={0.1}
              disabled={!isAmbientEnabled}
              minimumTrackTintColor="#ff9f4a"
              maximumTrackTintColor="#3a3a4a"
            />
            <Text style={styles.valueText}>{gain.toFixed(1)}x</Text>
          </View>
        </View>

        {/* Recording Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>⏺️ Safety Recording</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.recordBtn, isRecording && styles.recordingActive]}
              onPress={isRecording ? stopRecording : startRecording}
            >
              <Text style={styles.btnText}>{isRecording ? "⏹️ Stop" : "🔴 Start"}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.playBtn} onPress={playRecording}>
              <Text style={styles.btnText}>▶️ Play Last</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Info Card - Green accent */}
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>🎵 Apple Music (or any app) plays in background – ambient mixing works automatically.</Text>
          <Text style={styles.infoTextSmall}>Recording captures microphone only – not your music.</Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Background recording active while screen on. Upgrade to native module for full background.</Text>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#0a0c16',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#8e8e9a',
    marginTop: 4,
  },
  card: {
    backgroundColor: 'rgba(30, 32, 48, 0.95)',
    borderRadius: 28,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(52, 199, 89, 0.2)',
    shadowColor: '#34c759',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
  },
  sliderGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#c4c4ce',
    marginBottom: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  valueText: {
    fontSize: 14,
    color: '#8e8e9a',
    textAlign: 'right',
    marginTop: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
    marginTop: 10,
  },
  recordBtn: {
    flex: 1,
    backgroundColor: '#e74c3c',
    paddingVertical: 14,
    borderRadius: 40,
    alignItems: 'center',
  },
  recordingActive: {
    backgroundColor: '#c0392b',
  },
  playBtn: {
    flex: 1,
    backgroundColor: '#2c3e66',
    paddingVertical: 14,
    borderRadius: 40,
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: 'rgba(52, 199, 89, 0.08)',
    borderRadius: 20,
    padding: 16,
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(52, 199, 89, 0.3)',
  },
  infoText: {
    color: '#34c759',
    fontSize: 13,
    textAlign: 'center',
  },
  infoTextSmall: {
    color: '#5f9e6e',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 6,
  },
  footer: {
    marginTop: 25,
    alignItems: 'center',
  },
  footerText: {
    color: '#555',
    fontSize: 10,
    textAlign: 'center',
  },
});