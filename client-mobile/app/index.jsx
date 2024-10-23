import axios from 'axios';
import * as DocumentPicker from 'expo-document-picker';
import * as MediaLibrary from 'expo-media-library';
import { Stack } from 'expo-router';
import { useState, useEffect } from 'react';
import { View, Text, Alert, Button, FlatList } from 'react-native';
import Animated, { Easing } from 'react-native-reanimated';

import { Container } from '~/components/Container';

export default function Input() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});

  const requestAudioPermission = async () => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'You need to enable permission to access audio files.');
    }
  };

  useEffect(() => {
    requestAudioPermission();
  }, []);

  const pickAudio = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
        multiple: true, // Enable multiple file selection
      });

      if (result.canceled) {
        return;
      }

      // Handle multiple files
      const newFiles = result.assets;
      setSelectedFiles((prev) => [...prev, ...newFiles]);

      // Upload all new files
      await Promise.all(newFiles.map(uploadAudio));
    } catch (error) {
      console.error(error.message);
      Alert.alert('Error', 'An error occurred while selecting the audio files.');
    }
  };

  const uploadAudio = async (file) => {
    const formData = new FormData();
    formData.append('file', {
      uri: file,
      name: file.name,
      type: file.mimeType || 'audio/mpeg',
    });

    console.log('File Name:', file.name);
    console.log('File URI:', file.uri);
    console.log('File Type:', file.mimeType || 'audio/mpeg');
    console.log(`Uploading ${file.name}...`);

    try {
      const response = await axios.post('http://localhost:3000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress((prev) => ({
            ...prev,
            [file.uri]: percentage, // Use file URI as unique identifier
          }));
        },
      });
      console.log(`Upload successful for ${file.name}:`, response.data);
    } catch (error) {
      console.error(`Upload failed for ${file.name}:`, error);
      Alert.alert('Upload Failed', `Failed to upload ${file.name}`);
    }
  };

  const renderItem = ({ item }) => {
    const progress = uploadProgress[item.uri] || 0;

    return (
      <View style={{ marginVertical: 8 }}>
        <Text>{item.name}</Text>
        <Animated.View
          style={{
            height: 10,
            backgroundColor: 'blue',
            width: `${progress}%`,
            borderRadius: 5,
            transition: {
              duration: 500,
              easing: Easing.out(Easing.exp),
            },
          }}
        />
        <Text>{`${progress}%`}</Text>
      </View>
    );
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Input' }} />
      <Container>
        <View className="p-4">
          <Button
            title={uploading ? 'Uploading...' : 'Pick audio files'}
            onPress={pickAudio}
            disabled={uploading}
          />
          {selectedFiles.length > 0 && (
            <FlatList
              data={selectedFiles}
              renderItem={renderItem}
              keyExtractor={(item) => item.uri}
              style={{ marginTop: 16 }}
            />
          )}
        </View>
      </Container>
    </>
  );
}
