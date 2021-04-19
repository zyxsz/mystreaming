/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route');

/* No authenticated routes */
Route.group(() => {
  Route.get('/api/v1/auth/redirect', 'AuthController.redirect');
  Route.post('/api/v1/auth/callback', 'AuthController.callback');

  // Route.get('/api/v1/videos/:id/:file', 'VideoController.watch');
  Route.get('/api/v1/preview/:part/:id', 'VideoController.thumbnailPreview');
  Route.get('/api/v1/thumbnails/:id', 'VideoController.thumbnail');
  Route.get('/api/v1/videos/:id/:file', 'VideoController.watch');
  Route.get('/api/v1/titles/trailer/:id/:file', 'TitleController.watchTrailer');
  Route.get('/api/v1/subtitles/:video_id/:id', 'VideoController.subtitle');
});

/* Authenticated routes */
Route.group(() => {
  Route.get('/api/v1/auth/@me', 'AuthController.me');
  Route.get('/api/v1/auth/@me/servers', 'AuthController.meServers');

  Route.get('/api/v1/home', 'TitleController.home');
  Route.get('/api/v1/titles/:id/watch', 'TitleController.watch');
  Route.resource('/api/v1/titles', 'TitleController');
  Route.resource('/api/v1/videos', 'VideoController');
  Route.resource('/api/v1/progress', 'ProgressController');

  Route.post('/api/v1/subtitles/:video_id', 'VideoController.storeSubtitle');
}).middleware(['auth']);
