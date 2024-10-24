import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Alert, Platform } from 'react-native';
import axios from 'axios';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Container } from '../components/Container'; // Your custom container component

const API_URL = 'http://192.168.104.139:3000/upload';
const PREVIOUS_FILES_KEY = 'previous-recordings';
const IOS_DOCUMENTS_DIR = FileSystem.documentDirectory; // For iOS-specific path

const UPLOAD_INTERVAL_MS = 60000; // 1 minute interval

// Helper function to get audio files from the directory
async function getAudioFilesFromDirectory() {
  try {
    let audioFiles = [];

    if (Platform.OS === 'android') {
      const media = await MediaLibrary.getAssetsAsync({
        mediaType: 'audio',
        first: 100,
      });

      const regex = /call recording/i;
      audioFiles = media.assets
        .filter((asset) => regex.test(asset.filename))
        .map((asset) => ({
          uri: asset.uri,
          name: asset.filename,
          mimeType: 'audio/mpeg',
        }));
    } else {
      const dirContent = await FileSystem.readDirectoryAsync(IOS_DOCUMENTS_DIR);

      const audioExtensions = ['.mp3', '.m4a', '.wav', '.aac'];
      const audioFileNames = dirContent.filter(
        (filename) =>
          audioExtensions.some((ext) => filename.toLowerCase().endsWith(ext)) &&
          /call recording/i.test(filename)
      );

      audioFiles = await Promise.all(
        audioFileNames.map(async (filename) => {
          const uri = `${IOS_DOCUMENTS_DIR}${filename}`;
          return {
            uri,
            name: filename,
            mimeType: 'audio/mpeg',
          };
        })
      );
    }

    return audioFiles;
  } catch (error) {
    console.error('Error reading directory:', error);
    return null;
  }
}

// Helper function to find new files
function findNewFiles(currentFiles, previousFiles) {
  const prevUris = new Set(previousFiles.map((file) => file.uri));
  return currentFiles.filter((file) => !prevUris.has(file.uri));
}

// Helper function to upload audio
async function uploadAudio(file) {
  try {
    const fileInfo = await FileSystem.getInfoAsync(file.uri);
    if (!fileInfo.exists) {
      throw new Error('File does not exist');
    }

    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      type: file.mimeType || 'audio/mpeg',
      name: file.name,
    });

    const response = await axios.post(API_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Accept: 'application/json',
      },
      validateStatus: (status) => true,
    });

    if (response.status !== 200) {
      throw new Error(`Server returned status ${response.status}`);
    }

    return typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
}

// React component to display recent uploads
export default function Input() {
  const [recentUploads, setRecentUploads] = useState([]);

  useEffect(() => {
    initializeTask();
  }, []);

  const initializeTask = async () => {
    try {
      const { status: mediaStatus } = await MediaLibrary.requestPermissionsAsync();
      if (mediaStatus !== 'granted') {
        console.error('Media library permission not granted');
        return;
      }

      const initialFiles = await getAudioFilesFromDirectory();
      if (initialFiles) {
        await AsyncStorage.setItem(PREVIOUS_FILES_KEY, JSON.stringify(initialFiles));
      }

      console.log('Task initialized successfully');
      startCheckingForNewFiles();
    } catch (error) {
      console.error('Error initializing task:', error);
    }
  };

  const startCheckingForNewFiles = () => {
    setTimeout(async () => {
      console.log('Checking for new recordings...');

      const previousFilesJson = await AsyncStorage.getItem(PREVIOUS_FILES_KEY);
      const previousFiles = previousFilesJson ? JSON.parse(previousFilesJson) : [];

      const currentFiles = await getAudioFilesFromDirectory();
      if (!currentFiles) return;

      const newFiles = findNewFiles(currentFiles, previousFiles);

      if (newFiles.length > 0) {
        console.log(`Found ${newFiles.length} new recordings to upload`);

        for (const file of newFiles) {
          try {
            await uploadAudio(file);
            console.log(`Uploaded: ${file.name}`);
          } catch (error) {
            console.error(`Failed to upload ${file.name}:`, error);
          }
        }

        const updatedPreviousFiles = [...previousFiles, ...newFiles];
        await AsyncStorage.setItem(PREVIOUS_FILES_KEY, JSON.stringify(updatedPreviousFiles));

        setRecentUploads(currentFiles); // Update recent uploads
      }

      // Recursively call to keep checking every 1 minute
      startCheckingForNewFiles();
    }, UPLOAD_INTERVAL_MS);
  };

  const renderItem = ({ item }) => {
    return (
      <View style={{ marginVertical: 8, padding: 12, backgroundColor: '#f5f5f5', borderRadius: 8 }}>
        <Text numberOfLines={1} style={{ marginBottom: 8 }}>
          {item.name}
        </Text>
      </View>
    );
  };

  return (
    <Container>
      <View className="p-4">
        <Text className="text-lg font-semibold mb-4">Recent Uploads</Text>
        {recentUploads.length > 0 ? (
          <FlatList
            data={recentUploads}
            renderItem={renderItem}
            keyExtractor={(item) => item.uri}
            style={{ marginTop: 16 }}
          />
        ) : (
          <Text className="text-center text-gray-500">No recent uploads</Text>
        )}
      </View>
    </Container>
  );
}
