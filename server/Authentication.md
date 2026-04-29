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




























# Sessions in Express:

- Note Session data is not saved in the cookie itself, just the session ID
- The default server-side session storage, MemoryStore, is purposely not designed for a production environment. It will leak memory under most conditions, does not scale past a single process, and is meant for debugging and developing.

- A session is "uninitialized" when it's brand new and nothing has been added to it yet.

    User visits your site (not logged in)
    → express-session creates an empty req.session = {}
    → saveUninitialized: false → DON'T save it (it's empty, why bother?)
    → saveUninitialized: true  → save it anyway (wastes memory/storage)

- The secret in express-session is used to digitally sign the session ID cookie. This prevents users from faking or tampering with their session cookie

    Without signing: cookie = "abc123"          ← anyone can guess/fake this
    With signing:    cookie = "abc123.xK9mP..."  ← tampered? server rejects it ✅

- What Each Cookie Option Means

    cookie: {
        path: '/',        // which URL paths the cookie is sent to
        httpOnly: true,   // JS in browser CANNOT read this cookie (XSS protection)
        secure: false,    // only send cookie over HTTPS (false = HTTP allowed too)
        maxAge: 60000     // cookie expires after 60 seconds (60000 ms)
        }

        HTTP  request → secure: false → cookie is sent ✅ (but risky)
        HTTPS request → secure: true  → cookie only sent over HTTPS ✅






## What is a Reverse Proxy?

    - In production, your Express app is almost never exposed directly to the internet. There's always a middleman like Nginx or a cloud platform (Heroku, Railway, Render) sitting in front:

    User (HTTPS) → Nginx/Cloud → (HTTP) → Your Express App
              [Reverse Proxy]

    - You have cookie: { secure: true } which means:
        "Only send this cookie over HTTPS"

    - But Express sees the request arriving as HTTP -> 
        Express: "This request is HTTP, not HTTPS → I refuse to set the secure cookie
    
    - The cookie never gets sent, and users can't log in in productio

    - The Fix — trust proxy: 1
        app.set('trust proxy', 1) // trust first proxy
        This tells Express: "Hey, trust the X-Forwarded-Proto header from the first proxy in front of me". Nginx adds this header: X-Forwarded-Proto: https  ← "the original request came in as HTTPS"

                                                User
                                        │  HTTPS request
                                        ▼
                                        Nginx (Reverse Proxy)
                                        │  Adds header: X-Forwarded-Proto: https
                                        │  Forwards as HTTP internally
                                        ▼
                                        Express App
                                        │  app.set('trust proxy', 1)
                                        │  → reads X-Forwarded-Proto: https
                                        │  → req.secure = true ✅
                                        │  → sets secure cookie ✅
                                        ▼
                                        Browser receives session cookie 🎉




## What is the "Session Store"?

The session store is simply where session data lives on the server. It's the place Express reads from and writes to when managing sessions:

    Browser sends: cookie = "s3f9a..."
                    ↓
    Express looks up "s3f9a..." in the SESSION STORE
                    ↓
    Finds: { userId: 5, email: "ali@..." }  ← that's the stored session data

    - The store can be:
    MemoryStore → RAM (default, dev only)
    connect-pg-simple → your PostgreSQL DB
    Redis → dedicated in-memory store (production)


## Expiry timer in session setting:

    Some session stores auto-delete sessions after a period of inactivity (like a 1-day expiry). The store needs to know: "Is this session still being actively used?"

    1. touch() -> resave: fasle
        User makes a request
        → Session loaded from store
        → Store calls touch() → "this session is still alive, reset the timer"
        → No need to re-save the whole session object
        

    2. resave: true

        User makes a request (nothing changed)
        → Store has no touch() method
        → resave: true → force re-save the whole session anyway
        → Store sees the update → resets expiry timer ✅


    3. The Race Condition Problem with resave: true

        User opens 2 tabs, both send requests simultaneously:
        Request A: modifies session → { user: ali, theme: dark }
        Request B: no changes      → re-saves OLD session → { user: ali }
                                                            ↑ overwrites A's changes ❌
        With resave: false, Request B does nothing → no overwrite ✅

    4. touch is lightweight adn quicker than resaving everything.


## signing session ID coockie:

    - The session ID in the cookie is just a random string like: s3f9a7b2c...
    - Without signing, a malicious user could open their browser DevTools, edit the cookie, and change it to someone else's session ID

            Original:  connect.sid = s3f9a7b2c   (Ali's session)
            Tampered:  connect.sid = x9k2m1p4   (Admin's session 😈)

    - The server would have no way to know the cookie was faked. The attacker just became the admin.
    - When Express signs the session ID, it takes the ID and runs it through a cryptographic function using your secret:
        session ID  +  secret key  →  signature
        "s3f9a..."  +  "keyboard cat"  →  "xK9mP3..."

    - When the browser sends the cookie back, the server:
        Splits it into sessionID and signature
        Re-runs the same cryptographic function: sessionID + secret → expected signature

    