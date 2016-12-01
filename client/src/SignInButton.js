import React from 'react'
import azureClient from './shared/azureClient'
import { Jumbotron, Button, OverlayTrigger, Tooltip } from 'react-bootstrap'

const SigninButton = (props) => {
  const tooltip = (
    <Tooltip id="tooltip">Please use your <strong>company</strong> email and password</Tooltip>
  );
  return (
    <Jumbotron>
      <p>You are not logged in.</p>
      < OverlayTrigger placement="left" overlay={tooltip} >
        <Button
          bsSize="large"
          onClick={() => azureClient.authenticate(props.from)}
          >Sign in
              </Button>
      </OverlayTrigger >
    </Jumbotron>
  )
}

export default SigninButton
