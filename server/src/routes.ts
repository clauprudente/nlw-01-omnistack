import express, { response } from 'express';

const routes = express.Router();

routes.get('/', (req, res) => {
    return response.json({message: 'Hello World :)'});
});

export default routes;