import { faker } from '@faker-js/faker';
import { getContentSample } from './contentSamples.js';

export const generateChatResponse = (requestBody) => {
  const { messages } = requestBody;
  const lastMessage = messages[messages.length - 1];

  const content = getContentSample(lastMessage.content);

  return {
    id: faker.string.alphanumeric({ length: 28, prefix: 'chatcmpl-' }),
    object: 'chat.completion',
    created: Math.floor(Date.now() / 1000),
    model: requestBody.model || 'gpt-3.5-turbo',
    choices: [
      {
        index: 0,
        message: {
          role: 'assistant',
          content,
        },
        finish_reason: 'stop',
      },
    ],
    usage: {
      prompt_tokens: faker.number.int({ min: 10, max: 100 }),
      completion_tokens: faker.number.int({ min: 20, max: 200 }),
      total_tokens: faker.number.int({ min: 30, max: 300 }),
    },
  };
};

export const generateStreamingChatResponse = async function* (requestBody) {
  const { messages } = requestBody;
  const lastMessage = messages[messages.length - 1];
  const content = getContentSample(lastMessage.content);
  const words = content.split(' ');

  const id = faker.string.alphanumeric({ length: 28, prefix: 'chatcmpl-' });
  
  // Send role first
  yield `data: ${JSON.stringify({
    id,
    object: 'chat.completion.chunk',
    created: Math.floor(Date.now() / 1000),
    model: requestBody.model || 'gpt-3.5-turbo',
    choices: [{
      index: 0,
      delta: { role: 'assistant' },
      finish_reason: null
    }]
  })}\n\n`;

  // Send content word by word
  for (const word of words) {
    yield `data: ${JSON.stringify({
      id,
      object: 'chat.completion.chunk',
      created: Math.floor(Date.now() / 1000),
      model: requestBody.model || 'gpt-3.5-turbo',
      choices: [{
        index: 0,
        delta: { content: word + ' ' },
        finish_reason: null
      }]
    })}\n\n`;
    
    // Add random delay between words
    await new Promise(resolve => setTimeout(resolve, faker.number.int({ min: 10, max: 100 })));
  }

  // Send final chunk
  yield `data: ${JSON.stringify({
    id,
    object: 'chat.completion.chunk',
    created: Math.floor(Date.now() / 1000),
    model: requestBody.model || 'gpt-3.5-turbo',
    choices: [{
      index: 0,
      delta: {},
      finish_reason: 'stop'
    }]
  })}\n\n`;

  yield 'data: [DONE]\n\n';
};