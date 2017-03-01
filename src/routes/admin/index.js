import React from 'react'
import Layout from '../../components/Layout/Layout'

const title = 'Admin Page'
const isAdmin = true

export default {

  path: '/',

  async action () {
    if (!isAdmin) {
      return { redirect: '/login' }
    }

    const Admin = await require.ensure([], require => require('./Admin').default, 'admin')

    return {
      title,
      chunk: 'admin',
      component: <Layout><Admin title={title} /></Layout>
    }
  }

}
