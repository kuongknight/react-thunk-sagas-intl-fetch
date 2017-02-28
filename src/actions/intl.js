import { SET_LOCALE_START, SET_LOCALE_SUCCESS, SET_LOCALE_ERROR } from '../constants'
export function setLocale ({ locale }) {
  return async (dispatch, getState, { fetch }) => {
    dispatch({
      type: SET_LOCALE_START,
      payload: {
        locale
      }
    })

    try {
      const { data } = {}
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
