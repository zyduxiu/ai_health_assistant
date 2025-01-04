import {config} from "./config";

export default async function getTypes(date){
    let res=await fetch(`${config.apiBaseUrl}/getType`,{credentials: "include",});
    return res.json();
}