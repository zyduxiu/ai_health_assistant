import {config} from "./config";

export default async function getAllCards(){
    let res=await fetch(`${config.apiBaseUrl}/api/members/getAllCards`,{credentials: "include",});
    return res.json();
}