import axios from 'axios'

export default axios.create({
  baseURL: 'https://www.thebluealliance.com/api/v3',
  timeout: 1000,
  // headers: {'X-TBA-Auth-Key': process.env.TBA_KEY}
});


