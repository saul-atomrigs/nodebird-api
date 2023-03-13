const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { User, Domain } = require('../models');
const { isLoggedIn } = require('./middlewares');

const router = express.Router();

// GET / 라우터는 접속 시 로그인 화면을 보여준다:
router.get('/', async (req, res, next) => {
  try {
    const user = await User.findOne({
      // undefined가 들어가면 안되므로 || null을 넣어준다:
      where: { id: req.user && req.user.id || null },
      include: { model: Domain },
    });
    res.render('login', {
      user,
      domains: user && user.Domains,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// 도메인 등록 라우터 (POST /domain) 은 form으로부터 도메인을 받아서 model에 등록한다 (CORS 예방):
router.post('/domain', isLoggedIn, async (req, res, next) => {
  try {
    await Domain.create({
      UserId: req.user.id,
      host: req.body.host,
      type: req.body.type,
      clientSecret: uuidv4(),
    });
    res.redirect('/');
  } catch (err) {
    console.error(err);
    next(err);
  }
});

module.exports = router;