// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);


// Route to build vehicle detail view
router.get("/detail/:invId", invController.buildByInvId);

// intentional error route

router.get("/trigger-error", invController.triggerError)

// Route to build Add Classification view
router.get("/inv/add-classification", invController.buildAddClassification)

// Route to build Add Inventory view
router.get("/inv/add-inventory", invController.buildAddInventory)

// Inventory management view
router.get("/", invController.buildManagement)

// Add Classification
router.post("/inv/add-classification", invController.addClassification)


module.exports = router;

