const natural = require('natural');
const tokenizer = new natural.WordTokenizer();

// Keywords for each category
const categoryKeywords = {
  food: ['food', 'hunger', 'hungry', 'starving', 'starvation', 'meal', 'eat', 'eating', 'nutrition', 'water', 'drink', 'thirst', 'ration', 'supply', 'shortage'],
  health: ['medical', 'hospital', 'doctor', 'medicine', 'sick', 'illness', 'disease', 'injury', 'injured', 'emergency', 'ambulance', 'health', 'treatment', 'clinic', 'nurse'],
  education: ['school', 'education', 'teacher', 'student', 'learning', 'class', 'books', 'study', 'children', 'child', 'kids', 'literacy', 'training'],
  disaster: ['flood', 'fire', 'earthquake', 'storm', 'cyclone', 'disaster', 'collapse', 'rescue', 'trapped', 'evacuation', 'relief', 'damage', 'destroyed', 'landslide']
};

// Categorize text into need type
const categorizeNeedType = (text) => {
  const tokens = tokenizer.tokenize(text.toLowerCase());
  const scores = { food: 0, health: 0, education: 0, disaster: 0 };

  tokens.forEach(token => {
    Object.keys(categoryKeywords).forEach(category => {
      if (categoryKeywords[category].includes(token)) {
        scores[category]++;
      }
    });
  });

  // Return category with highest score, default to 'disaster'
  const maxCategory = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
  return scores[maxCategory] > 0 ? maxCategory : 'disaster';
};

// Calculate priority score
const calculatePriorityScore = (severity, peopleAffected, availableResources = 1) => {
  const raw = (severity * peopleAffected) / availableResources;
  const score = Math.min(Math.round(raw), 1000); // cap at 1000

  let urgency_level;
  if (score >= 500) urgency_level = 'critical';
  else if (score >= 200) urgency_level = 'high';
  else if (score >= 50) urgency_level = 'medium';
  else urgency_level = 'low';

  const explanation = `Score ${score} calculated from severity (${severity}/10) × people affected (${peopleAffected}) ÷ available resources (${availableResources}). Urgency: ${urgency_level}.`;

  return { priority_score: score, urgency_level, explanation };
};

module.exports = { categorizeNeedType, calculatePriorityScore };