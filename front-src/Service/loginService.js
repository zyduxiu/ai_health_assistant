import {config} from "./config";

export default async function postUser(pd){
    let res=await fetch(`${config.apiBaseUrl}/signup`,{
        method:'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body:JSON.stringify(pd),
        credentials:"include",
    });
    if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
    }
    console.log(res);
}