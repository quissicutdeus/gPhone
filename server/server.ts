import './controllers/ContactController';
import './controllers/MessageController';
import './controllers/ConversationController';
import './controllers/BankController';

on("onResourceStart", (resName: string) => {
  if (resName === GetCurrentResourceName()) {
    console.log("gphone started!");
  }
});
