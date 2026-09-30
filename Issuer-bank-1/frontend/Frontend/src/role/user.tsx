import "../styling/user.css";
import React from "react";
import Overview from "../user-functionality/overview";
import Profil from "../user-functionality/profil";
import Capabilities from "../user-functionality/capabilities";
import Transaction from "../user-functionality/transaction";
import Cards from "../user-functionality/cards";
import Request from "../user-functionality/Request";
import useAuth from "../globalAPI/useAuth";
import { useNavigate } from "react-router-dom";

export default function User(){
    const [show , setShow] = React.useState("overview")

    const {logout} = useAuth()

    const navigate = useNavigate()

    function logoutfunc(){
        logout()
        navigate('/')
    }

    return(
        <div className="issuer-user-container">
            <aside className="issuer-sidebar">
                <div className="issuer-brand-mark">M</div>
                <nav aria-label="Account navigation">
                    <a className={`issuer-nav-item ${show==="overview" ? "active" : "" }`} onClick={()=>setShow("overview")}><span>⌂</span> Overview</a>
                    <a className={`issuer-nav-item ${show==="profil" ? "active" : "" }`} onClick={()=>setShow("profil")}><span>⌂</span> Profil</a>
                    <a className={`issuer-nav-item ${show==="capabilities" ? "active" : "" }`} onClick={()=>setShow("capabilities")}><span>▦</span> My account</a>
                    <a className={`issuer-nav-item ${show==="transactions" ? "active" : "" }`} onClick={()=>setShow("transactions")}><span>↔</span> Transactions</a>
                    <a className={`issuer-nav-item ${show==="cards" ? "active" : "" }`} onClick={()=>setShow("cards")}><span>▭</span> Cards</a>
                    <a className={`issuer-nav-item ${show==="requests" ? "active" : "" }`} onClick={()=>setShow("requests")}><span>◌</span> Money Movement</a>
                    <a className="issuer-nav-item" onClick={logoutfunc}><span><i className="fa-solid fa-right-from-bracket"></i></span> Logout</a>
                </nav>
                <div className="issuer-sidebar-footer">
                    <div className="issuer-help-icon">?</div>
                    <div>
                        <strong>Need help?</strong>
                        <span>Contact support</span>
                    </div>
                </div>
            </aside>

            {show === "overview" && <Overview/>}

            {show === "profil" && <Profil/>}

            {show === "capabilities" && <Capabilities/>}

            {show === "transactions" && <Transaction/>}

            {show === "cards" && <Cards/>}

            {show === "requests" && <Request/>}
  
        </div>
    )
}