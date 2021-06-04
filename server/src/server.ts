import express from 'express';

const app = express();

app.get('/users', (request, response) => {
    console.log('Listagem de usuário');
    // JSON
    response.json([
        'Diego',
        'Cláudia',
        'Kelly',
        'Daniel',
        'Heloisa'
    ]);
})

app.listen(3333);