const oxmysql = exports.oxmysql;

on("onResourceStart", (resName: string) => {
  if (resName === GetCurrentResourceName()) {
    console.log("gphone started!");
  }
});

onNet('gphone:server:bank:getTransactions', async (cbId: any) => {
  const src = source;
  try {
    const player = exports.qbx_core.GetPlayer(src);
    if (!player) {
      emitNet('gphone:client:bank:receiveTransactions', src, cbId, []);
      return;
    }

    const citizenid = player.PlayerData.citizenid;
    const result = await oxmysql.query_async('SELECT transactions FROM player_transactions WHERE id = ? LIMIT 1', [citizenid]);

    let transactions = [];
    if (result && result.length > 0 && result[0].transactions) {
      const rawTransactions = result[0].transactions;
      transactions = typeof rawTransactions === 'string' ? JSON.parse(rawTransactions) : rawTransactions;
      transactions.sort((a: any, b: any) => b.time - a.time);
    }

    emitNet('gphone:client:bank:receiveTransactions', src, cbId, transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    emitNet('gphone:client:bank:receiveTransactions', src, cbId, []);
  }
});
