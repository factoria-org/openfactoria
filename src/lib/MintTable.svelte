<script>
let links = []
export let web3;
export let contract;
export let tx;
const url = (network, address, tokenId, website) => {
  let payload = {
    rinkeby: {
      opensea: `https://testnets.opensea.io/assets/${address}/${tokenId}`,
      rarible: `https://rinkeby.rarible.com/token/${address.toLowerCase()}:${tokenId}`,
      looksrare: `https://rinkeby.looksrare.org/collections/${address}/${tokenId}`
    },
    mainnet: {
      opensea: `https://opensea.io/assets/${address}/${tokenId}`,
      rarible: `https://rarible.com/token/${address.toLowerCase()}:${tokenId}`,
      looksrare: `https://looksrare.org/collections/${address}/${tokenId}`
    }
  }
  return payload[network][website]
}
let renderMint = async () => {
  if (tx) {
    console.log("Tx", tx)
    let chainId = await web3.eth.getChainId();
    let network = (chainId == 4 ? "rinkeby" : "mainnet")
    let EventArray = Array.isArray(tx.events.Transfer) ? tx.events.Transfer : [tx.events.Transfer]
    let tokenIds = EventArray.map((t) => {
      return t.returnValues.tokenId
    })
    links = tokenIds.map((id) => {
      return ["opensea", "looksrare", "rarible"].map((site) => {
        return {
          site,
          id: id,
          url: url(network, contract, id, site)
        }
      })
    })
    console.log("links", links)
  }
}
renderMint()
</script>
<div class='form'>
  <table>
    <tr>
      <th>Opensea</th>
      <th>Looksrare</th>
      <th>Rarible</th>
    </tr>
    {#each links as link}
      <tr>
        {#each link as item}
          <td><a target="_blank" class='btn display' href="{item.url}">token #{item.id}</a></td>
        {/each}
      </tr>
    {/each}
  </table>
</div>
<style>
table {
  width: 100%;
  box-sizing: border-box;
  padding: 0px;
  table-layout: fixed;
}
th {
  padding: 10px;
  font-size: 14px;
  color: rgba(255,255,255,0.8);
  background: rgba(0,0,0,0.3);
  color: royalblue;
}
td {
  text-align: center;
  padding: 10px;
  box-sizing: border-box;
  background: rgba(0,0,0,0.1);
  font-size: 14px;
  color: rgba(255,255,255,0.8);
  word-break: break-all;
}
td button {
  width: 100%;
}
</style>
