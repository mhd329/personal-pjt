# React-Component

<br>

- 컴포넌트는 또 다른 컴포넌트들로 구성될 수 있음

- 컴포넌트들은 모여서 하나의 페이지를 이룬다.

  == 리액트는 수 많은 컴포넌트들로 구성되어 있다.

<br>

## 함수와 컴포넌트

<br>

- React Component

- 컴포넌트의 이름은 대문자로 시작해야 한다.

  - 내장 컴포넌트와 커스텀 컴포넌트가 있다.

  - 내장 컴포넌트 : div, span 같은 기본 html 태그들

  - 아래와 같이 커스텀 컴포넌트를 만들 수 있다.

    ```jsx
    function welcome(props) {
      return <h1>Hello, {props.name}</h1>;
    };
    const root = ReactDOM.createRoot(document.getElementById('root'));
    const element = <welcome name="현동" />;
    root.render(element);
    /*
    welcome 컴포넌트의 이름은 내장 컴포넌트처럼 소문자로 시작한다.
    element 변수에서는 welcome으로 참조하고 있다.
    이렇게 되면 html태그로 인식하게 되어 정확한 실행을 보장할 수 없다.
    */
    ```

    ```jsx
    function Welcome(props) {
      return <h1>Hello, {props.name}</h1>;
    };
    const root = ReactDOM.createRoot(document.getElementById('root'));
    const element = <Welcome name="현동" />;
    root.render(element);
    // 이와 같이 사용자 컴포넌트의 이름은 대문자로 짓고 참조할 때도 대문자로 하는 것이 일반적이다.
    ```

- 리액트의 컴포넌트는 어떤 입력을 받으면 그에 맞는 형태의 출력을 제공한다.

  - js의 함수와 비슷하다.

  - 입력 : props(속성)
    - Property의 약자

    - 생성될 각 Component들의 속성

    - 컴포넌트에 전달할 다양한 정보들을 담고있는 js객체

      ```jsx
      const element = <Welcome name="현동" />;
      /*
      Welcome 컴포넌트의 props는 아래와 같은 구조를 가지는 자바스크립트 객체이다.
      {name = "현동"}
      */
      ```

  - 출력 : React element(엘리먼트)
    - 리액트 앱을 구성하는 가장 작은 블록
    - 자바스트립트 객체 형태로 존재
    - 화면에 보이는 것을 기술

- 컴포넌트 구성 시 어느 정도까지 구성해야 한다는 것에 대해 명확한 기준은 없다.

  1. 기능 단위로 구성하는 것이 좋다.
  2. 다른 프로젝트 등에서도 재사용 가능한 구조를 가져가는 것이 좋다.
     - 분리하여 기능이 단순해질수록 재사용 가능한 코드들이 늘어남

<br>

## Props

<br>

- 읽기 전용

  == 값을 변경할 수 없음
  
  - 함수 컴포넌트나 클래스 컴포넌트 모두 컴포넌트의 자체 props를 수정해서는 안된다.
  
  - 즉, 모든 리액트 컴포넌트는 자신의 프롭스를 다룰 때 반드시 순수 함수처럼 동작해야 한다.
  
    ```jsx
    // 순수 함수인 경우
    function sum(a, b) {
      return a + b;
    }
    // 입력값을 바꾸려 하지 않고 항상 동일한 입력값에 대해 동일한 결과를 반환한다.
    ```
  
    ```jsx
    // 순수 함수가 아닌 경우
    function withdraw(account, amount) {
      account.total -= amount;
    }
    // 자신의 입력값을 (자신이)변경하고 있다.
    ```