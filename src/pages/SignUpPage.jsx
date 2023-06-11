import React from "react";
import SignUp from "../components/SignUp";
import SplitPane from "../components/SplitPane";

function SignUpPage(props) {
    return (
        <SplitPane
            main={<SignUp />}
        />
    )
}

export default SignUpPage;