import React, { useState, useRef, useEffect } from 'react';
import InputGroup from 'react-bootstrap/InputGroup';
import Container from 'react-bootstrap/Container';
import 'simplebar-react/dist/simplebar.min.css'; // 커스텀 스크롤 바 css
import Spinner from 'react-bootstrap/Spinner';
import 'bootstrap/dist/css/bootstrap.min.css'; // bootstrap css
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import lambsface from './lambsface.png'; // 양 그림
import SimpleBar from 'simplebar-react'; // 커스텀 스크롤 바
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import io from 'socket.io-client'; // 웹소켓 서버와 통신
import Swal from 'sweetalert2' // 커스텀 alert
import lamb from './lamb.jpg'; // 양 사진
import axios from 'axios'; // 비동기 통신
import 'animate.css'; // 애니메이션 라이브러리
import './App.css';

/////////////////////////////////////////////////////// 정적인 변수들 ///////////////////////////////////////////////////////

// 입력 관련 상수들
const pwMaxLength = 16;
const contentMaxLength = 100;
const userNameMaxLength = 10;

// 너비 조정 상수들
const headerColLength = 2;
const contentColLength = 8;
const buttonsColLength = 2;

const headerColLengthMd = 3;
const contentColLengthMd = 6;
const buttonsColLengthMd = 3;

const headerColLengthSm = 3;
const contentColLengthSm = 6;
const buttonsColLengthSm = 3;

const headerColLengthXs = 4;
const contentColLengthXs = 4;
const buttonsColLengthXs = 4;

/////////////////////////////////////////////////////// 정적인 변수들 끝 ///////////////////////////////////////////////////////

function App() {
  // 기본 상태
  const [mainComments, setMainComments] = useState([]);
  // const [subComments, setSubComments] = useState([]); // 대댓글: 나중에 구현할 것임
  const [user, setUser] = useState("");
  const [broadCastUser, setBroadCastUser] = useState("");
  const [pw, setPw] = useState("");
  const [content, setContent] = useState("");
  const [broadCastContent, setBroadCastContent] = useState("");
  const [userCount, setUserCount] = useState(0); // 동접자 관련 state

  // 이미지 마우스 호버시 변환
  const [mouseOn, setMouseOn] = useState(false);

  // 업데이트 관련 상태
  const [changed, setChanged] = useState(false);
  const [changedContent, setChangedContent] = useState("");
  const [updatePw, setUpdatePw] = useState("");
  const [updatePwTarget, setUpdatePwTarget] = useState("");
  const contentBox = useRef({});

  // window 객체를 참조
  const windowRef = useRef(window);

  // 현재 창 안쪽 높이 관련 상태.
  const [windowHeight, setWindowHeight] = useState(0);

  // 버튼 클릭시 display 속성의 변화을 주기 위한 ref
  const updateButtonBox = useRef({});
  const completeButtonBox = useRef({});
  const formBox = useRef({});
  const pwBox = useRef({});

  // 버튼 클릭시 spinner로 로딩중임을 표시하기 위한 ref
  const updateConfirm = useRef({});
  const updateSpinner = useRef({});
  const submitConfirm = useRef(null);
  const submitSpinner = useRef(null);
  /* 
  spinner: 빙글빙글 돌아가는 모양의 부트스트랩 요소이다.
  버튼을 클릭하면 로딩중일때 버튼 내부의 text가 이 요소로 교체되고,
  로딩이 완료되면 다시 text로 바뀐다.
  */

  // 윈도우 안쪽 높이가 바뀌면 재설정하는 함수
  const handleResize = () => {
    setWindowHeight(windowRef.current.innerHeight);
  }

  useEffect(() => {
    // 컴포넌트 마운트시 윈도우 사이즈를 등록한다.
    setWindowHeight(windowRef.current.innerHeight);
    // 화면 높이가 바뀔때마다 handleResize를 호출한다.
    windowRef.current.onresize = handleResize;
  }, []);

  // 웹소켓 서버 관련 상태
  const [receivedMessage, setReceivedMessage] = useState(null);
  const [socket, setSocket] = useState(null);

  // 웹소켓 alert 관련 상태
  const [completedAlertShow, setCompletedAlertShow] = useState(false);
  const [failureAlertShow, setFailureAlertShow] = useState(false);

  // 웹소켓
  useEffect(() => {
    // 웹소켓을 초기화한다, nginx 미사용 : nginx 사용
    const newSocket = io.connect({ path: `/socket.io` });
    setSocket(newSocket);

    // 웹소켓 이벤트에 대한 리스너를 추가한다.
    newSocket.on("connect", () => {
      // console.log("웹소켓 연결됨");
    });

    newSocket.on("increase", (n) => { // 증가 이벤트
      setUserCount(n);
    });

    newSocket.on("decrease", (n) => { // 감소 이벤트
      setUserCount(n);
    });

    // 웹소켓 서버로부터 데이터를 받음
    newSocket.on("fromBack", (data) => {
      // 요청이 정상적이라면 data는 key-value 쌍임
      // 요청이 과다하면 data는 null
      if (data === "Too many requests") {
        setFailureAlertShow(true);
        setCompletedAlertShow(false);
        submitSpinner.current.style.display = "none"
        submitConfirm.current.style.display = "block"
      } else if (data !== "Too many requests" && data) {
        setReceivedMessage(data);
      }
    });

    // 컴포넌트가 언마운트될 때 리스너를 제거하고 웹소켓 연결을 끊는다.
    return () => {
      newSocket.disconnect();
    };
  }, []);

  // 접속자 수가 바뀔 때마다 렌더링된다.
  useEffect(() => {

  }, [userCount]);

  // 웹소켓 서버로부터 데이터를 받으면 조건에 따라 alert가 발생하면서 댓글이 등록되거나 취소됨
  useEffect(() => {
    // 댓글 등록 로직
    const req = async () => {
      if (receivedMessage.broadcast) {
        setBroadCastUser(receivedMessage.user)
        setBroadCastContent(receivedMessage.content)
        setCompletedAlertShow(true);
        setFailureAlertShow(false);
      } else {
        try {

          const response = await axios.post(`/api/add-main-comment`,
            {
              user: receivedMessage.user,
              pw: receivedMessage.pw,
              content: receivedMessage.content,
            }
          );
          submitSpinner.current.style.display = "none"
          submitConfirm.current.style.display = "block"
          if (response.data.success) { // db에 성공적으로 등록했다는 응답이 옴
            setMainComments([...mainComments, {
              id: response.data.id,
              user: response.data.user,
              content: response.data.content,
            }]);
            setUser("");
            setPw("");
            setContent("");
          }
        } catch (error) { // db에 등록 실패
          submitSpinner.current.style.display = "none"
          submitConfirm.current.style.display = "block"
          Swal.fire({
            icon: "error",
            title: "입력에 실패했습니다.",
            text: `Error: ${error.response.data.message}`,
            confirmButtonText: "확인",
          });
        }
      }
    }
    if (receivedMessage) {
      req(); // 댓글 db에 등록요청하는 비동기 함수 실행
    }
  }, [receivedMessage]);

  // db
  useEffect(() => {
    // 서버에서 db에 있는 댓글들을 가져온다.

    axios.get(`/api/all-comments`)
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
  }

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
  }

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
  }

  // 제출 버튼 클릭시 동작하는 함수
  const submitHandler = (event) => {
    event.preventDefault();
    submitConfirm.current.style.display = "none"
    submitSpinner.current.style.display = "block"
    // 서버에 새로운 데이터가 추가될 예정이라고 소켓에 알림
    socket.emit("fromFront", {
      user: user,
      pw: pw,
      content: content,
    });
  }

  // 댓글 수정 버튼
  const updateButton = (event) => {
    const id = event.currentTarget.id;
    const res = id.replace("update-", "")
    pwBox.current[`${res}`].style.display = "inline";
    formBox.current[`${res}`].style.display = "inline";
    contentBox.current[`${res}`].style.display = "none";
    updateButtonBox.current[`${res}`].style.display = "none";
    completeButtonBox.current[`${res}`].style.display = "inline";
  }

  // 수정 취소 버튼
  const cancelButton = (event) => {
    const id = event.currentTarget.id;
    const res = id.replace("cancel-", "")
    pwBox.current[`${res}`].style.display = "none";
    formBox.current[`${res}`].style.display = "none";
    contentBox.current[`${res}`].style.display = "inline";
    updateButtonBox.current[`${res}`].style.display = "inline";
    completeButtonBox.current[`${res}`].style.display = "none";
    setChanged(false);
    setChangedContent("");
    setUpdatePw("");
    setUpdatePwTarget("");
  }

  // 댓글 수정 내용 입력
  const contentUpdateHandler = (event) => {
    setChanged(true);
    setChangedContent(event.currentTarget.value);
  }

  // 댓글 수정 비밀번호 입력
  const contentUpdatePwHandler = (event) => {
    setUpdatePwTarget(event.currentTarget.id);
    setUpdatePw(event.currentTarget.value);
  }

  // 수정 완료 버튼
  const completeButton = (event) => {
    event.preventDefault();
    const id = event.currentTarget.id;
    const res = id.replace("complete-", "")
    if (changed) {
      if (changedContent.length === 0) {
        Swal.fire({
          icon: "warning",
          title: "내용을 입력해주세요.",
          confirmButtonText: "확인",
        });
      } else if (changedContent.length > contentMaxLength) {
        Swal.fire({
          icon: "warning",
          title: "내용이 너무 깁니다.",
          confirmButtonText: "확인",
        });
      } else {
        updateConfirm.current[`${res}`].style.display = "none";
        updateSpinner.current[`${res}`].style.display = "inline";

        axios.patch(`/api/comment-update/${res}`,
          {
            content: changedContent,
            pw: updatePw,
          }
        ).then((response) => {
          if (response.data.success) {
            setMainComments(response.data.comments);
            pwBox.current[`${res}`].style.display = "none";
            formBox.current[`${res}`].style.display = "none";
            contentBox.current[`${res}`].style.display = "inline";
            updateSpinner.current[`${res}`].style.display = "none";
            updateConfirm.current[`${res}`].style.display = "inline";
            updateButtonBox.current[`${res}`].style.display = "inline";
            completeButtonBox.current[`${res}`].style.display = "none";
            setChanged(false);
            setChangedContent("");
            setUpdatePw("");
            setUpdatePwTarget("");
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
      }
    } else {
      pwBox.current[`${res}`].style.display = "none";
      formBox.current[`${res}`].style.display = "none";
      contentBox.current[`${res}`].style.display = "inline";
      updateButtonBox.current[`${res}`].style.display = "inline";
      completeButtonBox.current[`${res}`].style.display = "none";
      setUpdatePw("");
      setUpdatePwTarget("");
    }
  }

  // 댓글 삭제 버튼
  const deleteHandler = (event) => {
    event.preventDefault();
    const id = event.currentTarget.id;
    const res = id.replace("delete-", "")
    Swal.fire({
      icon: "warning",
      title: "삭제하시려면 비밀번호를 입력하세요.",
      input: "password",
      confirmButtonText: "확인",
      showCancelButton: true,
      cancelButtonText: "취소",
      showLoaderOnConfirm: true,
      preConfirm: async function (deletePw) {
        try {

          const response = await axios.delete(`/api/comment-delete/${res}`,
            {
              data: {
                pw: deletePw,
              }
            }
          );
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
  }
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////// return ///////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  return (
    <div className="App">
      <SimpleBar style={{ height: windowHeight }}>
        <header className="App-header">
          <h3 style={{
            margin: "1rem 0",
            zIndex: "2",
          }}>현재 접속자 수: {userCount}</h3>
          <h1 style={{
            marginTop: "3rem",
            zIndex: "2",
          }}>양 게시판</h1>

          {/* alert 구역 */}
          <div style={{
            position: "fixed",
            top: "32px",
            right: "32px",
            zIndex: "3",
          }}>
            {completedAlertShow &&
              <Alert className="animate__animated animate__fadeIn" onClose={() => setCompletedAlertShow(false)} variant="success" dismissible style={{
                animationDuration: "2s"
              }}>
                <Alert.Heading className="d-flex justify-content-center">
                  댓글창이 갱신되었습니다.
                </Alert.Heading>
                <p>
                  작성자: {broadCastUser}
                  <br />
                  내용: {broadCastContent}
                </p>
              </Alert>}
            {failureAlertShow &&
              <Alert className="animate__animated animate__fadeIn" onClose={() => setFailureAlertShow(false)} variant="danger" dismissible style={{
                animationDuration: "2s"
              }}>
                <Alert.Heading className="d-flex justify-content-center">
                  너무 많은 요청을 보냈습니다.
                </Alert.Heading>
                <p>
                  잠시 뒤 다시 시도해주세요.
                </p>
              </Alert>}
          </div>
          {/* alert 구역 끝 */}

          {/* 이미지 구역 */}
          <div
            onMouseOver={() => setMouseOn(true)}
            onMouseOut={() => setMouseOn(false)}
            style={{
              zIndex: "1",
              width: "400px",
              aspectRatio: "5 / 5",
              marginTop: "2rem",
            }}>
            {!mouseOn && <img style={{
              display: "block",
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: "50%",
            }} src={lamb} className="Cute-lamb" alt="cute-lamb" />}
            {mouseOn && <img style={{
              display: "block",
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: "5rem",
            }} src={lambsface} className="Cute-lamb" alt="cute-lamb" />}
          </div>
          {/* 이미지 구역 끝 */}
          {/* 댓글 구역 */}
          <Container>
            <div style={{ margin: "3rem 0 2rem 0", }}>
              {mainComments && mainComments.map((comment) =>
                <Row key={`key-${comment.id}`} style={{ margin: "0.5rem 0", }}>

                  {/* 댓글 작성자 */}

                  <Col lg={headerColLength} md={headerColLengthMd} sm={headerColLengthSm} xs={headerColLengthXs}>
                    {comment.user}
                  </Col>

                  {/* 댓글 작성자 끝 */}
                  {/* 댓글 내용 */}

                  {/* 수정 버튼 클릭 전 */}
                  <Col lg={contentColLength} md={contentColLengthMd} sm={contentColLengthSm} xs={contentColLengthXs}
                    style={{ display: "inline", }} ref={(element) => contentBox.current[`${comment.id}`] = element}>
                    <div style={{ textAlign: "start", }}>
                      {comment.content}
                    </div>
                  </Col>
                  {/* 수정 버튼 클릭 전 */}
                  {/* 수정 버튼 클릭 후 */}
                  <Form id={`form-${comment.id}`} as={Col} lg={6} md={4} sm={4} xs={3} ref={(element) => formBox.current[`${comment.id}`] = element} style={{ display: "none", }}>
                    <Form.Control
                      size="sm"
                      maxLength={contentMaxLength}
                      onChange={contentUpdateHandler}
                      defaultValue={comment.content}
                      required
                    />
                  </Form>
                  <Form as={Col} lg={2} md={2} sm={2} xs={1} ref={(element) => pwBox.current[`${comment.id}`] = element} style={{ display: "none", }}>
                    <Form.Control
                      id={`pw-${comment.id}`}
                      size="sm"
                      type="password"
                      placeholder="암호"
                      maxLength={pwMaxLength}
                      onChange={contentUpdatePwHandler}
                      value={`pw-${comment.id}` === updatePwTarget ? updatePw : ""} // 아무런 동작도 하지 않음
                      required
                    />
                  </Form>
                  {/* 수정 버튼 클릭 후 */}

                  {/* 댓글 내용 끝 */}
                  {/* 댓글 버튼들 */}

                  {/* 수정 버튼 클릭 전 */}
                  <Col lg={buttonsColLength} md={buttonsColLengthMd} sm={buttonsColLengthSm} xs={buttonsColLengthXs}
                    ref={(element) => updateButtonBox.current[`${comment.id}`] = element} style={
                      {
                        display: "inline",
                        textAlign: "end",
                      }
                    }>
                    <Button size="sm" id={`update-${comment.id}`} onClick={updateButton} style={{
                      marginRight: "0.5rem",
                      verticalAlign: "top",
                    }}>
                      수정
                    </Button>
                    <Button size="sm" id={`delete-${comment.id}`} onClick={deleteHandler} style={{ verticalAlign: "top", }}>
                      삭제
                    </Button>
                  </Col>
                  {/* 수정 버튼 클릭 전 */}
                  {/* 수정 버튼 클릭 후 */}
                  <Col lg={buttonsColLength} md={buttonsColLengthMd} sm={buttonsColLengthSm} xs={buttonsColLengthXs}
                    ref={(element) => completeButtonBox.current[`${comment.id}`] = element} style={
                      {
                        display: "none",
                        textAlign: "end",
                      }
                    }>
                    <Button size="sm" id={`complete-${comment.id}`} onClick={completeButton} form={`form-${comment.id}`} type="submit" style={
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
                    <Button size="sm" id={`cancel-${comment.id}`} onClick={cancelButton} style={{ verticalAlign: "top", }}>
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
                  <Form.Group as={Col} lg={2} md={3} sm={3} xs={3}
                    controlId="inputUserName">
                    <Form.Label>작성자</Form.Label>
                    <Form.Control
                      size="sm"
                      placeholder={`최대 ${userNameMaxLength}자`}
                      maxLength={userNameMaxLength}
                      onChange={userChangeHandler}
                      value={user}
                      required
                    />
                  </Form.Group>
                  <Form.Group as={Col} lg={2} md={3} sm={3} xs={3}
                    controlId="inputPw">
                    <Form.Label>비밀번호</Form.Label>
                    <Form.Control
                      size="sm"
                      type="password"
                      placeholder={`최대 ${pwMaxLength}자`}
                      maxLength={pwMaxLength}
                      onChange={pwChangeHandler}
                      value={pw}
                      required
                    />
                  </Form.Group>
                  <Form.Group as={Col} lg={8} md={6} sm={6} xs={6}
                    controlId="inputContent">
                    <Form.Label>내용</Form.Label>
                    <InputGroup size="sm">
                      <Form.Control
                        size="sm"
                        placeholder={`최대 ${contentMaxLength}자`}
                        maxLength={contentMaxLength}
                        onChange={contentChangeHandler}
                        value={content}
                        required
                      />
                      <Button size="sm" type="submit">
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
        </header>
      </SimpleBar>
    </div>
  );
}

export default App;
