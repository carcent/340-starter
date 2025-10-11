const pool = require("../database/")


/* *****************************
*   Register new account
* *************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password){
  try {
    const sql = "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *"
    return await pool.query(sql, [account_firstname, account_lastname, account_email, account_password])
  } catch (error) {
    return error.message
  }
}

/* **********************
 *   Check for existing email
 * ********************* */
async function checkExistingEmail(account_email){
    try {
    const sql = "SELECT * FROM account WHERE account_email = $1"
    const email = await pool.query(sql, [account_email])
    return email.rowCount
    } catch (error) {
    return error.message
    }
}

/* ****************************
*Return Accont Data using email address
********************************** */ 
async function getAccountByEmail(account_email) {
  try{
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1', 
    [account_email])
    return result.rows[0]
  }catch(error){
    return new Error("No matching email found")
  }
  
}

async function updateAccount(account_id, firstname, lastname, email) {
  try {
    const sql = `UPDATE accounts
                SET account_firstname = $1,
                    account_lastname = $2,
                    account_email = $3
                WHERE account_id = $4
                RETURNING`;
    const result = await pool.query(sql, [firstname, lastname, email, account_id]);
    return result.rowCount >0; // 1 if updated
  } catch (error) {
    console.error("Error updating account:", error);
    return false;
  }
}

async function updatePassword(account_id, hashedPassword) {
  try {
    const sql = `UPDATE accounts
                SET account_password = $1
                WHERE account_id = $2`;
    const result = await pool.query(sql, [hashedPassword, account_id]);
    return result.rowCount>0;
  } catch (error) {
    console.error("Error updating account:", error);
    return false;
  }
}

// Get account info by account_id
async function getAccountById(account_id) {
  try {
    const sql = "SELECT * FROM accounts WHERE account_id = $1";
    const result = await pool.query(sql, [account_id]);
    return result.rows[0]; // devuelve el objeto del usuario
  } catch (error) {
    console.error("Error fetching account by ID: ", error);
    return null;
  }
}

module.exports = {
  registerAccount,
  checkExistingEmail,
  getAccountByEmail,
  updatePassword,
  updateAccount,
  getAccountById
};