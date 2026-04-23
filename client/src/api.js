const base = "http://localhost:3000";

const register = async (username, email, password) => {
    try {
        const response = await fetch(`${base}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'},
                body: JSON.stringify({ username, email, password})
        })
        const data = await response.json();

        if (!response.ok) {                     // ← catches 4xx and 5xx errors
      throw new Error(data.error);
    }
        return data; 
                                   // ← returns the user object
    } catch (err) {
    console.error('Register failed:', err.message);
    throw err;
  }

};

export { register }; // ← export it

