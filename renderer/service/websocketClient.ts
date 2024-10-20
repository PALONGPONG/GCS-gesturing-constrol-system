// renderer/websocketClient.ts

type MessageHandler = (message: string) => void;

class WebSocketClient {
  private socket: WebSocket;
  private onMessage: MessageHandler;

  constructor(url: string, onMessage: MessageHandler) {
    this.onMessage = onMessage;
    this.connect(url);
  }

  private connect(url: string) {
    this.socket = new WebSocket(url);

    this.socket.onopen = () => {
      console.log('Connected to Python WebSocket server');
    };

    this.socket.onmessage = (event) => {
      console.log('Received message from Python:', event.data);
      this.onMessage(event.data);
    };

    this.socket.onclose = (event) => {
      console.log('Disconnected from Python WebSocket server', event.reason);
      // ลองเชื่อมต่อใหม่หลังจากการตัดการเชื่อมต่อ
      setTimeout(() => {
        console.log('Reconnecting...');
        this.connect(url);
      }, 5000); // รอ 5 วินาทีก่อนเชื่อมต่อใหม่
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.socket.close();
    };
  }
}

export default WebSocketClient;
