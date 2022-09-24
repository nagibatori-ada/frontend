import React, { useEffect, useMemo } from 'react'
import { shallowEqual } from 'react-redux'
import { profileSelector } from '../auth/auth-slice'
import { useAppDispatch, useAppSelector } from '../common/store'
import { Asset, changePair, changeSwapValues, formSelector, loadPairs, pairsSelector } from './swap-slice'
import styles from './swap.module.scss'

const FormInput = ({type, value, event, assets, current_id, handleSelect}: {
  type: 'from' | 'to',
  value?: number,
  event: (e: React.ChangeEvent<HTMLInputElement>) => void,
  assets: Asset[],
  current_id: number,
  handleSelect: (type: 'from' | 'to') => (e: React.ChangeEvent<HTMLSelectElement>) => void
}) => (
  <div className={styles.forminput}>
      <input inputMode='decimal' className={styles.forminput__input} name={type} id={type} value={value || 0} onChange={event}/>
      <label className={styles.forminput__label} htmlFor={type}>{type.toUpperCase()}</label>
      <select className={styles.pair} value={current_id} onChange={handleSelect(type)}>
        {assets.map(asset => <option value={asset.id}>{asset.ticker}</option>)}
      </select>
  </div>
)

const Form = () => {
  const { to_value, from_value, selected } = useAppSelector(formSelector, shallowEqual) || {}
  const profile = useAppSelector(profileSelector, shallowEqual)
  const pairs = useAppSelector(pairsSelector, shallowEqual)
  
  const dispatch = useAppDispatch()

  const assets = useMemo(() => {
    const result: Asset[] = []
    pairs.forEach(pair => {
      if (!result.find(p => p.id === pair.asset_from.id)) result.push(pair.asset_from)
    })
    return result
  }, [pairs])

  const isValid = from_value && !isNaN(+profile.balance.available) && from_value < +profile.balance.available 

  const changeInput = (type: 'from' | 'to') => 
    (e: React.ChangeEvent<HTMLInputElement>) => {
      dispatch(changeSwapValues({type, value: +e.target.value}))
    }

  // TODO contract integration
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    /* Contact calls here */
  }

  const onSelectChange = (type: 'from' | 'to') => (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!selected) return
    if (
      (+e.target.value === selected.asset_to.id && type !== 'to') || 
      (+e.target.value === selected.asset_from.id && type !== 'from')
    ) {
      return dispatch(
        changePair(
          pairs.find(pair => 
            pair.asset_from.id === selected.asset_to.id && 
            pair.asset_to.id === selected.asset_from.id)!.id
          )
        )
    }
    switch (type) {
      case 'from':
        return dispatch(changePair(
          pairs.find(pair => 
            pair.asset_from.id === +e.target.value && 
            pair.asset_to.id === selected.asset_to.id)!.id
          )
        )
      case 'to':
        return dispatch(changePair(
          pairs.find(pair => 
            pair.asset_from.id === selected.asset_from.id && 
            pair.asset_to.id === +e.target.value)!.id
          )
        )
    }
  }

  return (
    <form className={styles.form} onSubmit={isValid ? onSubmit : (e) => e.preventDefault()}>
      <FormInput type='from' 
                 value={from_value} 
                 event={selected ? changeInput('from') : () => {}}
                 assets={assets}
                 current_id={selected?.asset_from.id || -1}
                 handleSelect={onSelectChange}
      />
      <span className={styles.fromtoarrow}>{'↓'}</span>
      <FormInput type='to' 
                 value={to_value} 
                 event={selected ? changeInput('to') : () => {}}
                 assets={assets}
                 current_id={selected?.asset_to.id || -2}
                 handleSelect={onSelectChange}
      />
        { 
          selected && 
          <div className={styles.description}>
            <div>Price</div>
            <div>{1/+selected.ratio} {selected.asset_from.ticker} per {selected.asset_to.ticker}</div>
          </div> 
        }
      <input className={`${styles.formsubmit}`} disabled={!isValid} type="submit" value="Swap"/>
    </form>
  )
}

export const Swap = () => {
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(loadPairs())
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  
  return (
    <div className={styles.swap}>
      <div className={styles.container}>
        <Form />
      </div>
    </div>
  )
}
