const axios = require("axios");

/**
 * Call Groq API with stable axios integration
 * @param {string} prompt - The prompt to send to AI
 * @returns {Promise<string|null>} - AI response content or null on error
 */
async function callGroq(prompt) {
  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    return response.data.choices[0]?.message?.content || null;
  } catch (error) {
    console.error("GROQ UTILITY ERROR:", error?.response?.data || error.message);
    return null;
  }
}

module.exports = callGroq;
