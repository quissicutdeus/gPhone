on("onResourceStart", (resName: string) => {
  if (resName === GetCurrentResourceName()) {
    console.log("gPhone started!");
  }
});
