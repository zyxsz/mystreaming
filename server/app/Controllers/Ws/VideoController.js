'use strict'

class VideoController {
  constructor ({ socket, request }) {
    this.socket = socket
    this.request = request
  }
}

module.exports = VideoController
