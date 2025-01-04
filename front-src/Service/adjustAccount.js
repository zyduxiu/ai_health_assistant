import {config} from "./config";

export default async function updateAccount(pd){
    let res=await fetch(`${config.apiBaseUrl}/updateaccount`,{
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
    // return await res.json();
}