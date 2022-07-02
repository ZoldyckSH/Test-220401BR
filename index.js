const axios = require('axios')

const API_URL = 'http://localhost:3000'

const login = {
  user: 'BankinUser',
  password: '12345678',
}

const client = {
  user: 'BankinClientId',
  password: 'secret',
}

async function brigeLogin() {
  try {
    const res = await axios.post(
      `${API_URL}/login`,
      {
        ...login,
      },
      {
        auth: {
          username: client.user,
          password: client.password,
        },
      },
    )
    return res.data
  } catch (error) {
    throw new Error(error.response.data)
  }
}

async function getAccessToken() {
  const refreshToken = await brigeLogin()
  const res = await axios.post(`${API_URL}/token`, {
    grant_type: 'refresh_token',
    refresh_token: refreshToken.refresh_token,
  })

  return res.data
}

async function listAccounts() {
  const accessToken = await getAccessToken()
  const resultTransactionByAccount = []
  let config = {
    headers: {
      Authorization: 'Bearer ' + accessToken.access_token,
    },
  }

  for (let i = 1; i; i++) {
    const res = await axios.get(`${API_URL}/accounts?page=${i}`, config)
    if (res.data.link.next === null) {
      break
    }

    for (let j = 0; j < res.data.account.length; j++) {
      const transactions = await getTransaction(
        res.data.account[j].acc_number,
        accessToken.access_token,
      )
      resultTransactionByAccount.push({
        acc_number: res.data.account[j].acc_number,
        amount: res.data.account[j].amount,
        transactions: transactions,
      })
    }
  }
  console.log(JSON.stringify(resultTransactionByAccount))
  return resultTransactionByAccount
}

async function getTransaction(accountNumber, accesToken) {
  let config = {
    headers: {
      Authorization: 'Bearer ' + accesToken,
    },
  }
  try {
    const transactions = []
    for (let i = 1; i; i++) {
      const res = await axios.get(
        `${API_URL}/accounts/${accountNumber}/transactions?page=${i}`,
        config,
      )
      if (res.data.link.next === null) {
        break
      }
      for (let j = 0; j < res.data.transactions.length; j++) {
        transactions.push({
          label: res.data.transactions[j].label,
          amount: res.data.transactions[j].amount,
          currency: res.data.transactions[j].currency,
        })
      }
    }
    return transactions
  } catch (e) {
    return []
  }
}
listAccounts()
