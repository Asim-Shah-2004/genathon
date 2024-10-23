import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { Stack } from 'expo-router';
import { useState, useEffect } from 'react';
import { View, Text, Alert, Button, FlatList, Platform } from 'react-native';
import Animated from 'react-native-reanimated';

import { Container } from '~/components/Container';

const API_URL = 'http://192.168.104.139:3000/upload';

// Directory paths for different platforms
const ANDROID_MUSIC_DIR = "/storage/emulated/0/CallRecordings"; // Standard Android music directory
const IOS_DOCUMENTS_DIR = FileSystem.documentDirectory;

export default function Input() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});

  const requestPermissions = async () => {
    try {
      const mediaPermission = await MediaLibrary.requestPermissionsAsync();
      if (mediaPermission.status !== 'granted') {
        Alert.alert('Permission denied', 'You need to enable permission to access media files.');
        return false;
      }
      
      // For Android, we need additional storage permission
      if (Platform.OS === 'android') {
        // On Android 10 and above, we need to use MediaLibrary
        // On older versions, this will handle file system permissions
        const { status } = await MediaLibrary.getPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission denied', 'Storage access is required to read audio files.');
          return false;
        }
      }
      return true;
    } catch (error) {
      console.error('Permission request error:', error);
      Alert.alert('Error', 'Failed to request permissions');
      return false;
    }
  };

  const getAudioFilesFromDirectory = async () => {
    try {
      const hasPermissions = await requestPermissions();
      if (!hasPermissions) return;

      let audioFiles = [];

      if (Platform.OS === 'android') {
        // For Android, use MediaLibrary to get audio files
        const media = await MediaLibrary.getAssetsAsync({
          mediaType: 'audio',
          first: 100, // Limit the number of files to process
        });
        
        audioFiles = media.assets.map(asset => ({
          uri: asset.uri,
          name: asset.filename,
          mimeType: 'audio/mpeg', // Default to mp3, adjust if needed
        }));
      } else {
        // For iOS, read from documents directory
        const dirContent = await FileSystem.readDirectoryAsync(IOS_DOCUMENTS_DIR);
        
        // Filter for audio files (add more extensions if needed)
        const audioExtensions = ['.mp3', '.m4a', '.wav', '.aac'];
        const audioFileNames = dirContent.filter(filename => 
          audioExtensions.some(ext => filename.toLowerCase().endsWith(ext))
        );

        audioFiles = await Promise.all(audioFileNames.map(async filename => {
          const uri = `${IOS_DOCUMENTS_DIR}${filename}`;
          return {
            uri,
            name: filename,
            mimeType: 'audio/mpeg', // You might want to determine this based on file extension
          };
        }));
      }

      if (audioFiles.length === 0) {
        Alert.alert('No Files Found', 'No audio files found in the specified directory.');
        return;
      }

      setSelectedFiles(audioFiles);
      return audioFiles;
    } catch (error) {
      console.error('Error reading directory:', error);
      Alert.alert('Error', 'Failed to read audio files from directory');
      return [];
    }
  };

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) {
      Alert.alert('No Files', 'No audio files selected for upload.');
      return;
    }

    setUploading(true);

    try {
      // Upload files sequentially
      for (const file of selectedFiles) {
        try {
          await uploadAudio(file);
        } catch (error) {
          console.error(`Failed to upload ${file.name}:`, error);
          // Continue with next file even if one fails
        }
      }
    } catch (error) {
      console.error('Upload process error:', error);
    } finally {
      setUploading(false);
    }
  };

  const uploadAudio = async (file) => {
    try {
      const fileInfo = await FileSystem.getInfoAsync(file.uri);
      if (!fileInfo.exists) {
        throw new Error('File does not exist');
      }

      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        type: file.mimeType || 'audio/mpeg',
        name: file.name
      });

      const response = await axios.post(API_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(prev => ({
            ...prev,
            [file.uri]: progress
          }));
        },
        validateStatus: (status) => true,
      });

      if (response.status !== 200) {
        throw new Error(`Server returned status ${response.status}`);
      }

      let result = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
      console.log('Upload successful:', result);
      return result;

    } catch (error) {
      console.error('Upload error:', error);
      let errorMessage = `Failed to upload ${file.name}. `;
      
      if (error.response) {
        if (error.response.status === 413) {
          errorMessage += 'File is too large for the server.';
        } else if (error.response.status === 415) {
          errorMessage += 'File type not supported.';
        } else if (error.response.status === 500) {
          errorMessage += 'Server error occurred.';
        } else {
          errorMessage += `Server error: ${error.response.status}`;
        }
      } else if (error.request) {
        errorMessage += 'No response from server. Check your connection.';
      } else {
        errorMessage += error.message;
      }

      Alert.alert('Upload Failed', errorMessage);
      setUploadProgress(prev => ({
        ...prev,
        [file.uri]: 0
      }));
      throw error;
    }
  };

  const renderItem = ({ item }) => {
    const progress = uploadProgress[item.uri] || 0;

    return (
      <View style={{ marginVertical: 8, padding: 12, backgroundColor: '#f5f5f5', borderRadius: 8 }}>
        <Text numberOfLines={1} style={{ marginBottom: 8 }}>{item.name}</Text>
        <Animated.View
          style={{
            height: 8,
            backgroundColor: progress === 100 ? '#4CAF50' : '#2196F3',
            width: `${progress}%`,
            borderRadius: 4,
          }}
        />
        <Text style={{ marginTop: 4, textAlign: 'right' }}>{`${progress}%`}</Text>
      </View>
    );
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Input' }} />
      <Container>
        <View className="p-4">
          <Button
            title="Load Audio Files"
            onPress={getAudioFilesFromDirectory}
            disabled={uploading}
          />
          {selectedFiles.length > 0 && (
            <>
              <Button
                title={uploading ? 'Uploading...' : 'Upload Selected Files'}
                onPress={uploadFiles}
                disabled={uploading}
              />
              <FlatList
                data={selectedFiles}
                renderItem={renderItem}
                keyExtractor={(item) => item.uri}
                style={{ marginTop: 16 }}
              />
            </>
          )}
        </View>
      </Container>
    </>
  );
}