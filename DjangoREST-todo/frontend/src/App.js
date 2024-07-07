import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Container from 'react-bootstrap/Container';


import TodoHomePage from "./pages/TodoHomePage";
import TodoListPage from "./pages/TodoListPage";
import AllTodosPage from "./pages/AllTodosPage";
import NewTodoPage from "./pages/NewTodoPage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import TodoDetailPage from "./pages/TodoDetailPage";
import NotFoundPage from "./pages/NotFoundPage";

import './css/login.css';
import './css/signup.css';
import './css/counter.css';
import './css/todo/new.css';
import './css/todo/list.css';
import './css/todo/home.css';
import './css/todo/detail.css';

function App() {
  return (
    <div className="App">
      <Container>
        <BrowserRouter>
          <Routes>
            <Route index element={<Navigate to="/account/login/" />} />
            <Route path="/account/login/" element={<LoginPage />} />
            <Route path="/account/signup/" element={<SignUpPage />} />
            <Route exact path="/todo-page/:userId/" element={<TodoHomePage />}>
              <Route index element={<TodoListPage />} />
              <Route path="detail/:todoId/" element={<TodoDetailPage />} />
              <Route path="all-todos/" element={<AllTodosPage />} />
              <Route path="all-todos/detail/:todoId/" element={<TodoDetailPage />} />
              <Route path="new/" element={<NewTodoPage />} />
            </Route>
            <Route path="/*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </Container>
    </div>
  );
}

export default App;
