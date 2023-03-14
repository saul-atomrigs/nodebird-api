const express = require('express');
const jwt = require('jsonwebtoken');

// apiLimiter 미들웨어를 추가한다:
const { verifyToken, apiLimiter } = require('./middlewares');
const { Domain, User, Post, Hashtag } = require('../models');

const router = express.Router();

// POST /v2/token 라우터. 클라이언트가 발급받은 clientSecret으로 토큰을 발급받는 라우터이다:
// router.post('/token', apiLimiter, createToken)
router.post('/token', apiLimiter, async (req, res) => {
  const { clientSecret } = req.body;
  try {
    const domain = await Domain.findOne({
      where: { clientSecret },
      include: {
        model: User,
        attribute: ['nick', 'id'],
      },
    });
    if (!domain) {
      return res.status(401).json({
        code: 401,
        message: '등록되지 않은 도메인입니다. 먼저 도메인을 등록하세요',
      });
    }
    const token = jwt.sign({
      id: domain.User.id,
      nick: domain.User.nick,
    }, process.env.JWT_SECRET, {
      expiresIn: '30m', // 토큰 유효기간을 30분으로 제한
      issuer: 'nodebird',
    });
    return res.json({
      code: 200,
      message: '토큰이 발급되었습니다',
      token,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      message: '서버 에러',
    });
  }
});

// router.get('/test', verifyToken, apiLimiter, TokenTest)
router.get('/test', verifyToken, apiLimiter, (req, res) => {
  res.json(req.decoded);
});

// GET /v2/posts/my 라우터. 내가 올린 포스트를 가져오는 라우터이다:
// router.get('/posts/my', verifyToken, apiLimiter, getMyPosts)
router.get('/posts/my', apiLimiter, verifyToken, (req, res) => {
  Post.findAll({ where: { userId: req.decoded.id } })
    .then((posts) => {
      console.log(posts);
      res.json({
        code: 200,
        payload: posts,
      });
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({
        code: 500,
        message: '서버 에러',
      });
    });
});

// GET /v2/posts/hashtag/:title 라우터. 해시태그로 검색한 포스트를 가져오는 라우터이다:
// router.get('/posts/hashtag/:title', verifyToken, apiLimiter, getHashtagPosts)
router.get('/posts/hashtag/:title', verifyToken, apiLimiter, async (req, res) => {
  try {
    const hashtag = await Hashtag.findOne({ where: { title: req.params.title } });
    if (!hashtag) {
      return res.status(404).json({
        code: 404,
        message: '검색 결과가 없습니다',
      });
    }
    const posts = await hashtag.getPosts();
    return res.json({
      code: 200,
      payload: posts,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      message: '서버 에러',
    });
  }
});

module.exports = router;