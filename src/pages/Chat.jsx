import React, {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import AppLayout from "../components/layout/AppLayout";
import { IconButton, Skeleton, Stack, Box } from "@mui/material";
import {
  AttachFile as AttachFileIcon,
  Send as SendIcon,
} from "@mui/icons-material";
import { InputBox } from "../components/styles/StyledComponents";
import FileMenu from "../components/dialogs/FileMenu";
import MessageComponent from "../components/shared/MessageComponent";
import { useSocket } from "../socket";
import {
  ALERT,
  CHAT_JOINED,
  CHAT_LEAVED,
  NEW_MESSAGE,
  START_TYPING,
  STOP_TYPING,
  ONLINE_USERS,
} from "../constants/events";
import { useChatDetailsQuery, useGetMessagesQuery } from "../redux/api/api";
import { useErrors, useSocketEvents } from "../hooks/hook";
import { useInfiniteScrollTop } from "6pp";
import { useDispatch } from "react-redux";
import { setIsFileMenu } from "../redux/reducers/misc";
import { removeNewMessagesAlert } from "../redux/reducers/chat";
import { TypingLoader } from "../components/layout/Loaders";
import { useNavigate } from "react-router-dom";
import ChatHeader from "../components/layout/ChatHeader";
import { useTheme } from "../context/ThemeContext";

const Chat = ({ chatId, user }) => {
  const socket = useSocket();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { wallpaper } = useTheme();

  const containerRef = useRef(null);
  const bottomRef = useRef(null);

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [page, setPage] = useState(1);
  const [fileMenuAnchor, setFileMenuAnchor] = useState(null);

  const [IamTyping, setIamTyping] = useState(false);
  const [userTyping, setUserTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const typingTimeout = useRef(null);

  const chatDetails = useChatDetailsQuery({ chatId, populate: true, skip: !chatId });

  const oldMessagesChunk = useGetMessagesQuery({ chatId, page });

  const { data: oldMessages, setData: setOldMessages } = useInfiniteScrollTop(
    containerRef,
    oldMessagesChunk.data?.totalPages,
    page,
    setPage,
    oldMessagesChunk.data?.messages
  );

  const errors = [
    { isError: chatDetails.isError, error: chatDetails.error },
    { isError: oldMessagesChunk.isError, error: oldMessagesChunk.error },
  ];

  const members = chatDetails?.data?.chat?.members;

  const messageOnChange = (e) => {
    setMessage(e.target.value);

    if (!IamTyping) {
      socket.emit(START_TYPING, { members, chatId });
      setIamTyping(true);
    }

    if (typingTimeout.current) clearTimeout(typingTimeout.current);

    typingTimeout.current = setTimeout(() => {
      socket.emit(STOP_TYPING, { members, chatId });
      setIamTyping(false);
    }, [2000]);
  };

  const handleFileOpen = (e) => {
    dispatch(setIsFileMenu(true));
    setFileMenuAnchor(e.currentTarget);
  };

  const submitHandler = (e) => {
    e.preventDefault();

    if (!message.trim()) return;

    // Emitting the message to the server
    socket.emit(NEW_MESSAGE, { chatId, members, message });
    setMessage("");
  };

  useEffect(() => {
    socket.emit(CHAT_JOINED, { userId: user._id, members });
    dispatch(removeNewMessagesAlert(chatId));

    return () => {
      setMessages([]);
      setMessage("");
      setOldMessages([]);
      setPage(1);
      socket.emit(CHAT_LEAVED, { userId: user._id, members });
    };
  }, [chatId]);

  useEffect(() => {
    if (bottomRef.current)
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (chatDetails.isError) return navigate("/");
  }, [chatDetails.isError]);

  const newMessagesListener = useCallback(
    (data) => {
      if (data.chatId !== chatId) return;

      setMessages((prev) => [...prev, data.message]);
    },
    [chatId]
  );

  const startTypingListener = useCallback(
    (data) => {
      if (data.chatId !== chatId) return;

      setUserTyping(true);
    },
    [chatId]
  );

  const stopTypingListener = useCallback(
    (data) => {
      if (data.chatId !== chatId) return;
      setUserTyping(false);
    },
    [chatId]
  );

  const onlineUsersListener = useCallback((data) => {
    setOnlineUsers(data);
  }, []);

  const alertListener = useCallback(
    (data) => {
      if (data.chatId !== chatId) return;
      const messageForAlert = {
        content: data.message,
        sender: {
          _id: "djasdhajksdhasdsadasdas",
          name: "Admin",
        },
        chat: chatId,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, messageForAlert]);
    },
    [chatId]
  );

  const eventHandler = {
    [ALERT]: alertListener,
    [NEW_MESSAGE]: newMessagesListener,
    [START_TYPING]: startTypingListener,
    [STOP_TYPING]: stopTypingListener,
    [ONLINE_USERS]: onlineUsersListener,
  };

  useSocketEvents(socket, eventHandler);

  useErrors(errors);

  const allMessages = [...oldMessages, ...messages];

  // Group consecutive messages from the same sender within a 5-minute window.
  const isGroupChat = chatDetails.data?.chat?.groupChat;
  const senderId = (m) => (typeof m?.sender === "object" ? m?.sender?._id : m?.sender);
  const sameGroup = (a, b) =>
    a &&
    b &&
    senderId(a) === senderId(b) &&
    Math.abs(new Date(a.createdAt) - new Date(b.createdAt)) < 5 * 60 * 1000;

  return chatDetails.isLoading ? (
    <Skeleton />
  ) : (
    <Fragment>
      {/* Chat Header with Call Buttons */}
      <ChatHeader
        chat={chatDetails.data?.chat}
        members={members}
        user={user}
        onlineUsers={onlineUsers}
      />

      <Stack
        ref={containerRef}
        boxSizing={"border-box"}
        padding={"1.25rem 1.5rem"}
        spacing={0}
        height={"calc(90% - 60px)"}
        sx={{
          ...(wallpaper.type === 'gradient' 
            ? {
                background: wallpaper.value,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
              }
            : {
                backgroundColor: wallpaper.value,
                backgroundImage: wallpaper.pattern,
                backgroundSize: 'auto',
                backgroundRepeat: 'repeat',
                backgroundAttachment: 'fixed',
              }
          ),
          overflowX: "hidden",
          overflowY: "auto",
          maxWidth: "100%",
          "&::-webkit-scrollbar": {
            width: "8px",
          },
          "&::-webkit-scrollbar-track": {
            background: "rgba(0,0,0,0.05)",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "rgba(102, 126, 234, 0.5)",
            borderRadius: "10px",
            "&:hover": {
              background: "rgba(102, 126, 234, 0.7)",
            },
          },
        }}
      >
        {allMessages.map((msg, idx) => (
          <MessageComponent
            key={msg._id}
            message={msg}
            user={user}
            isGroupChat={isGroupChat}
            firstInGroup={!sameGroup(allMessages[idx - 1], msg)}
            lastInGroup={!sameGroup(msg, allMessages[idx + 1])}
          />
        ))}

        {userTyping && <TypingLoader />}

        <div ref={bottomRef} />
      </Stack>

      <form
        style={{
          height: "10%",
        }}
        onSubmit={submitHandler}
      >
        <Stack
          direction={"row"}
          height={"100%"}
          padding={"1rem"}
          alignItems={"center"}
          position={"relative"}
        >
          <IconButton
            sx={{ position: "absolute", left: "1.5rem", color: "text.secondary" }}
            onClick={handleFileOpen}
          >
            <AttachFileIcon />
          </IconButton>

          <InputBox
            placeholder="Type a message…"
            value={message}
            onChange={messageOnChange}
          />

          <IconButton
            type="submit"
            sx={{
              bgcolor: "primary.main",
              color: "white",
              marginLeft: "1rem",
              padding: "0.6rem",
              transition: "transform 0.12s, filter 0.15s",
              "&:hover": { bgcolor: "primary.main", filter: "brightness(1.08)" },
              "&:active": { transform: "scale(0.92)" },
            }}
          >
            <SendIcon />
          </IconButton>
        </Stack>
      </form>

      <FileMenu anchorE1={fileMenuAnchor} chatId={chatId} />
    </Fragment>
  );
};

export default AppLayout()(Chat);
