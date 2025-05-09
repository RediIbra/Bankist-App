const express = require('express');
const { Client } = require('pg');
const cors = require('cors');

// Initialize express
const app = express();
app.use(express.json());
app.use(cors());

// Initialize PostgreSQL client
const client = new Client({
  user: 'postgres',  // PostgreSQL user
  host: 'localhost',  // Database host
  database: 'postgres', // Database name
  password: '1234',  // Your PostgreSQL password
  port: 5432,  // Default PostgreSQL port
});

// Connect to PostgreSQL
client.connect()
  .then(() => console.log("Connected to PostgreSQL"))
  .catch(err => console.error("Connection error", err.stack));

// Route to get all accounts
app.get('/users', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM users');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route to get user by ID
app.get('/users/:username', async (req, res) => {
  const username = req.params.username;
  
  try {
    const result = await client.query('SELECT * FROM users WHERE username = $1', [username]);
    
    if (result.rows.length > 0) {
      res.json(result.rows[0]); // Return the user data if found
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error retrieving user data' });
  }
});


// Route to update a specific account
app.put('/users/:id', async (req, res) => {
  const { id } = req.params;
  const { movements, movementsDates } = req.body;

  try {
    const result = await client.query(
      'UPDATE users SET movements = $1, movements_dates = $2 WHERE id = $3 RETURNING *',
      [movements, movementsDates, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route to create a new account
app.post('/users', async (req, res) => {
  const { owner, movements, movementsDates, interestRate, pin, currency, locale } = req.body;

  try {
    const result = await client.query(
      'INSERT INTO users (owner, movements, movements_dates, interest_rate, pin, currency, locale) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [owner, movements, movementsDates, interestRate, pin, currency, locale]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route to delete an account
app.delete('/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await client.query('DELETE FROM users WHERE id = $1', [id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route to transfer between users
app.post('/transfer', async (req, res) => {
  const { senderUsername, receiverUsername, amount } = req.body;

  // Basic validation
  if (
    !senderUsername ||
    !receiverUsername ||
    typeof amount !== 'number' ||
    amount <= 0
  ) {
    return res.status(400).json({ error: 'Invalid input' });
  }
  if (senderUsername === receiverUsername) {
    return res.status(400).json({ error: 'Cannot transfer to yourself' });
  }

  try {
    // Start transaction
    await client.query('BEGIN');

    // Lock sender & receiver rows
    const senderRes = await client.query(
      'SELECT movements FROM users WHERE username = $1 FOR UPDATE',
      [senderUsername]
    );
    const receiverRes = await client.query(
      'SELECT movements FROM users WHERE username = $1 FOR UPDATE',
      [receiverUsername]
    );

    if (senderRes.rows.length === 0 || receiverRes.rows.length === 0) {
      throw { status: 404, message: 'Sender or receiver not found' };
    }

    // Compute sender balance
    const senderMovs = senderRes.rows[0].movements || [];
    const balance = senderMovs.reduce((sum, m) => sum + parseFloat(m), 0);
    if (balance < amount) {
      throw { status: 400, message: 'Insufficient funds' };
    }

    const now = new Date().toISOString();
    // Subtract from sender
    await client.query(
      `UPDATE users
         SET movements = array_append(movements, $1),
             movements_dates = array_append(movements_dates, $2)
       WHERE username = $3`,
      [ -amount, now, senderUsername ]
    );
    // Add to receiver
    await client.query(
      `UPDATE users
         SET movements = array_append(movements, $1),
             movements_dates = array_append(movements_dates, $2)
       WHERE username = $3`,
      [  amount, now, receiverUsername ]
    );

    await client.query('COMMIT');
    res.json({ message: 'Transfer successful' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Transfer error:', err);
    res
      .status(err.status || 500)
      .json({ error: err.message || 'Internal server error' });
  }
});

// POST /loan
// Body: { username, amount }
app.post('/loan', async (req, res) => {
  const { username, amount } = req.body;

  // Basic validation
  if (!username || typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  try {
    // Start transaction
    await client.query('BEGIN');

    // Lock user row
    const userRes = await client.query(
      'SELECT movements FROM users WHERE username = $1 FOR UPDATE',
      [username]
    );
    if (userRes.rows.length === 0) {
      throw { status: 404, message: 'User not found' };
    }

    // Check loan eligibility: any deposit ≥ 10% of requested amount
    const movs = userRes.rows[0].movements || [];
    const eligible = movs.some(mov => mov >= amount * 0.1);
    if (!eligible) {
      throw { status: 400, message: 'Loan not approved' };
    }

    // Append loan movement and date
    const now = new Date().toISOString();
    await client.query(
      `UPDATE users
         SET movements = array_append(movements, $1),
             movements_dates = array_append(movements_dates, $2)
       WHERE username = $3`,
      [amount, now, username]
    );

    await client.query('COMMIT');
    // Return updated user
    const updated = await client.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );
    res.json(updated.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Loan error:', err);
    res
      .status(err.status || 500)
      .json({ error: err.message || 'Internal server error' });
  }
});


// DELETE /users
// Body: { username, pin }
app.delete('/users', async (req, res) => {
  const { username, pin } = req.body;

  // Validate
  if (!username || typeof pin !== 'number') {
    return res.status(400).json({ error: 'Invalid input' });
  }

  try {
    // Verify user exists & PIN matches
    const userRes = await client.query(
      'SELECT pin FROM users WHERE username = $1',
      [username]
    );
    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (userRes.rows[0].pin !== pin) {
      return res.status(401).json({ error: 'Incorrect pin' });
    }

    // Delete
    await client.query(
      'DELETE FROM users WHERE username = $1',
      [username]
    );

    return res.sendStatus(204);
  } catch (err) {
    console.error('Delete error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});



// Start the server
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
