import { NextFunction, Request, Response } from 'express'
import bcrypt from 'bcryptjs'

import Controller from '../decorators/controllerDecorator'
import { AuthContext, Post, Put } from '../decorators/handlerDecorator'
import UserService from '../services/userServices'
import AddressServices from '../services/adressServices'
import ConflictDataException from '../exceptions/ConflictDataException'
import database from '../database'

@Controller('/users')
class UserController {
  @Post('/', AuthContext.Unprotected)
  public async signUp(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, cpf } = req.body

      const userCheckEmail = await UserService.findByEmail(email)
      if (userCheckEmail !== null)
        throw new ConflictDataException('Já existe um usuário cadastrado com este e-mail.')

      const userCheckCpf = await UserService.findByCpf(cpf)
      if (userCheckCpf !== null)
        throw new ConflictDataException('Já existe um usuário cadastrado com este CPF.')

      const { neighborhoodId, addressDescription, addressNumber } = req.body

      const userAddress = await AddressServices.storeAddress({
        description: addressDescription,
        neighborhoodId,
        number: addressNumber,
      })

      const { name, surname, password, birthDate, gender } = req.body

      const salt = bcrypt.genSaltSync(12)
      const hashPassword = bcrypt.hashSync(password, salt)

      const newUser = await UserService.storeUser({
        name,
        surname,
        email,
        cpf,
        password: hashPassword,
        birthDate,
        gender: gender[0],
        addressId: userAddress.id,
      })

      const userWithoutPassword = {
        ...newUser,
        password: null,
      }

      res.status(201).send({ userWithoutPassword })
    } catch (error) {
      next(error)
    }
  }

  @Put('/preferences')
  public async savePreferences(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = res.locals
      const { animals, maximumMetersBuilt, neighborhoods } = req.body

      const mappedNeighborhoods = neighborhoods.map((neighborhood: string) => ({
        neighborhoodId: neighborhood,
      }))

      const preferences = await database.providerPreferences.create({
        data: {
          userId,
          animals,
          maximumMetersBuilt,
          neighborhoods: {
            createMany: {
              data: mappedNeighborhoods,
            },
          },
        },
      })

      res.status(201).send(preferences)
    } catch (error) {
      next(error)
    }
  }
}

export default UserController
