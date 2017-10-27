import React from 'react';
import Markmirror from 'react-markmirror';
import { Dropdown, Icon } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { CloudinaryUpload, CloudinaryDelete, IsLoggedIn, SubmitPost, GetArticle, SavePost } from '../AGL';
import ArticleCard from '../common/cards/ArticleCard';
import stylesheet from '../../styles/markdown.css';

const Editor = (props) => {
    const handleType = text => {
        props.onChange(text);
    };

    //available themes: https://codemirror.net/demo/theme.html
    //<textarea rows="15" cols="40" onChange={onInputChange}

    return (
        <form>
            <Markmirror
                theme="dark,material"
                value={props.value}
                onChange={handleType}
            />
        </form>
    );
};

class ArticlePost extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            path :this.props.match.path.split('/')[2],           
            postData: {
                text: '# hello\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n',
                title: "",
                date: new Date().toDateString(),
                comments: [],
                selectedTags: [],
                type: {},
                image: {
                    public_id: null,
                    url: null,
                    allowZoomOut: true,
                    width: 600,
                    height: 350,
                    scale: 1
                },
            },
            tags: [{ text: '#extra', value: 'extra' }, { text: '#thicc', value: 'thicc' }],
            uploaded: false,
            savedPost: false,
            cloudUpload: false,
            changeImage: false,
        };
        this.onInputChange = this.onInputChange.bind(this);
        this.onTitleChange = this.onTitleChange.bind(this);
        this.handleAddition = this.handleAddition.bind(this);
        this.handleTags = this.handleTags.bind(this);
        this.handleNewImage = this.handleNewImage.bind(this);
        this.handleScale = this.handleScale.bind(this);
        this.handleAllowZoomOut = this.handleAllowZoomOut.bind(this);
        this.buttonDisable = this.buttonDisable.bind(this);
        this.savePost = this.savePost.bind(this);
        this.sendToFB = this.sendToFB.bind(this);
        this.sendToCloudinary = this.sendToCloudinary.bind(this);
    }

    async componentWillMount() {
        await this.initArticle();
        var currentState = this.state.postData;
        switch (this.state.path) {
            case 'announcement':
                currentState.type = { text: "Announcement", id: 'red' };
                this.setState({
                    postData: currentState
                });
                break;
            case 'tutorial':
                currentState.type = { text: "Tutorial", id: 'blue' };
                this.setState({
                    postData: currentState
                });
                break;
            default: break;
        }
    }

    initArticle() {
        if (this.props.location.search.length > 0) {
            var search = [];
            let query = this.props.location.search.replace("?=", "/").replace("&=", "/").split("/");
            search.push(query[1]);
            search.push(query[2]);
            var article;
            if (search[1] == "edit") {
                return GetArticle("all", search[0]).then(article => {
                    let currentState = this.state.postData;
                    let cloudUpload = false;
                    if (!article.image) article.image = {};
                    article.image.allowZoomOut = currentState.image.allowZoomOut;
                    article.image.width = currentState.image.width;
                    article.image.height = currentState.image.height;
                    if (article.image.public_id && article.image.url) {
                        cloudUpload = true;
                    }
                    this.setState({
                        postData: article,
                        editPost: true,
                        cloudUpload: cloudUpload,
                        query: search
                    });
                    if (article.selectedTags) {
                        article.selectedTags.map(tag => {
                            this.handleAddition(null, {}, tag);
                        });
                    }
                }).catch(error => {
                    console.error(error.response.data);
                    return error;
                });
            }
            // edit draft post
            else if (search[1] == "draft") {
                return GetArticle("saved", search[0]).then(article => {
                    let currentState = this.state.postData;
                    let cloudUpload = false;
                    article.image.allowZoomOut = currentState.image.allowZoomOut;
                    article.image.width = currentState.image.width;
                    article.image.height = currentState.image.height;
                    if (article.image.public_id && article.image.url) {
                        cloudUpload = true;
                    }
                    this.setState({
                        postData: article,
                        savedPost: true,
                        cloudUpload: cloudUpload,
                        query: search
                    });
                    if (article.selectedTags) {
                        article.selectedTags.map(tag => {
                            this.handleAddition(null, {}, tag);
                        });
                    }
                }).catch(error => {
                    console.error(error.response.data);
                    return error;
                });
            }
        }
    }

    handleAddition = (e, { value }, init) => {
        var counter = 0;
        this.state.tags.forEach(item => {
            if (item.value == value)
                return counter++;
        });
        if (init) {
            this.setState({
                tags: [{ text: '#' + init, value: init }, ...this.state.tags]
            });
        } else {
            if (counter < 1) {
                this.setState({
                    tags: [{ text: '#' + value, value }, ...this.state.tags]
                });
            }
        }
    }

    handleTags = (e, { value }) => {
        let currentState = Object.assign({}, this.state.postData);
        currentState.selectedTags = value;
        this.setState({ postData: currentState });
    }

    handleNewImage = e => {
        const currentState = Object.assign({}, this.state.postData);
        let { changeImage } = this.state;
        if (currentState.image.public_id) {
            changeImage = true;
        }
        currentState.image.url = e.target.files[0];
        this.setState({
            postData: currentState,
            changeImage: changeImage
        });
    }

    handleScale = e => {
        const scale = parseFloat(e.target.value)
        const currentState = Object.assign({}, this.state.postData);
        currentState.image.scale = scale;
        this.setState({ postData: currentState });
    }

    handleAllowZoomOut = ({ target: { checked: allowZoomOut } }) => {
        const currentState = Object.assign({}, this.state.postData);
        currentState.image.allowZoomOut = allowZoomOut;
        this.setState({ postData: currentState });
    }


    buttonDisable = () => {
        if (this.state.postData.title == "") {
            return true;
        } else return false;
    }

    onTitleChange(event) {
        let currentState = Object.assign({}, this.state.postData);
        currentState.title = event.target.value;
        this.setState({
            postData: currentState
        });
    }

    onInputChange(md) {
        let currentState = Object.assign({}, this.state.postData);
        currentState.text = md;
        this.setState({
            postData: currentState
        });
    }

    async savePost() {
        var that = this;
        var now = new Date();
        now = now.toLocaleDateString() + ' ' + now.toLocaleTimeString();
        let cloudinaryImage = await this.sendToCloudinary();
        var data = {
            title: this.state.postData.title,
            author: this.props.accounts[0].username,
            date: now,
            text: this.state.postData.text,
            selectedTags: this.state.postData.selectedTags,
            type: this.state.postData.type,
        };
        if (cloudinaryImage.public_id && cloudinaryImage.url) {
            data.image = {
                public_id: cloudinaryImage.public_id,
                url: cloudinaryImage.url,
                scale: this.state.postData.image.scale
            };
        }
        let id;
        if (this.state.query) {
            id = this.state.query[0];
        }

        let response = await SavePost(data, this.props.match.params.type, this.state.savedPost, id);
        console.log(response);
        // window.location.reload('/create/announcement');
    }

    async sendToFB() {
        var that = this;
        var now = new Date();
        now = now.toLocaleDateString() + ' ' + now.toLocaleTimeString();
        //public_id of image
        let cloudinaryImage = await this.sendToCloudinary("publish");
        var data = {
            title: this.state.postData.title,
            author: this.props.accounts[0].username,
            date: now,
            text: this.state.postData.text,
            selectedTags: this.state.postData.selectedTags,
            type: this.state.postData.type
        };
        if (cloudinaryImage.public_id && cloudinaryImage.url) {
            data.image = {
                public_id: cloudinaryImage.public_id,
                url: cloudinaryImage.url,
                scale: this.state.postData.image.scale
            };
        }
        if (this.state.query) {
            if (this.state.editPost) {
                let response = await SubmitPost(data, this.props.match.params.type, this.state.query[0], true);
                console.log(response);
            } else if (this.state.savedPost) {
                let response = await SubmitPost(data, this.props.match.params.type, this.state.query[0]);
                console.log(response);
            } else console.error("Incorrect URL parameters.");
        } else {
            let response = await SubmitPost(data, this.props.match.params.type);
            console.log(response);
        }
        // window.location.reload();
    }


    sendToCloudinary(type) {
        if (this.state.postData.image.url) {
            if (typeof this.state.postData.image.url == "object") {
                return CloudinaryUpload(this.state.postData.image.url).then(response => {
                    if (this.state.changeImage) {
                        CloudinaryDelete(this.state.postData.image.public_id).then(resp => {
                            console.log(resp);
                        }).catch(err => {
                            console.error(err);
                        });
                    }
                    return response;
                }).catch(error => {
                    console.error(error);
                });
            } else {
                return this.state.postData.image;
            }
        } else {
            return this.state.postData.image;
        }
    }

    render() {
        var loggedIn = IsLoggedIn(this.props.accounts);
        var isAdmin = this.props.access;
        if (loggedIn && isAdmin) {
            return (
                <div className="row col-lg-12">
                    <br />
                    <br />
                    <br />
                    <br />
                    <br />
                    <br />
                    <br />
                    <br />
                    <div className="col-lg-6 col-sm-12"><h1 style={markdownStyle.title}>Create a new {this.state.path}</h1>
                        <input style={markdownStyle.inputTitle} className="form-control" type="text" placeholder="Title..." value={this.state.postData.title} onChange={this.onTitleChange} />
                        <div style={markdownStyle.md}>
                            <Editor onChange={this.onInputChange} value={this.state.postData.text} />
                            <div style={markdownStyle.tags} className="col-lg-12">
                                <Dropdown
                                    options={this.state.tags}
                                    placeholder='Add a tag...'
                                    search
                                    selection
                                    fluid
                                    multiple
                                    allowAdditions
                                    defaultValue={this.state.postData.selectedTags}
                                    onAddItem={this.handleAddition}
                                    onChange={this.handleTags}
                                />
                                <div style={{ color: 'white', marginTop: 5 }}>
                                    <input type='file' accept=".jpg, .jpeg, .png" onChange={this.handleNewImage} />
                                    <br />
                                    {'Scaling Mode: '}
                                    <input
                                        style={{ color: 'black' }}
                                        name='allowZoomOut'
                                        type='checkbox'
                                        onChange={this.handleAllowZoomOut}
                                        checked={this.state.postData.image.allowZoomOut} />
                                    <br /><br />
                                    Zoom:
                                    <input
                                        name='scale'
                                        type='range'
                                        onChange={this.handleScale}
                                        min={this.state.postData.image.allowZoomOut ? '0.1' : '1'}
                                        max='2'
                                        step='0.01'
                                        defaultValue={this.state.postData.image.scale} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-6 col-sm-12"><h1 style={markdownStyle.title}>Preview post</h1></div>
                    <div className="col-lg-6 col-sm-12" style={markdownStyle.post}>
                        <ArticleCard edit={true} postData={this.state.postData} uploaded={this.state.uploaded} />
                    </div>
                    <div className="row col-lg-12">
                        <div style={markdownStyle.button} className="col-lg-6">
                            {!this.state.editPost ? <button className="btn btn-info" disabled={this.buttonDisable()} onClick={this.savePost}>Save Draft!</button> : null}
                            <button className="btn btn-success" disabled={this.buttonDisable()} onClick={this.sendToFB}>Publish Post!</button>
                        </div>
                    </div>
                </div>
            );
        } else return null;
    }
}

function mapStateToProps(state, ownProps) {
    return {
        accounts: state.accounts,
        access: state.access
        //this means i would like to access by this.props.accounts
        // the data within the state of our store named by root reducer
        // ownProps are the props of our component CoursesPage
    };
}

export default connect(mapStateToProps, null)(ArticlePost)

var markdownStyle = {
    title: {
        width: '100%',
        marginTop: '20px'
    },
    inputTitle: {
        padding: '20px 15px',
        fontSize: '1em'
    },
    md: {
        display: 'inline-block',
        width: '100%'
    },
    post: {
        marginTop: 15,
        color: 'black',
    },
    tags: {
        marginLeft: 0,
        marginTop: 15,
        padding: 0
    },
    button: {
        marginLeft: 0,
        marginTop: 15,
        display: 'flex',
        justifyContent: 'flex-end'
    }
};