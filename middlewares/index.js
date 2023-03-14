const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const cors = require('cors')
const {Domain} = require('../models')

exports.verifyToken = (req, res, next) => {
    try {
        // 인증에 성공한 경우:
        res.locals.decoded = jwt.verify(req.headers.authorization, process.env.JWT_SECRET);
        return next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') { // 유효기간 초과
            return res.status(419).json({
                code: 419,
                message: '토큰이 만료되었습니다',
            });
    }
    return res.status(401).json({
        code: 401,
        message: '유효하지 않은 토큰입니다.'
    })
    }
}

// 라우터에 사용량 제한을 설정하는 미들웨어:
exports.apiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1분
    max: 1,
    handler(req, res) {
        res.status(this.statusCode).json({
            code: this.statusCode, // 기본값 429
            message: '1분에 한 번만 요청할 수 있습니다',
        });
    }
})

// 사용하면 안 되는 라우터에 붙이는 미들웨어:
exports.deprecated = (req, res) => {
    res.status(410).json({
        code: 410,
        message: '새로운 버전이 나왔습니다. 새로운 버전을 사용하세요',
    });
}


exports.corsWhenDomainMatches = async (req, res, next) => {
    // 도메인 모델로 클라이언트의 도메인 (req.get('origin'))과 호스트가 일치하는 것이 있는지 검사한다:
    const domain = await Domain.findOne({
        where: {host: req.get('origin')},
    });
    // 일치하는 것이 있다면:
    if (domain) {
        // CORS를 허용해서 다음 미들웨어로 보내고
        cors({origin: req.get('origin'), credentials: true})(req, res, next);
    // 일치하는 것이 없다면 CORS없이 next를 호출한다:
    } else {
        next();
    }
}