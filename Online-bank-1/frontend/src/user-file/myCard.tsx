import React from "react";
import ApiClient from "../globalAPI/apiClient";
import "../styles/myCard.css";

export type LinkedCard = {
    id: number
    brand: "VISA" | "MASTERCARD"
    last4: string
    expMonth: number
    expYear: number
    status: "ACTIVE" | "BLOCKED" | "EXPIRED" | "CANCELED"
    accountId: number
    createdAt: string
    updatedAt: string
}

export default function MyCard(){
    const [myCard , setMyCard] = React.useState<LinkedCard[]>([])

    const client = ApiClient()

    React.useEffect(()=>{
        const getCard = async ()=>{
            try{
                const {data} = await client.get('payment/my-cards')

                setMyCard(data.cards)
            }catch(error){
                console.error("Unable to load linked cards", error)
            }
        }

        getCard()
    },[])

    return(
        <main className="my-card-isuer">
            <header className="my-cards-header">
                <div>
                    <p className="my-cards-eyebrow">ACCOUNT SERVICES</p>
                    <h1>My cards</h1>
                    <p className="my-cards-intro">
                        View the cards linked to your account and their current details.
                    </p>
                </div>
                <div className="my-cards-count" aria-label={`${myCard.length} linked cards`}>
                    <span>{myCard.length}</span>
                    <span>{myCard.length === 1 ? "linked card" : "linked cards"}</span>
                </div>
            </header>

            {myCard.length === 0 ? (
                <section className="my-cards-empty" aria-live="polite">
                    <div className="my-cards-empty-icon" aria-hidden="true">▰</div>
                    <h2>No linked cards yet</h2>
                    <p>Your linked cards will appear here once they are available.</p>
                </section>
            ) : (
                <section className="my-cards-grid" aria-label="Your linked cards">
                    {myCard.map((card) => (
                        <article className="linked-card-panel" key={card.id}>
                            <div className={`linked-card linked-card-${card.brand.toLowerCase()}`}>
                                <div className="linked-card-top">
                                    <span className="linked-card-label">DEBIT CARD</span>
                                    <span className="linked-card-brand">{card.brand}</span>
                                </div>
                                <div className="linked-card-chip" aria-hidden="true">
                                    <span />
                                </div>
                                <p className="linked-card-number">
                                    <span className="visually-hidden">Card number ending in </span>
                                    <span aria-hidden="true">•••• •••• •••• </span>{card.last4}
                                </p>
                                <div className="linked-card-bottom">
                                    <div>
                                        <span className="linked-card-caption">EXPIRES</span>
                                        <span className="linked-card-expiry">
                                            {String(card.expMonth).padStart(2, "0")}/{card.expYear}
                                        </span>
                                    </div>
                                    <span className="linked-card-mark" aria-hidden="true">
                                        <i />
                                        <i />
                                    </span>
                                </div>
                            </div>

                            <div className="linked-card-details">
                                <div className="linked-card-details-heading">
                                    <div>
                                        <h2>{card.brand} card</h2>
                                        <p>Ending in {card.last4}</p>
                                    </div>
                                    <span className={`linked-card-status linked-card-status-${card.status.toLowerCase()}`}>
                                        <span className="linked-card-status-dot" aria-hidden="true" />
                                        {card.status}
                                    </span>
                                </div>

                                <dl className="linked-card-metadata">
                                    <div>
                                        <dt>Card ID</dt>
                                        <dd>{card.id}</dd>
                                    </div>
                                    <div>
                                        <dt>Linked account</dt>
                                        <dd>{card.accountId}</dd>
                                    </div>
                                    <div>
                                        <dt>Expiry date</dt>
                                        <dd>{String(card.expMonth).padStart(2, "0")}/{card.expYear}</dd>
                                    </div>
                                    <div>
                                        <dt>Added</dt>
                                        <dd>{new Date(card.createdAt).toLocaleDateString()}</dd>
                                    </div>
                                    <div>
                                        <dt>Last updated</dt>
                                        <dd>{new Date(card.updatedAt).toLocaleDateString()}</dd>
                                    </div>
                                </dl>
                            </div>
                        </article>
                    ))}
                </section>
            )}
        </main>
    )
}