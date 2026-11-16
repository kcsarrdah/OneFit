package services

import (
	"errors"
	"fmt"
)

// Error kinds that controllers map to HTTP status codes. Service errors wrap
// one of them, so callers check the kind with errors.Is and can show
// err.Error() to the client as is.
var (
	ErrInvalidInput = errors.New("invalid input") // 400
	ErrNotFound     = errors.New("not found")     // 404
	ErrConflict     = errors.New("conflict")      // 409
)

type serviceError struct {
	kind error
	msg  string
}

func (e *serviceError) Error() string { return e.msg }
func (e *serviceError) Unwrap() error { return e.kind }

// newError returns an error of the given kind whose message is the formatted text alone.
func newError(kind error, format string, args ...any) error {
	return &serviceError{kind: kind, msg: fmt.Sprintf(format, args...)}
}
