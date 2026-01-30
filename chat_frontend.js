(function() {
    'use strict';
    
    // Check if the HTML is ready before proceeding
    if (document.readyState === "loading") {
       // document.addEventListener('DOMContentLoaded', initializeChatLogic);
    } else {
        //initializeChatLogic();
    }

    function initializeChatLogic(root) {
        const scrollToBottom = () => {
            setTimeout(() => {
            chatLog.scrollTo({
            top: chatLog.scrollHeight,
            behavior: 'smooth'
            });
            }, 100);
        };

        console.log("Checking if root exists ", root);

    function attemptToggleChatModal() {
        // Check if 'parent' exists in the current window context (not null or undefined)
        // AND if 'parent.toggleChatModal' is a valid function.
        if (window.parent && typeof window.toggleChatModal === 'function') {
            // If both conditions are true, safely call the function on the parent window.
            window.toggleChatModal();
            console.log("parent.toggleChatModal() called successfully.");
            return true;
        }
        
        console.log("Cannot call parent.toggleChatModal(): window.parent is not available or toggleChatModal is not a function.");
        return false;
    }

    console.log("Chatfrontend.js loaded");

    // Call the function immediately as requested
    root.getElementById('cancel-btn').addEventListener('click', () => {
                    
        attemptToggleChatModal();
    });

    // Variable declarations
    console.log("Setting up chat frontend..."); 
    const modal = root.getElementById("chat-modal");
    const chatLog = modal.querySelector('#chat-log');
    const userInput = modal.querySelector('#user-input');
    const sendBtn = modal.querySelector('#send-btn');
    //const loading = document.getElementById('loading');
    // Get timezone once for the session key
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone; 
    let timeoutId;
    console.log("chatLog, userInput, sendBtn elements:", chatLog, userInput, sendBtn);
    const chatForm = modal.querySelector('#chat-form');
    console.log("chatForm element:", chatForm);




    chatForm.addEventListener('submit', function(event) {
            
            // --- THIS IS THE CRITICAL FIX ---
            // Stops the browser from executing the default form submission (page reload).
            event.preventDefault(); 
            
            // Get the input element and value
            const userInput = root.getElementById('user-input');
            const message = userInput.value.trim();

            // Optional: Implement your own custom validation check here
            if (message === '') {
                // Display your own custom error message (e.g., set an error class, flash a red border)
                console.log("Custom validation: Input field is empty.");
                return; // Stop execution if empty
            }

            // If validation passes, process the message and clear the input
            sendMessage(message);
            userInput.value = ''; // Clear the input field
            
            // Disable the send button again (if you had logic to enable it on input)
            // document.getElementById('send-btn').disabled = true; 
    });
    console.log("FUTO Chatbot Frontend Loaded");

    // Initial bot message
    chatLog.innerHTML = `
        <div class="bot-message">
            <strong>FUTO Assistant:</strong> Welcome to the Federal University of Technology, Owerri chatbot! 
            I can help with admissions, academics, campus life, and more. How may I assist you today?
        </div>
    `;

    // --- Secure Event Attachment Helper Function (New) ---
    function attachMessageActions(tempId) {
        // We use a unique ID for the final container to ensure we target the right element
        const messageContainer = root.getElementById(`${tempId}-final`);
        if (!messageContainer) return;

        // 1. Attach Copy Listener
        // Select the button using the data-action attribute instead of an ID
        const copyButton = messageContainer.querySelector('[data-action="copy"]');
        if (copyButton) {
            copyButton.addEventListener('click', function() {
                // 'this' refers to the clicked button, passed to the original copyResponse
                window.copyResponse(this); 
            });
        }

        // 2. Attach Retry Listener
        const retryButton = messageContainer.querySelector('[data-action="retry"]');
        if (retryButton) {
            // Read the message payload securely stored in the data attribute
            const encodedMsg = retryButton.getAttribute('data-message');
            retryButton.addEventListener('click', function() {
                const decodedMsg = decodeURIComponent(encodedMsg);
                window.retry(decodedMsg); 
            });
        }
    }

    // Function to send user message to the server
    async function sendMessage(retryMessage) {
        const message = retryMessage || userInput.value.trim();
        if (!message) return;

        if (!retryMessage) {
            chatLog.innerHTML += `<div class="user-message"><strong>You:</strong> ${message}</div>`;
            userInput.value = '';
            scrollToBottom()
        }

        const tempId = Date.now();
        // Use the temporary ID for the loading state container
        chatLog.innerHTML += `
            <div id="${tempId}" class="bot-message">
                <div class="loading-text">Generating response...</div>
            </div>
        `;
        scrollToBottom()

        //loading.classList.remove('hidden');
        timeoutId = setTimeout(() => {
            const parentElement = root.getElementById(tempId);
            const loadingElement = parentElement.querySelector('.loading-text');
            if (loadingElement) {
                loadingElement.textContent = "Checking network connection...";
            }
        }, 5000);

        try {
            console.log('Sending message:', message);
            const response = await fetch('https://futo-chatbot-server.onrender.com/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                // Pass timezone for session management on the server
                body: JSON.stringify({ message, timezone }), 
            });

            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            
            // --- SECURE HTML INJECTION (No onclick attributes) ---
            // We use tempId-final to target the element after insertion for event listeners
            root.getElementById(tempId).outerHTML = `
                <div class="bot-message" id="${tempId}-final">
                    <strong>FUTO Assistant:</strong> ${data.response}
                    <div class="message-actions">
                        <button class="action-btn" data-action="copy"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1z"/>
                        <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0z"/>
                    </svg>
                        </button>
                        <button class="action-btn" data-action="retry" data-message="${encodeURIComponent(message)}">
                           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-clockwise" viewBox="0 0 16 16">
  <path fill-rule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2z"/>
  <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466"/>
</svg>
                        </button>
                    </div>
                </div>
            `;
            
            // --- ATTACH LISTENERS ---
            attachMessageActions(tempId);
            
        } catch (error) {
            console.error('Error:', error);
            clearTimeout(timeoutId);
            
            // --- SECURE HTML INJECTION for Error Message ---
            const errorMsg = error.message || "Sorry, I'm having trouble connecting. Please try again later.";
            
            root.getElementById(tempId).outerHTML = `
                <div class="bot-message" id="${tempId}-final">
                    <strong>FUTO Assistant:</strong> ${errorMsg}
                    <div class="message-actions">
                        <button class="action-btn" data-action="copy">
                            <i class="bi bi-clipboard"></i>
                        </button>
                        <button class="action-btn" data-action="retry" data-message="${encodeURIComponent(message)}">
                            <i class="bi bi-arrow-clockwise"></i>
                        </button>
                    </div>
                </div>
            `;
            
            // --- ATTACH LISTENERS ---
            attachMessageActions(tempId);
            scrollToBottom();
            
        } finally {
            chatLog.scrollTop = chatLog.scrollHeight;
            updateSendButtonState();
        }
    }


    function updateSendButtonState() {
        const isInputEmpty = userInput.value.trim() === '';
        console.log("Updating send button state. Input empty:", isInputEmpty);
    
        // Enable if input is NOT empty AND no request is active
        sendBtn.disabled = isInputEmpty;
    }

    console.log("Attaching input event listener to userInput for send button state update.");
    userInput.addEventListener('input', updateSendButtonState);

    // Retry function (scoped globally)
    window.retry = function(message) {
        sendMessage(message);
    }

    // Copy response function (scoped globally)
    window.copyResponse = function(button) {
        const messageElement = button.closest('.bot-message');
        let messageText = '';
        
        // Attempt to find the main text content, ignoring actions/strong tags
        const contentNodes = Array.from(messageElement.childNodes).filter(
            node => node.nodeName !== 'STRONG' && !node.classList?.contains('message-actions')
        );
        
        // Join text content from all relevant nodes
        messageText = contentNodes.map(node => 
            (node.nodeType === Node.TEXT_NODE ? node.textContent.trim() : node.innerText.trim())
        ).filter(text => text.length > 0).join('\n');
        
        // Ensure content is extracted cleanly for copying
        const responseText = messageText.replace(/FUTO Assistant:/, '').trim();

        navigator.clipboard.writeText(responseText).then(() => {
            const originalIcon = button.innerHTML;
            button.innerHTML = '<i class="bi bi-check2"></i>';
            button.style.color = '#006400';
            setTimeout(() => {
                button.innerHTML = originalIcon;
                button.style.color = '';
            }, 2000);
        }).catch(err => {
            console.error('Could not copy text: ', err);
        });
    }

    // Event listener for send button (Attached securely)
    sendBtn.addEventListener('click', () => sendMessage());

    // Event listener for Enter key (Attached securely)
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
}
//window.initializeChatLogic = initializeChatLogic
window.initializeChatLogic = (root) => initializeChatLogic(root);
})();
