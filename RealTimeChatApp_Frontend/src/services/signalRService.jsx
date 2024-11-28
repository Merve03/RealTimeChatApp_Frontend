import * as signalR from "@microsoft/signalr";

const HUB_BASE_URL = import.meta.env.VITE_HUB_BASE_URL;

class SignalRService {
  constructor() {
    // Class properties
    this.chatHubConn = null;
    this.groupHubConn = null;
    this.searchHubConn = null;
    this.jwtToken = null;
    this.messageQueue = []; // Store unsent messages
  }

  // === CONNECTION MANAGEMENT ===
  initializeConnections(jwtToken) {
    this.jwtToken = jwtToken;

    if (!this.chatHubConn) {
      this.chatHubConn = this.createHubConnection("chat");
      this.chatHubConn.onclose(async () => {
        console.log("Chat hub disconnected. Attempting to reconnect...");
        await this.startConnections();
      });
    }

    if (!this.groupHubConn) {
      this.groupHubConn = this.createHubConnection("group");
      this.groupHubConn.onclose(async () => {
        console.log("Group hub disconnected. Attempting to reconnect...");
        await this.startConnections();
      });
    }

    if (!this.searchHubConn) {
      this.searchHubConn = this.createHubConnection("search");
      this.searchHubConn.onclose(async () => {
        console.log("Search hub disconnected. Attempting to reconnect...");
        await this.startConnections();
      });
    }
  }

  createHubConnection(hubName) {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${HUB_BASE_URL}/${hubName}`, {
        accessTokenFactory: () => this.jwtToken,
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets, // force websocket
      })
      .configureLogging(signalR.LogLevel.Information)
      .build();

    connection.onreconnecting((error) => {
      console.log(`Connection lost. Reconnecting... Error:${error}`);
    });

    connection.onreconnected((connectionId) => {
      console.log(`Reconnected. Connection ID: ${connectionId}`);
    });

    connection.onclose((error) => {
      console.error(`Connection closed. Error: ${error}`);
    });

    return connection;
  }

  async startConnections() {
    try {
      await this.startHubConnection(this.chatHubConn, "Chat hub");
      await this.startHubConnection(this.groupHubConn, "Group hub");
      await this.startHubConnection(this.searchHubConn, "Search hub");
    } catch (err) {
      console.error("Connection failed:", err);
    }
  }

  async startHubConnection(hubConnection, hubName) {
    try {
      if (hubConnection && hubConnection.state === signalR.HubConnectionState.Disconnected) {
        await hubConnection.start();
        console.log(`${hubName} connected...`);
        //this.processMessageQueue();
      }
    } catch (err) {
      console.error(`Error starting ${hubName}:`, err.message, err.stack);
    }
  }

  async stopConnections() {
    await this.stopHubConnection(this.chatHubConn, "Chat hub");
    await this.stopHubConnection(this.groupHubConn, "Group hub");
    await this.stopHubConnection(this.searchHubConn, "Search Hub");
    this.jwtToken = null;
  }

  async stopHubConnection(hubConnection, hubName) {
    if (hubConnection) {
      await hubConnection.stop();
      console.log(`${hubName} stopped.`);
    }
  }

  // === MESSAGING METHODS ===

  async joinChatRoom(chatId) {
    await this.invokeHubMethod(this.chatHubConn, "JoinChatRoom", chatId);
  }

  async leaveChatRoom(chatId) {
    await this.invokeHubMethod(this.chatHubConn, "LeaveChatRoom", chatId);
  }

  async joinGroupChatRoom(chatId) {
    await this.invokeHubMethod(this.groupHubConn, "JoinChatRoom", chatId);
  }

  async leaveGroupChatRoom(chatId) {
    await this.invokeHubMethod(this.groupHubConn, "LeaveChatRoom", chatId);
  }

  async sendMessage(chatId, message) {
    if (this.chatHubConn.state === signalR.HubConnectionState.Connected) {
      await this.invokeHubMethod(this.chatHubConn, "SendMessage", chatId, message);
    } else {
      this.queueMessage(chatId, message);
    }
  }

  async sendGroupMessage(chatId, message) {
    if (this.groupHubConn.state === signalR.HubConnectionState.Connected) {
      await this.invokeHubMethod(this.groupHubConn, "SendGroupMessage", chatId, message);
    } else {
      this.queueMessage(chatId, message);
    }
  }

  async broadcastMessage(message) {
    await this.invokeHubMethod(this.chatHubConn, "BroadcastMessage", message);
  }

  queueMessage(chatId, message) {
    this.messageQueue.push({ chatId, message, retries: 0 });
    console.log("Message queued due to disconnected state");
  }

  async processMessageQueue() {
    while (this.messageQueue.length > 0) {
      const { chatId, message, retries } = this.messageQueue.shift(); // Get the oldest message
      const maxRetries = 5;
      if (retries < maxRetries) {
        try {
          await this.sendMessage(chatId, message);
          console.log("Queued message sent.");
        } catch (err) {
          console.error("Error sending queued message: ", err);
          this.messageQueue.unshift({ chatId, message, retries: retries + 1 }); // Requeue the message
          break;
        }
      } else {
        console.error("Max retries reached while queuing message: ", message);
      }
    }
  }

  async fetchPreviousMessages(chatId) {
    await this.invokeHubMethod(this.chatHubConn, "GetChatMessages", chatId);
  }

  async fetchPreviousGroupMessages(chatId) {
    await this.invokeHubMethod(this.groupHubConn, "GetGroupChatMessages", chatId);
  }

  async fetchPreviousBroadcasts() {
    await this.invokeHubMethod(this.chatHubConn, "GetPreviousBroadcasts");
  }

  async sendTypingNotification(chatId) {
    await this.invokeHubMethod(this.chatHubConn, "SendTypingNotification", chatId);
  }
  async sendGroupTypingNotification(chatId) {
    await this.invokeHubMethod(this.groupHubConn, "SendGroupTypingNotification", chatId);
  }

  // === EVENT HANDLERS ===
  async onReceiveMessage(callback) {
    this.registerHubEvent(this.chatHubConn, "ReceiveMessage", callback);
  }

  async offReceiveMessage(callback) {
    this.unregisterHubEvent(this.chatHubConn, "ReceiveMessage", callback);
  }

  async onReceivePreviousMessages(callback) {
    this.registerHubEvent(this.chatHubConn, "ReceivePreviousMessages", callback);
  }

  async offReceivePreviousMessages(callback) {
    this.unregisterHubEvent(this.chatHubConn, "ReceivePreviousMessages", callback);
  }

  async onReceiveChatErrorMessage(callback) {
    this.registerHubEvent(this.chatHubConn, "ReceiveErrorMessage", callback);
  }

  async offReceiveChatErrorMessage(callback) {
    this.unregisterHubEvent(this.chatHubConn, "ReceiveErrorMessage", callback);
  }

  async onReceiveGroupMessage(callback) {
    this.registerHubEvent(this.groupHubConn, "ReceiveGroupMessage", callback);
  }

  async offReceiveGroupMessage(callback) {
    this.unregisterHubEvent(this.groupHubConn, "ReceiveGroupMessage", callback);
  }

  async onReceivePreviousGroupMessages(callback) {
    this.registerHubEvent(this.groupHubConn, "ReceivePreviousGroupMessages", callback);
  }

  async offReceivePreviousGroupMessages(callback) {
    this.unregisterHubEvent(this.groupHubConn, "ReceivePreviousGroupMessages", callback);
  }

  async onReceiveGroupErrorMessage(callback) {
    this.registerHubEvent(this.groupHubConn, "ReceiveGroupErrorMessage", callback);
  }

  async offReceiveGroupErrorMessage(callback) {
    this.unregisterHubEvent(this.groupHubConn, "ReceiveGroupErrorMessage", callback);
  }

  async onReceiveBroadcast(callback) {
    this.registerHubEvent(this.chatHubConn, "ReceiveBroadcast", callback);
  }

  async offReceiveBroadcast(callback) {
    this.unregisterHubEvent(this.chatHubConn, "ReceiveBroadcast", callback);
  }

  async onReceivePreviousBroadcasts(callback) {
    this.registerHubEvent(this.chatHubConn, "ReceivePreviousBroadcasts", callback);
  }

  async offReceivePreviousBroadcasts(callback) {
    this.unregisterHubEvent(this.chatHubConn, "ReceivePreviousBroadcasts", callback);
  }

  async onReceiveOnlineStatus(callback) {
    this.registerHubEvent(this.chatHubConn, "ReceiveOnlineStatus", callback);
  }

  async offReceiveOnlineStatus(callback) {
    this.unregisterHubEvent(this.chatHubConn, "ReceiveOnlineStatus", callback);
  }

  async onReceiveTypingNotification(callback) {
    this.registerHubEvent(this.chatHubConn, "ReceiveTypingNotification", callback);
  }

  async offReceiveTypingNotification(callback) {
    this.unregisterHubEvent(this.chatHubConn, "ReceiveTypingNotification", callback);
  }

  async onReceiveGroupTypingNotification(callback) {
    this.registerHubEvent(this.groupHubConn, "ReceiveGroupTypingNotification", callback);
  }

  async offReceiveGroupTypingNotification(callback) {
    this.unregisterHubEvent(this.groupHubConn, "ReceiveGroupTypingNotification", callback);
  }

  // === SEARCHING METHODS

  async searchFriend(fullname) {
    await this.invokeHubMethod(this.searchHubConn, "SearchForFriend", fullname);
  }

  async OnReceiveSearchResults(callback) {
    this.registerHubEvent(this.searchHubConn, "ReceiveSearchResults", callback);
  }

  async OffReceiveSearchResults(callback) {
    this.unregisterHubEvent(this.searchHubConn, "ReceiveSearchResults", callback);
  }

  // === HELPER METHODS ===
  async invokeHubMethod(hubConnection, methodName, ...args) {
    try {
      await hubConnection.invoke(methodName, ...args);
    } catch (err) {
      console.error(`Error invoking ${methodName}:`, err.message, err.stack);
    }
  }

  registerHubEvent(hubConnection, eventName, callback) {
    hubConnection.on(eventName, callback);
  }

  unregisterHubEvent(hubConnection, eventName, callback) {
    hubConnection.off(eventName, callback);
  }
}

const signalRService = new SignalRService();
export default signalRService;
