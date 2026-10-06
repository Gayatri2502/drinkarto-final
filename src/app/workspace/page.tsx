"use client";
import Link from "next/link";
import PriceHealth from "@/components/price-health";
import FinanceDesk from "@/components/finance-desk";
import AdminReports from "@/components/admin-reports";
import WorkspaceAI from "@/components/workspace-ai";
import { useEffect, useState, useRef, type FormEvent } from "react";
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Package,
  Warehouse,
  History,
  LogOut,
  Moon,
  Sun,
  ArrowUpRight,
  Plus,
} from "lucide-react";
type Row = Record<string, string | number>;
const sections = [
  ["Overview", LayoutDashboard],
  ["Reports", LayoutDashboard],
  ["Invoices", ShoppingCart],
  ["Price health", History],
  ["Orders", ShoppingCart],
  ["Retailers", Users],
  ["Products", Package],
  ["Inventory", Warehouse],
  ["Audit log", History],
] as const;
const navigationGroups = [
  { label: "WORK", names: ["Overview", "Orders", "Inventory"] },
  { label: "DIRECTORY", names: ["Products", "Retailers"] },
  { label: "FINANCE & INSIGHTS", names: ["Invoices", "Reports"] },
  { label: "ADMIN", names: ["Price health", "Audit log"] },
] as const;
async function api(path: string, body?: unknown, method?: string) {
  const r = await fetch("/api/v1/" + path, {
    method: method ?? (body !== undefined ? "POST" : "GET"),
    headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error);
  return data;
}
export default function App() {
  const [user, setUser] = useState<any>(null),
    [section, setSection] = useState("Overview"),
    [rows, setRows] = useState<any[]>([]),
    [stats, setStats] = useState<any>(null),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true),
    [register, setRegister] = useState(false),
    [modal, setModal] = useState(false),
    [dark, setDark] = useState(false),
    [products, setProducts] = useState<any[]>([]),
    [retailers, setRetailers] = useState<any[]>([]),
    [busy, setBusy] = useState(false),
    [tableQuery, setTableQuery] = useState(""),
    [orderItems, setOrderItems] = useState([{ productId: "", quantity: "1" }]);
  const [editing, setEditing] = useState<any>(null);
  const [notice, setNotice] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (modal) {
      dialogRef.current?.showModal();
      if (section === "Orders") setOrderItems([{ productId: "", quantity: "1" }]);
    }
  }, [modal, section]);
  async function refresh() {
    setLoading(true);
    setError("");
    try {
      const me = await api("me");
      setUser(me);
      const permitted=me.role === "ACCOUNTS" ? ["Invoices","Retailers"] : me.role === "WAREHOUSE" ? ["Inventory"] : me.role === "SALES" ? ["Products"] : sections.map(([name])=>name);
      if(!permitted.includes(section)){setSection(permitted[0]);return;}
      const [s, p, r] = await Promise.all([
        ["OWNER","MANAGER","ACCOUNTS"].includes(me.role) ? api("analytics") : Promise.resolve(null),
        api("products"),
        ["OWNER","MANAGER","ACCOUNTS"].includes(me.role) ? api("retailers") : Promise.resolve([]),
      ]);
      setStats(s);
      setProducts(p);
      setRetailers(r);
      const endpoint: Record<string, string> = {
        Orders: "orders",
        Retailers: "retailers",
        Products: "products",
        Inventory: "products",
        "Audit log": "audit",
      };
      setRows(
        ["Reports", "Invoices", "Price health"].includes(section)
          ? []
          : section === "Overview"
            ? await api("orders")
            : await api(endpoint[section]),
      );
    } catch (e) {
      if ((e as Error).message !== "Sign in required")
        setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    refresh();
  }, [section]);
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
  }, [dark]);
  useEffect(() => { if (!modal) setEditing(null); }, [modal]);
  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 4500);
    return () => window.clearTimeout(timer);
  }, [notice]);
  function openCreate() { setEditing(null); setError(""); setModal(true); }
  function openEdit(record: any) { setEditing(record); setError(""); setModal(true); }
  async function login(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const form = Object.fromEntries(new FormData(e.currentTarget));
    try {
      await api(register ? "auth/register" : "auth/login", form);
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const f = Object.fromEntries(new FormData(e.currentTarget));
    try {
      let result: any;
      if (section === "Products")
        result = await api(editing ? "products/" + encodeURIComponent(editing.id) : "products", {
          ...f,
          unitPrice: Number(f.unitPrice),
          minimumStock: Number(f.minimumStock),
        }, editing ? "PATCH" : undefined);
      if (section === "Retailers")
        result = await api(editing ? "retailers/" + encodeURIComponent(editing.id) : "retailers", { ...f, creditLimit: Number(f.creditLimit) }, editing ? "PATCH" : undefined);
      if (section === "Inventory")
        result = await api(f.kind === "RECEIPT" ? "inventory/receive" : "inventory/adjust", {productId:f.productId,reason:f.reason,quantity:Number(f.quantity)});
      if (section === "Orders") {
        const items = orderItems.filter((item) => item.productId).map((item) => ({ productId: item.productId, quantity: Number(item.quantity) }));
        if (!items.length) throw new Error("Add at least one product to the order");
        if (items.length !== orderItems.length) throw new Error("Choose a product for every order line");
        result = await api("orders", { retailerId: f.retailerId, items });
      }
      setModal(false);
      setEditing(null);
      await refresh();
      const text = section === "Products" ? `Product ${editing ? "updated" : "added"}.` : section === "Retailers" ? `Retailer ${editing ? "updated" : "added"}.` : section === "Inventory" ? (f.kind === "RECEIPT" ? "Stock receipt recorded." : "Inventory adjustment recorded.") : result?.status === "PENDING_APPROVAL" ? "Order created and sent for credit approval." : "Order created and stock reserved.";
      setNotice({ kind: "success", text });
    } catch (e) {
      setError((e as Error).message);
      setNotice({ kind: "error", text: (e as Error).message });
    } finally {
      setBusy(false);
    }
  }
  async function changeOrder(id: string, action: string) {
    setBusy(true);
    setError("");
    try {
      await api("orders/" + id + "/" + action, {});
      await refresh();
      setNotice({ kind: "success", text: action === "cancel" ? "Order cancelled; reserved stock was released." : action === "approve" ? "Order approved and stock reserved." : "Order fulfilled and invoice created." });
    } catch (e) {
      setError((e as Error).message);
      setNotice({ kind: "error", text: (e as Error).message });
    } finally {
      setBusy(false);
    }
  }
  async function deleteRecord(kind: "products" | "retailers", record: any) {
    const label = kind === "products" ? "product" : "retailer";
    if (!window.confirm(`Delete ${label} “${record.name}”? Records used in orders, stock movements, or open balances are protected.`)) return;
    setBusy(true); setError("");
    try {
      await api(kind + "/" + encodeURIComponent(record.id), undefined, "DELETE");
      await refresh();
      setNotice({ kind: "success", text: `${label[0].toUpperCase() + label.slice(1)} deleted.` });
    } catch (cause) {
      const message = (cause as Error).message;
      setError(message); setNotice({ kind: "error", text: message });
    } finally { setBusy(false); }
  }
  const money = (v: unknown) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: user?.organization.currency ?? "INR",
      maximumFractionDigits: 0,
    }).format(Number(v ?? 0));
  const filteredRows = rows.filter((row) =>
    JSON.stringify(row).toLocaleLowerCase().includes(tableQuery.trim().toLocaleLowerCase()),
  );
  if (!user)
    return (
      <main className="login">
        <section className="story">
          <div className="brand">
            <span className="mark">D</span> drinkarto
          </div>
          <p className="eyebrow">YOUR DISTRIBUTION, CONNECTED</p>
          <h1>
            Smarter distribution.
            <br />
            Better decisions.
          </h1>
          <p>
            Bring your retailers, inventory, and orders together. Build a clear
            picture of your business.
          </p>
          <div className="story-note">
            One workspace. Your organization’s data.
          </div>
        </section>
        <section className="auth">
          <form onSubmit={login}>
            <div className="workspace-public-links"><Link href="/">← Drinkarto home</Link><Link href="/pricing">ERP pricing ↗</Link></div>
            <p className="eyebrow">DRINKARTO WORKSPACE</p>
            <h2>{register ? "Create your organization" : "Welcome back"}</h2>
            <p>
              {register
                ? "Set up your first business workspace."
                : "Sign in to manage your business."}
            </p>
            {register && (
              <>
                <Field name="name" label="Your name" />
                <Field name="organization" label="Organization name" />
                <Field name="jurisdiction" label="Operating jurisdiction" />
              </>
            )}
            <Field name="email" label="Email address" type="email" />
            <Field
              name="password"
              label="Password"
              type="password"
              minLength={12}
            />
            <p className="hint">Use at least 12 characters.</p>
            {error && (
              <p role="alert" className="error">
                {error}
              </p>
            )}
            <button disabled={busy}>
              {busy
                ? "Please wait…"
                : register
                  ? "Create workspace"
                  : "Sign in"}{" "}
              <ArrowUpRight size={16} />
            </button>
            <button
              className="text-button"
              type="button"
              onClick={() => {
                setRegister(!register);
                setError("");
              }}
            >
              {register
                ? "Already have an account? Sign in"
                : "New to Drinkarto? Create a workspace"}
            </button>
          </form>
        </section>
      </main>
    );
  return (
    <div className="shell">
      {notice && <div className={`action-toast ${notice.kind}`} role={notice.kind === "success" ? "status" : "alert"} aria-live="polite"><span>{notice.text}</span><button type="button" aria-label="Dismiss notification" onClick={() => setNotice(null)}>×</button></div>}
      <aside>
        <div className="brand">
          <span className="mark">D</span> drinkarto
        </div>
        <div className="workspace-mobile-links"><Link href="/">← Home</Link><Link href="/pricing">ERP pricing ↗</Link></div><div className="workspace">
          <span>{user.organization.name.slice(0, 2).toUpperCase()}</span>
          <div>
            {user.organization.name}
            <small>{user.role.toLowerCase()} workspace</small>
          </div>
        </div>
        <div className="workspace-navigation">
          {navigationGroups.map((group) => {
            const items = sections.filter(([name]) => group.names.some((item) => item === name) && (user.role === "ACCOUNTS" ? ["Invoices", "Retailers"].includes(name) : user.role === "WAREHOUSE" ? name === "Inventory" : user.role === "SALES" ? name === "Products" : true));
            if (!items.length) return null;
            return <div className="workspace-nav-group" key={group.label}><p className="nav-label">{group.label}</p><nav aria-label={group.label}>{items.map(([name, Icon]) => (
              <button key={name} className={section === name ? "selected" : ""} aria-current={section === name ? "page" : undefined} onClick={() => { setSection(name); setTableQuery(""); setModal(false); }}>
                <Icon size={18} />{name}
              </button>
            ))}</nav></div>;
          })}
        </div>
        <div className="aside-bottom">
          <p>
            Smarter Distribution.
            <br />
            Better Decisions.
          </p>
          <button
            onClick={async () => {
              await api("auth/logout", {});
              setUser(null);
              setError("");
            }}
          >
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>
      <main className="main">
        <header>
          <span>
            Workspace <span className="slash">/</span>{" "}
            <strong>{section}</strong>
          </span>
          <div>
            <button
              className="icon-button"
              aria-label={dark ? "Use light theme" : "Use dark theme"}
              onClick={() => setDark(!dark)}
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <span className="avatar">
              {user.user.name.slice(0, 2).toUpperCase()}
            </span>
          </div>
        </header>
        <div className="content">
          <div className="heading">
            <div>
              <p className="eyebrow">BUSINESS OPERATIONS</p>
              <h1>
                {section === "Overview"
                  ? "Your business, at a glance"
                  : section === "Reports"
                    ? "Reports & intelligence"
                    : section}
              </h1>
              <p>
                {section === "Overview"
                  ? "A clear view of orders, stock, and retailer relationships."
                  : section === "Reports"
                    ? "Executive performance, cash flow, customer exposure, and stock health."
                    : "Manage your " + section.toLowerCase() + " in one place."}
              </p>
            </div>
            {["Products", "Retailers", "Orders", "Inventory"].includes(
              section,
            ) && (section === "Products" ? user.role === "OWNER" : section === "Inventory" ? ["OWNER","MANAGER","WAREHOUSE"].includes(user.role) : ["OWNER","MANAGER"].includes(user.role)) && (
              <button onClick={openCreate}>
                <Plus size={16} />
                {section === "Inventory"
                  ? "Adjust stock"
                  : "Create " + section.slice(0, -1).toLowerCase()}
              </button>
            )}
          </div>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          {loading ? (
            <p role="status">Loading your workspace…</p>
          ) : (
            <>
              {section === "Reports" && <AdminReports/>}
              {section === "Invoices" && <FinanceDesk canReturn={["OWNER","MANAGER"].includes(user.role)} currency={user.organization.currency}/>}
              {section === "Price health" && <PriceHealth/>}
              {section === "Overview" && stats && (
                <>
                  <section className="quick-actions" aria-label="Common tasks">
                    <span>QUICK ACTIONS</span>
                    {[["Orders", "Create order"], ["Inventory", "Receive stock"], ["Retailers", "Add retailer"], ["Products", "Add product"]].filter(([target]) => target === "Orders" ? ["OWNER", "MANAGER"].includes(user.role) : target === "Inventory" ? ["OWNER", "MANAGER", "WAREHOUSE"].includes(user.role) : target === "Retailers" ? ["OWNER", "MANAGER"].includes(user.role) : user.role === "OWNER").map(([target, label]) => <button className="secondary" key={target} onClick={() => { setSection(target); setTableQuery(""); setModal(true); }}><Plus size={14}/>{label}</button>)}
                  </section>
                  <div className="stats">
                    {[
                      [
                        "Order value",
                        money(stats.orderValue),
                        "Non-cancelled orders",
                      ],
                      ["Orders", stats.orders, "Non-cancelled orders"],
                      ["Retailers", stats.retailers, "Business accounts"],
                      [
                        "Low stock",
                        stats.lowStock,
                        "At or below reorder threshold",
                      ],
                    ].map(([label, value, note]) => (
                      <article key={label}>
                        <p>{label}</p>
                        <strong>{value}</strong>
                        <small>{note}</small>
                      </article>
                    ))}
                  </div>
                  <div className="insight">
                    <div>
                      <span className="insight-icon">↗</span>
                      <div>
                        <strong>Keep your stock moving</strong>
                        <p>
                          {stats.lowStock
                            ? `${stats.lowStock} products need a stock review.`
                            : "Your catalogue is ready for a stock review."}{" "}
                          Review availability before placing new orders.
                        </p>
                      </div>
                    </div>
                    <button
                      className="secondary"
                      onClick={() => setSection("Inventory")}
                    >
                      View inventory →
                    </button>
                  </div>
                  <section className="overview-queues" aria-label="Needs attention and recent activity">
                    <article className="queue-card">
                      <div className="queue-heading"><div><p className="eyebrow">NEEDS ATTENTION</p><h2>Orders awaiting approval <span>{stats.pendingOrderCount ?? 0}</span></h2></div><button className="queue-link" onClick={() => { setSection("Orders"); setTableQuery("PENDING_APPROVAL"); }}>Review orders →</button></div>
                      {stats.pendingOrders?.length ? <ul>{stats.pendingOrders.slice(0, 4).map((order: any) => <li key={order.id}><div><strong>{order.retailer}</strong><small>{new Date(order.createdAt).toLocaleDateString()} · {money(order.total)}</small></div><span className="queue-status">Approval</span></li>)}</ul> : <p className="queue-clear">No orders are waiting for approval.</p>}
                    </article>
                    <article className="queue-card">
                      <div className="queue-heading"><div><p className="eyebrow">COLLECTIONS</p><h2>Unpaid invoices <span>{stats.unpaidInvoiceCount ?? 0}</span></h2></div><button className="queue-link" onClick={() => setSection("Invoices")}>Open invoices →</button></div>
                      {stats.unpaidInvoices?.length ? <ul>{stats.unpaidInvoices.slice(0, 4).map((invoice: any) => <li key={invoice.id}><div><strong>{invoice.retailer}</strong><small>{invoice.number} · {new Date(invoice.createdAt).toLocaleDateString()}</small></div><b>{money(invoice.balance)}</b></li>)}</ul> : <p className="queue-clear">No unpaid invoice balances found.</p>}
                    </article>
                    <article className="queue-card">
                      <div className="queue-heading"><div><p className="eyebrow">STOCK</p><h2>Reorder watch <span>{stats.lowStockProducts?.length ?? 0}</span></h2></div><button className="queue-link" onClick={() => { setSection("Inventory"); setTableQuery(""); }}>View inventory →</button></div>
                      {stats.lowStockProducts?.length ? <ul>{stats.lowStockProducts.slice(0, 4).map((product: any) => <li key={product.id}><div><strong>{product.name}</strong><small>{product.sku} · reorder at {product.threshold}</small></div><b>{product.available} available</b></li>)}</ul> : <p className="queue-clear">All products are above their reorder thresholds.</p>}
                    </article>
                    <article className="queue-card activity-card">
                      <div className="queue-heading"><div><p className="eyebrow">RECENT ACTIVITY</p><h2>Latest changes</h2></div><button className="queue-link" onClick={() => setSection("Audit log")}>Audit log →</button></div>
                      {stats.recentActivity?.length ? <ul>{stats.recentActivity.slice(0, 4).map((event: any) => <li key={event.id}><div><strong>{event.action.replaceAll(".", " · ")}</strong><small>{event.entity ?? "Workspace"} · {new Date(event.createdAt).toLocaleString()}</small></div></li>)}</ul> : <p className="queue-clear">Recent inventory and order changes will appear here.</p>}
                    </article>
                  </section>
                  { ["OWNER", "MANAGER"].includes(user.role) && <WorkspaceAI/> }
                </>
              )}
              {["Reports", "Invoices", "Price health"].includes(section) ? null : (
                <section className="panel">
                  <div className="panel-title">
                    <h2>
                      {section === "Overview"
                        ? "Recent orders"
                        : section === "Inventory"
                          ? "Stock availability"
                          : section}
                    </h2>
                    <label className="table-search"><span className="sr-only">Search {section.toLowerCase()}</span><input type="search" value={tableQuery} onChange={(e) => setTableQuery(e.target.value)} placeholder={`Search ${section.toLowerCase()}…`} disabled={!rows.length}/></label>
                  </div>
                  {rows.length === 0 ? (
                    <div className="empty">
                      <Package size={28} />
                      <h3>
                        {section === "Overview"
                          ? "No orders yet"
                          : section === "Inventory" ? "No products to stock" : `No ${section.toLowerCase()} yet`}
                      </h3>
                      <p>
                        {section === "Orders" || section === "Overview" ? "Add a retailer and product, then create your first order." : section === "Inventory" ? "Add products to your catalogue before recording stock." : `Create your first ${section.toLowerCase()} record to get started.`}
                      </p>
                      {(["Products", "Retailers", "Orders", "Inventory"].includes(section) && (section === "Products" ? user.role === "OWNER" : section === "Inventory" ? ["OWNER", "MANAGER", "WAREHOUSE"].includes(user.role) : ["OWNER", "MANAGER"].includes(user.role))) && <button className="secondary" onClick={() => setModal(true)}><Plus size={15}/>{section === "Inventory" ? "Receive stock" : `Create ${section.slice(0, -1).toLowerCase()}`}</button>}
                    </div>
                  ) : filteredRows.length === 0 ? (
                    <div className="empty search-empty"><h3>No matching records</h3><p>Try a different name, email, SKU or status.</p><button className="secondary" onClick={() => setTableQuery("")}>Clear search</button></div>
                  ) : (
                    <><div className="table-count">Showing {filteredRows.length} of {rows.length} records</div>
                    <div className="table-wrap">
                      <table>
                        <thead>
                          <tr>
                            {(section === "Retailers"
                              ? [
                                  "Retailer",
                                  "Email",
                                  "Credit limit",
                                    "Outstanding",
                                    ...(["OWNER", "MANAGER"].includes(user.role) ? ["Actions"] : []),
                                ]
                              : section === "Products" ||
                                  section === "Inventory"
                                ? [
                                    "Product",
                                    "SKU",
                                    "Price",
                                    "Physical",
                                    "Reserved",
                                    "Available",
                                    ...(section === "Products" && user.role === "OWNER" ? ["Actions"] : []),
                                  ]
                                : section === "Audit log"
                                  ? ["Action", "Entity", "Date"]
                                  : [
                                      "Order",
                                      "Retailer",
                                      "Status",
                                      "Value",
                                      "Date",
                                      "Actions",
                                    ]
                            ).map((c) => (
                              <th key={c}>{c}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {filteredRows.map((r) => (
                            <tr key={r.id}>
                              {(section === "Retailers"
                                ? [
                                    r.name,
                                    r.email ?? "—",
                                    money(r.creditLimit),
                                  money(r.outstanding),
                                  ...(["OWNER", "MANAGER"].includes(user.role) ? [<div className="row-actions" key="actions"><button type="button" disabled={busy} onClick={() => openEdit(r)}>Edit</button><button type="button" className="secondary" disabled={busy} onClick={() => void deleteRecord("retailers", r)}>Delete</button></div>] : []),
                                  ]
                                : section === "Products" ||
                                    section === "Inventory"
                                  ? [
                                      r.name,
                                      r.sku,
                                      money(r.unitPrice),
                                      r.physical,
                                      r.reserved,
                                      r.available,
                                      ...(section === "Products" && user.role === "OWNER" ? [<div className="row-actions" key="actions"><button type="button" disabled={busy} onClick={() => openEdit(r)}>Edit</button><button type="button" className="secondary" disabled={busy} onClick={() => void deleteRecord("products", r)}>Delete</button></div>] : []),
                                    ]
                                  : section === "Audit log"
                                    ? [
                                        r.action,
                                        r.entity,
                                        new Date(r.createdAt).toLocaleString(),
                                      ]
                                    : [
                                        r.id.slice(0, 8),
                                        r.retailer.name,
                                        <span className="badge" key="status">
                                          {r.status
                                            .replaceAll("_", " ")
                                            .toLowerCase()}
                                        </span>,
                                        money(r.total),
                                        new Date(
                                          r.createdAt,
                                        ).toLocaleDateString(),
                                        <div
                                          className="row-actions"
                                          key="actions"
                                        >
                                          {user.role === "OWNER" ||
                                          user.role === "MANAGER" ? (
                                            <>
                                              {r.status === "SUBMITTED" && <button disabled={busy} onClick={()=>changeOrder(r.id,"fulfil")}>Fulfil & create invoice</button>}
                                              {r.status ===
                                                "PENDING_APPROVAL" && (
                                                <button
                                                  disabled={busy}
                                                  onClick={() =>
                                                    changeOrder(r.id, "approve")
                                                  }
                                                >
                                                  Approve credit exception
                                                </button>
                                              )}
                                              {[
                                                "SUBMITTED",
                                                "PENDING_APPROVAL",
                                              ].includes(r.status) && (
                                                <button
                                                  className="secondary"
                                                  disabled={busy}
                                                  onClick={() =>
                                                    changeOrder(r.id, "cancel")
                                                  }
                                                >
                                                  Cancel order
                                                </button>
                                              )}
                                            </>
                                          ) : null}
                                        </div>,
                                      ]
                              ).map((v, i) => (
                                <td key={i}>{v}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    </>
                  )}
                </section>
              )}
              <p className="footnote">
                Live organization data · Inventory changes and orders are
                recorded in the audit trail.
              </p>
            </>
          )}
        </div>
      </main>
      {modal && (
        <dialog
          ref={dialogRef}
          onCancel={() => setModal(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          className="modal"
        >
          <h2 id="modal-title">
            {section === "Inventory"
              ? "Adjust inventory"
              : editing ? `Edit ${section.slice(0, -1).toLowerCase()}` : "Create " + section.slice(0, -1).toLowerCase()}
          </h2>
          <form onSubmit={save}>
            {section === "Products" && (
              <>
                <Field name="name" label="Product name" defaultValue={editing?.name ?? ""} />
                <Field name="sku" label="SKU" defaultValue={editing?.sku ?? ""} />
                <Field name="brand" label="Brand" defaultValue={editing?.brand ?? ""} />
                <Field name="category" label="Category" defaultValue={editing?.category ?? ""} />
                <Field
                  name="unitPrice"
                  label="Selling price"
                  type="number"
                  min={0.01}
                  step="0.01"
                  defaultValue={editing?.unitPrice ?? ""}
                />
                <Field
                  name="minimumStock"
                  label="Reorder threshold"
                  type="number"
                  min={0}
                  defaultValue={editing?.minimumStock ?? editing?.threshold ?? 10}
                />
              </>
            )}
            {section === "Retailers" && (
              <>
                <Field name="name" label="Business name" defaultValue={editing?.name ?? ""} />
                <Field name="email" label="Business email" type="email" required={false} defaultValue={editing?.email ?? ""} />
                <Field name="licenceNumber" label="Licence number" required={false} defaultValue={editing?.licenceNumber ?? ""} />
                <Field
                  name="creditLimit"
                  label="Credit limit"
                  type="number"
                  min={0}
                  defaultValue={editing?.creditLimit ?? 0}
                />
              </>
            )}
            {section === "Orders" && (
              <>
                <label>
                  Retailer
                  <select name="retailerId" required>
                    <option value="">Select retailer</option>
                    {retailers.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </label>
                <p className="hint">
                  Orders exceeding credit limits await manager approval and do
                  not reserve stock.
                </p>
              </>
            )}
            {section === "Orders" && <section className="order-lines"><div className="order-lines-heading"><div><strong>Products</strong><span>Choose each item and quantity</span></div><button type="button" className="secondary" onClick={() => setOrderItems([...orderItems, { productId: "", quantity: "1" }])}><Plus size={14}/>Add product</button></div>{orderItems.map((item, index) => { const product = products.find((candidate) => candidate.id === item.productId); return <div className="order-line" key={index}><label>Product<select value={item.productId} onChange={(e) => setOrderItems(orderItems.map((line, lineIndex) => lineIndex === index ? { ...line, productId: e.target.value } : line))} required><option value="">Select product</option>{products.map((p) => <option key={p.id} value={p.id} disabled={orderItems.some((line, lineIndex) => lineIndex !== index && line.productId === p.id)}>{p.name} · {p.available} available · {money(p.unitPrice)}</option>)}</select></label><label>Qty<input type="number" min={1} max={product?.available ?? 1000000} value={item.quantity} onChange={(e) => setOrderItems(orderItems.map((line, lineIndex) => lineIndex === index ? { ...line, quantity: e.target.value } : line))} required /></label><div className="order-line-total">{product ? money(Number(item.quantity || 0) * Number(product.unitPrice)) : "—"}</div><button type="button" className="remove-order-line" aria-label={`Remove product line ${index + 1}`} disabled={orderItems.length === 1} onClick={() => setOrderItems(orderItems.filter((_, lineIndex) => lineIndex !== index))}>Remove</button></div>})}<div className="order-estimate"><span>Estimated order total</span><strong>{money(orderItems.reduce((sum, item) => { const product = products.find((candidate) => candidate.id === item.productId); return sum + (product ? Number(item.quantity || 0) * Number(product.unitPrice) : 0); }, 0))}</strong></div></section>}
            {section === "Inventory" && (
              <>
                <label>
                  Product
                  <select name="productId" required>
                    <option value="">Select product</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} · {p.available} available
                      </option>
                    ))}
                  </select>
                </label>
                <Field
                  name="quantity"
                  label={
                    section === "Inventory"
                      ? "Quantity change (+ or −)"
                      : "Quantity"
                  }
                  type="number"
                  min={1}
                />
              </>
            )}
            {section === "Inventory" && <label>Movement type<select name="kind"><option value="RECEIPT">Receive stock</option><option value="ADJUSTMENT">Adjust stock</option></select></label>}
            {section === "Inventory" && (
              <Field
                name="reason"
                label="Reason for adjustment"
                minLength={5}
              />
            )}
            <div className="actions">
              <button
                type="button"
                className="secondary"
                onClick={() => { setModal(false); setEditing(null); setError(""); }}
              >
                Cancel
              </button>
              <button disabled={busy}>{busy ? "Saving…" : editing ? "Save changes" : "Save"}</button>
            </div>
            {error && (
              <p className="error" role="alert">
                {error}
              </p>
            )}
          </form>
        </dialog>
      )}
    </div>
  );
}
function Field({
  label,
  required = true,
  ...props
}: { label: string; required?: boolean } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label>
      {label}
      <input required={required} {...props} />
    </label>
  );
}
