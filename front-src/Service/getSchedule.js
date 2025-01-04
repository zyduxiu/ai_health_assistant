import {config} from "./config";

export default async function getschedule(date){
    let res=await fetch(`${config.apiBaseUrl}/getAppointDate?date=${date}`,{credentials: "include",});
    return res.json();
}