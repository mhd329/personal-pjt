import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Container from 'react-bootstrap/Container';

import TodoPage from "./pages/TodoPage";
import NewTodoPage from "./pages/NewTodoPage";
import AccountPage from "./pages/AccountPage";

import './css/login.css';
import './css/signup.css';


function App() {
  return (
    <div className="App">
      <Container>
        <BrowserRouter>
          <Routes>
            <Route path="" element={<Navigate to="account/login" replace={true} />} />
            <Route path="account">
              <Route path="login" element={<AccountPage content="login" />} />
              <Route path="signup" element={<AccountPage content="sign-up" />} />
            </Route>
            <Route path="todo-page/:uid">
              <Route path="" element={<Navigate to="todo-page/:uid" replace={true} />} />
              <Route path="todo-list" element={<TodoPage content="todo-list" />}>
                <Route path="detail" element={<TodoPage />} />
              </Route>
              <Route path="all-todos" element={<TodoPage content="all-todos" />}>
                <Route path="detail/:todoId" element={<TodoPage />} />
              </Route>
              <Route path="new" element={<NewTodoPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </Container>
    </div>
  );
}

export default App;
