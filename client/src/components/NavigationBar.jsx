import React from "react";
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";

function NavigationBar() {
  return (
    <Navbar bg="primary" variant="dark" expand="lg">
      <Container>
        <LinkContainer to="/">
          <Navbar.Brand>Chat App</Navbar.Brand>
        </LinkContainer>
        <Button variant="danger">Logout</Button>
      </Container>
    </Navbar>
  );
}

export default NavigationBar;
