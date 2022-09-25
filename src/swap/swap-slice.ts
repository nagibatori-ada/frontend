import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { TRANSACTIONS } from '@wavesenterprise/transactions-factory'
import { Keypair } from "@wavesenterprise/signer";

import {We} from "@wavesenterprise/sdk";
import { RootState } from "../common/store";
import { getPairs } from "../api";

export type PairID = number

export interface Asset {
  id: string,
  name: string,
  ticker: string,
  volume_24h: number,
  asset_id: string
}

export interface PairRaw {
  id: PairID,
  asset_a: Asset,
  asset_b: Asset,
  contract_id: string
}

export interface Pair extends PairRaw {
  ratio: string
}
export interface PairBackend extends PairRaw {
  weight_a: number,
  weight_b: number
}

interface SwapForm {
  selected: Pair,
  from_value: number,
  to_value: number,
  lastChanges: 'from' | 'to'
}

type SwapState = {
  pairs: Pair[],
  form?: SwapForm
}

const getInitialForm = (pair: Pair): SwapForm => ({
  selected: pair,
  from_value: 0,
  to_value: 0,
  lastChanges: 'from'
})

const initialState: SwapState = {
  pairs: [],
}

const nodeUrl = `https://hackathon.welocal.dev/node-0/`
export const sdk = new We(nodeUrl)
export const SEED = 'thing action ugly exclude usage day victory file panel jeans oxygen melody upset employ tool'

// TODO Contract integration
const handleTx = async ({
  assetId,
  babki,
  type,
  contract_id
}: {
  babki: number, 
  assetId: string,
  type: 'from' | 'to',
  contract_id: string
}) => {
  const config: any = await sdk.node.config();
  const fee = config.minimumFee[104]
  const res = await Keypair.fromExistingSeedPhrase(SEED)
  const tx = TRANSACTIONS.CallContract.V5({
      contractId: contract_id,
      params: [
          {
            key: 'action',
            value: type === 'from' ? 'buyB' : 'buyA',
            type: 'string'
          }
      ],
      senderPublicKey: await res.privateKey(),
      fee: fee,
      contractVersion: 1,
      payments: [
        {
          assetId,
          amount: babki
        }
      ]
  })
  
  console.log(tx)
  const signedTx = await window.WEWallet.signTx(tx, SEED);
  console.log(signedTx)
  const broadcast = await sdk.broadcast(signedTx)
  return broadcast
}

export const exchange = createAsyncThunk(
  'swap/exchange',
  async(_, {rejectWithValue, getState}) => {
    const { swap } = getState() as RootState
    const { form } = swap
    if (!form) return

    const body = {
      type: form.lastChanges,
      assetId: form.lastChanges === 'from' ? form.selected.asset_a.asset_id : form.selected.asset_b.asset_id,
      babki: form.lastChanges === 'from' ? form.from_value : form.to_value,
      contract_id: form.selected.contract_id
    }

    try {
      const handled = await handleTx({
        ...body
      })
      return handled
    } catch(e) {
      rejectWithValue(e)
    }
  }
)

export const loadPairs = createAsyncThunk(
  'swap/loadPairs',
  async (_, {rejectWithValue}) => {
    try {
      const res = await getPairs()
      const data: PairBackend[] = await res.json()
      if (!data || !data.length) throw new Error("Нет пар!")
      return data

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
      
      state.form!.lastChanges = type
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

      state.pairs = pairs.map(pair => ({
        ...pair,
        ratio: '' + pair.weight_a / pair.weight_b
      }))

      state.form = getInitialForm(state.pairs[0])
    })
    builder.addCase(loadPairs.rejected, (state, action) => {
      console.log(action.error)
    })

    builder.addCase(exchange.fulfilled, (state, action) => {
      console.log(action.payload)
    })
    builder.addCase(exchange.rejected, (state, action) => {
      console.log(action.error)
    })
  }
})

export const formSelector = (state: RootState) => state.swap.form
export const pairsSelector = (state: RootState) => state.swap.pairs

export default swapSlice.reducer
export const { changeSwapValues, changePair } = swapSlice.actions