import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from "dotenv";

// Load environment variables
config({ path: "./.env" });

const testGeminiAPI = async () => {
  try {
    console.log('Testing Gemini API...');
    console.log('API Key:', process.env.GEMINI_API_KEY ? 'Found' : 'Not found');
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = "Explain how AI works in a few words";
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ Gemini API Test Successful!');
    console.log('Response:', text);
  } catch (error) {
    console.error('❌ Gemini API Test Failed:');
    console.error('Error:', error.message);
  }
};

testGeminiAPI();
