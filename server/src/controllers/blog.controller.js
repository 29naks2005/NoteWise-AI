const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require("axios");
const cheerio = require("cheerio");
const prisma = require("../prismaClient");

/* ================= CONFIG ================= */

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const MODEL_NAME = "gemini-flash-latest";
const MAX_CHARS = 12000;

/* ================= UTILS ================= */

// Fetch webpage HTML
const fetchWebpage = async (url) => {
  const { data } = await axios.get(url, {
    headers: {
      "User-Agent": "Mozilla/5.0",
    },
    timeout: 15000,
  });
  return data;
};

// Extract readable article content
const extractArticle = (html) => {
  const $ = cheerio.load(html);

  // Remove junk
  $("script, style, nav, footer, header, aside, iframe, noscript").remove();

  const title =
    $("h1").first().text().trim() ||
    $("title").text().trim() ||
    "Article";

  let content = "";

  // Try common article containers
  const selectors = [
    "article",
    ".article-content",
    ".post-content",
    ".entry-content",
    "main",
  ];

  for (const selector of selectors) {
    const text = $(selector).text().trim();
    if (text.length > 500) {
      content = text;
      break;
    }
  }

  // Fallback: paragraphs
  if (!content) {
    $("p").each((_, el) => {
      const text = $(el).text().trim();
      if (text.length > 40) content += text + "\n";
    });
  }

  content = content.replace(/\s+/g, " ").trim();

  if (content.length < 300) {
    throw new Error("Not enough readable content found");
  }

  return {
    title,
    content: content.slice(0, MAX_CHARS),
  };
};

/* ================= GEMINI ================= */

const runGemini = async (prompt) => {
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });
  const result = await model.generateContent(prompt);
  return result.response.text();
};

/* ================= PROMPTS ================= */

const summaryPrompt = (title, content) => `
You are a friendly study assistant helping students understand articles quickly.

Your goal: Create a SHORT, EASY-TO-READ summary that anyone can understand.

IMPORTANT RULES:
- Use SIMPLE, EVERYDAY language (avoid jargon unless necessary)
- Be CONCISE - summaries should be quick to read
- Use proper Markdown formatting
- Do NOT make up information - only use what's in the article
- Use **bold** ONLY for key terms that are truly important

ARTICLE TITLE: "${title}"

ARTICLE CONTENT:
"""
${content}
"""

Write the summary following this EXACT structure:

## 📌 What This Is About
Explain in 2-3 simple sentences what this article covers.
Use everyday language, like you're explaining to a friend.

## 🎯 Main Points
- List 3-5 key ideas from the article
- Keep each point short and clear (one line)
- Focus on the most important information

## 💡 Key Takeaways
- What should readers remember? (2-3 points)
- Focus on practical understanding, not memorization
- Make it actionable or memorable

## 🔑 Why This Matters
In 1-2 sentences, explain why this topic is useful or important.
Connect it to real-world relevance if possible.
`;

const notesPrompt = (title, content) => `
You are an expert teacher creating DETAILED, BEGINNER-FRIENDLY study notes.

Your goal: Help students LEARN and UNDERSTAND the topic deeply.

IMPORTANT RULES:
- Explain concepts in SIMPLE, CLEAR language
- Break down complex ideas into smaller parts
- Use proper Markdown formatting (headings, bold, bullets)
- Include examples when they help clarify (only from the article)
- Do NOT make up information - use only what's in the article
- Make notes MORE DETAILED than a summary (this is for studying)

ARTICLE TITLE: "${title}"

ARTICLE CONTENT:
"""
${content}
"""

Create study notes following this EXACT structure:

# 📚 ${title}

## 🎯 What You'll Learn
Briefly introduce the topic in 2-3 sentences.
Explain why this topic is important or useful.

## 📖 Core Concepts

For EACH major concept in the article, create a subsection:

### 🔹 [Concept Name]
Provide a clear, detailed explanation in simple language.
- Break it down into easy-to-understand points if needed
- Add examples from the article if available
- Explain HOW it works or WHY it's important

(Repeat this pattern for each main concept)

## ✅ Important Points to Remember
- List key facts, definitions, or rules as bullet points
- These should be easy to recall during revision
- Focus on the "must-know" information

## 💡 Examples & Use Cases
(Only include if the article has examples)
- Describe real-world applications or use cases
- Show how concepts are applied practically
- Help connect theory to practice

## 📋 Quick Reference
- Very short bullet points for last-minute revision
- Think: "What do I need to know 5 minutes before an exam?"
- One-liners that capture the essence of each concept
`;

/* ================= CONTROLLERS ================= */

// Summary only
const getBlogSummary = async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ message: "URL is required" });

    new URL(url); // validate

    const html = await fetchWebpage(url);
    const { title, content } = extractArticle(html);

    const summary = await runGemini(summaryPrompt(title, content));

    res.json({ title, url, summary });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Notes only
const getBlogNotes = async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ message: "URL is required" });

    new URL(url);

    const html = await fetchWebpage(url);
    const { title, content } = extractArticle(html);

    const notes = await runGemini(notesPrompt(title, content));

    res.json({ title, url, notes });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Summary + Notes
const processBlog = async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ message: "URL is required" });

    new URL(url);

    const html = await fetchWebpage(url);
    const { title, content } = extractArticle(html);

    const summary = await runGemini(summaryPrompt(title, content));
    const notes = await runGemini(notesPrompt(title, content));

    res.json({ title, url, summary, notes });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Save a note
const saveNote = async (req, res) => {
  try {
    const { articleUrl, articleTitle, content, type } = req.body;
    const userId = req.user.userId;

    if (!articleUrl || !content || !type) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!["summary", "notes"].includes(type)) {
      return res.status(400).json({ message: "Type must be 'summary' or 'notes'" });
    }

    const savedNote = await prisma.savedNote.create({
      data: {
        userId,
        articleUrl,
        articleTitle: articleTitle || "Untitled Article",
        content,
        type,
      },
    });

    res.json({ message: "Note saved successfully", data: savedNote });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get all saved notes for user
const getSavedNotes = async (req, res) => {
  try {
    const userId = req.user.userId;

    const notes = await prisma.savedNote.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        articleTitle: true,
        articleUrl: true,
        type: true,
        createdAt: true,
      },
    });

    res.json({ notes });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get single saved note by ID
const getSavedNoteById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const note = await prisma.savedNote.findFirst({
      where: { id, userId },
    });

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.json({ note });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete a saved note
const deleteSavedNote = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const note = await prisma.savedNote.findFirst({
      where: { id, userId },
    });

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    await prisma.savedNote.delete({ where: { id } });

    res.json({ message: "Note deleted successfully" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = {
  getBlogSummary,
  getBlogNotes,
  processBlog,
  saveNote,
  getSavedNotes,
  getSavedNoteById,
  deleteSavedNote,
};
