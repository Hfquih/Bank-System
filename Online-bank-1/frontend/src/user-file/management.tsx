import React from "react";
import ApiClient from "../globalAPI/apiClient";
import "../styles/management.css";

type Account = {
  id: number;
  accountNumber: string;
  balance: string;
  availableBalance: string;
  currency: string;
  status: "active" | "frozen" | "closed";
  userId: number;
  createdAt: string;
  updatedAt: string;
};

export default function Management() {
  const [account, setAccount] = React.useState<Account | null>(null);
  const client = React.useMemo(() => ApiClient(), []);

  React.useEffect(() => {
   const getAccount = async () => {
     try {
       const { data } = await client.get("/auth/user-account");
       setAccount(data.account ?? data);
     } catch (error) {
       console.log(error);
     }
   };

   getAccount();
  }, [client]);

  const formatAmount = (value?: string | number) => {
   if (value === undefined || value === null || value === "") return "—";

   const currency = account?.currency ?? "USD";
   const numericValue = Number(value);

   if (Number.isNaN(numericValue)) return value.toString();

   return new Intl.NumberFormat("en-US", {
     style: "currency",
     currency,
     minimumFractionDigits: 2,
     maximumFractionDigits: 2,
   }).format(numericValue);
  };

  const formatDate = (value?: string) => {
   if (!value) return "Not available";

   return new Date(value).toLocaleDateString("en-GB", {
     day: "2-digit",
     month: "short",
     year: "numeric",
   });
  };

  const accountStatus = account?.status ?? "active";

  return (
   <section className="account-management-container">
     <div className="account-management-header">
       <div>
         <p className="account-management-eyebrow">Account overview</p>
         <h3>Account management</h3>
       </div>
       <span className={`account-status-badge ${accountStatus}`}>
         {accountStatus}
       </span>
     </div>

     <div className="account-highlight-card">
       <div className="account-highlight-copy">
         <span className="account-label">Primary account</span>
         <strong>{account?.accountNumber ?? "No account linked"}</strong>
       </div>

       <div className="account-balance-summary">
         <div>
           <span>Balance</span>
           <strong>{formatAmount(account?.balance)}</strong>
         </div>
         <div>
           <span>Available balance</span>
           <strong>{formatAmount(account?.availableBalance)}</strong>
         </div>
       </div>
     </div>

     <div className="account-stat-grid">
       <article className="account-stat-card">
         <span className="account-stat-label">Account</span>
         <strong>{account?.accountNumber ?? "—"}</strong>
         <small>Account number</small>
       </article>

       <article className="account-stat-card">
         <span className="account-stat-label">Balance</span>
         <strong>{formatAmount(account?.balance)}</strong>
         <small>Current balance</small>
       </article>

       <article className="account-stat-card">
         <span className="account-stat-label">Available</span>
         <strong>{formatAmount(account?.availableBalance)}</strong>
         <small>Available balance</small>
       </article>

       <article className="account-stat-card">
         <span className="account-stat-label">Status</span>
         <strong>{accountStatus}</strong>
         <small>Account status</small>
       </article>
     </div>

     <div className="account-details-panel">
       <div className="account-panel-header">
         <h4>Account details</h4>
       </div>

       <dl className="account-detail-list">
         <div>
           <dt>Account ID</dt>
           <dd>{account?.id ?? "—"}</dd>
         </div>
         <div>
           <dt>Currency</dt>
           <dd>{account?.currency ?? "USD"}</dd>
         </div>
         <div>
           <dt>User ID</dt>
           <dd>{account?.userId ?? "—"}</dd>
         </div>
         <div>
           <dt>Created</dt>
           <dd>{formatDate(account?.createdAt)}</dd>
         </div>
         <div>
           <dt>Updated</dt>
           <dd>{formatDate(account?.updatedAt)}</dd>
         </div>
         <div>
           <dt>Status</dt>
           <dd className="account-detail-status">{accountStatus}</dd>
         </div>
       </dl>
     </div>
   </section>
  );
}
