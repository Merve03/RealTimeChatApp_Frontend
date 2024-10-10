// UserRoutes.js
import { Routes, Route } from "react-router-dom";
import PrivateChatList from "../components/PrivateChatList";
import FriendList from "../components/FriendList";
import GroupList from "../components/GroupList";

const UserRoutes = ({ chatHubConnection, notificationHubConnection }) => (
  <Routes>
    <Route
      path="private-chats"
      element={
        chatHubConnection ? (
          <PrivateChatList ChatHubConnection={chatHubConnection} />
        ) : (
          <div>Loading Chat Hub...</div>
        )
      }
    />
    <Route
      path="friends"
      element={
        notificationHubConnection ? (
          <FriendList NotificationHubConnection={notificationHubConnection} />
        ) : (
          <div>Loading Notification Hub...</div>
        )
      }
    />
    <Route path="groups" element={<GroupList />} />
  </Routes>
);

export default UserRoutes;
