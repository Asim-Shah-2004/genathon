import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { Redirect } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Alert, Platform, TouchableOpacity } from 'react-native';

import { Container } from '../components/Container'; // Your custom container component

import { Button } from '~/components/Button';
import { useUserContext } from '~/context/UserProvider';

const API_URL = 'http://192.168.137.100:8000/transcript/api/process_call/';
// const API_URL = 'http://localhost:3000/upload';
const PREVIOUS_FILES_KEY = 'previous-recordings';
const IOS_DOCUMENTS_DIR = FileSystem.documentDirectory; // For iOS-specific path
const UPLOAD_INTERVAL_MS = 60000; // 1 minute interval
const MAX_RETRIES = 3; // Maximum retry attempts
const UPLOAD_DELAY_MS = 60000 * 2;

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
  console.log('Previous files:', previousFiles);
  console.log('Current files:', currentFiles);
  const prevUris = new Set(previousFiles.map((file) => file.uri));
  return currentFiles.filter((file) => !prevUris.has(file.uri));
}

// Helper function to upload audio with retry logic
async function uploadAudio(file, token, onProgress, retries = 0) {
  console.log(`Uploading: ${JSON.stringify(file)}`);

  // Check if the file is already uploaded
  const previousFiles = JSON.parse(await AsyncStorage.getItem(PREVIOUS_FILES_KEY)) || [];
  const isAlreadyUploaded = previousFiles.some((prevFile) => prevFile.uri === file.uri);
  if (isAlreadyUploaded) {
    console.log(`File ${file.name} has already been uploaded. Skipping...`);
    return;
  }

  try {
    const fileInfo = await FileSystem.getInfoAsync(file.uri);
    if (!fileInfo.exists) {
      throw new Error('File does not exist');
    }

    const formData = new FormData();
    formData.append('audio', {
      uri: file.uri,
      type: file.mimeType || 'audio/mpeg',
      name: file.name,
    });

    const response = await axios.post(API_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      validateStatus: (status) => true,
      onUploadProgress: (progressEvent) => {
        const progress = (progressEvent.loaded / progressEvent.total) * 100;
        onProgress && onProgress(progress);
      },
    });

    if (response.status !== 200) {
      throw new Error(`Server returned status ${response.status}`);
    }

    // Add file to the previously uploaded list
    const updatedPreviousFiles = [...previousFiles, file];
    await AsyncStorage.setItem(PREVIOUS_FILES_KEY, JSON.stringify(updatedPreviousFiles));

    return typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
  } catch (error) {
    if (retries < MAX_RETRIES) {
      console.log(`Retrying upload for ${file.name}... Attempt ${retries + 1}`);
      const retryDelay = Math.pow(2, retries) * 1000;
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
      return uploadAudio(file, token, onProgress, retries + 1);
    } else {
      console.error(`Failed to upload ${file.name} after ${MAX_RETRIES} attempts`, error);
      throw error;
    }
  }
}

export default function BackgroundTask() {
  const { loading, isLogged, logout, token } = useUserContext(); // Add token to destructuring
  const [recentUploads, setRecentUploads] = useState([]);
  const [currentUpload, setCurrentUpload] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (!loading && isLogged && token) {
      // Add token check
      initializeTask();
    } else if (!loading && (!isLogged || !token)) {
      // Handle the case where user is not logged in or token is missing
      // console.warn('User not logged in or token missing');
    }
  }, [loading, isLogged, token]);

  if (!loading && (!isLogged || !token)) return <Redirect href="/login" />;

  const initializeTask = async () => {
    try {
      // await AsyncStorage.clear();

      const { status: mediaStatus } = await MediaLibrary.requestPermissionsAsync();
      if (mediaStatus !== 'granted') {
        Alert.alert('Permission Required', 'Media library access is required for this feature.');
        return;
      }

      const files = await AsyncStorage.getItem(PREVIOUS_FILES_KEY);
      console.log('Retrieved previous files:', files);

      if (files) {
        const parsedFiles = JSON.parse(files);
        setRecentUploads(parsedFiles);
      }

      console.log('Task initialized successfully');
      const intervalId = setInterval(startCheckingForNewFiles, UPLOAD_INTERVAL_MS);

      // Cleanup interval on component unmount
      return () => clearInterval(intervalId);
    } catch (error) {
      console.error('Error initializing task:', error);
      Alert.alert('Error', 'Failed to initialize the upload task.');
    }
  };

  const startCheckingForNewFiles = async () => {
    if (!token) {
      console.error('Token is missing, cannot proceed with file check');
      return;
    }

    console.log('Checking for new recordings...');

    try {
      const previousFiles = recentUploads;
      const currentFiles = await getAudioFilesFromDirectory();

      if (!currentFiles) return;

      const newFiles = findNewFiles(currentFiles, previousFiles);

      if (newFiles.length > 0) {
        console.log(`Found ${newFiles.length} new recordings to upload`);

        const updatedPreviousFiles = [...previousFiles];
        for (const file of newFiles) {
          try {
            setCurrentUpload(file.name);
            setUploadProgress(0);

            await uploadAudio(file, token, (progress) => {
              setUploadProgress(progress);
            });

            console.log(`Uploaded: ${file.name}`);
            updatedPreviousFiles.push(file);
            await AsyncStorage.setItem(PREVIOUS_FILES_KEY, JSON.stringify(updatedPreviousFiles));

            // Wait for 2 minutes before processing the next file
            await new Promise((resolve) => setTimeout(resolve, UPLOAD_DELAY_MS));
          } catch (error) {
            if (error.response?.status === 401) {
              Alert.alert('Session Expired', 'Please log in again.');
              await logout();
              return;
            }
            console.error(`Failed to upload ${file.name}:`, error);
          }
        }
        setRecentUploads(updatedPreviousFiles);
      }
    } catch (error) {
      console.error('Error in file check process:', error);
    } finally {
      setCurrentUpload(null);
      setUploadProgress(0);
    }
  };

  const handleUploadAudio = async () => {
    if (!token) {
      Alert.alert('Error', 'You must be logged in to upload files.');
      return;
    }

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        allowMultiSelection: false,
      });

      if (!result.canceled && result.assets?.length > 0) {
        const file = result.assets[0];
        setCurrentUpload(file.name);
        setUploadProgress(0);

        await uploadAudio(
          {
            uri: file.uri,
            name: file.name,
            mimeType: file.mimeType,
          },
          token,
          (progress) => {
            setUploadProgress(progress);
          }
        );

        setRecentUploads((prevUploads) => [...prevUploads, { uri: file.uri, name: file.name }]);
        Alert.alert('Success', 'Your audio file has been uploaded.');
      }
    } catch (error) {
      console.error('Error picking file:', error);
      Alert.alert('Error', 'There was an error uploading the file.');
    } finally {
      setCurrentUpload(null);
      setUploadProgress(0);
    }
  };

  const renderItem = ({ item }) => {
    return (
      <View className="my-1 rounded-lg border-2 border-white bg-cyan-400 p-3">
        <Text numberOfLines={1} className="text-md p-1 font-semibold">
          {item.name}
        </Text>
      </View>
    );
  };

  return (
    <Container className="p-4">
      <View className="mb-4 flex-row items-center justify-between">
        <Text className="my-2 text-4xl text-white">Recent Uploads</Text>
        <TouchableOpacity
          onPress={async () => await logout()}
          className="rounded-full bg-cyan-500 p-2 active:bg-cyan-600">
          <Ionicons name="log-out-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>
      {recentUploads.length > 0 ? (
        <FlatList
          data={recentUploads}
          renderItem={renderItem}
          keyExtractor={(item) => item.uri}
          className="mt-2 rounded-lg"
          contentContainerStyle={{ paddingBottom: 16 }}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
        />
      ) : (
        <Text className="rounded-lg bg-cyan-400 p-4 text-center text-3xl text-black">
          No recent uploads
        </Text>
      )}
      <Button title="Upload Audio" onPress={handleUploadAudio} className="my-5 bg-cyan-500" />
    </Container>
  );
}
