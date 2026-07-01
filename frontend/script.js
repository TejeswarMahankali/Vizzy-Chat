const chatBox = document.getElementById("chat-box");
const imageInput = document.getElementById("imageInput");
const previewImage = document.getElementById("previewImage");

// =========================================
// Image Preview
// =========================================

imageInput.addEventListener("change", function () {
    const file = this.files[0];
    if (file) {
        previewImage.src = URL.createObjectURL(file);
        previewImage.style.display = "block";
    }
});

// =========================================
// Load Previous Chat
// =========================================

window.onload = () => {
    const savedChat = localStorage.getItem("chatHistory");
    if (savedChat) {
        chatBox.innerHTML = savedChat;
    }
    chatBox.scrollTop = chatBox.scrollHeight;
};

// =========================================
// Save Chat
// =========================================

function saveChat() {
    localStorage.setItem("chatHistory", chatBox.innerHTML);
}

// =========================================
// Enter Key
// =========================================

function handleKey(event) {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

// =========================================
// Send Message
// =========================================

async function sendMessage() {

    const promptBox = document.getElementById("prompt");
    const message = promptBox.value.trim();

    if (message === "") return;

    // Show user message
    chatBox.innerHTML += `
        <div class="user-message">
            ${message}
        </div>
    `;

    promptBox.value = "";

    const loadingId = "loading-" + Date.now();

    chatBox.innerHTML += `
        <div class="ai-message" id="${loadingId}">
            Thinking...
        </div>
    `;

    chatBox.scrollTop = chatBox.scrollHeight;

    const aiBox = document.getElementById(loadingId);

    // Current selected image
    const file = imageInput.files[0];

    // ==============================
    // Vision AI
    // ==============================
    if (file) {

        console.log("===== VISION MODE =====");
        console.log("Image:", file.name);
        console.log("Prompt:", message);

        const formData = new FormData();
        formData.append("image", file);
        formData.append("prompt", message);

        try {

            const response = await fetch(
                "https://vizzy-chat-e403.onrender.com/analyze-image",
                {
                    method: "POST",
                    body: formData
                }
            );

            console.log("HTTP Status:", response.status);

            if (!response.ok) {
                throw new Error("Server returned " + response.status);
            }

            const data = await response.json();

            console.log("Server Response:", data);

            aiBox.innerHTML = data.response;

            // Clear image after successful analysis
            imageInput.value = "";
            previewImage.src = "";
            previewImage.style.display = "none";

            saveChat();

            chatBox.scrollTop = chatBox.scrollHeight;

            return;

        }
        catch (error) {

            console.error("Vision Error:", error);

            aiBox.innerHTML = "❌ Failed to analyze image.";

            return;

        }

    }

    // ==============================
    // Normal Chat
    // ==============================

    console.log("===== NORMAL CHAT =====");

    try {

        const response = await fetch(
            "https://vizzy-chat-e403.onrender.com/chat-stream",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    message: message
                })
            }
        );

        if (!response.ok) {
            throw new Error("Streaming failed");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        aiBox.innerHTML = "";

        while (true) {

            const { done, value } = await reader.read();

            if (done) break;

            aiBox.innerHTML += decoder.decode(value);

            chatBox.scrollTop = chatBox.scrollHeight;

        }

    }
    catch (error) {

        console.error("Chat Error:", error);

        aiBox.innerHTML = "❌ Failed to connect.";

    }

    saveChat();

}

// =========================================
// Generate Image
// =========================================

async function generateImage() {

    const prompt = document.getElementById("prompt").value.trim();

    if (prompt === "") return;

    chatBox.innerHTML += `
        <div class="user-message">${prompt}</div>
        <div class="ai-message">Generating image...</div>
    `;

    chatBox.scrollTop = chatBox.scrollHeight;

    try {

        const response = await fetch("https://vizzy-chat-e403.onrender.com/generate-image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: prompt })
        });

        const data = await response.json();

        const messages = chatBox.querySelectorAll(".ai-message");
        const last = messages[messages.length - 1];

        last.innerHTML = `
            <img src="${data.image_url}" width="350" style="border-radius:10px;">
        `;

    } catch (error) {

        console.error(error);

    }

    saveChat();
}

// =========================================
// Clear Chat
// =========================================

function clearChat() {
    chatBox.innerHTML = "";
    previewImage.style.display = "none";
    imageInput.value = "";
    localStorage.removeItem("chatHistory");
}