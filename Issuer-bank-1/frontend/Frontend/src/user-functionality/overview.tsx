import React from "react";

const capabilityGroups = [
    {
        label: "Profile management",
        icon: "01",
        description: "Keep your personal details and security settings up to date.",
        actions: ["View personal information", "Update personal information", "Change password"],
    },
    {
        label: "Account management",
        icon: "02",
        description: "See everything important about your bank account in one place.",
        actions: ["View account details", "View balance and available balance", "View account status"],
    },
    {
        label: "Card management",
        icon: "03",
        description: "Manage the cards connected to your account.",
        actions: ["View cards", "View card details", "Activate / block / cancel card"],
    },
    {
        label: "Money transfers",
        icon: "04",
        description: "Move money securely and keep track of every transfer.",
        actions: ["Transfer money to another account", "View transfer history"],
    },
    {
        label: "Deposits & withdrawals",
        icon: "05",
        description: "Manage incoming and outgoing cash activity.",
        actions: ["Deposit money", "Withdraw money", "View deposit/withdrawal history"],
    },
    {
        label: "Transactions",
        icon: "06",
        description: "Find, review, and understand your account activity.",
        actions: ["View transaction history", "View transaction details", "Filter/search transactions"],
    },
    {
        label: "Money requests",
        icon: "07",
        description: "Request funds and respond to requests from other users.",
        actions: ["Send money request", "View sent/received requests", "Accept / reject / cancel requests"],
    },
    {
        label: "Refunds",
        icon: "08",
        description: "Submit refunds and follow their progress from request to resolution.",
        actions: ["Request a refund", "View refund requests", "View refund status"],
    },
];

const quickActions = [
    ["↗", "Transfer money", "Send funds securely"],
    ["+", "Deposit money", "Add funds to your account"],
    ["−", "Withdraw money", "Move funds out"],
    ["↩", "Request a refund", "Start a refund request"],
];


export default function Overview(){
    return(
        <main className="issuer-dashboard" id="overview">
                <header className="issuer-dashboard-header">
                    <div>
                        <p className="issuer-eyebrow">PERSONAL BANKING / OVERVIEW</p>
                        <h1>Good morning, Alex.</h1>
                        <p className="issuer-subtitle">Manage your money with clarity and confidence.</p>
                    </div>
                    <div className="issuer-header-actions">
                        <button className="issuer-icon-button" type="button" aria-label="Notifications">♧<span className="issuer-notification-dot" /></button>
                        <div className="issuer-profile-chip">
                            <div className="issuer-avatar">AP</div>
                            <div><strong>Alex Parker</strong><span>Personal account</span></div>
                            <span className="issuer-chevron">⌄</span>
                        </div>
                    </div>
                </header>

                <section className="issuer-overview-grid" aria-label="Account overview">
                    <div className="issuer-balance-card">
                        <div className="issuer-card-topline"><span>AVAILABLE BALANCE</span><button type="button" aria-label="Hide balance">◉</button></div>
                        <p className="issuer-balance">$24,680<span>.50</span></p>
                        <div className="issuer-balance-meta"><span className="issuer-status-dot" /> Account is active <span className="issuer-meta-divider" /> Updated just now</div>
                        <div className="issuer-balance-footer"><span>Checking account ···· 4821</span><span>USD</span></div>
                    </div>
                    <div className="issuer-stat-card"><span className="issuer-stat-icon green">↗</span><p>Money in</p><strong>$8,420.00</strong><small><b>+12.8%</b> this month</small></div>
                    <div className="issuer-stat-card"><span className="issuer-stat-icon coral">↘</span><p>Money out</p><strong>$3,174.25</strong><small><b>−4.2%</b> this month</small></div>
                </section>

                <section className="issuer-quick-actions" aria-label="Quick actions">
                    <div className="issuer-section-heading"><div><p className="issuer-eyebrow">SHORTCUTS</p><h2>What would you like to do?</h2></div><button className="issuer-text-button" type="button">View all <span>→</span></button></div>
                    <div className="issuer-action-list">
                        {quickActions.map(([symbol, title, text]) => <button className="issuer-action" type="button" key={title}><span className="issuer-action-icon">{symbol}</span><span><strong>{title}</strong><small>{text}</small></span><b>→</b></button>)}
                    </div>
                </section>

                <section className="issuer-capabilities" id="capabilities">
                    <div className="issuer-section-heading"><div><p className="issuer-eyebrow">ACCOUNT SERVICES</p><h2>Everything you need, in one place.</h2></div><span className="issuer-service-count">8 services</span></div>
                    <div className="issuer-capability-grid">
                        {capabilityGroups.map((group) => <article className="issuer-capability-card" key={group.label}>
                            <div className="issuer-capability-number">{group.icon}</div>
                            <div className="issuer-capability-copy"><h3>{group.label}</h3><p>{group.description}</p></div>
                            <ul>{group.actions.map((action) => <li key={action}><button type="button">{action}<span>→</span></button></li>)}</ul>
                        </article>)}
                    </div>
                </section>

                <footer className="issuer-dashboard-footer"><span>© 2026 Minkiy Bank</span><span>Secure banking <b>·</b> Privacy <b>·</b> Terms</span></footer>
            </main>
    )
}