import React, { useState, useEffect, useRef } from "react";
import { Card, ListGroup, Form, Button, InputGroup } from "react-bootstrap";
import * as signalR from "@microsoft/signalr";
import { FaDownload, FaSmile } from "react-icons/fa";
import Picker from "emoji-picker-react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

function Chat() {
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [text, setText] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [connection, setConnection] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const emojiPickerRef = useRef(null);

  useEffect(() => {
    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl("http://localhost:5078/chatHub", {
        accessTokenFactory: () => localStorage.getItem("token") || "",
      })
      .withAutomaticReconnect()
      .build();
    setConnection(newConnection);
  }, []);

  useEffect(() => {
    if (connection) {
      connection
        .start()
        .then(() => {
          console.log("Connected to SignalR hub");
          connection.invoke("JoinChat");

          connection.on("LoadMessages", async (msgs) => {
            for (let msg of msgs) {
              msg.username = await handleGetUserById(msg.userId);
            }
            setMessages(msgs);
          });

          connection.on("ReceiveMessage", async (message) => {
            if (!message.username && message.userId) {
              message.username = await handleGetUserById(message.userId);
            }
            setMessages((prev) => [...prev, message]);
          });

          connection.on("UserOnline", (users) => {
            setOnlineUsers(users);
          });
        })
        .catch((error) => console.error("Connection failed: ", error));
    }
  }, [connection]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target)
      ) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojiPicker]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text && !selectedFile) return;

    if (selectedFile) {
      const formData = new FormData();

      const userId = jwtDecode(localStorage.getItem("token")).nameid;
      formData.append("userId", userId);
      formData.append("text", text);
      formData.append("file", selectedFile);
      try {
        const response = await fetch("http://localhost:5078/api/message/send", {
          method: "POST",
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
          body: formData,
        });
        if (response.ok) {
          setText("");
          setSelectedFile(null);
          document.querySelector('input[type="file"]').value = null;
          setShowEmojiPicker(false);
        } else {
          console.error("File upload failed:", response.statusText);
        }
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    } else {
      if (connection) {
        try {
          await connection.invoke("SendMessage", text);
          setText("");
          setShowEmojiPicker(false);
        } catch (error) {
          console.error("Sending message failed: ", error);
        }
      }
    }
  };

  const handleGetUserById = async (userId) => {
    try {
      const response = await fetch(
        `http://localhost:5078/api/auth/userById/${userId}`,
        {
          method: "GET",
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      );
      const user = await response.text();
      return user;
    } catch (error) {
      console.error("Error fetching user:", error);
      return "Unknown";
    }
  };

  const addEmoji = (emoji) => {
    setText((prevText) => prevText + emoji.emoji);
  };

  const getSenderName = (msg) => {
    if (msg.user && msg.user.username) {
      return msg.user.username;
    }
    if (msg.username) {
      return msg.username;
    }
    return "Unknown";
  };

  const handleLogout = async () => {
    if (connection) {
      try {
        await connection.stop();
        console.log("SignalR connection stopped.");
      } catch (error) {
        console.error("Error stopping connection: ", error);
      }
    }
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      <div
        className="container mx-auto position-relative"
        style={{ maxWidth: "900px" }}
      >
        <Card>
          <Card.Header className="d-flex justify-content-between align-items-center">
            <div>
              <Card.Title className="text-success mb-0">Chat Room</Card.Title>
            </div>
            <Button variant="danger" onClick={handleLogout}>
              Logout
            </Button>
          </Card.Header>
          <Card.Body>
            <div style={{ height: "500px", overflowY: "auto" }}>
              <ListGroup>
                {messages.map((msg, idx) => (
                  <ListGroup.Item key={idx}>
                    <div>
                      <strong>{getSenderName(msg)}</strong>: {msg.text}
                    </div>
                    {msg.fileName && msg.fileType && (
                      <div className="mt-2">
                        {msg.fileType.startsWith("image/") ? (
                          <div>
                            <img
                              src={`http://localhost:5078/api/message/file/${msg.id}`}
                              alt={msg.fileName}
                              style={{ maxWidth: "100%", height: "auto" }}
                            />
                            <div>
                              <a
                                href={`http://localhost:5078/api/message/file/${msg.id}`}
                                download={msg.fileName}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <FaDownload /> Download {msg.fileName}
                              </a>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <a
                              href={`http://localhost:5078/api/message/file/${msg.id}`}
                              download={msg.fileName}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <FaDownload /> Download {msg.fileName}
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                    <small className="text-muted">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </small>
                  </ListGroup.Item>
                ))}
                <div ref={messagesEndRef} />
              </ListGroup>
            </div>
            <Form
              onSubmit={handleSendMessage}
              className="mt-3"
              style={{ position: "relative" }}
            >
              <InputGroup>
                <Form.Control
                  type="text"
                  placeholder="Type your message (optional)"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
                <Button
                  variant="outline-secondary"
                  onClick={() => setShowEmojiPicker((prev) => !prev)}
                  style={{ marginLeft: "0.5rem" }}
                >
                  <FaSmile />
                </Button>
              </InputGroup>
              {showEmojiPicker && (
                <div
                  ref={emojiPickerRef}
                  style={{
                    position: "absolute",
                    bottom: "150px",
                    right: "0",
                    zIndex: 1000,
                  }}
                >
                  <Picker onEmojiClick={addEmoji} />
                </div>
              )}
              <Form.Group className="mb-3 mt-3">
                {selectedFile && selectedFile.type.startsWith("image/") && (
                  <div className="mb-3">
                    <img
                      src={URL.createObjectURL(selectedFile)}
                      alt="Preview"
                      style={{ maxWidth: "100%", height: "50px" }}
                    />
                  </div>
                )}
                <Form.Control
                  type="file"
                  onChange={(e) => {
                    if (e.target.files.length > 0) {
                      setSelectedFile(e.target.files[0]);
                    } else {
                      setSelectedFile(null);
                    }
                  }}
                />
              </Form.Group>
              <Button variant="primary" type="submit">
                Send
              </Button>
            </Form>
          </Card.Body>
        </Card>
        <Card
          style={{
            position: "absolute",
            top: "0",
            right: "100%",
            width: "200px",
            height: "100%",
            backgroundColor: "#f8f9fa",
            borderLeft: "1px solid #dee2e6",
            padding: "10px",
            overflowY: "auto",
          }}
        >
          <Card.Body>
            <h5>Online Users</h5>
            <ul style={{ listStyleType: "none", padding: "0" }}>
              {onlineUsers.length > 0 ? (
                onlineUsers.map((user, idx) => (
                  <li
                    key={idx}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "10px",
                    }}
                  >
                    <span
                      style={{
                        width: "10px",
                        height: "10px",
                        backgroundColor: "green",
                        borderRadius: "50%",
                        display: "inline-block",
                        marginRight: "10px",
                      }}
                    ></span>
                    {user}
                  </li>
                ))
              ) : (
                <li>None</li>
              )}
            </ul>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
}

export default Chat;
