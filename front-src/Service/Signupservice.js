import {config} from "./config";

export default async function getlogin(pd){
    let res=await fetch(`${config.apiBaseUrl}/login?username=${pd.username}&password=${pd.password}`,{credentials:"include"});
    return res.json();
}