import { faker } from '@faker-js/faker';
import { generateChatResponse, generateStreamingChatResponse } from './utils/responseGenerators.js';
import { createResponseTemplate } from './utils/responseTemplates.js';

let isMockingEnabled = false;
let mockConfig = {
  includeErrors: false,
  latency: 0,
  logRequests: false,
  seed: null,
  useFixedResponses: false,
};

const mockOpenAIResponse = (force = false, options = {}) => {
  if (!force && process.env.NODE_ENV === 'production') {
    return;
  }

  isMockingEnabled = true;
  mockConfig = { ...mockConfig, ...options };

  if (mockConfig.seed) {
    faker.seed(mockConfig.seed);
  }

  // Return control methods
  return {
    isActive: true,
    stopMocking: () => {
      isMockingEnabled = false;
    },
    setSeed: (seed) => {
      mockConfig.seed = seed;
      faker.seed(seed);
    },
    resetSeed: () => {
      mockConfig.seed = null;
      faker.seed();
    },
    getResponseTemplates: () => createResponseTemplate,
    createResponseTemplate: (name, template) => {
      return createResponseTemplate(name, template);
    },
  };
};

// Intercept fetch requests
const originalFetch = window.fetch;
window.fetch = async function (url, options) {
  if (!isMockingEnabled || !url.includes('api.openai.com')) {
    return originalFetch.apply(this, arguments);
  }

  if (mockConfig.logRequests) {
    console.log('Intercepted OpenAI API request:', { url, options });
  }

  // Add artificial delay
  if (mockConfig.latency > 0) {
    await new Promise(resolve => setTimeout(resolve, mockConfig.latency));
  }

  // Simulate random errors
  if (mockConfig.includeErrors && Math.random() < 0.1) {
    throw new Error('Simulated API error');
  }

  const body = options.body ? JSON.parse(options.body) : {};
  const isStreaming = body.stream === true;

  if (url.includes('/v1/chat/completions')) {
    if (isStreaming) {
      const stream = generateStreamingChatResponse(body);
      return new Response(stream, {
        status: 200,
        headers: {
          'Content-Type': 'text/event-stream',
        },
      });
    } else {
      const response = generateChatResponse(body);
      return new Response(JSON.stringify(response), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
  }

  // Pass through other requests
  return originalFetch.apply(this, arguments);
};

export { mockOpenAIResponse };
