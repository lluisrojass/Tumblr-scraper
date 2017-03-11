'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import { Config } from './config';
import { Analytics } from './analytics';
import { Post }  from './post';

const archive = require('../archive');
const getPostData = require('../userPost');

//TODO: implement analytics
//TODO: implement current post viewer
//TODO: handle post error
//TODO: implement errors and end
//TODO: request not aborting on abort call
//TODO: implement queue for bad dates, possibly nest date header above posts.
//TODO: remove [[MORE]] on text (possibly others) posts.

String.prototype.dateShorten = function(){
  return this.replace(/(\w|-|:)*/,function(txt) {
      return txt.substr(0,txt.indexOf('T'));
  });
}
String.prototype.bodyShorten = function(){
  var CharIndex = this[19] === ' ' ? 18: 19;
  return (this.length > 196) ? this.substr(0,this.charAt(193) === ' ' ? 192 : 193) + '...' : this.toString();
}
String.prototype.headlineShorten = function(){
  return (this.length >= 26) ? this.substr(0,this.charAt(23) === ' ' ? 22: 23) + '...' : this.toString();
}
String.prototype.capitalizeEach = function(){
    return this.replace(/\w\S*/g, function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}
function exactMatch(r,str){
  const match = str.match(r);
  return match != null && str == match[0];
}





class Application extends React.Component {

  constructor(props){
    super(props);
    this.archive = new archive();
    this.state = {
      removeClickedPost:null,
      running:false,
      scrapedPosts:[],
      isViewing:false,
      currentPost:{
        type: null,
        datePublished: '',
        articleBody: '',
        headline: '',
        images: [],
        url: ''
      }
    }
    this.archive.on('nextPage',(path) => {    });
    this.archive.on('post', postInfo => {
      getPostData(postInfo, (err, data) => {
        if (err !== null){
          console.warn('Terminal','Error fetching Post Data');

          return;
        }

        let {datePublished=null, articleBody=null, headline=null,
        image, url=''} = data.postData;

        this.state.scrapedPosts.push({
          type: data.type,
          datePublished: datePublished,
          articleBody: articleBody,
          headline: headline,
          images: image ? image['@list'] || [image] : [],
          url: url
        });
        this.setStateKeepScroll();
      });
    });

    this.archive.on('date',dateString => { });


    this.archive.on('abort',() => console.log('Abort event caught inside application.js'));
    this.archive.on('requestError',(urlInfo) => {
      console.log('Terminal','Request Error');
    });
    this.archive.on('responseError',(urlInfo) => {
      this.stopRunning();
      console.log('Terminal','Response Error')
    });
    this.archive.on('end',() =>{    });
  }

  startRunning = (blogname, types) => {
    if (!types.length){
      console.warn('Terminal:', 'No types selected');
      return;
    }
    if (!(exactMatch(/([0-9]|[a-z]|[A-Z])+(\-*([0-9]|[a-z]|[A-Z]))*/, blogname))){
      console.warn('Terminal', blogname+' is invalid Blogname');
      return;
    }
    this.archive.stop();
    this.setState( { scrapedPosts : [], running:true } );
    this.archive.go(blogname, types);
  }

  handlePostClicked = (unClickCB, data) => {
    delete data['onClick'];
    if (this.state.removeClickedPost) this.state.removeClickedPost();
    this.setState({
      removeClickedPost:unClickCB,
      currentPost:data,
      isViewing:true
    });
    return true;
  }

  stopRunning = () => {
    if (!this.archive.stop()){
      console.log('error stopping, check loop.js');
    }
    this.setState({running: false});
  }
  setStateKeepScroll = () => {
    const m = document.getElementById('scroll-box'),
    keepBottom = m.scrollTop+1 >= m.scrollHeight - m.clientHeight;
    this.setState(this.state);
    if (keepBottom) m.scrollTop = m.scrollHeight - m.clientHeight;
  }
  render(){
    return(
      <div id='wrapper'>

        <div id='left-panel-wrapper'>
         <div id='left-panel'>
           <div id='title-wrapper'>
             <h1 className='vertical-center-contents'>Config</h1>
           </div>
           <div id='config-wrapper'>
              <Config startRunning={this.startRunning} isRunning={this.state.running}
              stopRunning={this.stopRunning} />
           </div>
           <Analytics />
         </div>
       </div>

       <div id='mid-panel-wrapper'>
         <div id='middle-panel'>
         <div className='scroll-box' id='scroll-box' >
           {this.state.scrapedPosts.map((scrapedPost, index) =>
             <Post onClick={this.handlePostClicked} key={index} {...scrapedPost} />
           )}
         </div>
        </div>
      </div>

      <div id='right-panel-wrapper'>
        <div id='right-panel'>
          <h1 className='viewer-header'>Title:</h1>
          <h1 className='viewer-text'>{this.state.currentPost.headline ? this.state.currentPost.headline.headlineShorten() : 'None'}</h1>
          <br/>
          <h1 className='viewer-header'>Date:</h1>
          <h1 className='viewer-text'>{this.state.currentPost.datePublished ? this.state.currentPost.datePublished :'No Date'}</h1>
          <br/>
          <h1 className='viewer-header'>Body:</h1>
          <p className='viewer-text'>{this.state.currentPost.articleBody ? this.state.currentPost.articleBody :'None'}</p>
          <br/>
          <h1 className='viewer-header'>Media:</h1><br/>
          {this.state.currentPost.images.map((imageUrl) => <img className='viewer-image' src={imageUrl} />)}
          <a href={this.state.currentPost.url}>open in browser</a>
        </div>
      </div>

    </div>
    )
  }
}


ReactDOM.render(<Application />,document.getElementById('app-container'));
