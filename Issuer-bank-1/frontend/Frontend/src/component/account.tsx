import useAuth from "../globalAPI/useAuth";
import User from "../role/user";
import Admin from "../role/admin";


export default function Account(){

    const {user} = useAuth()

    return(
        <div className="home-container">
            <div className="home-header">
                <h1>Minkiy</h1>

                <div>
                    
                    <div className='user-account'>
                        <i className="fa-solid fa-circle-user icon-account"></i>
                    </div>
                   
                </div>
            </div> 

            {user?.role === "user" && <User/>}

            {user?.role === "admin" && <Admin/>}
            

        </div>
    )
}