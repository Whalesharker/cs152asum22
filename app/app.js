var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const layouts = require("express-ejs-layouts");
const axios = require('axios')

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(layouts)
app.use('/', indexRouter);
app.use('/users', usersRouter);

app.get('/simpleform',
  (req,res,next) => {
    res.render('simpleform')
  })

  app.post("/simpleform", (req, res, next) => {
    // res.json(req.body);
    const { username, age, height } = req.body;
    res.locals.username = username;
    res.locals.age = age;
    res.locals.ageInDays = age * 365;
    res.locals.height = height;
    res.locals.heightCm = height * 2.54;
    res.locals.version = "1.0.0";
    res.render("simpleformresult");
  });

  app.get('/bmi',
    (req, res, next) => {
      res.render('bmi')
    }
  )

app.post('/bmi',
  (req,res,next) => {
    const {username, weight, height} = req.body;
    res.locals.username = username;
    res.locals.height = height;
    res.locals.weight = weight;
    res.locals.BMI = weight/(height*height)*703;
    res.locals.version = '1.0.0';
    res.render('bmiresults');
  }
)


app.get('/showFamily',
  (req,res,next) => {
    res.locals.family = family;
    res.render('showFamily');
  })

app.get('/apidemo/:email',
  async (req,res,next) => {
    const email = req.params.email;
    const response = await axios.get('https://www.cs.brandeis.edu/~tim/cs103aSpr22/courses20-21.json')
    console.dir(response.data.length)
    res.locals.courses = response.data.filter((c) => c.instructor[2]==email+"@brandeis.edu")
    res.render('showCourses')
    //res.json(response.data.slice(100,105));
  })

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

const family = [
  {name: 'Coco', age:25,},
  {name: 'Phoebe', age:28,},
  {name: 'Ian', age:22,},
  {name: 'Lars',age:"??",},
  {name: 'Judy',age:"??",},
];
//I didn't want to put any more personal identification here.

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
