const esc3 = (s) => String(s ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
document.addEventListener('DOMContentLoaded', () => {
  const u=JSON.parse(localStorage.getItem('user') || 'null');
  if(!u || u.role!=='admin'){alert('Please login as Admin');location.href='/views/login.html';return;}
  load();
});
async function load(){
  try{
    const [courses,revenue]=await Promise.all([
      fetch('/api/reports/courses').then(readJSON),
      fetch('/api/reports/revenue').then(readJSON)
    ]);
    document.querySelector('#courses tbody').innerHTML=courses.map((c,i)=>`<tr><td>${i+1}</td><td>${esc3(c.Title)}</td><td>${esc3(c.Level)}</td><td>${Number(c.TotalEnrollments||0)}</td><td>฿${Number(c.Revenue||0).toLocaleString()}</td></tr>`).join('') || '<tr><td colspan="5">No course data found.</td></tr>';
    const labels=revenue.map(x=>x.Month).reverse(), values=revenue.map(x=>Number(x.TotalRevenue||0)).reverse();
    const canvas=document.getElementById('courseRevenueChart');
    if(window.Chart && canvas) new Chart(canvas,{type:'bar',data:{labels,datasets:[{label:'Monthly Revenue (THB)',data:values}]},options:{responsive:true}});
  }catch(e){document.querySelector('main').insertAdjacentHTML('beforeend',`<p class="api-error">API error: ${esc3(e.message)}</p>`);}
}
async function readJSON(r){const d=await r.json();if(!r.ok)throw new Error(d.message||d.sqlMessage||`HTTP ${r.status}`);return d;}
