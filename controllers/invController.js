const invModel = require("../models/inventory-model");
const utilities = require("../utilities");

const invCont = {};

/* ***** *Build inventory by classification view ***
*****************************************************/

invCont.buildByClassificationId = async function (req, res, next) {
    const classification_id = req.params.classificationId;
    const data = await invModel.getInventoryByClassificationId(classification_id);
    const grid = await utilities.buildClassificationGrid(data);
    let nav = await utilities.getNav();
    const className = data[0].classification_name;
    res.render("./inventory/classification", {
        title: className + " vehicles",
        nav,
        grid,
    });
};

/* Build vehicle detail view */
invCont.buildByInvId = async function (req, res, next) {
    const invId = req.params.invId;
    const data = await invModel.getVehicleByInvId(invId);

    if (!data) {
        return next(new Error("Vehicle not found"));
    }

    const grid = await utilities.buildVehicleDetailView(data);
    const nav = await utilities.getNav();

    res.render("inventory/detail", {
        title: `${data.inv_make} ${data.inv_model}`,
        nav,
        grid,
    });
};

module.exports = invCont;