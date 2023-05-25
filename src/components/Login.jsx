import React, { useState } from "react";

import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Form } from 'react-bootstrap';
import { Link } from "react-router-dom";

function Login(props) {
    const [userEmail, setUserEmail] = useState("");
    const [userPassword, setUserPassword] = useState("");

    const handleSubmit = event => {
        setUserEmail(event.target.formBasicEmail.value);
        setUserPassword(event.target.formBasicPassword.value);
        event.preventDefault();
    }

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