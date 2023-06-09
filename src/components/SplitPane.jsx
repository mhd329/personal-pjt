import React from "react";

function SplitPane(props) {
    return (
        <div className="split-pane">
            <div className="header">
                {props.header ? props.header : null}
            </div>
            <div className="main">
                {props.main ? props.main : null}
            </div>
            <div className="footer">
                {props.footer ? props.footer : null}
            </div>
        </div>
    );
}

export default SplitPane;