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
    } else {
        const errorText = await response.text();
        alert(`Error: ${errorText}`);
    }
});

document.getElementById('chatForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const queryInput = document.getElementById('query');
    const chatWindow = document.getElementById('chatWindow');
    const loadingElement = document.getElementById('loading');

    const userMessage = queryInput.value;
    addMessageToChat('user', userMessage);

    // Show loading animation
    loadingElement.style.display = 'block';

    const formData = new FormData();
    formData.append('file', uploadedFile);
    formData.append('query', userMessage);

    const response = await fetch('/chatbot', {
        method: 'POST',
        body: formData
    });

    // Hide loading animation
    loadingElement.style.display = 'none';

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
        alert(`Error: ${errorText}`);
    }

    queryInput.value = '';
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

    messageElement.appendChild(img);
    messageElement.appendChild(text);

    chatWindow.appendChild(messageElement);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}
