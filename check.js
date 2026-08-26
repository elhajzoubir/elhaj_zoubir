
(()=>{
const $=id=>document.getElementById(id), R=$("rows"), K="hz_v17";
const N=v=>{let s=String(v??"").trim();if(!s)return 0;const ar="٠١٢٣٤٥٦٧٨٩",fa="۰۱۲۳۴۵۶۷۸۹";s=[...s].map(c=>{let i=ar.indexOf(c);if(i>=0)return String(i);i=fa.indexOf(c);return i>=0?String(i):c}).join("");s=s.replace(/[\u00A0\u202F\s]/g,"").replace(/دج/gi,"").replace(/[^0-9,.-]/g,"");const commas=(s.match(/,/g)||[]).length,dots=(s.match(/\./g)||[]).length;if(commas&&dots){const last=Math.max(s.lastIndexOf(","),s.lastIndexOf("."));s=s.slice(0,last).replace(/[.,]/g,"")+"."+s.slice(last+1).replace(/[^0-9]/g,"")}else if(commas||dots){const sep=commas?",":".";const p=s.split(sep);if(p.length>2)s=p.join("");else if(p.length===2)s=p[1].length===3?p[0]+p[1]:p[0]+"."+p[1]}return Number(s)||0};
const M=v=>Math.round(Number(v)||0).toLocaleString("en-US")+" دج";
const T=()=>new Date().toISOString().slice(0,10);
function msg(s){let t=$("toast");t.textContent=s;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),1600)}
function row(d={}){let r=document.createElement("tr");r.innerHTML='<td><button class="delete">🗑</button></td><td><input class="amount" readonly></td><td><input class="price" type="text" inputmode="decimal"></td><td><input class="weight" type="text" inputmode="decimal"></td><td><input class="boxes" type="text" inputmode="numeric"></td><td><input class="item"></td><td class="rn"></td>';R.appendChild(r);r.querySelector(".price").value=d.price||"";r.querySelector(".weight").value=d.weight||"";r.querySelector(".boxes").value=d.boxes||"";r.querySelector(".item").value=d.item||"";r.querySelector(".delete").onclick=()=>{r.remove();ren();calc()};r.querySelectorAll("input").forEach(i=>i.oninput=calc);ren()}
function ren(){[...R.children].forEach((r,i)=>r.querySelector(".rn").textContent=i+1)}
function calc(){let a=0,w=0,b=0;[...R.children].forEach(r=>{let W=N(r.querySelector(".weight").value),P=N(r.querySelector(".price").value),B=N(r.querySelector(".boxes").value),A=W*P;a+=A;w+=W;b+=B;r.querySelector(".amount").value=A?M(A):""});let e=N($("expenses").value),commission=a*.10,afterCommission=a-commission,net=afterCommission-e;$("amount").textContent=M(a);$("weight").textContent=w.toLocaleString("fr-FR");$("boxes").textContent=b;$("sale").textContent=M(a);$("afterCommission").textContent=M(afterCommission);$("net").textContent=M(net);return{a,w,b,e,commission,afterCommission,net}}
function reset(){R.innerHTML="";for(let i=0;i<5;i++)row();calc()}
function data(){let c=calc();return{id:Date.now(),invoice:$("invoice").value,date:$("date").value,farmer:$("farmer").value,goodsType:$("goodsType").value,goodsCount:$("goodsCount").value,expenses:c.e,amount:c.a,commissionPercent:10,afterCommission:c.afterCommission,weight:c.w,boxes:c.b,net:c.net,rows:[...R.children].map(r=>({price:r.querySelector(".price").value,item:r.querySelector(".item").value,weight:r.querySelector(".weight").value,boxes:r.querySelector(".boxes").value}))}}
function list(){try{return JSON.parse(localStorage.getItem(K)||"[]")}catch(e){return[]}}
function modal(t,b){$("title").textContent=t;$("body").innerHTML=b;$("modal").classList.add("show")}
function close(){$("modal").classList.remove("show")}
function invoices(){let a=list();if(!a.length)return modal("الفواتير","<div class=empty>لا توجد فواتير محفوظة.</div>");let h=a.map((x,i)=>`<div class=item><b>فاتورة ${x.invoice} — ${x.farmer||"بدون اسم"}</b><br><small>${x.date} — ${M(x.amount)}</small><br><button data-open="${i}">فتح</button> <button class=danger data-del="${i}">حذف</button></div>`).join("");modal("الفواتير المحفوظة",h);document.querySelectorAll("[data-open]").forEach(b=>b.onclick=()=>load(a[+b.dataset.open]));document.querySelectorAll("[data-del]").forEach(b=>b.onclick=()=>{a.splice(+b.dataset.del,1);localStorage.setItem(K,JSON.stringify(a));invoices()})}
function load(x){$("invoice").value=x.invoice||"";$("date").value=x.date||T();$("farmer").value=x.farmer||"";$("goodsType").value=x.goodsType||x.goods||"";$("goodsCount").value=x.goodsCount||"";$("expenses").value=x.expenses||0;R.innerHTML="";(x.rows||[]).forEach(row);if(!R.children.length)reset();calc();close();scrollTo(0,0);msg("تم فتح الفاتورة")}
function farmers(){
  let a=list(), m={};
  a.forEach(x=>{
    let f=(x.farmer||"").trim();
    if(f){
      if(!m[f])m[f]={count:0,amount:0,afterCommission:0,expenses:0,net:0,invoices:[]};
      m[f].count++;
      m[f].amount+=N(x.amount);
      m[f].afterCommission+=N(x.afterCommission);
      m[f].expenses+=N(x.expenses);
      m[f].net+=N(x.net);
      m[f].invoices.push(x);
    }
  });
  let names=Object.keys(m).sort((a,b)=>a.localeCompare(b,"ar"));
  let h=names.map((x,i)=>`
    <div class=item>
      <button style="width:100%;border:0;background:none;text-align:right;cursor:pointer"
              data-farmer="${encodeURIComponent(x)}">
        <b>${x}</b><br>
        <small>${m[x].count} فاتورة — الصافي: ${M(m[x].net)}</small>
      </button>
    </div>`).join("");
  modal("حساب الفلاح",h||"<div class=empty>لا توجد أسماء فلاحين محفوظة.</div>");
  document.querySelectorAll("[data-farmer]").forEach(b=>b.onclick=()=>farmerAccount(decodeURIComponent(b.dataset.farmer),m[decodeURIComponent(b.dataset.farmer)]));
}

function farmerAccount(name, info){
  let rows=info.invoices.slice().sort((a,b)=>String(a.date||"").localeCompare(String(b.date||"")));
  let invoiceRows=rows.map(x=>`
    <tr>
      <td>${x.invoice||""}</td>
      <td>${x.date||""}</td>
      <td>${M(x.amount)}</td>
      <td>${M(x.afterCommission)}</td>
      <td>${M(x.expenses)}</td>
      <td><b>${M(x.net)}</b></td>
    </tr>`).join("");

  let b=`
    <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-start;margin-bottom:10px">
      <button class="print-account" style="border:0;border-radius:8px;background:#07833f;color:#fff;padding:10px 14px;font-weight:bold;cursor:pointer">🖨️ طباعة الحساب</button>
      <button data-back-farmers style="border:1px solid #ccc;border-radius:8px;background:#fff;padding:10px 14px;font-weight:bold;cursor:pointer">رجوع</button>
    </div>
    <div class="item" style="text-align:center">
      <div style="font-size:20px;font-weight:800;color:#07833f">اسم الفلاح: ${name}</div>
      <div style="margin-top:5px">إجمالي عدد الفواتير: <b>${info.count}</b></div>
    </div>
    <div class="scroll">
      <table class="farmer-print-table" style="min-width:700px">
        <thead><tr>
          <th>رقم الفاتورة</th><th>التاريخ</th><th>المبلغ الكلي</th>
          <th>بعد نزع العمولة</th><th>المصروف</th><th>الصافي</th>
        </tr></thead>
        <tbody>${invoiceRows}</tbody>
      </table>
    </div>
    <div class="farmer-account-summary">
      <div class=item><b>المبلغ الكلي</b><br><strong>${M(info.amount)}</strong></div>
      <div class=item><b>بعد نزع العمولة</b><br><strong>${M(info.afterCommission)}</strong></div>
      <div class=item><b>المصروف</b><br><strong>${M(info.expenses)}</strong></div>
      <div class=item><b>الصافي</b><br><strong style="color:#07833f">${M(info.net)}</strong></div>
    </div>`;

  modal("حساب الفلاح: "+name,b);

  document.querySelector(".print-account").onclick=()=>{
    document.body.classList.add("farmer-account-print");
    window.print();
  };
  document.querySelector("[data-back-farmers]").onclick=()=>{
    document.body.classList.remove("farmer-account-print");
    farmers();
  };
}


const DEBT_KEY="hz_debts_v29";
function debts(){
  try{return JSON.parse(localStorage.getItem(DEBT_KEY)||"[]")}
  catch(e){return[]}
}
function saveDebts(a){localStorage.setItem(DEBT_KEY,JSON.stringify(a))}
function accountRange(start,end){
  let inv=list().filter(x=>{
    let d=String(x.date||"").slice(0,10);
    return d>=start&&d<=end;
  });
  let ds=debts().filter(x=>x.date>=start&&x.date<=end);
  let total=inv.reduce((s,x)=>s+N(x.amount),0);
  let after=inv.reduce((s,x)=>s+N(x.afterCommission),0);
  let expense=inv.reduce((s,x)=>s+N(x.expenses),0);
  let din=ds.filter(x=>x.type==="in").reduce((s,x)=>s+N(x.amount),0);
  let dout=ds.filter(x=>x.type==="out").reduce((s,x)=>s+N(x.amount),0);
  let net=after-expense+din-dout;
  return {inv,ds,total,after,expense,din,dout,net};
}
function accountSummary(c,label){
  return `<div class=account-report>
    <div class=account-card><b>${label}</b><br>${c.inv.length} فاتورة</div>
    <div class=account-card><b>الحساب الكلي</b><br><strong>${M(c.total)}</strong></div>
    <div class=account-card><b>بعد نزع العمولة</b><br><strong style="color:#1769aa">${M(c.after)}</strong></div>
    <div class=account-card><b>المصروف</b><br><strong style="color:#e22">${M(c.expense)}</strong></div>
    <div class=account-card><b>ديون دخلت</b><br><strong>${M(c.din)}</strong></div>
    <div class=account-card><b>ديون خرجت</b><br><strong>${M(c.dout)}</strong></div>
    <div class="account-card net-card"><b>الصافي</b><br><strong style="color:#07833f">${M(c.net)}</strong></div>
  </div>`;
}
function debtForm(type,back){
  let title=type==="in"?"تسجيل دين دخل":"تسجيل دين خرج";
  modal(title,`<div class=account-report>
    <div class=item><label>اسم الشخص</label><input id=debtName></div>
    <div class=item><label>المبلغ</label><input id=debtAmount inputmode=decimal type=number min=0></div>
    <div class=item><label>التاريخ</label><input id=debtDate type=date value="${T()}"></div>
    <div class=item><label>ملاحظة</label><input id=debtNote></div>
    <button class=primary id=saveDebt>حفظ</button>
    <button id=backDebt style="margin-top:8px">رجوع</button>
  </div>`);
  $("saveDebt").onclick=()=>{
    let amount=N($("debtAmount").value);
    if(amount<=0){msg("أدخل مبلغ الدين");return}
    let a=debts();
    a.unshift({id:Date.now(),type,name:$("debtName").value.trim(),amount,date:$("debtDate").value||T(),note:$("debtNote").value.trim()});
    saveDebts(a);
    msg("تم حفظ الدين");
    back();
  };
  $("backDebt").onclick=back;
}
function debtsTable(ds){
  let rows=ds.map(x=>`<tr>
    <td>${x.date||""}</td><td>${x.name||""}</td>
    <td>${x.type==="in"?"دخل":"خرج"}</td><td>${M(x.amount)}</td><td>${x.note||""}</td>
  </tr>`).join("");
  return `<div class=scroll><table><thead><tr><th>التاريخ</th><th>الاسم</th><th>النوع</th><th>المبلغ</th><th>الملاحظة</th></tr></thead>
  <tbody>${rows||"<tr><td colspan=5>لا توجد ديون مسجلة</td></tr>"}</tbody></table></div>`;
}
function dailyAccount(day=T()){
  let c=accountRange(day,day);
  modal("الحساب اليومي",`${accountSummary(c,"اليوم: "+day)}
    <div class="debt-actions account-no-print">
      <button id=addIn>➕ ديون دخلت</button>
      <button id=addOut>➖ ديون خرجت</button>
    </div>
    <div class=item><label>اختر اليوم</label><input id=accountDay type=date value="${day}"></div>
    <h3>الديون المسجلة لهذا اليوم</h3>${debtsTable(c.ds)}
    <button class=primary id=printDaily style="margin-top:10px">🖨️ طباعة الحساب اليومي</button>`);
  $("accountDay").onchange=()=>dailyAccount($("accountDay").value);
  $("addIn").onclick=()=>debtForm("in",()=>dailyAccount(day));
  $("addOut").onclick=()=>debtForm("out",()=>dailyAccount(day));
  $("printDaily").onclick=()=>{document.body.classList.add("account-print");window.print()};
}
function monthlyAccount(month=new Date().toISOString().slice(0,7)){
  let c=accountRange(month+"-01",month+"-31");
  modal("الحساب الشهري",`${accountSummary(c,"الشهر: "+month)}
    <div class="debt-actions account-no-print">
      <button id=addIn>➕ ديون دخلت</button>
      <button id=addOut>➖ ديون خرجت</button>
    </div>
    <div class=item><label>اختر الشهر</label><input id=accountMonth type=month value="${month}"></div>
    <h3>الديون المسجلة لهذا الشهر</h3>${debtsTable(c.ds)}
    <button class=primary id=printMonthly style="margin-top:10px">🖨️ طباعة الحساب الشهري</button>`);
  $("accountMonth").onchange=()=>monthlyAccount($("accountMonth").value);
  $("addIn").onclick=()=>debtForm("in",()=>monthlyAccount(month));
  $("addOut").onclick=()=>debtForm("out",()=>monthlyAccount(month));
  $("printMonthly").onclick=()=>{document.body.classList.add("account-print");window.print()};
}

const BON_KEY="hz_bons_v1";
function bonList(){try{return JSON.parse(localStorage.getItem(BON_KEY)||"[]")}catch(e){return[]}}
function saveBonList(a){localStorage.setItem(BON_KEY,JSON.stringify(a))}
function bonRow(d={}){
  const tb=$("bonRows"); if(!tb)return;
  const tr=document.createElement("tr");
  tr.innerHTML='<td><button class="bon-del" title="حذف">🗑</button></td>'+
    '<td><input class="bon-amount" readonly></td>'+
    '<td><input class="bon-price" inputmode="decimal" type="text"></td>'+
    '<td><input class="bon-weight" inputmode="decimal" type="text"></td>'+
    '<td><input class="bon-item" type="text"></td>'+
    '<td class="bon-rn"></td>';
  tr.querySelector(".bon-price").value=d.price||"";
  tr.querySelector(".bon-weight").value=d.weight||"";
  tr.querySelector(".bon-item").value=d.item||"";
  tr.querySelector(".bon-del").onclick=()=>{tr.remove();bonRen();bonCalc()};
  tr.querySelectorAll("input").forEach(i=>i.oninput=bonCalc);
  tb.appendChild(tr);bonRen();bonCalc();
}
function bonRen(){[...($("bonRows")?.children||[])].forEach((r,i)=>r.querySelector(".bon-rn").textContent=i+1)}
function bonCalc(){
  const tb=$("bonRows"); if(!tb)return 0;
  let total=0;
  [...tb.children].forEach(r=>{
    const w=N(r.querySelector(".bon-weight").value), p=N(r.querySelector(".bon-price").value);
    const a=w*p; total+=a;
    r.querySelector(".bon-amount").value=a?M(a):"";
  });
  const el=$("bonTotal"); if(el)el.textContent=M(total);
  return total;
}
function bonResetRows(){
  const tb=$("bonRows"); if(!tb)return;
  tb.innerHTML="";
  for(let i=0;i<6;i++)bonRow();
  bonCalc();
}
function bonFormHTML(){
 return `<div class="bon-panel">
   <div class="bon-toolbar" id="bonEditOnly">
     <button class="bon-clear" id="bonClear">مسح البيانات</button>
     <button class="bon-save" id="bonSave">حفظ الوصل</button>
     <button class="bon-print" id="bonPrint">🖨️ طباعة Bon d’achat</button>
   </div>
   <div class="bon-card" id="bonCard">
     <div class="bon-head">
       <div class="bon-logo"><img src="logo_invoice.png" alt="الحاج الزوبير"></div>
       <div class="bon-title"><h1>Bon d’achat</h1><div class="orn">━━ ✦ ━━</div></div>
       <div class="bon-info">
         <div class="bi"><label>اسم الزبون:</label><input id="bonCustomer"></div>
         <div class="bi"><label>التاريخ:</label><input id="bonDate" type="date"></div>
       </div>
     </div>
     <div class="bon-table-wrap">
       <table class="bon-table">
         <colgroup><col style="width:7%"><col style="width:14%"><col style="width:18%"><col style="width:24%"><col style="width:25%"><col style="width:12%"></colgroup>
         <thead><tr>
           <th>إجراءات</th><th>المبلغ<small>Montant</small></th><th>السعر<small>Prix</small></th><th>الميزان<small>Poids</small></th><th>نوع السلعة<small>Type de marchandise</small></th><th>الكمية<small>Quantité</small></th>
         </tr></thead>
         <tbody id="bonRows"></tbody>
       </table>
       <button class="bon-add" id="bonAdd">＋ إضافة سطر</button>
     </div>
     <div class="bon-bottom">
       <div class="bon-thanks">شكراً لتعاملكم معنا<br><span>━━ ✦ ━━</span></div>
       <div class="bon-total"><b>المجموع / Total :</b><strong id="bonTotal">0 دج</strong></div>
     </div>
   </div>
 </div>`;
}
function bonAchat(){
  modal("Bon d'achat - الحاج الزوبير",bonFormHTML());
  $("bonDate").value=T();
  bonResetRows();
  $("bonAdd").onclick=()=>bonRow();
  $("bonClear").onclick=()=>{if(confirm("مسح بيانات الوصل؟")){bonClearFields();}};
  $("bonSave").onclick=bonSave;
  $("bonPrint").onclick=bonPrint;
}
function bonClearFields(){
  $("bonCustomer").value=""; $("bonDate").value=T();
  bonResetRows(); msg("تم مسح بيانات الوصل");
}
function bonData(){
  return {id:Date.now(),customer:$("bonCustomer").value.trim(),date:$("bonDate").value||T(),
    total:bonCalc(),rows:[...($("bonRows")?.children||[])].map(r=>({
      item:r.querySelector(".bon-item").value,weight:r.querySelector(".bon-weight").value,price:r.querySelector(".bon-price").value
    }))};
}
function bonSave(){
  const x=bonData(), a=bonList(); a.unshift(x); saveBonList(a); msg("تم حفظ الوصل");
}
function bonPrint(){
  bonCalc();
  document.body.classList.add("bon-printing");
  setTimeout(()=>window.print(),50);
}

function accounts(){
  modal("الحسابات",`<div class=account-report>
    <button class=primary id=goDaily style="width:100%;padding:14px;margin-bottom:8px">📅 الحساب اليومي</button>
    <button class=primary id=goMonthly style="width:100%;padding:14px;margin-bottom:8px">🗓️ الحساب الشهري</button>
    <button id=goDebtIn style="width:100%;padding:14px;margin-bottom:8px">➕ تسجيل دين دخل</button>
    <button id=goDebtOut style="width:100%;padding:14px">➖ تسجيل دين خرج</button>
    <div class=item style="margin-top:12px">الديون المسجلة هنا تدخل تلقائياً في الحساب اليومي والحساب الشهري.</div>
  </div>`);
  $("goDaily").onclick=()=>dailyAccount();
  $("goMonthly").onclick=()=>monthlyAccount();
  $("goDebtIn").onclick=()=>debtForm("in",accounts);
  $("goDebtOut").onclick=()=>debtForm("out",accounts);
}
function stats(){let a=list();modal("الإحصائيات",`<div class=item>عدد الفواتير: <b>${a.length}</b></div><div class=item>إجمالي المبيعات: <b>${M(a.reduce((s,x)=>s+N(x.amount),0))}</b></div><div class=item>إجمالي الوزن: <b>${a.reduce((s,x)=>s+N(x.weight),0).toLocaleString("fr-FR")} كغ</b></div><div class=item>إجمالي الصافي: <b>${M(a.reduce((s,x)=>s+N(x.net),0))}</b></div>`)}
function settings(){modal("الإعدادات",'<div class=item><b>نسبة الوكيل</b><br>10%</div><div class=item><b>المحل</b><br>31 — خميس الخشنة</div><button class=danger id=clear>حذف جميع الفواتير</button>');$("clear").onclick=()=>{if(confirm("حذف جميع الفواتير؟")){localStorage.removeItem(K);close();msg("تم الحذف")}}}
$("date").value=T();reset();$("add").onclick=()=>row();$("expenses").oninput=calc;
$("save").onclick=()=>{let x=data();if(!x.farmer){msg("أدخل اسم الفلاح");$("farmer").focus();return}let a=list();a.unshift(x);localStorage.setItem(K,JSON.stringify(a));msg("تم حفظ الفاتورة")};
$("new").onclick=()=>{$("invoice").value=String(N($("invoice").value)+1).padStart(4,"0");$("date").value=T();$("farmer").value="";$("goodsType").value="";$("goodsCount").value="";$("expenses").value="0";reset();scrollTo(0,0);msg("فاتورة جديدة")};
$("pdf").onclick=()=>{calc();setTimeout(()=>window.print(),50)};
$("close").onclick=close;$("modal").onclick=e=>{if(e.target===$("modal"))close()};
window.onafterprint=()=>{document.body.classList.remove("farmer-account-print");document.body.classList.remove("account-print");document.body.classList.remove("bon-printing")};
document.querySelectorAll(".bottom button").forEach(b=>b.onclick=()=>{document.querySelectorAll(".bottom button").forEach(x=>x.classList.remove("on"));b.classList.add("on");let p=b.dataset.p;if(p==="home"){close();scrollTo(0,0)}if(p==="invoices")invoices();if(p==="bon")bonAchat();if(p==="farmers")farmers();if(p==="stats")accounts();if(p==="settings")settings()});
})();
