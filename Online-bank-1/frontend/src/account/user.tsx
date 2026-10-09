import React from "react";
import "../styles/user.css";
import UserInfo from "../user-file/userInfo";
import Management from "../user-file/management";
import Transaction from "../user-file/transaction";
import Movement from "../user-file/movement";
import APIIntegration from "../user-file/APIIntegration";
import AddCard from "../user-file/addCard";
import MyCard from "../user-file/myCard";




const functionalities = [
    {
        number: "1",
        title: "Profile management",
        description:
            "Keep your personal details, contact information, and security preferences up to date.",
        icon: "◎",
    },
    {
        number: "2",
        title: "Account management",
        description:
            "View your accounts at a glance and manage the settings that keep your banking organized.",
        icon: "◈",
    },
    {
        number: "3",
        title: "Transaction history",
        description:
            "Review your recent activity with a clear, detailed record of every transaction.",
        icon: "↗",
    },
    {
        number: "4",
        title: "Money movement",
        description:
            "Move money confidently with quick access to transfers and your payment activity.",
        icon: "⇄",
    },
    {
        number: "5",
        title: "API integration",
        description:
            "Integrate your banking data with third-party applications and services for a seamless experience.",
        icon: "⧉",
    },
    {
        number: "6",
        title: "Add card",
        description:
            "add your card isuer.",
        icon: "⧉",
    },
    {
        number: "7",
        title: "My card",
        description:
            "show all your card isuer.",
        icon: "⧉",
    },
];

export default function User() {
    const [activeIndex, setActiveIndex] = React.useState(0);
    const [show , setShow] = React.useState('0')

    const showPrevious = () => {
        setActiveIndex((currentIndex) => {
            const newIndex = currentIndex === 0 ? functionalities.length - 1 : currentIndex - 1;

            setShow(String(newIndex + 1));

            return newIndex;
        });
    };

    const showNext = () => {
        setActiveIndex((currentIndex) => {
            const newIndex = currentIndex === functionalities.length - 1 ? 0 : currentIndex + 1;

            setShow(String(newIndex + 1));

            return newIndex;
        });
    };

    console.log(show)

    return (
        <main className="account-user-container">
            <section className="user-functionality-slider" aria-label="Banking functionalities">
                <div className="user-slider-heading">
                    <div>
                        <p className="user-eyebrow">Your banking, simplified</p>
                        <h2>Everything you need, in one place.</h2>
                    </div>
                    <div className="user-slider-controls">
                        <button type="button" className="user-slider-arrow" onClick={showPrevious} aria-label="Previous functionality">
                            ←
                        </button>
                        <span className="user-slider-count" aria-live="polite">
                            <strong>{String(activeIndex + 1).padStart(2, "0")}</strong> / {String(functionalities.length).padStart(2, "0")}
                        </span>
                        <button type="button" className="user-slider-arrow" onClick={showNext} aria-label="Next functionality">
                            →
                        </button>
                    </div>
                </div>

                <div className="user-slider-body">
                    <div className="user-slider-navigation" role="tablist" aria-label="Choose a functionality">
                        {functionalities.map((functionality, index) => (
                            <button
                                type="button"
                                role="tab"
                                aria-selected={activeIndex === index}
                                aria-controls={`functionality-panel-${index}`}
                                className={`user-slider-tab${show === functionality.number ? " is-active" : ""}`}
                                key={functionality.title}
                                onClick={() => setShow(functionality.number)}
                            >
                                <span>{functionality.number}</span>
                                {functionality.title}
                            </button>
                        ))}
                    </div>

                    <article className="user-info-container">

                        {show==='1' && <UserInfo/>}

                        {show==='2' && <Management/>}

                        {show==='3' && <Transaction/>}

                        {show==='4' && <Movement/>}

                        {show==='5' && <APIIntegration/>}

                        {show==='6' && <AddCard/>}

                        {show==='7' && <MyCard/>}
                    </article>
                </div>

                <div className="user-slider-progress" aria-hidden="true">
                    <span style={{ width: `${((activeIndex + 1) / functionalities.length) * 100}%` }} />
                </div>
            </section>
        </main>
    );
}