import React from "react";
import Buttons from "../components/Buttons";
import AllTodos from "../components/AllTodos";
import SplitPane from "../components/SplitPane";

function AllTodosPage(props) {
    return (
        <SplitPane
            header={<h1 className="todo__header--title">모든 할 것 목록</h1>}
            main={<AllTodos />}
            footer={<Buttons />}
        />
    );
}

export default AllTodosPage;