// UserRoutes.js
import { Routes, Route, Navigate } from "react-router-dom";
import PrivateChatList from "./PrivateChatList";
import FriendList from "./FriendList";
import GroupList from "./GroupList";
import Announcements from "./Announcements";

import signalRService from "../../services/signalRService";

const UserRoutes = () => (
  <Routes>
    <Route path="/" element={<Navigate to="private-chats" replace />} />
    <Route path="private-chats" element={signalRService.chatHubConn ? <PrivateChatList /> : <div>Loading chats...</div>} />
    <Route path="friends" element={signalRService.chatHubConn ? <FriendList /> : <div>Loading details of friends ...</div>} />
    <Route path="groups" element={signalRService.groupHubConn ? <GroupList /> : <div>Loading groups...</div>} />
    <Route path="announcements" element={signalRService.chatHubConn ? <Announcements /> : <div>Loading announcements</div>} />
  </Routes>
);

export default UserRoutes;
