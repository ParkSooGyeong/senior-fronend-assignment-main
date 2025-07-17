import { Readable } from 'node:stream';
import { getSteamChatObject } from './utils/responseGenerators.js'

export function createChatStream(requestBody) {
    const stream = new Readable({
        read() { }
    });

    let count = 0;
    const maxCount = 500;

    function sendData() {
        setTimeout(() => {
            if (count === 0) {
                stream.push(`data: ${getSteamChatObject(requestBody.messages, true)}\n\n`);
            } else {
                const chunk = getSteamChatObject(requestBody.messages, false);
                const parsedChunk = JSON.parse(chunk);
                
                stream.push(`data: ${chunk}\n\n`);
                
                if (parsedChunk.choices[0].finish_reason === "stop") {
                    stream.push(`data: [DONE]\n\n`);
                    stream.push(null);
                    return;
                }
                
                if (count >= maxCount - 1) {
                    stream.push(`data: [DONE]\n\n`);
                    stream.push(null);
                    return;
                }
            }
            count++;
            sendData();
        }, 50);
    }

    sendData();

    return stream;
}