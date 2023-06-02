import React from "react";
import Logout from "../components/Logout";
import Todos from "../components/Todos";

function TodoPage(props) {

    return (
        <div>
            <Todos />
            <Logout />
        </div>
    )
}

export default TodoPage;