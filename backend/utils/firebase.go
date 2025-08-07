package utils

import (
	"context"
	"fmt"
	"log"

	"sync"

	firebase "firebase.google.com/go/v4"
	"firebase.google.com/go/v4/auth"
	"google.golang.org/api/option"
)

// ... other imports

var firebaseApp *firebase.App
var authClient *auth.Client
var initOnce sync.Once
var initError error

// InitFirebase initializes the Firebase Admin SDK
func InitFirebase() error {
	ctx := context.Background()

	// Initialize Firebase Admin SDK
	serviceAccountKey := "serviceAccountKey.json" // We'll set this up next
	opt := option.WithCredentialsFile(serviceAccountKey)

	app, err := firebase.NewApp(ctx, nil, opt)
	if err != nil {
		return fmt.Errorf("error initializing firebase app: %v", err)
	}

	client, err := app.Auth(ctx)
	if err != nil {
		return fmt.Errorf("error getting firebase auth client: %v", err)
	}

	firebaseApp = app
	authClient = client
	log.Println("✅ Firebase initialized successfully")
	return nil
}

// VerifyFirebaseToken validates a Firebase ID token and returns the user info
func VerifyFirebaseToken(idToken string) (*auth.Token, error) {
	ctx := context.Background()

	if authClient == nil {
		return nil, fmt.Errorf("firebase not initialized")
	}

	token, err := authClient.VerifyIDToken(ctx, idToken)
	if err != nil {
		return nil, fmt.Errorf("error verifying ID token: %v", err)
	}

	return token, nil
}

// GetFirebaseUser gets user info from Firebase by UID
func GetFirebaseUser(uid string) (*auth.UserRecord, error) {
	ctx := context.Background()

	if authClient == nil {
		return nil, fmt.Errorf("firebase not initialized")
	}

	user, err := authClient.GetUser(ctx, uid)
	if err != nil {
		return nil, fmt.Errorf("error getting user: %v", err)
	}

	return user, nil
}
