const express = require("express")
const router = express.Router()
const accountController = require("../controllers/accountController")
const regValidate = require("../utilities/account-validation")
const utilities = require("../utilities/")

// Async error handler middleware
function asyncHandler(callback) {
  return async (req, res, next) => {
    try {
      await callback(req, res, next)
    } catch (error) {
      next(error)
    }
  }
}

// ===============================
//         GET ROUTES
// ===============================

// Show login form
router.get("/login", asyncHandler(accountController.buildLogin))

// Show registration form
router.get("/register", asyncHandler(accountController.buildRegister))


// Show account management page (only if logged in)
router.get(
  "/",
  utilities.checkLogin,
  asyncHandler(accountController.buildAccountManagement)
)

// Show update account form (only if logged in)
router.get(
  "/update/:id",
  utilities.checkLogin,
  asyncHandler(accountController.buildUpdateAccount)
)

// ===============================
//         POST ROUTES
// ===============================

// Handle registration form submission
router.post(
  "/register",
  regValidate.registrationRules(),
  regValidate.checkRegData,
  asyncHandler(accountController.registerAccount)
)

// Handle login form submission
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  asyncHandler(accountController.accountLogin)
)


router.post(
  "/update/",
  utilities.checkLogin,
  regValidate.updateAccountRules(),
  regValidate.checkUpdateData,      
  asyncHandler(accountController.updateAccount) 
);

router.post(
  "/update-password/",
  utilities.checkLogin,
  regValidate.updatePasswordRules(),
  regValidate.checkPasswordData,
  asyncHandler(accountController.updatePassword)
);

router.get("/logout", accountController.logout)
// ===============================
//         EXPORT ROUTER
// ===============================
module.exports = router
