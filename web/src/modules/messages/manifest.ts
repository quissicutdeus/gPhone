import Icon from "./Icon.svelte";
import { unreadMessagesCount } from "../../store/messages";

export default {
    id: "messages",
    name: "Messages",
    color: "bg-green-400",
    icon: Icon,
    badgeStore: unreadMessagesCount,
};
