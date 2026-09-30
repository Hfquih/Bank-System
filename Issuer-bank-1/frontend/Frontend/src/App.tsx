import { BrowserRouter , Route , Routes } from "react-router-dom";
import Home from "./component/home";
import Register from "./component/register";
import Login from "./component/login";
import Account from "./component/account";


export default function App(){
  return(
    <BrowserRouter>
      <Routes>
  
        <Route path='/' element={<Home/>}></Route>
        <Route path='/register' element={<Register/>}></Route>
        <Route path='/login' element={<Login/>}></Route>
        <Route path='/account' element={<Account/>}></Route>

      </Routes> 
    </BrowserRouter>
  )
}