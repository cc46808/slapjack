// client/src/services/websocket.js
let ws = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

export const createWebSocketClient = (handlers = {}) => {
  const wsUrl = `ws://${window.location.hostname}:3001/ws`;
  console.log('Creating WebSocket connection to:', wsUrl);
  
  const ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    console.log('WebSocket connection established');
    if (handlers.onOpen) handlers.onOpen();
  };

  ws.onclose = () => {
    console.log('WebSocket connection closed');
    if (handlers.onClose) handlers.onClose();
  };

  ws.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data);
      console.log('Received message:', message);
      if (handlers.onMessage) handlers.onMessage(message);
    } catch (error) {
      console.error('Message parsing error:', error);
    }
  };

  return {
    send: (message) => {
      if (ws.readyState === WebSocket.OPEN) {
        const formattedMessage = {
          type: message.type,
          payload: {
            ...message.payload
          }
        };
        console.log('Sending message:', formattedMessage);
        ws.send(JSON.stringify(formattedMessage));
      }
    },
    close: () => ws.close()
  };
};

export const sendMessage = (type, payload) => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    const message = {
      type: type.toLowerCase(),
      payload
    };
    console.log('Sending message:', message);
    ws.send(JSON.stringify(message));
  }
};

export const getConnectionStatus = () => {
  return ws ? ws.readyState : WebSocket.CLOSED;
};

export const closeConnection = () => {
  if (ws) {
    ws.close();
  }
};