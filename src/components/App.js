import React, { Children, PropTypes } from 'react'
import { IntlProvider } from 'react-intl'

const ContextType = {
  // Enables critical path CSS rendering
  // https://github.com/kriasoft/isomorphic-style-loader
  insertCss: PropTypes.func.isRequired,
  // Integrate Redux
  // http://redux.js.org/docs/basics/UsageWithReact.html
  store: PropTypes.shape({
    subscribe: PropTypes.func.isRequired,
    dispatch: PropTypes.func.isRequired,
    getState: PropTypes.func.isRequired
  }).isRequired
}

/**
 * The top-level React component setting context (global) variables
 * that can be accessed from all the child components.
 *
 * https://facebook.github.io/react/docs/context.html
 *
 * Usage example:
 *
 *   const context = {
 *     history: createBrowserHistory(),
 *     store: createStore(),
 *   }
 *
 *   ReactDOM.render(
 *     <App context={context}>
 *       <Layout>
 *         <LandingPage />
 *       </Layout>
 *     </App>,
 *     container,
 *   )
 */
class App extends React.PureComponent {
  static propTypes = {
    context: PropTypes.shape(ContextType).isRequired,
    children: PropTypes.element.isRequired
  }

  static childContextTypes = ContextType

  getChildContext () {
    return this.props.context
  }

  componentDidMount () {
    const store = this.props.context && this.props.context.store
    if (store) {
      this.unsubscribe = store.subscribe(() => {
        const state = store.getState()
        const newIntl = state.intl
        if (this.intl !== newIntl) {
          this.intl = newIntl
          this.forceUpdate()
        }
      })
    }
  }

  componentWillUnmount () {
    if (this.unsubscribe) {
      this.unsubscribe()
      this.unsubscribe = null
    }
  }

  render () {
    // NOTE: If you need to add or modify header, footer etc. of the app,
    // please do that inside the Layout component.
    const store = this.props.context && this.props.context.store
    const state = store && store.getState()
    this.intl = (state && state.intl) || {}
    const { initialNow, locale, messages } = this.intl
    const localeMessages = (messages && messages[locale]) || {}
    return (
      <IntlProvider
        initialNow={initialNow}
        locale={locale}
        messages={localeMessages}
        defaultLocale='en-US'>
        {Children.only(this.props.children)}
      </IntlProvider>
    )
  }
}

export default App
