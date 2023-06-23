import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Container from 'react-bootstrap/Container';


import TodoPage from "./pages/TodoPage";
import NewTodoPage from "./pages/NewTodoPage";
import AccountPage from "./pages/AccountPage";
import TodoDetailPage from "./pages/TodoDetailPage";
import NotFound from "./pages/NotFound";
import TokenRefreshButton from "./components/TokenRefreshButton";

import './css/login.css';
import './css/signup.css';
import './css/counter.css';

function App() {
  return (
    <div className="App">
      <Container>
        <BrowserRouter>
          <Routes>
            <Route path="" element={<Navigate to="account/login" />} />
            <Route path="account">
              <Route path="login" element={<AccountPage content="login" />} />
              <Route path="signup" element={<AccountPage content="sign-up" />} />
            </Route>
            <Route path="todo-page/:userId">
              <Route path="todo-list" element={<TodoPage content="todo-list" />} />
              <Route path="todo-list/detail/:todoId/" element={<TodoDetailPage />} />
              <Route path="all-todos" element={<TodoPage content="all-todos" />} />
              <Route path="all-todos/detail/:todoId/" element={<TodoDetailPage />} />
              <Route path="new" element={<NewTodoPage />} />
            </Route>
            <Route path="/*" element={<NotFound />} />
          </Routes>
          <TokenRefreshButton />
        </BrowserRouter>
      </Container>
    </div>
  );
}

export default App;
