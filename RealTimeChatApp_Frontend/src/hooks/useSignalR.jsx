import { useState, useEffect } from "react";
import * as signalR from "@microsoft/signalr";

const useSignalR = (hubUrl) => {
  const [hubConnection, setHubConnection] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    let connection;

    const startHubConnection = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");
        connection = new signalR.HubConnectionBuilder()
          .withUrl(hubUrl, {
            accessTokenFactory: () => accessToken,
          })
          .withAutomaticReconnect()
          .configureLogging(signalR.LogLevel.Information)
          .build();

        connection.on("ReceiveMessage", (message) => {
          console.log("Received message:", message);
        });

        connection.onclose((error) => {
          console.error("Connection closed due to error:", error);
          setConnected(false);
        });

        connection.onreconnected(() => {
          console.log("Reconnected to the hub");
          setConnected(true);
        });

        connection.onreconnecting((error) => {
          console.warn("Reconnecting to the hub:", error);
        });

        await connection.start();
        console.log(`Connected to ${hubUrl}`);
        setHubConnection(connection);
        setConnected(true);
      } catch (error) {
        console.error(`Error connecting to ${hubUrl} hub:`, error);
        setConnected(false);
      }
    };

    // Start the connection when the component mounts
    startHubConnection();

    // Cleanup on component unmount or `hubUrl` changes
    return () => {
      if (connection) {
        connection
          .stop()
          .then(() => {
            console.log(`Disconnected from ${hubUrl}`);
            setConnected(false);
          })
          .catch((err) => {
            console.error(`Error disconnecting from ${hubUrl}:`, err);
          });
      }
    };
  }, [hubUrl]); // Only run this effect when `hubUrl` changes

  return { hubConnection, connected };
};

export default useSignalR;
