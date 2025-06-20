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

2. **Available fasting endpoints**:
   - `GET /api/fasting/current` - Get current fast status
   - `POST /api/fasting/start` - Start fast
   - `POST /api/fasting/stop` - Stop fast
   - `GET /api/fasting/history` - Get fasting history

## Frontend Setup

### iOS Setup & Running

1. **Start iOS simulator (iOS 17.x recommended)**:
   ```bash
   xcrun simctl boot "iPhone 14"
   ```

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
   ```bash
   # List available emulators
   emulator -list-avds
   # Start emulator
   emulator -avd [EMULATOR_NAME]
   ```

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

## Troubleshooting
- For "No development build" error: Press 's' to switch to Expo Go mode
- For iOS 18.x+ compatibility issues: Use iOS 17.x simulator
- For Java version errors: Ensure Java 17+ is set in PATH and JAVA_HOME
```I'll update the project's README.md with the frontend quick start guide:Now I'll write the file:Let me create the updated README.md file:Now I'll write the updated README.md file:

```markdown
# OneFit
All-in-one fitnesseFit
All-in-one fitnessanagement support tracker with fasting management support
-) Xcode installed (iOS)alled (Android)
-
- Android Studio installed (Android)
-npm installed for
- Go 1.16 Android builds
- Go 1.16 for backend

## Backenup

1. **Start**: the backend server**:end
   ```bash
   cd backendrun main.gowill start on port
   ```
   Server will start on portvailablefasting endpoints**:T /current` - Get currentapi/fasting/current` - Get current - `i/ft` - Start fastasting/start` - Start fast  - `POST /api/fasting`/stop` - Stop fast
   - ` -asting/history` -ory

## Frontend Setup

### Get fasting history

## Frontend Setup

### Running

1. **Startor (iOS 17.x recommended)**: simctl boot
   ```bash
   xcrun simctl bootl
   ```

2. **Install**:
   - Expo Go in simulator**:
   -   - Search Open App Store in simulator
   - Search*Run in*: Expo Go mode**:d fronten
   ```bash
   cd frontenE_EXPO_GO=true # npm start
   #witch Press 's' to switch# to Expo Go mode
   # Press 'i' to open inmulatorndroid Setup &
   ```

### Android Setup &1. **Set_HOME to   ```bash Java 17+**:
   ```bash   export JAVA_HOME=/mebrew/optnjdk@17/jdk.libexec/openjdk.ejdk/Contents/Home ```

2. **emulator**:Start Android emulator**:sh
   #emulators List available emulatorslator -listmulator
   emulator
   # Start emulator
   emulatorME]Run
   ```

3. **Run*: in Expo Go mode**:ashtend
   EXPO_USE_
   cd frontend
   EXPO_USE_O=true npm starttch to
   # Press 's' to switch to to open in Androi
   # Press 'a' to open in Androie: Web Development
   ```

### Alternative: Web Developmentm start
# Presso openser
```

## in web browser
```

##Troubleshooting
- For" error: "No development build" error:'s' to switch to 18.x+ compatibility issues: Expo Go mode
- For iOS 18.x+ compatibility issues: For Java version errorsEnsure Java 17+ is setn PATH and JAVA_HOME