import express, { response } from 'express';
import routes from './routes';

const app = express();

app.use(express.json()); //Por padrão o express não entende que fazemos API Rest, usar este comando.
app.use(routes);

app.listen(3333);