"use client";

import { shopDetails, type Shop } from "./demo-data";
import { PrintButton } from "./reports";

export function CompanyProfileDocument({ shop = shopDetails }: { shop?: Shop }) {
  return (
    <article className="print-document company-profile-document" aria-label="Company profile">
      <header>
        <h2>{shop.name}</h2>
        <p>Company profile</p>
      </header>
      <section>
        <h3>Company details</h3>
        <dl>
          <div><dt>Address</dt><dd>{shop.address}</dd></div>
          <div><dt>GSTIN</dt><dd>{shop.gstin}</dd></div>
          <div><dt>Phone</dt><dd>{shop.phone}</dd></div>
        </dl>
      </section>
      <section>
        <h3>Bank details</h3>
        <p className="profile-bank-note">Sample bank details - not for payment.</p>
        <dl>
          <div><dt>Account name</dt><dd>{shop.bank.holder}</dd></div>
          <div><dt>Bank</dt><dd>{shop.bank.name}</dd></div>
          <div><dt>Branch</dt><dd>{shop.bank.branch}</dd></div>
          <div><dt>Account number</dt><dd>{shop.bank.account}</dd></div>
          <div><dt>IFSC</dt><dd>{shop.bank.ifsc}</dd></div>
        </dl>
      </section>
    </article>
  );
}

export function CompanyProfilePage() {
  return (
    <main className="page-content company-profile-page">
      <div className="page-heading">
        <div><h1>Profile</h1><p>Company details and bank information.</p></div>
        <div className="heading-actions"><PrintButton /></div>
      </div>
      <CompanyProfileDocument />
      <style>{`@media print { @page { size: A4 portrait; margin: 15mm; } }`}</style>
    </main>
  );
}
