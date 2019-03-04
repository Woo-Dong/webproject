var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
// var sassMiddleware = require('node-sass-middleware');
var session = require('express-session');
var methodOverride = require('method-override');
var flash = require('connect-flash');
var mongoose   = require('mongoose');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var adminRouter = require('./routes/admin');
var brandRouter = require('./routes/brand');
var cosmeticsRouter = require('./routes/cosmetics');
var salelistsRouter = require('./routes/salelists');
var passportSocketIo = require('passport.socketio');
var passport = require('passport');
var passportConfig = require('./lib/passport-config');

module.exports = (app, io) => {

  mongoose.Promise = global.Promise;
  const connStr = 'mongodb://user:user123@ds115350.mlab.com:15350/heeburndeuk';
  // const connStr = 'mongodb://localhost/mydb1';
  mongoose.connect(connStr, {useMongoClient: true });
  mongoose.connection.on('error', console.error);
 
  // view engine setup
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'pug');
  if (app.get('env') === 'development') {
    app.locals.pretty = true;
  }

  // Pug의 local에 moment라이브러리와 querystring 라이브러리를 사용할 수 있도록.
  app.locals.moment = require('moment');
  app.locals.querystring = require('querystring');

  // favicon - 웹사이트 아이콘
  app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
  app.use(logger('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));

  app.use(cookieParser());

  // _method를 통해서 method를 변경할 수 있도록 함. PUT이나 DELETE를 사용할 수 있도록.
  app.use(methodOverride('_method', {methods: ['POST', 'GET']}));


  // app.use(sassMiddleware({
  //   src: path.join(__dirname, 'public'),
  //   dest: path.join(__dirname, 'public'),
  //   indentedSyntax: true, // true = .sass and false = .scss
  //   sourceMap: true
  // }));

  // session을 사용할 수 있도록.
  const sessionStore = new session.MemoryStore();
  const sessionId = 'heeburndeuk.sid';
  const sessionSecret =  'I like U';

  app.use(session({
    name: sessionId,
    resave: true,
    saveUninitialized: true,
    store: sessionStore,
    secret: sessionSecret
  }));

  app.use(flash()); 

  app.use(express.static(path.join(__dirname, 'public')));

  //=======================================================
  // Passport 초기화
  //=======================================================
  app.use(passport.initialize());
  app.use(passport.session());
  passportConfig(passport);

  // pug의 local에 현재 사용자 정보와 flash 메시지를 전달하자.
  app.use(function(req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.flashMessages = req.flash();
    next();
  });


  io.use(passportSocketIo.authorize({
    cookieParser: cookieParser,       // the same middleware you registrer in express
    key:          sessionId,       // the name of the cookie where express/connect stores its session_id
    secret:       sessionSecret,    // the session_secret to parse the cookie
    store:        sessionStore,        // we NEED to use a sessionstore. no memorystore please
    passport:     passport,
    success:      (data, accept) => {
      console.log('successful connection to socket.io');
      accept(null, true);
    }, 
    fail:         (data, message, error, accept) => {
      // 실패 혹은 로그인 안된 경우
      console.log('failed connection to socket.io:', message);
      accept(null, false);
    }
  }));

  io.on('connection', socket => {
    console.log('socket connection!');
    if (socket.request.user.logged_in) {
      // 로그인이 된 경우에만 join 요청을 받는다.
      socket.emit('welcome');
      socket.on('join', data => {
        // 본인의 ID에 해당하는 채널에 가입시킨다. -> ._id 이름으로 로그인
        socket.join(socket.request.user._id.toString());
      });
      var user = socket.request.user;
      socket.emit('alarm', {user:user});
    }
  });

  
  app.use('/', indexRouter(io));
  app.use('/users', usersRouter(io));
  app.use('/admin', adminRouter(io));
  app.use('/cosmetics', cosmeticsRouter);
  app.use('/brand', brandRouter);
  app.use('/salelists', salelistsRouter);
  require('./routes/auth')(app, passport);
  app.use('/api', require('./routes/api'));

  // catch 404 and forward to error handler
  app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  });

  app.use(function(err, req, res, next) {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
  });

  return app;
}