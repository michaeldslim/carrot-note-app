# Carrot Note App

This React Native app uses Firebase for storing and managing the note list. It allows users to add, read, update, and delete notes from a Firestore database.

### CRUD Operations
1. Create: Ability to add new items to the note list.
2. Read: Fetch and display the list of notes from Firebase in real-time.
3. Update: Toggle the completion status of a note item.
4. Delete: Remove a note item from the list.

### Firebase Firestore
- Use Firestore as the backend to store and manage the note items.

### Real-time Updates
- The app should reflect real-time changes, such as when an item is added, updated, or deleted.

# Project Breakdown

## Firebase Setup
- Set up Firebase in your project and configure it with your project details like API key, project ID, etc.
- Initialize Firestore to interact with the database.

## Package Installation

### if you haven't already, create an Expo project
```npx create-expo-app@latest react-project-name -t expo-template-blank-typescript```

### Install the necessary packages for Firebase and React Navigation:
```
expo install @react-native-firebase/app @react-native-firebase/firestore
expo install @react-navigation/native @react-navigation/stack
expo install react-native-screens react-native-safe-area-context
```

### Set Up Firebase
- Create a new file firebaseConfig.ts and add your Firebase configuration, for example:
```
// firebaseConfig.ts
import { FirebaseOptions, initializeApp } from "@react-native-firebase/app";
import firestore from "@react-native-firebase/firestore";

const firebaseConfig: FirebaseOptions = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};

initializeApp(firebaseConfig);

export const db = firestore();
```
### Configure Metro
- Expo CLI uses Metro (The JavaScript bundler for React Native) to bundle your JavaScript code and assets, and add support for more file extensions.

```
npx expo customize metro.config.js
```
Then, update the file with the following configuration:
```
const { getDefaultConfig } = require('@expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);
defaultConfig.resolver.sourceExts.push('cjs');

module.exports = defaultConfig;
```

### Note List Component
- Define a component (NoteList.tsx) that will handle displaying the list of notes.
- Manage the state of note items and input for new notes.
- Use Firestore to fetch, add, update, and delete note items.
- Render the list of items with options to toggle their completion status and delete them.

### Run the Application
- This project is developed using Android Studio and iOS.

```yarn start```

### Authentication
- Implemented user sign-up, login, and logout functionality using Firebase authentication.

### Environment setup
- Copy `.env.example` to `.env.local` for **local** builds (`expo run:android`, `expo start`).
- Configure `EXPO_PUBLIC_ADMIN_EMAILS` with your master/admin email(s).
- Fill Google OAuth client IDs for Expo/Firebase login:
  - `EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID`
  - `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID`
  - `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`
  - `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`

> **Local vs EAS:** `.env.local` is gitignored and is **not** uploaded to EAS Build. Cloud builds need the same `EXPO_PUBLIC_*` values configured as [EAS environment variables](#eas-environment-variables) (see below).

Example `.env.local`:
```
EXPO_PUBLIC_ADMIN_EMAILS=michaelds.lim@gmail.com
EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID=your-expo-client-id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=your-android-client-id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your-ios-client-id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
```

### Expo prebuild
- To set up the Android and iOS folders for generating IPA and APK files.

#### When initially generating the Android/iOS native project folders
- If you run this command while working, your custom app icons/title will be lost.
- ```npx expo prebuild```

#### Then for each build:
- ```cd android```

- ```./gradlew clean``` # optional

- ```./gradlew assembleRelease```

#### Find the APK file

```android > app > build > outputs > apk > release```

## EAS (Expo Application Services)

This project uses **EAS Build** for cloud builds and **EAS Update** for over-the-air (OTA) JS updates.

### Setup

```bash
# Install EAS CLI globally
npm install -g eas-cli

# Log in to your Expo account
eas login

# Link this project to EAS (first time only)
eas init

# Copy the build config template if you do not have eas.json yet
cp eas.json.example eas.json
```

### EAS environment variables

EAS Build runs in the cloud and **does not receive `.env.local`**. Set the same `EXPO_PUBLIC_*` values in Expo for each build environment:

```bash
# Production (Play Store / internal production builds)
eas env:set --name EXPO_PUBLIC_ADMIN_EMAILS --value "you@example.com" --environment production --visibility plaintext
eas env:set --name EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID --value "YOUR_ID.apps.googleusercontent.com" --environment production --visibility plaintext
eas env:set --name EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID --value "YOUR_ID.apps.googleusercontent.com" --environment production --visibility plaintext
eas env:set --name EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID --value "YOUR_ID.apps.googleusercontent.com" --environment production --visibility plaintext
eas env:set --name EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID --value "YOUR_ID.apps.googleusercontent.com" --environment production --visibility plaintext

# Development (optional — for eas build --profile development)
eas env:set --name EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID --value "YOUR_ID.apps.googleusercontent.com" --environment development --visibility plaintext
eas env:set --name EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID --value "YOUR_ID.apps.googleusercontent.com" --environment development --visibility plaintext
```

List configured variables:

```bash
eas env:list --environment production
```

After adding or changing variables, run a **new** EAS build. OTA updates (`eas update`) only help if the binary was already built with the correct env vars inlined.

### Google Sign-In on EAS Android builds

Local debug builds use your **debug keystore SHA-1**. EAS production builds use a **different signing key**. In [Google Cloud Console](https://console.cloud.google.com/) → Credentials → your **Android** OAuth client (`com.mike008.carrotnote`), add the SHA-1 from EAS:

```bash
eas credentials -p android
```

Copy the **SHA-1 fingerprint** shown for the build profile keystore and add it to the Android OAuth client, then rebuild.

### Build

```bash
# Build for production (Android AAB + iOS IPA)
eas build --platform android --profile production
eas build --platform ios --profile production

# Build both platforms at once
eas build --platform all --profile production
```

> Builds run on Expo's cloud servers. When complete, a download link for the `.aab` / `.ipa` is provided.

### OTA Update (JS-only changes)

Use this instead of a full store release when only JavaScript/assets changed.

```bash
# Push an OTA update to production
eas update --channel production --message "Fix bug / update description"
```

> OTA updates are only delivered to devices whose `runtimeVersion` matches. A new binary build is required when native code changes.

### Channels

| Profile | Channel | Purpose |
|---|---|---|
| `development` | `development` | Dev client builds |
| `production` | `production` | App Store / Play Store |
