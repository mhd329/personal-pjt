# State

<br>

- 자바스크립트 객체로 존재함

- 리액트 컴포넌트의 상태를 의미한다.

  == 리액트 컴포넌트의 (변경 가능한)데이터를 의미한다.

  - state를 통해 렌더링에 필요한 데이터들을 관리하게 된다.
  - state는 개발자가 정의한다.
    - state는 클래스의 경우 생성자에서 정의된다.
    - 함수의 경우 useState라는 hook에서 정의된다.
  - 렌더링이나 데이터의 흐름에 관련된 값만 state에 포함시켜야 한다.
    - 불필요하게 state가 변경될 경우 컴포넌트가 다시 렌더링되기 때문에 성능이 저하될 수 있다.
      - state는 직접 수정할 수 없다.
      - setState 함수를 통해 수정되어야 한다.
        - 직접 수정할 수는 있지만 원칙적으로 금지된다.

<br>

# Lifecycle

<br>

- 컴포넌트는 생성되고 업데이트되고 제거되는 세 번의 변화를 겪는다.

- 컴포넌트의 생성, 업데이트, 제거 시점은 정해져있다.

- 출생, 인생, 사망의 세 단계로 구성되어 있다.

  - Mounting(출생 과정)

    1. constructor
       - 생성자가 실행되며 component의 state가 정의된다.

    2. render
       - 컴포넌트가 렌더링된다.

    3. componentDidMount()

  - Updating(인생 과정)

    1. render

       - New props
         - 컴포넌트의 props 변경

       - setState()
  
         - state의 변경에 쓰이는 함수이다.
  
         ```jsx
         this.setState({
             state key : 변경할 state value
         });
         ```
  
       - forceUpdate()
  
         - 강제 업데이트
  
         - 컴포넌트가 다시 렌더링됨
  
    2. componentDidUpdate()
  
  - Unmounting(사망 과정)
  
    1. componentWillUnmount()
       - 상위 component에서 현재 component를 더이상 화면에 표시하지 않게 될때 unmount 된다.
