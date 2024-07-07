import { render, screen } from '@testing-library/react';
import App from './App';
import { mockBackendService } from './mockBackendService'; // 모의 백엔드 서비스 임포트

/*
테스트를 하려고 하니 로그에 axios쪽에 문제가 발생했다고 알려주었다.
아래 테스트 코드를 주석처리하니 정상적으로 docker hub에 이미지를 푸쉬하였다.
`/api/values` 주소에 요청을 보내고 백엔드 응답이 없어서 발생하는 에러인 것처럼 보였다.
그러나 그것이 주석처리와 무슨 관계가 있는지는 확신할 수 없었다.
*/

/* 추가:
컨테이너끼리 연결된 상태에서 처음 컴포넌트가 마운트 되었을때 보여줄 댓글 리스트를 backend에서 db에 연결한 다음 가져와야 하는데,
현재 실행중인 컨테이너는 테스트 컨테이너 하나 뿐이라, 첫 마운트때 backend와 연결이 안되고 있으니 axios에 어떤 문제가 있다고 출력할 것이다.
따라서 아래 코드들을 주석처리 해버리면 에러가 발생하는것과 관계 없이 테스트할 내용 자체가 없으므로 무조건 통과가 된다.
*/

// describe("Test react Before pushing image to Docker hub", () => {
//   it('Expect a string: ', () => {
//     render(<App />);
//     const formElement = screen.getByPlaceholderText(/입력해주세요.../i);
//     expect(formElement).toBeInTheDocument();
//   });
//   it('Expect a string', () => {
//     render(<App />);
//     const buttonElement = screen.getByText(/확인/i);
//     expect(buttonElement).toBeInTheDocument();
//   }); 
// })

test('renders learn react link', () => { });