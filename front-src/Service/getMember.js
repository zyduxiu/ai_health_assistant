import {config} from "./config";

export default async function getMember(){
    let res=await fetch(`${config.apiBaseUrl}/api/members/member`,{credentials: "include",});
    return res.json();
}