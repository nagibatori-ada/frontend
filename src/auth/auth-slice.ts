import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../common/store";

type AuthState = {
  profile: any,
  wewallet: boolean
}

const initialState: AuthState = {
  profile: null,
  wewallet: false
}

const authSlice = createSlice({
  name: 'authSlice',
  initialState,
  reducers: {
    weNotInstalled: (state) => {
      state.wewallet = false
      state.profile = null
    },
    initUser: (state, action: PayloadAction<any>) => {
      state.profile = action.payload
      state.wewallet = true
    }
  }
})

export const WEWalletSelector = (state: RootState) => state.auth.wewallet
export const profileSelector = (state: RootState) => state.auth.profile

export default authSlice.reducer
export const { initUser, weNotInstalled } = authSlice.actions