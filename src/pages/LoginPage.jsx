import React from "react";
import Login from "../components/Login";
import SplitPane from "../components/SplitPane";

function LoginPage(props) {
    return (
        <SplitPane
            header={<h1 className="login__header--title">Todos</h1>}
            main={<Login />}
        />
    )
}

export default LoginPage;