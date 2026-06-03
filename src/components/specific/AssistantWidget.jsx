import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Box, IconButton, Avatar, Typography, InputBase, Stack } from "@mui/material";
import {
  SmartToy as BotIcon,
  Close as CloseIcon,
  Send as SendIcon,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import { useSocket } from "../../socket";
import {
  useCreateOrGetAIChatMutation,
  useGetMessagesQuery,
} from "../../redux/api/api";
import { NEW_MESSAGE } from "../../constants/events";
import { useSocketEvents } from "../../hooks/hook";
import { brand, bubble, radii } from "../../theme/tokens";

const spring = { type: "spring", stiffness: 380, damping: 30 };

const AssistantWidget = () => {
  const { user } = useSelector((state) => state.auth);
  const socket = useSocket();

  const [open, setOpen] = useState(false);
  const [aiChat, setAiChat] = useState(null); // { _id, members }
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [aiTyping, setAiTyping] = useState(false);
  const bottomRef = useRef(null);

  const [createOrGetAIChat, { isLoading }] = useCreateOrGetAIChatMutation();

  const chatId = aiChat?._id;
  const { data: history } = useGetMessagesQuery(
    { chatId, page: 1 },
    { skip: !chatId }
  );

  useEffect(() => {
    if (history?.messages) setMessages(history.messages);
  }, [history]);

  const newMessageListener = useCallback(
    (data) => {
      if (data.chatId !== chatId) return;
      setMessages((prev) => [...prev, data.message]);
      if (data.message?.sender?._id !== user?._id) setAiTyping(false);
    },
    [chatId, user?._id]
  );

  const handlers = useMemo(
    () => ({ [NEW_MESSAGE]: newMessageListener }),
    [newMessageListener]
  );
  useSocketEvents(socket, handlers);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, aiTyping, open]);

  const handleOpen = async () => {
    setOpen(true);
    if (!aiChat) {
      try {
        const res = await createOrGetAIChat().unwrap();
        if (res?.chat) setAiChat(res.chat);
      } catch {
        /* surfaced by RTK Query; widget stays usable once chat resolves */
      }
    }
  };

  const send = () => {
    const message = input.trim();
    if (!message || !aiChat) return;
    socket.emit(NEW_MESSAGE, { chatId, members: aiChat.members, message });
    setInput("");
    setAiTyping(true);
  };

  const onKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <>
      {/* Floating launcher (bottom-right) */}
      <Box
        component={motion.button}
        onClick={() => (open ? setOpen(false) : handleOpen())}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.94 }}
        aria-label="Ask Binod"
        sx={{
          position: "fixed",
          right: 24,
          bottom: 24,
          zIndex: 1300,
          width: 58,
          height: 58,
          borderRadius: "18px",
          border: "none",
          cursor: "pointer",
          color: "#fff",
          bgcolor: "primary.main",
          display: "grid",
          placeItems: "center",
          boxShadow: `0 12px 30px ${brand[500]}55`,
        }}
      >
        {open ? <CloseIcon /> : <BotIcon />}
      </Box>

      <AnimatePresence>
        {open && (
          <motion.div
            key="binod-panel"
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={spring}
            style={{
              position: "fixed",
              right: 24,
              bottom: 94,
              zIndex: 1299,
              transformOrigin: "bottom right",
            }}
          >
          <Box
            sx={{
              width: 384,
              maxWidth: "calc(100vw - 32px)",
              height: "min(580px, calc(100vh - 130px))",
              bgcolor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: "20px",
              boxShadow: "0 18px 48px rgba(0,0,0,0.45)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <Stack
              direction="row"
              alignItems="center"
              spacing={1.5}
              sx={{ p: 1.75, borderBottom: "1px solid", borderColor: "divider" }}
            >
              <Avatar
                variant="rounded"
                sx={{ bgcolor: "primary.main", width: 38, height: 38, borderRadius: 3 }}
              >
                <BotIcon fontSize="small" />
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography fontWeight={700} fontSize={15} lineHeight={1.1}>
                  Binod
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "success.main", fontWeight: 600, display: "flex", alignItems: "center", gap: 0.5 }}
                >
                  <Box component="span" sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: "success.main" }} />
                  AI assistant
                </Typography>
              </Box>
              <IconButton size="small" onClick={() => setOpen(false)} aria-label="Close">
                <CloseIcon fontSize="small" />
              </IconButton>
            </Stack>

            {/* Messages */}
            <Box sx={{ flex: 1, overflowY: "auto", p: 2, display: "flex", flexDirection: "column", gap: 1 }}>
              {messages.length === 0 && !isLoading && (
                <Typography
                  variant="body2"
                  sx={{ color: "text.secondary", textAlign: "center", py: 2 }}
                >
                  Hi, I&apos;m Binod 👋 Ask me anything.
                </Typography>
              )}

              {messages.map((m) => {
                const mine = m.sender?._id === user?._id;
                return (
                  <Box
                    key={m._id}
                    sx={{
                      alignSelf: mine ? "flex-end" : "flex-start",
                      maxWidth: "84%",
                      px: 1.6,
                      py: 1,
                      borderRadius: `${radii.bubble}px`,
                      ...(mine
                        ? { bgcolor: bubble.sent.dark, color: "#fff", borderTopRightRadius: 6 }
                        : { bgcolor: "action.hover", color: "text.primary", borderTopLeftRadius: 6 }),
                    }}
                  >
                    <Typography sx={{ fontSize: 14.5, lineHeight: 1.45, whiteSpace: "pre-wrap" }}>
                      {m.content}
                    </Typography>
                  </Box>
                );
              })}

              {aiTyping && (
                <Box
                  sx={{
                    alignSelf: "flex-start",
                    display: "flex",
                    gap: 0.5,
                    px: 1.6,
                    py: 1.25,
                    borderRadius: `${radii.bubble}px`,
                    borderTopLeftRadius: 6,
                    bgcolor: "action.hover",
                  }}
                >
                  {[0, 1, 2].map((i) => (
                    <Box
                      key={i}
                      component={motion.span}
                      animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                      transition={{ duration: 1.3, repeat: Infinity, delay: i * 0.18, ease: "easeInOut" }}
                      sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: "text.secondary" }}
                    />
                  ))}
                </Box>
              )}
              <div ref={bottomRef} />
            </Box>

            {/* Composer */}
            <Box sx={{ p: 1.5, borderTop: "1px solid", borderColor: "divider" }}>
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{
                  bgcolor: "action.hover",
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: "13px",
                  px: 1.5,
                  py: 0.5,
                }}
              >
                <InputBase
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKey}
                  placeholder="Ask Binod…"
                  sx={{ flex: 1, fontSize: 14.5 }}
                  inputProps={{ "aria-label": "Message Binod" }}
                />
                <IconButton
                  onClick={send}
                  disabled={!input.trim() || !aiChat}
                  sx={{
                    bgcolor: "primary.main",
                    color: "#fff",
                    width: 36,
                    height: 36,
                    borderRadius: "10px",
                    "&:hover": { bgcolor: "primary.main", filter: "brightness(1.08)" },
                    "&.Mui-disabled": { bgcolor: "action.disabledBackground", color: "action.disabled" },
                  }}
                >
                  <SendIcon fontSize="small" />
                </IconButton>
              </Stack>
            </Box>
          </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AssistantWidget;
