const { isLoggedIn, isNotLoggedIn } = require("./");

describe("isLoggedIn", () => {
  // res, req, next를 모킹한다(jest.fn()으로 감싼다)):
  const res = {
    status: jest.fn(() => res), // res.status는 res.status(403).send('hello') 처럼 메서드 체이닝이 가능해야 하므로 res를 반환하고 있다.
    send: jest.fn(),
  };
  const next = jest.fn();

  test("로그인되어 있으면 isLoggedIn이 next를 호출해야 함", () => {
    const req = {
      isAuthenticated: jest.fn(() => true), // isAuthenticated는 로그인 여부를 알려주는 함수이므로 boolean 값을 반환한다.
    };
    isLoggedIn(req, res, next); // isLoggedIn 미들웨어를 실행한다.
    expect(next).toBeCalledTimes(1); // next가 한 번 호출되었는지 확인한다.
  });

  test("로그인되어 있지 않으면 isLoggedIn이 에러를 응답해야 함", () => {});
});

describe("isNotLoggedIn", () => {
  const res = {
    redirect: jest.fn(),
  };
  const next = jest.fn();
  test("로그인되어 있으면 isNotLoggedIn이 에러를 응답해야 함", () => {
    const req = {
      isAuthenticated: jest.fn(() => true),
    };
    isNotLoggedIn(req, res, next);
    const message = encodeURIComponent("로그인한 상태입니다.");
    expect(res.redirect).toBeCalledWith(`/?error=${message}`);
  });

  test("로그인되어 있지 않으면 isNotLoggedIn이 next를 호출해야 함", () => {
    const req = {
      isAuthenticated: jest.fn(() => false),
    };
    isNotLoggedIn(req, res, next);
    expect(next).toBeCalledTimes(1);
  });
});
