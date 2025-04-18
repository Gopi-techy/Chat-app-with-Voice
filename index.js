document.addEventListener("DOMContentLoaded", () => {
  const inputField = document.getElementById("input");
  const sendButton = document.getElementById("sendButton");
  const micButton = document.querySelector(".fa-microphone")?.parentNode;
  let sessionStartTime = new Date();
  
  // Update stats initially
  updateMessageStats();
  updateTimeStats();
  
  // Set interval to update time stats every minute
  setInterval(updateTimeStats, 60000);
  
  // Handle text input via keyboard with improved Enter key detection
  inputField.addEventListener("keypress", (e) => {
    // Check for Enter key using multiple properties for better cross-browser compatibility
    if (e.key === "Enter" || e.code === "Enter" || e.keyCode === 13) {
      e.preventDefault(); // Prevent default form submission behavior
      sendMessage();
    }
  });
  
  // Also add keydown event for better compatibility
  inputField.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.code === "Enter" || e.keyCode === 13) {
      e.preventDefault();
      sendMessage();
    }
  });
  
  // Handle text input via send button
  sendButton.addEventListener("click", () => {
    sendMessage();
  });
  
  // Handle voice input via microphone button
  if (micButton) {
    micButton.addEventListener("click", () => {
      // Check if browser supports speech recognition
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.lang = 'en-US';
        recognition.continuous = false;
        recognition.interimResults = false;
        
        // Start listening
        recognition.start();
        
        // Visual feedback - change mic color
        micButton.classList.add('active');
        micButton.innerHTML = '<i class="fas fa-microphone" style="color: var(--primary-color);"></i>';
        
        // Process speech result
        recognition.onresult = (event) => {
          const speechResult = event.results[0][0].transcript;
          inputField.value = speechResult;
          
          // Small delay before submitting to allow user to see what was recognized
          setTimeout(() => {
            if (speechResult.trim() !== "") {
              output(speechResult);
              inputField.value = "";
            }
          }, 500);
        };
        
        // Handle end of speech input
        recognition.onend = () => {
          micButton.classList.remove('active');
          micButton.innerHTML = '<i class="fas fa-microphone"></i>';
        };
        
        // Handle errors
        recognition.onerror = (event) => {
          console.error("Speech recognition error", event.error);
          micButton.classList.remove('active');
          micButton.innerHTML = '<i class="fas fa-microphone"></i>';
        };
      } else {
        alert("Sorry, your browser doesn't support speech recognition. Please try using Chrome or Edge.");
      }
    });
  }
  
  // Clear chat functionality
  const clearChatButton = document.querySelector(".clear-chat");
  if (clearChatButton) {
    clearChatButton.addEventListener("click", () => {
      const messagesContainer = document.getElementById("messages");
      messagesContainer.innerHTML = `
        <div class="message bot-message">
          <img src="images/bot-mini.png" alt="Bot Avatar" class="avatar">
          <div class="message-content">
            <p>Hello! I'm your AI assistant. How can I help you today?</p>
            <span class="timestamp">Just now</span>
          </div>
        </div>
      `;
      updateMessageStats();
    });
  }
  
  // Theme toggle functionality
  const themeToggleButton = document.querySelector(".toggle-theme");
  if (themeToggleButton) {
    themeToggleButton.addEventListener("click", () => {
      document.body.classList.toggle("dark-theme");
      const isDarkMode = document.body.classList.contains("dark-theme");
      themeToggleButton.innerHTML = isDarkMode ? 
        '<i class="fas fa-sun"></i>' : 
        '<i class="fas fa-moon"></i>';
    });
  }
});

function output(input) {
  let product;

  // Regex remove non word/space chars
  // Trim trailing whitespce
  // Remove digits - not sure if this is best
  // But solves problem of entering something like 'hi1'

  let text = input.toLowerCase().replace(/[^\w\s]/gi, "").replace(/[\d]/gi, "").trim();
  text = text
    .replace(/ a /g, " ")   // 'tell me a story' -> 'tell me story'
    .replace(/i feel /g, "")
    .replace(/whats/g, "what is")
    .replace(/please /g, "")
    .replace(/ please/g, "")
    .replace(/r u/g, "are you");

  if (compare(prompts, replies, text)) { 
    // Search for exact match in `prompts`
    product = compare(prompts, replies, text);
  } else if (text.match(/thank/gi)) {
    product = "You're welcome!"
  } else if (text.match(/(corona|covid|virus)/gi)) {
    // If no match, check if message contains `coronavirus`
    product = coronavirus[Math.floor(Math.random() * coronavirus.length)];
  } else {
    // If all else fails: random alternative
    product = alternative[Math.floor(Math.random() * alternative.length)];
  }

  // Update DOM
  addChat(input, product);
}

function compare(promptsArray, repliesArray, string) {
  let reply;
  let replyFound = false;
  for (let x = 0; x < promptsArray.length; x++) {
    for (let y = 0; y < promptsArray[x].length; y++) {
      if (promptsArray[x][y] === string) {
        let replies = repliesArray[x];
        reply = replies[Math.floor(Math.random() * replies.length)];
        replyFound = true;
        // Stop inner loop when input value matches prompts
        break;
      }
    }
    if (replyFound) {
      // Stop outer loop when reply is found instead of interating through the entire array
      break;
    }
  }
  return reply;
}

function addChat(input, product) {
  const messagesContainer = document.getElementById("messages");
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Create user message
  let userDiv = document.createElement("div");
  userDiv.className = "message user-message";
  userDiv.innerHTML = `
    <img src="images/user.png" class="avatar">
    <div class="message-content">
      <p>${input}</p>
      <span class="timestamp">${currentTime}</span>
    </div>
  `;
  messagesContainer.appendChild(userDiv);

  // Create bot message with typing indicator
  let botDiv = document.createElement("div");
  botDiv.className = "message bot-message";
  botDiv.innerHTML = `
    <img src="images/bot-mini.png" class="avatar">
    <div class="message-content">
      <p>Typing...</p>
    </div>
  `;
  messagesContainer.appendChild(botDiv);
  
  // Keep messages at most recent
  messagesContainer.scrollTop = messagesContainer.scrollHeight - messagesContainer.clientHeight;

  // Update message count stat
  updateMessageStats();

  // Fake delay to seem "real"
  setTimeout(() => {
    // Update the bot's message with the actual response
    const messageContent = botDiv.querySelector('.message-content');
    messageContent.innerHTML = `
      <p>${product}</p>
      <span class="timestamp">${currentTime}</span>
    `;
    
    // Speak the response
    textToSpeech(product);
  }, 2000);
}

// Update message stats
function updateMessageStats() {
  const messageCount = document.querySelectorAll('.message.user-message').length;
  const statNumber = document.querySelector('.chat-stats .stat-number');
  if (statNumber) {
    statNumber.textContent = messageCount;
  }
}

// Update time stats
function updateTimeStats() {
  const startTime = sessionStartTime || new Date();
  const currentTime = new Date();
  const minutesDiff = Math.floor((currentTime - startTime) / 60000);
  
  const timeStatNumber = document.querySelectorAll('.chat-stats .stat-number')[1];
  if (timeStatNumber) {
    timeStatNumber.textContent = minutesDiff;
  }
}