// 탐색 범위 설정값 변동 표시 스크립트
const expRangeBar = document.querySelector("#exploringRangeBar");
const expRangeIndicator = document.querySelector("#expRangeIndicator");
expRangeIndicator.innerText = expRangeBar.value;
// input event가 일어나면 내부 text를 바꿈
expRangeBar.addEventListener("input", (event) => {
  expRangeIndicator.innerText = event.currentTarget.value;
});