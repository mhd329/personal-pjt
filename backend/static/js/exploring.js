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
    console.log(response.json());
  }).catch((error) => {
    console.log(error);
  });
});