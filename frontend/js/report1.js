const esc = (s) => String(s ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
document.addEventListener('DOMContentLoaded', () => {
  const u = JSON.parse(localStorage.getItem('user') || 'null');
  if (!u || u.role !== 'admin') { alert('Please login as Admin'); location.href='/views/login.html'; return; }
  document.getElementById('date').value = new Date().toISOString().slice(0,10);
  document.getElementById('search').onclick = search;
  search();
});
async function search() {
  const date=document.getElementById('date').value, startTime=document.getElementById('start').value, endTime=document.getElementById('end').value;
  if (!date || !startTime || !endTime || endTime <= startTime) { alert('Please choose a date and ensure End time is after Start time'); return; }
  const box=document.getElementById('results'); box.innerHTML='<p>Loading availability from database...</p>';
  try {
    const q=new URLSearchParams({date,startTime,endTime});
    const [rooms,equipment,trainers]=await Promise.all([
      fetch(`/api/rooms/available?${q}`).then(checkJSON),
      fetch(`/api/equipments/available?${q}`).then(checkJSON),
      fetch(`/api/trainers/available?${q}`).then(checkJSON)
    ]);
    box.innerHTML = section('Available Rooms', rooms, x => `<p>Capacity: ${esc(x.Capacity ?? '-')}</p><p>Studio: ${esc(x.StudioLocation ?? x.Location ?? '-')}</p>`, x=>x.RoomName || `Room ${x.RoomID}`)
      + section('Available Equipment', equipment, x=>`<p>Condition: ${esc(x.Condition ?? '-')}</p><p>Quantity: ${esc(x.Quantity ?? '-')}</p>`, x=>x.Name || x.EquipmentName || `Equipment ${x.EquipmentID}`)
      + section('Available Trainers', trainers, x=>`<p>Sport: ${esc(x.SportName ?? '-')}</p><p>Studio: ${esc(x.StudioLocation ?? '-')}</p>`, x=>x.Name);
  } catch(e) { box.innerHTML=`<p class="api-error">API error: ${esc(e.message)}</p>`; }
}
async function checkJSON(response) { const d=await response.json(); if(!response.ok) throw new Error(d.message || d.sqlMessage || `HTTP ${response.status}`); return d; }
function section(title, rows, extra, name) { return `<h3>${title} (${rows.length})</h3><div class="room-list">${rows.map(x=>`<div class="room-card"><h3>${esc(name(x))}</h3>${extra(x)}</div>`).join('') || '<p>No results for this time.</p>'}</div>`; }
