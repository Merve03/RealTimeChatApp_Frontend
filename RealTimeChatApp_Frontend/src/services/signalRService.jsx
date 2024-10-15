import * as signalR from "@microsoft/signalr";

const HUB_BASE_URL = import.meta.env.VITE_HUB_BASE_URL;

class SignalRService {
  constructor() {
    this.chatHubConn = null; // class properties
    this.notificationHubConn = null;
    this.jwtToken = null;
    this.messageQueue = []; // storing unsent messages
  }

  // Initialization and Connection Management
  initializeConnections(jwtToken) {
    this.jwtToken = jwtToken;

    if (!this.chatHubConn) {
      this.chatHubConn = new signalR.HubConnectionBuilder()
        .withUrl(`${HUB_BASE_URL}/chat`, {
          accessTokenFactory: () => this.jwtToken,
        })
        .configureLogging(signalR.LogLevel.Information)
        .withAutomaticReconnect()
        .build();

      this.chatHubConn.onclose(async () => {
        console.log("Chat hub disconnected. Attempting to reconnect...");
        await this.startConnections();
      });
    }

    if (!this.notificationHubConn) {
      this.notificationHubConn = new signalR.HubConnectionBuilder()
        .withUrl(`${HUB_BASE_URL}/notification`, {
          accessTokenFactory: () => this.jwtToken,
        })
        .configureLogging(signalR.LogLevel.Information)
        .withAutomaticReconnect()
        .build();

      this.notificationHubConn.onclose(async () => {
        console.log(
          "Notification hub disconnected. Attempting to reconnect..."
        );
        await this.startConnections();
      });
    }
  }

  async startConnections() {
    try {
      if (
        this.chatHubConn &&
        this.chatHubConn.state === signalR.HubConnectionState.Disconnected
      ) {
        await this.chatHubConn.start();
        console.log("Chat hub connected...");
        this.processMessageQueue();
      }

      if (
        this.notificationHubConn &&
        this.notificationHubConn.state ===
          signalR.HubConnectionState.Disconnected
      ) {
        await this.notificationHubConn.start();
        console.log("Notification hub connected...");
      }
    } catch (err) {
      console.error("Connection failed:", err);
      setTimeout(() => this.startConnections(), 5000); // Retry connection on failure
    }
  }

  async stopConnections() {
    if (this.chatHubConn) {
      await this.chatHubConn.stop();
      console.log("Chat hub stopped.");
    }

    if (this.notificationHubConn) {
      await this.notificationHubConn.stop();
      console.log("Notification hub stopped.");
    }
  }

  // Messaging Methods
  async joinChatRoom(chatId) {
    try {
      await this.chatHubConn.invoke("JoinChatRoom", chatId); // calling hub method
    } catch (error) {
      console.error("Error joining chat room:", error);
    }
  }

  async leaveChatRoom(chatId) {
    try {
      await this.chatHubConn.invoke("LeaveChatRoom", chatId);
    } catch (error) {
      console.error("Error leaving chat room:", error);
    }
  }

  async sendMessage(chatId, message) {
    if (this.chatHubConn.state === signalR.HubConnectionState.Connected) {
      try {
        await this.chatHubConn.invoke("SendMessage", chatId, message);
      } catch (error) {
        console.error("Error sending message:", error);
      }
    } else {
      this.messageQueue.push({ chatId, message });
      console.log("Message queued due to disconnected state");
    }
  }

  async processMessageQueue() {
    while (this.messageQueue.length > 0) {
      const { chatId, message } = this.messageQueue.shift(); // get the oldest message
      try {
        await this.chatHubConn.invoke("SendMessage", chatId, message);
        console.log("Queued message sent.");
      } catch (err) {
        console.error("Error sending queued message: ", err);
        this.messageQueue.unshift({ chatId, message }); // put it back to the queue
        break;
      }
    }
  }

  async fetchPreviousMessages(chatId) {
    try {
      await this.chatHubConn.invoke("GetChatMessages", chatId);
    } catch (err) {
      console.error("Error fetching previous messages:", err);
      throw new Error("Failed to fetch previous messages.");
    }
  }

  // Event Handlers
  async onReceiveMessage(callback) {
    this.chatHubConn.on("ReceiveMessage", (messageDetails) => {
      callback(messageDetails);
    });
  }
  async offReceiveMessage() {
    this.chatHubConn.off("ReceiveMessage");
  }

  async onReceivePreviousMessages(callback) {
    this.chatHubConn.on("ReceivePreviousMessages", (messages) => {
      callback(messages);
    });
  }
  async offReceivePreviousMessage() {
    this.chatHubConn.off("ReceivePreviousMessage");
  }

  async onReceiveErrorMessage(callback) {
    this.chatHubConn.on("ReceiveErrorMessage", (errorMessage) => {
      callback(errorMessage);
    });
  }
  async offReceiveErrorMessage() {
    this.chatHubConn.off("ReceiveErrorMessage");
  }

  async getFriendsOnlineStatus() {
    try {
      await this.notificationHubConn.invoke("GetFriendsOnlineStatus");
    } catch (err) {
      console.error("Error invoking GetFriendsOnlineStatus:", err);
    }
  }

  async sendTypingNotification(chatId) {
    try {
      await this.notificationHubConn.invoke("SendTypingNotification", chatId);
    } catch (err) {
      console.error("Error invoking SendTypingNotification:", err);
    }
  }

  async markPrivateAsRead(messageId, recipientId) {
    try {
      await this.notificationHubConn.invoke(
        "MarkPrivateAsRead",
        messageId,
        recipientId
      );
    } catch (err) {
      console.error("Error invoking MarkPrivateAsRead:", err);
    }
  }

  async markGroupAsRead(messageId, userId) {
    try {
      await this.notificationHubConn.invoke(
        "MarkGroupAsRead",
        messageId,
        userId
      );
    } catch (err) {
      console.error("Error invoking MarkGroupAsRead:", err);
    }
  }

  // Notification Event Handlers
  async onReceiveFriendsOnlineStatus(callback) {
    this.notificationHubConn.on(
      "ReceiveFriendsOnlineStatus",
      (onlineStatus) => {
        callback(onlineStatus);
      }
    );
  }

  async onReceiveTypingNotification(callback) {
    this.notificationHubConn.on("ReceiveTypingNotification", (userId) => {
      callback(userId);
    });
  }

  async onReceivePrivateMessageRead(callback) {
    this.notificationHubConn.on(
      "ReceivePrivateMessageRead",
      (messageId, recipientId) => {
        callback(messageId, recipientId);
      }
    );
  }

  async onReceiveGroupMessageRead(callback) {
    this.notificationHubConn.on(
      "ReceiveGroupMessageRead",
      (messageId, userId) => {
        callback(messageId, userId);
      }
    );
  }

  async onReceiveNotificationErrorMessage(callback) {
    this.notificationHubConn.on("ReceiveErrorMessage", (errorMessage) => {
      callback(errorMessage);
    });
  }
}

const signalRService = new SignalRService();
export default signalRService;
