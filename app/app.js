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



// *********************************************************** //
//  Connecting to the database
// *********************************************************** //

const mongoose = require( 'mongoose' );
//const mongodb_URI = process.env.mongodb_URI;
//const mongodb_URI = 'mongodb://localhost:27017/cs103a_todo'
const mongodb_URI = 'mongodb+srv://cs_sj:BrandeisSpr22@cluster0.kgugl.mongodb.net/IanErickson?retryWrites=true&w=majority'
//This is the URL for the mongoDB compass app.
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
/*
  Load MongoDB models 
*/
const ToDoItem = require('./models/ToDoItem');
const Contact = require('./models/Contact');
const Schedule = require('./models/Schedule');
const Course = require('./models/Course')
const Spell_List = require('./models/Spell_List');
const Spell = require('./models/Spell');


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const cloudData = require('./routes/cloudData');
const exam5 = require('./routes/exam5');


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

app.use(layouts);
app.use(auth);
app.use(cloudData);
app.use(exam5);
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
  res.locals.meals = response.data.meals || []
  //Null is a false value, so that or statement will make recipes null if response.data.meals doesn't have anything. 
  res.locals.ingredient = ingredient
  res.render('showMeals')
})

app.get('/showIngredients',
  async (req,res,next) => {
    const response = await axios.get('https://www.themealdb.com/api/json/v1/1/list.php?i=list')
    console.dir(response.data.length)
    console.dir(response.data.meals)
    res.locals.repos = response.data.meals
    res.render('showIngredients')
  }
)
app.post('/showIngredients',
async (req,res,next) => {
  const {ingredient} = req.body;
  const response = await axios.get('https://www.themealdb.com/api/json/v1/1/filter.php?i='+ingredient)
  console.dir(response.data.length)
  console.log(response)
  res.locals.meals = response.data.meals || []
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

app.get('/addSpell/:spell_id',
   isLoggedIn,                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 
   async (req,res,next) => {
    try {
      const spellItem = 
         new Spell_List(
          {
            userid:res.locals.user._id,
            spellIndex:req.params.spell_id,
            //username:res.locals.user.username
          }
          )
      await spellItem.save();
      res.redirect('/dnd')
    }catch(e) {
      next(e)
    }
   }
)
app.get('/showSpellList',
  isLoggedIn,
  async (req,res,next) => {
    try{
      console.log('1')
      const spells = 
         await Spell_List.find({userId:res.locals.user.id})
             .populate('spell_id');
             console.log('2')
      //res.json(courses);
      res.locals.spells = spells;
      res.render('showSpellList')

    }catch(e){
      next(e);
    }
  }
)
app.get('/bigCourses',
  async (req,res,next) => {
    try{
      const bigCourses =  await Course.find({enrolled:{$gt:150}})
                          //.select("subject coursenum name enrolled term")
                          //.sort({term:1,enrolled:-1})
                          //.limit(3)
                          ;
      res.json(bigCourses);
    }catch(e){
      next(e)
    }
  })



app.get('/addCourse/:courseId',
   isLoggedIn,                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 
   async (req,res,next) => {
    try {
      const schedItem = 
         new Schedule(
          {
            userid:res.locals.user._id,
            courseId:req.params.courseId}
          )
      await schedItem.save();
      res.redirect('/coursesBySubject')
    }catch(e) {
      next(e)
    }
   }
)

app.get('/showSchedule',
  isLoggedIn,
  async (req,res,next) => {
    try{
      const courses = 
         await Schedule.find({userId:res.locals.user.id})
             .populate('courseId');
      //res.json(courses);
      res.locals.courses = courses;
      res.render('showmyschedule')

    }catch(e){
      next(e);
    }
  }
)

app.get('/deleteFromSchedule/:itemId',
    isLoggedIn,
    async (req,res,next) => {
      try {
        const itemId = req.params.itemId;
        await Schedule.deleteOne({_id:itemId});
        res.redirect('/showSchedule');
      } catch(e){
        next(e);
      }
    }
)

app.get('/coursesBySubject',
  isLoggedIn,
  async (req,res,next) => {
    res.locals.courses =[]
    console.log('rendering coursesBySubject')
    const scheduledCourses = 
    await Schedule.find({userId:res.locals.user.id});
    res.locals.schedIds = 
      scheduledCourses.map(x => {
        let y = x.courseId.valueOf();
        console.log(y); console.log(typeof y);
        return y+"";
      });
    res.render('coursesBySubject')
  }
)

app.post('/coursesBySubject',
  async (req,res,next) => {
    try{
      const subject = req.body.subject;
      const term = req.body.term;
      const data = await Course.find({
        subject:subject,
        term:term, 
        enrolled:{$gt:10}
        //{$gt: 0} means find items where the specified field is greater than 0.

      })
              //.select("subject coursenum name enrolled term")
              //.select would be if I only want to pull certain parameters.
               .sort({enrolled:-1})
      //res.json(data); 
      const scheduledCourses = 
         await Schedule.find({userId:res.locals.user.id});
      res.locals.schedIds = 
         scheduledCourses.map(x => x.courseId);
      res.locals.courses = data;
      res.render('coursesBySubject');

    }catch(e){
      next(e)
    }
  }
)	
app.get('/todo', (req,res,next) => res.render('todo'))

app.post('/todo',
  isLoggedIn,
  async (req,res,next) => {
    try {
      const desc = req.body.desc;
      const todoObj = {
        userId:res.locals.user._id,
        descr:desc,
        completed:false,
        createdAt: new Date(),
      }
      const todoItem = new ToDoItem(todoObj); // create ORM object for item
      await todoItem.save();  // stores it in the database
      res.redirect('/showTodoList');


    }catch(err){
      next(err);
    }
  }
)

app.get('/showTodoList',
        isLoggedIn,
  async (req,res,next) => {
   try {
    const todoitems = await ToDoItem.find({userId:res.locals.user._id});

    res.locals.todoitems = todoitems
    res.render('showToDoList')
    //res.json(todoitems);
   }catch(e){
    next(e);
   }
  }
)
app.get('/toggleToDoItem/:itemId',
    isLoggedIn,
    async (req,res,next) => {
      try {
        const itemId = req.params.itemId;
        const item = await ToDoItem.findOne({_id:itemId});
        item.completed = ! item.completed;
        await item.save();
        res.redirect('/showTodoList');
      } catch(e){
        next(e);
      } 
    }
)

app.get('/deleteToDoItem/:itemId',
    isLoggedIn,
    async (req,res,next) => {
      try {
        const itemId = req.params.itemId;
        await ToDoItem.deleteOne({_id:itemId});
        res.redirect('/showTodoList');
      } catch(e){
        next(e);
      }
    }
)

app.get('/contacts',
        isLoggedIn,
  async (req,res,next) => {
   try {
    const contacts = await Contact.find({userId:res.locals.user._id});
    res.locals.contacts = contacts
    res.render('contacts')
    //res.json(todoitems);
   }catch(e){
    next(e);
   }
  }
)

app.post('/contacts',
  isLoggedIn,
  async (req,res,next) => {
    try {
      const name = req.body.name;
      const email = req.body.email;
      const phone = req.body.phone;
      const comments = req.body.comments;
      const contactobj = {
        userId:res.locals.user._id,
        name:name,
        email:email,
        phone:phone,
        comments:comments,
      }
      const contact = new Contact(contactobj); // create ORM object for item
      await contact.save();  // stores it in the database
      res.redirect('/contacts');


    }catch(err){
      next(err);
    }
  }
)


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
  {name: 'Amah',age:"~80"},
  {name: 'Copper',age:"Baby"},
  {name: 'Archie',age:"Baby"},
  {name: 'Void',age:"Baby"},
  {name: 'Pepper',age:"Old Baby"},
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
