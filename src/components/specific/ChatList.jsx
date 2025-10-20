import { Stack, Typography, Box, Button, Tooltip, LinearProgress } from "@mui/material";
import PropTypes from "prop-types";
import { useState } from "react";
import ChatItem from "../shared/ChatItem";
import { SmartToy as AIIcon } from "@mui/icons-material";
import { useCreateOrGetAIChatMutation } from "../../redux/api/api";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

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
}) => {
  const [createAIChat, { isLoading }] = useCreateOrGetAIChatMutation();
  const [hasAIChat, setHasAIChat] = useState(
    chats?.some(chat => chat.name?.includes("Binod") || chat.name?.includes("AI"))
  );

  const handleCreateAIChat = async () => {
    try {
  await createAIChat().unwrap();
      toast.success("AI chat is ready! Start chatting with Binod 🤖");
      setHasAIChat(true);
    } catch (error) {
      console.error("Failed to create AI chat:", error);
      toast.error(error?.data?.message || "Failed to create AI chat");
    }
  };

  return (
    <Stack width={w} direction={"column"} overflow={"auto"} height={"100%"}>
      {isRefreshing && <LinearProgress sx={{ height: 3 }} />}
      {/* AI Chat Button */}
      {!hasAIChat && (
        <Box sx={{ p: 2, borderBottom: "1px solid rgba(0,0,0,0.1)" }}>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Tooltip title="Chat with AI Assistant">
              <Button
                variant="contained"
                fullWidth
                startIcon={<AIIcon />}
                onClick={handleCreateAIChat}
                disabled={isLoading}
                sx={{
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: "none",
                  fontSize: "1rem",
                  fontWeight: 600,
                  "&:hover": {
                    background: "linear-gradient(135deg, #5568d3 0%, #623d85 100%)",
                  },
                  "&:disabled": {
                    background: "rgba(0,0,0,0.12)",
                  },
                }}
              >
                {isLoading ? "Creating..." : "Chat with AI (Binod) 🤖"}
              </Button>
            </Tooltip>
          </motion.div>
        </Box>
      )}

      {chats?.length === 0 ? (
        <Box sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            No chats yet. Start by adding friends or chatting with AI!
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
};
