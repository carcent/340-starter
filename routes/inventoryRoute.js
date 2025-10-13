const express = require("express")
const router = express.Router()
const invController = require("../controllers/invController")
const utilities = require("../utilities")
const invChecks = require("../utilities/inventory-validation")

function asyncHandler(callback) {
  return async (req, res, next) => {
    try {
      await callback(req, res, next)
    } catch (error) {
      next(error)
    }
  }
}

// Then wrap your controller functions like this:
router.get("/type/:classificationId", asyncHandler(invController.buildByClassificationId))
router.get("/detail/:invId", asyncHandler(invController.buildByInvId))
router.get("/trigger-error", asyncHandler(invController.triggerError))

router.get("/", asyncHandler(invController.buildManagement))

// Administrative routes (Employee or Admin only)
router.get("/add-classification",
  utilities.checkAccountType,
  invChecks.classificationRule(),
  invChecks.checkClassificationData, asyncHandler(invController.buildAddClassification))
router.post("/add-classification",  invController.addClassification)
router.get("/add-inventory", invController.buildAddInventory)
router.post("/add-inventory", invController.addInventory)

//router.get("/", utilities.checkAccountType, invController.buildManagement)


// get inventory for AJAX ROUTE Select Inv Item activity
router.get(
    "/getInventory/:classification_id", 
    utilities.checkAccountType, asyncHandler(invController.getInventoryJSON)
)

router.get(
  "/edit/:inv_id",
  utilities.checkAccountType,
  asyncHandler(invController.editInvItemView)
)

router.post(
  "/update",
  utilities.checkAccountType,
  invChecks.newInventoryRules(),
  invChecks.checkUpdateData,
  asyncHandler(invController.updateInventory)
)

router.get(
  "/delete/:inv_id",
  utilities.checkAccountType,
  asyncHandler(invController.deleteView)
)

router.post("/delete", 
utilities.checkAccountType, 
asyncHandler(invController.deleteItem)
)

router.get("/search", asyncHandler(invController.searchInventory));
//Delete


module.exports = router
