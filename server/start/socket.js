const Ws = use('Ws');

Ws.channel('videos', 'VideoController').middleware(['auth']);
