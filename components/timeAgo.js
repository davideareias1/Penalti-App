import React, { Component } from "react";
import { Text } from "react-native";

class TimeAgo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      time: props.timestamp,
    };
  }

  componentDidMount() {
    this.intervalId = setInterval(() => {
      this.setState({ time: this.props.timestamp });
    }, 60000); // Update every minute
  }

  componentWillUnmount() {
    clearInterval(this.intervalId);
  }

  render() {
    const { style } = this.props;
    const timeAgo = Math.floor((Date.now() - this.state.time) / 1000 / 60);

    return <Text style={style}>{timeAgo} minutes ago</Text>;
  }
}

export default TimeAgo;
