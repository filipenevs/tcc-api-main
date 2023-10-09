import { NextFunction, Request, Response } from 'express'

import Controller from '../decorators/Controller'
import { Get, Post, Put } from '../decorators/handlerDecorator'
import ContractService from '../services/contractService'

@Controller('/contracts')
class ContractController {
  @Post('/send')
  public async sendNewContract(req: Request, res: Response, next: NextFunction) {
    try {
      const { value, date, description, houseId, providerId, workHours } = req.body

      const contractModel = {
        value: value,
        startDate: date,
        description: description,
        contractorId: res.locals.userId,
        houseId: houseId,
        providerId: providerId,
        accepted: null,
        workHours: workHours,
      }

      await ContractService.sendNewContract(contractModel)

      res.status(201).send()
    } catch (error) {
      next(error)
    }
  }

  @Get('/')
  public async getAllContractsByUser(_: Request, res: Response, next: NextFunction) {
    try {
      const contracts = await ContractService.getContractsByUser(res.locals.userId)

      res.send(contracts)
    } catch (error) {
      next(error)
    }
  }

  @Put('/:id/:status')
  public async updateContractStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id, status } = req.params

      const contracts = await ContractService.updateContractStatus(id, !!status)

      res.status(200).send(contracts)
    } catch (error) {
      next(error)
    }
  }

  @Get('/:idContractor')
  public async getAllContractsByContractor(_: Request, res: Response, next: NextFunction) {
    try {
      const contratos = await ContractService.getAllContractsByContractor(res.locals.contractId)

      res.status(200).send(contratos)
    } catch (erro) {
      next(erro)
    }
  }
}

export default ContractController
