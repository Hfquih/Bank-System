import React from "react";
import ApiClient from "../globalAPI/apiClient";
import "../styles/transaction.css";


type Transfer = {
    id: number;
    transactionId: number;
    type: "debit" | "credit" | string;
    amount: string | number;
    currency: string;
    createdAt: string;
    account?: { id: number; balance: string | number; currency: string };
    transaction: {
        reference: string;
        type: string;
        status: string;
        description?: string | null;
        createdAt: string;
    };
};

type MoneyRequest = {
    id: number;
    amount: string | number;
    currency: string;
    description?: string | null;
    status: string;
    requesterAccountId: number;
    recipientAccountId: number;
    createdAt: string;
};

const transactionStatus = [
    {id : 1 , status : "pending"},
    {id : 2 , status : "completed"},
    {id : 3 , status : "failed"},
    {id : 4 , status : "cancelled"},
    {id : 5 , status : "reversed"}
]


const transferType = [
    {id : 1 , type : "transfer"},
    {id : 2 , type : "deposit"},
    {id : 3 , type : "withdrawal"},
    {id : 4 , type : "payment"},
    {id : 5 , type : "refund"}
]

export type UserRefund = {
    id: number;
    transactionId: number;
    accountId: number;
    amount: string;
    reason: string;
    status: "pending" | "approved" | "rejected";
    createdAt: string;
    updatedAt: string;

    transaction: {
        id: number;
        reference: string;
        type: "transfer" | "deposit" | "withdrawal" | "payment" | "refund" | "fee";
        status: "pending" | "processing" | "completed" | "failed" | "cancelled" | "reversed";
        amount: string;
        currency: string;
        description: string | null;
        createdAt: string;
        updatedAt: string;
    };
};

export default function Transaction() {
    const [transaction, setTransaction] = React.useState<Transfer[]>([]);
    const [demande, setDemande] = React.useState<MoneyRequest[]>([]);
    const [request, setRequest] = React.useState<MoneyRequest[]>([]);
    const [refund , setRefund] = React.useState<UserRefund[]>([])
    const [filter, setFilter] = React.useState({
        search : "",
        type : "",
        status : "",
        transferType:""
    });
    const [alert , setAlert] = React.useState({msg:"" , error:false , success:false})
    const [selectedTransaction, setSelectedTransaction] = React.useState<number | null>(null);
    const client = React.useMemo(() => ApiClient(), []);

    React.useEffect(() => {
        const getTransaction = async () => {
            try {
                const params = new URLSearchParams({...filter});
                const { data } = await client.get(`/auth/user-transfer?${params}`);
                setTransaction(data.transfer ?? []);
            } catch (error) {
                console.log(error);
            }
        };
        getTransaction();
    }, [client , filter]);

    React.useEffect(() => {
        const getDemandRequest = async () => {
            try {
                const { data } = await client.get("/auth/demande-request");
                setDemande(data.demande ?? []);
                setRequest(data.request ?? []);
            } catch (error) {
                console.log(error);
            }
        };
        getDemandRequest();
    }, [client]);

    React.useEffect(()=>{
        const getRefund = async () => {
            try{
                const {data} = await client.get('/auth/user-refund')

                setRefund(data.userRefund ?? [])
            }catch(error){
                console.log(error)
            }
        }

        getRefund()
    },[])

    function handleInputs(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>){
        const {name , value} = e.currentTarget

        setFilter((prev)=>{
            return{
                ...prev,
                [name] : value
            }
        })
    }

    const formatAmount = (amount: string | number, currency: string) =>
        new Intl.NumberFormat("en-US", { style: "currency", currency }).format(Number(amount));
    const formatDate = (date: string) =>
        new Date(date).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });


    const requestHistory = [
        ...demande.map((item) => ({ ...item, direction: "Sent" })),
        ...request.map((item) => ({ ...item, direction: "Received" })),
    ].sort((first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime());

    const totalCredits = transaction
        .filter((item) => item.type === "credit")
        .reduce((total, item) => total + Number(item.amount), 0);

    const totalDebits = transaction
        .filter((item) => item.type === "debit")
        .reduce((total, item) => total + Number(item.amount), 0);
    const account = transaction[0]?.account;

    const acceptRequest = async (requestId:number) => {
        try{
            const {data} = await client.patch(`/auth/accept-request/${requestId}` , {})

            setRequest(prev => prev.map((req)=>{
                return req.id === requestId ? {...req , status : 'accepted'} : req
            }))

            setAlert({
                msg:data.msg , success:true , error:false
            })

            setTimeout(()=>{
                setAlert({
                    msg:"" , success:false , error:false
                })
            },3000)
        }catch(error){
            const err = error as any 

            setAlert({
                msg:err.response?.data?.errors?.[0]?.msg || err.response?.data?.msg || 'SOMETHING WONT WRONG' , error:true , success:false
            })

            setTimeout(()=>{
                setAlert({
                    msg:"" , success:false , error:false
                })
            },3000)
        }
    };

    const rejectRequest = async (requestId : number) =>{
        try{
            const {data} = await client.patch(`/auth/reject-request/${requestId}` , {})

            setRequest(prev => prev.map((req)=>{
                return req.id === requestId ? {...req , status : "rejected"} : req
            }))

            setAlert({
                msg : data.msg , success : true , error : false
            })

            setTimeout(()=>{
                setAlert({
                    msg : "" , success : false , error : false
                })
            },3000)
        }catch(error){
            const err = error as any 

            setAlert({
                msg:err.response?.data?.errors?.[0]?.msg || err.response?.data?.msg || 'SOMETHING WONT WRONG' , error:true , success:false
            })

            setTimeout(()=>{
                setAlert({
                    msg:"" , success:false , error:false
                })
            },3000)
        }
    }

    return (
        <div className="user-transaction-container">
            <header className="transaction-header">
                <div>
                    <p className="transaction-eyebrow">Account activity</p>
                    <h1>Transactions</h1>
                    <p>Review your transfers and manage incoming money requests.</p>
                </div>
                <strong className="transaction-count">{transaction.length} transactions</strong>
            </header>

            <section className="transaction-panel">
                <div className="transaction-toolbar">
                    <label className="transaction-search">
                        <span>Search transactions</span>
                        <input value={filter.search} name="search" onChange={handleInputs} placeholder="Reference, description or amount" />
                    </label>
                    <label>
                        <span>Type</span>
                        <select value={filter.type} name="type" onChange={handleInputs}>
                            <option value="">Debit / Credit</option>
                            <option value="credit">Credit</option>
                            <option value="debit">Debit</option>
                        </select>
                    </label>
                    <label>
                        <span>Status</span>
                        <select value={filter.status} name="status" onChange={handleInputs}>
                            <option value="">All statuses</option>
                            {transactionStatus.map((trans)=>{
                                return <option key={trans.id} value={trans.status}>{trans.status}</option>
                            })}
                        </select>
                    </label>
                    <label>
                        <span>Transfer Type</span>
                        <select value={filter.transferType} name="transferType" onChange={handleInputs}>
                            <option value="">Transfer types</option>
                            {transferType.map((trans)=>{
                                return <option key={trans.id} value={trans.type}>{trans.type}</option>
                            })}
                        </select>
                    </label>
                </div>
                <div className="transaction-list">
                    {transaction.length === 0 && <p className="transaction-empty">No transactions match your filters.</p>}
                    {transaction.map((item) => {
                        const open = selectedTransaction === item.id;
                        return (
                            <article className={`transaction-row ${item.type}`} key={item.id}>
                                <div className="transaction-direction" aria-label={item.type}>{item.type === "credit" ? "+" : "−"}</div>
                                <div className="transaction-main">
                                    <strong>{item.transaction.description || "Money transfer"}</strong>
                                    <small>{item.transaction.reference}</small>
                                </div>
                                <div className="transaction-cell"><span>Amount</span><strong>{formatAmount(item.amount, item.currency)}</strong></div>
                                <div className="transaction-cell"><span>Date</span><strong>{formatDate(item.createdAt)}</strong></div>
                                <span className={`transaction-status ${item.transaction.status}`}>{item.transaction.status}</span>
                                <button className="transaction-details-button" type="button" onClick={() => setSelectedTransaction(open ? null : item.id)}>{open ? "Hide" : "View"}</button>
                                {open && <div className="transaction-details">
                                    <span>Transaction ID <strong>#{item.transactionId}</strong></span>
                                    <span>Account ID <strong>#{item.account?.id ?? "—"}</strong></span>
                                    <span>Transfer type <strong>{item.transaction.type}</strong></span>
                                    <span>Currency <strong>{item.currency}</strong></span>
                                </div>}
                            </article>
                        );
                    })}
                </div>
            </section>

            <section className="request-grid">
                <div className="request-panel">
                    <div className="request-panel-heading">
                        <div>
                            <p className="transaction-eyebrow">Your activity</p>
                            <h2>Money requests you sent</h2></div><span>{demande.length}</span>
                        </div>
                        {demande.length === 0 ? 
                            <p className="transaction-empty">You have not sent any requests.</p> : demande.map((item) => (
                            <div className="request-card" key={item.id}>
                                <div>
                                    <strong>{formatAmount(item.amount, item.currency)}</strong>
                                    <small>To account #{item.recipientAccountId}</small>
                                </div>
                                <span className={`transaction-status ${item.status}`}>{item.status}</span>
                                
                                <p>{item.description || "No description"}</p><time>{formatDate(item.createdAt)}</time>
                            </div>
                        ))}
                </div>

                <div className="request-panel">
                    <div className="request-panel-heading">
                        <div>
                            <p className="transaction-eyebrow">Needs your decision</p>
                            <h2>Incoming requests</h2>
                        </div>
                        <span>{request.filter((item) => item.status === "pending").length}</span>
                    </div>
                    {request.length === 0 ? 
                            <p className="transaction-empty">No incoming requests.</p> : request.map((item) => (
                            <div className="request-card" key={item.id}>
                                <div>
                                    <strong>{formatAmount(item.amount, item.currency)}</strong>
                                    <small>From account #{item.requesterAccountId}</small>
                                </div>
                                <span className={`transaction-status ${item.status}`}>{item.status}</span>
                                <p>{item.description || "No description"}</p>{item.status === "pending" && 
                                <div className="request-actions">
                                    <button type="button"  onClick={() => acceptRequest(Number(item.id))}>Accept</button>
                                    <button type="button"  onClick={() => rejectRequest(Number(item.id))}>Reject</button>
                                </div>}
                            </div>
                    ))}
                    {alert.msg && <p className={`alert ${alert.success ? 'text-success' : alert.error ? 'text-error' : ''}`}>{alert.msg}</p>}
                </div>
                
            </section>

            <section className="request-historiy">
                <div className="continuation-heading">
                    <div>
                        <p className="transaction-eyebrow">Request activity</p>
                        <h2>Request history</h2>
                    </div>
                    <span>{requestHistory.length} requests</span>
                </div>
                {requestHistory.length === 0 ? <p className="transaction-empty">No request history yet.</p> : (
                    <div className="request-history-list">
                        {requestHistory.map((item) => (
                            <article className="request-history-row" key={`${item.direction}-${item.id}`}>
                                <div className={`history-icon ${item.direction.toLowerCase()}`}>{item.direction === "Sent" ? "↑" : "↓"}</div>
                                <div>
                                    <strong>{item.direction} request</strong>
                                    <small>{item.direction === "Sent" ? `To account #${item.recipientAccountId}` : `From account #${item.requesterAccountId}`}</small>
                                </div>
                                <strong>{formatAmount(item.amount, item.currency)}</strong>
                                <span className={`transaction-status ${item.status}`}>{item.status}</span>
                                <time>{formatDate(item.createdAt)}</time>
                                {item.description && <p>{item.description}</p>}
                            </article>
                        ))}
                    </div>
                )}
            </section>

            <section className="user-refund-display">
                <div className="continuation-heading">
                    <div>
                        <p className="transaction-eyebrow">Refund activity</p>
                        <h2>Your refund requests</h2>
                    </div>
                    <span>{refund.length} {refund.length === 1 ? "request" : "requests"}</span>
                </div>
                {refund.length === 0 ? (
                    <p className="transaction-empty">You have not submitted any refund requests.</p>
                ) : (
                    <div className="refund-list">
                        {refund.map((item) => (
                            <article className="refund-card" key={item.id}>
                                <div className="refund-card-heading">
                                    <div>
                                        <p className="refund-label">Requested amount</p>
                                        <strong className="refund-amount">
                                            {formatAmount(item.amount, item.transaction.currency)}
                                        </strong>
                                    </div>
                                    <span className={`transaction-status ${item.status}`}>{item.status}</span>
                                </div>
                                <div className="refund-details">
                                    <div>
                                        <span>Transaction</span>
                                        <strong>{item.transaction.reference}</strong>
                                    </div>
                                    <div>
                                        <span>Submitted</span>
                                        <time dateTime={item.createdAt}>{formatDate(item.createdAt)}</time>
                                    </div>
                                    <div>
                                        <span>Last updated</span>
                                        <time dateTime={item.updatedAt}>{formatDate(item.updatedAt)}</time>
                                    </div>
                                </div>
                                <div className="refund-reason">
                                    <span>Reason</span>
                                    <p>{item.reason}</p>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>

            <section className="debit-credit-detail">
                <div className="continuation-heading">
                    <div>
                        <p className="transaction-eyebrow">Financial summary</p>
                        <h2>Debit &amp; credit details</h2>
                    </div>
                    <span>{account?.currency ?? "USD"} account</span>
                </div>
                <div className="balance-summary">
                    <div><small>Total credited</small><strong className="credit-value">+{formatAmount(totalCredits, account?.currency ?? "USD")}</strong></div>
                    <div><small>Total debited</small><strong className="debit-value">−{formatAmount(totalDebits, account?.currency ?? "USD")}</strong></div>
                    <div><small>Current balance</small><strong>{account ? formatAmount(account.balance, account.currency) : "—"}</strong></div>
                </div>
                <div className="statement-list">
                    {transaction.length === 0 ? <p className="transaction-empty">No statement entries to display.</p> : transaction.map((item) => (
                        <div className="statement-row" key={`statement-${item.id}`}>
                            <span className={`statement-marker ${item.type}`}>{item.type === "credit" ? "+" : "−"}</span>
                            <div><strong>{item.transaction.description || "Money transfer"}</strong><small>{formatDate(item.createdAt)} · {item.transaction.reference}</small></div>
                            <strong className={item.type === "credit" ? "credit-value" : "debit-value"}>{item.type === "credit" ? "+" : "−"}{formatAmount(item.amount, item.currency)}</strong>
                            <span className={`transaction-status ${item.transaction.status}`}>{item.transaction.status}</span>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
