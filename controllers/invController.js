const invModel = require("../models/inventory-model");
const utilities = require("../utilities");

const invCont = {};

/* ***********************
 * Build inventory by classification view
 ************************ */
invCont.buildByClassificationId = async function (req, res, next) {
  try {
    const classification_id = req.params.classificationId;
    const data = await invModel.getInventoryByClassificationId(classification_id);

    if (!data || data.length === 0) {
      return next({ status: 404, message: "No vehicles found for this classification." });
    }

    const grid = await utilities.buildClassificationGrid(data);
    const nav = await utilities.getNav();
    const className = data[0].classification_name;

    res.render("./inventory/classification", {
      title: `${className} vehicles`,
      nav,
      grid,
    });
  } catch (error) {
    next(error);
  }
};

/* ***********************
 * Build vehicle detail view
 ************************ */
invCont.buildByInvId = async function (req, res, next) {
  try {
    const invId = parseInt(req.params.invId);
    const data = await invModel.getVehicleByInvId(invId);

    if (!data || data.length === 0) {
      return next({ status: 404, message: "Vehicle not found." });
    }

    const vehicle = data[0];
    const grid = await utilities.buildVehicleDetailView(vehicle);
    const nav = await utilities.getNav();

    res.render("inventory/detail", {
      title: `${vehicle.inv_make} ${vehicle.inv_model}`,
      nav,
      grid,
    });
  } catch (error) {
    next(error);
  }
};

/* ***********************
 * Trigger intentional 500 error (for testing)
 ************************ */
invCont.triggerError = function (req, res, next) {
  next(new Error("Intentional 500 error triggered for testing."));
};

/* ***********************
 * Inventory Management View
 ************************ */
invCont.buildManagement = async function (req, res, next) {
  try {
    const nav = await utilities.getNav();
    const classificationSelect = await utilities.buildClassificationList();

    res.render("inventory/management", {
      title: "Vehicle Management",
      nav,
      classificationSelect,
      errors: null,
      message: req.flash("notice"),
    });
  } catch (error) {
    next(error);
  }
};

/* ***********************
 * Build Add Classification view
 ************************ */
invCont.buildAddClassification = async function (req, res, next) {
  try {
    const nav = await utilities.getNav();
    res.render("inventory/add-classification", {
      title: "Add New Classification",
      nav,
      message: req.flash("notice"),
    });
  } catch (error) {
    next(error);
  }
};

/* ***********************
 * Build Add Inventory view
 ************************ */
invCont.buildAddInventory = async function (req, res, next) {
  try {
    const nav = await utilities.getNav();
    const classifications = await invModel.getClassifications();

    res.render("inventory/add-inventory", {
      title: "Add New Vehicle",
      nav,
      classifications,
      errors: null,
      message: req.flash("notice"),
    });
  } catch (error) {
    next(error);
  }
};

/* ***********************
 * Add new classification
 ************************ */
invCont.addClassification = async function (req, res, next) {
  try {
    const { classification_name } = req.body;

    if (!classification_name || !/^[A-Za-z0-9_-]+$/.test(classification_name)) {
      req.flash("notice", "Invalid classification name.");
      const nav = await utilities.getNav();
      return res.status(400).render("inventory/add-classification", {
        title: "Add New Classification",
        nav,
        message: req.flash("notice"),
        errors: null, 
      });
    }

    const result = await invModel.addClassification(classification_name);

    if (result.rowCount === 1) {
      req.flash("notice", "Classification added successfully.");
    } else {
      req.flash("notice", "Failed to add classification.");
    }

    res.redirect("/inv");
  } catch (error) {
    next(error);
  }
};

/* ***********************
 * Process Add Inventory
 ************************ */
invCont.addInventory = async function (req, res, next) {
  try {
    const {
      inv_make,
      inv_model,
      inv_year,
      inv_price,
      classification_id
    } = req.body

    // Validación básica
    if (!inv_make || !inv_model || !inv_year || !inv_price || !classification_id) {
      req.flash("notice", "All fields are required.")
      const nav = await utilities.getNav()
      const classifications = await invModel.getClassifications()
      return res.status(400).render("inventory/add-inventory", {
        title: "Add New Vehicle",
        nav,
        classifications,
        message: req.flash("notice"),
        errors: null
      })
    }

  
    const addResult = await invModel.addInventory(
      inv_make,
      inv_model,
      inv_year,
      inv_price,
      classification_id
    )

    if (addResult) {
      req.flash("notice", `The ${inv_make} ${inv_model} was successfully added.`)
      res.redirect("/inv") 
    } else {
      req.flash("notice", "Sorry, the insert failed.")
      const nav = await utilities.getNav()
      const classifications = await invModel.getClassifications()
      res.render("inventory/add-inventory", {
        title: "Add New Vehicle",
        nav,
        classifications,
        message: req.flash("notice"),
        errors: null
      })
    }
  } catch (error) {
    next(error)
  }
}

/* ******************************
 * Return inventory by classification as JSON (for AJAX)
 ****************************** */
invCont.getInventoryJSON = async function (req, res, next) {
  try {
    const classification_id = parseInt(req.params.classification_id);
    const invData = await invModel.getInventoryByClassificationId(classification_id);

    if (!invData || invData.length === 0) {
      return next(new Error("No inventory data found."));
    }

    res.json(invData);
  } catch (error) {
    next(error);
  }
};

invCont.searchInventory = async function(req, res, next) {
    try {
        const nav = await utilities.getNav();
        const query = req.query.search; // coincide con name="search" del form

        if (!query) {
            req.flash("notice", "Please enter a search term.");
            return res.redirect("/inv");
        }

        const results = await invModel.searchInventory(query);

        const grid = await utilities.buildClassificationGrid(results);

        res.render("inventory/management", {
            title: "Search Results",
            nav,
            classificationSelect: await utilities.buildClassificationList(),
            grid,
            message: req.flash("notice"),
            errors: null
        });
    } catch (error) {
        next(error);
    }
}

module.exports = invCont;
