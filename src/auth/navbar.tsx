import React, { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../common/store'
import { initUser, profileSelector, weNotInstalled, WEWalletSelector } from './auth-slice'
import styles from './navbar.module.scss'
import wewalletlogo from '../assets/wewalletlogo.jpg'
import userico from '../assets/icons8-user-50.png'

const Auth = () => {
  return (
    <div className={styles.auth}>
      <a href="https://chrome.google.com/webstore/detail/waves-enterprise-wallet/nhihjlnjgibefgjhobhcphmnckoogdea" >
        <img className={styles.wewalletlogo} src={wewalletlogo} alt="WEWalletLogo"/>
      </a>
    </div>
  )
}

const replaceAddress = (addr: string) => [addr.substring(0, Math.round(window.innerWidth/100)), '...', addr.substring(addr.length - 4, addr.length)].join('')

const Profile = () => {
  const profile = useAppSelector(profileSelector)

  return (
    <div className={styles.profile}>
      <img className={styles.userico} src={userico} alt="UserIcon" />
      <span className={styles.name}>{profile.name}</span>
      <span className={styles.address}>{replaceAddress(profile.address)}</span>
      <span className={styles.babki}>{profile.balance.available} WEST</span>
    </div>
  )
}

export const Navbar = () => {
  const dispatch = useAppDispatch()

  const walletExist = useAppSelector(WEWalletSelector)
  
  useEffect(() => {
    async function weCheck() {
      const {WEWallet} = window
      if (!WEWallet) {
        return dispatch(weNotInstalled())
      } 
      await WEWallet.initialPromise 
      
      try {
        const {account} = await WEWallet.publicState()

        dispatch(initUser(account))
      } catch(e) {
        console.log("ярик бочок потик:", e)
      }
    }
    window.addEventListener('load', weCheck)

    return () => {
      window.removeEventListener('load', weCheck)
    }
  }, [])

  return (
    <header className={styles.navbar}>
      {
        walletExist
        ? <Profile />
        : <Auth/>
      }
    </header>
  )
}
