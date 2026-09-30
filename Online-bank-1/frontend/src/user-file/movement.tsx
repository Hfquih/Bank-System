import React from "react";
import "../styles/movement.css";
import Transfer from "./management-file/transfer";
import Receive from "./management-file/receive";
import Deposite from "./management-file/deposite";
import Withdraw from "./management-file/withdraw";
import Refund from "./management-file/refound";


type MovementType = "transfer" | "receive" | "deposit" | "withdraw" | "refund";

const actions: Array<{ type: MovementType; title: string; description: string }> = [
    { type: "transfer", title: "Transfer money", description: "Send money securely to another user." },
    { type: "receive", title: "Receive money", description: "Request money from another user." },
    { type: "deposit", title: "Deposit money", description: "Add money to your account." },
    { type: "withdraw", title: "Withdraw money", description: "Move money out of your account." },
    { type: "refund", title: "Request a refund", description: "Request a refund for an eligible transaction." },
];


export default function Movement() {
    const [selectedAction, setSelectedAction] = React.useState<MovementType>("transfer");
    

    const action = actions.find(({ type }) => type === selectedAction) ?? actions[0];


    const handleActionChange = (type: MovementType) => {
        setSelectedAction(type);
    };


    return (
        <div className="user-movement-container">
            <div className="user-movement-header">
                <div>
                    <p className="user-card-label">Money movement</p>
                    <h1>Move your money</h1>
                    <p>Select an action and complete the details below.</p>
                </div>
            </div>

            <div className="user-movement-actions" role="tablist" aria-label="Money movement actions">
                {actions.map((item) => (
                    <button
                        key={item.type}
                        type="button"
                        role="tab"
                        aria-selected={selectedAction === item.type}
                        className={`user-movement-action${selectedAction === item.type ? " is-active" : ""}`}
                        onClick={() => handleActionChange(item.type)}
                    >
                        <span>{item.title}</span>
                        <small>{item.description}</small>
                    </button>
                ))}
            </div>

            {selectedAction === 'transfer' && <Transfer action={action} selectedAction={selectedAction}/>}

            {selectedAction === 'receive' && <Receive action={action} selectedAction={selectedAction}/>}

            {selectedAction === 'deposit' && <Deposite action={action} selectedAction={selectedAction}/>}

            {selectedAction === 'withdraw' && <Withdraw action={action} selectedAction={selectedAction}/>}

            {selectedAction === 'refund' &&<Refund action={action} selectedAction={selectedAction}/>}

        </div>
    );
}
