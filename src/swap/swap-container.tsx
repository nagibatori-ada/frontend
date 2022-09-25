import React, { useCallback, useEffect, useMemo } from 'react'
import { shallowEqual } from 'react-redux'
import { profileSelector } from '../auth/auth-slice'
import { useAppDispatch, useAppSelector } from '../common/store'
import { Asset, changePair, changeSwapValues, exchange, formSelector, loadPairs, pairsSelector } from './swap-slice'
import styles from './swap.module.scss'

const FormInput = ({type, value, event, assets, current_id, handleSelect}: {
  type: 'from' | 'to',
  value?: number,
  event: (e: React.ChangeEvent<HTMLInputElement>) => void,
  assets: Asset[],
  current_id: string,
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
      if (!result.find(p => p.id === pair.asset_a.id)) result.push(pair.asset_a)
    })
    return result
  }, [pairs])

  const isValid = from_value && !isNaN(+profile.balance.available) && from_value < +profile.balance.available 

  const changeInput = (type: 'from' | 'to') => 
    (e: React.ChangeEvent<HTMLInputElement>) => {
      dispatch(changeSwapValues({type, value: +e.target.value}))
    }

  // TODO contract integration
  const onSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    /* Contact calls here */
    dispatch(exchange())
  }, [dispatch])

  const onSelectChange = (type: 'from' | 'to') => 
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      if (!selected) return
      if (
        (e.target.value === selected.asset_b.id && type !== 'to') || 
        (e.target.value === selected.asset_a.id && type !== 'from')
      ) {
        return dispatch(
          changePair(
            pairs.find(pair => 
              pair.asset_a.id === selected.asset_b.id && 
              pair.asset_b.id === selected.asset_a.id)!.id
            )
          )
      }
      console.log(pairs, e.target.value)
      switch (type) {
        case 'from':
          return dispatch(changePair(
            pairs.find(pair => 
              '' + pair.asset_a.id === e.target.value && 
              pair.asset_b.id === selected.asset_b.id)!.id
            )
          )
        case 'to':
          return dispatch(changePair(
            pairs.find(pair => 
              pair.asset_a.id === selected.asset_a.id && 
              '' + pair.asset_b.id === e.target.value)!.id
            )
          )
      }
  }

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      <FormInput type='from' 
                 value={from_value} 
                 event={selected ? changeInput('from') : () => {}}
                 assets={assets}
                 current_id={selected?.asset_a.id || '-1'}
                 handleSelect={onSelectChange}
      />
      <span className={styles.fromtoarrow}>{'↓'}</span>
      <FormInput type='to' 
                 value={to_value} 
                 event={selected ? changeInput('to') : () => {}}
                 assets={assets}
                 current_id={selected?.asset_b.id || '-2'}
                 handleSelect={onSelectChange}
      />
        { 
          selected && 
          <div className={styles.description}>
            <div>Price</div>
            <div>{1/+selected.ratio} {selected.asset_a.ticker} per {selected.asset_b.ticker}</div>
          </div> 
        }
      <input className={`${styles.formsubmit}`} type="submit" value="Swap"/>
    </form>
  )
}
// isValid ? onSubmit : (e) => e.preventDefault()
/*disabled={!isValid} */
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
