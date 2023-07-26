import { render, screen } from '@testing-library/react';
import App from './App';

test('renders learn react link', () => {
  render(<App />);
  const formElement = screen.getByText(/입력해주세요.../i);
  expect(formElement).toBeInTheDocument();
  const buttonElement = screen.getByText(/확인/i);
  expect(buttonElement).toBeInTheDocument();
});
