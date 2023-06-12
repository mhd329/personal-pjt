import React from "react";
import Login from "../components/Login";
import SignUp from "../components/SignUp";
import SplitPane from "../components/SplitPane";

function AccountPage(props) {
    function contents(contentType) {
        if (contentType === "login") {
            return <Login />
        } else if (contentType === "sign-up") {
            return <SignUp />
        };
    };
    return (
        <SplitPane
            header={<h1 className="header--title">Todos</h1>}
            main={contents(props.content)}
        />
    )
}

export default AccountPage;