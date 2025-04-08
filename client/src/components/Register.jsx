import React, { useState } from "react";
import { Form, Button, Card, Container } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";

function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5078/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error("Failed to register");
      }

      const data = await response.json();
      console.log("Registration successful, id: ", data.id);
      navigate("/login");
    } catch (error) {
      console.error("Error during registration:", error);
    }
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center"
      style={{ height: "100vh" }}
    >
      <div className="container mx-auto" style={{ maxWidth: "450px" }}>
        <Card>
          <Card.Body>
            <Card.Title>Register</Card.Title>
            <Form onSubmit={handleSubmit}>
              <Form.Group controlId="formUsername" className="mb-3">
                <Form.Label>Username</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </Form.Group>
              <Form.Group controlId="formPassword" className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Form.Group>
              <Container className="d-flex justify-content-start gap-2 px-0">
                <Button variant="primary" type="submit">
                  Register
                </Button>
                <Link to="/login">
                  <Button variant="success">Login</Button>
                </Link>
              </Container>
            </Form>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
}

export default Register;
