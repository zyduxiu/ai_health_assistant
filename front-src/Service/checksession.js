import {config} from "./config";

export default async function checksession(pd){
    let res=await fetch(`${config.apiBaseUrl}/checksession`, {
        credentials: "include",
    });
    if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
    }
}