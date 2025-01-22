package main

import (
    "fmt"
    "log"
    "net/http"
    "github.com/rs/cors"
)

func main() {
    mux := http.NewServeMux()
    mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        fmt.Fprintf(w, "Welcome to OneFit Backend!")
    })

    handler := cors.Default().Handler(mux)

    log.Println("Server started on :8080")
    log.Fatal(http.ListenAndServe(":8080", handler))
}