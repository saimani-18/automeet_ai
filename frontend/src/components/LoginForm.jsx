
import React from 'react';

function LoginForm() {
  return (
    <div style={{
      width: 350,
      background: 'rgba(20,27,45,0.95)',
      padding: 32,
      borderRadius: 12
    }}>
      <h2 style={{ color: '#fff', marginBottom: 12 }}>
        <span role="img" aria-label="robot">🤖</span> AutoMeet AI
      </h2>
      <div style={{ color: '#afafaf', marginBottom: 20 }}>
        Your smart meeting companion
      </div>
      <button style={{
        width: '100%', padding: 12, marginBottom: 10, borderRadius: 8,
        background: '#fff', color: '#141b2d', fontWeight: 600, border: 'none'
      }}>Continue with Google</button>
      <button style={{
        width: '100%', padding: 12, marginBottom: 10, borderRadius: 8,
        background: '#353634', color: '#fff', fontWeight: 600, border: 'none'
      }}>Continue with Microsoft</button>
      <hr style={{ margin: '16px 0', opacity: 0.2 }} />
      <label style={{ color: '#fff', fontSize: 14 }}>Email Address</label>
      <input
        type="email"
        placeholder="Enter your email"
        style={{
          width: '100%', padding: 10, marginBottom: 10, borderRadius: 5,
          border: '1px solid #888', background: '#222', color: '#fff'
        }}
      />
      <label style={{ color: '#fff', fontSize: 14 }}>Password</label>
      <input
        type="password"
        placeholder="Enter your password"
        style={{
          width: '100%', padding: 10, marginBottom: 10, borderRadius: 5,
          border: '1px solid #888', background: '#222', color: '#fff'
        }}
      />
      <div style={{ display: 'flex', fontSize: 12, color: '#bbb', marginBottom: 10 }}>
        <div>
          <input type="checkbox" id="remember" />
          <label htmlFor="remember" style={{ marginLeft: 5, verticalAlign: 'middle' }}>
            Remember me
          </label>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <a href="#" style={{ color: '#58a', textDecoration: 'none' }}>Forgot password?</a>
        </div>
      </div>
      <button style={{
        width: '100%', padding: 12, borderRadius: 8, background: '#468afa',
        color: '#fff', fontWeight: 700, border: 'none', fontSize: 16,
        marginBottom: 12
      }}>Sign In</button>
      <div style={{
        color: '#bbb',
        fontSize: 13,
        textAlign: 'center'
      }}>
        Don't have an account?{' '}
        <a href="#" style={{ color: '#58a', textDecoration: 'none' }}>
          Sign up
        </a>
      </div>
    </div>
  );
}

export default LoginForm;
