import React from "react";
import AllTodos from "../components/AllTodos";
import { useNavigate, useOutletContext } from "react-router-dom";

// 완료되지 않은 todo들도 보여주는 페이지

function AllTodosPage(props) {
    const navigate = useNavigate();
    const { userId } = useOutletContext(); // 유저 아이디는 
    const handle401 = (AxiosResponse) => { // 엑세스 토큰이 만료되면 자동적으로 로그인 창으로 이동한다.
        if (AxiosResponse.response.status === 401) {
            navigate("/account/login/");
        };
    };

    return (
        <div className="content">
            <AllTodos handler={handle401} userId={userId} />
        </div>
    );
}

export default AllTodosPage;