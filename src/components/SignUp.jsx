import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';

import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Form } from 'react-bootstrap';

import axios from "axios"

// Hook은 오직 리액트 함수 내에서만 사용되어야 한다.
// (일반 js 함수 내부에서 호출해서는 안됨)
// 리액트 함수 최상위에서 호출해야 한다.

function SignUp(props) {
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [userEmail, setUserEmail] = useState("");
    const [userPassword1, setUserPassword1] = useState("");
    const [userPassword2, setUserPassword2] = useState("");
    const [userAccessToken, setUserAccessToken] = useState("");
    const [userRefreshToken, setUserRefreshToken] = useState("");

    const userDataSet = [userEmail, userPassword1, userPassword2];

    const goToLogin = useNavigate(
        "/login"
    );

    useEffect(() => {
        if (formSubmitted) {
            axios({
                method: "post",
                url: "http://127.0.0.1:8000/api/v1/accounts/register",
                data: {
                    email: userEmail,
                    password: userPassword1,
                    password2: userPassword2,
                },
            }).then((response) => {
                console.log(response.data.token.access);
                console.log(response.data.token.refresh);
            });
        }
    }, userDataSet);

    const handleSubmit = event => {
        setUserEmail(event.target.formBasicEmail.value);
        setUserPassword1(event.target.formBasicPassword1.value);
        setUserPassword2(event.target.formBasicPassword2.value);
        setFormSubmitted(true);
        event.preventDefault();
    };

    return (
        <div className="signup">
            <h1 className="signup__title">회원 가입</h1>
            <Form className="signup__form" onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label>
                        아이디
                    </Form.Label>
                    <Form.Control
                        type="email"
                        placeholder="이메일 형식으로 입력해주세요."
                    />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formBasicPassword1">
                    <Form.Label>비밀번호</Form.Label>
                    <Form.Control
                        type="password"
                    />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formBasicPassword2">
                    <Form.Label>비밀번호 확인</Form.Label>
                    <Form.Control
                        type="password"
                    />
                </Form.Group>
                <div className="signup__buttons">
                    <Button className="signup__buttons--submit" variant="primary" type="submit">가입하기</Button>
                    <Button className="signup__buttons--cancel" variant="danger" type="button" onClick={goToLogin}>취소</Button>
                </div>
            </Form>
        </div>
    );
}



export default SignUp;