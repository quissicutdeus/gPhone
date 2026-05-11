import { ClientApp } from '../lib/ClientApp';

const app = new ClientApp('photos');

app.registerCallback('getPhotos', 'gphone:server:photos:get');
app.registerCallback('createPhoto', 'gphone:server:photos:create');
app.registerCallback('updatePhoto', 'gphone:server:photos:update');
app.registerCallback('deletePhoto', 'gphone:server:photos:delete');
