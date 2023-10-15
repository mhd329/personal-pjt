// 간단히 탐색하기 버튼 클릭시 작동 로직
const simpleExploringButton = document.querySelector("#simpleExploringButton");
simpleExploringButton.addEventListener("click", (event) => {
  event.preventDefault();
  fetch(`/basic-explore/`, {
    method: "GET",
  }).then((response) => {
    console.log(response.json());
  }).catch((error) => {
    console.log(error);
  });
});

// 검색 form 비동기 전송
const expForm = document.querySelector("#exploringForm");
expForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const expRange = Number(expRangeIndicator.innerText);
  fetch(`/wide-explore/${expRange}/`, {
    method: "GET",
  }).then((response) => {
    // Promise는 결과값은 아니지만, 그렇게 취급할 수 있다.
    // Promise 메서드의 콜백에서 리턴된 값은 다음에 실행될 체인에서 콜백의 인자값이 된다.
    // 이 콜백의 실행결과에 따라 Promise는 둘 중 하나의 상태로 귀결된다.
    console.log(response);
    // response.json()을 두번 쓰게 되면 body가 이미 읽혔다는 에러가 발생한다.
    // console.log(response.json());
    // 그 때는 response.clone()을 사용해야 한다.
    console.log(response.clone().json());
    return response.json();
  }).then((obj) => {
    // Promise fulfulled: 비동기 처리 성공
    console.log(Object.keys(obj));
    console.log(Object.keys(obj).length);
  }).catch((error) => {
    // Promise rejected: 비동기 처리 실패
    console.log(error);
  });
});