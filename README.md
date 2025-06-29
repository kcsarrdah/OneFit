# OneFit
All-in-one fitness tracker with comprehensive fasting management.

## Prerequisites
- Xcode installed (iOS)
- Android Studio installed (Android)
- Node.js and npm installed
- Java 17+ for Android builds
- Go 1.16+ for backend

## Backend Setup

1. **Start the backend server**:
   ```bash
   cd backend
   go run main.go
   ```
   Server will start on port 8080.



## Frontend Setup

### Start the app

   ```bash
   npx expo start
   ```

### iOS Setup & Running

1. **Start iOS simulator (iOS 17.x recommended, make sure you have xcode and the emulator installed)**:
   ```bash
   xcrun simctl boot "iPhone 14"
   ```
   or start a simulatore manually from xcode

2. **Install Expo Go in simulator**:
   - Open App Store in simulator
   - Search & install "Expo Go"

3. **Run in Expo Go mode**:
   ```bash
   cd frontend
   EXPO_USE_EXPO_GO=true npm start
   # Press 's' to switch to Expo Go mode
   # Press 'i' to open in iOS simulator
   ```

### Android Setup & Running

1. **Set JAVA_HOME to Java 17+**:
   ```bash
   export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home
   ```

2. **Start Android emulator**:
   make sure you have Android Studio and the correct emulator installed
   ```bash
   # List available emulators
   emulator -list-avds
   # Start emulator
   emulator -avd [EMULATOR_NAME]
   ```
   or start the emulator manually

3. **Run in Expo Go mode**:
   ```bash
   cd frontend
   EXPO_USE_EXPO_GO=true npm start
   # Press 's' to switch to Expo Go mode
   # Press 'a' to open in Android emulator
   ```

### Alternative: Web Development
```bash
cd frontend
npm start
# Press 'w' to open in web browser
```