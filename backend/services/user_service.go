package services

import (
	"onefit/backend/models"

	"gorm.io/gorm"
)

type UserService struct {
	db *gorm.DB
}

func NewUserService(db *gorm.DB) *UserService {
	return &UserService{db: db}
}

// GetOrCreateUserByFirebaseUID finds existing user or creates new one
func (us *UserService) GetOrCreateUserByFirebaseUID(firebaseUID, email, name string) (*models.User, error) {
	var user models.User

	// Try to find existing user by Firebase UID
	result := us.db.Where("firebase_uid = ?", firebaseUID).First(&user)
	if result.Error == nil {
		// User exists, return it
		return &user, nil
	}

	if result.Error != gorm.ErrRecordNotFound {
		// Database error
		return nil, result.Error
	}

	// User doesn't exist, create new one
	user = models.User{
		FirebaseUID: firebaseUID,
		Email:       email,
		Name:        name,
	}

	if err := us.db.Create(&user).Error; err != nil {
		return nil, err
	}

	return &user, nil
}

// GetUserByFirebaseUID gets user by Firebase UID
func (us *UserService) GetUserByFirebaseUID(firebaseUID string) (*models.User, error) {
	var user models.User
	if err := us.db.Where("firebase_uid = ?", firebaseUID).First(&user).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

// UpdateUser updates user profile
func (us *UserService) UpdateUser(user *models.User) error {
	return us.db.Save(user).Error
}
