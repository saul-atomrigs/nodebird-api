const request = require("supertest");
const { sequelize } = require("../models");
const app = require("../app");

// 모든 테스트를 실행하기 전에 수행해야 할 코드(테스트를 위한 값이나 외부 환경 설정할 때 사용):
beforeAll(async () => {
  // DB에 테이블 생성:
  await sequelize.sync();
});

describe("POST /join", () => {
  test("로그인 안 했으면 가입", (done) => {
    // supertest 패키지로부터 request함수를 불러와 app객체를 넣어준다:
    request(app)
      .post("/auth/join")
      // send()로 데이터를 보낸다:
      .send({
        email: "zerohch0@gmail.com",
        nick: "zerocho",
        password: "nodejsbook",
      })
      // expect()로 응답을 검증한다:
      .expect("Location", "/") // Location 헤더가 /로 보내졌는지 검증
      .expect(302, done); // 302 응답 상태코드가 보내졌는지 검증. done을 넣어줘야 비동기 테스트(request는 비동기 함수이다)가 끝났을 때 테스트가 종료된다.
  });
});

describe("POST /login", () => {
  const agent = request.agent(app);
  beforeEach((done) => {
    agent
      .post("/auth/login")
      .send({
        email: "zerohch0@gmail.com",
        password: "nodejsbook",
      })
      .end(done);
  });

  test("이미 로그인했으면 redirect /", (done) => {
    const message = encodeURIComponent("로그인한 상태입니다.");
    agent
      .post("/auth/join")
      .send({
        email: "zerohch0@gmail.com",
        nick: "zerocho",
        password: "nodejsbook",
      })
      .expect("Location", `/?error=${message}`)
      .expect(302, done);
  });
});

describe("POST /login", () => {
  test("가입되지 않은 회원", (done) => {
    const message = encodeURIComponent("가입되지 않은 회원입니다.");
    request(app)
      .post("/auth/login")
      .send({
        email: "zerohch1@gmail.com",
        password: "nodejsbook",
      })
      .expect("Location", `/?loginError=${message}`)
      .expect(302, done);
  });

  test("로그인 수행", (done) => {
    request(app)
      .post("/auth/login")
      .send({
        email: "zerohch0@gmail.com",
        password: "nodejsbook",
      })
      .expect("Location", "/")
      .expect(302, done);
  });

  test("비밀번호 틀림", (done) => {
    const message = encodeURIComponent("비밀번호가 일치하지 않습니다.");
    request(app)
      .post("/auth/login")
      .send({
        email: "zerohch0@gmail.com",
        password: "wrong",
      })
      .expect("Location", `/?loginError=${message}`)
      .expect(302, done);
  });
});

describe("GET /logout", () => {
  test("로그인 되어있지 않으면 403", (done) => {
    request(app).get("/auth/logout").expect(403, done);
  });

  const agent = request.agent(app);
  beforeEach((done) => {
    agent
      .post("/auth/login")
      .send({
        email: "zerohch0@gmail.com",
        password: "nodejsbook",
      })
      .end(done);
  });

  test("로그아웃 수행", (done) => {
    agent.get("/auth/logout").expect("Location", `/`).expect(302, done);
  });
});

afterAll(async () => {
  await sequelize.sync({ force: true });
});
