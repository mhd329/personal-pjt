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
  // 기본 상태
  const [mainComments, setMainComments] = useState([]);
  const [subComments, setSubComments] = useState([]);
  const [user, setUser] = useState("");
  const [pw, setPw] = useState("");
  const [content, setContent] = useState("");

  // 업데이트 관련 상태
  const [changedContent, setChangedContent] = useState("");
  const [updatePw, setUpdatePw] = useState("");
  const contentBox = useRef({});
  const buttonBox = useRef({});
  const formBox = useRef({});

  // 첫 렌더링시 서버에서 댓글들을 불러옴
  useEffect(() => {
    // db에 있는 값을 가져온다.
    // axios.get(`/api/all-comments`)
    axios.get(`http://localhost:5000/api/all-comments`)
      .then(response => {
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
      }).then(response => {
        if (response.data.success) {
          setMainComments([...mainComments, {
            id: response.data.id,
            user: response.data.user,
            content: response.data.content,
          }]);
          setUser("");
          setPw("");
          setContent("");
        } else {
          alert("서버의 문제로 값을 db에 넣는데 실패했습니다.");
        }
      });
  };

  // 댓글 수정 버튼
  const updateButton = (event) => {
    const id = event.currentTarget.id;
    const res = id.replace("update-", "")
    formBox.current[`${res}`].style.display = "inline";
    contentBox.current[`${res}`].style.display = "none";
    buttonBox.current[`${res}`].style.display = "none";
  };

  // 수정 취소 버튼
  const cancelButton = (event) => {
    const id = event.currentTarget.id;
    const res = id.replace("cancel-", "")
    formBox.current[`${res}`].style.display = "none";
    contentBox.current[`${res}`].style.display = "inline";
    buttonBox.current[`${res}`].style.display = "inline";
  };

  // 댓글 수정 내용 입력
  const contentUpdateHandler = (event) => {
    setChangedContent(event.currentTarget.value);
  };

  // 댓글 수정 비밀번호 입력
  const contentUpdatePwHandler = (event) => {
    setUpdatePw(event.currentTarget.value);
  };

  // 수정 완료 버튼
  const completeButton = (event) => {
    event.preventDefault();
    const id = event.currentTarget.id;
    const res = id.replace("complete-", "")
    axios.patch(`http://localhost:5000/api/comment-update/${res}`,
      {
        content: changedContent, pw: updatePw
      }).then(response => {
        if (response.data.success) {
          setMainComments(response.data.comments);
          formBox.current[`${res}`].style.display = "none";
          contentBox.current[`${res}`].style.display = "inline";
          buttonBox.current[`${res}`].style.display = "inline";
          setChangedContent("");
          setUpdatePw("");
        } else {
          alert("알 수 없는 오류가 발생했습니다.");
        }
      }).catch((error) => {
        if (error.response.data.statusCode === 400) {
          // alert("올바른 암호를 입력하세요.");
          alert(error.response.data.message);
        } else {
          alert("서버의 문제로 수정을 실패했습니다.");
        }
      });
  };

  // 댓글 삭제 버튼
  const deleteHandler = (event) => {
    event.preventDefault();
    const id = event.currentTarget.id;
    const res = id.replace("delete-", "")
    axios.delete(`http://localhost:5000/api/comment-delete/${res}`,
      {
        data: {
          pw: updatePw
        }
      }).then(response => {
        if (response.data.success) {
          setMainComments(response.data.comments);
        } else {
          alert("알 수 없는 오류가 발생했습니다.");
        }
      }).catch((error) => {
        if (error.response.data.statusCode === 400) {
          // alert("올바른 암호를 입력하세요.");
          alert(error.response.data.message);
        } else {
          alert("서버의 문제로 삭제를 실패했습니다.");
        }
      });
  };
  return (
    <div className="App">
      <header className="App-header">
        <div style={{ width: "300px", aspectRatio: "5 / 5", marginTop: "5rem" }}>
          <img style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }} src={lamb} className="Cute-lamb" alt="cute-lamb" />
        </div>
        <Container>
          <div style={{ margin: "5rem 0 2rem 0" }}>
            {mainComments && mainComments.map((comment) =>
              <Row key={`key-${comment.id}`} style={{ margin: "0.5rem 0" }}>
                <Col lg={2} ref={(element) => contentBox.current[`${comment.id}`] = element} style={{ display: "inline" }}>
                  {comment.user}
                </Col>
                <Col lg={8} style={{ textAlign: "left" }}>
                  {comment.content}
                </Col>
                <Form ref={(element) => formBox.current[`${comment.id}`] = element} style={{ display: "none" }}>
                  {comment.user}: <Form.Control onChange={contentUpdateHandler} defaultValue={comment.content} />
                  <Form.Control
                    placeholder="암호"
                    onChange={contentUpdatePwHandler}
                    value={updatePw}
                  />
                  <Button id={`complete-${comment.id}`} onClick={completeButton} type="submit">완료</Button>
                  <Button id={`cancel-${comment.id}`} onClick={cancelButton}>취소</Button>
                </Form>
                <Col lg={2} ref={(element) => buttonBox.current[`${comment.id}`] = element} style={{ display: "inline" }}>
                  <Button id={`update-${comment.id}`} onClick={updateButton} style={{ margin: "0 0.5rem" }}>수정</Button>
                  <Button id={`delete-${comment.id}`} onClick={deleteHandler}>삭제</Button>
                </Col>
              </Row>
            )}
          </div>
          <div style={{ marginBottom: "5rem" }}>
            <Form className="comment-form" onSubmit={submitHandler}>
              <Row className="mb-3">
                <Form.Group as={Col} lg={2} controlId="inputUserName">
                  <Form.Label>작성자</Form.Label>
                  <Form.Control
                    placeholder="최대 10자"
                    maxLength={10}
                    onChange={userChangeHandler}
                    value={user}
                    required
                  />
                </Form.Group>
                <Form.Group as={Col} lg={2} controlId="inputPw">
                  <Form.Label>비밀번호</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="최대 16자"
                    maxLength={16}
                    onChange={pwChangeHandler}
                    value={pw}
                    required
                  />
                </Form.Group>
                <Form.Group as={Col} lg={8} controlId="inputContent">
                  <Form.Label>내용</Form.Label>
                  <InputGroup>
                    <Form.Control
                      placeholder="최대 100자"
                      maxLength={100}
                      onChange={contentChangeHandler}
                      value={content}
                      required
                    />
                    <Button type="submit">확인</Button>
                  </InputGroup>
                </Form.Group>
              </Row>
            </Form>
          </div>
        </Container>
      </header >
    </div >
  );
}

export default App;
