# Chat With Go
![image](https://github.com/MuhFaridanSutariya/chat-with-go/assets/88027268/cd5f158e-5092-4b18-9e6d-da53da7149d4)

## About this project

Build a web-based chatbot interface that processes CSV files and generates responses using Google Generative AI.

### Tech Stack

#### Backend:
- Go (Golang):
  - Primary programming language for the backend server.
  - Handles HTTP requests, file uploads, and communication with the AI service.
- Google Generative AI (gemini-1.5-flash):
  - Used for generating responses based on the provided data and user queries.
  - The `genai` Go package is used to interact with the Google Generative AI API.
- Google API Go Client:
  - The `google.golang.org/api/option` package is used to configure API keys for the Google Generative AI client.
- Third-Party Libraries:
  - `github.com/google/generative-ai-go/genai`: Google Generative AI client library.
  - `github.com/joho/godotenv`: Used to load environment variables from a .env file.

#### Frontend:
- HTML:
  - Structure of the web interface.
  - Contains forms for file upload and user queries.
- CSS:
  - Styling for the web interface.
  - Includes styles for chat messages, loading spinner, and other UI elements.
- JavaScript:
  - Handles client-side interactions and communication with the backend.
  - Manages file uploads, form submissions, and chat interactions.
  - Uses the Fetch API for making HTTP requests to the backend.
    
#### Infrastructure:
- HTTP Server:
  - Go's built-in `net/http` package is used to run the web server.
  - Handles serving static files (HTML, CSS, JS) and API endpoints for file uploads and chat interactions.

## How to run

### 1. Clone this repository
To get started, clone this repository into your local machine. Follow the instructions below:

1. Open a terminal or Command Prompt.
2. Change to the directory where you want to clone the repository.
3. Enter the following command to clone the repository:
   ```bash
   git clone https://github.com/MuhFaridanSutariya/chat-with-go.git
   ```
4. Once the cloning process is complete, navigate into the cloned directory using the `cd` command:
   ```bash
   cd chat-with-go  
   ```

### 2. System Requirements
Make sure your system meets the following requirements before proceeding:
- Go is installed on your computer.
- Google API Key: Obtain an Gemini API key for Google Generative AI.

### 3. Install Requirements
To initialize a `go.mod` file in a Go project, you need to use the go mod init command:

```bash
go mod init chatbot
```

**On Windows, macOS, and Linux:**
navigate to the directory where the `go.mod` file is located. Then, enter the following command:
```bash
go mod tidy
```
This command will install all the required packages specified in the `go.mod` file 

### 4. Run Go

How to run Web App:

``go run main.go``
