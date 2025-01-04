import {config} from "./config";

export default async function getDoctors(){
    let res=await fetch(`${config.apiBaseUrl}/getDoctor`,{credentials: "include",});
    return res.json();
}