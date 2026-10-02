import React from "react";
import ApiClient from "../globalAPI/apiClient";
import "../styling/transaction.css";


type TransactionData = {
  id: number
  transactionId: number
  accountId: number
  type: string
  amount: string
  currency: string
  createdAt: string

  transaction: {
    id: number
    reference: string
    type: string
    status: string
    amount: string
    currency: string
    description: string
    createdAt: string
    updatedAt: string
  }

  account: {
    id: number
    accountNumber: string
    balance: string
    availableBalance: string
    currency: string
    status: string
    customerId: number
    createdAt: string
    updatedAt: string
  }
}


type MoneyRequest = {
    id: number
    amount: string
    currency: string
    description: string | null
    status: string
    requesterAccountId: number
    recipientAccountId: number
    createdAt: string
    updatedAt: string
}


export default function Transaction(){
    const [transaction , setTransaction] = React.useState<TransactionData[]>([])
    const [debitRequest , setDebitRequest] = React.useState<MoneyRequest[]>([])
    const [creditRequest , setCreditRequest] = React.useState<MoneyRequest[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [errorMessage, setErrorMessage] = React.useState("")
    const [filters, setFilters] = React.useState({
        search: "",
        type: "",
        status: "",
        transferType: "",
    })
    const [alert , setAlert] = React.useState({msg:"" , error:false , success:false , field:""})

    const client = ApiClient()

    function handleInputChange(event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        const {name , value} = event.currentTarget

        setFilters(prev =>{
            return{
                ...prev,
                [name] : value
            }
        })
    }

    React.useEffect(()=>{
        const getTransaction = async () => {
            const params = {
                ...(filters.search && { search: filters.search }),
                ...(filters.type && { type: filters.type }),
                ...(filters.status && { status: filters.status }),
                ...(filters.transferType && { transferType: filters.transferType }),
            }

            setIsLoading(true)
            setErrorMessage("")
            try{
                const {data} = await client.get("/auth/get-transaction", {
                    params,
                })

                setTransaction(data.Transaction)
                setIsLoading(false)
            }catch(error){
                setErrorMessage("Your transactions could not be loaded. Please try again.")
                console.log(error)
            }    
        }

        getTransaction()
    }, [filters])

    React.useEffect(()=>{
        const getRequest = async () => {
            try{
                const {data} = await client.get('/auth/get-request')

                setCreditRequest(data.creditRequest)

                setDebitRequest(data.debitRequest)
            }catch(error){
                console.log(error)
            }
        }

        getRequest()
    },[])

    const totalsByCurrency = transaction.reduce<Record<string, { debit: number; credit: number }>>((totals, item) => {
        const currency = item.currency || item.transaction.currency
        const amount = Number(item.amount)
        const type = item.type.toLowerCase()

        if (!Number.isFinite(amount) || (type !== "debit" && type !== "credit")) {
            return totals
        }

        totals[currency] ??= { debit: 0, credit: 0 }
        totals[currency][type] += amount
        return totals
    }, {})

    const formatAmount = (amount: string | number, currency: string) => {
        const value = Number(amount)
        if (!Number.isFinite(value)) return `${currency} ${amount}`

        return new Intl.NumberFormat(undefined, {
            style: "currency",
            currency,
            minimumFractionDigits: 2,
        }).format(value)
    }

    const formatDate = (date: string) => new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(date))

    const renderTotals = (type: "debit" | "credit") => {
        const currencies = Object.entries(totalsByCurrency)
        if (currencies.length === 0) return formatAmount(0, transaction[0]?.currency || "USD")

        return currencies.map(([currency, totals]) => formatAmount(totals[type], currency)).join(" · ")
    }

    async function acceptRequest(id:number){
        try{
            const {data} = await client.patch(`/auth/accept-request/${id}` , {})
     
            setAlert({
                msg:data.msg , success:true , error:false , field:"request"
            })

            setDebitRequest(prev => prev.map((reqs)=>{
                return reqs.id === id ? {...reqs , status:"accepted"} : reqs
            }))

            setTimeout(()=>{
                setAlert({
                    msg:"" , success:false , error:false , field:""
                })
            },3000)
            
        }catch(error){
            const err = error as any 

            setAlert({
                msg:err.response?.data?.errors?.[0]?.msg || err.response?.data?.msg || 'SOMETHING WONT WRONG' , error:true , success:false , field:'request'
            })

            setTimeout(()=>{
                setAlert({
                    msg:"" , success:false , error:false , field:""
                })
            },3000)
        }
    }

    async function rejectRequest(id:number){

        try{
            const {data} = await client.patch(`/auth/reject-request/${id}` , {})

            setAlert({
                msg:data.msg , success:true , error:false , field:"request"
            })

            setDebitRequest(prev => prev.map((reqs)=>{
                return reqs.id === id ? {...reqs , status:"rejected"} : reqs
            }))

            setTimeout(()=>{
                setAlert({
                    msg:"" , success:false , error:false , field:""
                })
            },3000)
        }catch(error){
            const err = error as any 

            setAlert({
                msg:err.response?.data?.errors?.[0]?.msg || err.response?.data?.msg || 'SOMETHING WONT WRONG' , error:true , success:false , field:'request'
            })

            setTimeout(()=>{
                setAlert({
                    msg:"" , success:false , error:false , field:""
                })
            },3000)
        }

    }


    return(
        <div className="customer-history-container">
            <div className="custumer-transaction">
                <header className="transaction-page-header">
                    <div>
                        <p className="transaction-eyebrow">ACCOUNT ACTIVITY</p>
                        <h1>Transactions</h1>
                        <p className="transaction-subtitle">Review your recent account activity.</p>
                    </div>
                    <span className="transaction-count">{transaction.length} {transaction.length === 1 ? "transaction" : "transactions"}</span>
                </header>

                <section className="transaction-summary" aria-label="Debit and credit totals">
                    <article className="transaction-summary-card transaction-summary-debit">
                        <span className="transaction-summary-icon" aria-hidden="true">↗</span>
                        <div>
                            <p>Total debits</p>
                            <strong>{renderTotals("debit")}</strong>
                        </div>
                    </article>
                    <article className="transaction-summary-card transaction-summary-credit">
                        <span className="transaction-summary-icon" aria-hidden="true">↙</span>
                        <div>
                            <p>Total credits</p>
                            <strong>{renderTotals("credit")}</strong>
                        </div>
                    </article>
                </section>

                <section className="transaction-list-section" aria-labelledby="transaction-list-title">
                    <div className="transaction-list-heading">
                        <div>
                            <p className="transaction-eyebrow">HISTORY</p>
                            <h2 id="transaction-list-title">All transactions</h2>
                        </div>
                    </div>

                    <div className="transaction-filters" aria-label="Filter transactions">
                        <label className="transaction-filter-search">
                            <span>Search reference</span>
                            <input
                                type="search"
                                value={filters.search}
                                placeholder="e.g. TRX-..."
                                name="search"
                                onChange={handleInputChange}
                            />
                        </label>
                        <label>
                            <span>Entry type</span>
                            <select value={filters.type} name="type" onChange={handleInputChange}>
                                <option value="">All entries</option>
                                <option value="debit">Debit</option>
                                <option value="credit">Credit</option>
                            </select>
                        </label>
                        <label>
                            <span>Status</span>
                            <select value={filters.status} name="status" onChange={handleInputChange}>
                                <option value="">All statuses</option>
                                <option value="pending">Pending</option>
                                <option value="processing">Processing</option>
                                <option value="completed">Completed</option>
                                <option value="failed">Failed</option>
                                <option value="cancelled">Cancelled</option>
                                <option value="reversed">Reversed</option>
                            </select>
                        </label>
                        <label>
                            <span>Transaction type</span>
                            <select value={filters.transferType} name="transferType" onChange={handleInputChange}>
                                <option value="">All transaction types</option>
                                <option value="transfer">Transfer</option>
                                <option value="deposit">Deposit</option>
                                <option value="withdrawal">Withdrawal</option>
                                <option value="payment">Payment</option>
                                <option value="refund">Refund</option>
                                <option value="fee">Fee</option>
                            </select>
                        </label>
                        <button
                            className="transaction-filter-reset"
                            type="button"
                            onClick={() => setFilters({ search: "", type: "", status: "", transferType: "" })}
                            disabled={!filters.search && !filters.type && !filters.status && !filters.transferType}
                        >
                            Clear filters
                        </button>
                    </div>

                    {isLoading ? (
                        <p className="transaction-empty-state" role="status">Loading transactions...</p>
                    ) : errorMessage ? (
                        <p className="transaction-empty-state transaction-error" role="alert">{errorMessage}</p>
                    ) : transaction.length === 0 ? (
                        <p className="transaction-empty-state">No transactions to show yet.</p>
                    ) : (
                        <div className="transaction-list">
                            {transaction.map((item) => {
                                const type = item.type.toLowerCase()
                                const isDebit = type === "debit"
                                const currency = item.currency || item.transaction.currency
                                const description = item.transaction.description || item.transaction.type
                                const status = item.transaction.status.toLowerCase()

                                return (
                                    <article className="transaction-row" key={item.id}>
                                        <span className={`transaction-direction-icon ${isDebit ? "is-debit" : "is-credit"}`} aria-hidden="true">
                                            {isDebit ? "↗" : "↙"}
                                        </span>
                                        <div className="transaction-row-main">
                                            <strong className="transaction-description">{description}</strong>
                                            <span className="transaction-reference">{item.transaction.reference}</span>
                                        </div>
                                        <div className="transaction-row-meta">
                                            <time dateTime={item.createdAt}>{formatDate(item.createdAt)}</time>
                                            <span className={`transaction-status transaction-status-${status}`}>{item.transaction.status}</span>
                                        </div>
                                        <strong className={`transaction-amount ${isDebit ? "is-debit" : "is-credit"}`}>
                                            {isDebit ? "−" : "+"}{formatAmount(item.amount, currency)}
                                        </strong>
                                    </article>
                                )
                            })}
                        </div>
                    )}
                </section>
            </div>

            <section className="customer-request-container" aria-labelledby="customer-request-title">
                <header className="customer-request-header">
                    <div>
                        <p className="transaction-eyebrow">REQUESTS</p>
                        <h2 id="customer-request-title">Money requests</h2>
                        <p className="customer-request-subtitle">Review requests sent to you and keep track of your own.</p>
                    </div>
                    <span className="customer-request-count">
                        {debitRequest.length + creditRequest.length} {debitRequest.length + creditRequest.length === 1 ? "request" : "requests"}
                    </span>
                </header>

                <div className="customer-request-columns">
                    <section className="customer-request-group" aria-labelledby="incoming-requests-title">
                        <div className="customer-request-group-heading">
                            <h3 id="incoming-requests-title">Sent to you</h3>
                            <span>{debitRequest.length}</span>
                        </div>
                        {debitRequest.length === 0 ? (
                            <p className="customer-request-empty">You have no incoming requests.</p>
                        ) : (
                            <div className="customer-request-list">
                                {debitRequest.map((request) => (
                                    <article className="customer-request-card" key={request.id}>
                                        <div className="customer-request-card-heading">
                                            <span className="customer-request-direction">Incoming request</span>
                                            <span className={`customer-request-status customer-request-status-${request.status.toLowerCase()}`}>
                                                {request.status}
                                            </span>
                                        </div>
                                        <strong className="customer-request-amount">{formatAmount(request.amount, request.currency)}</strong>
                                        <p className="customer-request-description">
                                            {request.description || "No description provided."}
                                        </p>
                                        <div className="customer-request-meta">
                                            <span>From account {request.requesterAccountId}</span>
                                            <time dateTime={request.createdAt}>{formatDate(request.createdAt)}</time>
                                        </div>
                                        {alert.field==="request" && <p className={`field ${alert.success ? "text-success" : alert.error ? "text-error" : ""}`}>{alert.msg}</p>}
                                        {request.status.toLowerCase() === "pending" && (
                                            <div className="customer-request-actions">
                                                <button className="customer-request-reject" type="button" onClick={()=>rejectRequest(request.id)}>Reject</button>
                                                <button className="customer-request-accept" type="button" onClick={()=>acceptRequest(request.id)}>Accept</button>
                                            </div>
                                        )}
                                    </article>
                                ))}
                            </div>
                        )}
                    </section>

                    <section className="customer-request-group" aria-labelledby="sent-requests-title">
                        <div className="customer-request-group-heading">
                            <h3 id="sent-requests-title">Sent by you</h3>
                            <span>{creditRequest.length}</span>
                        </div>
                        {creditRequest.length === 0 ? (
                            <p className="customer-request-empty">You have not sent any requests.</p>
                        ) : (
                            <div className="customer-request-list">
                                {creditRequest.map((request) => (
                                    <article className="customer-request-card" key={request.id}>
                                        <div className="customer-request-card-heading">
                                            <span className="customer-request-direction">Outgoing request</span>
                                            <span className={`customer-request-status customer-request-status-${request.status.toLowerCase()}`}>
                                                {request.status}
                                            </span>
                                        </div>
                                        <strong className="customer-request-amount">{formatAmount(request.amount, request.currency)}</strong>
                                        <p className="customer-request-description">
                                            {request.description || "No description provided."}
                                        </p>
                                        <div className="customer-request-meta">
                                            <span>To account {request.recipientAccountId}</span>
                                            <time dateTime={request.createdAt}>{formatDate(request.createdAt)}</time>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </section>
        </div>
    )
}