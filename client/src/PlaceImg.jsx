export default function PlaceImg({place,index=0,className=null}){
    if (!place.photos?.length) {
        return '';
    }
    if(!className){
        className ="object-cover";
    }

    return(
            <img className={className}src={`${process.env.VITE_BACKEND_URL}/uploads/${place.photos[index]}`}
            alt="" />
        
    );
}