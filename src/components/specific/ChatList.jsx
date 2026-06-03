import { Stack, Typography, Box, LinearProgress } from "@mui/material";
import PropTypes from "prop-types";
import ChatItem from "../shared/ChatItem";

const ChatList = ({
  w = "100%",
  chats = [],
  chatId,
  onlineUsers = [],
  newMessagesAlert = [
    {
      chatId: "",
      count: 0,
    },
  ],
  handleDeleteChat,
  isRefreshing = false,
  version = 0,
}) => {
  return (
    <Stack
      width={w}
      direction={"column"}
      overflow={"auto"}
      height={"100%"}
      data-version={version}
      sx={{ py: 1 }}
    >
      {isRefreshing && <LinearProgress sx={{ height: 3 }} />}

      {chats?.length === 0 ? (
        <Box sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            No conversations yet. Search for friends to start chatting.
          </Typography>
        </Box>
      ) : (
        chats?.map((data, index) => {
          const { avatar, _id, name, groupChat, members } = data;

          const newMessageAlert = newMessagesAlert.find(
            ({ chatId }) => chatId === _id
          );

          const isOnline = members?.some((member) =>
            onlineUsers.includes(member)
          );

          return (
            <ChatItem
              index={index}
              newMessageAlert={newMessageAlert}
              isOnline={isOnline}
              avatar={avatar}
              name={name}
              _id={_id}
              key={_id}
              groupChat={groupChat}
              sameSender={chatId === _id}
              handleDeleteChat={handleDeleteChat}
            />
          );
        })
      )}
    </Stack>
  );
};

export default ChatList;

ChatList.propTypes = {
  w: PropTypes.string,
  chats: PropTypes.arrayOf(PropTypes.object),
  chatId: PropTypes.string,
  onlineUsers: PropTypes.arrayOf(PropTypes.string),
  newMessagesAlert: PropTypes.arrayOf(
    PropTypes.shape({
      chatId: PropTypes.string,
      count: PropTypes.number,
    })
  ),
  handleDeleteChat: PropTypes.func,
  isRefreshing: PropTypes.bool,
  version: PropTypes.number,
};
