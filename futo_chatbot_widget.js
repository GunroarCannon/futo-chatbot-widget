

(function () { 
    const scriptUrl = document.currentScript.src;

    // 2. Create a new URL object to easily parse the components
    const url = new URL(scriptUrl);

    // 3. Reconstruct the base origin (protocol + host)
    const WIDGET_URL = url.origin;
    console.log("FUTO Chatbot Widget URL:", WIDGET_URL, "\n made from ", scriptUrl, "\n", url, "\n", url.origin);
    window.addEventListener("DOMContentLoaded", async () => {
        if (window.__ChatWidgetLoaded) return;
        window.__ChatWidgetLoaded = true;

        // // Load Tailwind first
        // const tw = document.createElement("script");
        // tw.src = "https://cdn.tailwindcss.com";

        // tw.onload = () => {
            await initChatWidget();
        // };

        // document.head.appendChild(tw);
    });

    async function initChatWidget() {
        // ---- Call backend health endpoint to wake up server ----
        await fetch('https://futo-chatbot-server.onrender.com/healthz').catch((e) => {
            console.error("Health check failed:", e);
        });
        console.log("Chatbot server is awake.");
        // ---- Inject Tailwind if needed ----
        // ---- Insert Chat Containers ----
        const containerHTML = `
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

            <link rel="stylesheet" href="${WIDGET_URL}/style.css">
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
        
        document.body.insertAdjacentHTML("beforeend", containerHTML);
        
        document.getElementById("chat-modal-container").addEventListener("click", (e) => {
            const modal = document.getElementById("chat-modal");

            // If user clicked *outside* modal, close it
            if (!modal.contains(e.target)) {
                toggleChatModal(false);
            }
        });
        document.getElementById("chat-modal").addEventListener("click", (e) => {
            e.stopPropagation();
        });

        // ---- Toggle Modal Function (Global) ----
        window.toggleChatModal = async function (open) {
            const container = document.getElementById("chat-modal-container");
            const modal = document.getElementById("chat-modal");

            document.body.style.overflow = open ? "hidden" : "";

            if (open) {
                await loadChatModal();
                container.classList.remove("opacity-0", "pointer-events-none");
                setTimeout(() => modal.classList.add("modal-show"), 10);
            } else {
                modal.classList.remove("modal-show");
                setTimeout(() => {
                    container.classList.add("opacity-0", "pointer-events-none");
                }, 300);
            }
        };

        // ---- Load Chat UI from chat.html ----
        async function loadChatModal() {
            const modal = document.getElementById("chat-modal");

            if (!modal.dataset.loaded) {
                try {
                    const iconLink = document.createElement("link");
                    iconLink.rel = "stylesheet";
                    iconLink.href = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css';
                    document.head.appendChild(iconLink);
                    
                    const res = await fetch(`${WIDGET_URL}/chat.html`);
                    modal.innerHTML = await res.text();
                    modal.dataset.loaded = "true";

                    // Load chat_frontend.js
                    const script = document.createElement("script");
script.src = `${WIDGET_URL}/chat_frontend.js`;

// --- CRITICAL FIX: Use onload to ensure chat_frontend.js is ready ---
script.onload = () => {
    console.log("Chat frontend script loaded and running initialization.");
    
    // Now call the function inside chat_frontend.js that looks up elements.
    // The HTML has been inserted (above) and the script has loaded (onload fired).
    if (window.initializeChatLogic) {
        window.initializeChatLogic();
    } else {
        console.error("Initialization function 'initializeChatLogic' not found.");
    }
};
// -------------------------------------------------------------------

console.log("Loading chat frontend script:", script.src);
document.body.appendChild(script);
                } catch (e) {
                    modal.innerHTML = `<div class='p-6 text-red-600'>Failed to load chat.</div>`;
                    console.error("Chat HTML load error:", e);
                }
            }
        }

        // ---- Floating button opens modal ----
        document.getElementById("floating-chat-widget")
                .addEventListener("click", () => toggleChatModal(true));
          }; 
                    
})();




