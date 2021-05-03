const express = require('express');
const { v4 } = require('uuid');
const app = express();

app.use(express.json());

const user = [];

/**
 * Middleware
 * @param {*} request 
 * @param {*} response 
 * @param {*} next 
 */
function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const account = user.find(user => user.username === username);

  if(!account) {
    return response.status(400).json({ error: ' username not found !' })
  }

  request.account = account;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const verifyUserNameInUse = user.some(user => user.username === username);
  
  if(verifyUserNameInUse) {
    return response.status(400).json({ error: "Username already in use!" })
  }

  const id = v4();

  user.push({
    id,
    name,
    username,
    todos: []
  });

  return response.status(201).json(user);

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { account } = request;

  return response.json(account.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { account } = request;  

  const id = v4();

  const list = {
  id,
	title,
	done: false, 
	deadline: new Date(deadline),
	created_at: new Date(),
  }

  account.todos.push(list);

  return response.status(201).json(account);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  
   const { id } = request.params;   
   const { title, deadline } = request.body;

 
   const todoId = user.findIndex(t => t.todos[0].id === id);
   
   if(todoId < 0) {
     return response.status(400).json( { message: ' Todo does not exist !' } );
   }   
   
  user.map(t => {t.todos[0].title = title,
                 t.todos[0].deadline = new Date(deadline)});
  

  return response.status(201).json(user);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { done } = request.body;
 
  const todoId = user.findIndex(t => t.todos[0].id === id);
   
  if(todoId < 0) {
    return response.status(400).json( { message: ' Todo does not exist !' } );
  }  
  
  user.map(t => t.todos[0].done = done)

  return response.status(201).json(user);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const todoId = user.findIndex(t => t.todos[0].id === id);
   
  if(todoId < 0) {
    return response.status(400).json( { message: ' Todo does not exist !' } );
  }  
  
  user.map(t => t.todos.pop())

  return response.status(200).json(user);
});

module.exports = app;