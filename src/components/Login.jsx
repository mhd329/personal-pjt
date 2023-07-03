import React, { useCallback, useEffect, useState } from "react";

import { useNavigate, Link } from 'react-router-dom';

import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Form } from 'react-bootstrap';

import client from "../utils/client";
import { Cookies } from "react-cookie";

import Swal from "sweetalert2";

function Login(props) {
    const cookie = new Cookies();
    const [user, setUser] = useState({
        email: '',
        password: '',
    });
    const [formSubmitted, setFormSubmitted] = useState(false);

    const handleSubmit = useCallback(event => {
        setFormSubmitted(true);
        setUser({
            ...user,
            email: event.currentTarget.formBasicEmail.value,
            password: event.currentTarget.formBasicPassword.value,
        });
        event.preventDefault();
        event.stopPropagation();
    }, [formSubmitted]);

    // 로그인 성공시 todo 홈페이지로 간다.
    const navigate = useNavigate();
    const goToMain = (uid) => {
        navigate(`/todo-page/${uid}`, {
            state: {
                userId: uid,
            },
        });
    };

    useEffect(() => {
        if (formSubmitted) {
            async function login() {
                try {
                    const response = await client.post("accounts/login", user);
                    goToMain(response.data.user.id);
                } catch (error) {
                    console.log(error)
                    if (/^4\d{2}$/.test(error.response.status.toString())) {
                        Swal.fire({
                            icon: "warning",
                            text: error.response.data.message,
                            confirmButtonText: "확인",
                        });
                    } else {
                        alert(error.response.data.message);
                    }
                };
            };
            login();
        } else { // 로그인 페이지 들어왔을 때 이미 로그인 했는지 여부 검사
            async function checkToken() {
                try {
                    await client.get("accounts/login", cookie.get("access") ?
                        {
                            headers: {
                                Authorization: `Bearer ${cookie.get("access")}`,
                            },
                        } : null);
                } catch (error) {
                    if (error.response.status === 400 && error.response.data.user.id) {
                        Swal.fire({
                            icon: "warning",
                            text: error.response.data.message,
                            confirmButtonText: "확인",
                        });
                        goToMain(error.response.data.user.id);
                    } else {
                        alert(error.response.data.message);
                    };
                };
            };
            checkToken();
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
                        placeholder="example@example.com"
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
                        <Link to="/account/signup">
                            회원가입
                        </Link>
                    </Button>
                </div>
            </Form>
        </div>
    );
}

export default Login;