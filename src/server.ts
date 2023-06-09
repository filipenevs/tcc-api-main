import express, { Express } from 'express'

import getRoutes from './routes'
import LoggerMiddleware from './middlewares/loggerMiddleware'
import ErrorHandlerMiddleware from './middlewares/errorHandlerMiddleware'
import log, { LogType } from './utils/log'

class Server {
  private app: Express
  private port: number

  constructor(port: number) {
    this.app = express()
    this.port = port

    this.configure()
    this.registerLogger()
    this.registerRoutes()
    this.registerErrorHandler()
  }

  private configure() {
    this.app.use(express.json())
    this.app.use(express.urlencoded({ extended: true }))
  }

  private registerLogger() {
    this.app.use(LoggerMiddleware.handler)
  }

  private registerErrorHandler() {
    this.app.use(ErrorHandlerMiddleware.handler)
  }

  private registerRoutes() {
    const routes = getRoutes()
    routes.forEach((route) => {
      this.app.use(route)
    })
  }

  public start() {
    this.app.listen(this.port, () => {
      log(LogType.SUCCESS, 'START', `Listening sever on port ${this.port}`)
    })
  }
}

export default Server
