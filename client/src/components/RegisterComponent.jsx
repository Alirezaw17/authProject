import { useState, useEffect } from 'react';
import { register } from '../api';

function RegisterComponent() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [status, setStatus] = useState(null);
  const [message, setMessage] = useState('');
  const [registeredUser, setRegisteredUser] = useState(null);

  // runs automatically when a user successfully registers
  useEffect(() => {
    if (registeredUser) {
      console.log('New user registered:', registeredUser);
      // here you could redirect, store in context, etc.
    }
  }, [registeredUser]);



  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value }); // setForm always expects an object because we created it like this in the beginning
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      const user = await register(form.username, form.email, form.password);
      setRegisteredUser(user);        // ← triggers useEffect
      setStatus('success');
      setMessage(`Welcome, ${user.username}! Account created.`);
      setForm({ username: '', email: '', password: '' });
    } catch (err) {
      setStatus('error');
      setMessage(err.message);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f2f5', fontFamily: 'sans-serif' }}>
      <div style={{ backgroundColor: '#fff', padding: '2.5rem', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', width: '100%', maxWidth: '420px' }}>
        
        <h2 style={{ margin: '0 0 0.25rem', fontSize: '1.75rem' }}>Create Account</h2>
        <p style={{ margin: '0 0 1.75rem', color: '#666' }}>Fill in your details to register</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontWeight: '600', fontSize: '0.875rem' }}>Username</label>
            <input
              type="text"
              name="username"
              placeholder="Enter your username"
              value={form.username}
              onChange={handleChange}
              required
              style={{ padding: '0.65rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontWeight: '600', fontSize: '0.875rem' }}>Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              required
              style={{ padding: '0.65rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontWeight: '600', fontSize: '0.875rem' }}>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              required
              style={{ padding: '0.65rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' }}
            />
          </div>

          <button
            type="submit"
            disabled={status === 'loading'}
            style={{ padding: '0.75rem', backgroundColor: status === 'loading' ? '#a5a3f0' : '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: '600', cursor: status === 'loading' ? 'not-allowed' : 'pointer' }}
          >
            {status === 'loading' ? 'Registering...' : 'Register'}
          </button>

          {status === 'success' && (
            <p style={{ color: '#16a34a', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '0.65rem', borderRadius: '8px', margin: 0 }}>
              {message}
            </p>
          )}
          {status === 'error' && (
            <p style={{ color: '#dc2626', backgroundColor: '#fef2f2', border: '1px solid #fecaca', padding: '0.65rem', borderRadius: '8px', margin: 0 }}>
              {message}
            </p>
          )}

        </form>
      </div>
    </div>
  );
}

export { RegisterComponent };