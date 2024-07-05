import { useState } from "react";

// initialValue로 object가 들어온다.
// object는 유저 스키마가 들어온다.

const useValidation = (object) => {
    const validationObj = {};
    // 사용자에 대한 state 초기화
    const [user, setUser] = useState(object);
    for (const key in object) {
        validationObj[key] = false;
    };
    // 유효성에 대한 state 초기화
    const [validation, setValidation] = useState(validationObj);
    // 유효성 검사를 SignUp에서만 사용하기 때문에 email, password에 대한 항목만 설정해두었다.

    // 정규 표현식을 통해 검사한다.
    const validEmail = new RegExp(/^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/i);
    const validPassword = new RegExp(/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,20})/);

    // 입력시 유효성 검사 작동
    // 매 입력마다 검사해야 하기 때문에 useCallback을 쓰지 않음
    const handler = (event) => {
        const inputId = event.currentTarget.id;
        setUser({
            ...user,
            [inputId]: event.currentTarget.value,
        });
        // 입력받은 필드의 id가 email인 경우
        if (inputId === "email") {
            setValidation({
                ...validation,
                [inputId]: validEmail.test(user["email"]),
            });
            // 입력받은 필드의 id가 password/password2인 경우
        } else {
            setValidation({
                ...validation,
                /*
                삼항연산을 굳이 사용하는 이유 : 
                예를 들어 단순히 'password: validPassword.test(user["password"])' 라고 하면 결과적으로 값 자체는 맞지만,
                인식되는 순서 때문인지 내 의도와 다르게 작동했다.
                
                아래 번호를 매겨놓은 대로 setUser에 의해 user["password"]에 값이 설정되는 작업이 입력 이벤트보다 먼저 수행되는 것 처럼 보였는데,
                
                1. input태그에 어떤 입력이 들어오면,
                2. 새로 업데이트된 value까지 인식하는게 아니라 업데이트 직전의 value까지만,
                3. setUser에 의해 user["password"]로 설정이 되고,
                4. 그 다음에 태그의 value가 업데이트 되는 것 같다.
                ex) 12345를 1부터 순서대로 입력하면 1~4까지만 set된 다음 5까지 적힌다.
                
                따라서 이벤트 값을 직접적으로 적용하기 위해 event.currentTarget.value를 사용할 수 밖에 없었다.
                근데 입력 필드의 id는 여러개이고 두 비밀번호에 대한 검사 등의 처리는 동시에 이루어져야 하므로,
                아래와 같이 분리할 수 밖에 없었다.
                */
                password:
                    inputId === "password" && true ?
                        validPassword.test(event.currentTarget.value) :
                        validPassword.test(user["password"]),
                password2:
                    inputId === "password2" && true ?
                        (validPassword.test(event.currentTarget.value) && (user["password"] === event.currentTarget.value)) :
                        (validPassword.test(user["password2"]) && (event.currentTarget.value === user["password2"])),
            });
        };
    };
    // 유저 객체와 유효성 검사 객체(검사대상 key에 대해 boolean 형식의 value)가 data에 담겨 set함수와 함께 반환된다.
    const data = [user, validation];
    return [data, handler];
};

export default useValidation;