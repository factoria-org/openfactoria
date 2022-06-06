import extract from 'extract-json-from-string'
let Errors = {
  '1': 'require(!config.permanent, "1");',
  '2': 'require(!config.permanent, "2");',
  '3': 'require(!withdrawer.permanent, "3");',
  '4': 'require(_msgSender() == owner() || _msgSender() == withdrawer.account, "4");',
  '5': 'require(sent1, "5");',
  '6': 'require(sent2, "6");',
  '7': 'require(verify(auth, _msgSender()), "7");',
  '8': 'require(i.price * _count == msg.value, "8");',
  '9': 'require(i.start <= block.timestamp, "9");',
  '10': 'require(minted[_msgSender()][auth.key] + _count <= i.limit, "10");',
  '11': 'require(n+_count-1 <= config.supply, "11");',
  '12': 'require(_count > 0, "12");',
  '13': 'require(n+_count-1 <= config.supply, "13");',
  '14': 'require(_isApprovedOrOwner(_msgSender(), _tokenId), "14");',
  '15': 'require(tokenId > 0 && tokenId <= config.supply, "15");',
  '16': 'require(!config.permanent, "16");'
}
export let handleError = (message) => {
  let error = extract(message)
  if (error.length > 0) {
    error = error[0]
    if (error.originalError) {
      let match = /execution reverted: (.+)$/.exec(error.originalError.message)
      if (match && match.length > 0) {
        let code = match[1]
        let message = Errors["" + code]
        error.message = message
      }
    }
    return error.message
//    throw error
  } else {
    return message
  }
}
