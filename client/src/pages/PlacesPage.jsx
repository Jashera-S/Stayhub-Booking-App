import {Link} from "react-router-dom";
import AccountNav from "./AccountNav";
import {useEffect , useState} from "react";
import axios from "axios";
import PlaceImg from "../PlaceImg";

function PlacesPage(){
    const[places,setPlaces] = useState([]);
    useEffect(() => {
        axios.get('/user-places').then(({data}) => {
            setPlaces(data);
        });
    },[]);
    return (
        <div>
            <AccountNav />
                <div className="text-center">
                <Link className ="inline-flex gap-1 bg-primary py-2 px-6 rounded-full" to={'/account/places/new'}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                   <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Add new place
                </Link>
            </div>
            <div className = "mt-4">
                {places.length > 0 && places.map(place => (
                    <Link 
                    key={place._id} 
                    to={`/account/places/${place._id}`} 
                    className="flex cursor-pointer gap-4 bg-gray-100 p-4 rounded-2xl shadow-md hover:bg-gray-200 transition"
                >
                    <div className="flex w-40 h-40 bg-gray-300 overflow-hidden rounded-lg flex-shrink-0">
                        <PlaceImg place={place} />
                    </div>
                    <div className="flex flex-col justify-center flex-1">
                        <h2 className="text-xl font-semibold">{place.title}</h2>
                        <p className="text-sm text-gray-600 mt-2">{place.description}</p>
                    </div>
                </Link>
                
                ))}
            </div>
          
        </div>
    )

}



export default PlacesPage;