import React from "react";
import "../styling/cards.css";
import ApiClient from "../globalAPI/apiClient";
import globalErr from "../globalAPI/globalErr";

type cardT = {
    cardType:string,
    cardBrand:string
}

type cardErr = {
    cardType?:string,
    cardBrand?:string
}

export default function Cards() {
    const [card , setCard] = React.useState<cardT>({
        cardType:"",
        cardBrand:""
    })

    const [alert , setAlert] = React.useState({msg:"" , success:false , error:false})

    const [errors , setErrors] = React.useState<cardErr>({})

    function handleInputs(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>){
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

    const client = ApiClient()

    async function handleSubmit(){
        if(!checkInputs()) return 

        try{
            const {data} = await client.post("/auth/createCard" , {...card})

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

    type Card = typeof card;

    function checkInputs(){
        const checkErr : Partial<Record<keyof Card, string>> = {} 

        Object.entries(card).forEach(([field , value])=>{
            if(!value.trim()){
                checkErr[field as keyof Card] = `${capitalize(field)} is required `
            }
        })

        setErrors(checkErr)
        return Object.keys(checkErr).length === 0;
    }

    const capitalize = (str:string) => str[0].toUpperCase() + str.slice(1);

    return (
        <main className="create-card-container">
            <header className="create-card-header">
                <div>
                    <p className="create-card-eyebrow">CARD SERVICES / NEW CARD</p>
                    <h1>Make it yours.</h1>
                    <p className="create-card-intro">
                        Choose the card that fits the way you bank. Your card, your choice.
                    </p>
                </div>
                <div className="create-card-step" aria-label="Step 1 of 2">
                    <span className="create-card-step-number">01</span>
                    <span>Card preferences</span>
                    <span className="create-card-step-divider" aria-hidden="true"></span>
                    <span className="create-card-step-muted">02 Details</span>
                </div>
            </header>

            <div className="create-card-layout">
                <section className="create-card-options" aria-label="Choose your card">
                    <fieldset className="create-card-fieldset">
                        <legend>
                            <span className="create-card-section-number">01</span>
                            Choose your card type
                        </legend>
                        <p className="create-card-helper">
                            Pick the option that works best for you.
                        </p>
                        <div className="create-card-type-options">
                            <label className="create-card-type-option">
                                <input type="radio" name="cardType" value="DEBIT" onChange={handleInputs} />
                                <span className="create-card-type-content">
                                    <span className="create-card-type-icon create-card-debit-icon" aria-hidden="true">
                                        ↗
                                    </span>
                                    <span className="create-card-type-copy">
                                        <strong>Debit</strong>
                                        <span>Pay directly from your account.</span>
                                    </span>
                                    <span className="create-card-radio" aria-hidden="true"></span>
                                </span>
                            </label>
                            <label className="create-card-type-option">
                                <input type="radio" name="cardType" value="CREDIT" onChange={handleInputs} />
                                <span className="create-card-type-content">
                                    <span className="create-card-type-icon create-card-credit-icon" aria-hidden="true">
                                        ◇
                                    </span>
                                    <span className="create-card-type-copy">
                                        <strong>Credit</strong>
                                        <span>Flexible spending, on your terms.</span>
                                    </span>
                                    <span className="create-card-radio" aria-hidden="true"></span>
                                </span>
                            </label>
                        </div>
                        {errors.cardType && <p className="text-error">{errors.cardType}</p>}
                    </fieldset>

                    <fieldset className="create-card-fieldset create-card-brand-fieldset">
                        <legend>
                            <span className="create-card-section-number">02</span>
                            Select a card network
                        </legend>
                        <p className="create-card-helper">
                            Choose where you’d like to use your card.
                        </p>
                        <div className="create-card-brand-options">
                            <label className="create-card-brand-option">
                                <input type="radio" name="cardBrand" value="VISA" onChange={handleInputs} />
                                <span className="create-card-brand-content">
                                    <span className="create-card-visa-wordmark" aria-hidden="true">VISA</span>
                                    <span className="create-card-brand-detail">
                                        <strong>Visa</strong>
                                        <span>Accepted worldwide</span>
                                    </span>
                                    <span className="create-card-radio" aria-hidden="true"></span>
                                </span>
                            </label>
                            <label className="create-card-brand-option">
                                <input type="radio" name="cardBrand" value="MASTERCARD" onChange={handleInputs} />
                                <span className="create-card-brand-content">
                                    <span className="create-card-mastercard-mark" aria-hidden="true">
                                        <i></i><i></i>
                                    </span>
                                    <span className="create-card-brand-detail">
                                        <strong>Mastercard</strong>
                                        <span>Everyday, everywhere</span>
                                    </span>
                                    <span className="create-card-radio" aria-hidden="true"></span>
                                </span>
                            </label>
                            {errors.cardBrand && <p className="text-error">{errors.cardBrand}</p>}
                        </div>
                    </fieldset>

                    <div className="create-card-actions">
                        {alert.msg && <p className={`alert ${alert.success ? "text-success" : alert.error ? "text-error" : ""}`}>{alert.msg}</p>}
                        <button className="create-card-continue" type="button" onClick={handleSubmit}>
                            Continue
                            <span aria-hidden="true">→</span>
                        </button>
                        <p className="create-card-security">
                            <span aria-hidden="true">◆</span>
                            Your card details are protected and secure
                        </p>
                    </div>
                </section>

                <aside className="create-card-preview-panel" aria-label="Card preview">
                    <div className="create-card-preview-heading">
                        <span>MADE FOR YOUR EVERYDAY</span>
                        <span className="create-card-preview-sparkle" aria-hidden="true">✳</span>
                    </div>
                    <div className="create-card-visual">
                        <div className="create-card-visual-topline">
                            <span className="create-card-visual-brand">YOUR BANK</span>
                            <span className="create-card-contactless" aria-label="Contactless">
                                )))
                            </span>
                        </div>
                        <div className="create-card-chip" aria-hidden="true">
                            <span></span>
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                        <div className="create-card-visual-bottomline">
                            <span>YOUR NAME</span>
                            <span className="create-card-preview-mark">CARD</span>
                        </div>
                        <span className="create-card-orbit create-card-orbit-one" aria-hidden="true"></span>
                        <span className="create-card-orbit create-card-orbit-two" aria-hidden="true"></span>
                    </div>
                    <div className="create-card-preview-caption">
                        <span className="create-card-preview-dot" aria-hidden="true"></span>
                        <span>A little preview of what’s to come</span>
                    </div>
                    <div className="create-card-benefits">
                        <div>
                            <span className="create-card-benefit-icon" aria-hidden="true">⌁</span>
                            <span><strong>Ready when you are</strong><small>Simple, secure everyday payments</small></span>
                        </div>
                        <div>
                            <span className="create-card-benefit-icon" aria-hidden="true">◈</span>
                            <span><strong>Made to fit your life</strong><small>Choose the card that feels right</small></span>
                        </div>
                    </div>
                </aside>
            </div>
        </main>
    );
}
