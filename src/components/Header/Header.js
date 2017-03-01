import React from 'react'
import { FormattedMessage } from 'react-intl'
import withStyles from 'isomorphic-style-loader/lib/withStyles'
import s from './Header.scss'
import Link from '../Link'
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher'

class Header extends React.Component {
  render () {
    return (
      <div className={s.root}>
        <LanguageSwitcher />
        <Link to={'/'}>
          <FormattedMessage id='app' />
        </Link>
        <button className='btn btn-primary'>Bootstrap</button>
      </div>
    )
  }
}

export default withStyles(s)(Header)
