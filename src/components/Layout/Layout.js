import React, { PropTypes } from 'react'
import withStyles from 'isomorphic-style-loader/lib/withStyles'
import s from './Layout.scss'
import Header from '../Header/Header'

class Layout extends React.Component {
  static propTypes = {
    children: PropTypes.node.isRequired
  }

  render () {
    return (
      <div>
        <Header />
        {this.props.children}
      </div>
    )
  }
}

export default withStyles(s)(Layout)
