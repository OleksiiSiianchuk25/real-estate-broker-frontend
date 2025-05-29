// src/components/ChatWidget.tsx

import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import ChatIcon from "@mui/icons-material/Chat";
import CloseIcon from "@mui/icons-material/Close";
import { Link } from "react-router-dom";
import api from "../utils/api";

export interface Message {
  role: "user" | "assistant" | "list";
  content: string;
}

const ANCHOR_RE = /<a\s+href="([^"]+)">([^<]+)<\/a>/i;

const ChatWidget: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const toggleOpen = () => setOpen(o => !o);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text) return;
    setMessages(prev => [...prev, { role: "user", content: text }]);
    setInput("");

    try {
      const response = await api.post<any[]>("/assistant/chat", { message: text });
      const data = response.data;

      if (Array.isArray(data) && data.length > 0) {
        setMessages(prev => [...prev, { role: "assistant", content: data[0] }]);
        data.slice(1).forEach(item => {
          if (typeof item === "string") {
            setMessages(prev => [...prev, { role: "list", content: item }]);
          } else if (item && item.title && item.id) {
            const href = `/property/${item.id}`;
            const html = `<a href="${href}">${item.title}</a>`;
            setMessages(prev => [...prev, { role: "list", content: html }]);
          }
        });
      } else {
        setMessages(prev => [...prev, {
          role: "assistant",
          content: "На жаль, нічого не знайдено."
        }]);
      }
    } catch (err) {
      console.error("Chat error", err);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Сталася помилка під час надсилання повідомлення."
      }]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 9999, behavior: "smooth" });
  }, [messages]);

  return (
    <>
      {/* Плаваюча кнопка-активатор */}
      {!open && (
        <IconButton
          onClick={toggleOpen}
          sx={{
            position: "fixed",
            bottom: 16,
            right: 16,
            bgcolor: "primary.main",
            color: "#fff",
            width: 56,
            height: 56,
            boxShadow: 3,
            "&:hover": { bgcolor: "primary.dark" },
          }}
        >
          <ChatIcon />
        </IconButton>
      )}

      {/* Вікно чату */}
      {open && (
        <Paper
          elevation={4}
          sx={{
            position: "fixed",
            bottom: 16,
            right: 16,
            width: 320,
            height: 400,
            display: "flex",
            flexDirection: "column",
            zIndex: 2000,
          }}
        >
          {/* Хедер з назвою та кнопкою закриття */}
          <Box
            sx={{
              p: 1,
              bgcolor: "primary.main",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography variant="h6">Асистент</Typography>
            <IconButton onClick={toggleOpen} sx={{ color: "#fff" }}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Повідомлення */}
          <Box
            ref={scrollRef}
            sx={{ flex: 1, overflowY: "auto", p: 1, bgcolor: "#fafafa" }}
          >
            <List>
              {messages.map((msg, idx) => {
                const m = ANCHOR_RE.exec(msg.content);
                return (
                  <ListItem
                    key={idx}
                    sx={{
                      justifyContent:
                        msg.role === "user" ? "flex-end" : "flex-start",
                      pb: 0,
                    }}
                  >
                    {m ? (
                      <ListItemText
                        primary={<Link to={m[1]}>{m[2]}</Link>}
                        primaryTypographyProps={{ align: "left" }}
                      />
                    ) : (
                      <ListItemText
                        primary={msg.content}
                        primaryTypographyProps={{
                          align: msg.role === "user" ? "right" : "left",
                        }}
                      />
                    )}
                  </ListItem>
                );
              })}
            </List>
          </Box>

          {/* Поле вводу */}
          <Box
            component="form"
            onSubmit={e => {
              e.preventDefault();
              sendMessage();
            }}
            sx={{ p: 1, display: "flex", gap: 1 }}
          >
            <TextField
              fullWidth
              placeholder="Напишіть повідомлення..."
              size="small"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <IconButton color="primary" onClick={sendMessage}>
              <SendIcon />
            </IconButton>
          </Box>
        </Paper>
      )}
    </>
  );
};

export default ChatWidget;
