export const mockBackendService = {
    setup: (mock) => {
        // 모의 응답 설정
        mock.onGet('/api/all-comments').reply(200, { data: 'mocked data' });
    },
};
