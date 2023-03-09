const passport = require("passport");
const local = require("./localStrategy");
const kakao = require("./kakaoStrategy");
const User = require("../models/user");

module.exports = () => {
  // 사용자 정보 객체에서 아이디 (user.id) 만 추려 세션에 저장:
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // 세션에 저장한 아이디를 통해 사용자 정보 객체를 불러옴:
  passport.deserializeUser((id, done) => {
    User.findOne({
      where: { id },
      include: [
        {
          model: User,
          attributes: ["id", "nick"], // 실수로 비밀번호를 조회하는 것을 방지함 (브라우저에 비밀번호를 전송해서는 안됨)
          as: "Followers",
        },
        {
          model: User,
          attributes: ["id", "nick"], // 실수로 비밀번호를 조회하는 것을 방지함 (브라우저에 비밀번호를 전송해서는 안됨)
          as: "Followings",
        },
      ],
    })
      .then((user) => done(null, user))
      .catch((err) => done(err));
  });

  local();
  kakao();
};
