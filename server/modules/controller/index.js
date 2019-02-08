const getPostData = require('../post');
const log = require('electron-log');
const { pipeEmit, removeMORE } = require('./utils');

const actionHandlers = loop => socket => {
  log.info(`socket connected with id ${socket.id}`);
  socket.on('start', (blog, types, ack) => {
    loop.go(blog, types, ack);
  });
  socket.on('pause', ack => {
    loop.pause(ack);
  });
  socket.on('resume', ack => {
    loop.resume(ack);
  })
}

const craftPost = rawPost => ({
  type: rawPost.type,
  datePublished: rawPost.datePublished || '',
  articleBody: !!rawPost.articleBody ? removeMORE(post.articleBody) : '',
  headline: rawPost.headline || '',
  images: [].concat(!rawPost.image ? null : rawPost.image['@list'] || rawPost.image),
  url: rawPost.url || '',
  isVideo: rawPost.isVideo,
  videoURL: post.videoURL || ''
});

module.exports = (server, loop) => {
  /* attach client action handlers */
  server.on('connection', actionHandlers(loop));
  /* attach server emitters */
  pipeEmit(['page', 'date', 'end', 'error'], loop, server);
  loop.on('post', postRequestData => {
    getPostData(postRequestData, (error, rawPost) => {
      if (error) {
        log.warn(error.message);
        return;
      }
      server.emit('post', craftPost(rawPost));
    })
  });
}