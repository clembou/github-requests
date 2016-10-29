import React from 'react'
import {FormGroup, FormControl, ControlLabel} from 'react-bootstrap'
import {Link} from 'react-router'

class OrgSelector extends React.Component {
  constructor(props, context){
        super(props, context)
        this.state = { value: '' }
        this.handleChange = this.handleChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
    }

    handleChange(e) {
        this.setState({ value: e.target.value });
    }

    handleSubmit(e) {
        e.preventDefault()
        this.context.router.transitionTo(`${this.props.location.pathname}/${this.state.value}`)
    }

    render() {
        return (
            <form onSubmit={this.handleSubmit}>
              <FormGroup
                controlId="formBasicText"
                bsSize="large"
              >
                <ControlLabel>Please enter the name of a github organisation</ControlLabel>
                <FormControl
                  type="text"
                  value={this.state.value}
                  placeholder="Enter organistion name"
                  onChange={this.handleChange}
                />
              </FormGroup>
              <Link to={`${this.props.location.pathname}/${this.state.value}`}>Go!!</Link>
            </form>
        )
    }
}

OrgSelector.contextTypes = {
  router: React.PropTypes.object.isRequired
};

export default OrgSelector
