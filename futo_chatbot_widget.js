(function () {   
    window.addEventListener("DOMContentLoaded", () => {
        if (window.__ChatWidgetLoaded) return;
        window.__ChatWidgetLoaded = true;

        // // Load Tailwind first
        // const tw = document.createElement("script");
        // tw.src = "https://cdn.tailwindcss.com";

        // tw.onload = () => {
             initChatWidget();
        // };

        // document.head.appendChild(tw);
    });
    
    function initChatWidget() {
        // ---- Inject Tailwind if needed ----
        // ---- Insert Chat Containers ----
        const containerHTML = `

            <link rel="stylesheet" href="/dist/style.css">
            <button id="floating-chat-btn"
                class="fixed bottom-6 right-6 z-[9999] p-4 bg-green-700 text-white 
                    rounded-full shadow-xl hover:bg-green-900 transition">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2h-2.586l-2.707 2.707A1 1 0 0110 18v-2a2 2 0 00-2-2H4a2 2 0 01-2-2V5z" />
                </svg>
            </button>

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
                    const res = await fetch("chat.html");
                    modal.innerHTML = await res.text();
                    modal.dataset.loaded = "true";

                    // Load chat_frontend.js
                    const script = document.createElement("script");
                    script.src = "chat_frontend.js";
                    document.body.appendChild(script);

                } catch (e) {
                    modal.innerHTML = `<div class='p-6 text-red-600'>Failed to load chat.</div>`;
                    console.error("Chat HTML load error:", e);
                }
            }
        }

        // ---- Floating button opens modal ----
        document.getElementById("floating-chat-btn")
                .addEventListener("click", () => toggleChatModal(true));
          }; 
                    
})();





