import { createApi } from "../../root";

export const getPairs = () => createApi({
  url: '/trading/pairs/all/',
  method: 'GET',
  headers: {
    'Accept': 'application/json'
  },
})