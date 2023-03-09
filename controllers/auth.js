const bcrypt = require("bcrypt");
const passport = require("passport");
const User = require("../models/user");

// 회원가입 컨트롤러:
exports.join = async (req, res, next) => {
  const { email, nick, password } = req.body;
  try {
    // 기존에 가입된 이메일인지 확인:
    const exUser = await User.findOne({ where: { email } });
    if (exUser) {
      return res.redirect("/join?error=exist");
    }
    // 비밀번호 저장할 때는 암호화:
    const hash = await bcrypt.hash(password, 12);
    await User.create({
      email,
      nick,
      passport: hash,
    });
    return res.redirect("/");
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

// 로그인 컨트롤러:
exports.login = (req, res, next) => {
  // 로그인 요청이 들어오면 passport.authenticate("local") 미들웨어가 로그인 전략을 수행한다:
  passport.authenticate("local", (authError, user, info) => {
    // 로그인 실패 시:
    if (authError) {
      console.error(authError);
      return next(authError);
    }
    // 로그인 실패 시2:
    if (!user) {
      return res.redirect("/?loginError=${info.message}");
    }
    // 로그인 성공 시: (2번째 인수인 user가 존재):
    // req.login() 메서드는 passport.serializeUser()를 호출한다. 그리고 req.login에 제공하는 user 객체가 serializeUser로 넘어가게 된다.
    // 또한 이때 connect.sid 세션 쿠키가 브라우저로 전송된다.
    return req.login(user, (loginError) => {
      if (loginError) {
        console.error(loginError);
        return next(loginError);
      }
      return res.redirect("/");
    });
  })(req, res, next); // 미들웨어 내의 미들웨어에는 (req, res, next)를 붙인다.
};

// 로그아웃 컨트롤러:
exports.logout = (req, res) => {
  // req.logout() 메서드는 req.user 객체와 req.session 객체를 제거
  req.logout(() => {
    // 콜백 함수에서는 메인 페이지로 되돌아간다.
    res.redirect("/");
  });
};
