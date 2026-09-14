import React from 'react';
import { Link } from 'react-router-dom';
import { Field, Pill } from '../components/primitives.jsx';
import AuthFrame from '../components/AuthFrame.jsx';

export default function ResetPassword() {
  const [email, setEmail] = React.useState('');
  const [checked, setChecked] = React.useState(false);
  const [err, setErr] = React.useState('');

  const submit = (e) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) return setErr('Enter a valid email address.');
    setErr('');
    setChecked(true);
  };

  return (
    <AuthFrame
      title={checked ? 'Password reset is not live in this demo' : 'Reset the password'}
      lead={checked
        ? `No email was sent to ${email}. This demo does not deliver reset links. Use Demo controls or a sample sign-in on the login page to keep exploring.`
        : 'Password reset email is not wired in this demo. You can still check the form, then return to sample sign-in.'}
      asideTitle="Same account for cars and shops."
      asideBody="A real reset would cover the login. Owner tools and shop tools stay attached to the same email."
      asideStats={[['Demo', 'NO EMAIL'], ['Sample', 'SIGN IN'], ['Pilot', 'TWIN CITIES']]}
    >
      {!checked && (
        <form onSubmit={submit}>
          <div style={{ marginTop: 28 }}>
            <Field label="EMAIL" value={email} onChange={setEmail} type="email" placeholder="you@example.com" />
          </div>
          {err && <div style={{ marginTop: 14, font: '600 12.5px/1.4 var(--tv-font)', color: '#8A2C1B' }}>{err}</div>}
          <Pill variant="accent" type="submit" style={{ width: '100%', marginTop: 22, padding: 17, fontSize: 14.5 }}>Check this form</Pill>
        </form>
      )}
      <p className="tv-small" style={{ marginTop: 22 }}>
        <Link to="/login" style={{ font: '600 12.5px/1 var(--tv-font)', color: 'var(--tv-accent-link)' }}>Back to sign in</Link>
      </p>
    </AuthFrame>
  );
}
