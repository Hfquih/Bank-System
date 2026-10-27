import React from "react";
import "../styling/request.css";
import ApiClient from "../globalAPI/apiClient";
import globalErr from "../globalAPI/globalErr";


type TransferForm = {
  amount: string;
  accountNumber: string;
  description: string;
};

type DepositForm = {
  amount: string;
  description: string;
};

type withdrawForm = {
  amount: string;
  cardNumber:string;
  description: string;
};

type RefundForm = {
  transactionId: string;
  reason: string;
};


export default function Request(){
    const [transfer , setTransfer] = React.useState<TransferForm>({
        amount : "",
        accountNumber:"",
        description:""
    })

    const [receive , setReceive] = React.useState<TransferForm>({
        amount : "",
        accountNumber:"",
        description:""
    })

    const [deposit , setDeposit] = React.useState<DepositForm>({
        amount : "",
        description:""
    })

    const [withdraw , setWithdraw] = React.useState<withdrawForm>({
        amount : "",
        cardNumber:"",
        description:""
    })

    const [refund , setRefund] = React.useState<RefundForm>({
        transactionId : "",
        reason:""
    })

    const [alert , setAlert] = React.useState({msg:"" , error:false , success:false , field:""})

    type Transfer = typeof transfer
    type Receive = typeof receive
    type Deposit = typeof deposit
    type Withdraw = typeof withdraw
    type Refund = typeof refund

    const [errors, setErrors] = React.useState<{
        transfer: Partial<Record<keyof Transfer, string>>
        receive: Partial<Record<keyof Receive, string>>
        deposit: Partial<Record<keyof Deposit, string>>
        withdraw: Partial<Record<keyof Withdraw, string>>
        refund: Partial<Record<keyof Refund, string>>
    }>({
        transfer: {},
        receive: {},
        deposit: {},
        withdraw: {},
        refund: {}
    })

    const client = ApiClient()


    function handleInputs<T>(
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
        setState: React.Dispatch<React.SetStateAction<T>>
    ) {
        const { name, value } = event.currentTarget;

        setState(prev => ({
            ...prev,
            [name]: value
        }));
    }

    async function transferMoney(event: React.FormEvent<HTMLFormElement>){
        event.preventDefault()

        if(!checkInputs(transfer , "transfer"))return

        try{
            const {data} = await client.post("/auth/createTransaction" , {...transfer})

            setTransfer({
                amount:"",
                accountNumber:"",
                description:""
            })

            setAlert({
                msg:data.msg , success:true , error:false , field:"transfer"
            })

            setTimeout(()=>{
                setAlert({
                    msg:"" , success:false , error:false , field:""
                })
            },3000)
        }catch(error){
            console.log(error)
            globalErr(error , setErrors , setAlert)
        }
    }

    async function recieveMoney(event: React.FormEvent<HTMLFormElement>){
        event.preventDefault()

        if(!checkInputs(receive , "receive"))return

        try{
            const {data} = await client.post("/auth/createRequest" , {...receive})

            setReceive({
                amount:"",
                accountNumber:"",
                description:""
            })

            setAlert({
                msg:data.msg , success:true , error:false , field : "recieve"
            })

            setTimeout(()=>{
                setAlert({
                    msg:"" , success:false , error:false , field:""
                })
            },3000)
        }catch(error){
            console.log(error)
            globalErr(error , setErrors , setAlert)
        }
    }

    
    async function withdrawalIsuer(event: React.FormEvent<HTMLFormElement>){
        event.preventDefault()

        if(!checkInputs(withdraw , "withdraw"))return

        try{
            const {data} = await client.post("/auth/withdrawal-isuer" , {...withdraw})

            setAlert({
                msg:data.msg , success:true , error:false , field:"withdraw"
            })

            setTimeout(()=>{
                setAlert({
                    msg:"" , success:false , error:false , field:""
                }) 
            },3000)
        }catch(error){
            console.log(error)
            globalErr(error , setErrors , setAlert)
        }
    }


    function checkInputs<T extends Record<string, string>>(form: T, formName: keyof typeof errors) {
        const check: Partial<Record<keyof T, string>> = {}

        Object.entries(form).forEach(([field, value]) => {
            if (!value.trim()) {
                check[field as keyof T] =`${capitalize(field)} is required`
            }
        })

        setErrors(prev => ({
            ...prev,
            [formName]: check
        }))

        return Object.keys(check).length === 0
    }

    const capitalize = (str:string) => str[0].toUpperCase() + str.slice(1);

    return(
        <main className="request-page">
            <header className="request-page-header">
                <div>
                    <p className="request-eyebrow">PERSONAL BANKING / MONEY MOVEMENT</p>
                    <h1>Move money with confidence.</h1>
                    <p className="request-subtitle">Choose a service below to get started. Every request is handled securely.</p>
                </div>
                <div className="request-security-note"><span>✓</span> Secure banking</div>
            </header>

            <section className="request-service-grid" aria-label="Money movement services">
                <article className="request-service-card request-service-card-featured">
                    <div className="request-card-topline"><span className="request-card-icon">↗</span><span className="request-card-tag">SEND</span></div>
                    <h2>Transfer money</h2>
                    <p>Send money securely to another user.</p>
                    <form className="request-form" onSubmit={transferMoney}>
                        <label>Amount
                            <input type="text" name="amount" placeholder="0.00"  value={transfer.amount} onChange={(event)=>handleInputs(event , setTransfer)}/>
                            {errors.transfer.amount && <p className="text-error">{errors.transfer.amount}</p>}
                        </label>

                        <label>Recipient account number
                            <input type="text" name="accountNumber" placeholder="Enter account number"  value={transfer.accountNumber} onChange={(event)=>handleInputs(event , setTransfer)} />
                            {errors.transfer.accountNumber && <p className="text-error">{errors.transfer.accountNumber}</p>}
                        </label>

                        <label>Description
                            <textarea name="description" placeholder="What is this transfer for?" rows={3}  value={transfer.description} onChange={(event)=>handleInputs(event , setTransfer)} />
                            {errors.transfer.description && <p className="text-error">{errors.transfer.description}</p>}
                        </label>

                        {alert.field==="transfer" && <p className={`field ${alert.success ? "text-success" : alert.error ? "text-error" : ""}`}>{alert.msg}</p>}

                        <button type="submit">Review transfer <span>→</span></button>
                    </form>
                </article>

                <article className="request-service-card">
                    <div className="request-card-topline"><span className="request-card-icon request-card-icon-coral">↙</span><span className="request-card-tag">REQUEST</span></div>
                    <h2>Receive money</h2>
                    <p>Request money from another user.</p>
                    <form className="request-form" onSubmit={recieveMoney}>
                        <label>Amount
                            <input type="text" name="amount" placeholder="0.00"  value={receive.amount} onChange={(event)=>handleInputs(event , setReceive)}/>
                            {errors.receive.amount && <p className="text-error">{errors.receive.amount}</p>}
                        </label>

                        <label>Sender account number
                            <input type="text" name="accountNumber" placeholder="Enter account number"  value={receive.accountNumber} onChange={(event)=>handleInputs(event , setReceive)}/>
                            {errors.receive.accountNumber && <p className="text-error">{errors.receive.accountNumber}</p>}
                        </label>

                        <label>Description
                            <textarea name="description" placeholder="What is this request for?" value={receive.description} rows={3} onChange={(event)=>handleInputs(event , setReceive)}/>
                            {errors.receive.description && <p className="text-error">{errors.receive.description}</p>}
                        </label>

                        {alert.field==="recieve" && <p className={`field ${alert.success ? "text-success" : alert.error ? "text-error" : ""}`}>{alert.msg}</p>}
                        <button type="submit">Review request <span>→</span></button>
                    </form>
                </article>

                <article className="request-service-card">
                    <div className="request-card-topline"><span className="request-card-icon">+</span><span className="request-card-tag">ADD FUNDS</span></div>
                    <h2>Deposit money</h2>
                    <p>Add money to your account.</p>
                    <form className="request-form">
                        <label>Amount
                            <input type="number" name="amount" placeholder="0.00" min="0" step="0.01" onChange={(event)=>handleInputs(event , setDeposit)}/>
                            {errors.deposit.amount && <p className="text-error">{errors.deposit.amount}</p>}
                        </label>
                        <label>Description
                            <textarea name="description" placeholder="Add a note about this deposit" rows={3} onChange={(event)=>handleInputs(event , setDeposit)}/>
                            {errors.deposit.description && <p className="text-error">{errors.deposit.description}</p>}
                        </label>
                        {alert.field==="deposit" && <p className={`field ${alert.success ? "text-success" : alert.error ? "text-error" : ""}`}>{alert.msg}</p>}
                        <button type="submit">Review deposit <span>→</span></button>
                    </form>
                </article>

                <article className="request-service-card">
                    <div className="request-card-topline"><span className="request-card-icon request-card-icon-coral">−</span><span className="request-card-tag">TAKE OUT</span></div>
                    <h2>Withdraw money</h2>
                    <p>Move money out of your account.</p>
                    <form className="request-form" onSubmit={withdrawalIsuer}>
                        <label>Amount
                            <input type="text" name="amount" placeholder="0.00" onChange={(event)=>handleInputs(event , setWithdraw)}/>
                            {errors.withdraw.amount && <p className="text-error">{errors.withdraw.amount}</p>}
                        </label>
                        <label>Card Number
                            <input type="text" name="cardNumber" placeholder="0.00" onChange={(event)=>handleInputs(event , setWithdraw)}/>
                            {errors.withdraw.cardNumber && <p className="text-error">{errors.withdraw.cardNumber}</p>}
                        </label>
                        <label>Description
                            <textarea name="description" placeholder="Add a note about this withdrawal" rows={3} onChange={(event)=>handleInputs(event , setWithdraw)}/>
                            {errors.withdraw.description && <p className="text-error">{errors.withdraw.description}</p>}
                        </label>
                        {alert.field==="withdraw" && <p className={`field ${alert.success ? "text-success" : alert.error ? "text-error" : ""}`}>{alert.msg}</p>}
                        <button type="submit">Review withdrawal <span>→</span></button>
                    </form>
                </article>

                <article className="request-service-card request-service-card-refund">
                    <div className="request-card-topline"><span className="request-card-icon request-card-icon-coral">↩</span><span className="request-card-tag">SUPPORT</span></div>
                    <h2>Request a refund</h2>
                    <p>Request a refund for an eligible transaction.</p>
                    <form className="request-form">
                        <label>Transaction ID
                            <input type="text" name="transactionId" placeholder="Enter transaction ID" onChange={(event)=>handleInputs(event , setRefund)}/>
                            {errors.refund.transactionId && <p className="text-error">{errors.refund.transactionId}</p>}
                        </label>
                        <label>Reason
                            <textarea name="reason" placeholder="Tell us why you are requesting a refund" rows={3} onChange={(event)=>handleInputs(event , setRefund)}/>
                            {errors.refund.reason && <p className="text-error">{errors.refund.reason}</p>}
                        </label>
                        {alert.field==="refund" && <p className={`field ${alert.success ? "text-success" : alert.error ? "text-error" : ""}`}>{alert.msg}</p>}
                        <button type="submit">Review refund <span>→</span></button>
                    </form>
                </article>
            </section>
        </main>
    )
}