import { ModuleRegistrationName } from "@medusajs/modules-sdk"
import { ICustomerModuleService } from "@medusajs/types"
import path from "path"
import { startBootstrapApp } from "../../../../environment-helpers/bootstrap-app"
import { useApi } from "../../../../environment-helpers/use-api"
import { getContainer } from "../../../../environment-helpers/use-container"
import { initDb, useDb } from "../../../../environment-helpers/use-db"
import adminSeeder from "../../../../helpers/admin-seeder"

jest.setTimeout(50000)

const env = { MEDUSA_FF_MEDUSA_V2: true }
const adminHeaders = {
  headers: { "x-medusa-access-token": "test_token" },
}

describe("DELETE /admin/customers/:id", () => {
  let dbConnection
  let appContainer
  let shutdownServer
  let customerModuleService: ICustomerModuleService

  beforeAll(async () => {
    const cwd = path.resolve(path.join(__dirname, "..", "..", ".."))
    dbConnection = await initDb({ cwd, env } as any)
    shutdownServer = await startBootstrapApp({ cwd, env })
    appContainer = getContainer()
    customerModuleService = appContainer.resolve(
      ModuleRegistrationName.CUSTOMER
    )
  })

  afterAll(async () => {
    const db = useDb()
    await db.shutdown()
    await shutdownServer()
  })

  beforeEach(async () => {
    await adminSeeder(dbConnection)
  })

  afterEach(async () => {
    const db = useDb()
    await db.teardown()
  })

  it("should delete a customer", async () => {
    const customer = await customerModuleService.create({
      first_name: "John",
      last_name: "Doe",
    })

    const api = useApi() as any
    const response = await api.delete(
      `/admin/customers/${customer.id}`,
      adminHeaders
    )

    expect(response.status).toEqual(200)

    const deletedCustomer = await customerModuleService.retrieve(customer.id, {
      withDeleted: true,
    })
    expect(deletedCustomer.deleted_at).toBeTruthy()
  })
})
