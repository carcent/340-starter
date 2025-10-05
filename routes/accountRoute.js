const express = require("express")
const router = express.Router()
const accountController = require("../controllers/accountController")
const regValidate = require("../utilities/account-validation")

// Middleware to handle async/await errors
function asyncHandler(callback) {
    return async (req, res, next) => {
    try {
        await callback(req, res, next)
    } catch (error) {
        next(error)
        }
    }
}

// Route to build login view
router.get("/login", asyncHandler(accountController.buildLogin))


// Route to build registration view
router.get("/register", asyncHandler(accountController.buildRegister))

router.post("/register", 
  regValidate.registrationRules(),
  regValidate.checkRegData, 
  asyncHandler(accountController.registerAccount)
)

// Process the login attempt
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  asyncHandler(accountController.accountLogin)
)
module.exports = router