import { GoogleGenAI, Type } from "@google/genai";

// Initialize the Gemini API client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateMinecraftSentence(word: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are an English teacher for a middle school student who loves Minecraft. 
      Generate a short, simple English example sentence using the word "${word}". 
      The sentence MUST be themed around Minecraft (e.g., mining, crafting, creepers, diamonds, surviving).
      Also provide the Chinese translation.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sentence: { type: Type.STRING, description: "The English example sentence about Minecraft" },
            translation: { type: Type.STRING, description: "The Chinese translation of the sentence" }
          },
          required: ["sentence", "translation"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    return null;
  } catch (error) {
    console.error("Error generating sentence:", error);
    return null;
  }
}

export interface AssessmentQuestion {
  id: string;
  type: 'multiple_choice' | 'fill_blank' | 'sentence_ordering' | 'translation' | 'error_correction';
  question: string;
  options?: string[];
  correctAnswer: string;
  hint?: string;
}

export interface QuestionFeedback {
  id: string;
  isCorrect: boolean;
  userAnswer: string;
  correctAnswer: string;
  explanation: string;
}

export interface AssessmentFeedback {
  questionFeedbacks: QuestionFeedback[];
  totalScore: number;
  cefrLevel: string;
  cefrDescription: string;
  suggestions: string;
  encouragement: string;
}

export async function generateAssessmentQuestions(difficulty: number): Promise<AssessmentQuestion[] | null> {
  const difficultyLabel = difficulty === 1 ? '初级 (A1-A2)' : difficulty === 2 ? '中级 (B1)' : '高级 (B2)';
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are an English teacher creating a comprehensive English assessment for Chinese students who love Minecraft. 
      Generate exactly 10 questions (2 of each type) at ${difficultyLabel} difficulty level.
      ALL questions MUST be themed around Minecraft.
      
      Question types:
      1. multiple_choice: 4 options, test vocabulary/grammar
      2. fill_blank: fill in a blank in a Minecraft-themed sentence
      3. sentence_ordering: words are given shuffled, student must form correct sentence (correctAnswer is the correct sentence, question contains the shuffled words as a comma-separated list)
      4. translation: translate a Chinese phrase to English
      5. error_correction: find and correct a grammar error in a sentence
      
      Return exactly 10 questions with ids q1-q10.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  type: { type: Type.STRING },
                  question: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  correctAnswer: { type: Type.STRING },
                  hint: { type: Type.STRING }
                },
                required: ["id", "type", "question", "correctAnswer"]
              }
            }
          },
          required: ["questions"]
        }
      }
    });

    if (response.text) {
      const parsed = JSON.parse(response.text);
      return parsed.questions as AssessmentQuestion[];
    }
    return null;
  } catch (error) {
    console.error("Error generating assessment questions:", error);
    return null;
  }
}

export async function generateAssessmentFeedback(
  questions: AssessmentQuestion[],
  userAnswers: Record<string, string>
): Promise<AssessmentFeedback | null> {
  const answersText = questions.map(q => (
    `题目ID: ${q.id}, 类型: ${q.type}, 题目: ${q.question}, 正确答案: ${q.correctAnswer}, 用户答案: ${userAnswers[q.id] ?? '(未作答)'}`
  )).join('\n');

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are an English teacher evaluating a Minecraft-themed English assessment for a Chinese student.
      Evaluate each answer and provide detailed feedback in Chinese.
      
      Answers to evaluate:
      ${answersText}
      
      For each question, determine if the answer is correct (be lenient with capitalization and minor spelling for translation/fill_blank types).
      Calculate total score out of 100 (each question worth 10 points).
      Assess the CEFR level based on performance.
      Provide personalized suggestions in Chinese focusing on weak areas.
      End with a Minecraft-themed encouragement message in Chinese.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questionFeedbacks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  isCorrect: { type: Type.BOOLEAN },
                  userAnswer: { type: Type.STRING },
                  correctAnswer: { type: Type.STRING },
                  explanation: { type: Type.STRING }
                },
                required: ["id", "isCorrect", "userAnswer", "correctAnswer", "explanation"]
              }
            },
            totalScore: { type: Type.NUMBER },
            cefrLevel: { type: Type.STRING },
            cefrDescription: { type: Type.STRING },
            suggestions: { type: Type.STRING },
            encouragement: { type: Type.STRING }
          },
          required: ["questionFeedbacks", "totalScore", "cefrLevel", "cefrDescription", "suggestions", "encouragement"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as AssessmentFeedback;
    }
    return null;
  } catch (error) {
    console.error("Error generating assessment feedback:", error);
    return null;
  }
}

export async function analyzeArticle(content: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are an English teacher. Analyze the following Minecraft-themed article for a middle school student.
      Identify:
      1. Key vocabulary words (3-5 words) with their Chinese meanings.
      2. Difficult sentences (1-2 sentences) with grammatical analysis and Chinese translation.
      3. A short summary of the article in English.
      
      Article: "${content}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            vocabulary: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  word: { type: Type.STRING },
                  meaning: { type: Type.STRING }
                }
              }
            },
            difficultSentences: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  sentence: { type: Type.STRING },
                  analysis: { type: Type.STRING },
                  translation: { type: Type.STRING }
                }
              }
            },
            summary: { type: Type.STRING }
          },
          required: ["vocabulary", "difficultSentences", "summary"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    return null;
  } catch (error) {
    console.error("Error analyzing article:", error);
    return null;
  }
}
