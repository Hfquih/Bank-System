import React from 'react'
import '../styling/session.css'
import ApiClient from '../globalApi/client'
import globalErr from '../globalApi/globalErr'
import { useParams } from 'react-router-dom'


export type PaymentMethodData = {
  firstName: string;
  lastName: string;
  cardNumber: string;
  expMonth: number | null;
  expYear: number | null;
  cvv: string;
};

export type ErrPaymentMethodData = {
  firstName?: string;
  lastName?: string;
  cardNumber?: string;
  expMonth?: string;
  expYear?: string;
  cvv?: string;
};

export default function Sessions(){
    const [session , setSession] = React.useState<PaymentMethodData>({
        firstName : "",
        lastName : "",
        cardNumber : "",  
        expMonth : null,
        expYear : null,
        cvv : "",
    })

    const [alert , setAlert] = React.useState({msg:"" , success:false , error:false})

    const [errors , setErrors] = React.useState<ErrPaymentMethodData>({})

    const client = ApiClient()

    function handleInputs(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>){
        const {name , value} = e.currentTarget

        setSession((prev)=>{
            return{
                ...prev,
                [name] : value
            }
        })

        setErrors((prev)=>{
            return{
                ...prev,
                [name]:''
            }
        })
    }

    const {sessionId} = useParams()

    async function handleSubmit(e : React.FormEvent<HTMLFormElement>){
        e.preventDefault()

        if(!checkInputs()) return

        try{
            const {data} = await client.post(`/payment/payment-method/${sessionId}` , {...session})


            
                setAlert({
                    msg:data.msg , success:true , error:false 
                })

                setTimeout(()=>{
                    setAlert({
                        msg:"" , success:false , error:false 
                    })
                    window.location.href = data.redirectUrl
                },3000)
            
            
        }catch(error){
            console.log(error)
            globalErr(error , setErrors , setAlert)
        }
    }

    type Data = typeof session;

    function checkInputs(){
        const checkErr : Partial<Record<keyof Data, string>> = {}

        Object.entries(session).forEach(([field , value])=>{
             if((typeof value === "string" && value.trim() === "")  || value === null || (typeof value === "number" && value === 0)){
                return checkErr[field as keyof Data] = `${capitalize(field)} is required`
            }
        })

        setErrors(checkErr)
        return Object.keys(checkErr).length === 0;
    }

    const capitalize = (str:string) => str[0].toUpperCase() + str.slice(1);


    return(
        <div className="payment-session-container">
            <main className="payment-panel">
                <div className="payment-panel-header">
                    <div className="payment-mark" aria-hidden="true">
                        <span />
                        <span />
                    </div>
                    <p className="payment-eyebrow">Secure checkout</p>
                    <h1>Complete your payment</h1>
                    <p className="payment-intro">
                        Enter your card details below to securely finish your transaction.
                    </p>
                </div>

                <form className="payment-form" onSubmit={handleSubmit}>
                    <fieldset>
                        <legend>Cardholder details</legend>
                        <div className="payment-form-grid">
                            <label>
                                <span>First name</span>
                                <input type="text" name="firstName" autoComplete="given-name" onChange={handleInputs} />
                                {errors.firstName && <p className='text-error'>{errors.firstName}</p>}
                            </label>
                            <label>
                                <span>Last name</span>
                                <input type="text" name="lastName" autoComplete="family-name" onChange={handleInputs} />
                                {errors.lastName && <p className='text-error'>{errors.lastName}</p>}
                            </label>
                        </div>
                    </fieldset>

                    <fieldset>
                        <legend>Card details</legend>
                        <label>
                            <span>Card number</span>
                            <div className="card-number-input">
                                <input
                                    type="text"
                                    name="cardNumber"
                                    inputMode="numeric"
                                    autoComplete="cc-number"
                                    placeholder="1234 5678 9012 3456"
                                    pattern="[0-9 ]{13,19}"
                                    onChange={handleInputs}
                                />
                                <span className="card-glyph" aria-hidden="true" />
                            </div>
                            {errors.cardNumber && <p className='text-error'>{errors.cardNumber}</p>}
                        </label>

                        <div className="payment-form-grid payment-form-grid-small">
                            <label>
                                <span>Expiry month</span>
                                <input
                                    type="text"
                                    name="expMonth"
                                    inputMode="numeric"
                                    autoComplete="cc-exp-month"
                                    placeholder="MM"
                                    pattern="(0[1-9]|1[0-2])"
                                    onChange={handleInputs}
                                />
                                {errors.expMonth && <p className='text-error'>{errors.expMonth}</p>}
                            </label>
                            <label>
                                <span>Expiry year</span>
                                <input
                                    type="text"
                                    name="expYear"
                                    inputMode="numeric"
                                    autoComplete="cc-exp-year"
                                    placeholder="YY"
                                    pattern="[0-9]{4}"
                                    onChange={handleInputs}
                                />
                                {errors.expYear && <p className='text-error'>{errors.expYear}</p>}
                            </label>
                            <label>
                                <span>CVV</span>
                                <input
                                    type="password"
                                    name="cvv"
                                    inputMode="numeric"
                                    autoComplete="cc-csc"
                                    placeholder="123"
                                    pattern="[0-9]{3,4}"
                                    onChange={handleInputs}
                                />
                                {errors.cvv && <p className='text-error'>{errors.cvv}</p>}
                            </label>
                        </div>
                    </fieldset>

                    {alert.msg && <p className={`alert ${alert.success ? "text-success" : alert.error ? "text-error" : ""}`}>{alert.msg}</p>}

                    <button type="submit" className="payment-submit">Pay securely</button>
                    <p className="payment-security">
                        <span aria-hidden="true">&#128274;</span>
                        Your payment information is encrypted and secure.
                    </p>
                </form>
            </main>
        </div>
    )
    
}