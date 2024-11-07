export const DISCORD_URL = "https://discord.gg/Xhvb2wujVh";

export const featured_games = [
    {
        id: 'lethal-budget',
    },
    {
        id: 'oak-house-murder',
    },
]

export type CreatorList = "CMANIF" | "ChoosingBerry" | "Kubik" | "Monster Art" | "S0FL" | "Sammy" | "Stevelocks";
export type Roles = "Programmer" | "Animator" | "Modeller" | "Builder";

export const CreatorDetailList: Record<CreatorList, {
    minecraft: string;
    youtube: string;
    roles: Roles[];
}> = {
    "CMANIF": {
        minecraft: "786e1712-c2a2-405b-8b78-3cc58bd953f9",
        youtube: "@CMANIF",
        roles: ['Builder']
    },
    "ChoosingBerry": {
        minecraft: "82aa54c4-c65a-4a66-8ef8-39388a612480",
        youtube: "@ChoosingBerry29",
        roles: ['Animator', 'Modeller']
    },
    "Kubik": {
        minecraft: "f26a09dd-c01d-4885-91e3-32110c8fab38",
        youtube: "@KodeurKubik",
        roles: ['Animator', 'Programmer']
    },
    "Monster Art": {
        minecraft: "f31cfecd-0045-4c92-858f-326cc89ef9c4",
        youtube: "@Monster_Art",
        roles: ["Animator", 'Builder', 'Modeller']
    },
    "S0FL": {
        minecraft: "68c5c95f-80e9-499e-9128-d4d597633afc",
        youtube: "@s0fl813",
        roles: ['Programmer']
    },
    "Sammy": {
        minecraft: "d0c31c74-f1b0-4c27-a988-db9a6d95bb70",
        youtube: "@Sammy3D",
        roles: ['Animator', 'Modeller', 'Programmer']
    },
    "Stevelocks": {
        minecraft: "0849bc57-4d67-414b-a371-b71c45e02a14",
        youtube: "@Stevelocks100",
        roles: ["Animator", 'Modeller', 'Programmer']
    },
};