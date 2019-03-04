import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import './index.css';

/***
 TODOS
 - tests
 - formatting
 - html
 ***/


class GroupDetails extends React.Component {
  render(){
    return (
      <div>
        <button onClick = {(this.props.onClick)}>
          Hide Group
        </button>
        <br/>
        <div className="display-linebreak"> 
          {this.props.GroupDetails.plain_text_description}
        </div>
      </div>
    );
  }
}


class EventRow extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showDetails: false,
      GroupDetails: {},
    };
  }

  handleClick() {
    const urlname = this.props.event.group.urlname

    if (!this.state.GroupDetails.urlname) {
      axios.get('/groups/' + urlname).then(res => {
        this.setState({GroupDetails: res.data});
      });
    }

    this.setState({
      showDetails: !this.state.showDetails
    });
  }

  render() {
    const event = this.props.event;

    if (!this.props.isHidden) {
      return (
        <li className = 'event'>
          <div>
            <button onClick={() => this.handleClick()}>
              {event.group.name}
            </button>
            <div class="group-city">{event.group.localized_location}</div>
            {this.state.showDetails ?
              <GroupDetails
                group = {event.group}
                GroupDetails = {this.state.GroupDetails}
                onClick = {this.props.onClick}
              /> :
              null
            }
            <br/>
            {<a href={event.link} target='_blank'>{event.name}</a>}
          </div>
          <div>
            {new Date(event.time).toString()}
            {event.venue ? ', ' + event.venue.name : ''}
            <br/>
            {event.venue ? event.venue.city : ''}
          </div>
        </li>
      )
    } else {
      return (
        <li className = 'event'>
          <div className = 'hidden'>
            {event.group.name} [{event.group.id}] has been hidden.
          </div>
        </li>
      )
    }
  }
}


class EventsList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      events: [],
      hiddenGroups: []
    };
  }

  componentDidMount() {      
    axios.get('/groups?filtered=true').then(res => {
      this.setState({events: res.data});
    });
  }

  handleClick(eventId) {
    const hiddenGroups = this.state.hiddenGroups;

    axios.post('/group_filter', {"groupId" : eventId}).then(res => {
      this.setState({
        hiddenGroups: hiddenGroups.concat(eventId),
      })
    });
  }

  render() {
    const events = this.state.events
    const hiddenGroups = this.state.hiddenGroups

    const eventRows = events.map((event) => {
      return (
        <EventRow 
          event = {event}
          onClick = {() => this.handleClick(event.group.id)}
          isHidden = {hiddenGroups.includes(event.group.id)}
          key = {event.id}
        />
      )
    })

    return (
      <div>
        <div className = 'header'>
          <div>Displaying {events.length} events</div>
        </div>
        <div className = 'list'>{eventRows}</div>
      </div>
    );
  }
}


ReactDOM.render (
  <EventsList />,
  document.getElementById('root')
);

