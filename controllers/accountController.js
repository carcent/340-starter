const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()
const invCont = require("./invController")

/* ************************************
 *  Deliver login view
 ************************************* */
async function buildLogin(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/login", {
        title: "Login",
        nav,
        errors: null
    })
}

/* ************************************
 *  Deliver registration view
 ************************************* */
async function buildRegister(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/register", {
        title: "Register",
        nav,
        errors: null
        
    })
}

/* ****************************************
 *  Process Registration
 *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, 
    account_lastname, 
    account_email, 
    account_password,
  } = req.body
  

  // Hash the password before storing
  let hashedPassword
  try {
    hashedPassword = await bcrypt.hash(account_password, 10)
  } catch (error) {
    req.flash("notice", "Sorry, there was an error processing the registration.")
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult) {
    req.flash("notice", `Congratulations, you're registered ${account_firstname}. Please log in.`

    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    return res.status(501).render("account/register", {
      title: "Registration",
      nav,
      errors: null
    })
  }
}


/* ************************************
 *  Deliver registration view
 ************************************* */
async function buildRegister(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/register", {
        title: "Register",
        nav,
        errors: null
        
    })
}
/* *********************
 * Process Login request
 **************************  */
async function accountLogin(req, res) {
  let nav = await utilities.getNav();
  const { account_email, account_password } = req.body;
  const accountData = await accountModel.getAccountByEmail(account_email);

  if (!accountData) {
    req.flash("message notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      return res.redirect("/account/")
    }
    else {
      req.flash("message notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    throw new Error('Access Forbidden')
  }
}

/* **************************
 * Deliver Account Management view
 *************************** */
async function buildAccountManagement(req, res,next) {
  let nav = await utilities.getNav();
  res.render("account/management", {
    title: "Account Management",
    nav,
    errors: null,
    message: req.flash("notice"),
    accountData: res.locals.accountData,
  });
}

/* ********************
 * Update Account
 ********************* */
async function buildUpdateAccount(req, res,next) {
  let nav = await utilities.getNav();
  const accountId = req.params.id;
  const account = await accountModel.getAccountById(accountId);

  res.render("account/update", { 
    title: "Update Account", 
    nav, 
    account,
    errors:null,
    account_id: accountData.account_id,
    account_firstname: accountData.account_firstname,
    account_lastname: accountData.account_lastname,
    account_email: accountData.account_email,
  });
}

// Update first name, last name, and email
async function updateAccount(req, res) {
  let nav = await utilities.getNav();
  const { account_id, account_firstname, account_lastname, account_email } = 
  req.body;
  

  const updateResult = await accountModel.updateAccount(
    account_id,
    account_firstname,
    account_lastname,
    account_email
  )
    if (updateResult) {
      req.flash("notice", "Account information updated successfully.");
      res.redirect("/account/management"); 
        delete editResult.account_password
      const accessToken = jwt.sign(editResult, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: 3600 * 1000,
      })
      res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      return res.redirect("/account/")
    } else {
      req.flash("message warning", "Sorry, the update failed.")
      return res.redirect(`/account/update/${account_id}`)
    }
}

// Change password
async function updatePassword(req, res, next) {
  let nav = await utilities.getNav();
  const { account_id, account_password } = req.body;

  let hashedPassword
  try {
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash(
      "message warning",
      "Sorry, there was an error processing the password change."
    )
    return res.redirect(`/account/update/${account_id}`)
  }

  const passwordResult = await accountModel.updatePassword(hashedPassword,account_id)

  if (passwordResult) {
    req.flash("message success", "Password updated. Please logout and login to verify.")
    return res.redirect('/account/')

  } else {
    req.flash("message warning", "Sorry, the password update failed.")
    return res.redirect(`/account/update/${account_id}`)
  }
}

//log out
async function logout(req, res) {

    res.clearCookie("jwt");
    res.locals.loggedin = ''
    res.redirect("/")
}

module.exports = {
  registerAccount,
  buildLogin,
  buildRegister,
  invCont,
  accountLogin,
  buildAccountManagement,
  buildUpdateAccount,
  updateAccount, 
  updatePassword,
  logout
};