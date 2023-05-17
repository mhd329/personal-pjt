# Hook

<br>

- 함수 컴포넌트와 클래스 컴포넌트의 차이

  - Function Component
    - 코드가 간결함
    - state 사용 불가
    - Lifecycle에 따른 기능의 구현 불가
  - Class Component
    - 생성자에서 state를 정의
    - setState 함수를 통해 state를 업데이트할 수 있다.
    - Lifecycle 메서드 제공

- 함수 컴포넌트에서도 클래스 컴포넌트의 다양한 기능들을 사용하기 위해 다양한 함수들(Hooks)이 등장했다.

  - Hook 함수들의 이름은 모두 use로 시작한다.

    1. useState()

       ```jsx
       const [변수명, set함수명] = useState(초기값);
       ```

       - state를 사용하기 위한 Hook
       - 아래와 같이 useState를 사용하여 state를 사용하고 업데이트 할 수 있다.

       ```jsx
       import React, { useState } from "react";
       
       function Counter(props) {
           const [count, setCount] = useState(0);
           return (
           	<div>
               	<p>총 {count} 번 클릭했습니다.</p>
                   <button onClick={() => setCount(count + 1)}>
                       클릭
                   </button>
               </div>
           );
       }
       ```

    2. useEffect()

       ```jsx
       // 기본적인 형태
       useEffect(이펙트 함수, 의존성 배열);
       // 의존성 배열 내부에는 의존성 변수가 여러 개 포함될 수 있다.
       
       
       // Effect function이 mount, unmount시에 각각 한번씩만 실행되게 하려면 아래와 같이 작성하면 된다.
       useEffect(이펙트 함수, []);
       // 의존성 배열이 빈 배열이다. == props, state 어떤 값에도 의존하지 않는 상태이다. == 업데이트 되지 않는다. == 여러번 실행되지 않는다.
       
       
       // 위와 반대로 아래와 같이 의존성 배열을 생략하게 되면 컴포넌트가 업데이트될 때마다 호출된다.
       useEffect(이펙트 함수);
       ```

       ```jsx
       // 활용 (서버 API)
       
       import React, { useState, useEffect } from "react";
       
       function UserStatus(props) {
           const [isOnline, setIsOnline] = useState(null);
           
           function handleStatusChange(status) {
               setIsOnline(status.isOnline);
           }
           /*
           의존성 배열을 생략한 useEffect 함수이다.
           유저 상태를 잠깐 확인했다가 바로 구독 해지하는 기능으로 보여진다.
           또한 구독하는 과정에서 유저의 상태도 변경하는 것으로 보인다.
           즉,유저의 상태를 확인하고 별도로 조작하기 위해 구독을 하고 구독 해지하는 것으로 보인다.
           */
           useEffect(() => {
               ServerAPI.subscribeUserStatus(props.user.id, handleStatusChange);
               return () => {
                   ServerAPI.unsubscribeUserStatus(props.user.id, handleStatusChange);
               };
           });
           /*
           1. 컴포넌트가 업데이트 될 때마다 화살표 함수가 실행
           2. 서버API의 유저 상태를 구독하는 함수가 실행됨
           	2-1. 해당 함수는 유저 아이디와 핸들링 함수를 인자로 받는다.
           		2-1-1. 핸들링 함수에서는 매개변수 status를 받고 status의 값에 따라 유저 상태를 변경하는 역할을 한다.
           		2-1-2. 매개변수 status 객체의 isOnline 속성은 true, false같은 bool타입의 값을 가질 수 있다고 생각해볼 수 있다.
           		2-1-3. 어떤 조건을 이유로 setIsOnline(true)가 되어 온라인이 된다.
           		2-1-4. 핸들링 함수로 유저 상태를 온라인으로 바꾼다.
           3. 화살표 함수를 반환한다.
           	3-1. useEffect 내부에서 return문을 사용하는 것으로 componentWillUnmount의 기능을 기대할 수 있다.
           	3-2. 정확히는 컴포넌트가 unmount되기 바로 전에 return문의 함수가 호출된다.
           	3-3. 즉, 컴포넌트가 언마운트 될 때 useEffect의 반환값으로 서버API의 유저 상태 구독을 해지하는 함수가 호출된다.
           	3-4. 컴포넌트가 언마운트 되면서 유저도 오프라인이 된다고 생각해볼 수 있다.
           */
           
           if (isOnline === null) {
               return "대기 중...";
           }
          	return isOnline ? "온라인" : "오프라인";
       }
       ```
    
       - 의존하고 있는 배열(의존성 배열) 내부의 값이 하나라도 변경되는 경우 Effect 함수가 실행된다.
    
         - 일반적으로 첫 렌더링과 업데이트된 다음 다시 렌더링될 때 실행된다.
    
       - Side effect를 수행하기 위한 Hook
    
         - 컴포넌트들이 화면에 렌더링된 이후에 비동기적으로 처리되어야 하는 부수적인 효과들
    
           == 렌더링 중에는 작업이 완료될 수 없다.
    
           == 렌더링이 끝난 이후에 실행되야 하는 작업들이다.
    
           == 다른 컴포넌트에 영향을 미칠 수 있다.
    
         - 어떤 데이터를 가져오기 위해 외부 API를 호출하는 경우
    
           - 일단 화면에 렌더링할 수 있는 것들을 먼저 렌더링
           - 실제 데이터는 비동기적으로 가져오는 것이 권장된다.
    
           ```jsx
           import React, { useState, useEffect } from "react";
           
           function Counter(props) {
               const [count, setCount] = useState(0);
               // componentDidMount, componentDidUpdate와 비슷하게 작동한다.
               // 의존성 배열이 없기 때문에 컴포넌트가 업데이트 될 때마다 해당 이펙트 함수를 실행하게 된다.
               useEffect(() => {
                   // 브라우저 API를 이용해서 document의 title을 업데이트 한다.
                   document.title = `현재까지 ${count}회 클릭하셨습니다.`;
               });
               return (
               	<div>
                   	<p>총 {count}회 클릭했습니다.</p>
                       <button onClick={() => setCount(count + 1)}>
                           클릭
                       </button>
                   </div>
               );
           }
           ```
    
         - 요청 즉시 1차적인 렌더링을 함으로써 연동하는 API가 응답이 늦어지거나 없는 경우에도 영향을 최소화 할 수 있다.
    
           - 사용자 경험 측면에서 유리하다.
    
       - 아래와 같은 기능들을 하나로 통합해서 제공한다.
    
         - componentDidMount(), componentDidUpdate(), componentWillUnmount()
    
    3. 그 외 여러가지 [Hook 함수들](F:\GitHub_management\projects\react-todo\react 정리\Use.md)이 있다.

<br>

## 사용 규칙

<br>

1. **Hook은 함수 컴포넌트의 최상위 레벨에서만 호출해야 한다.**

   - **반복문, 조건문, 중첩함수 등의 내부에서 호출하면 안된다.**

   - Hook을 컴포넌트가 렌더링될 때마다 매번 같은 순서로 호출하기 위함임

2. **리액트 함수 컴포넌트에서만 Hook을 호출해야 한다.**

---

eslint-plugin-react-hooks : Hook의 규칙을 따르게 해주는 플러그인

---

<br>

## Custom Hook

<br>

- state와 관련된 로직이 중복되는 경우 추출하여 Custom Hook으로 만들 수 있다.
  - Custom Hook : 이름이 use로 시작하고 내부에서 다른 Hook을 호출하는 하나의 자바스크립트 함수
  - 두 개 이상의 자바스크립트 함수에서 하나의 로직을 공유하고 싶을 때 하나의 함수로 만드는 것이다.
- **이름은 반드시 use로 시작해야 한다.**
- 여러 개의 컴포넌트에서 하나의 Custom Hook을 사용할 때 컴포넌트 내부에 있는 모든 state와 effect는 분리되어 있다.
  - 리액트는 각 Custom Hook 호출에 대해서 분리된 state를 가지게 된다.
  - 각 Custom Hook의 호출 또한 완전히 독립적이다.
