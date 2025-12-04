# FUTO Chatbot Widget

A lightweight, drop-in chat widget that can be embedded into any website.  
It loads a floating chat button in the bottom-right corner and opens a fully interactive AI chat modal powered by your backend API.

This repository contains only the **frontend widget**, not the chatbot backend.

---

##  Features

- Floating chat button (bottom-right)
- Smooth modal open/close animation
- Loads `chat.html` dynamically into the modal
- Runs `chat_frontend.js` automatically when opened
- Tailwind-styled UI using a compiled `dist/style.css`
- Works on **any static site** (HTML/CMS/React/etc.)
- No dependencies required

---

## 📦 Folder Structure

```

/
│ chat.html               → Chat modal UI (HTML only)
│ chat_frontend.js        → Chat logic (API calls, UI events)
│ chat.css                → Optional extra styling
│ dist/style.css          → Built Tailwind CSS (used by widget)
│ futo_chatbot_widget.js  → Main widget script (embed this)
│ index.html              → Basic test page
│ mockup.html             → Optional design mockup
│ src/                    → Tailwind input files
│ tailwind.config.js
│ package.json

````

---

## 🔧 Installation (Embedding in any website)

To use the widget, simply include:

```html
<script src="futo_chatbot_widget.js"></script>
````

The widget will automatically:

1. Add the floating chat button
2. Load the modal container
3. Fetch `chat.html` into the modal
4. Load `chat_frontend.js` on first open

Nothing else is required.

---

## 🖥️ How It Works (Basics)

### 1. `futo_chatbot_widget.js`

* Runs automatically on `DOMContentLoaded`

* Injects UI:

  * floating button
  * modal container
  * stylesheet (`/dist/style.css`)

* Provides global function:

```js
toggleChatModal(true | false)
```

* Loads the chat window lazily from `chat.html`
* Loads chat logic from `chat_frontend.js`

---

### 2. `chat.html`

Contains the actual chatbox layout:

* Header
* Message log
* Input field
* Send button

This file is loaded *inside the modal* when first opened.

---

### 3. `chat_frontend.js`

Handles:

* Sending messages to backend (`/chat` endpoint)
* Rendering bot + user messages
* Loading spinner
* Scrolling behavior

Replace your backend URL here:

```js
fetch("https://https://futo-chatbot-widget.onrender.com/chat", { ... })
```

---

## 🎨 CSS / Tailwind

Tailwind is compiled manually into:

```
dist/style.css
```

To rebuild CSS:

```bash
npm install
npm run build
```

Modify Tailwind input in:

```
src/input.css
```

---

## 🧪 Testing The Widget

This repo includes a demo page:

```
index.html
```

Open it in any browser or deploy it to a static host —
you should see a floating chat bubble appear in the bottom-right corner.

---

## 🛠️ Backend Requirement

The frontend expects a POST API endpoint:

```
POST /chat
{
  "message": "your text here"
}
```

Response format:

```json
{
  "response": "<html or text>"
}
```

You may host this using Node/Express, FastAPI, Firebase Functions, etc.

---

## 📄 License

MIT — free to use, modify, or embed in any website.


