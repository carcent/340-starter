const express = require("express")
const router = express.Router()
const invController = require("../controllers/invController")
const utilities = require("../utilities")

function asyncHandler(callback) {
  return async (req, res, next) => {
    try {
      await callback(req, res, next)
    } catch (error) {
      next(error)
    }
  }
}
router.get("/", asyncHandler(invController.buildManagement))
// Then wrap your controller functions like this:
router.get("/type/:classificationId", asyncHandler(invController.buildByClassificationId))
router.get("/detail/:invId", asyncHandler(invController.buildByInvId))
router.get("/trigger-error", asyncHandler(invController.triggerError))

// Administrative routes (Employee or Admin only)
router.get("/add-classification", invController.buildAddClassification)
router.post("/add-classification",  invController.addClassification)
router.get("/add-inventory", invController.buildAddInventory)
router.post("/add-inventory", invController.addInventory)

//router.get("/", utilities.checkAdminOrEmployee, invController.buildManagement)


// get inventory for AJAX ROUTE Select Inv Item activity
router.get(
    "/getInventory/:classification_id", 
    utilities.checkAdminOrEmployee, asyncHandler(invController.getInventoryJSON)
)

router.get("/search", asyncHandler(invController.searchInventory));
//Delete
router.get(
  "/delete"
)

module.exports = router
