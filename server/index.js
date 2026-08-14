import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Groq from "groq-sdk";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Initialize Groq SDK (Make sure GROQ_API_KEY is set in your .env file)
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.post("/api/chat", async (req, res) => {
    try {
        const { messages } = req.body;

        // Call the Groq API with a natural, human-like system prompt
        const chatCompletion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile", // Use any preferred Groq model
            messages: [
                {
                    role: "system",
                    content: "You are JARVIS, but you talk completely naturally like a casual, friendly human. Avoid robotic phrasing, formal disclaimers, or assistant-like filler. Keep replies concise, conversational, and down-to-earth."
                },
                ...messages
            ],
            temperature: 0.7,
        });

        res.json({
            choices: [
                {
                    message: {
                        content: chatCompletion.choices[0]?.message?.content || "Hey, what's up?"
                    }
                }
            ]
        });
    } catch (error) {
        console.error("Groq API Error:", error);
        res.status(500).json({ error: "Failed to fetch response from Groq." });
    }
});

app.listen(3001, () => {
    console.log("Backend server running on http://localhost:3001");
});