import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';

function NotFoundPage(props) {
    const [count, setCount] = useState(5);
    const navigate = useNavigate();
    useEffect(() => {
        const timer = setInterval(() => {
            setCount(count => count - 1);
        }, 1000);
        if (count < 0) {
            setCount(0);
            clearInterval(timer);
            navigate(-1);
        };
        return () => clearInterval(timer);
    }, [count, navigate]);
    return (
        <div>
            <p>잘못된 주소입니다.</p>
            <p>{count}초 후 이전 페이지로 돌아갑니다.</p>
        </div>
    )
}

export default NotFoundPage;