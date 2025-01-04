import {config} from "./config";

export default async function getMembers(){
    let res=await fetch(`${config.apiBaseUrl}/api/members/getallmembers`,{credentials: "include",});
    return res.json();
}