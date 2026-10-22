"use client";

import { useContext, useState, type FormEvent } from "react";
import { PROFILE_STORAGE_KEY, shopDetails, type Shop } from "./demo-data";
import { DemoContext } from "./demo-context";
import { PrintButton } from "./reports";
import { CompanyLogo } from "./company-logo";

export function CompanyProfileDocument({ shop = shopDetails }: { shop?: Shop }) {
  return (
    <article className="print-document company-profile-document" aria-label="Company profile">
      <header>
        <div>
        <h2>{shop.name.includes(",") ? <>{shop.name.slice(0, shop.name.indexOf(",") + 1)}<br />{shop.name.slice(shop.name.indexOf(",") + 1).trim()}</> : shop.name}</h2>
        <p className="profile-document-label">Company profile</p>
        </div>
        <CompanyLogo />
      </header>
      <section className="profile-about-section"><h3>About</h3><p>{shop.about}</p></section>
      <section className="profile-offerings"><h3>What we offer</h3>
        <p><strong>Fertilisers:</strong> Crop nutrition inputs</p>
        <p><strong>Pesticides:</strong> Crop protection inputs</p>
        <p><strong>Seeds:</strong> Agricultural seeds</p>
      </section>
      <section className="profile-company-section">
        <h3>Business details</h3>
        <dl className="profile-detail-list">
          <div><dt>Business name:</dt><dd>{shop.name}</dd></div>
          <div><dt>Address:</dt><dd>{shop.address}</dd></div>
          <div><dt>GSTIN:</dt><dd>{shop.gstin}</dd></div>
          {shop.pan && <div><dt>PAN No.:</dt><dd>{shop.pan}</dd></div>}
          {shop.licence && <div><dt>PL No.:</dt><dd>{shop.licence}</dd></div>}
          <div><dt>Phone:</dt><dd>{shop.phone}</dd></div>
        </dl>
      </section>
      <section className="profile-bank-section">
        <h3>Bank details</h3>
        {shop.bank.isSample !== false && <p className="profile-bank-note">Sample bank details - not for payment.</p>}
        <dl className="profile-detail-list">
          <div><dt>Account number:</dt><dd>{shop.bank.account}</dd></div>
          <div><dt>Account name:</dt><dd>{shop.bank.holder}</dd></div>
          <div><dt>Bank name:</dt><dd>{shop.bank.name}</dd></div>
          {shop.bank.branch && <div><dt>Branch:</dt><dd>{shop.bank.branch}</dd></div>}
          <div><dt>IFSC:</dt><dd>{shop.bank.ifsc}</dd></div>
        </dl>
      </section>
      <footer className="profile-document-footer"><span>{shop.name}</span><span>1</span></footer>
    </article>
  );
}

export function CompanyProfilePage() {
  const { data, change, notify, open } = useContext(DemoContext);
  const saved = data.shop ?? shopDetails;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Shop>(() => structuredClone(saved));
  const [error, setError] = useState("");
  const field = (label: string, key: "name" | "address" | "gstin" | "phone" | "pan" | "licence", maxLength = 160) => (
    <label className="field" key={key}>{label}
      {key === "address" ? <textarea required maxLength={400} value={draft[key]} onChange={e => setDraft(old => ({ ...old, [key]: e.target.value }))} /> :
        <input required={key !== "pan" && key !== "licence"} type={key === "phone" ? "tel" : "text"} maxLength={maxLength} value={draft[key]} onChange={e => setDraft(old => ({ ...old, [key]: e.target.value }))} />}
    </label>
  );
  const bankField = (label: string, key: keyof Omit<Shop["bank"], "isSample">) => (
    <label className="field" key={key}>{label}
      <input required={key !== "branch"} maxLength={160} value={draft.bank[key]} onChange={e => setDraft(old => ({ ...old, bank: { ...old.bank, [key]: e.target.value } }))} />
    </label>
  );
  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next: Shop = {
      about: draft.about.trim(), pan: draft.pan.trim().toUpperCase(), licence: draft.licence.trim(),
      name: draft.name.trim(), address: draft.address.trim(), gstin: draft.gstin.trim().toUpperCase(), phone: draft.phone.trim(),
      bank: { holder: draft.bank.holder.trim(), name: draft.bank.name.trim(), branch: draft.bank.branch.trim(), account: draft.bank.account.trim(), ifsc: draft.bank.ifsc.trim().toUpperCase(), isSample: draft.bank.isSample !== false },
    };
    const bankValues = [next.bank.holder, next.bank.name, next.bank.account, next.bank.ifsc];
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
          {!editing && <button className="primary" onClick={() => open({ kind: "companyProfile" })}>Print / Save as PDF</button>}
        </div>
      </div>
      {editing && <form className="profile-editor" onSubmit={save}>
        <h2>Edit company profile</h2>
        <p>Save changes to update the profile PDF and new farmer bills. Saved bills keep their original details.</p>
        <div className="form-grid">{field("Company name", "name")}{field("Phone", "phone", 40)}</div>
        {field("Company address", "address")}
        {field("GSTIN", "gstin", 20)}
        <div className="form-grid">{field("PAN No.", "pan", 20)}{field("PL No.", "licence", 50)}</div>
        <label className="field">About the company<textarea required maxLength={700} rows={3} value={draft.about} onChange={e => setDraft(old => ({ ...old, about: e.target.value }))} /></label>
        <h3>Bank details</h3>
        <div className="form-grid">{bankField("Account holder", "holder")}{bankField("Bank name", "name")}{bankField("Branch", "branch")}{bankField("Account number", "account")}{bankField("IFSC", "ifsc")}</div>
        <label className="checkbox-field"><input type="checkbox" checked={draft.bank.isSample !== false} onChange={e => setDraft(old => ({ ...old, bank: { ...old.bank, isSample: e.target.checked } }))} /> These are sample bank details</label>
        {error && <p className="error" role="alert">{error}</p>}
        <div className="profile-editor-actions"><button type="button" className="outline" onClick={() => { setEditing(false); setError(""); }}>Cancel</button><button className="primary" type="submit">Save changes</button><small>Saved in this browser.</small></div>
      </form>}
      <CompanyProfileDocument shop={saved} />
      <style>{`@media print { @page { size: A4 portrait; margin: 18mm 19mm; } }`}</style>
    </main>
  );
}


export function CompanyProfilePdfPreview() {
  const { data, notify } = useContext(DemoContext);
  const shop = data.shop ?? shopDetails;
  const [downloading, setDownloading] = useState(false);
  async function download() {
    setDownloading(true);
    try {
      const { createCompanyProfilePdf } = await import("./company-profile-pdf");
      const bytes = await createCompanyProfilePdf(shop);
      const url = URL.createObjectURL(new Blob([new Uint8Array(bytes)], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url; link.download = "Omsai_Company_Profile.pdf"; link.click();
      setTimeout(() => URL.revokeObjectURL(url), 30000);
    } catch { notify("The PDF could not be generated. Check the profile details and try again."); }
    finally { setDownloading(false); }
  }
  return <>
    <div className="report-controls">
      <span>Company profile</span>
      <div className="profile-preview-actions">
        <button className="outline" disabled={downloading} onClick={download}>{downloading ? "Generating PDF..." : "Download PDF"}</button>
        <PrintButton />
      </div>
    </div>
    <CompanyProfileDocument shop={shop} />
  </>;
}
