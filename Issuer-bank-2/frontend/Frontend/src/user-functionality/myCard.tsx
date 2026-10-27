import React from "react";
import ApiClient from "../globalAPI/apiClient";
import "../styling/myCard.css";

export type Card = {
    id: number
    cardNumber: string
    brand: "VISA" | "MASTERCARD"
    type: "DEBIT" | "CREDIT"
    expMonth: number
    expYear: number
    cvv: string
    status: "ACTIVE" | "BLOCKED" | "EXPIRED" | "CANCELED"
    accountId: number
    createdAt: string
    updatedAt: string
}

export default function MyCards(){

    const [myCards , setMyCards] = React.useState<Card[]>([])

    const [selectedId , setSelectedId] = React.useState<null | number>(null)

    const client = ApiClient()

    const findSelectedId = myCards.find((data) => data.id === selectedId)

    React.useEffect(()=>{
        const getCard = async ()=>{
            try{
                const {data} = await client.get("/auth/my-card")

                setMyCards(data.card)
            }catch(error){
                console.log(error)
            }
        }

        getCard()

    },[])

    return(
        <main className="my-cards-page">
            <header className="my-cards-header">
                <p className="my-cards-eyebrow">YOUR WALLET</p>
                <h1>My cards</h1>
                <p className="my-cards-intro">
                    View and manage the cards linked to your account.
                </p>
            </header>

            {myCards.length > 0 ? (
                <section className="my-cards-grid" aria-label="Your cards">
                    {myCards.map((card) => (
                        <article className="my-card-item" key={card.id}>
                            <div className={`my-card-visual ${card.brand.toLowerCase()}`}>
                                <div className="my-card-visual-topline">
                                    <span className="my-card-chip" aria-hidden="true">
                                        <span />
                                    </span>
                                    <span className="my-card-brand">{card.brand}</span>
                                </div>
                                <p className="my-card-number" aria-label={`Card ending in ${card.cardNumber.slice(-4)}`}>
                                    <span aria-hidden="true">•••• •••• ••••</span>
                                    <span>{card.cardNumber.slice(-4)}</span>
                                </p>
                                <div className="my-card-visual-footer">
                                    <span>{card.type} CARD</span>
                                    <span>EXPIRES {String(card.expMonth).padStart(2, "0")}/{card.expYear}</span>
                                </div>
                            </div>

                            <div className="my-card-details">
                                <div>
                                    <p className="my-card-detail-label">Card type</p>
                                    <p className="my-card-detail-value">{card.type}</p>
                                </div>
                                <div className="card-div-btn">
                                    <span className={`my-card-status ${card.status.toLowerCase()}`}>
                                        <span className="my-card-status-dot" aria-hidden="true" />
                                        {card.status}
                                    </span>
                                    <button className="card-info-btn" onClick={()=>setSelectedId(card.id)}>Show all info</button>
                                </div>
                                
                            </div>
                        </article>
                    ))}
                </section>
            ) : (
                <section className="my-cards-empty" aria-live="polite">
                    <span className="my-cards-empty-icon" aria-hidden="true">▭</span>
                    <h2>No cards yet</h2>
                    <p>Cards linked to your account will appear here.</p>
                </section>
            )}

            {findSelectedId && (
                <section className="show-card-data" aria-labelledby="show-card-data-title">
                    <div className="show-card-data-heading">
                        <div>
                            <p className="my-cards-eyebrow">CARD INFORMATION</p>
                            <h2 id="show-card-data-title">Card ending in {findSelectedId.cardNumber.slice(-4)}</h2>
                        </div>
                        <span className={`my-card-status ${findSelectedId.status.toLowerCase()}`}>
                            <span className="my-card-status-dot" aria-hidden="true" />
                            {findSelectedId.status}
                        </span>
                    </div>

                    <dl className="show-card-data-grid">
                        <div className="show-card-data-field show-card-data-number">
                            <dt>Card number</dt>
                            <dd>{findSelectedId.cardNumber}</dd>
                        </div>
                        <div className="show-card-data-field">
                            <dt>Brand</dt>
                            <dd>{findSelectedId.brand}</dd>
                        </div>
                        <div className="show-card-data-field">
                            <dt>Card type</dt>
                            <dd>{findSelectedId.type}</dd>
                        </div>
                        <div className="show-card-data-field">
                            <dt>Expiration date</dt>
                            <dd>{String(findSelectedId.expMonth).padStart(2, "0")}/{findSelectedId.expYear}</dd>
                        </div>
                        <div className="show-card-data-field">
                            <dt>Security code</dt>
                            <dd>{findSelectedId.cvv}</dd>
                        </div>
                        <div className="show-card-data-field">
                            <dt>Card ID</dt>
                            <dd>{findSelectedId.id}</dd>
                        </div>
                        <div className="show-card-data-field">
                            <dt>Linked account ID</dt>
                            <dd>{findSelectedId.accountId}</dd>
                        </div>
                        <div className="show-card-data-field">
                            <dt>Created</dt>
                            <dd>
                                <time dateTime={findSelectedId.createdAt}>
                                    {new Date(findSelectedId.createdAt).toLocaleString()}
                                </time>
                            </dd>
                        </div>
                        <div className="show-card-data-field">
                            <dt>Last updated</dt>
                            <dd>
                                <time dateTime={findSelectedId.updatedAt}>
                                    {new Date(findSelectedId.updatedAt).toLocaleString()}
                                </time>
                            </dd>
                        </div>
                    </dl>
                </section>
            )}
        </main>
    )
}