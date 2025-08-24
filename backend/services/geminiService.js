import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const extractDataFromResume = async (resumeText) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
    Extract the following information from this resume text and return it as a JSON object. 
    Generate a professional cover letter based on the resume content (2-3 paragraphs highlighting skills and experience).
    
    Required format:
    {
      "name": "Full name of the person",
      "email": "Email address",
      "phone": "Phone number with proper formatting",
      "address": "Full address or city, state",
      "coverLetter": "Generate a professional 2-3 paragraph cover letter based on the resume highlighting the person's experience, skills, and enthusiasm for the role. Make it personalized based on their background."
    }
    
    Resume text:
    ${resumeText}
    
    If any field is not found in the resume, leave it as an empty string. 
    For the cover letter, always generate one based on the available information.
    Make sure the response is valid JSON only, wrapped in triple backticks with json language identifier.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean the response to extract JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    throw new Error('Failed to extract JSON from response');
  } catch (error) {
    console.error('Gemini AI Error:', error);
    throw new Error('Failed to process resume with AI');
  }
};
