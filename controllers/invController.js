const invModel = require("../models/inventory-model")
const utilities = require("../utilities")

const invCont = {}

/* ***** Build inventory by classification view ***** */
invCont.buildByClassificationId = async function (req, res, next) {
    try {
        const classification_id = req.params.classificationId
        const data = await invModel.getInventoryByClassificationId(classification_id)

        if (!data || data.length === 0) {
            return next({ status: 404, message: "No vehicle found for this classification" })
    }

        const grid = await utilities.buildClassificationGrid(data)
        let nav = await utilities.getNav()
        const className = data[0].classification_name

        res.render("./inventory/classification", {  
        title: className + " vehicles",
        nav,
        grid,
    })
    } catch (error) {
    next(error)
    } 
}

/* ***** Build vehicle detail view ***** */
invCont.buildByInvId = async function (req, res, next) {
    try {
        const invId = parseInt(req.params.invId)
        const data = await invModel.getVehicleByInvId(invId)

        if (!data || data.length === 0) {
        return next({ status: 404, message: "Vehicle not found" })
    }

        const vehicle = data[0]
        const grid = await utilities.buildVehicleDetailView(vehicle)
        const nav = await utilities.getNav()

        res.render("inventory/detail", {
        title: `${vehicle.inv_make} ${vehicle.inv_model}`,
        nav,
        grid,
    })
    } catch (error) {
    next(error)
    }
}

/* **********Intentionally 500 error  ****** */

invCont.triggerError = async function (req, res, next) {
    try {
        throw new Error("Intentional 500 error triggered for testing")
    } catch (error) {
        next (error)
    }
}

/* ****************
* Build Management view*
******************* */
invCont.buildManagement = async function (req, res, next) {
    try {
        let nav = await utilities.getNav()
        res.render("inventory/management", {
        title: "Inventory Management",
        nav,
        message: req.flash("notice")
        })
    } catch (error) {
        next(error)
    }
}
/* **********************
* Build Add Classification view
* ********************** */
invCont.buildAddClassification = async function (req, res, next) {
    try {
        let nav = await utilities.getNav()
        res.render("inventory/add-classification", {
        title: "Add New Classification",
        nav,
        message: req.flash("notice")
        })
    } catch (error) {
        next(error)
    }
}

/* **********************
* Build Add Inventory view
* ********************** */
invCont.buildAddInventory = async function (req, res, next) {
    try {
        let nav = await utilities.getNav()
        const classifications = await invModel.getClassifications()
        res.render("inventory/add-inventory", {
        title: "Add New Vehicle",
        nav,
        classifications,
        errors: null,
        message: req.flash("notice")
        })
    } catch (error) {
    next(error)
    }
}

/* **********
* Add new classification
*********** */
invCont.addClassification = async function (req, res, next) {
    try {
        const { classification_name } = req.body

    if (!classification_name || !/^[A-Za-z0-9]+$/.test(classification_name)) {
        req.flash("notice", "Invalid classification name")
        return res.render("inventory/add-classification", { 
        message: req.flash("notice") 
        })
    }

    const result = await invModel.addClassification(classification_name)

    if (result.rowCount === 1) {
        req.flash("notice", "Classification added successfully")
        } else {
        req.flash("notice", "Error adding classification")
        }

    res.redirect("/inv")

    } catch (error) {
    next(error)
    }
}


module.exports = invCont