# OneFit
All-in-one fitness tracker (workouts, meals, fasting, water, recovery) where logging takes a swipe, not a form.

**Start here:** [CLAUDE.md](CLAUDE.md) holds the rules every contributor and agent follows:
design first on the [OneFit Design canvas](https://claude.ai/artifact/PVCEjWyKi7SqwGjEEtWEJH)
(it mirrors the app at all times), document every file, keep code modular, and ship with
[Graphite stacked PRs](Rules_for_adding_Features.md). Product context lives in [PRODUCT.md](PRODUCT.md)
and the design system in [DESIGN.md](DESIGN.md).

## Prerequisites
- Xcode installed (iOS)
- Android Studio installed (Android)
- Node.js and npm installed
- Java 17+ for Android builds
- Go 1.23+ for backend

## Project layout

- `backend/` — Go (Gin) API shared by every client. Per-file docs and the API reference: [backend/docs](backend/docs/README.md)
- `frontend/` — Expo / React Native mobile app. Per-file docs: [frontend/docs](frontend/docs/README.md)
- `web/` — React + TypeScript web app (Muscle Explorer). See [web/README.md](web/README.md) and [web/docs](web/docs/README.md)

Each `docs/` folder mirrors its source tree with one Markdown file per source and test file,
updated in the same PR as the code.

## Contributing

```bash
npm install -g @withgraphite/graphite-cli && gt auth --token <token>
gt sync && gt create -m "feat(app): …" && gt submit --stack
```

See [Rules_for_adding_Features.md](Rules_for_adding_Features.md) for the full workflow.

## Backend Setup

### Environment Configuration

The backend uses environment variables for configuration. Create a `.env` file in the `backend/` directory:

```bash
cd backend
cp .env.example .env  # or create manually
```

**Environment Variables:**
- `PORT` - Server port (default: 3000)
- `CORS_ORIGINS` - Comma-separated allowed origins (default: http://localhost:3000)
- `FIREBASE_CREDENTIALS_PATH` - Path to Firebase service account key (default: serviceAccountKey.json)
- `GIN_MODE` - Gin framework mode: `debug` or `release`

### Development vs Production Mode

**Development Mode (default):**
```bash
GIN_MODE=debug
```
- Detailed logging and error messages
- Test user auto-creation
- Development-friendly features enabled

**Production Mode:**
```bash
GIN_MODE=release
```
- Optimized performance
- Minimal logging
- No test user creation
- Production-ready configuration

1. **Start the backend server**:
   ```bash
   cd backend
   go run main.go
   ```
   Server will start on the configured port (default: 3000).

2. **For production deployment**:
   ```bash
   cd backend
   GIN_MODE=release go run main.go
   ```


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
### Tests and checks

```bash
cd frontend
npx jest                 # unit tests
npx tsc --noEmit         # type-check
npx expo lint            # lint
```

More on the app's structure (features, UI library, theme): [frontend/README.md](frontend/README.md).
