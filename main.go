package main

import (
	"context"
	"encoding/csv"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"strings"

	"github.com/google/generative-ai-go/genai"
	"github.com/joho/godotenv"
	"google.golang.org/api/option"
)

type Inputs struct {
	Table map[string][]string `json:"table"`
	Query string              `json:"query"`
}

func CsvToSlice(data string) (map[string][]string, error) {
	r := csv.NewReader(strings.NewReader(data))
	records, err := r.ReadAll()
	if err != nil {
		return nil, err
	}

	result := make(map[string][]string)
	headers := records[0]

	for _, header := range headers {
		result[header] = []string{}
	}

	for _, record := range records[1:] {
		for i, value := range record {
			result[headers[i]] = append(result[headers[i]], value)
		}
	}

	return result, nil
}

func GenerateResponse(query string, table map[string][]string, apiKey string) (string, error) {
	ctx := context.Background()
	client, err := genai.NewClient(ctx, option.WithAPIKey(apiKey))
	if err != nil {
		return "", err
	}

	// Convert the table map to a string format suitable for the prompt
	tableStr := ""
	for key, values := range table {
		tableStr += fmt.Sprintf("%s: %s\n", key, strings.Join(values, ", "))
	}

	// Create the prompt with the table data and the query
	prompt := fmt.Sprintf("Given the following data:\n\n%s\n\n%s", tableStr, query)

	model := client.GenerativeModel("gemini-1.5-flash")
	resp, err := model.GenerateContent(
		ctx,
		genai.Text(prompt),
	)
	if err != nil {
		return "", err
	}

	marshalResponse, _ := json.Marshal(resp)
	return string(marshalResponse), nil
}

func handleChatbot(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	err := godotenv.Load()
	if err != nil {
		http.Error(w, "Error loading .env file", http.StatusInternalServerError)
		return
	}

	geminiToken := os.Getenv("GOOGLE_API_KEY")
	if geminiToken == "" {
		http.Error(w, "GOOGLE_API_KEY not set in .env file", http.StatusInternalServerError)
		return
	}

	file, _, err := r.FormFile("file")
	if err != nil {
		http.Error(w, "Error reading uploaded file", http.StatusInternalServerError)
		return
	}
	defer file.Close()

	data, err := ioutil.ReadAll(file)
	if err != nil {
		http.Error(w, "Error reading file content", http.StatusInternalServerError)
		return
	}

	table, err := CsvToSlice(string(data))
	if err != nil {
		http.Error(w, "Error parsing CSV data", http.StatusInternalServerError)
		return
	}

	query := r.FormValue("query")
	if query == "" {
		http.Error(w, "Query not provided", http.StatusBadRequest)
		return
	}

	response, err := GenerateResponse(query, table, geminiToken)
	if err != nil {
		http.Error(w, fmt.Sprintf("Error generating response: %v", err), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte(response))
}

func handleUpload(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	file, _, err := r.FormFile("file")
	if err != nil {
		http.Error(w, "Error reading uploaded file", http.StatusInternalServerError)
		return
	}
	defer file.Close()

	// Save the uploaded file to a temporary location
	tempFile, err := ioutil.TempFile("", "uploaded-*.csv")
	if err != nil {
		http.Error(w, "Error creating temporary file", http.StatusInternalServerError)
		return
	}
	defer tempFile.Close()

	data, err := ioutil.ReadAll(file)
	if err != nil {
		http.Error(w, "Error reading file content", http.StatusInternalServerError)
		return
	}

	_, err = tempFile.Write(data)
	if err != nil {
		http.Error(w, "Error writing to temporary file", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func main() {
	http.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("static"))))
	http.Handle("/assets/", http.StripPrefix("/assets/", http.FileServer(http.Dir("assets"))))
	http.HandleFunc("/upload", handleUpload)
	http.HandleFunc("/chatbot", handleChatbot)

	fmt.Println("Server started at :8080")
	http.ListenAndServe(":8080", nil)
}
