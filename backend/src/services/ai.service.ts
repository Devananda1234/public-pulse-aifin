import Groq from 'groq-sdk';

export const analyzeText = async (description: string) => {
  const groqApiKey = process.env.GROQ_API;
  
  // Fallback if no API key is provided
  if (!groqApiKey) {
    console.warn('GROQ_API not found in .env, falling back to mock AI.');
    return {
      category: 'Others',
      severity: 'Low',
      department: 'General Services',
      priorityScore: 30,
      suggestedAction: 'Manual review required.'
    };
  }

  const groq = new Groq({ apiKey: groqApiKey });

  const prompt = `
    Analyze the following civic issue report description and categorize it.
    Return ONLY a JSON object with exactly the following keys:
    - category (string): Must be one of: "Roads", "Water Supply", "Electricity", "Waste Management", "Public Safety", "Others"
    - severity (string): Must be one of: "Low", "Medium", "High", "Critical"
    - department (string): The suggested government department
    - priorityScore (number): An integer from 1 to 100
    - suggestedAction (string): A short recommended action

    Description: "${description}"
  `;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama3-8b-8192',
      temperature: 0,
      response_format: { type: 'json_object' }
    });

    const content = chatCompletion.choices[0]?.message?.content || '{}';
    return JSON.parse(content);
  } catch (error) {
    console.error('Groq AI Analysis failed:', error);
    throw new Error('AI Analysis failed');
  }
};
