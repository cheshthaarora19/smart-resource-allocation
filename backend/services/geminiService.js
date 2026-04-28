const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Categorize need type using Gemini
const categorizeWithGemini = async (text) => {
  try {
    const prompt = `
You are an AI assistant for a disaster relief and social impact platform.
Analyze the following report text and categorize it into EXACTLY ONE of these categories:
- food (hunger, water shortage, food supply issues)
- health (medical, disease, injury, hospital)
- education (school, children, learning, teachers)
- disaster (flood, fire, earthquake, storm, collapse)

Report text: "${text}"

Reply with ONLY the single word category. No explanation, no punctuation, just the word.
`;
    const result = await model.generateContent(prompt);
    const category = result.response.text().trim().toLowerCase();
    const validCategories = ['food', 'health', 'education', 'disaster'];
    return validCategories.includes(category) ? category : 'disaster';
  } catch (error) {
    console.error('Gemini categorization error:', error.message);
    return null; // will fallback to keyword NLP
  }
};

// Generate explainable AI priority explanation using Gemini
const explainPriorityWithGemini = async (reportData) => {
  try {
    const { title, need_type, severity, people_affected, location, priority_score, urgency_level } = reportData;
    const prompt = `
You are an AI assistant for a disaster relief platform called ResQ.
A community report has been submitted and scored by our AI system.

Report Details:
- Title: ${title}
- Need Type: ${need_type}
- Location: ${location}
- Severity: ${severity}/10
- People Affected: ${people_affected}
- AI Priority Score: ${priority_score}/1000
- Urgency Level: ${urgency_level.toUpperCase()}

Write a 2-3 sentence human-readable explanation of WHY this report received this priority score.
Mention the severity, number of people affected, and what immediate action is recommended.
Keep it clear, direct, and actionable for an NGO admin or volunteer coordinator.
`;
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error('Gemini explanation error:', error.message);
    return null; // will fallback to formula-based explanation
  }
};

module.exports = { categorizeWithGemini, explainPriorityWithGemini };