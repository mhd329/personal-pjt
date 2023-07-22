import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import axios from 'axios';
import './App.css';

function App() {
  const [lists, setLists] = useState([]);
  const [value, setValue] = useState("");
  useEffect(() => {
    // db에 있는 값을 가져온다.
    axios.get(`http://localhost:5000/api/values`)
      .then(response => {
        console.log('response', response.data);
        setLists(response.data);
      });
  }, []);

  const changeHandler = (event) => {
    setValue(event.currentTarget.value);
  };

  const submitHandler = (event) => {
    event.preventDefault();
    axios.post(`http://localhost:5000/api/value`, { value: value })
      .then(response => {
        if (response.data.success) {
          console.log("response", response);
          setLists([...lists, {
            id: response.data.id,
            value: response.data.value,
          }]);
          setValue("");
        } else {
          alert("값을 db에 넣는데 실패했습니다.")
        };
      })
  };

  const deleteHandler = (event) => {
    axios.delete(`http://localhost:5000/api/value/${event.currentTarget.id}`)
      .then(response => {
        if (response.data.success) {
          console.log("response", response);
          setLists(response.data.values);
        } else {
          alert("삭제를 실패했습니다.")
        };
      })
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <div className="container">
          {lists && lists.map((list, index) => {
            return (<li key={index}>
              {list.value}
              <button id={list.id} onClick={deleteHandler}>삭제</button>
            </li>)
          })}

          <form className="example" onSubmit={submitHandler}>
            <input
              type="text"
              placeholder="입력해주세요..."
              onChange={changeHandler}
              value={value}
            />
            <button type="submit">확인</button>
          </form>
        </div>
      </header>
    </div>
  );
}

export default App;
