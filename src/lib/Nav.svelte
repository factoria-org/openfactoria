<script>
export let v1 = "";
export let v2 = "";
export let files = "";
export let config = "";
export let network;
export let account;
</script>
<nav>
  <div class='flex'>
    <a class='brand' href="/"><i class='fa-solid fa-angle-up'></i> Factoria</a>
    <div class='flexible'></div>
    <div class='buttons'>
      <a href="https://factoria.app/docs"><i class="fa-solid fa-circle-question"></i></a>
      <a href="https://github.com/factoria-org/openfactoria"><i class="fa-brands fa-github"></i></a>
      <a href="https://twitter.com/skogard"><i class="fa-brands fa-twitter"></i></a>
      <a href="https://discord.gg/BZtp5F6QQM"><i class="fa-brands fa-discord"></i></a>
    </div>
  </div>
  <div>Decentralized NFT Vending Machine</div>
  <div class='navbar'>
    <a href='/v2/' class={v2} >V2</a>
    <a href='/v1/' class={v1} >V1 (old)</a>
    <a href='/files/' class={files} >Files</a>
    <a href='/config/' class={config} >Config</a>
  </div>
</nav>
<style>
.flex {
  display: flex;
}
.flexible {
  flex-grow: 1;
}
nav {
  padding: 20px;
  font-size: 14px;
}
nav a {
  text-decoration: none;
  color: black;
}
.desc {
  font-size: 14px;
  opacity: 0.8;
}
.account {
  font-size: 12px;
  font-weight: normal;
  font-family: Menlo, monaco, monospace;
}
.network {
  font-weight: bold;
  border-left: 5px solid black;
  padding: 5px 10px;
  margin: 10px 0;
  font-size: 12px;
}
a.brand {
  font-size: 40px;
  text-transform: lowercase;
  letter-spacing: -2px;
  font-weight: bold;
}
.navbar {
  padding: 10px 0 0;
}
.navbar a {
  padding: 5px;
  font-weight: bold;
  border-bottom: 2px solid transparent;
  display: inline-block;
  font-size: 12px;
  text-transform: uppercase;
}
.navbar .selected {
  border-bottom: 2px solid rgba(255,255,255,0.4);
}
.buttons {
  padding: 10px 0;
}
.buttons a {
  padding: 5px;
}
</style>
