import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from "dotenv";

// Load environment variables
config({ path: "./.env" });

const testGeminiAPI = async () => {
  try {
    console.log('🧪 Testing Gemini API with updated model...');
    console.log('API Key:', process.env.GEMINI_API_KEY ? '✅ Found' : '❌ Not found');
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = "Extract the following information from this resume text and return it as a JSON object: { name: 'John Doe', email: 'john@example.com', phone: '123-456-7890', address: '123 Main St', coverLetter: 'Professional cover letter here' }. Resume text: John Doe Software Engineer john@example.com 123-456-7890 123 Main Street Experience: 5 years in web development";
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ Gemini API Test Successful!');
    console.log('Response:', text);
    
    // Try to parse JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      console.log('✅ JSON Parsing Successful!');
      console.log('Parsed Data:', parsed);
    } else {
      console.log('⚠️ JSON not found in response');
    }
  } catch (error) {
    console.error('❌ Gemini API Test Failed:');
    console.error('Error:', error.message);
    console.error('Error Details:', error);
  }
};

testGeminiAPI();
