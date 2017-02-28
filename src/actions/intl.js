import { SET_LOCALE_START, SET_LOCALE_SUCCESS, SET_LOCALE_ERROR } from '../constants'
import queryIntl from './intl.graphql'
export function setLocale ({ locale }) {
  return async (dispatch, getState, { graphqlRequest }) => {
    dispatch({
      type: SET_LOCALE_START,
      payload: {
        locale
      }
    })

    try {
      const { data } = await graphqlRequest(queryIntl, { locale })
      const messages = data.intl.reduce((msgs, msg) => {
        msgs[msg.id] = msg.message
        return msgs
      }, {})
      dispatch({
        type: SET_LOCALE_SUCCESS,
        payload: {
          locale,
          messages
        }
      })
      if (process.env.BROWSER) {
        const maxAge = 3650 * 24 * 3600
        document.cookie = `lang=${locale};path=/;max-age=${maxAge}`
      }
    } catch (error) {
      dispatch({
        type: SET_LOCALE_ERROR,
        payload: {
          locale,
          error
        }
      })
      return false
    }

    return true
  }
}
