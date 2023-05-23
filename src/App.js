import { BrowserRouter, Routes, Route } from "react-router-dom"
import SignUpForm from "./components/SignUpForm";
import Todos from "./components/Todos";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          {/* <Route path="/" element={<LoginForm />} />
          <Route path="/login" element={<LoginForm />} /> */}
          <Route path="/signup" element={<SignUpForm />} />
          <Route path="/todos" element={<Todos />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
