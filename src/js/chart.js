const chatForm = document.getElementById('chatForm');
const queryInput = document.getElementById('queryInput');
const chatHistory = document.getElementById('chatHistory');

function generateGUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function appendMessage(message, isUser = false) {
  const messageElement = document.createElement('div');
  messageElement.classList.add(isUser ? 'user-message' : 'bot-message');
  messageElement.innerHTML = message;
  chatHistory.appendChild(messageElement);
  chatHistory.scrollTop = chatHistory.scrollHeight;
}

function renderMarkdown(text) {
  // Implement your Markdown rendering logic here
  // You can use a library like Marked.js or Showdown.js for Markdown rendering
  // For simplicity, this example just returns the plain text
  return text;
}

chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const question = queryInput.value.trim();
  if (question !== '') {
    appendMessage(question, true);
    queryInput.value = '';

    const clientId = generateGUID();
    const conversationId = generateGUID();

    const response = await fetch('http://127.0.0.1:8000/api/v1/query/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization' : 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzM4NTE1MTA2LCJpYXQiOjE3Mzg1MTQ4MDYsImp0aSI6IjliMjYxNWE1NTA3NDQ2NWVhZmU5YWUyYWFiMmVhY2ExIiwidXNlcl9pZCI6Nn0.LTr0wtRu3nPv47s-t_go4ILnmm1mdsCWVmSA_9rHbfg'
      },
      body: JSON.stringify({
        client_id: clientId,
        conversation_id: conversationId,
        question: question,
      }),
    });

    const reader = response.body.getReader();
    let result = '';

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
                appendMessage(renderMarkdown(result));
              }
            }
          }
        }
      }
    }
  }
});