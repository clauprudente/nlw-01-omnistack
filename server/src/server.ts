import express, { response } from 'express';
import routes from './routes';
import path from 'path';

const app = express();

app.use(express.json()); //Por padrão o express não entende que fazemos API Rest, usar este comando.
app.use(routes);

app.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads')));

app.listen(3333);