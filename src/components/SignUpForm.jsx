import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';

import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Form } from 'react-bootstrap';
import registUser from "./registUser";

function SignUpForm(props) {
    const [userEmail, setUserEmail] = useState("");
    const [userPassword1, setUserPassword1] = useState("");
    const [userPassword2, setUserPassword2] = useState("");

    const userDateSet = [userEmail, userPassword1, userPassword2];

    const goToLogin = useNavigate(
        "/login"
    );

    useEffect(() => {}, userDateSet);

    const handleSubmit = event => {
        setUserEmail(event.target.formBasicEmail.value);
        setUserPassword1(event.target.formBasicPassword1.value);
        setUserPassword2(event.target.formBasicPassword2.value);
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



export default SignUpForm;