// UserRoutes.js
import { Routes, Route } from "react-router-dom";
import PrivateChatList from "../components/PrivateChatList";
import FriendList from "../components/FriendList";
import GroupList from "../components/GroupList";

import signalRService from "../services/signalRService";

const UserRoutes = () => (
  <Routes>
    <Route
      path="private-chats"
      element={
        signalRService ? <PrivateChatList /> : <div>Loading Chat Hub...</div>
      }
    />
    <Route
      path="friends"
      element={
        signalRService ? <FriendList /> : <div>Loading Notification Hub...</div>
      }
    />
    <Route path="groups" element={<GroupList />} />
  </Routes>
);

export default UserRoutes;
