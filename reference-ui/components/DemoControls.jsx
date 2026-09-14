import React from 'react';
import {Link,useNavigate} from 'react-router-dom';
import {useStore} from '../lib/store';
import {useDemo} from '../../components/tovant/context';

export default function DemoControls(){
  const {login}=useStore();
  const demo=useDemo();
  const navigate=useNavigate();
  return (
    <details className="reference-demo-controls">
      <summary>Demo controls</summary>
      <div>
        <label>
          Business
          <select
            aria-label="Demo business"
            value={demo.providerId}
            onChange={e=>{
              const p=demo.state.providers.find(p=>p.id===e.target.value);
              login({role:'provider',shopId:p.id,shop:p.name,name:'Demo provider',email:p.id+'@example.com'});
              navigate('/dashboard');
            }}
          >
            {demo.state.providers.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </label>
        <label>
          Customer
          <select
            aria-label="Demo customer"
            value={demo.customerId}
            onChange={e=>{
              const c=demo.state.customers.find(c=>c.id===e.target.value);
              demo.setCustomerId(c.id);
              login({role:'owner',...c});
              navigate('/jobs');
            }}
          >
            {demo.state.customers.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
        <p>Sample profiles. Changes are saved to your private demo.</p>
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          <Link to="/work/guide">Workflow guide →</Link>
          <button
            type="button"
            className="reference-demo-reset"
            disabled={demo.busy}
            onClick={()=>demo.requestReset()}
          >
            Reset demo…
          </button>
        </div>
      </div>
    </details>
  );
}
