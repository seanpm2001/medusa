import { ModuleRegistrationName } from "@medusajs/modules-sdk"
import { IRegionModuleService } from "@medusajs/types"
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

describe("GET /admin/regions/:id", () => {
  let dbConnection
  let appContainer
  let shutdownServer
  let regionModuleService: IRegionModuleService

  beforeAll(async () => {
    const cwd = path.resolve(path.join(__dirname, "..", "..", ".."))
    dbConnection = await initDb({ cwd, env } as any)
    shutdownServer = await startBootstrapApp({ cwd, env })
    appContainer = getContainer()
    regionModuleService = appContainer.resolve(ModuleRegistrationName.REGION)
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

  it("should get a region", async () => {
    const [region] = await regionModuleService.create([
      {
        name: "Test",
        currency_code: "usd",
      },
    ])

    const api = useApi() as any
    const response = await api.get(`/admin/regions/${region.id}`, adminHeaders)

    expect(response.status).toEqual(200)
    expect(response.data.region).toEqual(
      expect.objectContaining({
        id: region.id,
        name: "Test",
        currency_code: "usd",
      })
    )
  })
})
