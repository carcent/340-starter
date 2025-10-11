const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()
const invCont = require("./invController")

/* ****************************************
 *  Process Registration
 *************************************** */
async function registerAccount(req, res) {
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  let nav = await utilities.getNav()

  // Hash the password before storing
  let hashedPassword
  try {
    hashedPassword = await bcrypt.hash(account_password, 10)
  } catch (error) {
    req.flash("notice", "Sorry, there was an error processing the registration.")
    return res.status(500).render("account/register", {
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
    req.flash("notice", `Congratulations, you're registered ${account_firstname}. Please log in.`)
    return res.status(201).render("account/login", {
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
/* *********************
 * Process Login request
 **************************  */
async function accountLogin(req, res) {
  let nav = await utilities.getNav();
  const { account_email, account_password } = req.body;

  // Field validation
  if (!account_email || !account_password) {
    req.flash("notice", "Please provide both email and password.");
    return res.status(400).render("account/management", { title: "Login", nav, errors: null, account_email });
  }

  const accountData = await accountModel.getAccountByEmail(account_email);

  if (!accountData) {
    req.flash("notice", "Invalid credentials. Please try again.");
    return res.status(400).render("account/login", { title: "Login", nav, errors: null, account_email });
  }

  try {
    // Verify if the password matches
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password; // Remove password from the object before creating the JWT

      // Create JWT
      const accessToken = jwt.sign({ id: accountData.account_id, email: accountData.account_email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });

      // Set the JWT cookie
      res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000, secure: process.env.NODE_ENV === "production" });

      return res.redirect("/account/management");
    } else {
      req.flash("notice", "Invalid credentials. Please try again.");
      return res.status(400).render("account/login", { title: "Login", nav, errors: null, account_email });
    }
  } catch (error) {
    console.error(error);
    req.flash("notice", "Error processing login.");
    return res.status(500).render("account/login", { title: "Login", nav, errors: null });
  }
}

/* **************************
 * Deliver Account Management view
 *************************** */
async function buildAccountManagement(req, res) {
  let nav = await utilities.getNav();
  const account = res.locals.account;

  res.render("account/management", {
    title: "Account Management",
    nav,
    errors: null,
    message: req.flash("notice"),
    account,
  });
}

/* ********************
 * Update Account
 ********************* */
async function buildUpdateAccount(req, res) {
  let nav = await utilities.getNav();
  const accountId = req.params.id;
  const account = await accountModel.getAccountById(accountId);

  if (!account) {
    req.flash("notice", "Account not found.");
    return res.redirect("/account/management");
  }

  res.render("account/update", { 
    title: "Update Account", 
    nav, 
    account,
    errors:null,
    message: req.flash("notice")
  });
}

// Update first name, last name, and email
async function updateAccount(req, res) {
  const { account_id, account_firstname, account_lastname, account_email } = req.body;
  let nav = await utilities.getNav();
  try {
    const updateResult = await accountModel.updateAccount(
      account_id,
      account_firstname,
      account_lastname,
      account_email
    );
      if (updateResult) {
      req.flash("notice", "Account information updated successfully.");
      res.redirect("/account/management"); 
    } else {
      req.flash("notice", "Update failed. Please try again.");
      res.status(400).render("account/update", {
        title: "Update Account",
        nav,
        account: req.body, 
        errors: null,
        message: req.flash("notice"),
      });
    }
  } catch (error) {
    console.error(error);
    req.flash("notice", "An error occurred. Please try again.");
    res.redirect("/account");
  }
}

// Change password
async function updatePassword(req, res) {
  const { account_id, account_password } = req.body;
  let nav = await utilities.getNav();

  try {
    const hashedPassword = await bcrypt.hash(account_password, 10);
    const updateResult = await accountModel.updatePassword(account_id, hashedPassword);

    if (updateResult) {
      req.flash("notice", "Password updated successfully.");
      res.redirect("/account");
    } else {
      req.flash("notice", "Password update failed. Please try again.");
      res.status(400).render("account/update", {
        title: "Update Account",
        nav,
        account: req.body,
        errors: null,
        message: req.flash("notice"),
      });
    }
  } catch (error) {
    console.error(error);
    req.flash("notice", "An error occurred. Please try again.");
    res.redirect("/account");
  }
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
  updatePassword
};