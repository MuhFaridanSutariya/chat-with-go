let uploadedFile = null;

document.getElementById('uploadForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const fileInput = document.getElementById('file');
    const loadingElement = document.getElementById('loading');
    const chatContainer = document.getElementById('chatContainer');

    // Show loading animation
    loadingElement.style.display = 'block';

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);

    const response = await fetch('/upload', {
        method: 'POST',
        body: formData
    });

    // Hide loading animation
    loadingElement.style.display = 'none';

    if (response.ok) {
        uploadedFile = fileInput.files[0];
        chatContainer.style.display = 'flex';
        document.getElementById('uploadForm').style.display = 'none';
        addMessageToChat('bot', 'Welcome! How can I assist you today?'); // Add welcome message
    } else {
        const errorText = await response.text();
        addMessageToChat('bot', `Error: ${errorText}`); // Display error message in chat window
    }
});

document.getElementById('chatForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const queryInput = document.getElementById('query');
    const chatWindow = document.getElementById('chatWindow');
    const loadingElement = document.getElementById('loading');

    const userMessage = queryInput.value;
    addMessageToChat('user', userMessage);

    // Show typing indicator
    const typingIndicator = document.createElement('div');
    typingIndicator.classList.add('typing-indicator', 'bot');
    typingIndicator.innerHTML = `
        <img src="/assets/bot.png" alt="Bot">
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
    `;
    chatWindow.appendChild(typingIndicator);
    chatWindow.scrollTop = chatWindow.scrollHeight;

    const formData = new FormData();
    formData.append('file', uploadedFile);
    formData.append('query', userMessage);

    const response = await fetch('/chatbot', {
        method: 'POST',
        body: formData
    });

    // Remove typing indicator
    typingIndicator.remove();

    if (response.ok) {
        const data = await response.json();

        let summaryText = "";
        if (data.Candidates && data.Candidates.length > 0) {
            summaryText = data.Candidates[0].Content.Parts.join(" ");
        }

        summaryText = summaryText.replace(/\*/g, "");

        addMessageToChat('bot', summaryText);
    } else {
        const errorText = await response.text();
        addMessageToChat('bot', `Error: ${errorText}`); // Display error message in chat window
    }

    queryInput.value = '';
});

document.getElementById('clearChat').addEventListener('click', function() {
    const chatWindow = document.getElementById('chatWindow');
    chatWindow.innerHTML = '';
    localStorage.removeItem('chatHistory'); // Clear chat history from local storage
});

function addMessageToChat(sender, message) {
    const chatWindow = document.getElementById('chatWindow');
    const messageElement = document.createElement('div');
    messageElement.classList.add('chat-message', sender);

    const img = document.createElement('img');
    if (sender === 'user') {
        img.src = '/assets/profile.png';
    } else {
        img.src = '/assets/bot.png';
    }

    const text = document.createElement('p');
    text.textContent = message;

    const timestamp = document.createElement('span');
    timestamp.classList.add('timestamp');
    const now = new Date();
    timestamp.textContent = now.toLocaleTimeString();

    messageElement.appendChild(img);
    messageElement.appendChild(text);
    messageElement.appendChild(timestamp);

    chatWindow.appendChild(messageElement);
    chatWindow.scrollTop = chatWindow.scrollHeight;

    // Save chat history
    saveChatHistory();
}

// Save chat history to local storage
function saveChatHistory() {
    const chatWindow = document.getElementById('chatWindow');
    localStorage.setItem('chatHistory', chatWindow.innerHTML);
}

// Load chat history from local storage
function loadChatHistory() {
    const chatWindow = document.getElementById('chatWindow');
    const chatHistory = localStorage.getItem('chatHistory');
    if (chatHistory) {
        chatWindow.innerHTML = chatHistory;
    }
}

// Load chat history on page load
window.onload = loadChatHistory;
