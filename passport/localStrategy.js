const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");

const User = require("../models/user");

module.exports = () => {
  passport.use(
    new LocalStrategy(
      // 전략에 관한 설정을 한다:
      {
        usernameField: "email",
        passwordField: "password",
      },
      // 실제 전략을 수행하는 함수를 작성한다. (done은 passport.authenticate의 콜백함수이다)
      async (email, password, done) => {
        try {
          // 사용자 DB에서 이메일을 찾는다:
          const exUser = await User.findOne({ where: { email } });
          if (exUser) {
            // 비밀번호를 비교한다:
            const result = await bcrypt.compare(password, exUser.password);
            // 로그인 성공 시 (비밀번호 일치 시):
            if (result) {
              done(null, exUser);
            } else {
              // 로그인 실패 시 (비밀번호 불일치 시):
              done(null, false, { message: "비밀번호가 일치하지 않습니다." });
            }
          } else {
            // 로그인 실패 시 (가입되지 않은 회원일 시):
            done(null, false, { message: "가입되지 않은 회원입니다." });
          }
        } catch (error) {
          // 서버 에러 시:
          console.error(error);
          done(error);
        }
      }
    )
  );
};
