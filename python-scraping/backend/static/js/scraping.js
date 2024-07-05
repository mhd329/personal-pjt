// 간단히 탐색하기 버튼 클릭시 작동 로직
const scrapingStartButton = document.querySelector("#scrapingStartButton");
scrapingStartButton.addEventListener("click", (event) => {
  event.preventDefault();
  fetch(`/run-scraping/`, {
    method: "GET",
  }).then((response) => {
    // Promise는 결과값은 아니지만, 그렇게 취급할 수 있다.
    // Promise 메서드의 콜백에서 리턴된 값은 다음에 실행될 체인에서 콜백의 인자값이 된다.
    // 이 콜백의 실행결과에 따라 Promise는 둘 중 하나의 상태로 귀결된다.
    console.log(response.json());
    // response.json()을 두번 쓰게 되면 body가 이미 읽혔다는 에러가 발생한다.
    // console.log(response.json());
    // 그 때는 response.clone()을 사용해야 한다.
  }).catch((error) => {
    console.log(error);
  });
});
