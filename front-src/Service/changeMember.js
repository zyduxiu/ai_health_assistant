import {config} from "./config";

export default async function changeMember(pd){
    let res=await fetch(`${config.apiBaseUrl}/api/members/changeMember`,{
        method:'POST',
        headers: {
            'Content-Type': 'application/json',

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