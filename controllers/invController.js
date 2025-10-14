const invModel = require("../models/inventory-model");
const utilities = require("../utilities");

const invCont = {};

/* ***********************
 * Build inventory by classification view
 ************************ */
invCont.buildByClassificationId = async function (req, res, next) {
  try {
    const classification_id = req.params.classificationId;
    const data = await invModel.getInventoryByClassificationId(classification_id)
    let nav = await utilities.getNav()
    if (!data || data.length === 0) {
        res.render("./inventory/classification", {
            title: "NO VEHICLES HAVE BEEN FOUND",
            nav,
            grid: "There has not been any vehicles created in this classification."
        })
        return
    }

    const grid = await utilities.buildClassificationGrid(data)
    const className = data[0].classification_name

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
    let nav = await utilities.getNav()
    const classificationSelect = await utilities.buildClassificationList();
    res.render("./inventory/management", {
      title: "Vehicle Management",
      nav,
      classificationSelect,
      errors: null,
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
    res.render("./inventory/add-classification", {
      title: "Add New Classification",
      nav,
      message: req.flash("notice"),
      errors:null,
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
    const classificationSelect = await invModel.getClassifications();

    res.render("./inventory/add-inventory", {
      title: "Add New Vehicle",
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
 * Add new classification
 ************************ */
invCont.addClassification = async function (req, res, next) {
  
    let nav = await utilities.getNav()
    const { classification_name } = req.body;
  const insertResult = await invModel.addClassification(classification_name)

  if (insertResult) {
    nav = await utilities.getNav()
    req.flash("message success", `The ${insertResult.classification_name} classification was successfully added.`)
    res.status(201).render("inventory/management", {
      title: "Vehicle Management",
      nav,
      errors: null,
    })
  } else {
    req.flash("message warning", "Sorry, the insert failed.")
    res.status(501).render("inventory/add-classification", {
      title: "Add New Classification",
      nav,
      errors: null,
    })
  }
}

/* ***********************
 * Process Add Inventory
 ************************ */
invCont.addInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
    const {
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id
    } = req.body

  const insertResult = await invModel.addInventory(
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  )

  if (insertResult) {
    const itemName = insertResult.inv_make + " " + insertResult.inv_model
    const classificationSelect = await utilities.buildClassificationList()
    req.flash("message success", `The ${itemName} was successfully added.`)
    res.status(201).render("./inventory/management", {
      title: "Inventory Management",
      nav,
      errors: null,
      classificationSelect,
    })
  } else {
    const classificationSelect = await utilities.buildClassificationList()
    req.flash("message warning", "Sorry, the insert failed.")
    res.status(501).render("./inventory/add-inventory", {
      title: "Add New Inventory",
      nav,
      classificationSelect: classificationSelect,
      errors: null,
    })
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

/* ************************
*build edit item view
* ************************ */ 

invCont.editInvItemView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  const invData = await invModel.getInventoryById(inv_id)
  const classificationSelect = await utilities.buildClassificationList(invData.classification_id)
  const itemName = `${invData.inv_make} ${invData.inv_model}`
  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id: invData.inv_id,
    inv_make: invData.inv_make,
    inv_model: invData.inv_model,
    inv_year: invData.inv_year,
    inv_description: invData.inv_description,
    inv_image: invData.inv_image,
    inv_thumbnail: invData.inv_thumbnail,
    inv_price: invData.inv_price,
    inv_miles: invData.inv_miles,
    inv_color: invData.inv_color,
    classification_id: invData.classification_id
  })
}
/* **************
* update vehicle data
********* */

invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  } = req.body

  const updateResult = await invModel.updateInventory(
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  )

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    req.flash("message success", itemName+' was successfully updated.')
    res.redirect("/inv/")
  } else {
    const classificationSelect = await utilities.buildClassificationList(
      classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("message warning", "Sorry, the insert failed.")
    res.status(501).render("inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationSelect: classificationSelect,
      errors: null,
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id
    })
  }
}
// build delete confirmation view

invCont.deleteView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  const itemData = await invModel.getInventoryById(inv_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  res.render("./inventory/delete-confirm", {
    title: "Delete " + itemName,
    nav,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_price: itemData.inv_price,
  })
}

// Delete inventory

invCont.deleteItem = async function (req, res, next) {
  let nav = await utilities.getNav()
  const inv_id  = parseInt(req.body.inv_id)

  const deleteResult = await invModel.deleteInventoryItem(inv_id)

  if (deleteResult) {
    req.flash("message success", 'The deletion was successful.')
    res.redirect('/inv/')
  } else {
    req.flash("message warning", 'Sorry, the delete failed.')
    res.redirect("/inv/delete/inv_id")
  }
}


/* build search bar
*/


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
