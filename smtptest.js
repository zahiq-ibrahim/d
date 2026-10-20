const net = require("net");
for (const ip of ["192.178.158.108", "192.178.158.109"]) {
  const t = Date.now();
  const s = net.connect({ host: ip, port: 587, timeout: 10000 });
  s.on("connect", () => { console.log(ip, "OK", Date.now() - t, "ms"); s.destroy(); });
  s.on("timeout", () => { console.log(ip, "TIMEOUT"); s.destroy(); });
  s.on("error", (e) => console.log(ip, e.code));
}