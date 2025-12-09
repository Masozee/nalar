import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Animated } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { faceCheckIn, faceCheckOut } from '@/lib/api/hr';

type AttendanceMode = 'check-in' | 'check-out';

export default function AttendanceScreen() {
  const [facing, setFacing] = useState<CameraType>('front');
  const [permission, requestPermission] = useCameraPermissions();
  const [locationPermission, requestLocationPermission] = Location.useForegroundPermissions();
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<AttendanceMode>('check-in');
  const [scanAnimation] = useState(new Animated.Value(0));
  const cameraRef = useRef<any>(null);

  useEffect(() => {
    // Start scan line animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnimation, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scanAnimation, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  if (!permission) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <Text>Loading...</Text>
        </View>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.title}>Camera Permission Required</Text>
          <Text style={styles.message}>
            We need access to your camera for face recognition attendance.
          </Text>
          <TouchableOpacity style={styles.button} onPress={requestPermission}>
            <Text style={styles.buttonText}>Grant Camera Permission</Text>
          </TouchableOpacity>
          {!locationPermission?.[0]?.granted && (
            <TouchableOpacity
              style={[styles.button, { marginTop: 10 }]}
              onPress={() => requestLocationPermission?.()}
            >
              <Text style={styles.buttonText}>Grant Location Permission</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  const processAttendance = async () => {
    if (!cameraRef.current || isLoading) return;

    try {
      setIsLoading(true);

      // Take photo
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });

      // Get token
      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        Alert.alert('Error', 'Not authenticated. Please log in again.');
        router.replace('/login');
        return;
      }

      // Get location (optional)
      let location;
      try {
        if (locationPermission?.[0]?.granted) {
          const loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          location = {
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          };
        }
      } catch (error) {
        console.log('Location not available:', error);
      }

      // Call appropriate API
      const result = mode === 'check-in'
        ? await faceCheckIn(photo.uri, token, location)
        : await faceCheckOut(photo.uri, token, location);

      if (result.success) {
        const checkTime = mode === 'check-in'
          ? result.attendance.check_in
          : result.attendance.check_out;

        const time = checkTime ? new Date(checkTime).toLocaleTimeString() : '';

        Alert.alert(
          'Success!',
          `${result.message}\n\nTime: ${time}\nConfidence: ${result.confidence.toFixed(1)}%`,
          [
            {
              text: 'OK',
              onPress: () => router.replace('/(tabs)'),
            },
          ]
        );
      }
    } catch (error: any) {
      console.error('Attendance error:', error);

      let message = 'Failed to process attendance. Please try again.';
      if (error.response?.data?.error) {
        message = error.response.data.error;
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.response?.data?.face_image) {
        message = error.response.data.face_image[0];
      }

      Alert.alert('Attendance Failed', message);
    } finally {
      setIsLoading(false);
    }
  };

  const scanLineTranslateY = scanAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [-175, 175], // Half of face guide height (350/2)
  });

  return (
    <View style={styles.container}>
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          disabled={isLoading}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Face Attendance</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.modeSelector}>
        <TouchableOpacity
          style={[
            styles.modeButton,
            mode === 'check-in' && styles.modeButtonActive,
          ]}
          onPress={() => setMode('check-in')}
          disabled={isLoading}
        >
          <Text
            style={[
              styles.modeButtonText,
              mode === 'check-in' && styles.modeButtonTextActive,
            ]}
          >
            Check In
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.modeButton,
            mode === 'check-out' && styles.modeButtonActive,
          ]}
          onPress={() => setMode('check-out')}
          disabled={isLoading}
        >
          <Text
            style={[
              styles.modeButtonText,
              mode === 'check-out' && styles.modeButtonTextActive,
            ]}
          >
            Check Out
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing={facing}
        >
          <View style={styles.overlay}>
            <View style={styles.faceGuide}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />

              {!isLoading && (
                <Animated.View
                  style={[
                    styles.scanLine,
                    {
                      transform: [{ translateY: scanLineTranslateY }],
                    },
                  ]}
                />
              )}
            </View>

            <Text style={styles.guideText}>
              Position your face in the frame
            </Text>
          </View>
        </CameraView>
      </View>

      <View style={styles.controls}>
        <View style={styles.captureContainer}>
          <TouchableOpacity
            style={[styles.captureButton, isLoading && styles.captureButtonDisabled]}
            onPress={processAttendance}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="large" />
            ) : (
              <View
                style={[
                  styles.captureButtonInner,
                  { backgroundColor: mode === 'check-in' ? '#00FF00' : '#FF6B6B' },
                ]}
              />
            )}
          </TouchableOpacity>
          <Text style={styles.captureText}>
            {isLoading ? 'Processing...' : mode === 'check-in' ? 'Check In' : 'Check Out'}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 10,
    paddingHorizontal: 20,
    backgroundColor: '#000',
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 15,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
  },
  modeSelector: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 4,
    marginHorizontal: 20,
    marginBottom: 10,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  modeButtonActive: {
    backgroundColor: '#005357',
  },
  modeButtonText: {
    color: '#999',
    fontSize: 16,
    fontWeight: '600',
  },
  modeButtonTextActive: {
    color: '#fff',
  },
  cameraContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  faceGuide: {
    width: 250,
    height: 350,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#00FF00',
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderBottomWidth: 0,
    borderRightWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderTopWidth: 0,
    borderRightWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    height: 2,
    backgroundColor: '#00FF00',
    shadowColor: '#00FF00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  guideText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 20,
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  controls: {
    backgroundColor: '#000',
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  captureContainer: {
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  captureText: {
    color: '#fff',
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#005357',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
