import {config} from "./config";

export default async function deleteschedule(pd){
    let res=await fetch(`${config.apiBaseUrl}/deleteschedule`,{
        method:'POST',
        headers: {
            'Content-Type': 'application/json'
        },
    credentials: "include",
    body:JSON.stringify(pd),
    });
    if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
    }
    console.log(res);
    //  return await res.json();
}