/** 처음 로그인 할 때는 회원가입처럼 처리하고,
 * 이미 회원가입한 사용자라면 로그인 처리를 한다.
 */

const passport = require("passport");
// passport-kakao 모듈로부터 Strategy생성자를 불러온다:
const KakaoStrategy = require("passport-kakao").Strategy;

const User = require("../models/user");

module.exports = () => {
  // 카카오 로그인에 대한 설정을 한다:
  passport.use(
    new KakaoStrategy(
      {
        clientID: process.env.KAKAO_ID, // 카카오에서 발급한 clientID (.env 파일에 저장)
        callbackURL: "/auth/kakao/callback", // 카카오로부터 인증 결과를 받을 라우터 주소
      },

      async (accessToken, refreshToken, profile, done) => {
        console.log("kakao profile", profile);
        try {
          // 기존에 카카오를 통해 회원 가입한 사용자가 있는지 조회한다:
          const exUser = await User.findOne({
            where: { snsId: profile.id, provider: "kakao" },
          });
          // 기존에 카카오를 통해 회원 가입한 사용자가 있다면 사용자 정보와 함께 done()함수를 호출하고 전략을 종료한다:
          if (exUser) {
            done(null, exUser);
          } else {
            // 기존에 카카오를 통해 회원 가입한 사용자가 없다면 회원 가입을 진행한다. (profile 객체에서 필요한 정보를 꺼내서 사용한다):
            const newUser = await User.create({
              email: profile._json && profile._json.kakao_account_email,
              nick: profile.displayName,
              snsId: profile.id,
              provider: "kakao",
            });
            // 사용자 생성 후 done() 함수를 호출하고 전략을 종료한다:
            done(null, newUser);
          }
        } catch (error) {
          console.error(error);
          done(error);
        }
      }
    )
  );
};
