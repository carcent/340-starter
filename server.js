/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const env = require("dotenv").config()
const app = express()
const static = require("./routes/static")
const baseController = require("./controllers/baseController")
const invController = require("./controllers/invController")
const inventoryRoute = require("./routes/inventoryRoute")
const utilities = require("./utilities")
const session = require("express-session")
const pool = require('./database/')
const flash = require("connect-flash")
const bodyParser = require("body-parser")
const accountRouter = require('./routes/accountRoute');
const cookieParser = require("cookie-parser")
const jwt = require("jsonwebtoken")


/* ***************
* Middleware
* ****************** */ 
app.use(session({
  store: new (require('connect-pg-simple')(session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  name: 'sessionId',
}))
app.use(flash())

app.use((req, res, next) => {
  res.locals.messages = req.flash()
  next()
})
//body and cookie parsing

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

app.use(cookieParser())

// login Process activity
app.use(utilities.checkJWTToken)

// Middleware to attach account info to all views
app.use((req, res, next) => {
  if (req.cookies && req.cookies.jwt) {
    try {
      const decoded = jwt.verify(req.cookies.jwt, process.env.ACCESS_TOKEN_SECRET)
      res.locals.account = decoded  
    } catch (err) {
      res.locals.account = null
    }
  } else {
    res.locals.account = null
  }
  next()
})

/****************************
 ** * View Engine and Templates
 ************************ */
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout") //not at views root

/* ***********************
 * Routes
 *************************/


// Inventory routes


app.use(static)
app.use("/inv", inventoryRoute)
app.use('/account', accountRouter)
// Index Route
app.get("/", baseController.buildHome)


// File Not Found Route -
app.use(async (req, res, next) => {
  next({status: 404, message: 'Sorry, The car you’re looking for took a wrong turn 🛑.'})
})


/* ***********************
* Express Error Handler
* Place after all other middleware
*************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav()
  console.error(`Error at: "${req.originalUrl}": ${err.message}`)
  res.render("errors/error", {
    title: err.status || 'Server Error',
    message: err.message,
    nav
  })
})


/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT || 3000
const host = process.env.HOST

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on port:${port}`)
})


