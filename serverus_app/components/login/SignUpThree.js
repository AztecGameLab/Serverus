import React, { Component } from 'react';
import firebase from 'firebase';
import { Button, Form, Checkbox, Input, Icon, Grid, Label, Dropdown, Modal, Popup, Message } from 'semantic-ui-react';
import roleOptions from '../common/roleOptions.json';
import profileIcons from '../common/profileIconOptions';
import { Image, CloudinaryContext, Transformation } from 'cloudinary-react';
import axios from 'axios';
import IconPicker from '../common/IconPicker';

class SignUpThree extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      usernameFilled: false,
      usernameLimit: false,
      rolesFilled: '',
      usernameTaken: false,
      buttonDisable: true,
      existingUsernames: [],
      loading: false,
      termsAccepted: false,
      rolesSelected: [],
      securityCodeFilled: false
    };
    this.usernameCheck = this.usernameCheck.bind(this);
    this.adminCheck = this.adminCheck.bind(this);
    this.formComplete = this.formComplete.bind(this);
    this.termsAccepted = this.termsAccepted.bind(this);
    this.rolesCheck = this.rolesCheck.bind(this);
  }
  componentWillMount() {
    var usernameRef = firebase.database().ref('takenUsernames/');
    var that = this;
    usernameRef.once('value', function (snapshot) {
      if (snapshot.val()) {
        that.setState({
          existingUsernames: Object.values(snapshot.val())
        });
      }
    });
  }
  rolesCheck(e, { value }) {
    this.props.handleRolesInput(e, { value });
    var that = this;
    this.setState({
      rolesSelected: value
    }, function () {
      that.formComplete();
    });
  }

  usernameCheck(e) {
    var that = this;
    this.props.handleUsernameInput(e);
    if (e.target.value.length > 0 && e.target.value.length < 20) {
      for (var i in this.state.existingUsernames) {
        if (this.state.existingUsernames[i] == e.target.value) {
          that.setState({
            usernameFilled: true,
            usernameTaken: true,
            usernameLimit: false
          }, function () {
            that.formComplete();
          });
          return;
        }
      }
      this.setState({
        usernameFilled: true,
        usernameTaken: false,
        usernameLimit: false
      }, function () {
        that.formComplete();
      });
      return;
    }
    else if (e.target.value == "") {
      this.setState({
        usernameFilled: false,
        usernameTaken: false,
        usernameLimit: false
      }, function () {
        that.formComplete();
      });
    }
    else {
      this.setState({
        usernameFilled: true,
        usernameTaken: false,
        usernameLimit: true
      }, function () {
        that.formComplete();
      });
    }
  }

  adminCheck(e) {
    this.props.handleAdminCode(e);
    this.setState({
      securityCodeFilled: true
    }, function () {
      this.formComplete();
    });
  }

  termsAccepted(e) {
    let prevChecked = this.state.termsAccepted;
    this.setState({
      termsAccepted: !prevChecked
    }, function () {
      this.formComplete();
    });
  }
  formComplete() {
    var isTaken = this.state.usernameTaken || this.state.usernameLimit;
    var inputsFilled = this.state.usernameFilled && (this.state.rolesSelected.length > 0) && this.state.securityCodeFilled;
    var termsAccepted = this.state.termsAccepted;
    if (inputsFilled) {
      if (!isTaken) {
        if (termsAccepted) {
          this.setState({
            buttonDisable: false
          });
          return;
        }
        else {
          this.setState({
            buttonDisable: true
          });
          return;
        }
      }
      else {
        this.setState({
          buttonDisable: true
        });
      }
      return;
    }
    else {
      this.setState({
        buttonDisable: true
      });
      return;
    }
  }
  render() {
      return (
          <div>
            <div style={modalStyle.spacing}>
              <Grid divided='vertically'>
                <Grid.Row columns={2}>
                  <Grid.Column width={5} >
                    <IconPicker startingIcon= {this.props.startingIcon} 
                                handleProfileInput = {this.props.handleProfileInput}
                                editEnabled = {true}/>
                  </Grid.Column>
                  <Grid.Column width={11} >
                    <Form.Field>
                      <Popup
                        trigger={<label>AGL Username</label>}
                        content='This will be your display username and how others see you!'
                        inverted
                      />
                      <Input placeholder='Username' iconPosition='left'>
                        <Icon name='new pied piper' />
                        <input onChange={this.usernameCheck} />
                        {this.state.usernameTaken && <Label pointing='left' color='red'>Username is already taken</Label>}
                        {this.state.usernameLimit && <Label pointing='left' color='red'>Username is too long!</Label>}
                      </Input>
                    </Form.Field>
                    <Form.Field>
                      <Popup
                        trigger={<label>Enter a 6 digit Security PIN:</label>}
                        content='Please make sure to keep this safe and secure!'
                        inverted
                      />
                      <Input placeholder='Passcode' iconPosition='left'>
                        <Icon name='numbered list' />
                        <input onBlur={this.adminCheck} type='password' />
                      </Input>
                    </Form.Field>
                  </Grid.Column>
                </Grid.Row>
              </Grid>
            </div>
            <div style={modalStyle.spacing}>
              <Form.Field>
                <label>Roles Interested In:</label>
                <Dropdown placeholder='Roles' fluid multiple selection options={roleOptions.roles}
                  value={this.state.rolesSelected} onChange={this.rolesCheck} />
              </Form.Field>
            </div>
            <div style={{ padding: '5px' }}>
              <Form.Field>
                <Checkbox label='I agree to the Terms and Conditions' onClick={this.termsAccepted} />
                <hr />
                AGL terms and conditions can be found:   <a href='https://docs.google.com/document/d/1R6tGpquyGkJQlrIz-iO-xCoMH5pjsymbRFWiCd6qYQ4/edit?usp=sharing'> here</a>
              </Form.Field>
              <div style={modalStyle.spacing}>
                <Grid>
                  <Grid.Column floated='left' width={1}>
                    <Button circular icon size='big' onClick={() => this.props.changePhase(-1)}>
                      <Icon name='angle double left' />
                    </Button>
                  </Grid.Column>
                  <Grid.Column floated='right' width={10}>
                    {<Button fluid color='green' size='massive' 
                      onClick={this.props.onSubmission}
                      loading={this.props.loading}
                      disabled = {this.state.buttonDisable}>
                      <Icon  size = 'large' name = 'flask'/>
                      Welcome!

                    </Button>}
                    {this.state.error && <Message negative>
                      <Message.Header>Sorry, authentification failed</Message.Header>
                          <p>{this.prop.errorMessage}</p>
                  </Message>}
                  </Grid.Column>
                </Grid>
              </div>
            </div>
          </div>
      );
  }
}
var modalStyle = {
  spacing: {
    margin: '15px',
    width: "100%",
    display: "block"
  }
};

export default SignUpThree;