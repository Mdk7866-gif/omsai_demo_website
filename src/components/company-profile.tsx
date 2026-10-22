"use client";

import { useContext, useState, type FormEvent } from "react";
import { PROFILE_STORAGE_KEY, shopDetails, type Shop } from "./demo-data";
import { DemoContext } from "./demo-context";
import { PrintButton } from "./reports";

export function CompanyProfileDocument({ shop = shopDetails }: { shop?: Shop }) {
  return (
    <article className="print-document company-profile-document" aria-label="Company profile">
      <header>
        <p className="profile-document-label">Company profile</p>
        <h2>{shop.name}</h2>
      </header>
      <section className="profile-company-section">
        <h3>Company details</h3>
        <table className="profile-details-table" aria-label="Company details"><tbody>
          <tr><th scope="row">Company name</th><td>{shop.name}</td></tr>
          <tr><th scope="row">Address</th><td>{shop.address}</td></tr>
          <tr><th scope="row">GSTIN</th><td>{shop.gstin}</td></tr>
          <tr><th scope="row">Phone</th><td>{shop.phone}</td></tr>
        </tbody></table>
      </section>
      <section className="profile-bank-section">
        <h3>Bank account details</h3>
        {shop.bank.isSample !== false && <p className="profile-bank-note">Sample bank details - not for payment.</p>}
        <table className="profile-details-table" aria-label="Bank account details"><tbody>
          <tr><th scope="row">Account holder</th><td>{shop.bank.holder}</td></tr>
          <tr><th scope="row">Bank name</th><td>{shop.bank.name}</td></tr>
          <tr><th scope="row">Branch</th><td>{shop.bank.branch}</td></tr>
          <tr><th scope="row">Account number</th><td>{shop.bank.account}</td></tr>
          <tr><th scope="row">IFSC</th><td>{shop.bank.ifsc}</td></tr>
        </tbody></table>
      </section>
      <footer className="profile-document-footer"><span>Contact: {shop.phone}</span><span>Company profile</span></footer>
    </article>
  );
}

export function CompanyProfilePage() {
  const { data, change, notify } = useContext(DemoContext);
  const saved = data.shop ?? shopDetails;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Shop>(() => structuredClone(saved));
  const [error, setError] = useState("");
  const field = (label: string, key: "name" | "address" | "gstin" | "phone", maxLength = 160) => (
    <label className="field" key={key}>{label}
      {key === "address" ? <textarea required maxLength={400} value={draft[key]} onChange={e => setDraft(old => ({ ...old, [key]: e.target.value }))} /> :
        <input required type={key === "phone" ? "tel" : "text"} maxLength={maxLength} value={draft[key]} onChange={e => setDraft(old => ({ ...old, [key]: e.target.value }))} />}
    </label>
  );
  const bankField = (label: string, key: keyof Omit<Shop["bank"], "isSample">) => (
    <label className="field" key={key}>{label}
      <input required maxLength={160} value={draft.bank[key]} onChange={e => setDraft(old => ({ ...old, bank: { ...old.bank, [key]: e.target.value } }))} />
    </label>
  );
  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next: Shop = {
      name: draft.name.trim(), address: draft.address.trim(), gstin: draft.gstin.trim().toUpperCase(), phone: draft.phone.trim(),
      bank: { holder: draft.bank.holder.trim(), name: draft.bank.name.trim(), branch: draft.bank.branch.trim(), account: draft.bank.account.trim(), ifsc: draft.bank.ifsc.trim().toUpperCase(), isSample: draft.bank.isSample !== false },
    };
    const bankValues = [next.bank.holder, next.bank.name, next.bank.branch, next.bank.account, next.bank.ifsc];
    if ([next.name, next.address, next.gstin, next.phone, ...bankValues].some(value => !value)) {
      setError("Fill in all company and bank details."); return;
    }
    if (!next.bank.isSample && bankValues.some(value => /\bsample\b|\bdemo\b|x{3,}/i.test(value))) {
      setError("Replace the sample bank details before marking them as real."); return;
    }
    try {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(next));
    } catch {
      setError("Changes could not be saved in this browser. Free some browser storage and try again."); return;
    }
    change(current => ({ ...current, shop: structuredClone(next) }));
    setEditing(false); setError(""); notify("Company profile saved.");
  }
  return (
    <main className="page-content company-profile-page">
      <div className="page-heading">
        <div><h1>Profile</h1><p>Company details and bank information.</p></div>
        <div className="heading-actions">
          {!editing && <button className="outline" onClick={() => { setDraft(structuredClone(saved)); setError(""); setEditing(true); }}>Edit profile</button>}
          {!editing && <PrintButton />}
        </div>
      </div>
      {editing && <form className="profile-editor" onSubmit={save}>
        <h2>Edit company profile</h2>
        <p>Save changes to update the profile PDF and new farmer bills. Saved bills keep their original details.</p>
        <div className="form-grid">{field("Company name", "name")}{field("Phone", "phone", 40)}</div>
        {field("Company address", "address")}
        {field("GSTIN", "gstin", 20)}
        <h3>Bank details</h3>
        <div className="form-grid">{bankField("Account holder", "holder")}{bankField("Bank name", "name")}{bankField("Branch", "branch")}{bankField("Account number", "account")}{bankField("IFSC", "ifsc")}</div>
        <label className="checkbox-field"><input type="checkbox" checked={draft.bank.isSample !== false} onChange={e => setDraft(old => ({ ...old, bank: { ...old.bank, isSample: e.target.checked } }))} /> These are sample bank details</label>
        {error && <p className="error" role="alert">{error}</p>}
        <div className="profile-editor-actions"><button type="button" className="outline" onClick={() => { setEditing(false); setError(""); }}>Cancel</button><button className="primary" type="submit">Save changes</button><small>Saved in this browser.</small></div>
      </form>}
      <CompanyProfileDocument shop={saved} />
      <style>{`@media print { @page { size: A4 portrait; margin: 16mm; } }`}</style>
    </main>
  );
}
