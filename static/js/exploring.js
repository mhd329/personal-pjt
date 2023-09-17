// 간단히 탐색하기 버튼 클릭시 작동 로직
const simpleExploringButton = document.querySelector("#simpleExploringButton");
simpleExploringButton.addEventListener("click", (event) => {
  event.preventDefault();
  axios({
    method: "GET",
    url: `/basic-explore/`
  }).then({

  });
});

// 검색 form 비동기 전송
const expForm = document.querySelector("#exploringForm");
expForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const expRange = Number(expRangeIndicator.innerText);
  axios({
    method: "GET",
    url: `/wide-explore/${expRange}/`,
  }).then({

  })
});