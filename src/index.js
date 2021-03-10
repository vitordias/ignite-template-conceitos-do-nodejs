const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];


function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  
  const user = users.find(
    (user) => user.username === username
  );

  if(!user){
    return response.status(404).json({ error: "Usuário Inválido"});
  }

  request.user = user;

  return next();
}

function checksExistsUserTodo(request, response, next) {
  const user   = request.user;
  const { id } = request.params;
  
  const todo = user.todos.find(
    (todo) => todo.id === id
  );
  
  if(!todo){
    return response.status(404).json({ error: "Tarefa Inválida"});
  }

  request.todo = todo;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username  } = request.body;
  const id = uuidv4();

  //Valida o username
  const validaUsername = users.some(
    (user) => user.username === username
  );

  if(validaUsername){
    return response.status(400).json({error : "Usuário existente"});
  }

  const user = {
    name,
    username,
    id,
    todos: []
  }

  users.push(user);

  return response.status(200).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const todos = request.user.todos;
  return response.status(200).json(todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
    
    const user = request.user;
    const { title, deadline } = request.body;

    if(title && deadline){

      const todo = {
        id: uuidv4(),
        title,
        done: false, 
        deadline: new Date(deadline), 
        created_at: new Date()
      };

      user.todos.push(todo);

      return response.status(201).json(todo);


    }else{
      return response.status(400).json({"Error":"Informações incompletas"})
    }
    
});

app.put('/todos/:id', checksExistsUserAccount, checksExistsUserTodo, (request, response) => {
  const todo = request.todo;
  const { title, deadline } = request.body;

  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.status(200).json(todo);
  
});

app.patch('/todos/:id/done', checksExistsUserAccount, checksExistsUserTodo, (request, response) => {
  const todo = request.todo;
  todo.done = true;

  return response.status(200).json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, checksExistsUserTodo, (request, response) => {
  const user = request.user;
  const todo = request.todo;
  const todoindex = user.todos.findIndex(element => element === todo);
  user.todos.splice(todoindex, 1);
  return response.status(204).json(user.todos);
});

module.exports = app;