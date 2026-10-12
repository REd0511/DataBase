const esc2 = (s) => String(s ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
document.addEventListener('DOMContentLoaded', () => {
  const u=JSON.parse(localStorage.getItem('user') || 'null');
  if(!u || u.role!=='admin'){ alert('Please login as Admin'); location.href='/views/login.html'; return; }
  document.getElementById('search').onclick=load; load();
});
async function load(){
  const id=document.getElementById('memberId').value, box=document.getElementById('results');
  box.innerHTML='Loading member points from database...';
  try {
    const [members,rewards]=await Promise.all([
      fetch('/api/members').then(readJSON), fetch('/api/rewards').then(readJSON)
    ]);
    const selected=id ? members.filter(m=>Number(m.MemberID)===Number(id)) : members;
    const rows=await Promise.all(selected.map(async m=>{
      const p=await fetch(`/api/members/${m.MemberID}/points`).then(readJSON);
      const balance=Number(p.Balance || 0), next=[...rewards].sort((a,b)=>Number(a.PointCost)-Number(b.PointCost)).find(r=>Number(r.PointCost)>balance);
      return {...m, Earned:Number(p.TotalEarned||0), Redeemed:Number(p.TotalRedeemed||0), Balance:balance, NextReward:next||null, PointsNeeded:next?Number(next.PointCost)-balance:0};
    }));
    box.innerHTML=`<table><thead><tr><th>Member</th><th>Level</th><th>Earned</th><th>Redeemed</th><th>Balance</th><th>Next Reward</th><th>Points Needed</th></tr></thead><tbody>${rows.map(m=>`<tr><td>${esc2(m.Name)}</td><td>${esc2(m.MemberLevel)}</td><td>${m.Earned}</td><td>${m.Redeemed}</td><td class="balance">${m.Balance}</td><td>${m.NextReward?esc2(m.NextReward.Name):'All rewards available'}</td><td>${m.PointsNeeded}</td></tr>`).join('') || '<tr><td colspan="7">No members found.</td></tr>'}</tbody></table><h3>Reward Catalog</h3><div class="reward-list">${rewards.map(x=>`<div class="reward-card"><span class="category">${esc2(x.Category)}</span><h3>${esc2(x.Name)}</h3><p class="points">${x.PointCost} pts</p></div>`).join('')}</div>`;
  }catch(e){box.innerHTML=`<p class="api-error">API error: ${esc2(e.message)}</p>`;}
}
async function readJSON(r){const d=await r.json();if(!r.ok)throw new Error(d.message||d.sqlMessage||`HTTP ${r.status}`);return d;}
