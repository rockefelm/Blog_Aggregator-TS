import { readConfig, setUser } from "./config.js";
function main() {
  setUser("Mike");
  const cfg = readConfig();
  console.log(cfg);
}

main();