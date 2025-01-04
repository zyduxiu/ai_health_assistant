import {config} from "./config";

export default async function getAllAppointments(){
    let res=await fetch(`${config.apiBaseUrl}/getAllAppointments`,{credentials: "include",});
    return res.json();
}