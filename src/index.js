import express from 'express';
import bodyParser from 'body-parser';
import axios from 'axios';

const PORT = 3000;
const app = express();

const USER = '';
const PASS = '';
const IP = '';

const URL = `http://${USER}:${PASS}@${IP}:8332/`

app.use(express.json());
app.use(bodyParser.urlencoded());
app.listen(PORT, () => console.log(`Server started at port ${PORT}`));

app.get('/getblockchaininfo', async (req, res) => {
  const request = `{"jsonrpc":"1.0","id":"curltext","method":"getblockchaininfo","params":[]}`;
  const {data} = await axios.post(URL, request);
  
  res.send(data);
});

app.get('/getblockhash/:index', async (req, res) => {
  const request = `{"jsonrpc":"1.0","id":"curltext","method":"getblockhash","params":[
    ${req.params.index}
  ]}`;
  const {data} = await axios.post(URL, request);
  
  res.send(data);
});

app.get('/api/blocks', async (req, res) => {
  const latestBlock = await getLatestBlock();

  const requests = [];
  for (let i = latestBlock; i > latestBlock - 5; i--) {
    const request = `{"jsonrpc":"1.0","id":"curltext","method":"getblockstats","params":[
      ${i}
    ]}`;
    requests.push(axios.post(URL, request));
  }

  const responses = await Promise.all(requests);

  res.send(responses.map((_) => _.data.result));
});

app.get('/api/blocks/:blockHash', async (req, res) => {
  const request = `{"jsonrpc":"1.0","id":"curltext","method":"getblock","params":[
    "${req.params.blockHash}", 2
  ]}`;
  try {
    const {data} = await axios.post(URL, request);
    res.send(data.result);
  } catch(e) {
    console.log(e.response.data);
  }
});

const getLatestBlock = async () => {
  const request = `{"jsonrpc":"1.0","id":"curltext","method":"getblockchaininfo","params":[]}`;
  const {data} = await axios.post(URL, request);
  const {result} = data;
  return result.blocks;
};