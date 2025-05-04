#React-from-scratch


What are the 3 fundamental things that power React on the web?
1. React
2. React-dom
3. React scheduler (enables concurrent mode)


## React
Contains all of the hooks / fiber i.e. useState
`createElement`
## React-dom
mount to an entry
`performUnitOfWork` -> `runWithFiberInDev` -> `renderWithHooks` -> `callComponentInDEV(Component, props, secondArg)`

## React scheduler
enables concurrent mode
`performWorkUntilDeadline`