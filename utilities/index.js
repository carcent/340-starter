const invModel = require("../models/inventory-model")
const jwt = require("jsonwebtoken")
require("dotenv").config()
const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
    let data = await invModel.getClassifications()
    let list = "<ul>"
    list += '<li><a href="/" title="Home page">Home</a></li>'
    data.forEach((row) => {
        list += "<li>"
        list +=
            '<a href="/inv/type/' +
            row.classification_id +
            '" title="See our inventory of ' +
            row.classification_name +
            ' vehicles">' +
            row.classification_name +
            "</a>"
        list += "</li>"
    })
    list += "</ul>"
    return list
}


/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
    let grid
    if(data.length > 0){
        grid = '<ul id="inv-display">'
        data.forEach(vehicle => { 
            grid += '<li>'
                grid +=  '<a href="/inv/detail/'+ vehicle.inv_id 
                + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
                + ' details"><img src="' + vehicle.inv_thumbnail 
                +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
                +' on CSE Motors" /></a>'
            grid += '<div class="namePrice">'
            grid += '<hr />'
            grid += '<h2>'
                grid += '<a href="/inv/detail/' + vehicle.inv_id +'" title="View ' 
                + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
                + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
            grid += '</h2>'
            grid += '<span>$' 
            + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
            grid += '</div>'
            grid += '</li>'
        })
        grid += '</ul>'
    } else { 
        grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
    }
    return grid
}

/* *******************************
* New function for single vehicle detail view
************************************ */

Util.buildVehicleDetailView = async function(vehicle){
    let detail = `
        <section class="vehicle-detail">
            <img src="${vehicle.inv_image}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model}" class="vehicle-image" />
            <div class="vehicle-info">
                <h2>${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}</h2>
                <p><strong>Price:</strong> $${new Intl.NumberFormat("en-US").format(vehicle.inv_price)}</p>
                <p><strong>Mileage:</strong> ${new Intl.NumberFormat("en-US").format(vehicle.inv_miles)} miles</p>
                <p><strong>Description:</strong> ${vehicle.inv_description}</p>
                <p><strong>Color:</strong> ${vehicle.inv_color}</p>
            </div>
        </section>
    `;
    return detail;
}

/* **********************************
* milware
*********************** */ 
Util.checkJWTToken = (req, res, next) => {
    if (req.cookies.jwt) {
        jwt.verify(req.cookies.jwt, 
            process.env.ACCESS_TOKEN_SECRET, 
            function (err, accountData) {
                if (err){
                    req.flash("notice", "Please Log in")
                    res.clearCookie("jwt")
                    return res.redirect("/account/login")
                }
            res.locals.accountData = accountData
            res.locals.loggedin = 1
            next()
            })
    } else {
        next()
    }
}
/* ****************************************
*  Check Login
**************************************/
Util.checkLogin = (req, res, next) => {
    if (res.locals.account) {
        next()
    } else {
        req.flash("notice", "Please log in.")
        return res.redirect("/account/login")
    } 
}

/***
 * List of vehicles
 */
Util.buildClassificationList = async () => {
    try{
        const classifications = await invModel.getClassifications();
        let list = '<option value="">Select a Classification</option>';
    classifications.forEach((c) => {
        list += `<option value="${c.classification_id}">${c.classification_name}</option>`;
    });

    return list;
    } catch (error) {
    console.error("buildClassificationList error: " + error);
    return '<option value="">No classifications available</option>';
    }
}   


Util.checkAdminOrEmployee = (req, res, next) => {
    console.log("Verifying JWT...");
    if (req.cookies.jwt) {
        jwt.verify(req.cookies.jwt, process.env.ACCESS_TOKEN_SECRET, (err, accountData) => {
            if (err) {
                req.flash("notice", "Please log in");
                res.clearCookie("jwt");
                return res.redirect("/account/login");
            }
            console.log("Verified:", accountData);
            if (accountData.account_type === "Employee" || accountData.account_type === "Admin") {
                res.locals.accountData = accountData;
                res.locals.loggedin = 1;
                return next();
            } else {
                req.flash("notice", "You do not have permission to access that page");
                return res.redirect("/account/login");
            }
        });
    } else {
        req.flash("notice", "Please log in");
        return res.redirect("/account/login");
    }
};


module.exports = Util
