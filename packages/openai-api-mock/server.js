import express from 'express';
import cors from 'cors';
import { generateChatResponse, generateStreamingChatResponse } from './src/utils/responseGenerators.js';
import { createResponseTemplate } from './src/utils/responseTemplates.js';
import { faker } from '@faker-js/faker';

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Configuration
let mockConfig = {
  includeErrors: false,
  latency: 100, // 100ms delay for realistic feeling
  logRequests: true,
  seed: 12345, // Fixed seed for consistent responses
  useFixedResponses: false,
};

// Set faker seed for consistent responses
faker.seed(mockConfig.seed);

console.log('🚀 OpenAI API Mock Server Configuration:');
console.log('📋 Seed:', mockConfig.seed);
console.log('⏱️  Latency:', mockConfig.latency + 'ms');
console.log('📝 Log Requests:', mockConfig.logRequests);

// Chat completions endpoint
app.post('/v1/chat/completions', async (req, res) => {
  if (mockConfig.logRequests) {
    console.log('📥 Chat Completion Request:', {
      model: req.body.model,
      messageCount: req.body.messages?.length,
      stream: req.body.stream,
      timestamp: new Date().toISOString()
    });
  }

  // Add artificial delay
  if (mockConfig.latency > 0) {
    await new Promise(resolve => setTimeout(resolve, mockConfig.latency));
  }

  // Simulate random errors
  if (mockConfig.includeErrors && Math.random() < 0.1) {
    return res.status(500).json({
      error: {
        message: "Simulated API error",
        type: "server_error",
        code: "internal_server_error"
      }
    });
  }

  const isStreaming = req.body.stream === true;

  try {
    if (isStreaming) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      
      const processStream = async () => {
        try {
          const streamGenerator = generateStreamingChatResponse(req.body);
          
          for await (const chunk of streamGenerator) {
            res.write(chunk + '\n');
          }
          res.write('data: [DONE]\n\n');
          res.end();
        } catch (error) {
          console.error('Streaming error:', error);
          res.end();
        }
      };
      
      processStream();
    } else {
      const response = generateChatResponse(req.body);
      if (mockConfig.logRequests) {
        console.log('📤 Chat Completion Response:', {
          id: response.id,
          model: response.model,
          usage: response.usage,
          timestamp: new Date().toISOString()
        });
      }
      res.json(response);
    }
  } catch (error) {
    console.error('Error generating response:', error);
    res.status(500).json({
      error: {
        message: "Failed to generate mock response",
        type: "server_error",
        code: "internal_server_error"
      }
    });
  }
});

// Image generation endpoint
app.post('/v1/images/generations', async (req, res) => {
  if (mockConfig.logRequests) {
    console.log('📥 Image Generation Request:', {
      prompt: req.body.prompt?.substring(0, 100) + '...',
      n: req.body.n || 1,
      size: req.body.size || '1024x1024',
      timestamp: new Date().toISOString()
    });
  }

  // Add artificial delay
  if (mockConfig.latency > 0) {
    await new Promise(resolve => setTimeout(resolve, mockConfig.latency));
  }

  const mockImageResponse = {
    created: Math.floor(Date.now() / 1000),
    data: Array.from({ length: req.body.n || 1 }, (_, i) => ({
      url: `https://picsum.photos/1024/1024?random=${Date.now() + i}`,
      revised_prompt: req.body.prompt
    }))
  };

  if (mockConfig.logRequests) {
    console.log('📤 Image Generation Response:', {
      created: mockImageResponse.created,
      imageCount: mockImageResponse.data.length,
      timestamp: new Date().toISOString()
    });
  }

  res.json(mockImageResponse);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'OpenAI API Mock',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    config: mockConfig
  });
});

// Configuration endpoint
app.get('/config', (req, res) => {
  res.json(mockConfig);
});

app.post('/config', (req, res) => {
  mockConfig = { ...mockConfig, ...req.body };
  if (mockConfig.seed) {
    faker.seed(mockConfig.seed);
  }
  console.log('🔧 Configuration updated:', mockConfig);
  res.json(mockConfig);
});

// Start server
app.listen(PORT, () => {
  console.log('');
  console.log('🎭 OpenAI API Mock Server Started!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`🌐 Server running on: http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log(`⚙️  Configuration: http://localhost:${PORT}/config`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📡 Available Endpoints:');
  console.log(`   POST http://localhost:${PORT}/v1/chat/completions`);
  console.log(`   POST http://localhost:${PORT}/v1/images/generations`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
}); 