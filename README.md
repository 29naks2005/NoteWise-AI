# 🧠 NoteWise AI  
**Knowledge, distilled.** *Stop drowning in tabs and start mastering content. NoteWise AI transforms long-form articles into structured, high-impact notes instantly.*
---

## 🌟 The Problem
We are drowning in information but starving for knowledge. Most of us bookmark dozens of articles we’ll never actually read. Manual note-taking takes too long, and copy-pasting is messy.

**NoteWise AI** solves this by acting as your personal research assistant—reading the content for you and providing a perfectly organized summary in your private workspace.

---

## 🚀 What It Can Do

### 🤖 Smart "Brain" Power
Uses Google's **Gemini AI** to read through long-form blogs or articles. It doesn't just shorten text; it identifies key definitions, core concepts, and the main "to-do" items.

### 🔐 Your Private Vault
Your notes are for your eyes only. We use **JWT (Industry-standard security)** to ensure that your personal workspace is locked tight and accessible only to you.

### ⚡ Clean & Simple Design
* **Paste & Go:** Just drop a link and hit "Generate."
* **Personal Dashboard:** A clean space to store, read, and manage your library of insights.
* **Mobile Ready:** Works perfectly on your phone so you can study or review on the move.

---

## 🛠️ The Tech Behind the Magic

| Part | Tool | What it does |
| :--- | :--- | :--- |
| **The Face** | **React.js** | Makes the app fast, smooth, and interactive. |
| **The Engine** | **Node.js & Express** | Handles the communication between the AI and the database. |
| **The Memory** | **PostgreSQL** | A rock-solid database that keeps your notes safe. |
| **The Architect**| **Prisma ORM** | Helps our code talk to our database securely and easily. |
| **The Brain** | **Gemini API** | The AI that actually understands and summarizes your links. |

---

## 🧠 How It Works (Simple Steps)

1.  **🔐 Login:** Jump into your private account, protected by secure **JWT** authentication.
2.  **🔗 Paste:** Simply drop a **URL** or paste the **text** of any article you want to summarize.
3.  **🧹 Clean:** The app automatically strips away distracting ads and pop-ups to find the core story.
4.  **🤖 Think:** The **Gemini AI** analyzes the content and picks out the most important concepts
5.  **💾 Save:** Your new notes are instantly stored in your personal dashboard for future reference.
6.  **📥 Download:** **Download your notes** as a clean file to keep your knowledge anywhere.
7.  **🖥️ Manage:** Review your library anytime, or delete notes once you've mastered the topic.

---

## 🗂️ Project Architecture

This project is built with a clean separation between the user interface and the server logic:

```text
client/
 ├── components/  
 ├── pages/       
 ├── utils/       
 └── App.jsx      

server/
 ├── routes/      
 ├── controllers/ 
 ├── middleware/  
 ├── prisma/      
 ├── utils/       
 └── index.js     
