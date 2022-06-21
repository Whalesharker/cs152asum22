var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const layouts = require("express-ejs-layouts");
const axios = require('axios');
const auth = require('./routes/auth');
const session = require("express-session"); 
const MongoDBStore = require('connect-mongodb-session')(session);

// *********************************************************** //
//  Loading JSON datasets
// *********************************************************** //
const courses = require('./public/data/courses20-21.json')

// *********************************************************** //
//  Loading models
// *********************************************************** //

const Course = require('./models/Course')

// *********************************************************** //
//  Connecting to the database
// *********************************************************** //

const mongoose = require( 'mongoose' );
//const mongodb_URI = 'mongodb://localhost:27017/cs103a_todo'
const mongodb_URI = 'mongodb+srv://cs_sj:BrandeisSpr22@cluster0.kgugl.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'

mongoose.connect( mongodb_URI, { useNewUrlParser: true, useUnifiedTopology: true } );
// fix deprecation warnings
//mongoose.set('useFindAndModify', false); 
//mongoose.set('useCreateIndex', true);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error: Oh no, everybody panic! AAAAAAH'));
db.once('open', function() {console.log("we are connected!!!")});

// middleware to test is the user is logged in, and if not, send them to the login page
const isLoggedIn = (req,res,next) => {
  if (res.locals.loggedIn) {
    next()
  }
  else res.redirect('/login')
}
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

var store = new MongoDBStore({
  uri: mongodb_URI,
  collection: 'mySessions'
});

// Catch errors
store.on('error', function(error) {
  console.log(error);
});

app.use(require('express-session')({
  secret: 'This is a secret 7f89a789789as789f73j2krklfdslu89fdsjklfds',
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
  },
  store: store,
  // Boilerplate options, see:
  // * https://www.npmjs.com/package/express-session#resave
  // * https://www.npmjs.com/package/express-session#saveuninitialized
  resave: true,
  saveUninitialized: true
}));


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(layouts)
app.use(auth)
app.use('/', indexRouter);
app.use('/users', usersRouter);

app.get('/simpleform',
  isLoggedIn,
  (req,res,next) => {
    res.render('simpleform')
  })

app.post("/simpleform", 
  isLoggedIn,
 (req, res, next) => {
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
app.get('/exam3b',
  (req, res, next) => {
    res.render('exam3b')
  }
)
app.post('/exam3b',
  (req, res, next) => {
    const {url} = req.body;
    res.locals.url = url
    res.render("exam3bShowImage")
  }
)

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
app.get('/dist',
  (req, res, next) => {
    res.render('dist')
  }
)
app.post('/dist',
  (req,res,next) => {
    const {x, y, z} = req.body;
    res.locals.x = x;
    res.locals.y = y;
    res.locals.z = z;
    res.locals.distance = Math.sqrt(x*x+y*y+z*z);
    res.render('distresults');
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

app.get('/githubInfo/:githubID',
  async (req,res,next) => {
    const id = req.params.githubId;
    const response = await axios.get('https://api.github.com/users/'+id+'/repos')
    console.dir(response.data.length)
    res.locals.repos = response.data
    res.render('showRepos')
    //res.json(response.data.slice(100,105));
  })

app.get('/meals',
async (req,res,next) => {
  res.render('meals')
})

app.post('/meals',
async (req,res,next) => {
  const {ingredient} = req.body;
  const response = await axios.get('https://www.themealdb.com/api/json/v1/1/filter.php?i='+ingredient)
  console.dir(response.data.length)
  console.log(response)
  res.locals.recipes = response.data.meals || []
  //Null is a false value, so that or statement will make recipes null if response.data.meals doesn't have anything. 
  res.locals.ingredient = ingredient
  res.render('showMeals')
})

app.get('/uploadDB',
  async (req,res,next) => {
    await Course.deleteMany({});
    await Course.insertMany(courses);

    const num = await Course.find({}).count();
    res.send("data uploaded: "+num)
  }
)
app.get("/dnd",
  (req, res, next) => {
    res.render('dnd')
  }
)
app.post('/dnd',
async (req,res,next) => {
  const search = req.body.search;
  const response = await axios.get("https://www.dnd5eapi.co/api/spells/")
  //I apperently need to take the entire API and then manually search it myself. 
  //Guess I need to figure out how to do that.
  console.dir(response.data.length)
  console.log(response)
  var allSpells = response.data.results
  res.locals.search = search
  //Code below gotten and edited from https://stackoverflow.com/questions/10679580/javascript-search-inside-a-json-object
  //results is a list of spells from the API that match the search.
  var results = [];
  var searchVal = search;
  for (var i=0 ; i < allSpells.length ; i++)
  {
    //Iterates through all spells in the API and adds those that have a name that includes the search in the results list.
    if (allSpells[i].name.toLowerCase().includes(searchVal.toLowerCase())) {
        results.push(allSpells[i]);
    }
  }
  //Passes results to dndresults
  res.locals.results = results
  //end of code taken from stack overflow.
  res.render('dndresults')
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
