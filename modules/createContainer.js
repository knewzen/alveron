/* @flow */
/* eslint-disable import/no-unresolved, import/extensions */
import { connect } from 'react-redux'
/* eslint-enable */

import generateAnonymousId from './utils/generateAnonymousId'
import createDispatchers from './utils/createDispatchers'
import createActions from './utils/createActions'
import createReducer from './utils/createReducer'
import createFunctionMap from './utils/createFunctionMap'

import paraduxInstance from './utils/paraduxInstance'

import type { Interface } from '../types/Interface'

export default function createContainer({
  view,
  update,
  model = undefined,
  payload
}: Interface) {
  return (scope: string = generateAnonymousId()) => {
    const updateMap = createFunctionMap(update)
    const payloadCreator = createFunctionMap(payload)
    const actions = createActions(updateMap, payloadCreator, scope)

    const reduxReducer = createReducer(updateMap, scope, model)
    paraduxInstance.register(reduxReducer)

    const mapDispatchToProps = dispatch => createDispatchers(dispatch, actions)
    const mapStateToProps = state => {
      // hacky way to initialize the reducer if it is added
      // after the redux store is created
      // we might find a better solution for this later
      if (!state.hasOwnProperty(scope)) {
        reduxReducer(state, { type: '@@INIT' })
      }

      return { state: state[scope], scope }
    }

    return connect(mapStateToProps, mapDispatchToProps)(view)
  }
}
/*
*/
