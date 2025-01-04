import {config} from "./config";

export default async function getDoctor(){
    let res=await fetch(`${config.apiBaseUrl}/getOneDoctor`,{credentials: "include",});
    return res.json();
}