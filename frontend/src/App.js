import React, { useState, useRef, useEffect } from 'react';
import InputGroup from 'react-bootstrap/InputGroup';
import Container from 'react-bootstrap/Container';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import lamb from './lamb.jpg';
import axios from 'axios';
import './App.css';

function App() {
  // 상태 정의
  const [mainComments, setMainComments] = useState([]);
  // const [subComments, setSubComments] = useState([]);
  const [user, setUser] = useState("");
  const [pw, setPw] = useState("");
  const [content, setContent] = useState("");
  const [changedContent, setChangedContent] = useState("");
  const formBox = useRef(null);
  const contentBox = useRef(null);
  const updateBtn = useRef(null);
  const completeBtn = useRef(null);
  const cancelBtn = useRef(null);

  // 첫 렌더링시 서버에서 댓글들을 불러옴
  useEffect(() => {
    // db에 있는 값을 가져온다.
    // axios.get(`/api/all-comments`)
    axios.get(`http://localhost:5000/api/all-comments`)
      .then(response => {
        console.log("response", response.data);
        setMainComments(response.data);
      });
  }, []);

  // 내용 입력시 상태 변경
  const contentChangeHandler = (event) => {
    setContent(event.currentTarget.value);
  };

  // 작성자 입력시 상태 변경
  const userChangeHandler = (event) => {
    setUser(event.currentTarget.value);
  };

  // 비밀번호 입력시 상태 변경
  const pwChangeHandler = (event) => {
    setPw(event.currentTarget.value);
  };

  // 제출 버튼 클릭시 동작하는 함수
  const submitHandler = (event) => {
    event.preventDefault();
    // axios.post(`/api/value`, { value: value })
    axios.post(`http://localhost:5000/api/add-main-comment`,
      {
        user: user,
        pw: pw,
        content: content,
      })
      .then(response => {
        if (response.data.success) {
          console.log("response", response);
          setMainComments([...mainComments, {
            id: response.data.id,
            user: response.data.user,
            pw: response.data.pw,
            content: response.data.content,
          }]);
          setUser("");
          setPw("");
          setContent("");
        } else {
          alert("값을 db에 넣는데 실패했습니다.");
        };
      })
  };

  // 댓글 수정 버튼
  const updateButton = (event) => {
    formBox.current.style.display = "inline";
    contentBox.current.style.display = "none";
  };

  // 수정 취소 버튼
  const cancelButton = (event) => {
    formBox.current.style.display = "none";
    contentBox.current.style.display = "inline";
  };

  // 댓글 수정 내용 입력
  const contentUpdateHandler = (event) => {
    setChangedContent(event.currentTarget.value);
  }

  // 완료 버튼
  const completeButton = (event) => {
    axios.patch(`http://localhost:5000/api/comment-update/${event.target.id}`, { content: changedContent })
      .then(response => {
        if (response.data.success) {
          console.log("response", response);
          setMainComments(response.data.comments);
          formBox.current.style.display = "none";
          contentBox.current.style.display = "inline";
          setChangedContent("");
        } else {
          alert("수정을 실패했습니다.");
        };
      })
  }

  // 댓글 삭제 버튼
  const deleteHandler = (event) => {
    axios.delete(`http://localhost:5000/api/comment-delete/${event.target.id}`)
      .then(response => {
        if (response.data.success) {
          console.log("response", response);
          setMainComments(response.data.comments);
        } else {
          alert("삭제를 실패했습니다.");
        };
      })
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={lamb} className="cute-lamb" alt="cute-lamb" />
        <Container>
          {comments && comments.map((comment) => {
            return (<li id={comment.id} key={`key-${comment.id}`}>
              <div ref={contentBox} style={{ display: "inline" }}>{comment.user}: {comment.content}</div>
              <Form ref={formBox} style={{ display: "none" }}>{comment.user}: <Form.Control onChange={contentUpdateHandler} value={comment.content} />
                <Button ref={cancelBtn} onClick={completeButton} type="submit">완료</Button>
                <Button ref={completeBtn} onClick={cancelButton}>취소</Button>
              </Form>
              <Button ref={updateBtn} onClick={updateButton}>수정</Button>
              <Button onClick={deleteHandler}>삭제</Button>
            </li>)
          })}
          <Form className="comment-form" onSubmit={submitHandler}>
            <Row className="mb-3">
              <Form.Group as={Col} lg={2} controlId="inputUserName">
                <Form.Label>작성자</Form.Label>
                <Form.Control
                  placeholder="최대 10자"
                  onChange={userChangeHandler}
                  value={user}
                />
              </Form.Group>
              <Form.Group as={Col} lg={2} controlId="inputUserName">
                <Form.Label>비밀번호</Form.Label>
                <Form.Control
                  placeholder="최대 16자"
                  onChange={pwChangeHandler}
                  value={user}
                />
              </Form.Group>
              <Form.Group as={Col} lg={8} controlId="inputContent">
                <Form.Label>내용</Form.Label>
                <InputGroup>
                  <Form.Control
                    placeholder="최대 100자"
                    onChange={contentChangeHandler}
                    value={content}
                  />
                  <Button type="submit">확인</Button>
                </InputGroup>
              </Form.Group>
            </Row>
          </Form>
        </Container>
      </header >
    </div >
  );
}

export default App;
