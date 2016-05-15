import React, {Component} from 'react';
import {connect} from 'react-redux';
import Topic from './topic';
import BrightBox from './brightBox';
import {nextTopic} from '../actions';
import {dispatch} from '../services/socket';
import _ from 'lodash';

class Discuss extends Component {
  constructor(props){
    super(props);
    this.nextTopic = this.nextTopic.bind(this);
    this.previousTopic = this.previousTopic.bind(this);
  }
  nextTopic(e){
    e.preventDefault();
    return dispatch(nextTopic());
  }

  previousTopic(e) {
    e.preventDefault();
    const currentTopicIndex = this.props.topics.indexOf(this.props.currentTopic);
    if(currentTopicIndex === this.props.topics.length - 1){
      return;
    }
    return this.props.dispatch(setCurrentTopic(this.props.topics[currentTopicIndex - 1]));
  }
  render(){
    const mapTopics = (topic) => {
      return (
        <Topic topic={topic} showVotes={true} key={topic.title} />
      );
    };
    const title = (
      <div className='discuss-title'>
        <h2>Discuss</h2>
      </div>);
    const bubble = (
      <div className='bubble-text current-preview'>
        <div className='current-title'>
          {_.get(this.props.currentTopic, 'title')}
        </div>
        <div className='current-actions'>
          <a href='' title='Previous Topic' className='up-arrow fa fa-arrow-up' onClick={this.previousTopic}></a>
          <a href='' title='Next Topic' className='fa fa-arrow-down' onClick={this.nextTopic}></a>
        </div>
      </div>);
    return (
      <BrightBox type='primary' title={title} className='phase discuss' bubble={bubble}>
        {this.props.topics.map(mapTopics)}
      </BrightBox>);
  }
}

const selector = state => {
  const sortedTopics = [...state.topics].sort( (l, r) => r.votes.length - l.votes.length);
  const currentTopic = sortedTopics.find(topic => topic.current);
  return {
    topics: sortedTopics,
    currentTopic
  };
};
export default connect(selector)(Discuss);
