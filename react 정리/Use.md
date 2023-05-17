# useMemo, useCallback, useRef

<br>

## useMemo

<br>

```jsx
const memoizedValue = useMemo(
	() => {
        // 연산량이 높은 작업을 수행하여 결과를 반환
        return computeExpensiveValue(의존성 변수1, 의존성 변수2);
    },
    [의존성 변수1, 의존성 변수2]
)
```

- 메모이제이션 기법으로 특정 결과값을 저장해두기 위한 함수

- 최적화를 위해 사용된다.

  - 배열 내부의 값이 변하면 새로 create함수를 호출하여 결과값을 반환한다.

  - 변하지 않으면 의존성 배열 내부의 변수값을 저장했다가 그대로 반환한다.

  - 컴포넌트가 렌더링될 때마다 연산량이 높은 작업이 반복수행 되는 것을 피할 수 있다.

    == 렌더링 속도가 빨라진다.

- **useMemo로 전달된 함수는 렌더링이 일어나는 동안에만 실행된다.**

  - 즉, 렌더링이 일어나는 동안 실행되면 안되는(Side effect) 함수는 전달되면 안된다.

- 의존성 배열이 없는 경우 매 렌더링마다 함수가 실행되기 때문에 사용하는 의미가 없다.

- 의존성 배열이 비어 있는 경우 컴포넌트 마운트 시에만 호출된다.

  - 일반적으로는 배열을 넣고사용한다.

<br>

## useCallback

<br>

```jsx
const memoizedCallback = useCallback(
	() => {
        doSomething(의존성 변수1, 의존성 변수2);
    },
    [의존성 변수1, 의존성 변수2]
)
```
- useMemo와 비슷하다.
- 값이 아닌 함수를 반환한다.
  - 의존성 배열의 값이 바뀐 경우에만 함수를 새로 정의해서 반환한다.
- useCallback을 사용하지 않고 어떤 컴포넌트 내에 함수를 정의하게 되면 매번 컴포넌트의 렌더링이 일어날 때 마다 함수도 새로 정의된다.
  - useCallback을 사용하여 불필요한 반복 작업을 줄일 수 있다.

---

아래 두 줄의 코드는 동일한 역할을 한다.

```jsx
useCallback(함수, 의존성 배열);
useMemo(() => 함수, 의존성 배열);
```

---

- useCallback의 사용례

  ```jsx
  import { useState, useCallback } from "react";
  
  function ParentComponent(props) {
      const [count, setCount] = useState(0);
      
      // 아래와 같이 작성하게 되면 렌더링 될 때마다 함수가 새로 정의된다.
      /*
      const handleClick = (event) => {
      	// do something
      	...
      };
      */
      // 따라서 아래와 같이 컴포넌트가 마운트 될 때만 함수가 정의되게끔 작성해야 한다.
      const handleClick = useCallback((event) => {
          // do something
          ...
      }, []);
      
      return (
          <div>
          	<button onClick = {() => {
                      setCount(count + 1);
                  }}
                  >
                  {count}
              </button>
              
              <ChildComponent handleClick={handleClick} />
          </div>
      );
  }
  ```

<br>

## useRef

<br>

```jsx
const refContainer = useRef(초깃값);
```

- 파라메터로 초깃값을 넣으면 해당 값(Element)을 참조하는 Reference 객체를 반환한다.

- Reference를 사용하기 위한 Hook

  - Reference는 특정 컴포넌트에 접근할 수 있는 객체를 의미한다.
  - 참조 객체에는 current라는 속성이 있다.
    - refObject.current
    - current는 현재 참조하고 있는 Element를 의미한다.
      - 초깃값에 null을 넣으면 아무것도 참조하지 않는 상태로 초기화한다는 의미이다.

- useRef의 사용례

  ```jsx
  import { useRef } from "react";
  
  function TextInputWithFocusButton(props) {
      const inputElem = useRef(null);
      const onButtonClick = () => {
          // current는 마운트된 input element를 가리킴
          inputElem.current.focus();
      };
      
      return (
      	<div>
              // ref 속성은 DOM을 선택해 직접 접근할 때 사용되는 속성이다.
          	<input ref={inputElem} type="text" />
              <button onClick={onButtonClick}>
              	Focus the input
              </button>
          </div>
      );
  }
  ```

- 반환된 ref객체는 컴포넌트가 unmount되기 전까지 계속 유지된다.

  - 렌더링 될 때마다 매번 같은 ref객체를 반환한다.

  - 내부 데이터가 변경되었을 때 별도로 알려주지 않는다.

    == current 속성이 변경되어도 다시 렌더링 되지 않는다.

    - ref의 current에 어떤 DOM노드가 연결되거나 분리되는 것을 알고 싶을때 Callback ref 방식을 사용할 수 있다.

    - Callback ref 방식을 사용하면 연결, 분리의 순간에 특정 동작을 하게끔 코드를 포함시킬 수도 있다.

      ```jsx
      function MeasureExample(props) {
          const [height, setHeight] = useState(0);
          
          // 어떤 노드가 주어지고 노드가 null이 아닐 때 해당 노드의 높이값으로 height를 설정함
          const measuredRef = useCallback(node => {
              if (node !== null) {
                  setHeight(node.getBoundingClientRect().height);
              }
          }, []);
          // 빈 배열을 넣음으로써 h1 태그가 mount, unmount 될 때만 Callback 함수가 호출된다.
          // 재렌더링이 일어날 때에는 호출되지 않는다.
          
          return (
          	<div>
              	<h1 ref={measuredRef}>안녕하세요.</h1>
                  <h2>위 헤더의 높이는 {Math.round(height)}px 입니다.</h2>
              </div>
          );
      }
      ```

    - 위 코드에서는 참조를 위해서 useRef를 사용하지 않고 Callback ref 방식을 사용했다.

      - 자식 컴포넌트가 변경되었을 때 알림을 받을 수 있다.
      - 이를 통해 다른 정보들을 업데이트 할 수 있다.
    
    - **ref를 달고자 하는 요소에 ref라는 콜백 함수(measuredRef 내부의 화살표 함수)를 props로 전달(ref={measuredRef})해 주면 된다.**
    
      - 어떤 태그에 ref 속성을 주고 거기에 어떤 값을 할당하게 되면, 역으로 그 어떤 값에 자기 자신을(DOM element를) 할당하는 것임
        - measuredRef의 useCallback 안에 작성되어있는 화살표 함수는 node라는 파라메터를 전달 받고 그에 대한 처리를 한다.
        - measuredRef는 h1태그의 ref 속성에 할당되어있음
        - 따라서 measuredRef의 내부 화살표 함수는 h1태그를 참조하게 되고,
        - 화살표 함수의 node 파라메터는 h1 태그의 DOM element를 참조하게 된다.
      - 즉, ref 속성의 값에 특정 변수를 할당시키면 그 변수에는 현재 ref 속성이 포함중인 (h1 같은)DOM element가 값으로 설정된다.