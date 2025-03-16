import { get_access_token } from "./token_utils";
import { initializeMarkdown, renderMarkdown } from "./markdown_utils.js";
import { setCookie, getCookie, checkCookie } from "./cookie_utils.js";

function generateGUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Function to get or create client_id
function createClientId() {
  const newClientId = generateGUID();
  // Set cookie to expire in 30 days
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + 30);
  setCookie('client_id', newClientId, expirationDate.toUTCString());
  
  return newClientId;
}

function buildUserMessageElement(message, conversationId) {
  const message_element = `
    <div id="conversation-${conversationId}-user" class="flex gap-3 my-4 text-gray-600 text-sm">
      <span class="relative flex shrink-0 overflow-hidden rounded-full w-8 h-8">
        <div class="rounded-full bg-gray-100 border p-1">
          <svg stroke="none" fill="black" stroke-width="1.5" viewBox="0 0 24 24" aria-hidden="true" height="20" width="20" xmlns="http://www.w3.org/2000/svg">
            <path d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
        </div>
      </span>
      <div class="flex-1 max-w-3xl">
        <div class="font-bold text-gray-700 mb-1">You</div>
        <div class="message-content">${message}</div>
      </div>
    </div>
  `;
  return message_element;
}

function buildAIMessageElement(message, conversationId) {
  const message_element = `
    <div id="conversation-${conversationId}-ai" class="flex gap-3 my-4 text-gray-600 text-sm">
      <span class="relative flex shrink-0 overflow-hidden rounded-full w-8 h-8">
        <div class="rounded-full bg-gray-100 border p-1">
          <svg stroke="none" fill="black" stroke-width="1.5" viewBox="0 0 24 24" aria-hidden="true" height="20" width="20" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z">
            </path>
          </svg>
        </div>
      </span>
      <div class="flex-1 max-w-3xl">
        <div class="font-bold text-gray-700 mb-1">DocGenie</div>
        <div class="message-content markdown-content">${message}</div>
      </div>
    </div>
  `;
  return message_element;
}

function updateAIMessage(message, conversationId) {
  const messageDiv = document.getElementById(`conversation-${conversationId}-ai`);
  if (messageDiv) {
    const contentDiv = messageDiv.querySelector('.message-content');
    contentDiv.innerHTML = message;
    chatHistory.scrollTop = chatHistory.scrollHeight;
  }
}

function appendMessage(message, conversationId, isUser = false) {
  const messageElement = isUser 
    ? buildUserMessageElement(message, conversationId) 
    : buildAIMessageElement(message, conversationId);
  chatHistory.innerHTML += messageElement;
  chatHistory.scrollTop = chatHistory.scrollHeight;
}

async function handleChatSubmit(e) {
  e.preventDefault();
  const question = queryInput.value.trim();
  if (question !== '') {
    let clientId;
    if (checkCookie('client_id')) {
      clientId = getCookie('client_id');
    }
    else{
      clientId = createClientId()
    }
    const conversationId = generateGUID();  // One conversationId for both question and answer

    // Add user's question with the conversationId
    appendMessage(question, conversationId, true);
    queryInput.value = '';

    const access_token = await get_access_token();

    const response = await fetch('http://localhost:8000/api/v1/query/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${access_token}`
      },
      body: JSON.stringify({
        client_id: clientId,
        conversation_id: conversationId,
        question: question,
      }),
    });

    const reader = response.body.getReader();
    let result = '';
    
    // Add initial empty AI message with the same conversationId
    appendMessage('', conversationId, false);

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = new TextDecoder('utf-8').decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.trim() !== '') {
          console.log(line);
          const dataIndex = line.indexOf('data:');
          if (dataIndex !== -1) {
            const jsonData = line.slice(dataIndex + 5).trim();
            if (jsonData !== '') {
              const data = JSON.parse(jsonData);
              if (data.type === 'chunk') {
                result += data.data;
                // Update AI message with the same conversationId
                updateAIMessage(renderMarkdown(result), conversationId);
              }
            }
          }
        }
      }
    }
  }
}

if (window.location.href.includes("/qna.html")) {
  initializeMarkdown()

  document.addEventListener('DOMContentLoaded', () => {
    // Ensure client_id exists
    createClientId();

    const chatForm = document.getElementById('chatForm');
    const queryInput = document.getElementById('queryInput');
    const chatHistory = document.getElementById('chatHistory');

    chatForm.addEventListener('submit', handleChatSubmit);
  });
}