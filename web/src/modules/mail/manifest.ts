import Icon from "./Icon.svelte";
import { unreadMailCount } from "../../store/mail";

export default {
    id: "mail",
    name: "Mail",
    color: "bg-blue-500",
    icon: Icon,
    badgeStore: unreadMailCount,
};
