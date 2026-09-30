import React from "react";
import ApiClient from "../globalAPI/apiClient";
import "../styling/capabilities.css";


type AccountData = {
  id: number;
  accountNumber: string;
  balance: string;
  availableBalance: string;
  currency: string;
  status: string;

  customer: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
};

export default function Capabilities(){
    const [account , setAccount] = React.useState<AccountData | null>(null)

    const client = ApiClient()

    React.useEffect(()=>{
        const getAccount = async () => {
            try{
                const {data} = await client.get("/auth/account")

                setAccount(data.account)
            }catch(error){
                console.log(error)
            }
        }

        getAccount()
    },[])

    return(
        <div className="account-container">
            {!account ? (
                <div className="account-loading" role="status">Loading your account details...</div>
            ) : (
                <main className="account-page">
                    <header className="account-page-header">
                        <div>
                            <p className="account-eyebrow">PERSONAL BANKING / MY ACCOUNT</p>
                            <h1>Your account</h1>
                            <p className="account-subtitle">A clear view of your balance, account status, and personal details.</p>
                        </div>
                        <div className={`account-status account-status-${account.status.toLowerCase()}`}>
                            <span className="account-status-dot" />
                            {account.status}
                        </div>
                    </header>

                    <section className="account-summary" aria-label="Account balance summary">
                        <div className="account-balance-panel">
                            <span className="account-label">AVAILABLE BALANCE</span>
                            <strong>{account.availableBalance} <small>{account.currency}</small></strong>
                            <span className="account-number">Account ending in {account.accountNumber.slice(-4)}</span>
                        </div>
                        <div className="account-balance-detail">
                            <span className="account-label">CURRENT BALANCE</span>
                            <strong>{account.balance} <small>{account.currency}</small></strong>
                            <span className="account-detail-note">Your total account balance</span>
                        </div>
                    </section>

                    <section className="account-details-grid" aria-label="Account details">
                        <article className="account-detail-card">
                            <div className="account-card-heading">
                                <div className="account-card-icon">◎</div>
                                <div><span className="account-label">ACCOUNT INFORMATION</span><h2>Account details</h2></div>
                            </div>
                            <dl>
                                <div><dt>Account number</dt><dd>{account.accountNumber}</dd></div>
                                <div><dt>Account ID</dt><dd>#{account.id}</dd></div>
                                <div><dt>Currency</dt><dd>{account.currency}</dd></div>
                                <div><dt>Status</dt><dd className="account-inline-status"><span className="account-status-dot" />{account.status}</dd></div>
                            </dl>
                        </article>

                        <article className="account-detail-card">
                            <div className="account-card-heading">
                                <div className="account-card-icon account-card-icon-coral">✦</div>
                                <div><span className="account-label">ACCOUNT HOLDER</span><h2>Personal details</h2></div>
                            </div>
                            <dl>
                                <div><dt>Full name</dt><dd>{account.customer.firstName} {account.customer.lastName}</dd></div>
                                <div><dt>Email address</dt><dd>{account.customer.email}</dd></div>
                                <div><dt>Phone number</dt><dd>{account.customer.phone}</dd></div>
                                <div><dt>Customer ID</dt><dd>#{account.customer.id}</dd></div>
                            </dl>
                        </article>
                    </section>
                </main>
            )}
        </div>
    )
}