import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { TRANSACTION_TYPES, TRANSACTIONS } from '@wavesenterprise/transactions-factory'

import {We} from "@wavesenterprise/sdk";
import { RootState } from "../common/store";

const CONTRACT_ID = '3t1eC1rzmmwseBxXqyfJf3QLupFRSv39CSSQQ9eG8eB4'

export type PairID = number

export interface Asset {
  id: number,
  name: string,
  ticker: string,
  volume_24h: number
}

export interface Pair {
  id: PairID,
  asset_from: Asset,
  asset_to: Asset,
  ratio: string,
  ui_name?: string
}

interface SwapForm {
  selected: Pair,
  from_value: number,
  to_value: number
}

type SwapState = {
  pairs: Pair[],
  form?: SwapForm
}

const getInitialForm = (pair: Pair): SwapForm => ({
  selected: pair,
  from_value: 0,
  to_value: 0
})

const initialState: SwapState = {
  pairs: [],
}

const nodeUrl = `https://hackathon.welocal.dev/node-0/`
export const sdk = new We(nodeUrl)
export const SEED = 'when cluster camera mistake movie certain category garlic regret believe visit evidence cute legal expire'

// TODO Contract integration
const handleTx = async ({
  amountA, 
  amountB, 
  assetIDA, 
  assetIDB, 
  weightA, 
  weightB
}: {
  amountA: number, 
  amountB: number, 
  assetIDA: string, 
  assetIDB: string, 
  weightA: number, 
  weightB: number
}) => {
  const config: any = await sdk.node.config();

  const fee = config.minimumFee[TRANSACTION_TYPES.Transfer]

  const res = await window.WEWallet.publicState()

  const tx = TRANSACTIONS.CallContract.V5({
      contractId: CONTRACT_ID,
      params: [
          {
            key: 'amountA',
            value: amountA,
            type: 'integer'
          },
          {
            key: 'amountB',
            value: amountB,
            type: 'integer'
          },
          {
            key: 'weightA',
            value: weightA,
            type: 'integer'
          },
          {
            key: 'weightB',
            value: weightB,
            type: 'integer'
          },
          {
            key: 'idA',
            value: assetIDA,
            type: 'string'
          },
          {
            key: 'idB',
            value: assetIDB,
            type: 'string'
          }
      ],
      senderPublicKey: res.account.publicKey,
      fee: fee,
      contractVersion: 1,
      payments: [
          /* TODO слыш работать */
      ]
  })
  
  const signedTx = await window.WEWallet.signTx(tx);

  
  
  try {
      const res = await sdk.broadcastRaw(signedTx)

      console.log(res);
      // TODO Чота после успешной интеграции
  } catch (e) {


  }

}

export const loadPairs = createAsyncThunk(
  'name/loadPairs',
  async (_, {rejectWithValue}) => {
    try {
      const res = await fetch('http://45.67.56.33:8228/api/v1/trading/pairs/all/', {
        headers: new Headers({
          'Accept': 'application/json',
        }),
        
      })
      const data: Pair[] = await res.json()
      if (!data || !data.length) throw new Error("Нет пар!")
      return data.map(pair => ({
        ...pair,
        ui_name: `${pair.asset_from.ticker} -> ${pair.asset_to.ticker}`
      }))

    } catch(e) {
      rejectWithValue(e)
    }
})

const swapSlice = createSlice({
  name: 'swap',
  initialState,
  reducers: {
    changeSwapValues: (state, action: PayloadAction<{
      type: 'from' | 'to',
      value: number,
    }>) => {
      if (!state.form) return 

      const { value, type } = action.payload
      const ratio = +state.form.selected.ratio
      
      if (isNaN(ratio) || isNaN(value)) return

      switch (type) {
        case "from":
          state.form!.to_value = value * ratio
          state.form!.from_value = value
          
          return
        case "to":
          state.form!.from_value = value / ratio
          state.form!.to_value = value

          return
      }
    },
    changePair: (state, action: PayloadAction<PairID>) => {
      const id = action.payload

      const newPair = state.pairs.find(pair => pair.id === id)
      if (!newPair) return
      
      state.form = getInitialForm(newPair)
    }
  },
  extraReducers: (builder) => {
    builder.addCase(loadPairs.fulfilled, (state, action) => {
      const pairs = action.payload!
      state.pairs = pairs

      state.form = getInitialForm(pairs[0])
    })
    builder.addCase(loadPairs.rejected, (state, action) => {
      console.log(action.error)
    })
  }
})

export const formSelector = (state: RootState) => state.swap.form
export const pairsSelector = (state: RootState) => state.swap.pairs

export default swapSlice.reducer
export const { changeSwapValues, changePair } = swapSlice.actions