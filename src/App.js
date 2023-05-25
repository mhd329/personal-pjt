import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Container from 'react-bootstrap/Container';
import SignUp from "./components/SignUp";
import Login from "./components/Login";
import Todos from "./components/Todos";
import './css/login.css';
import './css/signup.css';

function App() {
  return (
    <div className="App">
      <Container>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/todos" element={<Todos />} />
          </Routes>
        </BrowserRouter>
      </Container>
    </div>
  );
}

export default App;
