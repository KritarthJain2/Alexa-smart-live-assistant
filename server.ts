import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Check status of Gemini configuration
app.get('/api/assistant/status', (req, res) => {
  const isKeyConfigured = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0 && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY');
  res.json({
    configured: isKeyConfigured,
    model: 'gemini-3.8-flash',
    mode: isKeyConfigured ? 'gemini_cloud' : 'local_rule_engine',
    version: '1.0.0',
    capabilities: [
      'create_task',
      'query_tasks',
      'create_routine',
      'summarize_schedule',
      'productivity_advice'
    ]
  });
});

// Assistant chat endpoint
app.post('/api/assistant/chat', async (req, res) => {
  const { message, context } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message text is required.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const isKeyConfigured = Boolean(apiKey && apiKey.trim().length > 0 && apiKey !== 'MY_GEMINI_API_KEY');

  if (!isKeyConfigured) {
    return res.status(200).json({
      configured: false,
      reply: null,
      error: 'GEMINI_API_KEY is not configured on the server. Falling back to local assistant engine.',
      modeUsed: 'local'
    });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const tasks = context?.tasks || [];
    const routines = context?.routines || [];
    const userName = context?.userProfile?.name || 'User';

    const systemInstruction = `You are Alexa+, an advanced, intelligent personal live assistant.
You help ${userName} manage daily tasks, deadlines, routines, and overall productivity with a helpful, friendly, and concise tone.
Current local date context is ${new Date().toISOString().split('T')[0]}.
Current tasks in system: ${JSON.stringify(tasks.slice(0, 30))}
Current routines: ${JSON.stringify(routines)}

When the user asks to perform an action, you should call one of the available functions.
If the user is asking a general question, asking for advice, or conversational query, answer clearly and concisely (2-4 sentences max), formatted nicely.
Never claim you have performed an action unless you called the appropriate tool/function.
Always be realistic, encouraging, and organized.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: message,
      config: {
        systemInstruction,
        tools: [
          {
            functionDeclarations: [
              {
                name: 'create_task',
                description: 'Creates a new task in the task manager with specified details.',
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING, description: 'The title of the task.' },
                    description: { type: Type.STRING, description: 'Optional description or notes for the task.' },
                    dueDate: { type: Type.STRING, description: 'Due date in YYYY-MM-DD format.' },
                    dueTime: { type: Type.STRING, description: 'Due time in HH:mm 24hr or 12hr format like "14:00" or "02:00 PM".' },
                    priority: { 
                      type: Type.STRING, 
                      description: 'Priority level: urgent, high, medium, or low.' 
                    },
                    category: { 
                      type: Type.STRING, 
                      description: 'Category tag such as Work, Personal, Study, Health, Finance, Project, or Other.' 
                    }
                  },
                  required: ['title']
                }
              },
              {
                name: 'complete_task',
                description: 'Marks an existing task as completed based on title or ID.',
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    query: { type: Type.STRING, description: 'The title substring or keyword to identify the task.' }
                  },
                  required: ['query']
                }
              },
              {
                name: 'create_routine',
                description: 'Creates a recurring daily or weekly routine habit.',
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING, description: 'Name of the routine (e.g., Morning Jog, Read Book).' },
                    time: { type: Type.STRING, description: 'Time of day for the routine (e.g., 07:00 AM).' },
                    description: { type: Type.STRING, description: 'Short description.' },
                    daysOfWeek: {
                      type: Type.ARRAY,
                      items: { type: Type.INTEGER },
                      description: 'Array of numbers 0-6 where 0 is Sunday, 1 is Monday, etc.'
                    },
                    category: { type: Type.STRING, description: 'Category e.g. Health, Study, Work, Personal' }
                  },
                  required: ['name', 'time']
                }
              },
              {
                name: 'summarize_tasks',
                description: 'Summarizes tasks and schedule for today or a specific time frame.',
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    timeFrame: { type: Type.STRING, description: 'today, week, overdue, or pending' }
                  }
                }
              }
            ]
          }
        ]
      }
    });

    const functionCalls = response.functionCalls;
    const replyText = response.text || '';

    return res.status(200).json({
      success: true,
      configured: true,
      reply: replyText,
      functionCalls: functionCalls || [],
      modeUsed: 'gemini'
    });
  } catch (err: any) {
    console.error('Gemini API execution error:', err);
    return res.status(200).json({
      success: false,
      configured: true,
      error: err.message || 'Gemini API call failed',
      modeUsed: 'gemini_error_fallback'
    });
  }
});

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Alexa+ Smart Live Assistant server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
