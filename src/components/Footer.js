import React from 'react';
import { Container } from 'react-bootstrap';

const Footer = () => {
  return (
    <footer className="bg-dark text-white py-3 mt-5">
      <Container className="text-center">
        <p className="mb-0">&copy; {new Date().getFullYear()} Reminder Sys</p>
        <p className="small mb-0">Built with React, Express, and PostgreSQL</p>
      </Container>
    </footer>
  );
};

export default Footer;
