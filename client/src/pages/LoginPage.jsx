import {Link,Navigate } from "react-router-dom";
import {useContext,useState} from "react";
import axios from 'axios';
import {UserContext} from "../UserContext";

function LoginPage(){
    const [email,setEmail] = useState('');
    const[password,setPassword] = useState('');
    const[redirect,setRedirect] = useState(false);
    const {setUser}=useContext(UserContext);
    async function handleloginSubmit(ev){
        ev.preventDefault();
        try{
            const {data} = await axios.post('/login',{email,password});
            console.log(email);
            console.log(password);

            setUser(data);
            alert("Login Successful");
            setRedirect(true);
        }catch(e){
            alert("Login Failed");
        }
    }

    if(redirect){
        return <Navigate to={'/'}/>
    }
    return (
        <div className="mt-4 grow flex items-center justify-around">
            <div className="mb-32">
            <h1 className="text-3xl text-center ">Login</h1>
            <form className="max-w-md mx-auto border" onSubmit={handleloginSubmit}>
                <input type="email"
                 placeholder="your@email.com"
                 value={email}
                 onChange={ev=>setEmail(ev.target.value)} />
                <input type="password" 
                placeholder="Password"
                value={password}
                onChange={ev=>setPassword(ev.target.value)} />
                <button className="secondary">Login</button>
                <div className="text-center py-2 text-gray-500">
                    Don't have an account yet? <Link className="underline text-black" to={'/register'}>Register Now</Link>
                </div>

            </form>
            </div>
        </div>
    )
}


export default LoginPage