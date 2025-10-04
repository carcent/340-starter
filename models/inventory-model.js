const pool = require("../database/")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications(){
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}




/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error("getclassificationsbyid error " + error)
  }
}

/* **********************************
 *Get a single vehicle by inv_id 
 **************************************/
async function getVehicleByInvId(invId) {
  try {
    const result = await pool.query(
      `SELECT * FROM public.inventory WHERE inv_id = $1`,
      [invId]
    );
    return result.rows;
  } catch (error) {
    console.error("getVehicleByInvId error " + error);
  }
}

async function addClassification(classification_name) {
  try {
    const sql = "INSERT INTO classification (classification_name) VALUES ($1)"
    const values = [classification_name]
    return await pool.query(sql, values)
} catch (error) {
    console.error("addClassification error " + error);
  }
}

async function addInventory(data) {
  try {
    const sql = `INSERT INTO inventory 
    (inv_make, inv_model, inv_year, inv_price, classification_id)
    VALUES ($1, $2, $3, $4, $5)`
  const values = [
    data.inv_make,
    data.inv_model,
    data.inv_year,
    data.inv_price,
    data.classification_id,
  ]
  return await pool.query(sql, values)
} catch (error) {
    console.error("addClassification error " + error);
  }
}

module.exports = {
  getClassifications,
  getInventoryByClassificationId, 
  getVehicleByInvId
};