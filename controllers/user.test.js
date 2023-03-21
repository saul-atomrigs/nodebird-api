jest.mock("../models/user"); // 모킹할 모듈을 먼저 불러온다.
const User = require("../models/user");
const { follow } = require("./user");

describe("follow", () => {
  const req = {
    user: { id: 1 },
    params: { id: 2 },
  };

  const res = {
    status: jest.fn(() => res),
    send: jest.fn(),
  };

  const next = jest.fn();

  test("사용자를 찾아 팔로잉을 추가하고 success를 응답해야 함", async () => {
    User.findOne.mockReturnValue({
      // {addFolloing()} 객체를 반환하도록 모킹
      addFollowing(id) {
        return Promise.resolve(true);
      },
    });
    await follow(req, res, next); // follow 함수는 async 함수이므로 await를 붙여야 함수가 전부 실행 완료된 후 expect함수가 실행된다.
    expect(res.send).toBeCalledWith("success");
  });

  test("사용자를 못 찾으면 res.status(404).send(no user)를 호출해야 함", async () => {
    User.findOne.mockReturnValue(null); // findOne 함수가 null을 반환하도록 모킹 (사용자를 찾지 못하는 경우)
    await follow(req, res, next);
    expect(res.status).toBeCalledWith(404);
    expect(res.send).toBeCalledWith("no user");
  });

  test("DB에서 에러가 발생하면 next(error)를 호출해야 함", async () => {
    const error = "테스트용 에러";
    User.findOne.mockReturnValue(Promise.reject(error)); // Promise.reject를 반환하도록 모킹 (DB 에러)
    await follow(req, res, next);
    expect(next).toBeCalledWith(error);
  });
});
