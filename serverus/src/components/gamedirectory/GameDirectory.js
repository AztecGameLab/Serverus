//React & Redux
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

//Actions
import { loadGames } from "../../features/siteData/siteDataActions";

//Selectors
import { selectIsGameDirectoryCached, selectGameDirectory, selectLoadGameDirectoryStatus } from "../../features/siteData/siteDataSelectors";

//Components
import { Button } from "semantic-ui-react";

class GameDirectory extends Component {
  componentDidMount() {
    const { isGameDirectoryCached, loadGames } = this.props;
    if (!isGameDirectoryCached) {
      loadGames();
    }
    console.log("Games already cached:", isGameDirectoryCached);
  }

  render() {
    const { loadGames } = this.props;
    return (
      <div>
        Game Directory
        <Button onClick={loadGames}>Load Games</Button>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    isGameDirectoryCached: selectIsGameDirectoryCached(state),
    gameDirectory: selectGameDirectory(state),
    gameDirectoryLoadStatus: selectLoadGameDirectoryStatus(state)
  };
};

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      loadGames
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(GameDirectory);
