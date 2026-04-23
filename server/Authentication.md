# Generate session:
In terminal:
    node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Why Returning the User After Register is Good
    After registration, your frontend likely needs to:
        - Auto-login the user — redirect them to dashboard without asking them to log in again
        - Show a welcome message — "Welcome, Alireza!"
        - Store user info in React state or context

# PostgreSQL Err
    If someone tries to register with an email that already exists, PostgreSQL itself throws an error with the code 23505 before anything gets inserted.

    {
  code: '23505',               // unique violation
  detail: 'Key (email)=(ali@test.com) already exists.',
  constraint: 'users_email_key',
  table: 'users'
}

HTTP can only transfer text


Passport is a middleware — it sits between the request and your response. Middleware always needs next because:

    If something goes wrong → next(err) passes the error to Express's error handler

    Passport internally uses next to pass control between its own steps
