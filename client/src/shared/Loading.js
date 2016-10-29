import React from 'react'

export const Loading = (props) => (
  <i className="fa fa-spinner fa-pulse fa-3x fa-fw">
    <span className="sr-only">Loading...</span>
  </i>
)

export const LoadingWithMessage = (props) => (
  <div>
  <Loading />
  <h2>{props.message}</h2>
  </div>
)
