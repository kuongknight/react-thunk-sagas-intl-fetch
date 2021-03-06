import path from 'path'
import express from 'express'
import cookieParser from 'cookie-parser'
import requestLanguage from 'express-request-language'
import bodyParser from 'body-parser'
import React from 'react'
import ReactDOM from 'react-dom/server'
import UniversalRouter from 'universal-router'
import PrettyError from 'pretty-error'
import { IntlProvider } from 'react-intl'

import './serverIntlPolyfill'
import App from './components/App'
import Html from './components/Html'
import { ErrorPageWithoutStyle } from './routes/error/ErrorPage'
import errorPageStyle from './routes/error/ErrorPage.scss'
import routes from './routes'
import assets from './assets.json'
import configureStore from './store/configureStore'
import { setRuntimeVariable } from './actions/runtime'
import { setLocale } from './actions/intl'
import { port, locales } from './config'

const app = express()

//
// Tell any CSS tooling (such as Material UI) to use all vendor prefixes if the
// user agent is not known.
// -----------------------------------------------------------------------------
global.navigator = global.navigator || {}
global.navigator.userAgent = global.navigator.userAgent || 'all'

//
// Register Node.js middleware
// -----------------------------------------------------------------------------
app.use(express.static(path.join(__dirname, 'public')))
app.use(cookieParser())
app.use(requestLanguage({
  languages: locales,
  queryName: 'lang',
  cookie: {
    name: 'lang',
    options: {
      path: '/',
      maxAge: 3650 * 24 * 3600 * 1000 // 10 years in miliseconds
    },
    url: '/lang/{language}'
  }
}))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

//
// Register server-side rendering middleware
// -----------------------------------------------------------------------------
app.get('*', async (req, res, next) => {
  try {
    const store = configureStore({
      user: req.user || null
    }, {
      cookie: req.headers.cookie
    })

    store.dispatch(setRuntimeVariable({
      name: 'initialNow',
      value: Date.now()
    }))

    store.dispatch(setRuntimeVariable({
      name: 'availableLocales',
      value: locales
    }))

    const locale = req.language
    await store.dispatch(setLocale({
      locale
    }))

    const css = new Set()

    // Global (context) variables that can be easily accessed from any React component
    // https://facebook.github.io/react/docs/context.html
    const context = {
      // Enables critical path CSS rendering
      // https://github.com/kriasoft/isomorphic-style-loader
      insertCss: (...styles) => {
        // eslint-disable-next-line no-underscore-dangle
        styles.forEach(style => css.add(style._getCss()))
      },
      // Initialize a new Redux store
      // http://redux.js.org/docs/basics/UsageWithReact.html
      store
    }

    const route = await UniversalRouter.resolve(routes, {
      ...context,
      path: req.path,
      query: req.query,
      locale
    })

    if (route.redirect) {
      res.redirect(route.status || 302, route.redirect)
      return
    }

    const data = { ...route }

    data.children = ReactDOM.renderToString(<App context={context}>{route.component}</App>)
    data.styles = [
      { id: 'css', cssText: [...css].join('') }
    ]
    data.scripts = [
      assets.vendor.js,
      assets.client.js
    ]

    // Furthermore invoked actions will be ignored, client will not receive them!
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.log('Serializing store...')
    }
    data.state = context.store.getState()

    if (assets[route.chunk]) {
      data.scripts.push(assets[route.chunk].js)
    }
    data.lang = locale

    const html = ReactDOM.renderToStaticMarkup(<Html {...data} />)
    res.status(route.status || 200)
    res.send(`<!doctype html>${html}`)
  } catch (err) {
    next(err)
  }
})

//
// Error handling
// -----------------------------------------------------------------------------
const pe = new PrettyError()
pe.skipNodeFiles()
pe.skipPackage('express')

app.use((err, req, res, next) => {
  console.log(pe.render(err))
  const locale = req.language
  const html = ReactDOM.renderToStaticMarkup(
    <Html
      title='Internal Server Error'
      description={err.message}
      styles={[{ id: 'css', cssText: errorPageStyle._getCss() }]}
      lang={locale}
    >
      {ReactDOM.renderToString(
        <IntlProvider locale={locale}>
          <ErrorPageWithoutStyle error={err} />
        </IntlProvider>,
      )}
    </Html>,
  )
  res.status(err.status || 500)
  res.send(`<!doctype html>${html}`)
})

//
// Launch the server
// -----------------------------------------------------------------------------
/* eslint-disable no-console */
app.listen(port, () => {
  console.log(`The server is running at http://localhost:${port}/`)
})
