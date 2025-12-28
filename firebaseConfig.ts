/*
 Copyright (C) 2025 Michael Lim - Carrot Note App 
 This software is free to use, modify, and share under 
 the terms of the GNU General Public License v3.
*/
import { initializeApp, getApp } from 'firebase/app';
import {
  initializeAuth,
  getReactNativePersistence,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBT5vfkHZXwgW1Fenpkc6Xzaj0i1Ss41NA",
  authDomain: "notefireapp-189c8.firebaseapp.com",
  projectId: "notefireapp-189c8",
  storageBucket: "notefireapp-189c8.firebasestorage.app",
  messagingSenderId: "985162690720",
  appId: "1:985162690720:web:9e0a6a0529951e5bb559c5",
  measurementId: "G-SVTLJ2CDPT",
};

// Reuse existing app if already initialized under our custom name
const APP_NAME = 'carrot-note-app';

let app;
try {
  app = getApp(APP_NAME);
} catch {
  app = initializeApp(firebaseConfig, APP_NAME);
}

export const FIREBASE_APP = app;
export const FIRESTORE_DB = getFirestore(FIREBASE_APP);
export const FIREBASE_AUTH = initializeAuth(FIREBASE_APP, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});
