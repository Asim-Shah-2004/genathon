import axios from 'axios';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { Stack } from 'expo-router';
import { useState, useEffect } from 'react';
import { View, Text, Alert, Button, FlatList, Platform } from 'react-native';
import Animated from 'react-native-reanimated';

import { Container } from '~/components/Container';

//ip addr

const API_URL = 'http://xxx.xxx.xxx.xx:3000/upload';

export default function Input() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});

  const requestPermissions = async () => {
    try {
      const mediaPermission = await MediaLibrary.requestPermissionsAsync();
      if (mediaPermission.status !== 'granted') {
        Alert.alert('Permission denied', 'You need to enable permission to access media files.');
      }
    } catch (error) {
      console.error('Permission request error:', error);
      Alert.alert('Error', 'Failed to request permissions');
    }
  };

  useEffect(() => {
    requestPermissions();
  }, []);

  const pickAudio = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
        multiple: true,
      });

      if (result.canceled) {
        return;
      }

      setUploading(true);
      const newFiles = result.assets;
      setSelectedFiles((prev) => [...prev, ...newFiles]);

      // Upload files sequentially
      for (const file of newFiles) {
        try {
          await uploadAudio(file);
        } catch (error) {
          console.error(`Failed to upload ${file.name}:`, error);
          // Continue with next file even if one fails
        }
      }
    } catch (error) {
      console.error('File picking error:', error);
      Alert.alert('Error', 'An error occurred while selecting the audio files.');
    } finally {
      setUploading(false);
    }
  };

  const uploadAudio = async (file) => {
    try {
      // First, check if the file exists
      const fileInfo = await FileSystem.getInfoAsync(file.uri);
      if (!fileInfo.exists) {
        throw new Error('File does not exist');
      }

      // Create FormData manually
      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        type: file.mimeType || 'audio/mpeg',
        name: file.name
      });

      // Log upload attempt
      console.log('Attempting upload:', {
        uri: file.uri,
        name: file.name,
        type: file.mimeType,
        size: fileInfo.size
      });

      // Use axios instead of FileSystem.uploadAsync for better control
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
        validateStatus: (status) => true, // Don't reject any status codes
      });

      // Check response status
      if (response.status !== 200) {
        throw new Error(`Server returned status ${response.status}`);
      }

      // Try to parse response as JSON
      let result;
      try {
        result = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
      } catch (error) {
        console.warn('Response is not JSON:', response.data);
        result = { message: 'File uploaded but response format unexpected' };
      }

      console.log('Upload successful:', result);
      return result;

    } catch (error) {
      console.error('Upload error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      let errorMessage = `Failed to upload ${file.name}. `;
      
      if (error.response) {
        // Server responded with non-200 status
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
        // Request made but no response
        errorMessage += 'No response from server. Check your connection.';
      } else {
        // Error before making request
        errorMessage += error.message;
      }

      Alert.alert('Upload Failed', errorMessage);
      
      // Set progress to 0 for failed upload
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