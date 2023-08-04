import React, { useState, useRef, useEffect } from 'react';
import InputGroup from 'react-bootstrap/InputGroup';
import Container from 'react-bootstrap/Container';
import Spinner from 'react-bootstrap/Spinner';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import io from 'socket.io-client';
import Swal from 'sweetalert2'
import lamb from './lamb.jpg';
import axios from 'axios';
import './App.css';

// 입력 관련 상수들
const pwMaxLength = 16;
const contentMaxLength = 100;
const userNameMaxLength = 10;

// 너비 조정 상수들
const headerColLength = 2;
const contentColLength = 8;
const buttonsColLength = 2;

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

  const updateConfirm = useRef({});
  const updateSpinner = useRef({});
  const updateButtonBox = useRef({});
  const completeButtonBox = useRef({});
  const formBox = useRef({});
  const pwBox = useRef({});

  const submitConfirm = useRef(null);
  const submitSpinner = useRef(null);

  // 소켓 관련 상태
  const [receivedMessage, setReceivedMessage] = useState('');

  // 웹소켓 연결
  const socket = io.connect('http://localhost:3001');

  // 소켓으로부터 응답 받을때마다 페이지 갱신
  useEffect(() => {
    socket.on("웹 페이지 갱신됨", (data) => {
      setReceivedMessage(data.message);
    });
  }, [socket])

  // 첫 렌더링시 서버에서 댓글들을 불러옴
  useEffect(() => {
    // db에 있는 값을 가져온다.
    // axios.get(`/api/all-comments`)
    axios.get(`http://localhost:5000/api/all-comments`)
      .then((response) => {
        setMainComments(response.data);
      }).catch((error) => {
        Swal.fire({
          icon: "error",
          title: "에러가 발생했습니다.",
          text: `Error: ${error.response.data.message}`,
          confirmButtonText: "확인",
        });
      });
  }, []);

  // 내용 입력시 상태 변경
  const contentChangeHandler = (event) => {
    if (event.currentTarget.value.length > contentMaxLength) {
      Swal.fire({
        icon: "warning",
        title: "내용이 너무 깁니다.",
        confirmButtonText: "확인",
      });
    } else {
      setContent(event.currentTarget.value);
    }
  };

  // 작성자 입력시 상태 변경
  const userChangeHandler = (event) => {
    if (event.currentTarget.value.length > userNameMaxLength) {
      Swal.fire({
        icon: "warning",
        title: "이름이 너무 깁니다.",
        confirmButtonText: "확인",
      });
    } else {
      setUser(event.currentTarget.value);
    }
  };

  // 비밀번호 입력시 상태 변경
  const pwChangeHandler = (event) => {
    if (event.currentTarget.value.length > pwMaxLength) {
      Swal.fire({
        icon: "warning",
        title: "비밀번호가 너무 깁니다.",
        confirmButtonText: "확인",
      });
    } else {
      setPw(event.currentTarget.value);
    }
  };

  // 제출 버튼 클릭시 동작하는 함수
  const submitHandler = (event) => {
    event.preventDefault();
    submitConfirm.current.style.display = "none"
    submitSpinner.current.style.display = "block"
    // axios.post(`/api/value`, { value: value })
    const req = async () => {
      try {
        const response = await axios.post(`http://localhost:5000/api/add-main-comment`,
          {
            user: user,
            pw: pw,
            content: content,
          })
        submitSpinner.current.style.display = "none"
        submitConfirm.current.style.display = "block"
        if (response.data.success) {
          setMainComments([...mainComments, {
            id: response.data.id,
            user: response.data.user,
            content: response.data.content,
          }]);
          setUser("");
          setPw("");
          setContent("");
        }
      } catch (error) {
        submitSpinner.current.style.display = "none"
        submitConfirm.current.style.display = "block"
        Swal.fire({
          icon: "error",
          title: "입력에 실패했습니다.",
          text: `Error: ${error.response.data.message}`,
          confirmButtonText: "확인",
        });
      }
    };
    req();
  };

  // 댓글 수정 버튼
  const updateButton = (event) => {
    const id = event.currentTarget.id;
    const res = id.replace("update-", "")
    pwBox.current[`${res}`].style.display = "inline";
    formBox.current[`${res}`].style.display = "inline";
    contentBox.current[`${res}`].style.display = "none";
    updateButtonBox.current[`${res}`].style.display = "none";
    completeButtonBox.current[`${res}`].style.display = "inline";
  };

  // 수정 취소 버튼
  const cancelButton = (event) => {
    const id = event.currentTarget.id;
    const res = id.replace("cancel-", "")
    pwBox.current[`${res}`].style.display = "none";
    formBox.current[`${res}`].style.display = "none";
    contentBox.current[`${res}`].style.display = "inline";
    updateButtonBox.current[`${res}`].style.display = "inline";
    completeButtonBox.current[`${res}`].style.display = "none";
  };

  // 댓글 수정 내용 입력
  const contentUpdateHandler = (event) => {
    if (event.currentTarget.value.length > contentMaxLength) {
      Swal.fire({
        icon: "warning",
        title: "내용이 너무 깁니다.",
        confirmButtonText: "확인",
      });
    } else {
      setChangedContent(event.currentTarget.value);
    }
  };

  // 댓글 수정 비밀번호 입력
  const contentUpdatePwHandler = (event) => {
    if (event.currentTarget.value.length > pwMaxLength) {
      Swal.fire({
        icon: "warning",
        title: "비밀번호가 너무 깁니다.",
        confirmButtonText: "확인",
      });
    } else {
      setUpdatePw(event.currentTarget.value);
    }
  };

  // 수정 완료 버튼
  const completeButton = (event) => {
    event.preventDefault();
    const id = event.currentTarget.id;
    const res = id.replace("complete-", "")
    updateConfirm.current[`${res}`].style.display = "none";
    updateSpinner.current[`${res}`].style.display = "inline";
    axios.patch(`http://localhost:5000/api/comment-update/${res}`,
      {
        content: changedContent,
        pw: updatePw,
      }).then((response) => {
        if (response.data.success) {
          setMainComments(response.data.comments);
          pwBox.current[`${res}`].style.display = "none";
          formBox.current[`${res}`].style.display = "none";
          contentBox.current[`${res}`].style.display = "inline";
          updateSpinner.current[`${res}`].style.display = "none";
          updateConfirm.current[`${res}`].style.display = "inline";
          updateButtonBox.current[`${res}`].style.display = "inline";
          completeButtonBox.current[`${res}`].style.display = "none";
          setChangedContent("");
          setUpdatePw("");
        }
      }).catch((error) => {
        updateSpinner.current[`${res}`].style.display = "none";
        updateConfirm.current[`${res}`].style.display = "inline";
        if (error.response.data.statusCode === 400) {
          // alert("올바른 암호를 입력하세요.");
          Swal.fire({
            icon: "warning",
            title: error.response.data.message,
            confirmButtonText: "확인",
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "수정에 실패했습니다.",
            text: `Error: ${error}`,
            confirmButtonText: "확인",
          });
        }
      });
  };

  // 댓글 삭제 버튼
  const deleteHandler = (event) => {
    event.preventDefault();
    const id = event.currentTarget.id;
    const res = id.replace("delete-", "")
    Swal.fire({
      icon: "warning",
      title: "삭제하시려면 비밀번호를 입력하세요.",
      input: "text",
      confirmButtonText: "확인",
      showCancelButton: true,
      cancelButtonText: "취소",
      showLoaderOnConfirm: true,
      preConfirm: async function (deletePw) {
        try {
          const response = await axios.delete(`http://localhost:5000/api/comment-delete/${res}`,
            {
              data: {
                pw: deletePw,
              }
            });
          if (response.data.success) {
            setMainComments(response.data.comments);
          }
        } catch (error) {
          if (error.response.data.statusCode === 400) {
            // alert("올바른 암호를 입력하세요.");
            Swal.showValidationMessage(
              `${error.response.data.message}`
            )
          } else {
            Swal.showValidationMessage(
              `서버 에러: ${error.response.data.message}`
            )
          }
        }
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          icon: "success",
          title: "삭제되었습니다.",
          confirmButtonText: "확인",
        });
      }
    });
  };
  return (
    <div className="App">
      <header className="App-header">
        {/* 이미지 구역 */}
        <h1>양 게시판</h1>
        <div style={{
          width: "400px",
          aspectRatio: "5 / 5",
          marginTop: "2rem",
        }}>
          <img style={{
            display: "block",
            width: "100%",
            height: "100%",
            objectFit: "cover",
            borderRadius: "50%",
          }} src={lamb} className="Cute-lamb" alt="cute-lamb" />
        </div>
        {/* 이미지 구역 끝 */}
        {/* 댓글 구역 */}
        <Container>
          <div style={{ margin: "3rem 0 2rem 0", }}>
            {mainComments && mainComments.map((comment) =>
              <Row key={`key-${comment.id}`} style={{ margin: "0.5rem 0", }}>

                {/* 댓글 작성자 */}

                <Col lg={headerColLength}>
                  {comment.user}
                </Col>

                {/* 댓글 작성자 끝 */}
                {/* 댓글 내용 */}

                {/* 수정 버튼 클릭 전 */}
                <Col lg={contentColLength} style={{ display: "inline", }} ref={(element) => contentBox.current[`${comment.id}`] = element}>
                  <div style={{ textAlign: "left", }}>
                    {comment.content}
                  </div>
                </Col>
                {/* 수정 버튼 클릭 전 */}
                {/* 수정 버튼 클릭 후 */}
                <Form id={`form-${comment.id}`} as={Col} lg={6} ref={(element) => formBox.current[`${comment.id}`] = element} style={{ display: "none", }}>
                  <Form.Control
                    maxLength={contentMaxLength}
                    onChange={contentUpdateHandler}
                    defaultValue={comment.content}
                    required
                  />
                </Form>
                <Col lg={2} ref={(element) => pwBox.current[`${comment.id}`] = element} style={{ display: "none", }}>
                  <Form.Control
                    placeholder="암호"
                    maxLength={pwMaxLength}
                    onChange={contentUpdatePwHandler}
                    value={updatePw}
                    required
                  />
                </Col>
                {/* 수정 버튼 클릭 후 */}

                {/* 댓글 내용 끝 */}
                {/* 댓글 버튼들 */}

                {/* 수정 버튼 클릭 전 */}
                <Col lg={buttonsColLength} ref={(element) => updateButtonBox.current[`${comment.id}`] = element} style={
                  {
                    display: "inline",
                    textAlign: "left",
                  }
                }>
                  <Button id={`update-${comment.id}`} onClick={updateButton} style={{
                    marginRight: "0.5rem",
                    verticalAlign: "top",
                  }}>
                    수정
                  </Button>
                  <Button id={`delete-${comment.id}`} onClick={deleteHandler} style={{ verticalAlign: "top", }}>
                    삭제
                  </Button>
                </Col>
                {/* 수정 버튼 클릭 전 */}
                {/* 수정 버튼 클릭 후 */}
                <Col lg={buttonsColLength} ref={(element) => completeButtonBox.current[`${comment.id}`] = element} style={
                  {
                    display: "none",
                    textAlign: "left",
                    verticalAlign: "top",
                  }
                }>
                  <Button id={`complete-${comment.id}`} onClick={completeButton} form={`form-${comment.id}`} type="submit" style={
                    {
                      marginRight: "0.5rem",
                      verticalAlign: "top",
                    }
                  }>
                    <span ref={(element) => updateConfirm.current[`${comment.id}`] = element} style={{ display: "block" }}>
                      완료
                    </span>
                    <span ref={(element) => updateSpinner.current[`${comment.id}`] = element} style={{ display: "none" }}>
                      <Spinner animation="border" role="status" size="sm">
                        <span className="visually-hidden">로딩중</span>
                      </Spinner>
                    </span>
                  </Button>
                  <Button id={`cancel-${comment.id}`} onClick={cancelButton} style={{ verticalAlign: "top", }}>
                    취소
                  </Button>
                </Col>
                {/* 수정 버튼 클릭 후 */}

                {/* 댓글 버튼들 끝 */}

              </Row>
            )}
          </div>

          {/* 댓글 구역 끝 */}
          {/* 새 댓글 form */}

          <div style={{
            marginBottom: "5rem",
            textAlign: "center",
          }}>
            <Form className="comment-form" onSubmit={submitHandler}>
              <Row className="mb-3">
                <Form.Group as={Col} lg={headerColLength} controlId="inputUserName">
                  <Form.Label>작성자</Form.Label>
                  <Form.Control
                    placeholder={`최대 ${userNameMaxLength}자`}
                    maxLength={userNameMaxLength}
                    onChange={userChangeHandler}
                    value={user}
                    required
                  />
                </Form.Group>
                <Form.Group as={Col} lg={headerColLength} controlId="inputPw">
                  <Form.Label>비밀번호</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder={`최대 ${pwMaxLength}자`}
                    maxLength={pwMaxLength}
                    onChange={pwChangeHandler}
                    value={pw}
                    required
                  />
                </Form.Group>
                <Form.Group as={Col} lg={contentColLength} controlId="inputContent">
                  <Form.Label>내용</Form.Label>
                  <InputGroup>
                    <Form.Control
                      placeholder={`최대 ${contentMaxLength}자`}
                      maxLength={contentMaxLength}
                      onChange={contentChangeHandler}
                      value={content}
                      required
                    />
                    <Button type="submit">
                      <span ref={submitConfirm} style={{ display: "block" }}>
                        확인
                      </span>
                      <span ref={submitSpinner} style={{ display: "none" }}>
                        <Spinner animation="border" role="status" size="sm">
                          <span className="visually-hidden">로딩중</span>
                        </Spinner>
                      </span>
                    </Button>
                  </InputGroup>
                </Form.Group>
              </Row>
            </Form>
          </div>

          {/* 새 댓글 form 끝 */}

        </Container>
      </header >
    </div >
  );
}

export default App;
