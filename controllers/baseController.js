const utilities = require("../utilities/")
const baseController = {}

baseController.buildHome = async function(req, res, next){
    try{
        const nav = await utilities.getNav()
        res.render("index", {title: "Home", nav})
    } catch (error){
        next({ status: 500, message: error.message })
    }
}

module.exports = baseController