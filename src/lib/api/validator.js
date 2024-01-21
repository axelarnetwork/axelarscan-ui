const request = async params => {
  const response = await fetch(process.env.NEXT_PUBLIC_VALIDATOR_API_URL, { method: 'POST', body: JSON.stringify(params) }).catch(error => { return null })
  return response && await response.json()
}

export const getValidators = async params => request({ ...params, method: 'getValidators' })
export const getValidatorsVotes = async params => request({ ...params, method: 'getValidatorsVotes' })
export const getChainMaintainers = async params => request({ ...params, method: 'getChainMaintainers' })
export const searchPolls = async params => request({ ...params, method: 'searchPolls' })