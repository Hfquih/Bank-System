import React from "react";
import ApiClient from "../globalAPI/apiClient";
import globalErr from "../globalAPI/globalErrors";
import "../styles/addCard.css";

type cardInfo = {
    firstName:string,
    lastName:string,
    cardNumber:string,
    expMonth:string,
    expYear:string,
    cvv:string
}

type cardInfoErr = {
    firstName?:string,
    lastName?:string,
    cardNumber?:string,
    expMonth?:string,
    expYear?:string,
    cvv?:string
}

export default function AddCard(){
    const [card , setCard] = React.useState<cardInfo>({
        firstName:"",
        lastName:"",
        cardNumber:"",
        expMonth:"",
        expYear:"",
        cvv:""
    })

    const [alert , setAlert] = React.useState({msg:"" , error:false , success:false})

    const [errors , setErrors] = React.useState<cardInfoErr>({})

    const client = ApiClient()

    function handleInput(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>){
        const {name , value} = e.currentTarget

        setCard(prev=>{
            return{
                ...prev,
                [name]:value
            }
        })

        setErrors(prev=>{
            return{
                ...prev,
                [name]:""
            }
        })
    }
 
    async function handleSubmit(e : React.FormEvent<HTMLFormElement>){
        e.preventDefault()

        if(!checkInputs())return 

        try{
            const {data} = await client.post('/payment/add-card' , {...card})

            setAlert({
                msg:data.msg , success:true , error:false 
            })

            setTimeout(()=>{
                setAlert({
                    msg:"" , success:false , error:false 
                })
            },3000)
        }catch(error){
            console.log(error)
            globalErr(error , setErrors , setAlert)
        }
    }

    type CardT = typeof card;

    function checkInputs(){
        const checkErr : Partial<Record<keyof CardT, string>> = {}

        Object.entries(card).forEach(([field , value])=>{
            if(!value.trim()){
                checkErr[field as keyof CardT] = `${capitalize(field)} is required`
            }
        })

        setErrors(checkErr)
        return Object.keys(checkErr).length === 0;
    }

    const capitalize = (str:string) => str[0].toUpperCase() + str.slice(1);

    return (
        <main className="add-card-customer">
            <section className="add-card-layout" aria-labelledby="add-card-title">
                <div className="add-card-intro">
                    <p className="add-card-eyebrow">ACCOUNT SERVICES</p>
                    <h1 id="add-card-title">Add a card</h1>
                    <p className="add-card-description">
                        Link a card from your issuer to manage it alongside your online bank account.
                    </p>

                    <div className="add-card-preview" aria-hidden="true">
                        <div className="add-card-preview-top">
                            <span>PAYMENT CARD</span>
                            <span className="add-card-preview-mark">
                                <i />
                                <i />
                            </span>
                        </div>
                        <div className="add-card-chip"><span /></div>
                        <p className="add-card-preview-number">•••• &nbsp; •••• &nbsp; •••• &nbsp; ••••</p>
                        <div className="add-card-preview-bottom">
                            <span>CARDHOLDER NAME</span>
                            <span>MM / YY</span>
                        </div>
                    </div>

                    <p className="add-card-note">
                        Have your card nearby. You’ll need the cardholder name, number, expiry date, and security code.
                    </p>
                </div>

                <form className="add-card-form" onSubmit={handleSubmit} noValidate>
                    <div className="add-card-form-heading">
                        <div>
                            <h2>Card details</h2>
                            <p>Enter the information exactly as it appears on your card.</p>
                        </div>
                        <span className="add-card-required-note">All fields required</span>
                    </div>

                    {alert.msg && (
                        <div
                            className={`add-card-alert ${alert.error ? "add-card-alert-error" : "add-card-alert-success"}`}
                            role={alert.error ? "alert" : "status"}
                        >
                            {alert.msg}
                        </div>
                    )}

                    <div className="add-card-name-fields">
                        <div className="add-card-field">
                            <label htmlFor="add-card-first-name">First name</label>
                            <input
                                id="add-card-first-name"
                                name="firstName"
                                type="text"
                                autoComplete="cc-given-name"
                                placeholder="As shown on card"
                                value={card.firstName}
                                onChange={handleInput}
                                aria-invalid={Boolean(errors.firstName)}
                                aria-describedby={errors.firstName ? "add-card-first-name-error" : undefined}
                            />
                            {errors.firstName && <span className="add-card-field-error" id="add-card-first-name-error">{errors.firstName}</span>}
                        </div>
                        <div className="add-card-field">
                            <label htmlFor="add-card-last-name">Last name</label>
                            <input
                                id="add-card-last-name"
                                name="lastName"
                                type="text"
                                autoComplete="cc-family-name"
                                placeholder="As shown on card"
                                value={card.lastName}
                                onChange={handleInput}
                                aria-invalid={Boolean(errors.lastName)}
                                aria-describedby={errors.lastName ? "add-card-last-name-error" : undefined}
                            />
                            {errors.lastName && <span className="add-card-field-error" id="add-card-last-name-error">{errors.lastName}</span>}
                        </div>
                    </div>

                    <div className="add-card-field">
                        <label htmlFor="add-card-number">Card number</label>
                        <input
                            id="add-card-number"
                            name="cardNumber"
                            type="text"
                            inputMode="numeric"
                            autoComplete="cc-number"
                            placeholder="0000 0000 0000 0000"
                            maxLength={23}
                            value={card.cardNumber}
                            onChange={handleInput}
                            aria-invalid={Boolean(errors.cardNumber)}
                            aria-describedby={errors.cardNumber ? "add-card-number-error" : "add-card-number-hint"}
                        />
                        {errors.cardNumber
                            ? <span className="add-card-field-error" id="add-card-number-error">{errors.cardNumber}</span>
                            : <span className="add-card-field-hint" id="add-card-number-hint">Enter the number printed on the front of your card.</span>}
                    </div>

                    <div className="add-card-bottom-fields">
                        <div className="add-card-field">
                            <label htmlFor="add-card-exp-month">Expiry month</label>
                            <input
                                id="add-card-exp-month"
                                name="expMonth"
                                type="text"
                                inputMode="numeric"
                                autoComplete="cc-exp-month"
                                placeholder="MM"
                                maxLength={2}
                                value={card.expMonth}
                                onChange={handleInput}
                                aria-invalid={Boolean(errors.expMonth)}
                                aria-describedby={errors.expMonth ? "add-card-exp-month-error" : undefined}
                            />
                            {errors.expMonth && <span className="add-card-field-error" id="add-card-exp-month-error">{errors.expMonth}</span>}
                        </div>
                        <div className="add-card-field">
                            <label htmlFor="add-card-exp-year">Expiry year</label>
                            <input
                                id="add-card-exp-year"
                                name="expYear"
                                type="text"
                                inputMode="numeric"
                                autoComplete="cc-exp-year"
                                placeholder="YYYY"
                                maxLength={4}
                                value={card.expYear}
                                onChange={handleInput}
                                aria-invalid={Boolean(errors.expYear)}
                                aria-describedby={errors.expYear ? "add-card-exp-year-error" : undefined}
                            />
                            {errors.expYear && <span className="add-card-field-error" id="add-card-exp-year-error">{errors.expYear}</span>}
                        </div>
                        <div className="add-card-field">
                            <label htmlFor="add-card-cvv">Security code</label>
                            <input
                                id="add-card-cvv"
                                name="cvv"
                                type="password"
                                inputMode="numeric"
                                autoComplete="cc-csc"
                                placeholder="CVV"
                                maxLength={4}
                                value={card.cvv}
                                onChange={handleInput}
                                aria-invalid={Boolean(errors.cvv)}
                                aria-describedby={errors.cvv ? "add-card-cvv-error" : "add-card-cvv-hint"}
                            />
                            {errors.cvv
                                ? <span className="add-card-field-error" id="add-card-cvv-error">{errors.cvv}</span>
                                : <span className="add-card-field-hint" id="add-card-cvv-hint">Usually 3 or 4 digits.</span>}
                        </div>
                    </div>

                    <button className="add-card-submit" type="submit">
                        Add card
                        <span aria-hidden="true">→</span>
                    </button>
                </form>
            </section>
        </main>
    )
}