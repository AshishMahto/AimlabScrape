package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"log/slog"
	"net/http"
	"os"
)

func main() {
	log.Printf("Hello world!")
	port := os.Getenv("PORT")
	if port == "" { port = "8080" }
	http.HandleFunc("/", indexHandler)
	err := http.ListenAndServe(":"+port, nil)
	if err != nil { log.Fatal(err) }
}

func indexHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodPost {
		p(fmt.Fprint(w, map[string]any {
			"url": r.URL,
			"body": string(f(io.ReadAll(r.Body))),
		}))
		return
	}
	if r.URL.Path != "/" {
		http.NotFound(w, r)
		return
	}
	_, _ = fmt.Fprint(w, "Hello, World!")
}

func p[T any](t T, err error) T {
	if err != nil { slog.Warn("error", err) }
	return t
}

func l[T any](t T, err error) func(string) T {
	return func(label string) T {
		if err != nil { slog.Warn(label + " error", err) }
		return t
	}
}

func f[T any](t T, err error) T {
	if err != nil { log.Fatal(err) }
	return t
}

type GraphQL struct {
	Query 		string `json:"query,omitempty"`
	Variables map[string]string `json:"variables,omitempty"`
}

func aimlabsGraphQL(query string, variables map[string]string) *http.Response {
	req := p(http.NewRequest(
		"POST",
		"http://localhost:8080/graphql",
		bytes.NewReader(p(json.Marshal(GraphQL { Query: query, Variables: variables }))),
	))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept-Encoding", "gzip, deflate, br, zstd")
	return p(http.DefaultClient.Do(req))
}
