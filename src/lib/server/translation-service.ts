import OpenAI from 'openai';
import 'dotenv/config';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export async function translateToEnglish(text: string): Promise<string> {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: `You are a professional translator. If the following text is not in English, translate it to English. If it is already in English, return it as is. Respond with only the text, nothing else.`
                },
                {
                    role: "user",
                    content: text
                }
            ],
            temperature: 0
        });

        return response.choices[0].message.content?.trim() || text;
    } catch (error) {
        console.error('Error translating text:', error);
        return text; // Return original text if translation fails
    }
} 