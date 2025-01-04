import {config} from "./config";

export default async function getAccounts(){
    let res=await fetch(`${config.apiBaseUrl}/getAccount`,{credentials: "include",});
    return res.json();
}