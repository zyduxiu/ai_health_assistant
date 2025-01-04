import { config } from "./config";

export default async function getData() {
    let res = await fetch(`${config.apiBaseUrl}/api/data`, { credentials: "include", });
    return res.json();
}