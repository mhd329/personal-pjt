import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Container from 'react-bootstrap/Container';
import SignUpForm from "./components/SignUpForm";
import Todos from "./components/Todos";
import './App.css';

function App() {
  return (
    <div className="App">
      <Container>
        <BrowserRouter>
          <Routes>
            {/* <Route path="/" element={<LoginForm />} />
          <Route path="/login" element={<LoginForm />} /> */}
            <Route path="/signup" element={<SignUpForm />} />
            <Route path="/todos" element={<Todos />} />
          </Routes>
        </BrowserRouter>
      </Container>
    </div>
  );
}

export default App;
