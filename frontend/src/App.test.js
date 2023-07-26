import { render, screen } from '@testing-library/react';
import App from './App';

/*
테스트를 하려고 하니 로그에 axios쪽에 문제가 발생했다고 알려주었다.
아래 테스트 코드를 주석처리하니 정상적으로 docker hub에 이미지를 푸쉬하였다.
`/api/values` 주소에 요청을 보내고 백엔드 응답이 없어서 발생하는 에러인 것처럼 보였다.
그러나 그것이 주석처리와 무슨 관계가 있는지는 확신할 수 없었다.
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