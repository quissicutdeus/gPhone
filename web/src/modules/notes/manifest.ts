import Icon from "./Icon.svelte";
import { defineApp } from "../../sdk";

export default defineApp({
    id: "notes",
    name: "Notes",
    color: "bg-yellow-400",
    icon: Icon,
    description: "Create and store personal notes",
    permissions: ["storage"],
});
