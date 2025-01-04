import { config } from "./config";

export default async function getLLM() {
    let res = await fetch(`${config.apiBaseUrl}/api/LLM`, { credentials: "include" });
    if (!res.ok) {
        throw new Error(`Failed to fetch LLM: ${res.status}`);
    }
    return res.json();
}