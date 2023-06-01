import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Container from 'react-bootstrap/Container';
import SignUp from "./components/SignUp";
import Login from "./components/Login";
import Todos from "./pages/TodoPage";
import './css/login.css';
import './css/signup.css';
import Main from "./components/Main";

function App() {
  return (
    <div className="App">
      <Container>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/todos" element={<Main />} />
          </Routes>
        </BrowserRouter>
      </Container>
    </div>
  );
}

export default App;
