const pool = require("./db.js");
const bcrypt = require('bcrypt'); 




// ─── REGISTER USER ───────────────────────────────

const registerUser = async (username, email, password) => {
  const hashedPassword = await bcrypt.hash(password, 10); // hashes password here to be saved in db
  try { // we checked for the the existing user in db
  const result = await pool.query(
    `INSERT INTO users (username, email, password)
     VALUES ($1, $2, $3)
     RETURNING id, username, email, created_at`, // returns this after inserting
    [username, email, hashedPassword]
  );
  return result.rows[0];
} catch (err) {
  if (err.code === '23505') { // 23505 unigque psql err number for duplication
      throw new Error('Email already in use');
    }
        throw err; // ← everything else? not our problem, send it up
}
};



// ─── LOGIN USER ──────────────────────────────────

const loginUser = async (email, password) => {

  // Step 1: find user
  const result = await pool.query(
    'SELECT * FROM users WHERE email = $1', [email]
  );
  const user = result.rows[0];
  if (!user) return null;

  // Step 2: compare password with hash
  const match = await bcrypt.compare(password, user.password);
  if (!match) return null;

  return user; 
};


module.exports = { registerUser, loginUser };