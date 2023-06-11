import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Container from 'react-bootstrap/Container';

import TodoPage from "./pages/TodoListPage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import AllTodosPage from "./pages/AllTodosPage";
import TodoListPage from "./pages/TodoListPage";

import './css/login.css';
import './css/signup.css';

function App() {
  return (
    <div className="App">
      <Container>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/todo-list" element={<TodoListPage />} />
            <Route path="/all-todos" element={<AllTodosPage />} />
            <Route path="/todo-list/detail" element={<TodoPage />}>

            </Route>
            <Route path="/all-todos/detail" element={<TodoPage />}>

            </Route>
          </Routes>
        </BrowserRouter>
      </Container>
    </div>
  );
}

export default App;
