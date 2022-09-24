import { configureStore } from "@reduxjs/toolkit";
import { type TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import authSlice from "../auth/auth-slice";
import swapSlice from "../swap/swap-slice";

const store = configureStore({
  reducer: {
    auth: authSlice,
    swap: swapSlice
  },
  devTools: process.env.NODE_ENV === 'development',
  middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
})

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>

export default store
export const useAppDispatch: () => AppDispatch = useDispatch
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector