import React, { useEffect, useState } from 'react';
import { PermissionsAndroid, Text, TouchableWithoutFeedback, View } from 'react-native';
import AudioRecord from 'react-native-audio-record';
import CallDetectorManager from 'react-native-call-detection';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

const App = () => {
  const [featureOn, setFeatureOn] = useState(false);
  const [incoming, setIncoming] = useState(false);
  const [number, setNumber] = useState(null);

  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  useEffect(() => {
    askPermission();
  }, []);

  const askPermission = async () => {
    try {
      const permissions = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.READ_CALL_LOG,
        PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      ]);
      console.log('Permissions are:', permissions);
    } catch (err) {
      console.warn(err);
    }
  };

  const startRecording = () => {
    AudioRecord.init({
      sampleRate: 16000,
      channels: 1,
      bitsPerSample: 16,
      audioSource: 6,
    });
    AudioRecord.start();
    console.log('Recording started...');
  };

  const stopRecording = async () => {
    const audioFile = await AudioRecord.stop();
    console.log('Recording stopped. Audio file saved at:', audioFile);
  };

  const startListenerTapped = () => {
    setFeatureOn(true);
    const callDetector = new CallDetectorManager(
      (event, number) => {
        console.log(event, number);
        if (event === 'Disconnected') {
          stopRecording();
          setIncoming(false);
          setNumber(null);
        } else if (event === 'Incoming') {
          startRecording();
          setIncoming(true);
          setNumber(number);
        } else if (event === 'Offhook') {
          setIncoming(true);
          setNumber(number);
        } else if (event === 'Missed') {
          setIncoming(false);
          setNumber(null);
        }
      },
      true,
      () => {},
      {
        title: 'Phone State Permission',
        message: 'This app needs access to your phone state for call detection.',
      }
    );
  };

  const stopListenerTapped = () => {
    callDetector && callDetector.dispose();
    setFeatureOn(false);
    setIncoming(false);
  };

  const handlePressIn = () => {
    scale.value = withSpring(0.8);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
    featureOn ? stopListenerTapped() : startListenerTapped();
  };

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-2xl font-bold">Call Detection</Text>
      <Text className="py-4 text-xl">Should the detection be on?</Text>

      <TouchableWithoutFeedback onPressIn={handlePressIn} onPressOut={handlePressOut}>
        <Animated.View
          style={[
            animatedStyle,
            {
              width: 200,
              height: 200,
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 100,
              backgroundColor: featureOn ? 'blue' : 'red',
            },
          ]}>
          <Text className="text-lg font-bold text-white">{featureOn ? 'ON' : 'OFF'}</Text>
        </Animated.View>
      </TouchableWithoutFeedback>

      {incoming && <Text className="text-5xl text-red-500">Call arahi h {number}</Text>}
    </View>
  );
};

export default App;
