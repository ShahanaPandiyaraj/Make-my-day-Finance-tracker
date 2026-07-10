 import React, { useState, useEffect, useMemo, useRef } from "react";
 import "./App.css";
 
 // ========== CONSTANTS ==========
 const CATEGORIES = ["Food", "Transport", "Shopping", "Bills", "Health", "Entertainment", "Salary", "Other"];
 const BUDGETS_DEFAULT = { Food: 8000, Transport: 3000, Shopping: 5000, Bills: 4000, Health: 2000, Entertainment: 3000 };
 const CAT_COLORS = { Food: "#1D9E75", Transport: "#378ADD", Shopping: "#D85A30", Bills: "#BA7517", Health: "#D4537E", Entertainment: "#7F77DD", Salary: "#639922", Other: "#888780" };
 const CAT_BG = { Food: "#E1F5EE", Transport: "#E6F1FB", Shopping: "#FAECE7", Bills: "#FAEEDA", Health: "#FBEAF0", Entertainment: "#EEEDFE", Salary: "#EAF3DE", Other: "#F1EFE8" };
 const CAT_ICONS = { Food: "🍴", Transport: "🚌", Shopping: "🛍️", Bills: "💡", Health: "💊", Entertainment: "🎬", Salary: "💰", Other: "📌" };
 const CAT_KEYWORDS = {
   Food: ["food","lunch","dinner","breakfast","swiggy","zomato","restaurant","hotel","coffee","tea","snack","eat","biryani","rice","meal","canteen","mess","grocery","vegetables","fruit","milk","bread","bakery","juice","biscuit","idli","dosa","chapati"],
   Transport: ["bus","auto","cab","uber","ola","petrol","diesel","bike","train","metro","travel","fare","ticket","fuel","car","ride","rapido","flight","taxi","toll","parking"],
   Shopping: ["amazon","flipkart","shopping","clothes","shirt","dress","shoes","buy","purchase","market","mall","online","myntra","meesho","jeans","bag","watch","mobile","laptop"],
   Bills: ["electricity","bill","recharge","wifi","internet","water","gas","rent","emi","insurance","mobile","phone","broadband","tax","maintenance","subscription"],
   Health: ["medicine","doctor","hospital","pharmacy","clinic","medical","health","tablet","injection","test","lab","dental","gym","fitness","apollo","diagnostic","blood"],
   Entertainment: ["movie","netflix","spotify","youtube","game","cricket","theatre","concert","show","hotstar","prime","fun","park","outing","trip","vacation"],
   Salary: ["salary","wage","income","payment","received","bonus","stipend","freelance","profit","earn","credit","deposit","commission"],
 };
 
 function autoCategory(desc) {
   const lower = desc.toLowerCase();
   for (const [cat, keywords] of Object.entries(CAT_KEYWORDS)) {
     if (keywords.some(k => lower.includes(k))) return cat;
   }
   return "Other";
 }
 
 // ========== HELPERS ==========
 function fmt(n) { return "₹" + Math.round(Math.abs(n)).toLocaleString("en-IN"); }
 function formatDate(d) { return new Date(d + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }); }
 function getInitials(name) { return name.trim().split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2); }
 function getGreeting() { const h = new Date().getHours(); return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening"; }
 const EMPTY_FORM = { desc: "", amt: "", type: "expense", cat: "Food", date: new Date().toISOString().split("T")[0] };
 
 // ========== SPLASH SCREEN ==========
 function SplashScreen() {
   return (
     <div className="splash">
       <div className="splash-content">
         <div className="splash-icon">☀️</div>
         <h1 className="splash-title">Make My Day</h1>
         <p className="splash-sub">Your personal finance companion</p>
         <div className="splash-loader"><div className="splash-bar" /></div>
       </div>
     </div>
   );
 }
 
 // ========== PIN PAD ==========
 function PinPad({ title, subtitle, onComplete, error, resetKey }) {
   const [pin, setPin] = useState("");
   useEffect(() => { setPin(""); }, [resetKey]);
   function press(val) {
     if (val === "del") { setPin(p => p.slice(0, -1)); return; }
     if (pin.length >= 4) return;
     const next = pin + val;
     setPin(next);
     if (next.length === 4) { setTimeout(() => { onComplete(next); setPin(""); }, 200); }
   }
   return (
     <div className="pin-wrap">
       {title && <div className="pin-title">{title}</div>}
       {subtitle && <div className="pin-subtitle">{subtitle}</div>}
       <div className="pin-dots">{[0,1,2,3].map(i => <div key={i} className={`pin-dot${pin.length > i ? " filled" : ""}`} />)}</div>
       {error && <div className="pin-error">{error}</div>}
       <div className="pin-grid">
         {["1","2","3","4","5","6","7","8","9","","0","del"].map((k, i) => (
           <button key={i} className={`pin-key${k === "" ? " empty" : ""}${k === "del" ? " del" : ""}`} onClick={() => k !== "" && press(k)} disabled={k === ""}>
             {k === "del" ? "⌫" : k}
           </button>
         ))}
       </div>
     </div>
   );
 }
 
 // ========== LOGIN PAGE ==========
 function LoginPage({ onLogin, darkMode }) {
   const [users, setUsers] = useState(() => { try { return JSON.parse(localStorage.getItem("mmd_users") || "[]"); } catch { return []; } });
   const [screen, setScreen] = useState("home");
   const [name, setName] = useState("");
   const [selectedUser, setSelectedUser] = useState(null);
   const [newPin, setNewPin] = useState("");
   const [pinError, setPinError] = useState("");
   const [resetKey, setResetKey] = useState(0);
 
   function saveUsers(updated) { localStorage.setItem("mmd_users", JSON.stringify(updated)); setUsers(updated); }
   function handleRegister() {
     if (!name.trim()) { alert("Please enter your name!"); return; }
     if (users.find(u => u.name.toLowerCase() === name.trim().toLowerCase())) { alert("Name already taken!"); return; }
     setPinError(""); setScreen("newpin");
   }
   function handleNewPin(pin) { setNewPin(pin); setPinError(""); setScreen("confirmpin"); }
   function handleConfirmPin(pin) {
     if (pin !== newPin) { setPinError("PINs don't match! Try again."); setScreen("newpin"); setNewPin(""); return; }
     const newUser = { id: Date.now(), name: name.trim(), pin };
     saveUsers([...users, newUser]); onLogin(newUser);
   }
   function handleUserSelect(u) { setSelectedUser(u); setPinError(""); setResetKey(k => k + 1); setScreen("pin"); }
   function handlePinEntry(pin) {
     if (pin === selectedUser.pin) { onLogin(selectedUser); }
     else { setPinError("Wrong PIN! Try again."); setResetKey(k => k + 1); }
   }
 
   const dm = darkMode ? " dark" : "";
 
   if (screen === "pin") return (
     <div className={`login-bg${dm}`}><div className={`login-card${dm}`}>
       <button className="back-btn" onClick={() => setScreen("home")}>← Back</button>
       <div className="login-header">
         <div className="login-avatar">{getInitials(selectedUser.name)}</div>
         <h2 className="login-name">{selectedUser.name}</h2>
         <p className="login-tagline">Enter your PIN</p>
       </div>
       <PinPad onComplete={handlePinEntry} error={pinError} resetKey={resetKey} />
     </div></div>
   );
 
   if (screen === "newpin") return (
     <div className={`login-bg${dm}`}><div className={`login-card${dm}`}>
       <button className="back-btn" onClick={() => setScreen("register")}>← Back</button>
       <PinPad title="Create your PIN" subtitle="Choose a 4-digit PIN" onComplete={handleNewPin} error={pinError} resetKey={resetKey} />
     </div></div>
   );
 
   if (screen === "confirmpin") return (
     <div className={`login-bg${dm}`}><div className={`login-card${dm}`}>
       <button className="back-btn" onClick={() => { setScreen("newpin"); setNewPin(""); setPinError(""); }}>← Back</button>
       <PinPad title="Confirm your PIN" subtitle="Enter the same PIN again" onComplete={handleConfirmPin} error={pinError} resetKey={resetKey} />
     </div></div>
   );
 
   if (screen === "register") return (
     <div className={`login-bg${dm}`}><div className={`login-card${dm}`}>
       <button className="back-btn" onClick={() => setScreen("home")}>← Back</button>
       <div className="login-header">
         <div className="login-logo-icon">☀️</div>
         <h1 className="login-app-name">Create Account</h1>
         <p className="login-tagline">Enter your name to get started</p>
       </div>
       <div className="login-form">
         <label className="login-label">Your Name</label>
         <input className={`login-input${dm}`} type="text" placeholder="e.g. Shahana" value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === "Enter" && handleRegister()} autoFocus />
         <button className="login-btn" onClick={handleRegister}>Next — Set PIN →</button>
       </div>
     </div></div>
   );
 
   return (
     <div className={`login-bg${dm}`}>
       <div className={`login-card${dm}`}>
         <div className="login-header">
           <div className="login-logo-icon">☀️</div>
           <h1 className="login-app-name">Make My Day</h1>
           <p className="login-tagline">Your personal finance companion</p>
         </div>
         {users.length > 0 && (
           <div className="user-list">
             <p className="quick-label">Select your account</p>
             {users.map(u => (
               <button key={u.id} className={`user-row${dm}`} onClick={() => handleUserSelect(u)}>
                 <span className="user-row-av">{getInitials(u.name)}</span>
                 <span className="user-row-name">{u.name}</span>
                 <span className="user-row-arrow">→</span>
               </button>
             ))}
           </div>
         )}
         <button className="login-btn" style={{ marginTop: users.length ? "1rem" : "0" }} onClick={() => { setName(""); setScreen("register"); }}>
           {users.length ? "+ Add New Account" : "Get Started →"}
         </button>
       </div>
     </div>
   );
 }
 
 // ========== ADVANCED AI CHAT ==========
 function AIChat({ user, userStats, darkMode }) {
   const [messages, setMessages] = useState([{
     role: "assistant",
     text: `Hi ${user.name}! 👋 I'm your personal Finance AI.\n\nI know your finances:\n💰 Balance: ${fmt(userStats.balance)}\n📊 This month spend: ${fmt(userStats.monthlyExpense)}\n🏆 Top category: ${userStats.topCat || "None yet"}\n\nAsk me anything about money! I'm here to help 😊`
   }]);
   const [input, setInput] = useState("");
   const [loading, setLoading] = useState(false);
   const [offline, setOffline] = useState(!navigator.onLine);
   const bottomRef = useRef(null);
 
   useEffect(() => {
     const on = () => setOffline(false);
     const off = () => setOffline(true);
     window.addEventListener("online", on);
     window.addEventListener("offline", off);
     return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
   }, []);
 
   useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
 
   // Build smart system prompt with user data
   function buildSystemPrompt() {
     return `You are "Make My Day AI" — a smart, friendly personal finance assistant for Indian users.
 
 USER PROFILE:
 - Name: ${user.name}
 - Current Balance: ${fmt(userStats.balance)}
 - This Month Income: ${fmt(userStats.monthlyIncome)}
 - This Month Expenses: ${fmt(userStats.monthlyExpense)}
 - Top Spending Category: ${userStats.topCat || "Not enough data"}
 - Total Transactions: ${userStats.totalTx}
 
 YOUR EXPERTISE:
 💰 Savings — tips, strategies, emergency fund
 🏦 Loans — home loan, personal loan, education loan, gold loan
 📈 Investments — stocks, mutual funds, SIP, FD, RD, PPF, NPS, gold
 📊 EMI Calculator — show formula and step by step calculation
 💡 Business Ideas — low investment, high return ideas for India
 🚀 Startup Advice — how to start, funding, marketing
 📉 Market Insights — stock market, crypto basics, real estate
 🧾 Tax Saving — 80C, 80D, HRA, NPS deductions
 💳 Credit & CIBIL — improve score, credit cards, debt management
 🏠 Financial Planning — budgeting, goal setting, retirement
 
 PERSONALITY:
 - Friendly like a trusted friend, not a robot
 - Simple language, no complex jargon
 - Always encouraging and positive
 - Use Indian examples and context
 - Always use ₹ Rupees
 
 RESPONSE RULES:
 - Keep answers under 250 words
 - Use bullet points for lists
 - Use emojis to make friendly
 - For EMI/calculations — show step by step
 - Give TOP 3 practical points for advice
 - End every answer with one quick actionable tip
 - If user writes in Tamil or Hindi — reply in same language
 - Only answer finance related questions
 - If non-finance question: say "I'm your Finance AI! Ask me about money 😊"
 
 PERSONALIZED ADVICE:
 - If user's top spend is ${userStats.topCat} — suggest ways to reduce that
 - If balance is negative — give emergency saving tips
 - Base advice on user's actual financial situation shown above`;
   }
 
   async function send() {
     if (!input.trim() || loading) return;
     if (offline) { alert("No internet! Please connect to use Finance AI 📶"); return; }
     const userMsg = input.trim();
     setInput("");
     const updatedMessages = [...messages, { role: "user", text: userMsg }];
     setMessages(updatedMessages);
     setLoading(true);
 
     try {
       // Build conversation history for Gemini
       const history = updatedMessages
         .filter((m, i) => i > 0) // skip first assistant greeting
         .map(m => ({
           role: m.role === "assistant" ? "model" : "user",
           parts: [{ text: m.text }]
         }));
 
       // Routed through a Vercel serverless function — Gemini key stays server-side only
       const res = await fetch("/api/finance-ai", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({
           systemInstruction: { parts: [{ text: buildSystemPrompt() }] },
           contents: history,
           generationConfig: {
             temperature: 0.7,
             maxOutputTokens: 8192,
             topP: 0.9,
           }
         })
       });
 
       const data = await res.json();
 
       if (data.error) {
         throw new Error(data.error.message || data.error);
       }
 
       const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't get a response. Please try again!";
       setMessages(m => [...m, { role: "assistant", text }]);
     } catch (err) {
       console.error("AI Error:", err);
       setMessages(m => [...m, { role: "assistant", text: "⚠️ Connection error. Please check your internet and try again!" }]);
     }
     setLoading(false);
   }
 
   const suggestions = [
     "How to save ₹10,000/month?",
     "Calculate EMI for ₹5 lakh loan",
     "Best SIP to start with ₹500?",
     "Business idea with ₹10,000?",
     "How to improve CIBIL score?",
     "Where to invest my savings?",
     "How to reduce my " + (userStats.topCat || "Food") + " expenses?",
     "Tax saving tips for this year"
   ];
 
   const dm = darkMode ? " dark" : "";
 
   return (
     <div className={`ai-chat${dm}`}>
       {offline && <div className="offline-banner">📵 No internet — Finance AI needs connection to work</div>}
       <div className="ai-messages">
         {messages.map((m, i) => (
           <div key={i} className={`ai-msg ${m.role}`}>
             {m.role === "assistant" && <div className="ai-avatar">🤖</div>}
             <div className={`ai-bubble${m.role === "user" ? " user" : ""}${dm}`}>{m.text}</div>
           </div>
         ))}
         {loading && (
           <div className="ai-msg assistant">
             <div className="ai-avatar">🤖</div>
             <div className={`ai-bubble${dm}`}><div className="ai-typing"><span /><span /><span /></div></div>
           </div>
         )}
         <div ref={bottomRef} />
       </div>
 
       {messages.length === 1 && (
         <div className="suggestions">
           {suggestions.map((s, i) => (
             <button key={i} className="suggestion-chip" onClick={() => setInput(s)}>{s}</button>
           ))}
         </div>
       )}
 
       <div className={`ai-input-row${dm}`}>
         <input
           className={`ai-input${dm}`}
           type="text"
           placeholder={offline ? "No internet 📵" : "Ask anything about money..."}
           value={input}
           onChange={e => setInput(e.target.value)}
           onKeyDown={e => e.key === "Enter" && send()}
           disabled={offline}
         />
         <button className="ai-send" onClick={send} disabled={loading || !input.trim() || offline}>➤</button>
       </div>
     </div>
   );
 }
 
 // ========== SAVINGS GOAL ==========
 function SavingsGoal({ user, darkMode }) {
   const key = `mmd_goals_${user.id}`;
   const [goals, setGoals] = useState(() => { try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; } });
   const [showAdd, setShowAdd] = useState(false);
   const [form, setForm] = useState({ name: "", target: "", saved: "" });
   useEffect(() => { localStorage.setItem(key, JSON.stringify(goals)); }, [goals, key]);
 
   function addGoal() {
     if (!form.name.trim() || !form.target || parseFloat(form.target) <= 0) { alert("Please fill goal name and target!"); return; }
     setGoals(g => [...g, { id: Date.now(), name: form.name.trim(), target: parseFloat(form.target), saved: parseFloat(form.saved) || 0 }]);
     setForm({ name: "", target: "", saved: "" }); setShowAdd(false);
   }
   function updateSaved(id, val) { setGoals(g => g.map(goal => goal.id === id ? { ...goal, saved: Math.max(0, parseFloat(val) || 0) } : goal)); }
   function deleteGoal(id) { if (window.confirm("Delete this goal?")) setGoals(g => g.filter(goal => goal.id !== id)); }
   const dm = darkMode ? " dark" : "";
 
   return (
     <div>
       <div className={`card${dm}`} style={{ marginBottom: "1rem" }}>
         <div className="card-head">
           <span className="card-title">🎯 Savings Goals</span>
           <button className="btn-ghost small" onClick={() => setShowAdd(true)}>+ Add</button>
         </div>
         {goals.length === 0 ? <div className="empty">No goals yet! Set a savings target 🎯</div> : (
           goals.map(goal => {
             const pct = Math.min(100, Math.round(goal.saved / goal.target * 100));
             const done = goal.saved >= goal.target;
             return (
               <div key={goal.id} className="goal-item">
                 <div className="goal-row"><span className="goal-name">{done ? "✅" : "🎯"} {goal.name}</span><button className="tx-del" onClick={() => deleteGoal(goal.id)}>✕</button></div>
                 <div className="goal-amounts"><span className="goal-saved">{fmt(goal.saved)}</span><span className="goal-target"> / {fmt(goal.target)} ({pct}%)</span></div>
                 <div className="budget-track"><div className="budget-fill" style={{ width: `${pct}%`, background: done ? "#1D9E75" : "#378ADD" }} /></div>
                 {done ? <div className="goal-done">🎉 Goal achieved!</div> : (
                   <div className="goal-update">
                     <input type="number" placeholder="Update saved amount" className={`goal-input${dm}`} onBlur={e => updateSaved(goal.id, e.target.value)} defaultValue={goal.saved} inputMode="numeric" />
                   </div>
                 )}
               </div>
             );
           })
         )}
       </div>
       {showAdd && (
         <div className="modal-overlay" onClick={() => setShowAdd(false)}>
           <div className={`modal${dm}`} onClick={e => e.stopPropagation()}>
             <h3 className="modal-title">Add Savings Goal</h3>
             <div className="field"><label>Goal Name</label><input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. New Phone, Vacation" autoFocus /></div>
             <div className="field"><label>Target Amount (₹)</label><input type="number" value={form.target} onChange={e => setForm(f => ({ ...f, target: e.target.value }))} placeholder="e.g. 20000" inputMode="numeric" /></div>
             <div className="field"><label>Already Saved (₹)</label><input type="number" value={form.saved} onChange={e => setForm(f => ({ ...f, saved: e.target.value }))} placeholder="0" inputMode="numeric" /></div>
             <div className="modal-btns">
               <button className="btn-cancel" onClick={() => setShowAdd(false)}>Cancel</button>
               <button className="btn-save" onClick={addGoal}>Save Goal</button>
             </div>
           </div>
         </div>
       )}
     </div>
   );
 }
 
 // ========== MONTHLY REPORT ==========
 function MonthlyReport({ transactions, darkMode }) {
   const [selectedMonth, setSelectedMonth] = useState(() => { const n = new Date(); return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}`; });
   const months = useMemo(() => { const s = new Set(transactions.map(t => t.date.slice(0, 7))); return [...s].sort().reverse(); }, [transactions]);
   const monthTx = useMemo(() => transactions.filter(t => t.date.startsWith(selectedMonth)), [transactions, selectedMonth]);
   const mIncome = monthTx.filter(t => t.type === "income").reduce((s, t) => s + t.amt, 0);
   const mExpense = monthTx.filter(t => t.type === "expense").reduce((s, t) => s + t.amt, 0);
   const mBalance = mIncome - mExpense;
   const byCat = useMemo(() => { const m = {}; monthTx.filter(t => t.type === "expense").forEach(t => { m[t.cat] = (m[t.cat] || 0) + t.amt; }); return m; }, [monthTx]);
   const topCat = Object.entries(byCat).sort((a, b) => b[1] - a[1])[0];
   const dm = darkMode ? " dark" : "";
   const monthLabel = m => { const [y, mo] = m.split("-"); return new Date(y, mo - 1).toLocaleString("en-IN", { month: "long", year: "numeric" }); };
 
   return (
     <div className={`card${dm}`}>
       <div className="card-head">
         <span className="card-title">📅 Monthly Report</span>
         <select className="month-select" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}>
           {months.length === 0 && <option value={selectedMonth}>{monthLabel(selectedMonth)}</option>}
           {months.map(m => <option key={m} value={m}>{monthLabel(m)}</option>)}
         </select>
       </div>
       {monthTx.length === 0 ? <div className="empty">No data for this month.</div> : (
         <>
           <div className="report-grid">
             <div className={`report-card green${dm}`}><div className="report-label">Income</div><div className="report-val">{fmt(mIncome)}</div></div>
             <div className={`report-card red${dm}`}><div className="report-label">Expense</div><div className="report-val">{fmt(mExpense)}</div></div>
             <div className={`report-card ${mBalance >= 0 ? "blue" : "orange"}${dm}`}><div className="report-label">Saved</div><div className="report-val">{mBalance < 0 ? "-" : ""}{fmt(mBalance)}</div></div>
             <div className={`report-card purple${dm}`}><div className="report-label">Transactions</div><div className="report-val">{monthTx.length}</div></div>
           </div>
           {topCat && <div className="insight-card" style={{ marginTop: "1rem" }}><span className="insight-icon">💡</span><span className="insight-text">Highest spend: <strong>{topCat[0]}</strong> — {fmt(topCat[1])}</span></div>}
           <div style={{ marginTop: "1rem" }}>
             {Object.entries(byCat).sort((a, b) => b[1] - a[1]).map(([cat, amt]) => (
               <div key={cat} className="breakdown-row" style={{ marginBottom: "8px" }}>
                 <div className="br-label"><span>{CAT_ICONS[cat]}</span><span>{cat}</span></div>
                 <div className="br-bar-wrap"><div className="br-track"><div className="br-fill" style={{ width: `${Math.round(amt / mExpense * 100)}%`, background: CAT_COLORS[cat] }} /></div></div>
                 <div className="br-val">{fmt(amt)}</div>
               </div>
             ))}
           </div>
         </>
       )}
     </div>
   );
 }
 
 // ========== DASHBOARD ==========
 function Dashboard({ user, onLogout, darkMode, toggleDark }) {
   const storageKey = `mmd_txs_${user.id}`;
   const budgetKey = `mmd_budgets_${user.id}`;
   const [transactions, setTransactions] = useState(() => { try { return JSON.parse(localStorage.getItem(storageKey) || "[]"); } catch { return []; } });
   const [budgets, setBudgets] = useState(() => { try { return JSON.parse(localStorage.getItem(budgetKey) || "null") || BUDGETS_DEFAULT; } catch { return BUDGETS_DEFAULT; } });
   const [tab, setTab] = useState("home");
   const [showForm, setShowForm] = useState(false);
   const [showBudgetEdit, setShowBudgetEdit] = useState(false);
   const [editTx, setEditTx] = useState(null);
   const [form, setForm] = useState(EMPTY_FORM);
   const [budgetForm, setBudgetForm] = useState({ ...budgets });
   const [filterCat, setFilterCat] = useState("All");
   const [filterType, setFilterType] = useState("All");
   const [nextId, setNextId] = useState(() => { try { const a = JSON.parse(localStorage.getItem(storageKey) || "[]"); return a.reduce((m, t) => Math.max(m, t.id), 0) + 1; } catch { return 1; } });
 
   useEffect(() => { localStorage.setItem(storageKey, JSON.stringify(transactions)); }, [transactions, storageKey]);
   useEffect(() => { localStorage.setItem(budgetKey, JSON.stringify(budgets)); }, [budgets, budgetKey]);
 
   const income = useMemo(() => transactions.filter(t => t.type === "income").reduce((s, t) => s + t.amt, 0), [transactions]);
   const expense = useMemo(() => transactions.filter(t => t.type === "expense").reduce((s, t) => s + t.amt, 0), [transactions]);
   const balance = income - expense;
   const now = new Date();
   const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
   const monthlyExpense = useMemo(() => transactions.filter(t => t.type === "expense" && t.date.startsWith(thisMonth)).reduce((s, t) => s + t.amt, 0), [transactions, thisMonth]);
   const monthlyIncome = useMemo(() => transactions.filter(t => t.type === "income" && t.date.startsWith(thisMonth)).reduce((s, t) => s + t.amt, 0), [transactions, thisMonth]);
   const byCat = useMemo(() => { const m = {}; transactions.filter(t => t.type === "expense").forEach(t => { m[t.cat] = (m[t.cat] || 0) + t.amt; }); return m; }, [transactions]);
   const monthByCat = useMemo(() => { const m = {}; transactions.filter(t => t.type === "expense" && t.date.startsWith(thisMonth)).forEach(t => { m[t.cat] = (m[t.cat] || 0) + t.amt; }); return m; }, [transactions, thisMonth]);
   const filtered = useMemo(() => [...transactions].filter(t => filterCat === "All" || t.cat === filterCat).filter(t => filterType === "All" || t.type === filterType).sort((a, b) => b.date.localeCompare(a.date)), [transactions, filterCat, filterType]);
   const topCat = useMemo(() => { const e = Object.entries(byCat); return e.length ? e.sort((a, b) => b[1] - a[1])[0][0] : null; }, [byCat]);
   const maxCat = Math.max(...Object.values(byCat), 1);
   const recentTx = [...transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
 
   // User stats for AI
   const userStats = { balance, monthlyIncome, monthlyExpense, topCat, totalTx: transactions.length };
 
   function openAdd() { setEditTx(null); setForm(EMPTY_FORM); setShowForm(true); }
   function openEdit(tx) { setEditTx(tx); setForm({ desc: tx.desc, amt: String(tx.amt), type: tx.type, cat: tx.cat, date: tx.date }); setShowForm(true); }
   function handleDescChange(val) { const cat = autoCategory(val); setForm(f => ({ ...f, desc: val, cat })); }
   function saveTransaction() {
     if (!form.desc.trim() || !form.amt || parseFloat(form.amt) <= 0 || !form.date) { alert("Please fill all fields!"); return; }
     if (editTx) {
       setTransactions(prev => prev.map(t => t.id === editTx.id ? { ...t, desc: form.desc.trim(), amt: parseFloat(form.amt), type: form.type, cat: form.cat, date: form.date } : t));
     } else {
       setTransactions(prev => [...prev, { id: nextId, desc: form.desc.trim(), amt: parseFloat(form.amt), type: form.type, cat: form.cat, date: form.date }]);
       setNextId(n => n + 1);
     }
     setShowForm(false); setForm(EMPTY_FORM); setEditTx(null);
   }
   function deleteTransaction(id) { if (window.confirm("Delete this transaction?")) setTransactions(prev => prev.filter(t => t.id !== id)); }
   function saveBudgets() { setBudgets({ ...budgetForm }); setShowBudgetEdit(false); }
   function exportCSV() {
     const header = "Date,Description,Category,Type,Amount\n";
     const rows = [...transactions].sort((a, b) => b.date.localeCompare(a.date)).map(t => `${t.date},"${t.desc}",${t.cat},${t.type},${t.amt}`).join("\n");
     const blob = new Blob([header + rows], { type: "text/csv" });
     const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `${user.name}_makemyday.csv`; a.click(); URL.revokeObjectURL(url);
   }
 
   const dm = darkMode ? " dark" : "";
 
   return (
     <div className={`app${dm}`}>
       <header className={`header${dm}`}>
         <div className="header-inner">
           <div className="logo"><span className="logo-icon">☀️</span><span className="logo-text">Make My Day</span></div>
           <div className="header-actions">
             <div className="avatar-badge"><span className="avatar">{getInitials(user.name)}</span><span className="avatar-name">{user.name}</span></div>
             <button className="btn-icon" onClick={toggleDark} title="Toggle dark mode">{darkMode ? "🌞" : "🌙"}</button>
             <button className="btn-icon" onClick={exportCSV} title="Export CSV">📤</button>
             <button className="btn-logout" onClick={onLogout} title="Logout">⏻</button>
           </div>
         </div>
       </header>
 
       <main className="main">
         {tab === "home" && <>
           <div className="welcome-banner">
             <div><h2 className="welcome-title">{getGreeting()}, {user.name}! 👋</h2><p className="welcome-sub">{now.toLocaleString("en-IN", { month: "long", year: "numeric" })}</p></div>
             <div className="welcome-bal"><span className="wb-label">Balance</span><span className="wb-value" style={{ color: balance >= 0 ? "#fff" : "#FFD700" }}>{balance < 0 ? "-" : ""}{fmt(balance)}</span></div>
           </div>
           <div className="metrics-grid">
             <div className={`metric-card green${dm}`}><div className="metric-label">Total Income</div><div className="metric-value">{fmt(income)}</div></div>
             <div className={`metric-card red${dm}`}><div className="metric-label">Total Expense</div><div className="metric-value">{fmt(expense)}</div></div>
             <div className={`metric-card blue${dm}`}><div className="metric-label">Month Income</div><div className="metric-value">{fmt(monthlyIncome)}</div></div>
             <div className={`metric-card purple${dm}`}><div className="metric-label">Month Spend</div><div className="metric-value">{fmt(monthlyExpense)}</div></div>
           </div>
           {topCat && <div className="insight-card"><span className="insight-icon">💡</span><span className="insight-text">You spend most on <strong>{topCat}</strong> — {fmt(byCat[topCat])}! {byCat[topCat] > (budgets[topCat] || 99999) ? "⚠️ Over budget!" : "Keep tracking!"}</span></div>}
           <div className={`card${dm}`}>
             <div className="card-head"><span className="card-title">Recent Transactions</span><button className="btn-ghost small" onClick={() => setTab("transactions")}>See all</button></div>
             {recentTx.length === 0 ? <div className="empty">No transactions yet. Tap + to add! 😊</div> : (
               <div className="tx-list">
                 {recentTx.map(t => (
                   <div key={t.id} className="tx-item">
                     <div className="tx-icon" style={{ background: CAT_BG[t.cat], color: CAT_COLORS[t.cat] }}>{CAT_ICONS[t.cat]}</div>
                     <div className="tx-meta"><div className="tx-name">{t.desc}</div><div className="tx-sub">{t.cat} · {formatDate(t.date)}</div></div>
                     <div className="tx-amt" style={{ color: t.type === "income" ? "#1D9E75" : "#D85A30" }}>{t.type === "income" ? "+" : "-"}{fmt(t.amt)}</div>
                   </div>
                 ))}
               </div>
             )}
           </div>
         </>}
 
         {tab === "transactions" && (
           <div className={`card${dm}`}>
             <div className="card-head"><span className="card-title">All Transactions</span></div>
             <div className="filter-row">
               <select value={filterCat} onChange={e => setFilterCat(e.target.value)}><option value="All">All categories</option>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select>
               <select value={filterType} onChange={e => setFilterType(e.target.value)}><option value="All">All types</option><option value="income">Income</option><option value="expense">Expense</option></select>
             </div>
             {filtered.length === 0 ? <div className="empty">No transactions found!</div> : (
               <div className="tx-list">
                 {filtered.map(t => (
                   <div key={t.id} className="tx-item">
                     <div className="tx-icon" style={{ background: CAT_BG[t.cat], color: CAT_COLORS[t.cat] }}>{CAT_ICONS[t.cat]}</div>
                     <div className="tx-meta"><div className="tx-name">{t.desc}</div><div className="tx-sub">{t.cat} · {formatDate(t.date)}</div></div>
                     <div className="tx-amt" style={{ color: t.type === "income" ? "#1D9E75" : "#D85A30" }}>{t.type === "income" ? "+" : "-"}{fmt(t.amt)}</div>
                     <button className="tx-edit" onClick={() => openEdit(t)}>✏️</button>
                     <button className="tx-del" onClick={() => deleteTransaction(t.id)}>✕</button>
                   </div>
                 ))}
               </div>
             )}
           </div>
         )}
 
         {tab === "insights" && <>
           <div className={`card${dm}`} style={{ marginBottom: "1rem" }}>
             <div className="card-head"><span className="card-title">📊 Spending by Category</span></div>
             {Object.keys(byCat).length === 0 ? <div className="empty">No expense data yet.</div> : (
               <div className="breakdown-list">
                 {Object.entries(byCat).sort((a, b) => b[1] - a[1]).map(([cat, amt]) => (
                   <div key={cat} className="breakdown-row">
                     <div className="br-label"><span>{CAT_ICONS[cat]}</span><span>{cat}</span></div>
                     <div className="br-bar-wrap"><div className="br-track"><div className="br-fill" style={{ width: `${Math.round(amt / maxCat * 100)}%`, background: CAT_COLORS[cat] }} /></div></div>
                     <div className="br-val">{fmt(amt)}</div>
                   </div>
                 ))}
               </div>
             )}
           </div>
           <div className={`card${dm}`} style={{ marginBottom: "1rem" }}>
             <div className="card-head"><span className="card-title">📋 Monthly Budget</span><button className="btn-ghost small" onClick={() => { setBudgetForm({ ...budgets }); setShowBudgetEdit(true); }}>Edit</button></div>
             {Object.keys(budgets).map(cat => {
               const spent = monthByCat[cat] || 0; const budget = budgets[cat];
               const pct = Math.min(100, Math.round(spent / budget * 100));
               const over = spent > budget;
               const color = over ? "#D85A30" : pct > 75 ? "#BA7517" : CAT_COLORS[cat];
               return (
                 <div key={cat} className="budget-item">
                   <div className="budget-row-top"><span className="budget-cat">{CAT_ICONS[cat]} {cat}</span><span className="budget-amounts">{fmt(spent)} <span className="muted">/ {fmt(budget)}</span></span></div>
                   <div className="budget-track"><div className="budget-fill" style={{ width: `${pct}%`, background: color }} /></div>
                   {over && <div className="over-badge">Over by {fmt(spent - budget)}</div>}
                 </div>
               );
             })}
           </div>
           <SavingsGoal user={user} darkMode={darkMode} />
           <MonthlyReport transactions={transactions} darkMode={darkMode} />
         </>}
 
         {tab === "ai" && <AIChat user={user} userStats={userStats} darkMode={darkMode} />}
       </main>
 
       <nav className={`bottom-nav${dm}`}>
         <button className={`nav-btn${tab === "home" ? " active" : ""}${dm}`} onClick={() => setTab("home")}><span className="nav-icon">🏠</span><span className="nav-label">Home</span></button>
         <button className={`nav-btn${tab === "transactions" ? " active" : ""}${dm}`} onClick={() => setTab("transactions")}><span className="nav-icon">📋</span><span className="nav-label">Transactions</span></button>
         <button className="nav-add" onClick={openAdd}>+</button>
         <button className={`nav-btn${tab === "insights" ? " active" : ""}${dm}`} onClick={() => setTab("insights")}><span className="nav-icon">📊</span><span className="nav-label">Insights</span></button>
         <button className={`nav-btn${tab === "ai" ? " active" : ""}${dm}`} onClick={() => setTab("ai")}><span className="nav-icon">🤖</span><span className="nav-label">Finance AI</span></button>
       </nav>
 
       {showForm && (
         <div className="modal-overlay" onClick={() => setShowForm(false)}>
           <div className={`modal${dm}`} onClick={e => e.stopPropagation()}>
             <h3 className="modal-title">{editTx ? "Edit Transaction" : "Add Transaction"}</h3>
             <div className="field"><label>Description</label><input type="text" value={form.desc} onChange={e => handleDescChange(e.target.value)} placeholder="e.g. Lunch, Bus fare..." autoFocus />
               {form.desc && <div className="auto-cat-hint">📂 Auto: {CAT_ICONS[form.cat]} {form.cat}</div>}
             </div>
             <div className="field"><label>Amount (₹)</label><input type="number" value={form.amt} onChange={e => setForm(f => ({ ...f, amt: e.target.value }))} placeholder="0" min="1" inputMode="numeric" /></div>
             <div className="field-row">
               <div className="field"><label>Type</label><select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}><option value="expense">Expense</option><option value="income">Income</option></select></div>
               <div className="field"><label>Category</label><select value={form.cat} onChange={e => setForm(f => ({ ...f, cat: e.target.value }))}>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></div>
             </div>
             <div className="field"><label>Date</label><input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} /></div>
             <div className="modal-btns">
               <button className="btn-cancel" onClick={() => setShowForm(false)}>Cancel</button>
               <button className="btn-save" onClick={saveTransaction}>{editTx ? "Update" : "Save"}</button>
             </div>
           </div>
         </div>
       )}
 
       {showBudgetEdit && (
         <div className="modal-overlay" onClick={() => setShowBudgetEdit(false)}>
           <div className={`modal${dm}`} onClick={e => e.stopPropagation()}>
             <h3 className="modal-title">Edit Monthly Budgets</h3>
             {Object.keys(BUDGETS_DEFAULT).map(cat => (
               <div className="field" key={cat}><label>{CAT_ICONS[cat]} {cat} (₹)</label><input type="number" value={budgetForm[cat] || ""} min="0" inputMode="numeric" onChange={e => setBudgetForm(b => ({ ...b, [cat]: parseFloat(e.target.value) || 0 }))} /></div>
             ))}
             <div className="modal-btns">
               <button className="btn-cancel" onClick={() => setShowBudgetEdit(false)}>Cancel</button>
               <button className="btn-save" onClick={saveBudgets}>Save</button>
             </div>
           </div>
         </div>
       )}
     </div>
   );
 }
 
 // ========== MAIN ==========
 export default function App() {
   const [splash, setSplash] = useState(true);
   const [currentUser, setCurrentUser] = useState(null);
   const [darkMode, setDarkMode] = useState(() => localStorage.getItem("mmd_dark") === "true");
 
   useEffect(() => { setTimeout(() => setSplash(false), 2000); }, []);
   useEffect(() => { localStorage.setItem("mmd_dark", darkMode); document.body.classList.toggle("dark-body", darkMode); }, [darkMode]);
 
   if (splash) return <SplashScreen />;
   if (!currentUser) return <LoginPage onLogin={setCurrentUser} darkMode={darkMode} />;
   return <Dashboard user={currentUser} onLogout={() => setCurrentUser(null)} darkMode={darkMode} toggleDark={() => setDarkMode(d => !d)} />;
 }
 