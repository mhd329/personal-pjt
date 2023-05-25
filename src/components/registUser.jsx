import axios from "axios"
import React, { useState } from "react";

const client = axios.create({
    baseURL: "http://127.0.0.1:8000/api/v1/",
    timeout: 5000,
});

const userDataSet = () => {
    console.log();
};

const registUser = () => {
    // 훅은 오직 리액트 함수 내에서만 사용되어야 한다.
    // (일반 js 함수 내부에서 호출해서는 안됨)
    // 리액트 함수 최상위에서 호출해야 한다.

    // const email = userDataSet[0];
    // const pw1 = userDataSet[1];
    // const pw2 = userDataSet[2];
};

export default registUser;