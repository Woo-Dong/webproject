var express = require('express');
  User = require('../models/user');
var router = express.Router();

function needAuth(req, res, next) {
    if (req.session.user) {
      next();
    } else {
      req.flash('danger', '다시 로그인해 주세요.');
      res.redirect('/signin');
    }
}

function validateForm(form, options) {
  var name = form.name || "";
  var email = form.email || "";
  name = name.trim();
  email = email.trim();

  if (!name) {
    return 'Name is required.';
  }

  if (!email) {
    return 'Email is required.';
  }

  if (!form.password && options.needPassword) {
    return 'Password is required.';
  }

  if (form.password !== form.passwordconf) {
    return 'Passsword do not match.';
  }

  if (form.password.length < 6) {
    return 'Password must be at least 6 characters.';
  }

  return null;
}

/* GET users listing. */
router.get('/', needAuth, (req, res, next) => {
  User.find({}, function(err, users) {
    if (err) {
      return next(err);
    }
    res.render('users/index', {users: users});
  });
});

router.get('/new', (req, res, next) => {
  res.render('users/signup', {messages: req.flash()});
});

router.get('/:id/edit', needAuth, (req, res, next) => {
  User.findById(req.params.id, function(err, user) {
    if (err) {
      return next(err);
    }
    res.render('users/edit', {user: user});
  });
});

router.put('/:id', needAuth, (req, res, next) => {
  // var err = validateForm(req.body);
  // if (err) {
  //   req.flash('danger', err);
  //   return res.redirect('back');
  // }

  User.findById({_id: req.params.id}, function(err, user) {
    if (err) {
      return next(err);
    }
    if (!user) {
      req.flash('danger', '해당하는 회원이 존재하지 않습니다..');
      return res.redirect('back');
    }
    if(req.body.password){
      if (user.password !== req.body.current_password) {
        req.flash('danger', '비밀번호가 다릅니다.');
        return res.redirect('back');
      }
      user.password = req.body.password;
    }

    user.name = req.body.name;
    user.email = req.body.email;
    user.isAdmin = req.body.isAdmin;

    user.save(function(err) {
      if (err) {
        return next(err);
      }
      req.flash('success', '성공적으로 회원정보가 수정되었습니다.');
      res.redirect('back');
    });
  });
});

router.delete('/:id', needAuth, (req, res, next) => {
  User.findOneAndRemove({_id: req.params.id}, function(err) {
    if (err) {
      return next(err);
    }
    req.flash('success', '성공적으로 회원탈퇴 하였습니다.');
    res.redirect('/');
  });
});

router.get('/:id', (req, res, next) => {
  User.findById(req.params.id, function(err, user) {
    if (err) {
      return next(err);
    }
    res.render('users/show', {user: user});
  });
});


router.post('/', (req, res, next) => {
  var err = validateForm(req.body, {needPassword: true});
  if (err) {
    req.flash('danger', err);
    return res.redirect('back');
  }
  User.findOne({email: req.body.email}, function(err, user) {
    if (err) {
      return next(err);
    }
    if (user) {
      req.flash('danger', 'Email address already exists.');
      return res.redirect('back');
    }
    var newUser = new User({
      name: req.body.name,
      email: req.body.email,
    });
    newUser.password = req.body.password;

    newUser.save(function(err) {
      if (err) {
        return next(err);
      } else {
        req.flash('success', 'Registered successfully. Please sign in.');
        res.redirect('/signin');
      }
    });
  });
});

module.exports = router;