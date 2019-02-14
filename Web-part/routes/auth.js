module.exports = (app, passport) => {
    app.get('/signin', (req, res, next) => {
        res.render('signin');
    });

    app.post('/signin', passport.authenticate('local-signin', {
        successRedirect : '/', // redirect to the secure profile section
        failureRedirect : '/signin', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    

    app.get('/auth/google',
        passport.authenticate('google', { scope: ['profile']})
    );

    app.get('/auth/google/callback',
        passport.authenticate('google', {
        failureRedirect : '/signin',
        failureFlash : true // allow flash messages
        }), (req, res, next) => {
        req.flash('success', 'Welcome!');
        res.redirect('/');
        }
    );

    app.get('/auth/naver',
        passport.authenticate('naver')
    );

    app.get('/auth/naver/callback',
        passport.authenticate('naver', {
        failureRedirect : '/signin',
        failureFlash : true // allow flash messages
        }), (req, res, next) => {
        req.flash('success', 'Welcome!');
        res.redirect('/');
        }
    );

    app.get('/auth/kakao',
        passport.authenticate('kakao')
    );

    app.get('/auth/kakao/callback',
        passport.authenticate('kakao', {
        failureRedirect : '/signin',
        failureFlash : true // allow flash messages
        }), (req, res, next) => {
        req.flash('success', 'Welcome!');
        res.redirect('/');
        }
    );
 
    app.get('/signout', (req, res) => {
        req.logout();
        req.flash('success', '성공적으로 로그아웃 되었습니다.');
        res.redirect('/');
    });

    // app.get('/auth/facebook',
    //     passport.authenticate('facebook',{ scope: ['profile']})
    // );
    // app.get('/auth/facebook/callback',
    //     passport.authenticate('facebook', {
    //     failureRedirect : '/signin',
    //     failureFlash : true // allow flash messages
    //     }), (req, res, next) => {
    //     req.flash('success', 'Welcome!');
    //     res.redirect('/');
    //     }
    // );
};
  