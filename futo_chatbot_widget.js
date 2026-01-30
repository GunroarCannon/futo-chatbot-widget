(function () {
    const scriptUrl = document.currentScript.src;
    const url = new URL(scriptUrl);
    const WIDGET_URL = url.origin;

    // Create shadow root wrapper
    const widgetWrapper = document.createElement("div");
    widgetWrapper.id = "futo-chat-widget-root";
    const shadow = widgetWrapper.attachShadow({ mode: "open" });
    document.addEventListener("DOMContentLoaded", () => {
        if (window.__ChatWidgetLoaded) return;
        window.__ChatWidgetLoaded = true;
        document.body.appendChild(widgetWrapper);
        initChatWidget();
    });
    console.log("Futo Chatbot Widget initialized with widget url: ", WIDGET_URL);

    async function initChatWidget() {
        console.log("Waiting for chat widget to load...");
       // await fetch("https://futo-chatbot-server.onrender.com/healthz").catch(console.error);
        console.log("Chat widget server is reachable, loading widget...");
        // --- Inject HTML inside Shadow ---
        
        shadow.innerHTML = `
          
            <style>
            @keyframes fade-in-anim {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                /* 1. Base Transition Setup for Smooth Movement */
                #floating-chat-btn {
                    /* Tells the browser to smoothly animate the transform property */
                    transition: transform 0.3s ease-in-out; 
                }

                #floating-chat-widget {
                    /* Apply the fade-in animation on load */
                    animation: fade-in-anim 0.8s ease-in forwards;
                }

                /* 2. Hover State */
                #floating-chat-btn:hover {
                    /* Moves the button up 4 pixels (-4px) and scales it up slightly (1.05) */
                    transform: translateY(-4px) scale(1.05); 
                    
                    /* Optional: Add a stronger shadow for a lifted look */
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.15);
                }
            </style>
            <link rel="stylesheet" href="${WIDGET_URL}/src/style.css">
            <div 
                id="floating-chat-widget"
                class="fixed bottom-6 right-6 z-[9999] w-20 h-20 flex flex-col items-center justify-center p-2 bg-green-700 text-white 
                    rounded-full shadow-xl hover:bg-green-900 hover:scale-105 hover:-translate-y-1 transition">
                
                <button id="floating-chat-btn" class="flex items-center justify-center mb-1 ">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2h-2.586l-2.707 2.707A1 1 0 0110 18v-2a2 2 0 00-2-2H4a2 2 0 01-2-2V5z" />
                    </svg>

                </button>
                <span class="text-xs font-bold leading-none">Ask AI</span>
            </div>


            <div id="chat-modal-container"
                class="fixed inset-0 z-[9998] flex items-center justify-center 
                    bg-black/50 opacity-0 pointer-events-none transition-opacity duration-300">
                <div id="chat-modal" class="w-full max-w-sm md:max-w-lg mx-4"></div>
            </div>
        `;

        console.log("Chat widget HTML injected");

        // --- Setup Event Listeners ---
        const btn = shadow.getElementById("floating-chat-widget");
        const modalContainer = shadow.getElementById("chat-modal-container");
        const modal = shadow.getElementById("chat-modal");

        // Open modal
        btn.addEventListener("click", () => toggleChatModal(true));

        // Close when clicking outside modal
        modalContainer.addEventListener("click", (e) => {
            if (!modal.contains(e.target)) toggleChatModal(false);
        });
        modal.addEventListener("click", (e) => e.stopPropagation());

        async function toggleChatModal(open) {
            if (open) {
                await loadChatModal();
                modalContainer.style.opacity = "1";
                modalContainer.style.pointerEvents = "auto";
            } else {
                modalContainer.style.opacity = "0";
                modalContainer.style.pointerEvents = "none";
            }
        }

        window.toggleChatModal = toggleChatModal;

        async function loadChatModal() {
            if (modal.dataset.loaded) return;

            // Load bootstrap icons inside shadow
            const iconLink = document.createElement("link");
            iconLink.rel = "stylesheet";
            iconLink.href = `${WIDGET_URL}/bootstrap-icons/font/bootstrap-icons.min.css`;//"https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css";
            shadow.appendChild(iconLink);

            console.log("Loading chat modal content...");
            

            const res = await fetch(`${WIDGET_URL}/chat.html`);
            modal.innerHTML = await res.text();
            modal.dataset.loaded = "true";

            // Load chat logic inside shadow
            const script = document.createElement("script");
            script.src = `${WIDGET_URL}/chat_frontend.js`;
            script.onload = () => {
                if (window.initializeChatLogic) {
                    window.initializeChatLogic(shadow);
                    console.log("Chat logic initialized cause of load");
                } else {
                    console.log("Chat logic script loaded, but initializeChatLogic not found");
                }
            };
            shadow.appendChild(script);
        }
    }
})();


