import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig, "hz-sync");
const auth = getAuth(app);
const db = getFirestore(app);

const KEY = "hz_sync_code";
const ENABLED = "hz_sync_enabled";
const DELETED = "hz_deleted_invoices";

export const HZSync = {
  enabled: localStorage.getItem(ENABLED) === "1",
  busy: false,
  printing: false,
  get code(){ return localStorage.getItem(KEY) || ""; },
  setCode(v){ localStorage.setItem(KEY, String(v || "").trim()); },
  deleted(){
    try { return JSON.parse(localStorage.getItem(DELETED) || "[]").map(String); }
    catch { return []; }
  },
  enable(v=true){ this.enabled=!!v; localStorage.setItem(ENABLED, v ? "1":"0"); },
  room(){
    const v=this.code.trim();
    return v ? v.replace(/[^a-zA-Z0-9_-]/g,"_").slice(0,80) : null;
  },
  async login(){ return auth.currentUser || (await signInAnonymously(auth)).user; },
  localInvoices(){
    try {
      const v=JSON.parse(localStorage.getItem("hz_invoices") || "[]");
      return Array.isArray(v) ? v : [];
    } catch { return []; }
  },
  async sync(){
    if(!this.enabled || this.busy || this.printing || !this.room()) return;
    this.busy=true;
    try{
      await this.login();
      const ref=doc(db,"hz_sync",this.room());
      const snap=await getDoc(ref);
      const cloud=snap.exists()?snap.data():{};
      const deleted=new Set(this.deleted());
      const map=new Map();
      for(const x of (Array.isArray(cloud.invoices)?cloud.invoices:[]))
        if(x?.id!=null && !deleted.has(String(x.id))) map.set(String(x.id),x);
      for(const x of this.localInvoices())
        if(x?.id!=null && !deleted.has(String(x.id))) map.set(String(x.id),x);
      const invoices=[...map.values()];
      localStorage.setItem("hz_invoices",JSON.stringify(invoices));
      await setDoc(ref,{invoices,deletedInvoices:[...deleted],updatedAt:Date.now()},{merge:true});
      return invoices;
    } finally {
      this.busy=false;
    }
  },
  async deleteInvoice(id){
    const sid=String(id);
    const deleted=new Set(this.deleted());
    deleted.add(sid);
    localStorage.setItem(DELETED,JSON.stringify([...deleted]));
    localStorage.setItem("hz_invoices",JSON.stringify(this.localInvoices().filter(x=>String(x?.id)!==sid)));
    if(!this.enabled || !this.room()) return;
    while(this.busy || this.printing) await new Promise(r=>setTimeout(r,300));
    this.busy=true;
    try{
      await this.login();
      const ref=doc(db,"hz_sync",this.room());
      const snap=await getDoc(ref);
      const cloud=snap.exists()?snap.data():{};
      const invoices=(Array.isArray(cloud.invoices)?cloud.invoices:[]).filter(x=>String(x?.id)!==sid);
      await setDoc(ref,{invoices,deletedInvoices:[...deleted],updatedAt:Date.now()},{merge:true});
    } finally { this.busy=false; }
  }
};

window.HZSync=HZSync;
