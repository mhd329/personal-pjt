import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';

import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Form } from 'react-bootstrap';
import { Link } from "react-router-dom";
import cookie from 'react-cookies';

import client from "../client";

function Login(props) {
    const [userEmail, setUserEmail] = useState("");
    const [userPassword, setUserPassword] = useState("");
    const [formSubmitted, setFormSubmitted] = useState(false);

    const handleSubmit = event => {
        setUserEmail(event.target.formBasicEmail.value);
        setUserPassword(event.target.formBasicPassword.value);
        setFormSubmitted(true);
        event.preventDefault();
    }

    const navigate = useNavigate();
    // 로그인 성공시 todo페이지로 가기
    const goToMain = () => {
        navigate("/todos")
    };

    useEffect(() => {
        if (formSubmitted) {
            async function login() {
                try {
                    const response = await client.post("login", {
                        email: userEmail,
                        password: userPassword,
                    }, {
                        withCredentials: true
                    });
                    console.log(response);
                    // 쿠키는 서버에서 저장된 상태로 반환됨
                    // cookie.save("access", response.data.token.access, {
                    //     secure: true,
                    //     httpOnly: true,
                    // });
                    // cookie.save("refresh", response.data.token.refresh, {
                    //     secure: true,
                    //     httpOnly: true,
                    // });
                    // goToMain();
                } catch (error) {
                    console.log(error.response);
                };
            };
            login();
        };
        setFormSubmitted(false);
    }, [formSubmitted]);

    return (
        <div className="login">
            <h1 className="login__title">로그인</h1>
            <Form className="login__form" onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label>
                        아이디
                    </Form.Label>
                    <Form.Control
                        type="email"
                        autoComplete="off"
                    />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Label>비밀번호</Form.Label>
                    <Form.Control
                        type="password"
                    />
                </Form.Group>
                <div className="login__buttons">
                    <Button className="login__buttons--login" variant="primary" type="submit">
                        로그인
                    </Button>
                    <Button className="login__buttons--signup" variant="primary">
                        <Link to="/signup">
                            회원가입
                        </Link>
                    </Button>
                </div>
            </Form>
        </div>
    );
}

export default Login;