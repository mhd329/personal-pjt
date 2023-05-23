import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';

import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Form } from 'react-bootstrap';

function SignUpForm(props) {
    const [userEmail, setUserEmail] = useState("");
    const [userPassword, setUserPassword] = useState("");
    const [userAccessToken, setUserAccessToken] = useState("");
    const [userRefreshToken, setUserRefreshToken] = useState("");

    const handleSubmit = event => {
        console.log(event.target)
        event.preventDefault();
        // setUserEmail(event.target.value);
        // setUserPassword(event.target.value);
    };

    return (
        <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>
                    아이디
                </Form.Label>
                <Form.Control
                    type="email"
                    placeholder="이메일 형식으로 입력해주세요."
                />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label>비밀번호</Form.Label>
                <Form.Control
                    type="password"
                />
            </Form.Group>
            <Button variant="dark" type="submit">가입하기</Button>
        </Form>
    );
}

export default SignUpForm;